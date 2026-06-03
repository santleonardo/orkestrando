import { NextRequest } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db'
import {
  parseQuery,
  handleApiError,
  apiResponse,
  paginationSchema,
} from '@/lib/api-utils'

// ==================== Schema ====================

const schedulesQuerySchema = z.object({
  teacherId: z.string().optional(),
  roomId: z.string().optional(),
  semesterId: z.string().optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  ...paginationSchema.shape,
})

// ==================== GET /api/schedules ====================

export async function GET(request: NextRequest) {
  try {
    const query = parseQuery(request, schedulesQuerySchema)
    const { page, pageSize, teacherId, roomId, semesterId, dateFrom, dateTo } = query

    const where: Record<string, unknown> = {}

    if (teacherId) where.class = { ...where.class, teacherId }
    if (roomId) where.roomId = roomId
    if (dateFrom || dateTo) {
      where.date = {}
      if (dateFrom) (where.date as Record<string, unknown>).gte = new Date(dateFrom)
      if (dateTo) (where.date as Record<string, unknown>).lte = new Date(dateTo)
    }

    if (semesterId) {
      where.class = { ...(where.class || {}), semesterId }
    }

    const [sessions, total] = await Promise.all([
      db.classSession.findMany({
        where,
        include: {
          class: {
            include: {
              subject: { select: { id: true, code: true, name: true } },
              teacher: { select: { id: true, profile: { select: { id: true, firstName: true, lastName: true } } } },
              semester: { select: { id: true, name: true } },
              _count: { select: { enrollments: true } },
            },
          },
          room: { select: { id: true, name: true, code: true, capacity: true, location: true } },
          _count: { select: { attendance: true } },
        },
        orderBy: [{ date: 'asc' }, { startTime: 'asc' }],
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      db.classSession.count({ where }),
    ])

    // Detect time conflicts for returned sessions
    const conflicts: Array<{
      type: string
      session1Id: string
      session2Id: string
      description: string
    }> = []

    // Check teacher conflicts (same teacher, same date, overlapping time)
    const teacherMap: Record<string, Array<typeof sessions[0]>> = {}
    for (const session of sessions) {
      const tId = session.class.teacherId
      if (!tId) continue
      if (!teacherMap[tId]) teacherMap[tId] = []
      teacherMap[tId].push(session)
    }

    for (const [, tSessions] of Object.entries(teacherMap)) {
      for (let i = 0; i < tSessions.length; i++) {
        for (let j = i + 1; j < tSessions.length; j++) {
          const s1 = tSessions[i]
          const s2 = tSessions[j]
          const date1 = s1.date.toISOString().split('T')[0]
          const date2 = s2.date.toISOString().split('T')[0]

          if (date1 === date2 && s1.startTime < s2.endTime && s2.startTime < s1.endTime) {
            conflicts.push({
              type: 'TEACHER_CONFLICT',
              session1Id: s1.id,
              session2Id: s2.id,
              description: `Teacher conflict: ${`${s1.class.teacher?.profile?.firstName ?? ""} ${s1.class.teacher?.profile?.lastName ?? ""}`.trim()} has overlapping sessions on ${date1}`,
            })
          }
        }
      }
    }

    // Check room conflicts (same room, same date, overlapping time)
    const roomMap: Record<string, Array<typeof sessions[0]>> = {}
    for (const session of sessions) {
      const rId = session.roomId
      if (!rId) continue
      if (!roomMap[rId]) roomMap[rId] = []
      roomMap[rId].push(session)
    }

    for (const [rId, rSessions] of Object.entries(roomMap)) {
      for (let i = 0; i < rSessions.length; i++) {
        for (let j = i + 1; j < rSessions.length; j++) {
          const s1 = rSessions[i]
          const s2 = rSessions[j]
          const date1 = s1.date.toISOString().split('T')[0]
          const date2 = s2.date.toISOString().split('T')[0]

          if (date1 === date2 && s1.startTime < s2.endTime && s2.startTime < s1.endTime) {
            conflicts.push({
              type: 'ROOM_CONFLICT',
              session1Id: s1.id,
              session2Id: s2.id,
              description: `Room conflict: Room ${rId} has overlapping sessions on ${date1}`,
            })
          }
        }
      }
    }

    return apiResponse({
      sessions,
      total,
      page,
      pageSize,
      conflicts: conflicts.length > 0 ? conflicts : undefined,
      hasConflicts: conflicts.length > 0,
    })
  } catch (error) {
    return handleApiError(error)
  }
}
