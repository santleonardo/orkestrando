import { NextRequest } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db'
import {
  parseBody,
  handleApiError,
  apiResponse,
  apiError,
} from '@/lib/api-utils'

// ==================== Schema ====================

const refreshSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
})

// ==================== POST /api/auth/refresh ====================

export async function POST(request: NextRequest) {
  try {
    const body = await parseBody(request, refreshSchema)

    // PLACEHOLDER: In production, verify the refresh token JWT
    // const payload = jwt.verify(body.refreshToken, SECRET)
    // const user = await db.user.findUnique({ where: { id: payload.userId } })

    // For now, extract user ID from placeholder token format
    const userId = body.refreshToken.replace('placeholder-refresh-', '')

    const user = await db.user.findUnique({
      where: { id: userId },
      include: { profile: true },
    })

    if (!user) {
      return apiError('Invalid refresh token', 401)
    }

    // PLACEHOLDER: Generate new JWT tokens
    const newToken = `placeholder-token-${user.id}`
    const newRefreshToken = `placeholder-refresh-${user.id}`

    return apiResponse({
      token: newToken,
      refreshToken: newRefreshToken,
    })
  } catch (error) {
    return handleApiError(error)
  }
}
