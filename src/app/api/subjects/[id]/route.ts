import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const subject = await db.subject.findUnique({
      where: { id },
      include: { classes: true },
    })
    if (!subject) {
      return NextResponse.json({ success: false, error: 'Subject not found' }, { status: 404 })
    }
    return NextResponse.json({ success: true, data: subject })
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed to fetch subject'
    return NextResponse.json({ success: false, error: msg }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await request.json()
    const subject = await db.subject.update({ where: { id }, data: body })
    return NextResponse.json({ success: true, data: subject })
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed to update subject'
    return NextResponse.json({ success: false, error: msg }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    await db.subject.delete({ where: { id } })
    return NextResponse.json({ success: true, data: null })
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed to delete subject'
    return NextResponse.json({ success: false, error: msg }, { status: 500 })
  }
}
