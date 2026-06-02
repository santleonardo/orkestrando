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

const updateStudentSchema = z.object({
  registrationNumber: z.string().optional(),
  phone: z.string().optional(),
  bio: z.string().optional(),
})

// ==================== GET /api/students/[id] ====================

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const student = await db.profile.findUnique({
      where: { id, role: 'STUDENT' },
      include: {
        user: { select: { id: true, name: true, email: true, avatarUrl: true, createdAt: true } },
        enrollments: {
          include: {
            class: {
              include: {
                subject: { select: { code: true, name: true, credits: true } },
                teacher: { select: { user: { select: { name: true } } } },
                semester: { select: { name: true, startDate: true, endDate: true } },
              },
            },
            _count: { select: { attendance: true } },
          },
          orderBy: [{ enrolledAt: 'desc' }],
        },
      },
    })

    if (!student) {
      throw new NotFoundError('Student', id)
    }

    // Compute summary stats
    const activeEnrollments = student.enrollments.filter((e) => e.status === 'ACTIVE')
    const totalCredits = activeEnrollments.reduce(
      (sum, e) => sum + e.class.subject.credits,
      0
    )

    return apiResponse({
      ...student,
      summary: {
        activeEnrollments: activeEnrollments.length,
        totalCredits,
      },
    })
  } catch (error) {
    return handleApiError(error)
  }
}

// ==================== PUT /api/students/[id] ====================

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const auth = getAuthProfile(request)
    const body = await parseBody(request, updateStudentSchema)

    const existing = await db.profile.findUnique({ where: { id, role: 'STUDENT' } })
    if (!existing) {
      throw new NotFoundError('Student', id)
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
      resource: 'Student',
      resourceId: id,
      request,
    })

    return apiResponse(updated)
  } catch (error) {
    return handleApiError(error)
  }
}
