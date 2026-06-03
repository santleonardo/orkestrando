import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const room = await db.room.findUnique({
      where: { id },
      include: { classes: true },
    })
    if (!room) {
      return NextResponse.json({ success: false, error: 'Room not found' }, { status: 404 })
    }
    return NextResponse.json({ success: true, data: room })
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed to fetch room'
    return NextResponse.json({ success: false, error: msg }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await request.json()
    const room = await db.room.update({ where: { id }, data: body })
    return NextResponse.json({ success: true, data: room })
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed to update room'
    return NextResponse.json({ success: false, error: msg }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    await db.room.delete({ where: { id } })
    return NextResponse.json({ success: true, data: null })
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed to delete room'
    return NextResponse.json({ success: false, error: msg }, { status: 500 })
  }
}
