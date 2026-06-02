import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import {
  handleApiError,
  apiResponse,
  getAuthProfile,
} from '@/lib/api-utils'

// ==================== GET /api/messages/unread ====================

export async function GET(request: NextRequest) {
  try {
    const auth = getAuthProfile(request)

    // Get all conversations the user is part of
    const conversations = await db.conversationParticipant.findMany({
      where: { profileId: auth.id },
      select: { conversationId: true, lastReadAt: true },
    })

    const conversationIds = conversations.map((c) => c.conversationId)

    if (conversationIds.length === 0) {
      return apiResponse({ unreadCount: 0, conversations: [] })
    }

    // Count unread messages per conversation
    const unreadCounts = await Promise.all(
      conversations.map(async (conv) => {
        const whereClause: Record<string, unknown> = {
          conversationId: conv.conversationId,
          senderId: { not: auth.userId },
          isRead: false,
        }

        // If user has a lastReadAt, only count messages after that time
        if (conv.lastReadAt) {
          whereClause.createdAt = { gt: conv.lastReadAt }
        }

        const count = await db.message.count({ where: whereClause })

        return {
          conversationId: conv.conversationId,
          unreadCount: count,
        }
      })
    )

    const totalUnread = unreadCounts.reduce((sum, c) => sum + c.unreadCount, 0)
    const conversationsWithUnread = unreadCounts.filter((c) => c.unreadCount > 0)

    return apiResponse({
      unreadCount: totalUnread,
      conversations: conversationsWithUnread,
    })
  } catch (error) {
    return handleApiError(error)
  }
}
