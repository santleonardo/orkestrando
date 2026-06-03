import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import {
  handleApiError,
  apiResponse,
  NotFoundError,
} from '@/lib/api-utils'

// ==================== GET /api/students/[id]/attendance ====================

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { searchParams } = new URL(request.url)
    const classId = searchParams.get('classId')
    const dateFrom = searchParams.get('dateFrom')
    const dateTo = searchParams.get('dateTo')

    // Verify student exists
    const student = await db.profile.findUnique({ where: { id, role: 'STUDENT' } })
    if (!student) {
      throw new NotFoundError('Student', id)
    }

    // Build attendance query
    const where: Record<string, unknown> = {
      enrollment: { studentId: id },
    }

    if (classId) {
      where.enrollment = { ...where.enrollment, classId }
    }

    if (dateFrom || dateTo) {
      where.classSession = {}
      if (dateFrom) (where.classSession as Record<string, unknown>).date = { ...(where.classSession as any)?.date, gte: new Date(dateFrom) }
      if (dateTo) (where.classSession as Record<string, unknown>).date = { ...(where.classSession as any)?.date, lte: new Date(dateTo) }
    }

    const attendanceRecords = await db.attendance.findMany({
      where,
      include: {
        classSession: {
          include: {
            class: {
              select: {
                id: true, code: true, name: true,
                subject: { select: { code: true, name: true } },
                teacher: { select: { profile: { select: { firstName: true, lastName: true } } } },
              },
            },
          },
        },
        enrollment: {
          select: {
            class: { select: { id: true, code: true, subject: { select: { code: true, name: true } } } },
          },
        },
      },
      orderBy: [{ classSession: { date: 'asc' } }, { classSession: { startTime: 'asc' } }],
    })

    // Compute statistics
    const totalRecords = attendanceRecords.length
    const presentCount = attendanceRecords.filter((a) => a.status === 'PRESENT').length
    const absentCount = attendanceRecords.filter((a) => a.status === 'ABSENT').length
    const lateCount = attendanceRecords.filter((a) => a.status === 'LATE').length
    const excusedCount = attendanceRecords.filter((a) => a.status === 'EXCUSED').length

    // Group by class
    const byClass: Record<string, { className: string; subjectName: string; total: number; present: number; absent: number; late: number; excused: number; rate: number }> = {}
    for (const record of attendanceRecords) {
      const classKey = record.enrollment.class.id
      if (!byClass[classKey]) {
        byClass[classKey] = {
          className: record.enrollment.class.code,
          subjectName: record.enrollment.class.subject.name,
          total: 0, present: 0, absent: 0, late: 0, excused: 0, rate: 0,
        }
      }
      const classStats = byClass[classKey]
      classStats.total++
      if (record.status === 'PRESENT') classStats.present++
      if (record.status === 'ABSENT') classStats.absent++
      if (record.status === 'LATE') classStats.late++
      if (record.status === 'EXCUSED') classStats.excused++
      classStats.rate = Math.round(((classStats.present + classStats.late) / classStats.total) * 100)
    }

    return apiResponse({
      studentId: id,
      summary: {
        totalRecords,
        presentCount,
        absentCount,
        lateCount,
        excusedCount,
        overallRate: totalRecords > 0 ? Math.round(((presentCount + lateCount) / totalRecords) * 100) : 0,
      },
      byClass,
      records: attendanceRecords,
    })
  } catch (error) {
    return handleApiError(error)
  }
}
