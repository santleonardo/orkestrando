import { NextRequest } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db'
import {
  parseBody,
  handleApiError,
  apiResponse,
  apiError,
  NotFoundError,
  getAuthProfile,
} from '@/lib/api-utils'

// ==================== Schema ====================

const addParticipantsSchema = z.object({
  profileIds: z.array(z.string().min(1)).min(1, 'At least one participant ID is required'),
})

// ==================== POST /api/conversations/[id]/participants ====================

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const auth = getAuthProfile(request)
    const body = await parseBody(request, addParticipantsSchema)

    // Verify conversation exists
    const conversation = await db.conversation.findUnique({
      where: { id },
      include: {
        participants: {
          select: { profileId: true },
        },
      },
    })
    if (!conversation) {
      throw new NotFoundError('Conversation', id)
    }

    // Verify the user is a participant
    const isParticipant = conversation.participants.some((p) => p.profileId === auth.id)
    if (!isParticipant) {
      return apiError('You are not a participant in this conversation', 403)
    }

    // Verify all new profiles exist
    const profiles = await db.profile.findMany({
      where: { id: { in: body.profileIds } },
    })
    if (profiles.length !== body.profileIds.length) {
      return apiError('One or more profiles not found', 404)
    }

    // Filter out already existing participants
    const existingIds = new Set(conversation.participants.map((p) => p.profileId))
    const newIds = body.profileIds.filter((pid) => !existingIds.has(pid))

    if (newIds.length === 0) {
      return apiError('All specified users are already participants', 400)
    }

    // Add new participants
    await db.conversationParticipant.createMany({
      data: newIds.map((profileId) => ({
        conversationId: id,
        profileId,
      })),
    })

    // Send system message about new participants
    await db.message.create({
      data: {
        conversationId: id,
        senderId: auth.userId,
        content: `${auth.name} added ${newIds.length} participant(s) to the conversation`,
        type: 'SYSTEM',
      },
    })

    // Update conversation timestamp
    await db.conversation.update({
      where: { id },
      data: { updatedAt: new Date() },
    })

    // Fetch updated conversation
    const updatedConversation = await db.conversation.findUnique({
      where: { id },
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

    return apiResponse(updatedConversation)
  } catch (error) {
    return handleApiError(error)
  }
}
