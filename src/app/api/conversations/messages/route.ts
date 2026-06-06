import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const conversation_id = searchParams.get('conversation_id')

    if (!conversation_id) {
      return NextResponse.json({ error: 'conversation_id required' }, { status: 400 })
    }

    const messages = await db.message.findMany({
      where: { conversation_id },
      include: { sender: { select: { id: true, displayName: true, avatar: true } } },
      orderBy: { created_at: 'asc' },
    })

    // Mark unread as read
    await db.message.updateMany({
      where: { conversation_id, isRead: false },
      data: { isRead: true },
    })

    return NextResponse.json(messages)
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { conversation_id, sender_id, content } = await request.json()

    if (!conversation_id || !sender_id || !content) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
    }

    const message = await db.message.create({
      data: { conversation_id, sender_id, content },
      include: { sender: { select: { id: true, displayName: true } } },
    })

    await db.conversation.update({
      where: { id: conversation_id },
      data: { updated_at: new Date() },
    })

    return NextResponse.json(message, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
