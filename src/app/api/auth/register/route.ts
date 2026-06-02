import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db'
import { parseBody, handleApiError, createAuditLog } from '@/lib/api-utils'

// Role values must match the Prisma `Role` enum exactly
const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  role: z
    .enum(['SUPER_ADMIN', 'COORDINATOR', 'PROFESSOR', 'STUDENT', 'ASSISTANT'])
    .default('STUDENT'),
  registrationNumber: z.string().optional(),
  phone: z.string().optional(),
})

// ==================== POST /api/auth/register ====================

export async function POST(request: NextRequest) {
  try {
    const body = await parseBody(request, registerSchema)

    const existingUser = await db.user.findUnique({
      where: { email: body.email },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'A user with this email already exists' },
        { status: 409 }
      )
    }

    // PLACEHOLDER: hash with bcrypt in production
    const passwordHash = 'PLACEHOLDER'

    const result = await db.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: { email: body.email, passwordHash, name: body.name },
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

    // PLACEHOLDER: replace with real JWT in production
    const accessToken = `placeholder-token-${result.user.id}`
    const refreshToken = `placeholder-refresh-${result.user.id}`

    return NextResponse.json(
      {
        user: {
          id: result.user.id,
          email: result.user.email,
          name: result.user.name,
          role: result.profile.role,
          profile: {
            id: result.profile.id,
            role: result.profile.role,
            registrationNumber: result.profile.registrationNumber,
          },
        },
        tokens: {
          accessToken,
          refreshToken,
          expiresIn: 86400,
        },
      },
      { status: 201 }
    )
  } catch (error) {
    return handleApiError(error)
  }
}
