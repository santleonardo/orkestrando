import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')
    const type = searchParams.get('type')
    const page = parseInt(searchParams.get('page') || '1')
    const pageSize = parseInt(searchParams.get('pageSize') || '20')

    const where: Record<string, unknown> = {}
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { code: { contains: search } },
      ]
    }
    if (type) where.type = type

    const [rooms, total] = await Promise.all([
      db.room.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { name: 'asc' },
      }),
      db.room.count({ where }),
    ])

    const totalPages = Math.ceil(total / pageSize)

    return NextResponse.json({
      success: true,
      data: rooms,
      pagination: { page, pageSize, total, totalPages, hasNextPage: page < totalPages, hasPreviousPage: page > 1 },
    })
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed to fetch rooms'
    return NextResponse.json({ success: false, error: msg }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { code, name } = body
    if (!code || !name) {
      return NextResponse.json({ success: false, error: 'Code and name are required' }, { status: 400 })
    }

    const room = await db.room.create({ data: body })
    return NextResponse.json({ success: true, data: room }, { status: 201 })
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed to create room'
    return NextResponse.json({ success: false, error: msg }, { status: 500 })
  }
}
