import { NextRequest } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db'
import {
  parseQuery,
  handleApiError,
  apiResponse,
  paginatedResponse,
  getAuthProfile,
  paginationSchema,
} from '@/lib/api-utils'

// ==================== Schema ====================

const notificationsQuerySchema = z.object({
  isRead: z.coerce.boolean().optional(),
  type: z.enum(['INFO', 'WARNING', 'SUCCESS', 'ERROR']).optional(),
  ...paginationSchema.shape,
})

// ==================== GET /api/notifications ====================

export async function GET(request: NextRequest) {
  try {
    const auth = getAuthProfile(request)
    const query = parseQuery(request, notificationsQuerySchema)
    const { page, pageSize, isRead, type } = query

    const where: Record<string, unknown> = {
      profileId: auth.id,
    }
    if (isRead !== undefined) where.isRead = isRead
    if (type) where.type = type

    const [notifications, total] = await Promise.all([
      db.notification.findMany({
        where,
        orderBy: [{ createdAt: 'desc' }],
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      db.notification.count({ where }),
    ])

    // Count unread
    const unreadCount = await db.notification.count({
      where: { profileId: auth.id, isRead: false },
    })

    return paginatedResponse(
      { items: notifications, unreadCount },
      total,
      page,
      pageSize
    )
  } catch (error) {
    return handleApiError(error)
  }
}
