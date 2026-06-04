import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAuth, AuthError } from '@/lib/get-user'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const teacherId = searchParams.get('teacherId')
    const classId = searchParams.get('classId')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const status = searchParams.get('status')
    const page = Number(searchParams.get('page')) || 1
    const limit = Number(searchParams.get('limit')) || 50

    const where: Record<string, unknown> = {}
    if (teacherId) where.teacherId = teacherId
    if (classId) where.classId = classId
    if (status) where.status = status
    if (startDate && endDate) {
      where.date = { gte: new Date(startDate), lte: new Date(endDate) }
    } else if (startDate) {
      where.date = { gte: new Date(startDate) }
    } else if (endDate) {
      where.date = { lte: new Date(endDate) }
    }

    const [lessons, total] = await Promise.all([
      db.lesson.findMany({
        where,
        include: {
          class: {
            include: {
              discipline: { select: { id: true, name: true, code: true } },
            },
          },
          teacher: { select: { id: true, name: true, email: true } },
          room: { select: { id: true, name: true, code: true } },
          _count: { select: { attendance: true, lessonMaterials: true } },
        },
        orderBy: [{ date: 'asc' }, { startTime: 'asc' }],
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.lesson.count({ where }),
    ])

    return NextResponse.json({
      data: lessons,
      meta: { total, page, limit, pages: Math.ceil(total / limit) },
    })
  } catch (error) {
    console.error('Error fetching lessons:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request)

    const body = await request.json()
    const { classId, teacherId, date, startTime, endTime, roomId, topic, notes, status } = body

    if (!classId || !teacherId || !date || !startTime || !endTime) {
      return NextResponse.json(
        { error: 'classId, teacherId, date, startTime, endTime are required' },
        { status: 400 }
      )
    }

    const lesson = await db.lesson.create({
      data: {
        classId,
        teacherId,
        date: new Date(date),
        startTime,
        endTime,
        roomId,
        topic,
        notes,
        status: status || 'SCHEDULED',
      },
    })

    return NextResponse.json({ data: lesson }, { status: 201 })
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }
    console.error('Error creating lesson:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
