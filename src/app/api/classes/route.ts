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

const classesQuerySchema = z.object({
  subjectId: z.string().optional(),
  semesterId: z.string().optional(),
  teacherId: z.string().optional(),
  roomId: z.string().optional(),
  isActive: z.coerce.boolean().optional(),
  ...paginationSchema.shape,
  ...searchSchema.shape,
})

const createClassSchema = z.object({
  code: z.string().min(1, 'Class code is required'),
  name: z.string().min(1, 'Class name is required'),
  subjectId: z.string().min(1, 'Subject ID is required'),
  teacherId: z.string().min(1, 'Teacher ID is required'),
  semesterId: z.string().min(1, 'Semester ID is required'),
  roomId: z.string().optional(),
  schedule: z.string().optional(),
  maxStudents: z.number().int().min(1).default(40),
})

const updateClassSchema = z.object({
  code: z.string().min(1).optional(),
  name: z.string().min(1).optional(),
  subjectId: z.string().min(1).optional(),
  teacherId: z.string().min(1).optional(),
  semesterId: z.string().min(1).optional(),
  roomId: z.string().nullable().optional(),
  schedule: z.string().nullable().optional(),
  maxStudents: z.number().int().min(1).optional(),
  isActive: z.boolean().optional(),
})

// ==================== GET /api/classes ====================

export async function GET(request: NextRequest) {
  try {
    const query = parseQuery(request, classesQuerySchema)
    const { page, pageSize, search, subjectId, semesterId, teacherId, roomId, isActive } = query

    const where: Record<string, unknown> = {}

    if (subjectId) where.subjectId = subjectId
    if (semesterId) where.semesterId = semesterId
    if (teacherId) where.teacherId = teacherId
    if (roomId) where.roomId = roomId
    if (isActive !== undefined) where.isActive = isActive

    if (search) {
      where.OR = [
        { code: { contains: search } },
        { name: { contains: search } },
      ]
    }

    const [classes, total] = await Promise.all([
      db.class.findMany({
        where,
        include: {
          subject: { select: { id: true, code: true, name: true, credits: true } },
          teacher: {
            select: { id: true, role: true, user: { select: { id: true, name: true, email: true } } },
          },
          semester: { select: { id: true, name: true } },
          room: { select: { id: true, name: true, code: true, capacity: true } },
          _count: { select: { enrollments: true, sessions: true, materials: true } },
        },
        orderBy: [{ createdAt: 'desc' }],
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      db.class.count({ where }),
    ])

    return paginatedResponse(classes, total, page, pageSize)
  } catch (error) {
    return handleApiError(error)
  }
}

// ==================== POST /api/classes ====================

export async function POST(request: NextRequest) {
  try {
    const auth = getAuthProfile(request)
    requirePermission(auth, 'COORDINATOR')

    const body = await parseBody(request, createClassSchema)

    // Verify subject exists
    const subject = await db.subject.findUnique({ where: { id: body.subjectId } })
    if (!subject) {
      return apiError('Subject not found', 404)
    }

    // Verify teacher exists and has TEACHER role
    const teacher = await db.profile.findUnique({ where: { id: body.teacherId } })
    if (!teacher || teacher.role !== 'TEACHER') {
      return apiError('Teacher not found or invalid', 404)
    }

    // Verify semester exists
    const semester = await db.semester.findUnique({ where: { id: body.semesterId } })
    if (!semester) {
      return apiError('Semester not found', 404)
    }

    // Verify room exists if provided
    if (body.roomId) {
      const room = await db.room.findUnique({ where: { id: body.roomId } })
      if (!room) {
        return apiError('Room not found', 404)
      }
    }

    // Check for duplicate class code
    const existingClass = await db.class.findUnique({ where: { code: body.code } })
    if (existingClass) {
      return apiError('A class with this code already exists', 409)
    }

    const newClass = await db.class.create({
      data: {
        code: body.code,
        name: body.name,
        subjectId: body.subjectId,
        teacherId: body.teacherId,
        semesterId: body.semesterId,
        roomId: body.roomId,
        schedule: body.schedule,
        maxStudents: body.maxStudents,
      },
      include: {
        subject: { select: { id: true, code: true, name: true, credits: true } },
        teacher: {
          select: { id: true, role: true, user: { select: { id: true, name: true, email: true } } },
        },
        semester: { select: { id: true, name: true } },
        room: { select: { id: true, name: true, code: true, capacity: true } },
      },
    })

    await createAuditLog({
      action: 'CREATE',
      profileId: auth.id,
      resource: 'Class',
      resourceId: newClass.id,
      request,
    })

    return apiResponse(newClass, 201)
  } catch (error) {
    return handleApiError(error)
  }
}
