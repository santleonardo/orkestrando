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

const reportsQuerySchema = z.object({
  type: z.enum(['ATTENDANCE', 'GRADES', 'SCHEDULE', 'ENROLLMENT', 'TEACHER_LOAD', 'ROOM_USAGE', 'CUSTOM']).optional(),
  generatedBy: z.string().optional(),
  ...paginationSchema.shape,
})

const createReportSchema = z.object({
  type: z.enum(['ATTENDANCE', 'GRADES', 'SCHEDULE', 'ENROLLMENT', 'TEACHER_LOAD', 'ROOM_USAGE', 'CUSTOM']),
  title: z.string().min(1, 'Report title is required'),
  parameters: z.record(z.unknown()).optional(),
})

// ==================== GET /api/reports ====================

export async function GET(request: NextRequest) {
  try {
    const auth = getAuthProfile(request)
    const query = parseQuery(request, reportsQuerySchema)
    const { page, pageSize, type, generatedBy } = query

    const where: Record<string, unknown> = {}
    if (type) where.type = type
    if (generatedBy) where.generatedBy = generatedBy

    // Non-admin users can only see their own reports
    if (auth.role !== 'ADMIN' && auth.role !== 'COORDINATOR') {
      where.generatedBy = auth.id
    }

    const [reports, total] = await Promise.all([
      db.report.findMany({
        where,
        include: {
          generator: {
            select: { id: true, role: true, profile: { select: { id: true, firstName: true, lastName: true, email: true } } },
          },
        },
        orderBy: [{ createdAt: 'desc' }],
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      db.report.count({ where }),
    ])

    return paginatedResponse(reports, total, page, pageSize)
  } catch (error) {
    return handleApiError(error)
  }
}

// ==================== POST /api/reports ====================

export async function POST(request: NextRequest) {
  try {
    const auth = getAuthProfile(request)
    const body = await parseBody(request, createReportSchema)

    // Generate report data based on type
    let resultData: Record<string, unknown> = {}

    switch (body.type) {
      case 'ATTENDANCE': {
        const params = (body.parameters || {}) as { classId?: string; dateFrom?: string; dateTo?: string }
        const attendanceWhere: Record<string, unknown> = {}
        if (params.classId) {
          attendanceWhere.classSession = { classId: params.classId }
        }

        const [present, absent, late, excused] = await Promise.all([
          db.attendance.count({ where: { ...attendanceWhere, status: 'PRESENT' } }),
          db.attendance.count({ where: { ...attendanceWhere, status: 'ABSENT' } }),
          db.attendance.count({ where: { ...attendanceWhere, status: 'LATE' } }),
          db.attendance.count({ where: { ...attendanceWhere, status: 'EXCUSED' } }),
        ])

        const total = present + absent + late + excused
        resultData = {
          summary: {
            total,
            present,
            absent,
            late,
            excused,
            attendanceRate: total > 0 ? Math.round(((present + late) / total) * 100) : 0,
          },
        }
        break
      }

      case 'GRADES': {
        const enrollments = await db.enrollment.findMany({
          where: { grade: { not: null } },
          select: { grade: true, status: true },
        })

        const grades = enrollments.map((e) => e.grade!).filter((g): g is number => g !== null)
        const avgGrade = grades.length > 0 ? grades.reduce((a, b) => a + b, 0) / grades.length : 0
        const passing = grades.filter((g) => g >= 5).length
        const failing = grades.filter((g) => g < 5).length

        resultData = {
          summary: {
            totalStudents: enrollments.length,
            averageGrade: Math.round(avgGrade * 100) / 100,
            passing,
            failing,
            passRate: grades.length > 0 ? Math.round((passing / grades.length) * 100) : 0,
          },
        }
        break
      }

      case 'ENROLLMENT': {
        const [active, dropped, completed, failed] = await Promise.all([
          db.enrollment.count({ where: { status: 'ACTIVE' } }),
          db.enrollment.count({ where: { status: 'DROPPED' } }),
          db.enrollment.count({ where: { status: 'COMPLETED' } }),
          db.enrollment.count({ where: { status: 'FAILED' } }),
        ])

        const totalClasses = await db.class.count()
        const totalStudents = await db.profile.count({ where: { role: 'STUDENT' } })

        resultData = {
          summary: {
            totalClasses,
            totalStudents,
            activeEnrollments: active,
            droppedEnrollments: dropped,
            completedEnrollments: completed,
            failedEnrollments: failed,
            avgStudentsPerClass: totalClasses > 0 ? Math.round(active / totalClasses) : 0,
          },
        }
        break
      }

      case 'TEACHER_LOAD': {
        const teachers = await db.profile.findMany({
          where: { role: 'TEACHER' },
          include: {
            _count: { select: { classes: true } },
          },
        })

        resultData = {
          summary: {
            totalTeachers: teachers.length,
            totalClasses: teachers.reduce((sum, t) => sum + t._count.classes, 0),
            avgClassesPerTeacher: teachers.length > 0
              ? Math.round((teachers.reduce((sum, t) => sum + t._count.classes, 0) / teachers.length) * 100) / 100
              : 0,
            teachers: teachers.map((t) => ({
              id: t.id,
              name: t.user?.name || 'Unknown',
              classCount: t._count.classes,
            })),
          },
        }
        break
      }

      case 'ROOM_USAGE': {
        const rooms = await db.room.findMany({
          include: {
            _count: { select: { classes: true } },
          },
        })

        resultData = {
          summary: {
            totalRooms: rooms.length,
            activeRooms: rooms.filter((r) => r.isActive).length,
            rooms: rooms.map((r) => ({
              id: r.id,
              name: r.name,
              code: r.code,
              capacity: r.capacity,
              type: r.type,
              isActive: r.isActive,
              classCount: r._count.classes,
            })),
          },
        }
        break
      }

      default: {
        resultData = { message: 'Custom report generated', parameters: body.parameters }
      }
    }

    const report = await db.report.create({
      data: {
        type: body.type,
        title: body.title,
        parameters: body.parameters ? JSON.stringify(body.parameters) : undefined,
        result: JSON.stringify(resultData),
        generatedBy: auth.id,
      },
      include: {
        generator: {
          select: { id: true, role: true, profile: { select: { id: true, firstName: true, lastName: true, email: true } } },
        },
      },
    })

    await createAuditLog({
      action: 'CREATE',
      profileId: auth.id,
      resource: 'Report',
      resourceId: report.id,
      request,
    })

    return apiResponse(report, 201)
  } catch (error) {
    return handleApiError(error)
  }
}
