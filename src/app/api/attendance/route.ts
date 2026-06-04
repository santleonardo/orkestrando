import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const enrollmentId = searchParams.get('enrollmentId')
    const classId = searchParams.get('classId')
    const date = searchParams.get('date')
    const page = parseInt(searchParams.get('page') || '1')
    const pageSize = parseInt(searchParams.get('pageSize') || '20')

    const where: Record<string, unknown> = {}
    if (enrollmentId) where.enrollmentId = enrollmentId
    if (classId) {
      where.enrollment = { classId }
    }
    if (date) {
      where.date = new Date(date)
    }

    const [records, total] = await Promise.all([
      db.attendance.findMany({
        where,
        include: {
          enrollment: { include: { student: { select: { id: true, firstName: true, lastName: true } } } },
          recorder: { select: { id: true, firstName: true, lastName: true } },
        },
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { date: 'desc' },
      }),
      db.attendance.count({ where }),
    ])

    const totalPages = Math.ceil(total / pageSize)

    return NextResponse.json({
      success: true,
      data: records,
      pagination: { page, pageSize, total, totalPages, hasNextPage: page < totalPages, hasPreviousPage: page > 1 },
    })
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed to fetch attendance'
    return NextResponse.json({ success: false, error: msg }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { records, recordedBy } = body

    if (!records || !Array.isArray(records) || records.length === 0) {
      return NextResponse.json({ success: false, error: 'Records array is required' }, { status: 400 })
    }
    if (!recordedBy) {
      return NextResponse.json({ success: false, error: 'recordedBy is required' }, { status: 400 })
    }

    const date = body.date ? new Date(body.date) : new Date()

    const created = await db.$transaction(
      records.map((r: { enrollmentId: string; status: string; notes?: string }) =>
        db.attendance.create({
          data: {
            enrollmentId: r.enrollmentId,
            status: r.status || 'PRESENT',
            notes: r.notes,
            date,
            recordedBy,
          },
        })
      )
    )

    return NextResponse.json({ success: true, data: created }, { status: 201 })
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed to create attendance'
    return NextResponse.json({ success: false, error: msg }, { status: 500 })
  }
}
