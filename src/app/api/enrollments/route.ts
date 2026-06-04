import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAuth, AuthError } from '@/lib/get-user'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const studentId = searchParams.get('studentId')
    const classId = searchParams.get('classId')
    const status = searchParams.get('status')

    const enrollments = await db.enrollment.findMany({
      where: {
        ...(studentId && { studentId }),
        ...(classId && { classId }),
        ...(status && { status }),
      },
      include: {
        student: { select: { id: true, name: true, email: true, avatar: true } },
        class: {
          include: {
            discipline: { select: { id: true, name: true, code: true } },
            semester: { select: { id: true, name: true, code: true } },
            teacher: { select: { id: true, name: true } },
          },
        },
      },
      orderBy: { enrolledAt: 'desc' },
    })

    return NextResponse.json({ data: enrollments })
  } catch (error) {
    console.error('Error fetching enrollments:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request)

    const body = await request.json()
    const { studentId, classId } = body

    if (!studentId || !classId) {
      return NextResponse.json({ error: 'studentId and classId are required' }, { status: 400 })
    }

    // Check if class exists and is active
    const classData = await db.class.findUnique({
      where: { id: classId },
    })
    if (!classData || !classData.isActive) {
      return NextResponse.json({ error: 'Class not found or inactive' }, { status: 404 })
    }

    // Check capacity
    const currentEnrollments = await db.enrollment.count({
      where: { classId, status: 'active' },
    })
    if (currentEnrollments >= classData.maxStudents) {
      return NextResponse.json({ error: 'Class is full' }, { status: 400 })
    }

    // Check for existing enrollment
    const existing = await db.enrollment.findUnique({
      where: { studentId_classId: { studentId, classId } },
    })
    if (existing) {
      return NextResponse.json({ error: 'Already enrolled in this class' }, { status: 409 })
    }

    const enrollment = await db.enrollment.create({
      data: { studentId, classId },
    })

    return NextResponse.json({ data: enrollment }, { status: 201 })
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }
    console.error('Error creating enrollment:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
