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
  createAuditLog,
} from '@/lib/api-utils'

// ==================== Schemas ====================

const updateEnrollmentSchema = z.object({
  status: z.enum(['ACTIVE', 'DROPPED', 'COMPLETED', 'FAILED']).optional(),
  grade: z.number().min(0).max(10).optional(),
})

// ==================== GET /api/enrollments/[id] ====================

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const enrollment = await db.enrollment.findUnique({
      where: { id },
      include: {
        student: {
          select: {
            id: true, role: true, registrationNumber: true, phone: true,
            user: { select: { id: true, name: true, email: true, avatarUrl: true } },
          },
        },
        class: {
          include: {
            subject: { select: { id: true, code: true, name: true, credits: true } },
            teacher: {
              select: { id: true, profile: { select: { id: true, firstName: true, lastName: true, email: true } } },
            },
            semester: { select: { id: true, name: true, startDate: true, endDate: true } },
            room: { select: { id: true, name: true, code: true } },
          },
        },
        attendance: {
          include: {
            classSession: {
              select: { id: true, date: true, startTime: true, endTime: true, topic: true },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    })

    if (!enrollment) {
      throw new NotFoundError('Enrollment', id)
    }

    // Compute attendance statistics
    const attendanceRecords = enrollment.attendance
    const totalSessions = attendanceRecords.length
    const presentCount = attendanceRecords.filter((a) => a.status === 'PRESENT').length
    const absentCount = attendanceRecords.filter((a) => a.status === 'ABSENT').length
    const lateCount = attendanceRecords.filter((a) => a.status === 'LATE').length
    const excusedCount = attendanceRecords.filter((a) => a.status === 'EXCUSED').length

    return apiResponse({
      ...enrollment,
      attendanceStats: {
        totalSessions,
        presentCount,
        absentCount,
        lateCount,
        excusedCount,
        attendanceRate: totalSessions > 0 ? Math.round((presentCount / totalSessions) * 100) : 0,
      },
    })
  } catch (error) {
    return handleApiError(error)
  }
}

// ==================== PUT /api/enrollments/[id] ====================

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const auth = getAuthProfile(request)
    const body = await parseBody(request, updateEnrollmentSchema)

    // Check if enrollment exists
    const existing = await db.enrollment.findUnique({
      where: { id },
      include: { class: { select: { id: true, code: true, name: true } } },
    })
    if (!existing) {
      throw new NotFoundError('Enrollment', id)
    }

    const updateData: Record<string, unknown> = {}

    if (body.status !== undefined) {
      updateData.status = body.status
      if (body.status === 'DROPPED') {
        updateData.droppedAt = new Date()
      }
      if (body.status === 'COMPLETED' || body.status === 'FAILED') {
        updateData.completedAt = new Date()
      }
    }

    if (body.grade !== undefined) {
      updateData.grade = body.grade
    }

    const updated = await db.enrollment.update({
      where: { id },
      data: updateData,
      include: {
        student: {
          select: { id: true, role: true, profile: { select: { id: true, firstName: true, lastName: true, email: true } } },
        },
        class: {
          select: {
            id: true, code: true, name: true,
            subject: { select: { id: true, code: true, name: true } },
          },
        },
      },
    })

    await createAuditLog({
      action: 'UPDATE',
      profileId: auth.id,
      resource: 'Enrollment',
      resourceId: id,
      details: body,
      request,
    })

    return apiResponse(updated)
  } catch (error) {
    return handleApiError(error)
  }
}
