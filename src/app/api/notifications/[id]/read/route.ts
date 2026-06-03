import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import {
  handleApiError,
  apiResponse,
  NotFoundError,
  getAuthProfile,
} from '@/lib/api-utils'

// ==================== PUT /api/notifications/[id]/read ====================

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const auth = getAuthProfile(request)

    const notification = await db.notification.findUnique({ where: { id } })
    if (!notification) {
      throw new NotFoundError('Notification', id)
    }

    if (notification.profileId !== auth.id) {
      return apiError('This notification does not belong to you', 403)
    }

    const updated = await db.notification.update({
      where: { id },
      data: { isRead: true },
    })

    return apiResponse(updated)
  } catch (error) {
    return handleApiError(error)
  }
}
