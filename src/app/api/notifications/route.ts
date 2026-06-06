import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const profileId = searchParams.get('profileId')
    const unreadOnly = searchParams.get('unreadOnly')
    const page = parseInt(searchParams.get('page') || '1')
    const pageSize = parseInt(searchParams.get('pageSize') || '20')

    if (!profileId) {
      return NextResponse.json({ success: false, error: 'profileId is required' }, { status: 400 })
    }

    const where: Record<string, unknown> = { profile_id: profileId }
    if (unreadOnly === 'true') {
      where.isRead = false
    }

    const [notifications, total] = await Promise.all([
      db.notification.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { created_at: 'desc' },
      }),
      db.notification.count({ where }),
    ])

    const totalPages = Math.ceil(total / pageSize)

    return NextResponse.json({
      success: true,
      data: notifications,
      pagination: { page, pageSize, total, totalPages, hasNextPage: page < totalPages, hasPreviousPage: page > 1 },
    })
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed to fetch notifications'
    return NextResponse.json({ success: false, error: msg }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { profileId, type, title, message } = body
    if (!profileId || !title || !message) {
      return NextResponse.json({ success: false, error: 'profileId, title, and message are required' }, { status: 400 })
    }

    const notification = await db.notification.create({ data: body })
    return NextResponse.json({ success: true, data: notification }, { status: 201 })
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed to create notification'
    return NextResponse.json({ success: false, error: msg }, { status: 500 })
  }
}
