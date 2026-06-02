// =============================================================================
// ORKESTRANDO - Realtime Chat Service
// Socket.io-based chat microservice with PostgreSQL persistence
// =============================================================================

import { Server } from 'socket.io'
import { createServer } from 'http'
import { PrismaClient } from '@prisma/client'
import jwt from 'jsonwebtoken'
import cors from 'cors'
import { v4 as uuidv4 } from 'uuid'
import dotenv from 'dotenv'
import path from 'path'

// Load environment variables from project root
dotenv.config({ path: path.resolve(__dirname, '../../.env') })

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface AuthenticatedSocket extends ReturnType<Server['sockets']['connection']> {
  userId?: string
  profileId?: string
  orgId?: string
  role?: string
}

interface TypingUser {
  profileId: string
  displayName: string
  timestamp: number
}

// ---------------------------------------------------------------------------
// Prisma Client (singleton)
// ---------------------------------------------------------------------------

const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
})

// ---------------------------------------------------------------------------
// JWT Secret
// ---------------------------------------------------------------------------

const JWT_SECRET = process.env.JWT_SECRET || 'orkestrando-chat-service-secret-key-change-me'

const CHAT_PORT = parseInt(process.env.CHAT_PORT || '3003', 10)
const CORS_ORIGIN = process.env.CORS_ORIGIN || '*'

// ---------------------------------------------------------------------------
// Online users tracking
// ---------------------------------------------------------------------------

const onlineUsers = new Map<string, {
  profileId: string
  orgId: string
  role: string
  displayName: string
  socketIds: Set<string>
  joinedRooms: Set<string>
}>()

// Typing indicators per room
const typingUsers = new Map<string, Map<string, TypingUser>>()

// ---------------------------------------------------------------------------
// Helper Functions
// ---------------------------------------------------------------------------

function verifyToken(token: string): { sub: string; profileId: string; orgId: string; role: string; email: string } | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any
    return {
      sub: decoded.sub || decoded.userId,
      profileId: decoded.profileId,
      orgId: decoded.orgId,
      role: decoded.role,
      email: decoded.email,
    }
  } catch {
    return null
  }
}

function getTypingTimeout(): number {
  return 3000 // 3 seconds
}

function cleanTypingUsers(roomId: string) {
  const roomTyping = typingUsers.get(roomId)
  if (!roomTyping) return

  const now = Date.now()
  for (const [profileId, user] of roomTyping) {
    if (now - user.timestamp > getTypingTimeout()) {
      roomTyping.delete(profileId)
    }
  }
  if (roomTyping.size === 0) {
    typingUsers.delete(roomId)
  }
}

function getRoomParticipants(orgId: string, conversationId: string): string[] {
  const profileIds: string[] = []
  for (const [profileId, user] of onlineUsers) {
    if (user.orgId === orgId && user.joinedRooms.has(conversationId)) {
      profileIds.push(profileId)
    }
  }
  return profileIds
}

function getOrgOnlineCount(orgId: string): number {
  let count = 0
  for (const [, user] of onlineUsers) {
    if (user.orgId === orgId) count++
  }
  return count
}

// ---------------------------------------------------------------------------
// Create HTTP & Socket.io Server
// ---------------------------------------------------------------------------

const httpServer = createServer((req, res) => {
  // Health check endpoint
  if (req.url === '/health' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({
      status: 'ok',
      service: 'orkestrando-chat-service',
      uptime: process.uptime(),
      onlineUsers: onlineUsers.size,
      timestamp: new Date().toISOString(),
    }))
    return
  }

  res.writeHead(404)
  res.end('Not Found')
})

const io = new Server(httpServer, {
  // Path used by Caddy to forward requests to the correct port
  path: '/',
  cors: {
    origin: CORS_ORIGIN,
    methods: ['GET', 'POST'],
    credentials: true,
  },
  pingTimeout: 60000,
  pingInterval: 25000,
  connectionStateRecovery: {
    maxDisconnectionDuration: 2 * 60 * 1000, // 2 minutes
    skipMiddlewares: true,
  },
})

// ---------------------------------------------------------------------------
// Authentication Middleware
// ---------------------------------------------------------------------------

io.use((socket, next) => {
  const token = socket.handshake.auth?.token || socket.handshake.headers?.authorization?.replace('Bearer ', '')

  if (!token) {
    return next(new Error('Authentication required'))
  }

  const payload = verifyToken(token)
  if (!payload) {
    return next(new Error('Invalid or expired token'))
  }

  ;(socket as AuthenticatedSocket).userId = payload.sub
  ;(socket as AuthenticatedSocket).profileId = payload.profileId
  ;(socket as AuthenticatedSocket).orgId = payload.orgId
  ;(socket as AuthenticatedSocket).role = payload.role

  next()
})

// ---------------------------------------------------------------------------
// Connection Handler
// ---------------------------------------------------------------------------

io.on('connection', (socket: AuthenticatedSocket) => {
  const profileId = socket.profileId!
  const orgId = socket.orgId!
  const role = socket.role!
  const socketId = socket.id

  console.log(`[CONNECT] profile=${profileId} role=${role} org=${orgId} socket=${socketId}`)

  // Track user in online users map
  const existingUser = onlineUsers.get(profileId)
  if (existingUser && existingUser.orgId === orgId) {
    existingUser.socketIds.add(socketId)
  } else {
    onlineUsers.set(profileId, {
      profileId,
      orgId,
      role,
      displayName: profileId, // Will be updated from profile lookup
      socketIds: new Set([socketId]),
      joinedRooms: new Set(),
    })
  }

  // Fetch user display name asynchronously
  prisma.profile.findUnique({ where: { id: profileId }, select: { firstName: true, lastName: true } })
    .then((profile) => {
      if (profile) {
        const user = onlineUsers.get(profileId)
        if (user) {
          user.displayName = `${profile.firstName} ${profile.lastName}`
        }
      }
    })
    .catch(() => { /* ignore */ })

  // Join the user to their personal room
  socket.join(`user:${profileId}`)

  // Notify the organization that this user is online
  socket.to(`org:${orgId}`).emit('user:online', {
    profileId,
    orgId,
    role,
    onlineCount: getOrgOnlineCount(orgId),
    timestamp: new Date().toISOString(),
  })

  // Send current online count to the user
  socket.emit('online:count', {
    orgId,
    count: getOrgOnlineCount(orgId),
    timestamp: new Date().toISOString(),
  })

  // -----------------------------------------------------------------------
  // Event: 'conversation:join'
  // Join a conversation room to receive realtime messages
  // -----------------------------------------------------------------------
  socket.on('conversation:join', async (data: { conversationId: string }) => {
    const { conversationId } = data

    if (!conversationId) {
      socket.emit('error', { message: 'conversationId is required' })
      return
    }

    try {
      // Verify user is a participant of the conversation
      const participant = await prisma.conversationParticipant.findUnique({
        where: {
          conversationId_profileId: {
            conversationId,
            profileId,
          },
        },
      })

      if (!participant) {
        socket.emit('error', { message: 'Not a participant of this conversation' })
        return
      }

      // Join the Socket.io room
      const roomName = `conversation:${conversationId}`
      socket.join(roomName)

      // Track joined room
      const user = onlineUsers.get(profileId)
      if (user) {
        user.joinedRooms.add(conversationId)
      }

      console.log(`[JOIN] profile=${profileId} conversation=${conversationId}`)

      // Update last read timestamp
      await prisma.conversationParticipant.update({
        where: { id: participant.id },
        data: { lastReadAt: new Date() },
      })

      // Notify others in the room
      socket.to(roomName).emit('conversation:user_joined', {
        profileId,
        conversationId,
        timestamp: new Date().toISOString(),
      })

      // Send unread message count
      const unreadCount = await prisma.message.count({
        where: {
          conversationId,
          createdAt: { gt: participant.lastReadAt || new Date(0) },
          senderId: { not: profileId },
        },
      })

      socket.emit('conversation:unread', {
        conversationId,
        unreadCount,
      })

      // Send recent messages (last 50)
      const recentMessages = await prisma.message.findMany({
        where: { conversationId },
        include: {
          sender: { select: { id: true, firstName: true, lastName: true, avatar: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: 50,
      })

      socket.emit('conversation:history', {
        conversationId,
        messages: recentMessages.reverse().map((msg) => ({
          id: msg.id,
          conversationId: msg.conversationId,
          senderId: msg.senderId,
          senderName: msg.sender ? `${msg.sender.firstName} ${msg.sender.lastName}` : 'Unknown',
          senderAvatar: msg.sender?.avatar,
          content: msg.content,
          parentId: msg.parentId,
          createdAt: msg.createdAt,
        })),
      })
    } catch (error) {
      console.error(`[ERROR] conversation:join:`, error)
      socket.emit('error', { message: 'Failed to join conversation' })
    }
  })

  // -----------------------------------------------------------------------
  // Event: 'conversation:leave'
  // Leave a conversation room
  // -----------------------------------------------------------------------
  socket.on('conversation:leave', (data: { conversationId: string }) => {
    const { conversationId } = data
    const roomName = `conversation:${conversationId}`

    socket.leave(roomName)

    const user = onlineUsers.get(profileId)
    if (user) {
      user.joinedRooms.delete(conversationId)
    }

    socket.to(roomName).emit('conversation:user_left', {
      profileId,
      conversationId,
      timestamp: new Date().toISOString(),
    })

    console.log(`[LEAVE] profile=${profileId} conversation=${conversationId}`)
  })

  // -----------------------------------------------------------------------
  // Event: 'message:new'
  // Send a new message to a conversation
  // -----------------------------------------------------------------------
  socket.on('message:new', async (data: { conversationId: string; content: string; parentId?: string }) => {
    const { conversationId, content, parentId } = data

    if (!conversationId || !content || !content.trim()) {
      socket.emit('error', { message: 'conversationId and content are required' })
      return
    }

    if (content.length > 10000) {
      socket.emit('error', { message: 'Message too long (max 10000 characters)' })
      return
    }

    try {
      // Verify user is a participant
      const participant = await prisma.conversationParticipant.findUnique({
        where: {
          conversationId_profileId: { conversationId, profileId },
        },
      })

      if (!participant) {
        socket.emit('error', { message: 'Not a participant' })
        return
      }

      // Create the message in the database
      const message = await prisma.message.create({
        data: {
          id: uuidv4(),
          orgId,
          conversationId,
          senderId: profileId,
          content: content.trim(),
          parentId: parentId || null,
        },
        include: {
          sender: { select: { id: true, firstName: true, lastName: true, avatar: true } },
        },
      })

      // Update conversation's last message
      await prisma.conversation.update({
        where: { id: conversationId },
        data: { lastMessageAt: message.createdAt },
      })

      // Broadcast the message to all participants in the room
      const roomName = `conversation:${conversationId}`
      const messagePayload = {
        id: message.id,
        conversationId: message.conversationId,
        senderId: message.senderId,
        senderName: message.sender ? `${message.sender.firstName} ${message.sender.lastName}` : 'Unknown',
        senderAvatar: message.sender?.avatar,
        content: message.content,
        parentId: message.parentId,
        createdAt: message.createdAt,
        timestamp: message.createdAt.toISOString(),
      }

      io.to(roomName).emit('message:new', messagePayload)

      console.log(`[MSG] profile=${profileId} conversation=${conversationId} len=${content.length}`)

      // Clear typing status for this user
      const roomTyping = typingUsers.get(conversationId)
      if (roomTyping) {
        roomTyping.delete(profileId)
        socket.to(roomName).emit('typing:stop', {
          conversationId,
          profileId,
        })
      }

    } catch (error) {
      console.error(`[ERROR] message:new:`, error)
      socket.emit('error', { message: 'Failed to send message' })
    }
  })

  // -----------------------------------------------------------------------
  // Event: 'message:read'
  // Mark messages as read in a conversation
  // -----------------------------------------------------------------------
  socket.on('message:read', async (data: { conversationId: string; messageId?: string }) => {
    const { conversationId } = data

    try {
      await prisma.conversationParticipant.update({
        where: {
          conversationId_profileId: { conversationId, profileId },
        },
        data: { lastReadAt: new Date() },
      })

      // Notify sender(s) that message was read
      const roomName = `conversation:${conversationId}`
      socket.to(roomName).emit('message:read', {
        conversationId,
        profileId,
        timestamp: new Date().toISOString(),
      })

      console.log(`[READ] profile=${profileId} conversation=${conversationId}`)
    } catch (error) {
      console.error(`[ERROR] message:read:`, error)
    }
  })

  // -----------------------------------------------------------------------
  // Event: 'typing:start'
  // User started typing
  // -----------------------------------------------------------------------
  socket.on('typing:start', (data: { conversationId: string }) => {
    const { conversationId } = data
    if (!conversationId) return

    if (!typingUsers.has(conversationId)) {
      typingUsers.set(conversationId, new Map())
    }

    const roomTyping = typingUsers.get(conversationId)!
    const user = onlineUsers.get(profileId)

    roomTyping.set(profileId, {
      profileId,
      displayName: user?.displayName || profileId,
      timestamp: Date.now(),
    })

    // Notify others in the room (excluding the typer)
    const roomName = `conversation:${conversationId}`
    socket.to(roomName).emit('typing:start', {
      conversationId,
      profileId,
      displayName: user?.displayName || profileId,
    })

    // Auto-clear typing after timeout
    setTimeout(() => {
      cleanTypingUsers(conversationId)
    }, getTypingTimeout())
  })

  // -----------------------------------------------------------------------
  // Event: 'typing:stop'
  // User stopped typing
  // -----------------------------------------------------------------------
  socket.on('typing:stop', (data: { conversationId: string }) => {
    const { conversationId } = data
    if (!conversationId) return

    const roomTyping = typingUsers.get(conversationId)
    if (roomTyping) {
      roomTyping.delete(profileId)
      if (roomTyping.size === 0) {
        typingUsers.delete(conversationId)
      }
    }

    const roomName = `conversation:${conversationId}`
    socket.to(roomName).emit('typing:stop', {
      conversationId,
      profileId,
    })
  })

  // -----------------------------------------------------------------------
  // Event: 'user:status'
  // Get online users in the organization
  // -----------------------------------------------------------------------
  socket.on('user:status', () => {
    const orgOnlineUsers: Array<{
      profileId: string
      displayName: string
      role: string
      isOnline: boolean
    }> = []

    for (const [, user] of onlineUsers) {
      if (user.orgId === orgId) {
        orgOnlineUsers.push({
          profileId: user.profileId,
          displayName: user.displayName,
          role: user.role,
          isOnline: true,
        })
      }
    }

    socket.emit('user:status:list', {
      users: orgOnlineUsers,
      count: orgOnlineUsers.length,
      timestamp: new Date().toISOString(),
    })
  })

  // -----------------------------------------------------------------------
  // Event: 'disconnect'
  // Handle user disconnection
  // -----------------------------------------------------------------------
  socket.on('disconnect', (reason) => {
    console.log(`[DISCONNECT] profile=${profileId} socket=${socketId} reason=${reason}`)

    const user = onlineUsers.get(profileId)
    if (user) {
      user.socketIds.delete(socketId)

      // Remove from all joined rooms
      if (user.socketIds.size === 0) {
        onlineUsers.delete(profileId)

        // Notify organization that user went offline
        socket.to(`org:${orgId}`).emit('user:offline', {
          profileId,
          orgId,
          onlineCount: getOrgOnlineCount(orgId),
          timestamp: new Date().toISOString(),
        })

        // Clean up typing indicators
        for (const [roomId, roomTyping] of typingUsers) {
          if (roomTyping.has(profileId)) {
            roomTyping.delete(profileId)
            const roomName = `conversation:${roomId}`
            io.to(roomName).emit('typing:stop', { conversationId: roomId, profileId })
          }
        }
      }
    }
  })

  // -----------------------------------------------------------------------
  // Event: 'error'
  // -----------------------------------------------------------------------
  socket.on('error', (error) => {
    console.error(`[ERROR] profile=${profileId}:`, error)
  })
})

// ---------------------------------------------------------------------------
// Start Server
// ---------------------------------------------------------------------------

httpServer.listen(CHAT_PORT, () => {
  console.log(`
  ╔══════════════════════════════════════════════╗
  ║   ORKESTRANDO Chat Service                    ║
  ║   Port: ${CHAT_PORT}                              ║
  ║   Health: http://localhost:${CHAT_PORT}/health        ║
  ║   Environment: ${process.env.NODE_ENV || 'development'}                  ║
  ╚══════════════════════════════════════════════╝
  `)
})

// ---------------------------------------------------------------------------
// Graceful Shutdown
// ---------------------------------------------------------------------------

async function gracefulShutdown(signal: string) {
  console.log(`\n[SHUTDOWN] Received ${signal}. Shutting down gracefully...`)

  // Close Socket.io
  io.close()

  // Disconnect Prisma
  await prisma.$disconnect()

  // Close HTTP server
  httpServer.close(() => {
    console.log('[SHUTDOWN] HTTP server closed')
    process.exit(0)
  })

  // Force exit after 10 seconds
  setTimeout(() => {
    console.error('[SHUTDOWN] Forced exit after timeout')
    process.exit(1)
  }, 10000)
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'))
process.on('SIGINT', () => gracefulShutdown('SIGINT'))

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('[UNCAUGHT]', error)
  gracefulShutdown('uncaughtException')
})

process.on('unhandledRejection', (reason) => {
  console.error('[UNHANDLED REJECTION]', reason)
})
