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
} from '@/lib/api-utils'

// ==================== Schemas ====================

const enrollmentsQuerySchema = z.object({
  classId: z.string().optional(),
  studentId: z.string().optional(),
  status: z.enum(['ACTIVE', 'DROPPED', 'COMPLETED', 'FAILED']).optional(),
  ...paginationSchema.shape,
})

const createEnrollmentSchema = z.object({
  studentId: z.string().min(1, 'Student ID is required'),
  classId: z.string().min(1, 'Class ID is required'),
})

const updateEnrollmentSchema = z.object({
  status: z.enum(['ACTIVE', 'DROPPED', 'COMPLETED', 'FAILED']).optional(),
  grade: z.number().min(0).max(10).optional(),
})

// ==================== GET /api/enrollments ====================

export async function GET(request: NextRequest) {
  try {
    const query = parseQuery(request, enrollmentsQuerySchema)
    const { page, pageSize, classId, studentId, status } = query

    const where: Record<string, unknown> = {}
    if (classId) where.classId = classId
    if (studentId) where.studentId = studentId
    if (status) where.status = status

    const [enrollments, total] = await Promise.all([
      db.enrollment.findMany({
        where,
        include: {
          student: {
            select: { id: true, role: true, registrationNumber: true, user: { select: { id: true, name: true, email: true } } },
          },
          class: {
            select: {
              id: true, code: true, name: true,
              subject: { select: { id: true, code: true, name: true } },
              teacher: { select: { id: true, user: { select: { name: true } } } },
              semester: { select: { id: true, name: true } },
            },
          },
          _count: { select: { attendance: true } },
        },
        orderBy: [{ enrolledAt: 'desc' }],
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      db.enrollment.count({ where }),
    ])

    return paginatedResponse(enrollments, total, page, pageSize)
  } catch (error) {
    return handleApiError(error)
  }
}

// ==================== POST /api/enrollments ====================

export async function POST(request: NextRequest) {
  try {
    const auth = getAuthProfile(request)
    const body = await parseBody(request, createEnrollmentSchema)

    // Verify student exists
    const student = await db.profile.findUnique({ where: { id: body.studentId } })
    if (!student || student.role !== 'STUDENT') {
      return apiError('Student not found or invalid', 404)
    }

    // Verify class exists
    const classData = await db.class.findUnique({
      where: { id: body.classId },
      include: {
        _count: { select: { enrollments: true } },
      },
    })
    if (!classData) {
      return apiError('Class not found', 404)
    }

    // Check if class is active
    if (!classData.isActive) {
      return apiError('Cannot enroll in an inactive class', 400)
    }

    // Check if class has reached max students
    const activeEnrollments = await db.enrollment.count({
      where: { classId: body.classId, status: 'ACTIVE' },
    })
    if (activeEnrollments >= classData.maxStudents) {
      return apiError('Class has reached maximum student capacity', 400)
    }

    // Check if student is already enrolled (including dropped)
    const existingEnrollment = await db.enrollment.findUnique({
      where: {
        studentId_classId: {
          studentId: body.studentId,
          classId: body.classId,
        },
      },
    })

    if (existingEnrollment) {
      if (existingEnrollment.status === 'ACTIVE') {
        return apiError('Student is already enrolled in this class', 409)
      }
      // Re-activate dropped enrollment
      const reactivated = await db.enrollment.update({
        where: { id: existingEnrollment.id },
        data: {
          status: 'ACTIVE',
          droppedAt: null,
          completedAt: null,
        },
        include: {
          student: {
            select: { id: true, role: true, user: { select: { id: true, name: true } } },
          },
          class: {
            select: { id: true, code: true, name: true, subject: { select: { code: true, name: true } } },
          },
        },
      })

      return apiResponse(reactivated)
    }

    // Check for schedule conflicts with other active enrollments
    const studentEnrollments = await db.enrollment.findMany({
      where: {
        studentId: body.studentId,
        status: 'ACTIVE',
        class: { semesterId: classData.semesterId },
      },
      include: { class: { select: { id: true, schedule: true } } },
    })

    // Simple conflict check: if both classes have schedules set
    if (classData.schedule) {
      for (const enrollment of studentEnrollments) {
        if (enrollment.class.schedule && enrollment.class.schedule === classData.schedule) {
          return apiError('Schedule conflict with another enrolled class', 409)
        }
      }
    }

    // Create enrollment
    const enrollment = await db.enrollment.create({
      data: {
        studentId: body.studentId,
        classId: body.classId,
      },
      include: {
        student: {
          select: { id: true, role: true, registrationNumber: true, user: { select: { id: true, name: true, email: true } } },
        },
        class: {
          select: {
            id: true, code: true, name: true,
            subject: { select: { id: true, code: true, name: true } },
            teacher: { select: { id: true, user: { select: { name: true } } } },
            semester: { select: { id: true, name: true } },
          },
        },
      },
    })

    await createAuditLog({
      action: 'CREATE',
      profileId: auth.id,
      resource: 'Enrollment',
      resourceId: enrollment.id,
      request,
    })

    return apiResponse(enrollment, 201)
  } catch (error) {
    return handleApiError(error)
  }
}
