import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const notification = await db.notification.update({
      where: { id },
      data: { isRead: true },
    })
    return NextResponse.json({ success: true, data: notification })
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed to mark notification as read'
    return NextResponse.json({ success: false, error: msg }, { status: 500 })
  }
}
