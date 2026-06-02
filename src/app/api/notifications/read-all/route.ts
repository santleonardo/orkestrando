import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import {
  handleApiError,
  apiResponse,
  getAuthProfile,
} from '@/lib/api-utils'

// ==================== PUT /api/notifications/read-all ====================

export async function PUT(request: NextRequest) {
  try {
    const auth = getAuthProfile(request)

    const result = await db.notification.updateMany({
      where: {
        profileId: auth.id,
        isRead: false,
      },
      data: { isRead: true },
    })

    return apiResponse({
      message: `Marked ${result.count} notifications as read`,
      count: result.count,
    })
  } catch (error) {
    return handleApiError(error)
  }
}
