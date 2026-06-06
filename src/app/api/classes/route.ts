import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const subjectId = searchParams.get('subjectId')
    const teacherId = searchParams.get('teacherId')
    const roomId = searchParams.get('roomId')
    const weekday = searchParams.get('weekday')
    const search = searchParams.get('search')
    const page = parseInt(searchParams.get('page') || '1')
    const pageSize = parseInt(searchParams.get('pageSize') || '20')

    const where: Record<string, unknown> = {}
    if (subjectId) where.subjectId = subjectId
    if (teacherId) where.teacherId = teacherId
    if (roomId) where.roomId = roomId
    if (weekday) where.weekday = weekday
    if (search) where.code = { contains: search }

    const [classes, total] = await Promise.all([
      db.class.findMany({
        where,
        include: {
          subject: true,
          teacher: { select: { id: true, firstName: true, lastName: true, email: true } },
          room: true,
        },
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { code: 'asc' },
      }),
      db.class.count({ where }),
    ])

    const totalPages = Math.ceil(total / pageSize)

    return NextResponse.json({
      success: true,
      data: classes,
      pagination: { page, pageSize, total, totalPages, hasNextPage: page < totalPages, hasPreviousPage: page > 1 },
    })
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed to fetch classes'
    return NextResponse.json({ success: false, error: msg }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { code, subjectId, teacherId, roomId, weekday, startTime, endTime } = body
    if (!code || !subjectId || !teacherId || !roomId || !weekday || !startTime || !endTime) {
      return NextResponse.json({ success: false, error: 'Required fields missing' }, { status: 400 })
    }

    const cls = await db.class.create({ data: body })
    const result = await db.class.findUnique({
      where: { id: cls.id },
      include: { subject: true, teacher: { select: { id: true, firstName: true, lastName: true } }, room: true },
    })
    return NextResponse.json({ success: true, data: result }, { status: 201 })
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed to create class'
    return NextResponse.json({ success: false, error: msg }, { status: 500 })
  }
}
