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
  requirePermission,
  createAuditLog,
  paginationSchema,
  searchSchema,
} from '@/lib/api-utils'

// ==================== Schemas ====================

const studentsQuerySchema = z.object({
  semesterId: z.string().optional(),
  classId: z.string().optional(),
  ...paginationSchema.shape,
  ...searchSchema.shape,
})

const createStudentSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  registrationNumber: z.string().optional(),
  phone: z.string().optional(),
  bio: z.string().optional(),
})

const updateStudentSchema = z.object({
  registrationNumber: z.string().optional(),
  phone: z.string().optional(),
  bio: z.string().optional(),
})

// ==================== GET /api/students ====================

export async function GET(request: NextRequest) {
  try {
    const query = parseQuery(request, studentsQuerySchema)
    const { page, pageSize, search, semesterId, classId } = query

    const where: Record<string, unknown> = {
      role: 'STUDENT',
    }

    if (search) {
      where.user = {
        OR: [
          { name: { contains: search } },
          { email: { contains: search } },
        ],
      }
    }

    if (classId) {
      where.enrollments = {
        some: { classId },
      }
    } else if (semesterId) {
      where.enrollments = {
        some: { class: { semesterId } },
      }
    }

    const [students, total] = await Promise.all([
      db.profile.findMany({
        where,
        include: {
          user: { select: { id: true, name: true, email: true, avatarUrl: true } },
          enrollments: {
            where: classId ? { classId } : semesterId ? { class: { semesterId } } : undefined,
            include: {
              class: {
                select: {
                  id: true, code: true, name: true,
                  subject: { select: { code: true, name: true } },
                },
              },
            },
          },
        },
        orderBy: [{ createdAt: 'desc' }],
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      db.profile.count({ where }),
    ])

    return paginatedResponse(students, total, page, pageSize)
  } catch (error) {
    return handleApiError(error)
  }
}

// ==================== POST /api/students ====================

export async function POST(request: NextRequest) {
  try {
    const auth = getAuthProfile(request)
    requirePermission(auth, 'COORDINATOR')

    const body = await parseBody(request, createStudentSchema)

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

    const student = await db.profile.create({
      data: {
        userId: body.userId,
        role: 'STUDENT',
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
      resource: 'Student',
      resourceId: student.id,
      request,
    })

    return apiResponse(student, 201)
  } catch (error) {
    return handleApiError(error)
  }
}
