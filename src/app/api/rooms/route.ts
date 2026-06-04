import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireRole, AuthError } from '@/lib/get-user'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')

    const rooms = await db.room.findMany({
      where: {
        ...(type && { type }),
        isActive: true,
      },
      include: {
        _count: {
          select: { lessons: true },
        },
      },
      orderBy: [{ code: 'asc' }],
    })

    return NextResponse.json({ data: rooms })
  } catch (error) {
    console.error('Error fetching rooms:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireRole(request, ['ADMIN', 'COORDINATOR'])

    const body = await request.json()
    const { name, code, capacity, type } = body

    if (!name || !code || !capacity) {
      return NextResponse.json({ error: 'Name, code, and capacity are required' }, { status: 400 })
    }

    const existing = await db.room.findUnique({ where: { code } })
    if (existing) {
      return NextResponse.json({ error: 'Room code already exists' }, { status: 409 })
    }

    const room = await db.room.create({
      data: {
        name,
        code: code.toUpperCase(),
        capacity,
        type: type || 'classroom',
      },
    })

    return NextResponse.json({ data: room }, { status: 201 })
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }
    console.error('Error creating room:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
