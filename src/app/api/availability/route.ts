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
  createAuditLog,
  paginationSchema,
} from '@/lib/api-utils'

// ==================== Schemas ====================

const availabilityQuerySchema = z.object({
  teacherId: z.string().optional(),
  semesterId: z.string().optional(),
  dayOfWeek: z.enum(['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY']).optional(),
  ...paginationSchema.shape,
})

const createAvailabilitySchema = z.object({
  teacherId: z.string().min(1, 'Teacher ID is required'),
  semesterId: z.string().min(1, 'Semester ID is required'),
  dayOfWeek: z.enum(['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY']),
  startTime: z.string().regex(/^\d{2}:\d{2}$/, 'Start time must be in HH:mm format'),
  endTime: z.string().regex(/^\d{2}:\d{2}$/, 'End time must be in HH:mm format'),
  isAvailable: z.boolean().default(true),
})

const createBulkAvailabilitySchema = z.object({
  teacherId: z.string().min(1, 'Teacher ID is required'),
  semesterId: z.string().min(1, 'Semester ID is required'),
  slots: z.array(
    z.object({
      dayOfWeek: z.enum(['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY']),
      startTime: z.string().regex(/^\d{2}:\d{2}$/),
      endTime: z.string().regex(/^\d{2}:\d{2}$/),
    })
  ).min(1, 'At least one slot is required'),
})

// ==================== GET /api/availability ====================

export async function GET(request: NextRequest) {
  try {
    const query = parseQuery(request, availabilityQuerySchema)
    const { page, pageSize, teacherId, semesterId, dayOfWeek, ...rest } = query

    const where: Record<string, unknown> = {}
    if (teacherId) where.teacherId = teacherId
    if (semesterId) where.semesterId = semesterId
    if (dayOfWeek) where.dayOfWeek = dayOfWeek

    const [availability, total] = await Promise.all([
      db.availability.findMany({
        where,
        include: {
          teacher: {
            include: { profile: { select: { id: true, firstName: true, lastName: true, email: true } } },
          },
          semester: { select: { id: true, name: true } },
        },
        orderBy: [
          { dayOfWeek: 'asc' },
          { startTime: 'asc' },
        ],
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      db.availability.count({ where }),
    ])

    return paginatedResponse(availability, total, page, pageSize)
  } catch (error) {
    return handleApiError(error)
  }
}

// ==================== POST /api/availability ====================

export async function POST(request: NextRequest) {
  try {
    const auth = getAuthProfile(request)
    const body = await parseBody(request, createAvailabilitySchema)

    // Verify teacher exists
    const teacher = await db.profile.findUnique({
      where: { id: body.teacherId },
    })
    if (!teacher || teacher.role !== 'TEACHER') {
      return apiError('Teacher not found or invalid', 404)
    }

    // Verify semester exists
    const semester = await db.semester.findUnique({
      where: { id: body.semesterId },
    })
    if (!semester) {
      return apiError('Semester not found', 404)
    }

    // Validate time range
    if (body.startTime >= body.endTime) {
      return apiError('Start time must be before end time', 400)
    }

    // Check for overlapping availability slots
    const existingSlot = await db.availability.findFirst({
      where: {
        teacherId: body.teacherId,
        semesterId: body.semesterId,
        dayOfWeek: body.dayOfWeek,
        OR: [
          {
            startTime: { lt: body.endTime },
            endTime: { gt: body.startTime },
          },
        ],
      },
    })
    if (existingSlot) {
      return apiError(
        'This availability slot overlaps with an existing one',
        409
      )
    }

    const availability = await db.availability.create({
      data: {
        teacherId: body.teacherId,
        semesterId: body.semesterId,
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
      action: 'CREATE',
      profileId: auth.id,
      resource: 'Availability',
      resourceId: availability.id,
      request,
    })

    return apiResponse(availability, 201)
  } catch (error) {
    return handleApiError(error)
  }
}
