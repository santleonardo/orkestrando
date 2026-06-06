import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const conversationId = searchParams.get('conversationId')

    if (!conversationId) {
      return NextResponse.json({ error: 'conversationId required' }, { status: 400 })
    }

    const messages = await db.message.findMany({
      where: { conversationId },
      include: { sender: { select: { id: true, avatar: true } } },
      orderBy: { createdAt: 'asc' },
    })

    // Mark unread as read
    await db.message.updateMany({
      where: { conversationId, isRead: false },
      data: { isRead: true },
    })

    return NextResponse.json(messages)
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { conversationId, senderId, content } = await request.json()

    if (!conversationId || !senderId || !content) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
    }

    const message = await db.message.create({
      data: { conversationId, senderId, content },
      include: { sender: { select: { id: true } } },
    })

    await db.conversation.update({
      where: { id: conversationId },
      data: { updatedAt: new Date() },
    })

    return NextResponse.json(message, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
