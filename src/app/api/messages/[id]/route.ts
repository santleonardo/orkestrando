import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import {
  handleApiError,
  apiResponse,
  NotFoundError,
  getAuthProfile,
} from '@/lib/api-utils'

// ==================== GET /api/messages/[id] ====================

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const auth = getAuthProfile(request)

    const message = await db.message.findUnique({
      where: { id },
      include: {
        sender: {
          select: { id: true, name: true, avatarUrl: true, profile: { select: { id: true, role: true } } },
        },
        conversation: {
          select: { id: true, title: true, type: true },
        },
      },
    })

    if (!message) {
      throw new NotFoundError('Message', id)
    }

    // Verify user is a participant
    const participant = await db.conversationParticipant.findFirst({
      where: {
        conversationId: message.conversationId,
        profileId: auth.id,
      },
    })
    if (!participant) {
      return apiError('You are not a participant in this conversation', 403)
    }

    return apiResponse(message)
  } catch (error) {
    return handleApiError(error)
  }
}
