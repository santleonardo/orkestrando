import { NextRequest } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db'
import {
  parseBody,
  handleApiError,
  apiResponse,
  apiError,
  getAuthProfile,
  createAuditLog,
} from '@/lib/api-utils'

// ==================== POST /api/ai/report ====================

export async function POST(request: NextRequest) {
  try {
    const auth = getAuthProfile(request)
    const body = await parseBody(request, z.object({
      type: z.enum(['attendance', 'grades', 'enrollment', 'teacher_performance', 'risk_analysis', 'comprehensive']),
      semesterId: z.string().optional(),
      classId: z.string().optional(),
      teacherId: z.string().optional(),
      studentId: z.string().optional(),
      dateFrom: z.string().optional(),
      dateTo: z.string().optional(),
      format: z.enum(['json', 'summary']).default('json'),
    }))

    // PLACEHOLDER: In production, integrate with AI/LLM for intelligent report generation
    // For now, generate comprehensive data-driven reports

    const reportData: Record<string, unknown> = {
      generatedAt: new Date().toISOString(),
      generatedBy: auth.id,
      parameters: body,
    }

    switch (body.type) {
      case 'attendance': {
        const attendanceWhere: Record<string, unknown> = {}
        if (body.classId) attendanceWhere.enrollment = { classId: body.classId }
        if (body.studentId) attendanceWhere.enrollment = { ...(attendanceWhere.enrollment as Record<string, unknown>), studentId: body.studentId }
        if (body.dateFrom || body.dateTo) {
          attendanceWhere.classSession = {}
          if (body.dateFrom) (attendanceWhere.classSession as Record<string, unknown>).date = { ...(attendanceWhere.classSession as any)?.date, gte: new Date(body.dateFrom) }
          if (body.dateTo) (attendanceWhere.classSession as Record<string, unknown>).date = { ...(attendanceWhere.classSession as any)?.date, lte: new Date(body.dateTo) }
        }

        const [total, present, absent, late, excused] = await Promise.all([
          db.attendance.count({ where: attendanceWhere }),
          db.attendance.count({ where: { ...attendanceWhere, status: 'PRESENT' } }),
          db.attendance.count({ where: { ...attendanceWhere, status: 'ABSENT' } }),
          db.attendance.count({ where: { ...attendanceWhere, status: 'LATE' } }),
          db.attendance.count({ where: { ...attendanceWhere, status: 'EXCUSED' } }),
        ])

        // Get top absentees
        const topAbsentees = await db.attendance.groupBy({
          by: ['enrollmentId'],
          where: { ...attendanceWhere, status: 'ABSENT' },
          _count: { id: true },
          orderBy: { _count: { id: 'desc' } },
          take: 10,
        })

        // Get weekly trend
        const sessionsByDate = await db.classSession.findMany({
          select: {
            date: true,
            _count: { select: { attendance: true } },
          },
          orderBy: { date: 'asc' },
          take: 30,
        })

        reportData.attendance = {
          summary: {
            totalRecords: total,
            presentCount: present,
            absentCount: absent,
            lateCount: late,
            excusedCount: excused,
            attendanceRate: total > 0 ? Math.round(((present + late) / total) * 100) : 0,
          },
          topAbsentees: topAbsentees.map((a) => ({ enrollmentId: a.enrollmentId, absences: a._count.id })),
          weeklyTrend: sessionsByDate.map((s) => ({
            date: s.date.toISOString().split('T')[0],
            totalAttendance: s._count.attendance,
          })),
        }
        break
      }

      case 'grades': {
        const gradeWhere: Record<string, unknown> = { grade: { not: null } }
        if (body.classId) gradeWhere.classId = body.classId
        if (body.studentId) gradeWhere.studentId = body.studentId

        const gradeStats = await db.enrollment.aggregate({
          where: gradeWhere as any,
          _avg: { grade: true },
          _min: { grade: true },
          _max: { grade: true },
          _count: true,
        })

        const distribution = await db.enrollment.groupBy({
          by: ['status'],
          where: gradeWhere as any,
          _count: true,
          _avg: { grade: true },
        })

        reportData.grades = {
          summary: {
            totalGraded: gradeStats._count,
            average: gradeStats._avg.grade ? Math.round(gradeStats._avg.grade * 100) / 100 : 0,
            min: gradeStats._min.grade,
            max: gradeStats._max.grade,
          },
          distribution: distribution.map((d) => ({
            status: d.status,
            count: d._count,
            averageGrade: d._avg.grade ? Math.round(d._avg.grade * 100) / 100 : 0,
          })),
        }
        break
      }

      case 'teacher_performance': {
        const teachers = await db.profile.findMany({
          where: { role: 'TEACHER' },
          include: {
            _count: { select: { classes: true } },
            classes: {
              include: {
                enrollments: {
                  where: { status: 'ACTIVE' },
                  select: { studentId: true },
                },
                sessions: { select: { id: true } },
              },
            },
          },
        })

        reportData.teacherPerformance = {
          totalTeachers: teachers.length,
          teachers: await Promise.all(
            teachers.slice(0, 20).map(async (t) => {
              const classIds = t.classes.map((c) => c.id)
              const totalStudents = new Set(t.classes.flatMap((c) => c.enrollments.map((e) => e.studentId))).size
              const totalSessions = t.classes.reduce((sum, c) => sum + c.sessions.length, 0)

              const avgAttendance = classIds.length > 0
                ? await db.attendance.groupBy({
                    by: ['status'],
                    where: { classSession: { classId: { in: classIds } } },
                    _count: true,
                  }).then((stats) => {
                    const total = stats.reduce((s, st) => s + st._count, 0)
                    const present = stats.find((s) => s.status === 'PRESENT')?._count || 0
                    return total > 0 ? Math.round((present / total) * 100) : 0
                  })
                : 0

              return {
                name: t.user?.name || 'Unknown',
                classCount: t._count.classes,
                totalStudents,
                totalSessions,
                avgAttendance,
              }
            })
          ),
        }
        break
      }

      case 'comprehensive': {
        const [totalStudents, totalTeachers, totalClasses, totalSessions, activeEnrollments] =
          await Promise.all([
            db.profile.count({ where: { role: 'STUDENT' } }),
            db.profile.count({ where: { role: 'TEACHER' } }),
            db.class.count({ where: { isActive: true } }),
            db.classSession.count(),
            db.enrollment.count({ where: { status: 'ACTIVE' } }),
          ])

        const attendanceOverview = await db.attendance.groupBy({
          by: ['status'],
          _count: true,
        })

        reportData.comprehensive = {
          overview: {
            totalStudents,
            totalTeachers,
            totalClasses,
            totalSessions,
            activeEnrollments,
            avgStudentsPerClass: totalClasses > 0 ? Math.round(activeEnrollments / totalClasses) : 0,
          },
          attendanceOverview: attendanceOverview.map((a) => ({
            status: a.status,
            count: a._count,
          })),
        }
        break
      }

      default: {
        reportData.message = 'Report type not implemented'
      }
    }

    // Save report to database
    const report = await db.report.create({
      data: {
        type: 'CUSTOM',
        title: `AI Report: ${body.type}`,
        parameters: JSON.stringify(body),
        result: JSON.stringify(reportData),
        generatedBy: auth.id,
      },
    })

    await createAuditLog({
      action: 'CREATE',
      profileId: auth.id,
      resource: 'Report',
      resourceId: report.id,
      request,
    })

    return apiResponse({
      reportId: report.id,
      ...reportData,
    })
  } catch (error) {
    return handleApiError(error)
  }
}
