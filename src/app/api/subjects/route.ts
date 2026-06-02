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

const subjectsQuerySchema = z.object({
  semesterId: z.string().optional(),
  teacherId: z.string().optional(),
  ...paginationSchema.shape,
  ...searchSchema.shape,
})

const createSubjectSchema = z.object({
  code: z.string().min(1, 'Subject code is required'),
  name: z.string().min(1, 'Subject name is required'),
  description: z.string().optional(),
  credits: z.number().int().min(1).default(1),
  workload: z.number().int().min(1).default(60),
  semesterId: z.string().optional(),
  teacherId: z.string().optional(),
})

const updateSubjectSchema = z.object({
  code: z.string().min(1).optional(),
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  credits: z.number().int().min(1).optional(),
  workload: z.number().int().min(1).optional(),
  semesterId: z.string().nullable().optional(),
  teacherId: z.string().nullable().optional(),
})

// ==================== GET /api/subjects ====================

export async function GET(request: NextRequest) {
  try {
    const query = parseQuery(request, subjectsQuerySchema)
    const { page, pageSize, search, semesterId, teacherId } = query

    const where: Record<string, unknown> = {}
    if (semesterId) where.semesterId = semesterId
    if (teacherId) where.teacherId = teacherId

    if (search) {
      where.OR = [
        { code: { contains: search } },
        { name: { contains: search } },
        { description: { contains: search } },
      ]
    }

    const [subjects, total] = await Promise.all([
      db.subject.findMany({
        where,
        include: {
          teacher: {
            select: { id: true, role: true, user: { select: { id: true, name: true, email: true } } },
          },
          semester: { select: { id: true, name: true } },
          _count: { select: { classes: true, materials: true } },
        },
        orderBy: [{ code: 'asc' }],
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      db.subject.count({ where }),
    ])

    return paginatedResponse(subjects, total, page, pageSize)
  } catch (error) {
    return handleApiError(error)
  }
}

// ==================== POST /api/subjects ====================

export async function POST(request: NextRequest) {
  try {
    const auth = getAuthProfile(request)
    requirePermission(auth, 'COORDINATOR')

    const body = await parseBody(request, createSubjectSchema)

    // Check for duplicate code
    const existingSubject = await db.subject.findUnique({ where: { code: body.code } })
    if (existingSubject) {
      return apiError('A subject with this code already exists', 409)
    }

    // Verify semester if provided
    if (body.semesterId) {
      const semester = await db.semester.findUnique({ where: { id: body.semesterId } })
      if (!semester) return apiError('Semester not found', 404)
    }

    // Verify teacher if provided
    if (body.teacherId) {
      const teacher = await db.profile.findUnique({ where: { id: body.teacherId } })
      if (!teacher || teacher.role !== 'TEACHER') return apiError('Teacher not found or invalid', 404)
    }

    const subject = await db.subject.create({
      data: {
        code: body.code,
        name: body.name,
        description: body.description,
        credits: body.credits,
        workload: body.workload,
        semesterId: body.semesterId,
        teacherId: body.teacherId,
      },
      include: {
        teacher: {
          select: { id: true, role: true, user: { select: { id: true, name: true, email: true } } },
        },
        semester: { select: { id: true, name: true } },
        _count: { select: { classes: true, materials: true } },
      },
    })

    await createAuditLog({
      action: 'CREATE',
      profileId: auth.id,
      resource: 'Subject',
      resourceId: subject.id,
      request,
    })

    return apiResponse(subject, 201)
  } catch (error) {
    return handleApiError(error)
  }
}
