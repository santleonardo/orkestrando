import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import {
  handleApiError,
  apiResponse,
} from '@/lib/api-utils'

// ==================== POST /api/schedules/conflicts ====================

export async function POST(request: NextRequest) {
  try {
    // Get all sessions for conflict detection
    const sessions = await db.classSession.findMany({
      include: {
        class: {
          include: {
            subject: { select: { code: true, name: true } },
            teacher: { select: { id: true, profile: { select: { firstName: true, lastName: true } } } },
            semester: { select: { id: true, name: true } },
          },
        },
        room: { select: { id: true, name: true, code: true } },
      },
      orderBy: [{ date: 'asc' }, { startTime: 'asc' }],
    })

    const conflicts: Array<{
      type: string
      severity: 'HIGH' | 'MEDIUM' | 'LOW'
      description: string
      session1: {
        id: string
        class: string
        teacher: string
        date: string
        startTime: string
        endTime: string
        room: string | null
      }
      session2: {
        id: string
        class: string
        teacher: string
        date: string
        startTime: string
        endTime: string
        room: string | null
      }
    }> = []

    // Teacher conflicts
    const teacherSessions: Record<string, typeof sessions> = {}
    for (const session of sessions) {
      const key = session.class.teacherId
      if (!teacherSessions[key]) teacherSessions[key] = []
      teacherSessions[key].push(session)
    }

    for (const [, tSessions] of Object.entries(teacherSessions)) {
      for (let i = 0; i < tSessions.length; i++) {
        for (let j = i + 1; j < tSessions.length; j++) {
          const s1 = tSessions[i]
          const s2 = tSessions[j]
          const date1 = s1.date.toISOString().split('T')[0]
          const date2 = s2.date.toISOString().split('T')[0]

          if (date1 === date2 && s1.startTime < s2.endTime && s2.startTime < s1.endTime) {
            conflicts.push({
              type: 'TEACHER_CONFLICT',
              severity: 'HIGH',
              description: `Teacher "${`${s1.class.teacher?.profile?.firstName ?? ""} ${s1.class.teacher?.profile?.lastName ?? ""}`.trim()}" has overlapping sessions on ${date1}: ${s1.class.subject.name} (${s1.startTime}-${s1.endTime}) vs ${s2.class.subject.name} (${s2.startTime}-${s2.endTime})`,
              session1: {
                id: s1.id, class: s1.class.subject.name, teacher: `${s1.class.teacher?.profile?.firstName ?? ""} ${s1.class.teacher?.profile?.lastName ?? ""}`.trim(),
                date: date1, startTime: s1.startTime, endTime: s1.endTime, room: s1.room?.name || null,
              },
              session2: {
                id: s2.id, class: s2.class.subject.name, teacher: `${s2.class.teacher?.profile?.firstName ?? ""} ${s2.class.teacher?.profile?.lastName ?? ""}`.trim(),
                date: date2, startTime: s2.startTime, endTime: s2.endTime, room: s2.room?.name || null,
              },
            })
          }
        }
      }
    }

    // Room conflicts
    const roomSessions: Record<string, typeof sessions> = {}
    for (const session of sessions) {
      const key = session.roomId || 'unassigned'
      if (!roomSessions[key]) roomSessions[key] = []
      roomSessions[key].push(session)
    }

    for (const [roomId, rSessions] of Object.entries(roomSessions)) {
      for (let i = 0; i < rSessions.length; i++) {
        for (let j = i + 1; j < rSessions.length; j++) {
          const s1 = rSessions[i]
          const s2 = rSessions[j]
          const date1 = s1.date.toISOString().split('T')[0]
          const date2 = s2.date.toISOString().split('T')[0]

          if (date1 === date2 && s1.startTime < s2.endTime && s2.startTime < s1.endTime) {
            conflicts.push({
              type: 'ROOM_CONFLICT',
              severity: 'HIGH',
              description: `Room "${s1.room?.name || roomId}" has overlapping sessions on ${date1}`,
              session1: {
                id: s1.id, class: s1.class.subject.name, teacher: `${s1.class.teacher?.profile?.firstName ?? ""} ${s1.class.teacher?.profile?.lastName ?? ""}`.trim(),
                date: date1, startTime: s1.startTime, endTime: s1.endTime, room: s1.room?.name || null,
              },
              session2: {
                id: s2.id, class: s2.class.subject.name, teacher: `${s2.class.teacher?.profile?.firstName ?? ""} ${s2.class.teacher?.profile?.lastName ?? ""}`.trim(),
                date: date2, startTime: s2.startTime, endTime: s2.endTime, room: s2.room?.name || null,
              },
            })
          }
        }
      }
    }

    conflicts.sort((a, b) => {
      if (a.severity === 'HIGH' && b.severity !== 'HIGH') return -1
      if (a.severity !== 'HIGH' && b.severity === 'HIGH') return 1
      return a.session1.date.localeCompare(b.session1.date)
    })

    return apiResponse({
      totalConflicts: conflicts.length,
      highSeverity: conflicts.filter((c) => c.severity === 'HIGH').length,
      conflicts,
    })
  } catch (error) {
    return handleApiError(error)
  }
}
