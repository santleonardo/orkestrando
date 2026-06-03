import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const profileId = searchParams.get('profileId')
    const action = searchParams.get('action')
    const resource = searchParams.get('resource')
    const page = parseInt(searchParams.get('page') || '1')
    const pageSize = parseInt(searchParams.get('pageSize') || '20')

    const where: Record<string, unknown> = {}
    if (profileId) where.profileId = profileId
    if (action) where.action = action
    if (resource) where.resource = resource

    const [logs, total] = await Promise.all([
      db.auditLog.findMany({
        where,
        include: {
          profile: { select: { id: true, firstName: true, lastName: true, displayName: true } },
        },
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
      }),
      db.auditLog.count({ where }),
    ])

    const totalPages = Math.ceil(total / pageSize)

    return NextResponse.json({
      success: true,
      data: logs,
      pagination: { page, pageSize, total, totalPages, hasNextPage: page < totalPages, hasPreviousPage: page > 1 },
    })
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed to fetch audit logs'
    return NextResponse.json({ success: false, error: msg }, { status: 500 })
  }
}
