import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAuth, AuthError } from '@/lib/get-user'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ conversationId: string }> }
) {
  try {
    const user = await requireAuth(request)

    const { conversationId } = await params
    const { searchParams } = new URL(request.url)
    const page = Number(searchParams.get('page')) || 1
    const limit = Number(searchParams.get('limit')) || 50

    // Check if user is a participant
    const participant = await db.conversationParticipant.findUnique({
      where: { conversationId_userId: { conversationId, userId: user.id } },
    })
    if (!participant) {
      return NextResponse.json({ error: 'Not a participant' }, { status: 403 })
    }

    const [messages, total] = await Promise.all([
      db.message.findMany({
        where: { conversationId },
        include: {
          sender: { select: { id: true, name: true, avatar: true } },
          attachments: true,
          reads: {
            include: {
              user: { select: { id: true, name: true } },
            },
          },
          replyTo: {
            include: {
              sender: { select: { id: true, name: true } },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.message.count({ where: { conversationId } }),
    ])

    return NextResponse.json({
      data: messages.reverse(),
      meta: { total, page, limit, pages: Math.ceil(total / limit) },
    })
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }
    console.error('Error fetching messages:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ conversationId: string }> }
) {
  try {
    const user = await requireAuth(request)

    const { conversationId } = await params
    const body = await request.json()
    const { content, priority, replyToId } = body

    if (!content) {
      return NextResponse.json({ error: 'Message content is required' }, { status: 400 })
    }

    // Check if user is a participant
    const participant = await db.conversationParticipant.findUnique({
      where: { conversationId_userId: { conversationId, userId: user.id } },
    })
    if (!participant) {
      return NextResponse.json({ error: 'Not a participant' }, { status: 403 })
    }

    const message = await db.message.create({
      data: {
        conversationId,
        senderId: user.id,
        content,
        priority: priority || 'NORMAL',
        replyToId,
      },
      include: {
        sender: { select: { id: true, name: true, avatar: true } },
        attachments: true,
      },
    })

    // Update conversation updatedAt
    await db.conversation.update({
      where: { id: conversationId },
      data: { updatedAt: new Date() },
    })

    return NextResponse.json({ data: message }, { status: 201 })
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }
    console.error('Error sending message:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
