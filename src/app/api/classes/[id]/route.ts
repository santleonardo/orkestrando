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

// ==================== Schemas ====================

const updateClassSchema = z.object({
  code: z.string().min(1).optional(),
  name: z.string().min(1).optional(),
  subjectId: z.string().min(1).optional(),
  teacherId: z.string().min(1).optional(),
  semesterId: z.string().min(1).optional(),
  roomId: z.string().nullable().optional(),
  schedule: z.string().nullable().optional(),
  maxStudents: z.number().int().min(1).optional(),
  isActive: z.boolean().optional(),
})

// ==================== GET /api/classes/[id] ====================

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const classData = await db.class.findUnique({
      where: { id },
      include: {
        subject: { select: { id: true, code: true, name: true, credits: true, workload: true, description: true } },
        teacher: {
          select: { id: true, role: true, registrationNumber: true, user: { select: { id: true, name: true, email: true, avatarUrl: true } } },
        },
        semester: { select: { id: true, name: true, startDate: true, endDate: true, isActive: true } },
        room: { select: { id: true, name: true, code: true, capacity: true, type: true, location: true } },
        enrollments: {
          where: { status: 'ACTIVE' },
          include: {
            student: {
              select: { id: true, role: true, registrationNumber: true, user: { select: { id: true, name: true, email: true } } },
            },
          },
          take: 50,
        },
        sessions: {
          orderBy: { date: 'desc' },
          take: 20,
          include: {
            room: { select: { id: true, name: true, code: true } },
            _count: { select: { attendance: true } },
          },
        },
        materials: {
          orderBy: { createdAt: 'desc' },
          take: 20,
        },
        _count: { select: { enrollments: true, sessions: true, materials: true } },
      },
    })

    if (!classData) {
      throw new NotFoundError('Class', id)
    }

    return apiResponse(classData)
  } catch (error) {
    return handleApiError(error)
  }
}

// ==================== PUT /api/classes/[id] ====================

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const auth = getAuthProfile(request)
    requirePermission(auth, 'COORDINATOR')

    const body = await parseBody(request, updateClassSchema)

    // Check if class exists
    const existing = await db.class.findUnique({ where: { id } })
    if (!existing) {
      throw new NotFoundError('Class', id)
    }

    // Verify references if changed
    if (body.subjectId) {
      const subject = await db.subject.findUnique({ where: { id: body.subjectId } })
      if (!subject) return apiError('Subject not found', 404)
    }
    if (body.teacherId) {
      const teacher = await db.profile.findUnique({ where: { id: body.teacherId } })
      if (!teacher || teacher.role !== 'TEACHER') return apiError('Teacher not found or invalid', 404)
    }
    if (body.semesterId) {
      const semester = await db.semester.findUnique({ where: { id: body.semesterId } })
      if (!semester) return apiError('Semester not found', 404)
    }
    if (body.roomId) {
      const room = await db.room.findUnique({ where: { id: body.roomId } })
      if (!room) return apiError('Room not found', 404)
    }

    // Check for duplicate code if changing code
    if (body.code && body.code !== existing.code) {
      const duplicate = await db.class.findUnique({ where: { code: body.code } })
      if (duplicate) return apiError('A class with this code already exists', 409)
    }

    const updated = await db.class.update({
      where: { id },
      data: {
        code: body.code,
        name: body.name,
        subjectId: body.subjectId,
        teacherId: body.teacherId,
        semesterId: body.semesterId,
        roomId: body.roomId,
        schedule: body.schedule,
        maxStudents: body.maxStudents,
        isActive: body.isActive,
      },
      include: {
        subject: { select: { id: true, code: true, name: true, credits: true } },
        teacher: {
          select: { id: true, role: true, user: { select: { id: true, name: true, email: true } } },
        },
        semester: { select: { id: true, name: true } },
        room: { select: { id: true, name: true, code: true, capacity: true } },
      },
    })

    await createAuditLog({
      action: 'UPDATE',
      profileId: auth.id,
      resource: 'Class',
      resourceId: id,
      request,
    })

    return apiResponse(updated)
  } catch (error) {
    return handleApiError(error)
  }
}

// ==================== DELETE /api/classes/[id] ====================

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const auth = getAuthProfile(request)
    requirePermission(auth, 'COORDINATOR')

    // Check if class exists
    const existing = await db.class.findUnique({
      where: { id },
      include: { _count: { select: { enrollments: true, sessions: true } } },
    })
    if (!existing) {
      throw new NotFoundError('Class', id)
    }

    // Prevent deletion if there are active enrollments
    if (existing._count.enrollments > 0) {
      return apiError(
        'Cannot delete class with existing enrollments. Deactivate it instead.',
        400
      )
    }

    await db.class.delete({ where: { id } })

    await createAuditLog({
      action: 'DELETE',
      profileId: auth.id,
      resource: 'Class',
      resourceId: id,
      request,
    })

    return apiResponse({ message: 'Class deleted successfully' })
  } catch (error) {
    return handleApiError(error)
  }
}
