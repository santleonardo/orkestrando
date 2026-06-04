import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAuth, AuthError } from '@/lib/get-user'

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(request)

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')

    // Get conversations where user is a participant
    const participants = await db.conversationParticipant.findMany({
      where: { userId: user.id },
      select: { conversationId: true },
    })
    const conversationIds = participants.map((p) => p.conversationId)

    const conversations = await db.conversation.findMany({
      where: {
        id: { in: conversationIds },
        ...(type && { type }),
      },
      include: {
        participants: {
          include: {
            user: { select: { id: true, name: true, email: true, avatar: true } },
          },
        },
        _count: {
          select: { messages: true },
        },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          include: {
            sender: { select: { id: true, name: true } },
          },
        },
      },
      orderBy: { updatedAt: 'desc' },
    })

    return NextResponse.json({ data: conversations })
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }
    console.error('Error fetching conversations:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request)

    const body = await request.json()
    const { participantIds, type, title } = body

    if (!participantIds || !Array.isArray(participantIds) || participantIds.length === 0) {
      return NextResponse.json({ error: 'At least one participant is required' }, { status: 400 })
    }

    // Include the creator as a participant
    const allParticipantIds = [...new Set([user.id, ...participantIds])]

    const conversation = await db.conversation.create({
      data: {
        type: type || 'direct',
        title,
        participants: {
          create: allParticipantIds.map((pId: string) => ({ userId: pId })),
        },
      },
      include: {
        participants: {
          include: {
            user: { select: { id: true, name: true, email: true } },
          },
        },
      },
    })

    return NextResponse.json({ data: conversation }, { status: 201 })
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }
    console.error('Error creating conversation:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
