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
  searchSchema,
} from '@/lib/api-utils'

// ==================== Schemas ====================

const materialsQuerySchema = z.object({
  subjectId: z.string().optional(),
  classId: z.string().optional(),
  type: z.enum(['PDF', 'DOC', 'PPT', 'VIDEO', 'IMAGE', 'LINK', 'OTHER']).optional(),
  uploadedBy: z.string().optional(),
  ...paginationSchema.shape,
  ...searchSchema.shape,
})

const createMaterialSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  type: z.enum(['PDF', 'DOC', 'PPT', 'VIDEO', 'IMAGE', 'LINK', 'OTHER']).default('PDF'),
  fileUrl: z.string().optional(),
  fileSize: z.number().int().positive().optional(),
  subjectId: z.string().optional(),
  classId: z.string().optional(),
})

const updateMaterialSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  type: z.enum(['PDF', 'DOC', 'PPT', 'VIDEO', 'IMAGE', 'LINK', 'OTHER']).optional(),
  fileUrl: z.string().nullable().optional(),
  fileSize: z.number().int().positive().nullable().optional(),
  subjectId: z.string().nullable().optional(),
  classId: z.string().nullable().optional(),
})

// ==================== GET /api/materials ====================

export async function GET(request: NextRequest) {
  try {
    const query = parseQuery(request, materialsQuerySchema)
    const { page, pageSize, search, subjectId, classId, type, uploadedBy } = query

    const where: Record<string, unknown> = {}
    if (subjectId) where.subjectId = subjectId
    if (classId) where.classId = classId
    if (type) where.type = type
    if (uploadedBy) where.uploadedBy = uploadedBy

    if (search) {
      where.OR = [
        { title: { contains: search } },
        { description: { contains: search } },
      ]
    }

    const [materials, total] = await Promise.all([
      db.material.findMany({
        where,
        include: {
          subject: { select: { id: true, code: true, name: true } },
          class: { select: { id: true, code: true, name: true } },
          uploader: {
            select: { id: true, role: true, user: { select: { id: true, name: true, email: true } } },
          },
        },
        orderBy: [{ createdAt: 'desc' }],
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      db.material.count({ where }),
    ])

    return paginatedResponse(materials, total, page, pageSize)
  } catch (error) {
    return handleApiError(error)
  }
}

// ==================== POST /api/materials ====================

export async function POST(request: NextRequest) {
  try {
    const auth = getAuthProfile(request)
    const body = await parseBody(request, createMaterialSchema)

    // Verify subject exists if provided
    if (body.subjectId) {
      const subject = await db.subject.findUnique({ where: { id: body.subjectId } })
      if (!subject) return apiError('Subject not found', 404)
    }

    // Verify class exists if provided
    if (body.classId) {
      const classData = await db.class.findUnique({ where: { id: body.classId } })
      if (!classData) return apiError('Class not found', 404)
    }

    const material = await db.material.create({
      data: {
        title: body.title,
        description: body.description,
        type: body.type,
        fileUrl: body.fileUrl,
        fileSize: body.fileSize,
        subjectId: body.subjectId,
        classId: body.classId,
        uploadedBy: auth.id,
      },
      include: {
        subject: { select: { id: true, code: true, name: true } },
        class: { select: { id: true, code: true, name: true } },
        uploader: {
          select: { id: true, role: true, user: { select: { id: true, name: true, email: true } } },
        },
      },
    })

    await createAuditLog({
      action: 'CREATE',
      profileId: auth.id,
      resource: 'Material',
      resourceId: material.id,
      request,
    })

    return apiResponse(material, 201)
  } catch (error) {
    return handleApiError(error)
  }
}
