import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAuth, AuthError } from '@/lib/get-user'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ conversationId: string }> }
) {
  try {
    const user = await requireAuth(request)

    const { conversationId } = await params
    const body = await request.json()
    const { messageIds } = body

    // Check if user is a participant
    const participant = await db.conversationParticipant.findUnique({
      where: { conversationId_userId: { conversationId, userId: user.id } },
    })
    if (!participant) {
      return NextResponse.json({ error: 'Not a participant' }, { status: 403 })
    }

    if (messageIds && Array.isArray(messageIds)) {
      // Mark specific messages as read
      await db.messageRead.createMany({
        data: messageIds.map((messageId: string) => ({
          messageId,
          userId: user.id,
        })),
        skipDuplicates: true,
      })
    } else {
      // Mark all unread messages as read
      const unreadMessages = await db.message.findMany({
        where: {
          conversationId,
          senderId: { not: user.id },
          reads: {
            none: { userId: user.id },
          },
        },
        select: { id: true },
      })

      if (unreadMessages.length > 0) {
        await db.messageRead.createMany({
          data: unreadMessages.map((m) => ({
            messageId: m.id,
            userId: user.id,
          })),
          skipDuplicates: true,
        })
      }
    }

    return NextResponse.json({ data: { success: true } })
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }
    console.error('Error marking messages as read:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
