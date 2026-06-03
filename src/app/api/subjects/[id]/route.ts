import { NextRequest } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db'
import {
  parseBody,
  handleApiError,
  apiResponse,
  apiError,
  NotFoundError,
  getAuthProfile,
  requirePermission,
  createAuditLog,
} from '@/lib/api-utils'

// ==================== Schema ====================

const updateSubjectSchema = z.object({
  code: z.string().min(1).optional(),
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  credits: z.number().int().min(1).optional(),
  workload: z.number().int().min(1).optional(),
  semesterId: z.string().nullable().optional(),
  teacherId: z.string().nullable().optional(),
})

// ==================== GET /api/subjects/[id] ====================

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const subject = await db.subject.findUnique({
      where: { id },
      include: {
        teacher: {
          select: {
            id: true, role: true, registrationNumber: true,
            user: { select: { id: true, name: true, email: true, avatarUrl: true } },
          },
        },
        semester: { select: { id: true, name: true, startDate: true, endDate: true, isActive: true } },
        classes: {
          include: {
            teacher: { select: { profile: { select: { firstName: true, lastName: true } } } },
            semester: { select: { name: true } },
            _count: { select: { enrollments: true, sessions: true } },
          },
          orderBy: [{ createdAt: 'desc' }],
        },
        materials: {
          orderBy: { createdAt: 'desc' },
          take: 20,
        },
        _count: { select: { classes: true, materials: true } },
      },
    })

    if (!subject) {
      throw new NotFoundError('Subject', id)
    }

    return apiResponse(subject)
  } catch (error) {
    return handleApiError(error)
  }
}

// ==================== PUT /api/subjects/[id] ====================

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const auth = getAuthProfile(request)
    requirePermission(auth, 'COORDINATOR')

    const body = await parseBody(request, updateSubjectSchema)

    const existing = await db.subject.findUnique({ where: { id } })
    if (!existing) {
      throw new NotFoundError('Subject', id)
    }

    // Check for duplicate code if changing
    if (body.code && body.code !== existing.code) {
      const duplicate = await db.subject.findUnique({ where: { code: body.code } })
      if (duplicate) return apiError('A subject with this code already exists', 409)
    }

    // Verify semester if changing
    if (body.semesterId) {
      const semester = await db.semester.findUnique({ where: { id: body.semesterId } })
      if (!semester) return apiError('Semester not found', 404)
    }

    // Verify teacher if changing
    if (body.teacherId) {
      const teacher = await db.profile.findUnique({ where: { id: body.teacherId } })
      if (!teacher || teacher.role !== 'TEACHER') return apiError('Teacher not found or invalid', 404)
    }

    const updated = await db.subject.update({
      where: { id },
      data: {
        code: body.code,
        name: body.name,
        description: body.description,
        credits: body.credits,
        workload: body.workload,
        semesterId: body.semesterId,
        teacherId: body.teacherId,
      },
      include: {
        teacher: {
          select: { id: true, role: true, profile: { select: { id: true, firstName: true, lastName: true, email: true } } },
        },
        semester: { select: { id: true, name: true } },
        _count: { select: { classes: true, materials: true } },
      },
    })

    await createAuditLog({
      action: 'UPDATE',
      profileId: auth.id,
      resource: 'Subject',
      resourceId: id,
      request,
    })

    return apiResponse(updated)
  } catch (error) {
    return handleApiError(error)
  }
}

// ==================== DELETE /api/subjects/[id] ====================

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const auth = getAuthProfile(request)
    requirePermission(auth, 'ADMIN')

    const existing = await db.subject.findUnique({
      where: { id },
      include: { _count: { select: { classes: true } } },
    })
    if (!existing) {
      throw new NotFoundError('Subject', id)
    }

    if (existing._count.classes > 0) {
      return apiError('Cannot delete subject with existing classes', 400)
    }

    await db.subject.delete({ where: { id } })

    await createAuditLog({
      action: 'DELETE',
      profileId: auth.id,
      resource: 'Subject',
      resourceId: id,
      request,
    })

    return apiResponse({ message: 'Subject deleted successfully' })
  } catch (error) {
    return handleApiError(error)
  }
}
