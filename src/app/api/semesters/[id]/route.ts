import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireRole, AuthError } from '@/lib/get-user'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const semester = await db.semester.findUnique({
      where: { id },
      include: {
        classes: {
          include: {
            discipline: { select: { id: true, name: true, code: true } },
            teacher: { select: { id: true, name: true, email: true } },
            _count: { select: { enrollments: true, lessons: true } },
          },
        },
        academicCalendars: {
          orderBy: { date: 'asc' },
        },
        _count: {
          select: {
            classes: true,
            availabilities: true,
          },
        },
      },
    })

    if (!semester) {
      return NextResponse.json({ error: 'Semester not found' }, { status: 404 })
    }

    return NextResponse.json({ data: semester })
  } catch (error) {
    console.error('Error fetching semester:', error)
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

    // If setting active, deactivate other semesters first
    if (body.isActive === true) {
      await db.semester.updateMany({
        where: { isActive: true, id: { not: id } },
        data: { isActive: false },
      })
    }

    const semester = await db.semester.update({
      where: { id },
      data: {
        ...(body.name && { name: body.name }),
        ...(body.code && { code: body.code }),
        ...(body.startDate && { startDate: new Date(body.startDate) }),
        ...(body.endDate && { endDate: new Date(body.endDate) }),
        ...(body.isActive !== undefined && { isActive: body.isActive }),
      },
    })

    return NextResponse.json({ data: semester })
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }
    console.error('Error updating semester:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireRole(request, ['ADMIN'])

    const { id } = await params
    await db.semester.delete({ where: { id } })

    return NextResponse.json({ data: { success: true } })
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }
    console.error('Error deleting semester:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
