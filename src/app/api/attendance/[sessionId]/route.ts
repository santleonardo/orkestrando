import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import {
  handleApiError,
  apiResponse,
  NotFoundError,
} from '@/lib/api-utils'

// ==================== GET /api/attendance/[sessionId] ====================

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const { sessionId } = await params

    // Get session details with attendance
    const session = await db.classSession.findUnique({
      where: { id: sessionId },
      include: {
        class: {
          include: {
            subject: { select: { id: true, code: true, name: true } },
            teacher: {
              select: { id: true, user: { select: { id: true, name: true, email: true } } },
            },
            semester: { select: { id: true, name: true } },
            enrollments: {
              where: { status: 'ACTIVE' },
              include: {
                student: {
                  select: { id: true, registrationNumber: true, user: { select: { id: true, name: true } } },
                },
              },
            },
          },
        },
        room: { select: { id: true, name: true, code: true, capacity: true } },
        attendance: {
          include: {
            enrollment: {
              select: {
                student: {
                  select: { id: true, registrationNumber: true, user: { select: { id: true, name: true } } },
                },
              },
            },
          },
        },
      },
    })

    if (!session) {
      throw new NotFoundError('Class session', sessionId)
    }

    // Compute attendance summary
    const attendanceRecords = session.attendance
    const totalEnrolled = session.class.enrollments.length
    const presentCount = attendanceRecords.filter((a) => a.status === 'PRESENT').length
    const absentCount = attendanceRecords.filter((a) => a.status === 'ABSENT').length
    const lateCount = attendanceRecords.filter((a) => a.status === 'LATE').length
    const excusedCount = attendanceRecords.filter((a) => a.status === 'EXCUSED').length
    const missingCount = totalEnrolled - attendanceRecords.length

    return apiResponse({
      ...session,
      attendanceSummary: {
        totalEnrolled,
        presentCount,
        absentCount,
        lateCount,
        excusedCount,
        missingCount,
        attendanceRate: attendanceRecords.length > 0
          ? Math.round(((presentCount + lateCount) / attendanceRecords.length) * 100)
          : 0,
      },
    })
  } catch (error) {
    return handleApiError(error)
  }
}
