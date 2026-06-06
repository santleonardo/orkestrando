import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const profileId = searchParams.get('profileId')
    const page = parseInt(searchParams.get('page') || '1')
    const pageSize = parseInt(searchParams.get('pageSize') || '20')

    if (!profileId) {
      return NextResponse.json({ success: false, error: 'profileId is required' }, { status: 400 })
    }

    const [conversations, total] = await Promise.all([
      db.conversation.findMany({
        where: {
          participants: { some: { profileId } },
        },
        include: {
          participants: { include: { profile: { select: { id: true, firstName: true, lastName: true, displayName: true, avatar: true } } } },
          messages: {
            orderBy: { createdAt: 'desc' },
            take: 1,
            select: { id: true, content: true, createdAt: true, senderId: true },
          },
        },
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { updatedAt: 'desc' },
      }),
      db.conversation.count({
        where: { participants: { some: { profileId } } },
      }),
    ])

    const totalPages = Math.ceil(total / pageSize)

    return NextResponse.json({
      success: true,
      data: conversations,
      pagination: { page, pageSize, total, totalPages, hasNextPage: page < totalPages, hasPreviousPage: page > 1 },
    })
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed to fetch conversations'
    return NextResponse.json({ success: false, error: msg }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { orgId, type, title, participantIds, createdBy } = body
    if (!participantIds || participantIds.length < 2) {
      return NextResponse.json({ success: false, error: 'At least 2 participants required' }, { status: 400 })
    }

    const conversation = await db.conversation.create({
      data: {
        orgId,
        type: type || 'DIRECT',
        title,
        createdBy,
        participants: {
          create: participantIds.map((id: string) => ({ profileId: id })),
        },
      },
      include: {
        participants: { include: { profile: { select: { id: true, firstName: true, lastName: true, displayName: true } } } },
      },
    })

    return NextResponse.json({ success: true, data: conversation }, { status: 201 })
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed to create conversation'
    return NextResponse.json({ success: false, error: msg }, { status: 500 })
  }
}
