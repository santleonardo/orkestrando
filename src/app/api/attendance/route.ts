import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAuth, AuthError } from '@/lib/get-user'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const lessonId = searchParams.get('lessonId')
    const studentId = searchParams.get('studentId')

    const attendance = await db.attendance.findMany({
      where: {
        ...(lessonId && { lessonId }),
        ...(studentId && { studentId }),
      },
      include: {
        lesson: {
          include: {
            class: { select: { id: true, name: true } },
          },
        },
        student: { select: { id: true, name: true, email: true } },
      },
      orderBy: { recordedAt: 'desc' },
    })

    return NextResponse.json({ data: attendance })
  } catch (error) {
    console.error('Error fetching attendance:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request)

    const body = await request.json()
    const { lessonId, records } = body

    if (!lessonId || !records || !Array.isArray(records)) {
      return NextResponse.json(
        { error: 'lessonId and records array are required' },
        { status: 400 }
      )
    }

    // Verify lesson exists
    const lesson = await db.lesson.findUnique({ where: { id: lessonId } })
    if (!lesson) {
      return NextResponse.json({ error: 'Lesson not found' }, { status: 404 })
    }

    // Create or update attendance records
    const results = []
    for (const record of records) {
      const { studentId, status, notes } = record

      if (!studentId || !status) continue

      const existing = await db.attendance.findUnique({
        where: { lessonId_studentId: { lessonId, studentId } },
      })

      if (existing) {
        const updated = await db.attendance.update({
          where: { id: existing.id },
          data: { status, notes },
        })
        results.push(updated)
      } else {
        const created = await db.attendance.create({
          data: {
            lessonId,
            studentId,
            status,
            notes,
            recordedBy: user.id,
          },
        })
        results.push(created)
      }
    }

    return NextResponse.json({ data: results, count: results.length }, { status: 201 })
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }
    console.error('Error recording attendance:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
