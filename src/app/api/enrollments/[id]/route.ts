import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const enrollment = await db.enrollment.findUnique({
      where: { id },
      include: {
        class: { include: { subject: true, teacher: { select: { id: true, firstName: true, lastName: true } } } },
        student: { select: { id: true, firstName: true, lastName: true, displayName: true } },
        attendance: { orderBy: { date: 'desc' } },
      },
    })
    if (!enrollment) {
      return NextResponse.json({ success: false, error: 'Enrollment not found' }, { status: 404 })
    }
    return NextResponse.json({ success: true, data: enrollment })
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed to fetch enrollment'
    return NextResponse.json({ success: false, error: msg }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await request.json()
    const enrollment = await db.enrollment.update({ where: { id }, data: body })
    return NextResponse.json({ success: true, data: enrollment })
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed to update enrollment'
    return NextResponse.json({ success: false, error: msg }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    await db.enrollment.delete({ where: { id } })
    return NextResponse.json({ success: true, data: null })
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed to delete enrollment'
    return NextResponse.json({ success: false, error: msg }, { status: 500 })
  }
}
