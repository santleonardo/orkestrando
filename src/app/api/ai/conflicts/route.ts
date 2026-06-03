import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import {
  handleApiError,
  apiResponse,
} from '@/lib/api-utils'

// ==================== POST /api/ai/conflicts ====================

export async function POST(request: NextRequest) {
  try {
    // PLACEHOLDER: In production, use AI/ML for intelligent conflict prediction
    // For now, use algorithmic conflict detection with enhanced analysis

    const sessions = await db.classSession.findMany({
      include: {
        class: {
          include: {
            subject: { select: { code: true, name: true, workload: true } },
            teacher: { select: { id: true, profile: { select: { firstName: true, lastName: true } } } },
            semester: { select: { id: true, name: true } },
            _count: { select: { enrollments: true } },
          },
        },
        room: { select: { id: true, name: true, code: true, capacity: true } },
        _count: { select: { attendance: true } },
      },
      orderBy: [{ date: 'asc' }, { startTime: 'asc' }],
    })

    const conflicts: Array<{
      type: string
      severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW'
      confidence: number
      description: string
      recommendation: string
      affectedEntities: string[]
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
              type: 'TEACHER_OVERLAP',
              severity: 'CRITICAL',
              confidence: 1.0,
              description: `Teacher "${`${s1.class.teacher?.profile?.firstName ?? ""} ${s1.class.teacher?.profile?.lastName ?? ""}`.trim()}" has overlapping sessions on ${date1}`,
              recommendation: 'Reschedule one of the sessions to a different time or assign a substitute teacher',
              affectedEntities: [s1.id, s2.id],
            })
          }
        }
      }
    }

    // Room conflicts
    const roomSessions: Record<string, typeof sessions> = {}
    for (const session of sessions) {
      const key = session.roomId || 'none'
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
              type: 'ROOM_OVERLAP',
              severity: 'CRITICAL',
              confidence: 1.0,
              description: `Room has overlapping sessions on ${date1}`,
              recommendation: 'Reassign one session to a different room or change the time',
              affectedEntities: [s1.id, s2.id],
            })
          }
        }
      }
    }

    // Potential conflicts (teacher has back-to-back sessions in different rooms far apart)
    for (const [, tSessions] of Object.entries(teacherSessions)) {
      const sortedByDate = [...tSessions].sort((a, b) => {
        const dateCompare = a.date.getTime() - b.date.getTime()
        if (dateCompare !== 0) return dateCompare
        return a.startTime.localeCompare(b.startTime)
      })

      for (let i = 0; i < sortedByDate.length - 1; i++) {
        const s1 = sortedByDate[i]
        const s2 = sortedByDate[i + 1]
        const date1 = s1.date.toISOString().split('T')[0]
        const date2 = s2.date.toISOString().split('T')[0]

        if (date1 === date2 && s1.roomId && s2.roomId && s1.roomId !== s2.roomId) {
          // Less than 15 minutes between sessions
          const endMinutes = parseInt(s1.endTime.split(':')[0]) * 60 + parseInt(s1.endTime.split(':')[1])
          const startMinutes = parseInt(s2.startTime.split(':')[0]) * 60 + parseInt(s2.startTime.split(':')[1])
          if (startMinutes - endMinutes < 15 && startMinutes > endMinutes) {
            conflicts.push({
              type: 'TEACHER_TRANSITION',
              severity: 'LOW',
              confidence: 0.7,
              description: `Teacher "${`${s1.class.teacher?.profile?.firstName ?? ""} ${s1.class.teacher?.profile?.lastName ?? ""}`.trim()}" has tight transition between rooms on ${date1} (${s1.endTime} - ${s2.startTime})`,
              recommendation: 'Consider adding buffer time or scheduling sessions in nearby rooms',
              affectedEntities: [s1.id, s2.id],
            })
          }
        }
      }
    }

    conflicts.sort((a, b) => {
      const severityOrder = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3 }
      return severityOrder[a.severity] - severityOrder[b.severity]
    })

    return apiResponse({
      conflicts,
      summary: {
        total: conflicts.length,
        critical: conflicts.filter((c) => c.severity === 'CRITICAL').length,
        high: conflicts.filter((c) => c.severity === 'HIGH').length,
        medium: conflicts.filter((c) => c.severity === 'MEDIUM').length,
        low: conflicts.filter((c) => c.severity === 'LOW').length,
      },
      analyzedAt: new Date().toISOString(),
      note: 'AI-powered conflict detection will be enhanced with predictive ML models',
    })
  } catch (error) {
    return handleApiError(error)
  }
}
