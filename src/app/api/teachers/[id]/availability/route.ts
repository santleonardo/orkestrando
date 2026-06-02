import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import {
  handleApiError,
  apiResponse,
  NotFoundError,
} from '@/lib/api-utils'

// ==================== GET /api/teachers/[id]/availability ====================

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { searchParams } = new URL(request.url)
    const semesterId = searchParams.get('semesterId')

    // Verify teacher exists
    const teacher = await db.profile.findUnique({ where: { id, role: 'TEACHER' } })
    if (!teacher) {
      throw new NotFoundError('Teacher', id)
    }

    const where: Record<string, unknown> = { teacherId: id }
    if (semesterId) where.semesterId = semesterId

    const availability = await db.availability.findMany({
      where,
      include: {
        semester: { select: { id: true, name: true } },
      },
      orderBy: [
        { dayOfWeek: 'asc' },
        { startTime: 'asc' },
      ],
    })

    // Group by day of week
    const grouped: Record<string, typeof availability> = {}
    for (const slot of availability) {
      if (!grouped[slot.dayOfWeek]) {
        grouped[slot.dayOfWeek] = []
      }
      grouped[slot.dayOfWeek].push(slot)
    }

    return apiResponse({
      availability,
      groupedByDay: grouped,
    })
  } catch (error) {
    return handleApiError(error)
  }
}
