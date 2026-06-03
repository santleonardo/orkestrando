import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const cls = await db.class.findUnique({
      where: { id },
      include: {
        subject: true,
        teacher: { select: { id: true, firstName: true, lastName: true, displayName: true, email: true } },
        room: true,
        enrollments: { include: { student: { select: { id: true, firstName: true, lastName: true, displayName: true } } } },
      },
    })
    if (!cls) {
      return NextResponse.json({ success: false, error: 'Class not found' }, { status: 404 })
    }
    return NextResponse.json({ success: true, data: cls })
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed to fetch class'
    return NextResponse.json({ success: false, error: msg }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await request.json()
    const cls = await db.class.update({ where: { id }, data: body })
    return NextResponse.json({ success: true, data: cls })
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed to update class'
    return NextResponse.json({ success: false, error: msg }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    await db.class.delete({ where: { id } })
    return NextResponse.json({ success: true, data: null })
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed to delete class'
    return NextResponse.json({ success: false, error: msg }, { status: 500 })
  }
}
