import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAuth, AuthError } from '@/lib/get-user'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const availability = await db.teacherAvailability.findUnique({
      where: { id },
      include: {
        teacher: true,
        semester: true,
        approver: { select: { id: true, name: true } },
      },
    })

    if (!availability) {
      return NextResponse.json({ error: 'Availability not found' }, { status: 404 })
    }

    return NextResponse.json({ data: availability })
  } catch (error) {
    console.error('Error fetching availability:', error)
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

    const availability = await db.teacherAvailability.update({
      where: { id },
      data: {
        ...(body.dayOfWeek !== undefined && { dayOfWeek: Number(body.dayOfWeek) }),
        ...(body.startTime && { startTime: body.startTime }),
        ...(body.endTime && { endTime: body.endTime }),
        ...(body.type && { type: body.type }),
        ...(body.reason !== undefined && { reason: body.reason }),
        ...(body.effectiveFrom && { effectiveFrom: new Date(body.effectiveFrom) }),
        ...(body.effectiveTo !== undefined && { effectiveTo: body.effectiveTo ? new Date(body.effectiveTo) : null }),
      },
    })

    return NextResponse.json({ data: availability })
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }
    console.error('Error updating availability:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth(request)

    const { id } = await params
    await db.teacherAvailability.delete({ where: { id } })

    return NextResponse.json({ data: { success: true } })
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }
    console.error('Error deleting availability:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
