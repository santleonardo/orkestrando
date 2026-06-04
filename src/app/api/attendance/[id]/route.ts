import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAuth, AuthError } from '@/lib/get-user'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const attendance = await db.attendance.findUnique({
      where: { id },
      include: {
        lesson: {
          include: { class: { select: { id: true, name: true } } },
        },
        student: true,
      },
    })

    if (!attendance) {
      return NextResponse.json({ error: 'Attendance record not found' }, { status: 404 })
    }

    return NextResponse.json({ data: attendance })
  } catch (error) {
    console.error('Error fetching attendance:', error)
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

    const attendance = await db.attendance.update({
      where: { id },
      data: {
        ...(body.status && { status: body.status }),
        ...(body.notes !== undefined && { notes: body.notes }),
      },
    })

    return NextResponse.json({ data: attendance })
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }
    console.error('Error updating attendance:', error)
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
    await db.attendance.delete({ where: { id } })

    return NextResponse.json({ data: { success: true } })
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }
    console.error('Error deleting attendance:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
