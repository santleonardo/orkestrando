import { NextRequest } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db'
import {
  parseBody,
  handleApiError,
  apiResponse,
  apiError,
  createAuditLog,
} from '@/lib/api-utils'

// ==================== Schemas ====================

const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  role: z.enum(['ADMIN', 'COORDINATOR', 'TEACHER', 'STUDENT']).default('STUDENT'),
  registrationNumber: z.string().optional(),
  phone: z.string().optional(),
})

// ==================== POST /api/auth/register ====================

export async function POST(request: NextRequest) {
  try {
    const body = await parseBody(request, registerSchema)

    // Check if email already exists
    const existingUser = await db.user.findUnique({
      where: { email: body.email },
    })

    if (existingUser) {
      return apiError('A user with this email already exists', 409)
    }

    // PLACEHOLDER: Hash password with bcrypt in production
    // const passwordHash = await bcrypt.hash(body.password, 10)
    const passwordHash = 'PLACEHOLDER'

    // Create user and profile in a transaction
    const result = await db.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: body.email,
          passwordHash,
          name: body.name,
        },
      })

      const profile = await tx.profile.create({
        data: {
          userId: user.id,
          role: body.role,
          registrationNumber: body.registrationNumber,
          phone: body.phone,
        },
      })

      return { user, profile }
    })

    await createAuditLog({
      action: 'CREATE',
      profileId: result.profile.id,
      resource: 'User',
      resourceId: result.user.id,
      request,
    })

    // PLACEHOLDER: Generate JWT tokens
    const token = `placeholder-token-${result.user.id}`
    const refreshToken = `placeholder-refresh-${result.user.id}`

    return apiResponse(
      {
        token,
        refreshToken,
        user: {
          id: result.user.id,
          email: result.user.email,
          name: result.user.name,
          profile: {
            id: result.profile.id,
            role: result.profile.role,
            registrationNumber: result.profile.registrationNumber,
          },
        },
      },
      201
    )
  } catch (error) {
    return handleApiError(error)
  }
}
