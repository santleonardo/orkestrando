import { NextRequest } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db'
import {
  parseBody,
  handleApiError,
  apiResponse,
  apiError,
  NotFoundError,
  getAuthProfile,
  createAuditLog,
} from '@/lib/api-utils'

// ==================== Schemas ====================

const updateAvailabilitySchema = z.object({
  dayOfWeek: z.enum(['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY']).optional(),
  startTime: z.string().regex(/^\d{2}:\d{2}$/, 'Start time must be in HH:mm format').optional(),
  endTime: z.string().regex(/^\d{2}:\d{2}$/, 'End time must be in HH:mm format').optional(),
  isAvailable: z.boolean().optional(),
})

// ==================== PUT /api/availability/[id] ====================

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const auth = getAuthProfile(request)
    const body = await parseBody(request, updateAvailabilitySchema)

    // Check if availability exists
    const existing = await db.availability.findUnique({ where: { id } })
    if (!existing) {
      throw new NotFoundError('Availability', id)
    }

    // Validate time range if both times provided
    const startTime = body.startTime || existing.startTime
    const endTime = body.endTime || existing.endTime
    if (startTime >= endTime) {
      return apiError('Start time must be before end time', 400)
    }

    // Check for overlapping slots (excluding current one)
    if (body.dayOfWeek || body.startTime || body.endTime) {
      const dayOfWeek = body.dayOfWeek || existing.dayOfWeek
      const existingSlot = await db.availability.findFirst({
        where: {
          id: { not: id },
          teacherId: existing.teacherId,
          semesterId: existing.semesterId,
          dayOfWeek,
          OR: [
            {
              startTime: { lt: endTime },
              endTime: { gt: startTime },
            },
          ],
        },
      })
      if (existingSlot) {
        return apiError(
          'Updated availability slot overlaps with an existing one',
          409
        )
      }
    }

    const updated = await db.availability.update({
      where: { id },
      data: {
        dayOfWeek: body.dayOfWeek,
        startTime: body.startTime,
        endTime: body.endTime,
        isAvailable: body.isAvailable,
      },
      include: {
        teacher: {
          include: { profile: { select: { id: true, firstName: true, lastName: true, email: true } } },
        },
        semester: { select: { id: true, name: true } },
      },
    })

    await createAuditLog({
      action: 'UPDATE',
      profileId: auth.id,
      resource: 'Availability',
      resourceId: id,
      request,
    })

    return apiResponse(updated)
  } catch (error) {
    return handleApiError(error)
  }
}

// ==================== DELETE /api/availability/[id] ====================

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const auth = getAuthProfile(request)

    // Check if availability exists
    const existing = await db.availability.findUnique({ where: { id } })
    if (!existing) {
      throw new NotFoundError('Availability', id)
    }

    await db.availability.delete({ where: { id } })

    await createAuditLog({
      action: 'DELETE',
      profileId: auth.id,
      resource: 'Availability',
      resourceId: id,
      request,
    })

    return apiResponse({ message: 'Availability deleted successfully' })
  } catch (error) {
    return handleApiError(error)
  }
}
