import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import {
  handleApiError,
  apiResponse,
  NotFoundError,
} from '@/lib/api-utils'

// ==================== GET /api/teachers/[id]/classes ====================

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

    const where: Record<string, unknown> = { teacherId: id, isActive: true }
    if (semesterId) where.semesterId = semesterId

    const classes = await db.class.findMany({
      where,
      include: {
        subject: { select: { id: true, code: true, name: true, credits: true } },
        semester: { select: { id: true, name: true } },
        room: { select: { id: true, name: true, code: true, capacity: true } },
        _count: { select: { enrollments: true, sessions: true, materials: true } },
      },
      orderBy: [{ createdAt: 'desc' }],
    })

    return apiResponse(classes)
  } catch (error) {
    return handleApiError(error)
  }
}
