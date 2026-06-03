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
  paginationSchema,
  searchSchema,
} from '@/lib/api-utils'

// ==================== Schemas ====================

const conversationsQuerySchema = z.object({
  type: z.enum(['DIRECT', 'GROUP']).optional(),
  ...paginationSchema.shape,
  ...searchSchema.shape,
})

const createConversationSchema = z.object({
  title: z.string().optional(),
  type: z.enum(['DIRECT', 'GROUP']).default('DIRECT'),
  participantIds: z.array(z.string().min(1)).min(1, 'At least one participant is required'),
})

// ==================== GET /api/conversations ====================

export async function GET(request: NextRequest) {
  try {
    const auth = getAuthProfile(request)
    const query = parseQuery(request, conversationsQuerySchema)
    const { page, pageSize, type } = query

    const where: Record<string, unknown> = {
      participants: { some: { profileId: auth.id } },
    }
    if (type) where.type = type

    const [conversations, total] = await Promise.all([
      db.conversation.findMany({
        where,
        include: {
          participants: {
            include: {
              profile: {
                select: { id: true, role: true, user: { select: { id: true, name: true, avatarUrl: true } } },
              },
            },
          },
          _count: { select: { messages: true } },
          messages: {
            orderBy: { createdAt: 'desc' },
            take: 1,
            include: {
              sender: { select: { id: true, name: true } },
            },
          },
        },
        orderBy: [{ updatedAt: 'desc' }],
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      db.conversation.count({ where }),
    ])

    // Get unread count for each conversation
    const conversationsWithUnread = await Promise.all(
      conversations.map(async (conv) => {
        const participant = conv.participants.find((p) => p.profileId === auth.id)
        let unreadCount = 0

        if (participant?.lastReadAt) {
          unreadCount = await db.message.count({
            where: {
              conversationId: conv.id,
              senderId: { not: auth.userId },
              isRead: false,
              createdAt: { gt: participant.lastReadAt },
            },
          })
        } else {
          unreadCount = await db.message.count({
            where: {
              conversationId: conv.id,
              senderId: { not: auth.userId },
              isRead: false,
            },
          })
        }

        return {
          ...conv,
          unreadCount,
          lastMessage: conv.messages[0] || null,
        }
      })
    )

    return paginatedResponse(conversationsWithUnread, total, page, pageSize)
  } catch (error) {
    return handleApiError(error)
  }
}

// ==================== POST /api/conversations ====================

export async function POST(request: NextRequest) {
  try {
    const auth = getAuthProfile(request)
    const body = await parseBody(request, createConversationSchema)

    // For DIRECT conversations, check if one already exists between these users
    if (body.type === 'DIRECT' && body.participantIds.length === 1) {
      const otherParticipantId = body.participantIds[0]

      const existingConversation = await db.conversation.findFirst({
        where: {
          type: 'DIRECT',
          participants: {
            every: {
              profileId: { in: [auth.id, otherParticipantId] },
            },
          },
        },
        include: {
          participants: {
            include: {
              profile: {
                select: { id: true, role: true, user: { select: { id: true, name: true, avatarUrl: true } } },
              },
            },
          },
        },
      })

      if (existingConversation) {
        return apiResponse(existingConversation)
      }
    }

    // Verify all participants exist
    const profiles = await db.profile.findMany({
      where: { id: { in: body.participantIds } },
    })
    if (profiles.length !== body.participantIds.length) {
      return apiError('One or more participants not found', 404)
    }

    // Create conversation and participants in a transaction
    const conversation = await db.$transaction(async (tx) => {
      const conv = await tx.conversation.create({
        data: {
          title: body.title,
          type: body.type,
        },
      })

      // Add creator as participant
      await tx.conversationParticipant.create({
        data: {
          conversationId: conv.id,
          profileId: auth.id,
        },
      })

      // Add other participants
      for (const participantId of body.participantIds) {
        await tx.conversationParticipant.create({
          data: {
            conversationId: conv.id,
            profileId: participantId,
          },
        })
      }

      return conv
    })

    // Fetch the created conversation with participants
    const fullConversation = await db.conversation.findUnique({
      where: { id: conversation.id },
      include: {
        participants: {
          include: {
            profile: {
              select: { id: true, role: true, user: { select: { id: true, name: true, avatarUrl: true } } },
            },
          },
        },
      },
    })

    return apiResponse(fullConversation, 201)
  } catch (error) {
    return handleApiError(error)
  }
}
