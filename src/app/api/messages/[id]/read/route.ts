import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import {
  handleApiError,
  apiResponse,
  apiError,
  NotFoundError,
  getAuthProfile,
} from '@/lib/api-utils'

// ==================== POST /api/messages/[id]/read ====================

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const auth = getAuthProfile(request)

    const message = await db.message.findUnique({
      where: { id },
      include: { conversation: { select: { id: true } } },
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

    // Mark message as read
    await db.message.update({
      where: { id },
      data: { isRead: true },
    })

    // Update participant's last read time
    await db.conversationParticipant.update({
      where: { id: participant.id },
      data: { lastReadAt: new Date() },
    })

    return apiResponse({ message: 'Message marked as read' })
  } catch (error) {
    return handleApiError(error)
  }
}
