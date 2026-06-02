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

const attendanceQuerySchema = z.object({
  classSessionId: z.string().optional(),
  studentId: z.string().optional(),
  status: z.enum(['PRESENT', 'ABSENT', 'LATE', 'EXCUSED']).optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  ...paginationSchema.shape,
})

const createBulkAttendanceSchema = z.object({
  classSessionId: z.string().min(1, 'Class session ID is required'),
  records: z.array(
    z.object({
      enrollmentId: z.string().min(1, 'Enrollment ID is required'),
      status: z.enum(['PRESENT', 'ABSENT', 'LATE', 'EXCUSED']),
      notes: z.string().optional(),
    })
  ).min(1, 'At least one attendance record is required'),
})

// ==================== GET /api/attendance ====================

export async function GET(request: NextRequest) {
  try {
    const query = parseQuery(request, attendanceQuerySchema)
    const { page, pageSize, classSessionId, studentId, status, dateFrom, dateTo } = query

    const where: Record<string, unknown> = {}
    if (classSessionId) where.classSessionId = classSessionId
    if (status) where.status = status

    if (dateFrom || dateTo) {
      where.classSession = {}
      if (dateFrom) {
        (where.classSession as Record<string, unknown>).date = { ...(where.classSession as any)?.date, gte: new Date(dateFrom) }
      }
      if (dateTo) {
        (where.classSession as Record<string, unknown>).date = { ...(where.classSession as any)?.date, lte: new Date(dateTo) }
      }
    }

    // If studentId is provided, filter by enrollment's studentId
    if (studentId) {
      where.enrollment = { studentId }
    }

    const [attendance, total] = await Promise.all([
      db.attendance.findMany({
        where,
        include: {
          enrollment: {
            include: {
              student: {
                select: { id: true, role: true, registrationNumber: true, user: { select: { id: true, name: true, email: true } } },
              },
              class: {
                select: { id: true, code: true, name: true, subject: { select: { code: true, name: true } } },
              },
            },
          },
          classSession: {
            select: { id: true, date: true, startTime: true, endTime: true, topic: true },
          },
        },
        orderBy: [{ createdAt: 'desc' }],
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      db.attendance.count({ where }),
    ])

    return paginatedResponse(attendance, total, page, pageSize)
  } catch (error) {
    return handleApiError(error)
  }
}

// ==================== POST /api/attendance ====================

export async function POST(request: NextRequest) {
  try {
    const auth = getAuthProfile(request)
    const body = await parseBody(request, createBulkAttendanceSchema)

    // Verify class session exists
    const session = await db.classSession.findUnique({
      where: { id: body.classSessionId },
      include: {
        class: { select: { id: true, code: true, name: true, teacherId: true } },
      },
    })
    if (!session) {
      return apiError('Class session not found', 404)
    }

    // Verify all enrollment IDs belong to this class
    const enrollments = await db.enrollment.findMany({
      where: {
        id: { in: body.records.map((r) => r.enrollmentId) },
        classId: session.class.id,
      },
    })
    if (enrollments.length !== body.records.length) {
      return apiError('One or more enrollment records do not belong to this class session', 400)
    }

    // Create attendance records in a transaction
    const results = await db.$transaction(
      body.records.map((record) =>
        db.attendance.upsert({
          where: {
            enrollmentId_classSessionId: {
              enrollmentId: record.enrollmentId,
              classSessionId: body.classSessionId,
            },
          },
          create: {
            enrollmentId: record.enrollmentId,
            classSessionId: body.classSessionId,
            status: record.status,
            notes: record.notes,
          },
          update: {
            status: record.status,
            notes: record.notes,
          },
        })
      )
    )

    await createAuditLog({
      action: 'CREATE',
      profileId: auth.id,
      resource: 'Attendance',
      resourceId: body.classSessionId,
      details: { recordCount: body.records.length },
      request,
    })

    return apiResponse(
      {
        message: `Attendance registered for ${results.length} students`,
        records: results,
      },
      201
    )
  } catch (error) {
    return handleApiError(error)
  }
}
