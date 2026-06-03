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

const updateMaterialSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  type: z.enum(['PDF', 'DOC', 'PPT', 'VIDEO', 'IMAGE', 'LINK', 'OTHER']).optional(),
  fileUrl: z.string().nullable().optional(),
  fileSize: z.number().int().positive().nullable().optional(),
  subjectId: z.string().nullable().optional(),
  classId: z.string().nullable().optional(),
})

// ==================== GET /api/materials/[id] ====================

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const material = await db.material.findUnique({
      where: { id },
      include: {
        subject: { select: { id: true, code: true, name: true, credits: true } },
        class: {
          select: {
            id: true, code: true, name: true,
            teacher: { select: { profile: { select: { firstName: true, lastName: true } } } },
            semester: { select: { name: true } },
          },
        },
        uploader: {
          select: { id: true, role: true, user: { select: { id: true, name: true, email: true, avatarUrl: true } } },
        },
      },
    })

    if (!material) {
      throw new NotFoundError('Material', id)
    }

    // Add download URL if file exists
    const downloadUrl = material.fileUrl
      ? `/api/materials/${id}/download`
      : null

    return apiResponse({
      ...material,
      downloadUrl,
    })
  } catch (error) {
    return handleApiError(error)
  }
}

// ==================== PUT /api/materials/[id] ====================

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const auth = getAuthProfile(request)
    const body = await parseBody(request, updateMaterialSchema)

    const existing = await db.material.findUnique({ where: { id } })
    if (!existing) {
      throw new NotFoundError('Material', id)
    }

    // Verify references
    if (body.subjectId) {
      const subject = await db.subject.findUnique({ where: { id: body.subjectId } })
      if (!subject) return apiError('Subject not found', 404)
    }
    if (body.classId) {
      const classData = await db.class.findUnique({ where: { id: body.classId } })
      if (!classData) return apiError('Class not found', 404)
    }

    const updated = await db.material.update({
      where: { id },
      data: {
        title: body.title,
        description: body.description,
        type: body.type,
        fileUrl: body.fileUrl,
        fileSize: body.fileSize,
        subjectId: body.subjectId,
        classId: body.classId,
      },
      include: {
        subject: { select: { id: true, code: true, name: true } },
        class: { select: { id: true, code: true, name: true } },
        uploader: {
          select: { id: true, role: true, profile: { select: { id: true, firstName: true, lastName: true, email: true } } },
        },
      },
    })

    await createAuditLog({
      action: 'UPDATE',
      profileId: auth.id,
      resource: 'Material',
      resourceId: id,
      request,
    })

    return apiResponse(updated)
  } catch (error) {
    return handleApiError(error)
  }
}

// ==================== DELETE /api/materials/[id] ====================

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const auth = getAuthProfile(request)

    const existing = await db.material.findUnique({ where: { id } })
    if (!existing) {
      throw new NotFoundError('Material', id)
    }

    // Only the uploader or admin/coordinator can delete
    if (existing.uploadedBy !== auth.id && auth.role !== 'ADMIN' && auth.role !== 'COORDINATOR') {
      return apiError('Only the uploader or an admin can delete this material', 403)
    }

    await db.material.delete({ where: { id } })

    await createAuditLog({
      action: 'DELETE',
      profileId: auth.id,
      resource: 'Material',
      resourceId: id,
      request,
    })

    return apiResponse({ message: 'Material deleted successfully' })
  } catch (error) {
    return handleApiError(error)
  }
}
