import { NextRequest } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db'
import {
  parseBody,
  handleApiError,
  apiResponse,
  NotFoundError,
  getAuthProfile,
  createAuditLog,
} from '@/lib/api-utils'

// ==================== Schema ====================

const updateTeacherSchema = z.object({
  registrationNumber: z.string().optional(),
  phone: z.string().optional(),
  bio: z.string().optional(),
})

// ==================== GET /api/teachers/[id] ====================

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const teacher = await db.profile.findUnique({
      where: { id, role: 'TEACHER' },
      include: {
        user: { select: { id: true, name: true, email: true, avatarUrl: true, createdAt: true } },
        subjectsTaught: {
          select: { id: true, code: true, name: true, credits: true },
        },
        classes: {
          include: {
            subject: { select: { code: true, name: true } },
            semester: { select: { name: true } },
            _count: { select: { enrollments: true, sessions: true } },
          },
          orderBy: [{ createdAt: 'desc' }],
        },
        teacherStats: {
          orderBy: { updatedAt: 'desc' },
          take: 5,
        },
        _count: { select: { classes: true, availability: true, subjectsTaught: true } },
      },
    })

    if (!teacher) {
      throw new NotFoundError('Teacher', id)
    }

    return apiResponse(teacher)
  } catch (error) {
    return handleApiError(error)
  }
}

// ==================== PUT /api/teachers/[id] ====================

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const auth = getAuthProfile(request)
    const body = await parseBody(request, updateTeacherSchema)

    const existing = await db.profile.findUnique({ where: { id, role: 'TEACHER' } })
    if (!existing) {
      throw new NotFoundError('Teacher', id)
    }

    const updated = await db.profile.update({
      where: { id },
      data: {
        registrationNumber: body.registrationNumber,
        phone: body.phone,
        bio: body.bio,
      },
      include: {
        user: { select: { id: true, name: true, email: true, avatarUrl: true } },
      },
    })

    await createAuditLog({
      action: 'UPDATE',
      profileId: auth.id,
      resource: 'Teacher',
      resourceId: id,
      request,
    })

    return apiResponse(updated)
  } catch (error) {
    return handleApiError(error)
  }
}
