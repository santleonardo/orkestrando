import { NextRequest } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db'
import {
  parseBody,
  handleApiError,
  apiResponse,
  apiError,
  getAuthProfile,
} from '@/lib/api-utils'

// ==================== Schema ====================

const generateScheduleSchema = z.object({
  semesterId: z.string().min(1, 'Semester ID is required'),
  autoAssignRooms: z.boolean().default(true),
  maxSessionsPerDay: z.number().int().min(1).max(10).default(6),
  startHour: z.number().int().min(0).max(23).default(7),
  endHour: z.number().int().min(1).max(24).default(22),
})

// ==================== POST /api/schedules/generate ====================

export async function POST(request: NextRequest) {
  try {
    const auth = getAuthProfile(request)
    const body = await parseBody(request, generateScheduleSchema)

    // Verify semester exists
    const semester = await db.semester.findUnique({ where: { id: body.semesterId } })
    if (!semester) {
      return apiError('Semester not found', 404)
    }

    // Get all classes for this semester
    const classes = await db.class.findMany({
      where: { semesterId: body.semesterId, isActive: true },
      include: {
        subject: { select: { id: true, code: true, name: true, workload: true } },
        teacher: {
          select: { id: true, profile: { select: { firstName: true, lastName: true } } },
          include: { availability: { where: { semesterId: body.semesterId, isAvailable: true } } },
        },
        room: { select: { id: true, name: true, code: true, capacity: true } },
        sessions: { select: { id: true } },
        _count: { select: { enrollments: true } },
      },
    })

    // Get all available rooms
    const rooms = await db.room.findMany({
      where: { isActive: true },
      orderBy: [{ capacity: 'asc' }],
    })

    // Schedule generation algorithm
    const generatedSessions: Array<{
      classId: string
      className: string
      subjectName: string
      teacherName: string
      date: string
      startTime: string
      endTime: string
      roomId: string | null
      roomName: string | null
    }> = []

    const daysOfWeek = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY']
    const existingSlots = new Set<string>()

    // Get existing sessions to avoid conflicts
    const existingSessions = await db.classSession.findMany({
      where: { class: { semesterId: body.semesterId } },
      select: {
        class: { select: { teacherId: true } },
        roomId: true,
        date: true,
        startTime: true,
        endTime: true,
      },
    })

    for (const session of existingSessions) {
      const dateKey = session.date.toISOString().split('T')[0]
      existingSlots.add(`teacher:${session.class.teacherId}:${dateKey}:${session.startTime}`)
      existingSlots.add(`room:${session.roomId || 'none'}:${dateKey}:${session.startTime}`)
    }

    const sessionDuration = 2
    let totalGenerated = 0

    const weeksInSemester = Math.max(1, Math.ceil(
      (semester.endDate.getTime() - semester.startDate.getTime()) / (7 * 24 * 60 * 60 * 1000)
    ))

    for (const classItem of classes) {
      const sessionsNeeded = Math.max(1, Math.ceil(classItem.subject.workload / (sessionDuration * weeksInSemester)))
      const teacherAvailability = classItem.teacher?.availability || []
      if (teacherAvailability.length === 0) continue

      let sessionsCreated = 0
      const startDate = new Date(semester.startDate)

      for (let week = 0; week < weeksInSemester && sessionsCreated < sessionsNeeded; week++) {
        for (const day of daysOfWeek) {
          if (sessionsCreated >= sessionsNeeded) break

          const dayAvailability = teacherAvailability.find((a: any) => a.dayOfWeek === day)
          if (!dayAvailability) continue

          const sessionDate = new Date(startDate)
          sessionDate.setDate(sessionDate.getDate() + (week * 7) + daysOfWeek.indexOf(day))
          if (sessionDate > semester.endDate) continue

          const dateStr = sessionDate.toISOString().split('T')[0]
          const startTime = dayAvailability.startTime
          const endHour = parseInt(startTime.split(':')[0]) + sessionDuration
          const endTime = `${endHour.toString().padStart(2, '0')}:00`

          const teacherKey = `teacher:${classItem.teacherId}:${dateStr}:${startTime}`
          if (existingSlots.has(teacherKey)) continue

          let assignedRoom = classItem.room
          if (body.autoAssignRooms && !assignedRoom) {
            assignedRoom = rooms.find((r) => {
              const roomKeyCheck = `room:${r.id}:${dateStr}:${startTime}`
              return !existingSlots.has(roomKeyCheck) && r.capacity >= classItem._count.enrollments
            })
          }

          generatedSessions.push({
            classId: classItem.id,
            className: classItem.name,
            subjectName: classItem.subject.name,
            teacherName: `${classItem.teacher?.profile?.firstName ?? ''} ${classItem.teacher?.profile?.lastName ?? ''}`.trim() || 'Desconhecido',
            date: sessionDate.toISOString(),
            startTime,
            endTime,
            roomId: assignedRoom?.id || null,
            roomName: assignedRoom?.name || null,
          })

          existingSlots.add(teacherKey)
          if (assignedRoom) {
            existingSlots.add(`room:${assignedRoom.id}:${dateStr}:${startTime}`)
          }

          sessionsCreated++
          totalGenerated++
        }
      }
    }

    return apiResponse({
      message: `Generated ${totalGenerated} sessions for ${classes.length} classes`,
      semester: { id: semester.id, name: semester.name },
      totalClasses: classes.length,
      totalSessionsGenerated: totalGenerated,
      sessions: generatedSessions,
    })
  } catch (error) {
    return handleApiError(error)
  }
}
