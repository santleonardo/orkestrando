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
  requirePermission,
  createAuditLog,
} from '@/lib/api-utils'

// ==================== Schema ====================

const updateRoomSchema = z.object({
  name: z.string().min(1).optional(),
  code: z.string().min(1).optional(),
  capacity: z.number().int().min(1).optional(),
  type: z.enum(['CLASSROOM', 'LAB', 'AUDITORIUM', 'GYM', 'LIBRARY', 'OTHER']).optional(),
  location: z.string().nullable().optional(),
  equipment: z.array(z.unknown()).optional(),
  isActive: z.boolean().optional(),
})

// ==================== GET /api/rooms/[id] ====================

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const room = await db.room.findUnique({
      where: { id },
      include: {
        classes: {
          include: {
            subject: { select: { id: true, code: true, name: true } },
            teacher: { select: { user: { select: { name: true } } } },
            semester: { select: { id: true, name: true } },
            _count: { select: { enrollments: true } },
          },
        },
        _count: { select: { classes: true, sessions: true } },
      },
    })

    if (!room) {
      throw new NotFoundError('Room', id)
    }

    // Parse equipment JSON
    const parsedEquipment = room.equipment ? JSON.parse(room.equipment) : []

    return apiResponse({
      ...room,
      equipment: parsedEquipment,
    })
  } catch (error) {
    return handleApiError(error)
  }
}

// ==================== PUT /api/rooms/[id] ====================

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const auth = getAuthProfile(request)
    requirePermission(auth, 'COORDINATOR')

    const body = await parseBody(request, updateRoomSchema)

    const existing = await db.room.findUnique({ where: { id } })
    if (!existing) {
      throw new NotFoundError('Room', id)
    }

    // Check for duplicate code if changing
    if (body.code && body.code !== existing.code) {
      const duplicate = await db.room.findUnique({ where: { code: body.code } })
      if (duplicate) return apiError('A room with this code already exists', 409)
    }

    const updated = await db.room.update({
      where: { id },
      data: {
        name: body.name,
        code: body.code,
        capacity: body.capacity,
        type: body.type,
        location: body.location,
        equipment: body.equipment ? JSON.stringify(body.equipment) : undefined,
        isActive: body.isActive,
      },
      include: {
        _count: { select: { classes: true, sessions: true } },
      },
    })

    await createAuditLog({
      action: 'UPDATE',
      profileId: auth.id,
      resource: 'Room',
      resourceId: id,
      request,
    })

    return apiResponse(updated)
  } catch (error) {
    return handleApiError(error)
  }
}

// ==================== DELETE /api/rooms/[id] ====================

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const auth = getAuthProfile(request)
    requirePermission(auth, 'ADMIN')

    const existing = await db.room.findUnique({
      where: { id },
      include: { _count: { select: { classes: true } } },
    })
    if (!existing) {
      throw new NotFoundError('Room', id)
    }

    if (existing._count.classes > 0) {
      return apiError('Cannot delete room with assigned classes. Deactivate it instead.', 400)
    }

    await db.room.delete({ where: { id } })

    await createAuditLog({
      action: 'DELETE',
      profileId: auth.id,
      resource: 'Room',
      resourceId: id,
      request,
    })

    return apiResponse({ message: 'Room deleted successfully' })
  } catch (error) {
    return handleApiError(error)
  }
}
