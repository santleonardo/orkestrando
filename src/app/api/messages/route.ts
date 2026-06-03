import { NextRequest } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db'
import {
  parseBody,
  parseQuery,
  handleApiError,
  apiResponse,
  apiError,
  paginatedResponse,
  getAuthProfile,
  createAuditLog,
  paginationSchema,
} from '@/lib/api-utils'

// ==================== Schemas ====================

const messagesQuerySchema = z.object({
  conversationId: z.string().min(1, 'Conversation ID is required'),
  ...paginationSchema.shape,
})

const sendMessageSchema = z.object({
  conversationId: z.string().min(1, 'Conversation ID is required'),
  content: z.string().min(1, 'Message content is required'),
  type: z.enum(['TEXT', 'FILE', 'SYSTEM']).default('TEXT'),
  fileUrl: z.string().optional(),
})

// ==================== GET /api/messages ====================

export async function GET(request: NextRequest) {
  try {
    const auth = getAuthProfile(request)
    const query = parseQuery(request, messagesQuerySchema)
    const { page, pageSize, conversationId } = query

    // Verify user is a participant in this conversation
    const participant = await db.conversationParticipant.findFirst({
      where: {
        conversationId,
        profileId: auth.id,
      },
    })
    if (!participant) {
      return apiError('You are not a participant in this conversation', 403)
    }

    // Update last read time
    await db.conversationParticipant.update({
      where: {
        id: participant.id,
      },
      data: { lastReadAt: new Date() },
    })

    const [messages, total] = await Promise.all([
      db.message.findMany({
        where: { conversationId },
        include: {
          sender: {
            select: { id: true, name: true, avatarUrl: true, profile: { select: { id: true, role: true } } },
          },
        },
        orderBy: [{ createdAt: 'asc' }],
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      db.message.count({ where: { conversationId } }),
    ])

    return paginatedResponse(messages, total, page, pageSize)
  } catch (error) {
    return handleApiError(error)
  }
}

// ==================== POST /api/messages ====================

export async function POST(request: NextRequest) {
  try {
    const auth = getAuthProfile(request)
    const body = await parseBody(request, sendMessageSchema)

    // Verify user is a participant in this conversation
    const participant = await db.conversationParticipant.findFirst({
      where: {
        conversationId: body.conversationId,
        profileId: auth.id,
      },
    })
    if (!participant) {
      return apiError('You are not a participant in this conversation', 403)
    }

    // Create message
    const message = await db.message.create({
      data: {
        conversationId: body.conversationId,
        senderId: auth.userId,
        content: body.content,
        type: body.type,
        fileUrl: body.fileUrl,
      },
      include: {
        sender: {
          select: { id: true, name: true, avatarUrl: true, profile: { select: { id: true, role: true } } },
        },
      },
    })

    // Update conversation timestamp
    await db.conversation.update({
      where: { id: body.conversationId },
      data: { updatedAt: new Date() },
    })

    return apiResponse(message, 201)
  } catch (error) {
    return handleApiError(error)
  }
}
