import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import {
  handleApiError,
  apiResponse,
  NotFoundError,
} from '@/lib/api-utils'

// ==================== GET /api/teachers/[id]/stats ====================

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const teacher = await db.profile.findUnique({ where: { id, role: 'TEACHER' } })
    if (!teacher) {
      throw new NotFoundError('Teacher', id)
    }

    // Get basic stats
    const [totalClasses, totalStudents, sessions, avgGradeResult] = await Promise.all([
      db.class.count({ where: { teacherId: id } }),
      // Count unique students across all active enrollments
      db.enrollment.groupBy({
        by: ['studentId'],
        where: {
          class: { teacherId: id },
          status: 'ACTIVE',
        },
      }).then((groups) => groups.length),
      // Count total sessions for teacher's classes
      db.classSession.count({
        where: {
          class: { teacherId: id },
        },
      }),
      // Average grade
      db.enrollment.aggregate({
        where: {
          class: { teacherId: id },
          grade: { not: null },
        },
        _avg: { grade: true },
        _count: true,
      }),
    ])

    // Attendance stats
    const attendanceStats = await db.attendance.groupBy({
      by: ['status'],
      where: {
        classSession: { class: { teacherId: id } },
      },
      _count: true,
    })

    const attendanceSummary = {
      PRESENT: 0,
      ABSENT: 0,
      LATE: 0,
      EXCUSED: 0,
    }
    for (const stat of attendanceStats) {
      attendanceSummary[stat.status as keyof typeof attendanceSummary] = stat._count
    }
    const totalAttendance = Object.values(attendanceSummary).reduce((a, b) => a + b, 0)

    return apiResponse({
      teacherId: id,
      totalClasses,
      totalStudents,
      totalSessions: sessions,
      avgGrade: avgGradeResult._avg.grade
        ? Math.round(avgGradeResult._avg.grade * 100) / 100
        : 0,
      gradedStudents: avgGradeResult._count,
      attendanceSummary,
      attendanceRate:
        totalAttendance > 0
          ? Math.round(((attendanceSummary.PRESENT + attendanceSummary.LATE) / totalAttendance) * 100)
          : 0,
    })
  } catch (error) {
    return handleApiError(error)
  }
}
