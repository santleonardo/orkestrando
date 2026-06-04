import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAuth, requireRole, AuthError } from '@/lib/get-user'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const lesson = await db.lesson.findUnique({
      where: { id },
      include: {
        class: {
          include: {
            discipline: true,
            semester: true,
          },
        },
        teacher: { select: { id: true, name: true, email: true } },
        room: true,
        attendance: {
          include: {
            student: { select: { id: true, name: true, email: true } },
          },
        },
        lessonMaterials: {
          include: {
            material: true,
          },
        },
      },
    })

    if (!lesson) {
      return NextResponse.json({ error: 'Lesson not found' }, { status: 404 })
    }

    return NextResponse.json({ data: lesson })
  } catch (error) {
    console.error('Error fetching lesson:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth(request)

    const { id } = await params
    const body = await request.json()

    const existing = await db.lesson.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'Lesson not found' }, { status: 404 })
    }

    const updateData: Record<string, unknown> = {}

    if (body.date) updateData.date = new Date(body.date)
    if (body.startTime) updateData.startTime = body.startTime
    if (body.endTime) updateData.endTime = body.endTime
    if (body.roomId !== undefined) updateData.roomId = body.roomId
    if (body.topic !== undefined) updateData.topic = body.topic
    if (body.notes !== undefined) updateData.notes = body.notes

    // Handle status changes
    if (body.status === 'CANCELLED') {
      updateData.status = 'CANCELLED'
    } else if (body.status === 'COMPLETED') {
      updateData.status = 'COMPLETED'
    } else if (body.status === 'RESCHEDULED') {
      updateData.status = 'RESCHEDULED'
      updateData.rescheduledFrom = existing.date.toISOString()
    }

    if (Object.keys(updateData).length > 0) {
      const lesson = await db.lesson.update({
        where: { id },
        data: updateData,
      })
      return NextResponse.json({ data: lesson })
    }

    return NextResponse.json({ data: existing })
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }
    console.error('Error updating lesson:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireRole(request, ['ADMIN', 'COORDINATOR'])

    const { id } = await params
    await db.lesson.delete({ where: { id } })

    return NextResponse.json({ data: { success: true } })
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }
    console.error('Error deleting lesson:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
