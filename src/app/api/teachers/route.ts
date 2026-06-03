import { NextRequest } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db'
import {
  parseBody,
  parseQuery,
  handleApiError,
  apiResponse,
  apiError,
  paginatedResponse,
  getAuthProfile,
  createAuditLog,
  paginationSchema,
  searchSchema,
} from '@/lib/api-utils'

// ==================== Schemas ====================

const teachersQuerySchema = z.object({
  semesterId: z.string().optional(),
  subjectId: z.string().optional(),
  ...paginationSchema.shape,
  ...searchSchema.shape,
})

const createTeacherSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  registrationNumber: z.string().optional(),
  phone: z.string().optional(),
  bio: z.string().optional(),
})

const updateTeacherSchema = z.object({
  registrationNumber: z.string().optional(),
  phone: z.string().optional(),
  bio: z.string().optional(),
})

// ==================== GET /api/teachers ====================

export async function GET(request: NextRequest) {
  try {
    const query = parseQuery(request, teachersQuerySchema)
    const { page, pageSize, search, semesterId } = query

    const where: Record<string, unknown> = {
      role: 'TEACHER',
    }

    if (search) {
      where.user = {
        OR: [
          { name: { contains: search } },
          { email: { contains: search } },
        ],
      }
    }

    if (semesterId) {
      where.classes = {
        some: { semesterId },
      }
    }

    const [teachers, total] = await Promise.all([
      db.profile.findMany({
        where,
        include: {
          user: { select: { id: true, name: true, email: true, avatarUrl: true } },
          _count: { select: { classes: true, availability: true, subjectsTaught: true } },
        },
        orderBy: [{ createdAt: 'desc' }],
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      db.profile.count({ where }),
    ])

    return paginatedResponse(teachers, total, page, pageSize)
  } catch (error) {
    return handleApiError(error)
  }
}

// ==================== POST /api/teachers ====================

export async function POST(request: NextRequest) {
  try {
    const auth = getAuthProfile(request)
    requirePermission(auth, 'COORDINATOR')

    const body = await parseBody(request, createTeacherSchema)

    // Verify user exists
    const user = await db.user.findUnique({ where: { id: body.userId } })
    if (!user) {
      return apiError('User not found', 404)
    }

    // Check if profile already exists
    const existingProfile = await db.profile.findUnique({ where: { userId: body.userId } })
    if (existingProfile) {
      return apiError('This user already has a profile', 409)
    }

    const teacher = await db.profile.create({
      data: {
        userId: body.userId,
        role: 'TEACHER',
        registrationNumber: body.registrationNumber,
        phone: body.phone,
        bio: body.bio,
      },
      include: {
        user: { select: { id: true, name: true, email: true, avatarUrl: true } },
      },
    })

    await createAuditLog({
      action: 'CREATE',
      profileId: auth.id,
      resource: 'Teacher',
      resourceId: teacher.id,
      request,
    })

    return apiResponse(teacher, 201)
  } catch (error) {
    return handleApiError(error)
  }
}
