'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { io, Socket } from 'socket.io-client'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface RealtimeUser {
  profileId: string
  displayName: string
  role: string
  isOnline: boolean
}

export interface RealtimeMessage {
  id: string
  conversationId: string
  senderId: string
  senderName: string
  senderAvatar?: string
  content: string
  parentId?: string
  createdAt: string
  timestamp?: string
}

export interface TypingIndicator {
  conversationId: string
  profileId: string
  displayName: string
}

export interface UseRealtimeOptions {
  token: string
  autoConnect?: boolean
  reconnection?: boolean
  reconnectionAttempts?: number
  reconnectionDelay?: number
}

export interface UseRealtimeReturn {
  isConnected: boolean
  onlineUsers: RealtimeUser[]
  onlineCount: number
  currentTypingUsers: TypingIndicator[]
  messages: RealtimeMessage[]

  // Actions
  joinConversation: (conversationId: string) => void
  leaveConversation: (conversationId: string) => void
  sendMessage: (conversationId: string, content: string, parentId?: string) => void
  markAsRead: (conversationId: string) => void
  startTyping: (conversationId: string) => void
  stopTyping: (conversationId: string) => void
  requestUserStatus: () => void
  disconnect: () => void
  connect: () => void
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useRealtime(options: UseRealtimeOptions): UseRealtimeReturn {
  const {
    token,
    autoConnect = true,
    reconnection = true,
    reconnectionAttempts = 10,
    reconnectionDelay = 2000,
  } = options

  const socketRef = useRef<Socket | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [onlineUsers, setOnlineUsers] = useState<RealtimeUser[]>([])
  const [onlineCount, setOnlineCount] = useState(0)
  const [currentTypingUsers, setCurrentTypingUsers] = useState<TypingIndicator[]>([])
  const [messages, setMessages] = useState<RealtimeMessage[]>([])

  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout>>()

  // Cleanup typing timeout
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current)
      }
    }
  }, [])

  // Initialize socket connection
  useEffect(() => {
    if (!token) return

    // IMPORTANT: Use XTransformPort format for Caddy proxy forwarding
    // The path '/' is required for Caddy to route to port 3003
    const socket = io('/?XTransformPort=3003', {
      transports: ['websocket', 'polling'],
      forceNew: true,
      reconnection,
      reconnectionAttempts,
      reconnectionDelay,
      timeout: 10000,
      auth: { token },
    })

    socketRef.current = socket

    // Connection events
    socket.on('connect', () => {
      console.log('[Realtime] Connected:', socket.id)
      setIsConnected(true)
    })

    socket.on('disconnect', (reason) => {
      console.log('[Realtime] Disconnected:', reason)
      setIsConnected(false)
    })

    socket.on('connect_error', (error) => {
      console.error('[Realtime] Connection error:', error.message)
      setIsConnected(false)
    })

    // Online status events
    socket.on('online:count', (data: { orgId: string; count: number; timestamp: string }) => {
      setOnlineCount(data.count)
    })

    socket.on('user:online', (data: { profileId: string; orgId: string; role: string; onlineCount: number; timestamp: string }) => {
      setOnlineCount(data.onlineCount)
    })

    socket.on('user:offline', (data: { profileId: string; orgId: string; onlineCount: number; timestamp: string }) => {
      setOnlineCount(data.onlineCount)
      setOnlineUsers((prev) => prev.map((u) => u.profileId === data.profileId ? { ...u, isOnline: false } : u))
    })

    socket.on('user:status:list', (data: { users: RealtimeUser[]; count: number; timestamp: string }) => {
      setOnlineUsers(data.users)
      setOnlineCount(data.count)
    })

    // Message events
    socket.on('message:new', (message: RealtimeMessage) => {
      setMessages((prev) => [...prev, message])
    })

    socket.on('message:read', (data: { conversationId: string; profileId: string; timestamp: string }) => {
      // Message was read by someone - could update UI
      console.log('[Realtime] Message read:', data)
    })

    // Typing events
    socket.on('typing:start', (data: TypingIndicator) => {
      setCurrentTypingUsers((prev) => {
        if (!prev.find((t) => t.profileId === data.profileId && t.conversationId === data.conversationId)) {
          return [...prev, data]
        }
        return prev.map((t) =>
          t.profileId === data.profileId && t.conversationId === data.conversationId ? data : t
        )
      })

      // Auto-clear typing after 3 seconds if no further events
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current)
      }
      typingTimeoutRef.current = setTimeout(() => {
        setCurrentTypingUsers((prev) =>
          prev.filter((t) => !(t.profileId === data.profileId && t.conversationId === data.conversationId))
        )
      }, 4000)
    })

    socket.on('typing:stop', (data: { conversationId: string; profileId: string }) => {
      setCurrentTypingUsers((prev) =>
        prev.filter((t) => !(t.profileId === data.profileId && t.conversationId === data.conversationId))
      )
    })

    // Conversation events
    socket.on('conversation:history', (data: { conversationId: string; messages: RealtimeMessage[] }) => {
      setMessages(data.messages)
    })

    socket.on('conversation:unread', (data: { conversationId: string; unreadCount: number }) => {
      console.log('[Realtime] Unread:', data)
    })

    socket.on('conversation:user_joined', (data: { profileId: string; conversationId: string; timestamp: string }) => {
      console.log('[Realtime] User joined:', data)
    })

    socket.on('conversation:user_left', (data: { profileId: string; conversationId: string; timestamp: string }) => {
      console.log('[Realtime] User left:', data)
    })

    // Error events
    socket.on('error', (data: { message: string }) => {
      console.error('[Realtime] Error:', data.message)
    })

    // Auto-connect
    if (autoConnect) {
      socket.connect()
    }

    // Cleanup on unmount
    return () => {
      socket.removeAllListeners()
      socket.disconnect()
      socketRef.current = null
    }
  }, [token, autoConnect, reconnection, reconnectionAttempts, reconnectionDelay])

  // Actions
  const joinConversation = useCallback((conversationId: string) => {
    socketRef.current?.emit('conversation:join', { conversationId })
  }, [])

  const leaveConversation = useCallback((conversationId: string) => {
    socketRef.current?.emit('conversation:leave', { conversationId })
  }, [])

  const sendMessage = useCallback((conversationId: string, content: string, parentId?: string) => {
    socketRef.current?.emit('message:new', { conversationId, content, parentId })
  }, [])

  const markAsRead = useCallback((conversationId: string) => {
    socketRef.current?.emit('message:read', { conversationId })
  }, [])

  const startTyping = useCallback((conversationId: string) => {
    socketRef.current?.emit('typing:start', { conversationId })
  }, [])

  const stopTyping = useCallback((conversationId: string) => {
    socketRef.current?.emit('typing:stop', { conversationId })
  }, [])

  const requestUserStatus = useCallback(() => {
    socketRef.current?.emit('user:status')
  }, [])

  const disconnect = useCallback(() => {
    socketRef.current?.disconnect()
  }, [])

  const connect = useCallback(() => {
    socketRef.current?.connect()
  }, [])

  return {
    isConnected,
    onlineUsers,
    onlineCount,
    currentTypingUsers,
    messages,

    joinConversation,
    leaveConversation,
    sendMessage,
    markAsRead,
    startTyping,
    stopTyping,
    requestUserStatus,
    disconnect,
    connect,
  }
}

export default useRealtime
