import { NextRequest } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db'
import {
  parseBody,
  parseQuery,
  handleApiError,
  apiResponse,
  apiError,
  paginatedResponse,
  getAuthProfile,
  requirePermission,
  createAuditLog,
  paginationSchema,
  searchSchema,
} from '@/lib/api-utils'

// ==================== Schemas ====================

const roomsQuerySchema = z.object({
  type: z.enum(['CLASSROOM', 'LAB', 'AUDITORIUM', 'GYM', 'LIBRARY', 'OTHER']).optional(),
  isActive: z.coerce.boolean().optional(),
  minCapacity: z.coerce.number().int().min(1).optional(),
  ...paginationSchema.shape,
  ...searchSchema.shape,
})

const createRoomSchema = z.object({
  name: z.string().min(1, 'Room name is required'),
  code: z.string().min(1, 'Room code is required'),
  capacity: z.number().int().min(1, 'Capacity must be at least 1'),
  type: z.enum(['CLASSROOM', 'LAB', 'AUDITORIUM', 'GYM', 'LIBRARY', 'OTHER']).default('CLASSROOM'),
  location: z.string().optional(),
  equipment: z.array(z.unknown()).optional(),
  isActive: z.boolean().default(true),
})

const updateRoomSchema = z.object({
  name: z.string().min(1).optional(),
  code: z.string().min(1).optional(),
  capacity: z.number().int().min(1).optional(),
  type: z.enum(['CLASSROOM', 'LAB', 'AUDITORIUM', 'GYM', 'LIBRARY', 'OTHER']).optional(),
  location: z.string().nullable().optional(),
  equipment: z.array(z.unknown()).optional(),
  isActive: z.boolean().optional(),
})

// ==================== GET /api/rooms ====================

export async function GET(request: NextRequest) {
  try {
    const query = parseQuery(request, roomsQuerySchema)
    const { page, pageSize, search, type, isActive, minCapacity } = query

    const where: Record<string, unknown> = {}
    if (type) where.type = type
    if (isActive !== undefined) where.isActive = isActive
    if (minCapacity) where.capacity = { gte: minCapacity }

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { code: { contains: search } },
      ]
    }

    const [rooms, total] = await Promise.all([
      db.room.findMany({
        where,
        include: {
          _count: { select: { classes: true, sessions: true } },
        },
        orderBy: [{ name: 'asc' }],
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      db.room.count({ where }),
    ])

    return paginatedResponse(rooms, total, page, pageSize)
  } catch (error) {
    return handleApiError(error)
  }
}

// ==================== POST /api/rooms ====================

export async function POST(request: NextRequest) {
  try {
    const auth = getAuthProfile(request)
    requirePermission(auth, 'COORDINATOR')

    const body = await parseBody(request, createRoomSchema)

    // Check for duplicate room code
    const existingRoom = await db.room.findUnique({ where: { code: body.code } })
    if (existingRoom) {
      return apiError('A room with this code already exists', 409)
    }

    const room = await db.room.create({
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
      action: 'CREATE',
      profileId: auth.id,
      resource: 'Room',
      resourceId: room.id,
      request,
    })

    return apiResponse(room, 201)
  } catch (error) {
    return handleApiError(error)
  }
}
