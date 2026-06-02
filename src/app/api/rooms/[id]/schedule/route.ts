import { NextRequest } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db'
import {
  parseQuery,
  handleApiError,
  apiResponse,
} from '@/lib/api-utils'

// ==================== Schema ====================

const scheduleQuerySchema = z.object({
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
})

// ==================== GET /api/rooms/[id]/schedule ====================

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { searchParams } = new URL(request.url)
    const dateFrom = searchParams.get('dateFrom')
    const dateTo = searchParams.get('dateTo')

    // Verify room exists
    const room = await db.room.findUnique({ where: { id } })
    if (!room) {
      return apiError('Room not found', 404)
    }

    // Build date filter for class sessions
    const where: Record<string, unknown> = { roomId: id }
    if (dateFrom || dateTo) {
      where.date = {}
      if (dateFrom) (where.date as Record<string, unknown>).gte = new Date(dateFrom)
      if (dateTo) (where.date as Record<string, unknown>).lte = new Date(dateTo)
    }

    // Get all sessions in this room
    const sessions = await db.classSession.findMany({
      where,
      include: {
        class: {
          include: {
            subject: { select: { id: true, code: true, name: true } },
            teacher: { select: { user: { select: { id: true, name: true } } } },
            semester: { select: { id: true, name: true } },
          },
        },
        _count: { select: { attendance: true } },
      },
      orderBy: [{ date: 'asc' }, { startTime: 'asc' }],
      take: 200,
    })

    // Organize sessions by date for easy display
    const scheduleByDate: Record<string, typeof sessions> = {}
    for (const session of sessions) {
      const dateKey = session.date.toISOString().split('T')[0]
      if (!scheduleByDate[dateKey]) {
        scheduleByDate[dateKey] = []
      }
      scheduleByDate[dateKey].push(session)
    }

    return apiResponse({
      room,
      totalSessions: sessions.length,
      scheduleByDate,
      sessions,
    })
  } catch (error) {
    return handleApiError(error)
  }
}
