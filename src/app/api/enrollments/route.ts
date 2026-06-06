import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const classId = searchParams.get('classId')
    const studentId = searchParams.get('studentId')
    const status = searchParams.get('status')
    const page = parseInt(searchParams.get('page') || '1')
    const pageSize = parseInt(searchParams.get('pageSize') || '20')

    const where: Record<string, unknown> = {}
    if (classId) where.classId = classId
    if (studentId) where.studentId = studentId
    if (status) where.status = status

    const [enrollments, total] = await Promise.all([
      db.enrollment.findMany({
        where,
        include: {
          class: { include: { subject: true } },
          student: { select: { id: true, firstName: true, lastName: true } },
        },
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
      }),
      db.enrollment.count({ where }),
    ])

    const totalPages = Math.ceil(total / pageSize)

    return NextResponse.json({
      success: true,
      data: enrollments,
      pagination: { page, pageSize, total, totalPages, hasNextPage: page < totalPages, hasPreviousPage: page > 1 },
    })
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed to fetch enrollments'
    return NextResponse.json({ success: false, error: msg }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { classId, studentId } = body
    if (!classId || !studentId) {
      return NextResponse.json({ success: false, error: 'Class and student are required' }, { status: 400 })
    }

    const enrollment = await db.enrollment.create({ data: body })
    return NextResponse.json({ success: true, data: enrollment }, { status: 201 })
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed to create enrollment'
    return NextResponse.json({ success: false, error: msg }, { status: 500 })
  }
}
