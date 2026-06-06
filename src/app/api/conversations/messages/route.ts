import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const conversationId = searchParams.get('conversationId')
    const profileId = searchParams.get('profileId')

    if (!conversationId) {
      return NextResponse.json({ error: 'conversationId required' }, { status: 400 })
    }

    const messages = await db.message.findMany({
      where: { conversationId },
      include: { sender: { select: { id: true, displayName: true, avatar: true } } },
      orderBy: { createdAt: 'asc' },
    })

    // Mark participant as having read up to now
    if (profileId) {
      await db.conversationParticipant.updateMany({
        where: { conversationId, profileId },
        data: { lastReadAt: new Date() },
      })
    }

    return NextResponse.json(messages)
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { conversationId, senderId, content, orgId } = await request.json()

    if (!conversationId || !senderId || !content) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
    }

    const message = await db.message.create({
      data: { orgId, conversationId, senderId, content },
      include: { sender: { select: { id: true, displayName: true } } },
    })

    await db.conversation.update({
      where: { id: conversationId },
      data: { lastMessageAt: new Date(), updatedAt: new Date() },
    })

    return NextResponse.json(message, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
