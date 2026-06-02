import { NextRequest } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db'
import {
  parseBody,
  handleApiError,
  apiResponse,
  apiError,
  getAuthProfile,
} from '@/lib/api-utils'

// ==================== Schemas ====================

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  role: z.enum(['ADMIN', 'COORDINATOR', 'TEACHER', 'STUDENT']).default('STUDENT'),
  registrationNumber: z.string().optional(),
  phone: z.string().optional(),
})

const refreshSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
})

// ==================== POST /api/auth/login ====================

export async function POST(request: NextRequest) {
  try {
    const body = await parseBody(request, loginSchema)

    // Find user by email
    const user = await db.user.findUnique({
      where: { email: body.email },
      include: { profile: true },
    })

    if (!user) {
      return apiError('Invalid email or password', 401)
    }

    // PLACEHOLDER: In production, use bcrypt to compare hashed passwords
    // const isValidPassword = await bcrypt.compare(body.password, user.passwordHash)
    const isValidPassword = body.password === user.passwordHash || user.passwordHash === 'PLACEHOLDER'

    if (!isValidPassword) {
      return apiError('Invalid email or password', 401)
    }

    // PLACEHOLDER: Generate JWT tokens
    // const token = jwt.sign({ userId: user.id, profileId: user.profile?.id }, SECRET, { expiresIn: '1h' })
    // const refreshToken = jwt.sign({ userId: user.id }, SECRET, { expiresIn: '7d' })

    const token = `placeholder-token-${user.id}`
    const refreshToken = `placeholder-refresh-${user.id}`

    await db.auditLog.create({
      data: {
        action: 'LOGIN',
        profileId: user.profile?.id,
        resource: 'User',
        resourceId: user.id,
        ipAddress: request.headers.get('x-forwarded-for') || undefined,
        userAgent: request.headers.get('user-agent') || undefined,
      },
    })

    return apiResponse(
      {
        token,
        refreshToken,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          avatarUrl: user.avatarUrl,
          profile: user.profile
            ? {
                id: user.profile.id,
                role: user.profile.role,
                registrationNumber: user.profile.registrationNumber,
              }
            : null,
        },
      },
      200
    )
  } catch (error) {
    return handleApiError(error)
  }
}

// ==================== GET /api/auth/me ====================

export async function GET(request: NextRequest) {
  try {
    const profile = getAuthProfile(request)

    const user = await db.user.findUnique({
      where: { id: profile.userId },
      include: {
        profile: true,
      },
    })

    if (!user) {
      return apiError('User not found', 404)
    }

    return apiResponse({
      id: user.id,
      email: user.email,
      name: user.name,
      avatarUrl: user.avatarUrl,
      profile: user.profile
        ? {
            id: user.profile.id,
            role: user.profile.role,
            registrationNumber: user.profile.registrationNumber,
            phone: user.profile.phone,
            bio: user.profile.bio,
          }
        : null,
    })
  } catch (error) {
    return handleApiError(error)
  }
}
