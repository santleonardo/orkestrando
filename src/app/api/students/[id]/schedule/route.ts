import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import {
  handleApiError,
  apiResponse,
  NotFoundError,
} from '@/lib/api-utils'

// ==================== GET /api/students/[id]/schedule ====================

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { searchParams } = new URL(request.url)
    const semesterId = searchParams.get('semesterId')

    // Verify student exists
    const student = await db.profile.findUnique({ where: { id, role: 'STUDENT' } })
    if (!student) {
      throw new NotFoundError('Student', id)
    }

    // Get active enrollments
    const enrollments = await db.enrollment.findMany({
      where: {
        studentId: id,
        status: 'ACTIVE',
        ...(semesterId ? { class: { semesterId } } : {}),
      },
      include: {
        class: {
          include: {
            subject: { select: { code: true, name: true, credits: true } },
            teacher: { select: { profile: { select: { id: true, firstName: true, lastName: true } } } },
            semester: { select: { id: true, name: true } },
            room: { select: { id: true, name: true, code: true, location: true } },
            sessions: {
              orderBy: [{ date: 'asc' }, { startTime: 'asc' }],
            },
          },
        },
      },
    })

    // Organize sessions by date
    const scheduleByDate: Record<string, Array<{
      sessionId: string
      classId: string
      subject: { code: string; name: string }
      teacher: string
      room: string | null
      startTime: string
      endTime: string
      topic: string | null
    }>> = {}

    for (const enrollment of enrollments) {
      for (const session of enrollment.class.sessions) {
        const dateKey = session.date.toISOString().split('T')[0]
        if (!scheduleByDate[dateKey]) {
          scheduleByDate[dateKey] = []
        }
        scheduleByDate[dateKey].push({
          sessionId: session.id,
          classId: enrollment.class.id,
          subject: enrollment.class.subject,
          teacher: `${enrollment.class.teacher?.profile?.firstName ?? ""} ${enrollment.class.teacher?.profile?.lastName ?? ""}`.trim(),
          room: enrollment.class.room
            ? `${enrollment.class.room.name} (${enrollment.class.room.location || enrollment.class.room.code})`
            : null,
          startTime: session.startTime,
          endTime: session.endTime,
          topic: session.topic,
        })
      }
    }

    // Sort each day's sessions by start time
    for (const dateKey of Object.keys(scheduleByDate)) {
      scheduleByDate[dateKey].sort((a, b) => a.startTime.localeCompare(b.startTime))
    }

    return apiResponse({
      studentId: id,
      totalClasses: enrollments.length,
      scheduleByDate,
    })
  } catch (error) {
    return handleApiError(error)
  }
}
