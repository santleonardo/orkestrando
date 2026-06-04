import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireRole, AuthError } from '@/lib/get-user'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const classData = await db.class.findUnique({
      where: { id },
      include: {
        discipline: {
          include: { course: true },
        },
        semester: true,
        teacher: {
          select: { id: true, name: true, email: true, phone: true, avatar: true },
        },
        enrollments: {
          include: {
            student: { select: { id: true, name: true, email: true } },
          },
        },
        lessons: {
          orderBy: { date: 'asc' },
        },
        materials: {
          orderBy: { createdAt: 'desc' },
        },
        _count: { select: { enrollments: true, lessons: true, materials: true } },
      },
    })

    if (!classData) {
      return NextResponse.json({ error: 'Class not found' }, { status: 404 })
    }

    return NextResponse.json({ data: classData })
  } catch (error) {
    console.error('Error fetching class:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireRole(request, ['ADMIN', 'COORDINATOR'])

    const { id } = await params
    const body = await request.json()

    const classData = await db.class.update({
      where: { id },
      data: {
        ...(body.name && { name: body.name }),
        ...(body.code && { code: body.code }),
        ...(body.teacherId && { teacherId: body.teacherId }),
        ...(body.schedule && { schedule: JSON.stringify(body.schedule) }),
        ...(body.room !== undefined && { room: body.room }),
        ...(body.maxStudents !== undefined && { maxStudents: body.maxStudents }),
        ...(body.isActive !== undefined && { isActive: body.isActive }),
      },
    })

    return NextResponse.json({ data: classData })
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }
    console.error('Error updating class:', error)
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
    const classData = await db.class.update({
      where: { id },
      data: { isActive: false },
    })

    return NextResponse.json({ data: classData })
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }
    console.error('Error deleting class:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
