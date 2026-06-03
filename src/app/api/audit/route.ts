import { NextRequest } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db'
import {
  parseQuery,
  handleApiError,
  apiResponse,
  paginatedResponse,
  paginationSchema,
  getAuthProfile,
  requirePermission,
} from '@/lib/api-utils'

// ==================== Schema ====================

const auditQuerySchema = z.object({
  action: z.enum(['CREATE', 'READ', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT', 'EXPORT']).optional(),
  profileId: z.string().optional(),
  resource: z.string().optional(),
  resourceId: z.string().optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  ...paginationSchema.shape,
})

// ==================== GET /api/audit ====================

export async function GET(request: NextRequest) {
  try {
    const auth = getAuthProfile(request)
    requirePermission(auth, 'COORDINATOR')
    const query = parseQuery(request, auditQuerySchema)
    const { page, pageSize, action, profileId, resource, resourceId, dateFrom, dateTo } = query

    const where: Record<string, unknown> = {}
    if (action) where.action = action
    if (profileId) where.profileId = profileId
    if (resource) where.resource = resource
    if (resourceId) where.resourceId = resourceId

    if (dateFrom || dateTo) {
      where.createdAt = {}
      if (dateFrom) (where.createdAt as Record<string, unknown>).gte = new Date(dateFrom)
      if (dateTo) (where.createdAt as Record<string, unknown>).lte = new Date(dateTo)
    }

    const [logs, total] = await Promise.all([
      db.auditLog.findMany({
        where,
        include: {
          profile: {
            select: {
              id: true,
              role: true,
              user: { select: { id: true, name: true, email: true } },
            },
          },
        },
        orderBy: [{ createdAt: 'desc' }],
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      db.auditLog.count({ where }),
    ])

    // Parse JSON details
    const parsedLogs = logs.map((log) => ({
      ...log,
      details: log.details ? JSON.parse(log.details) : null,
    }))

    // Get action summary
    const actionSummary = await db.auditLog.groupBy({
      by: ['action'],
      _count: true,
    })

    return paginatedResponse(
      {
        logs: parsedLogs,
        actionSummary: actionSummary.map((s) => ({
          action: s.action,
          count: s._count,
        })),
      },
      total,
      page,
      pageSize
    )
  } catch (error) {
    return handleApiError(error)
  }
}
