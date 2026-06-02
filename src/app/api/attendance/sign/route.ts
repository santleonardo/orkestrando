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

// ==================== Schema ====================

const signAttendanceSchema = z.object({
  classSessionId: z.string().min(1, 'Class session ID is required'),
  signatureData: z.string().min(1, 'Digital signature data is required'),
})

// ==================== POST /api/attendance/sign ====================

export async function POST(request: NextRequest) {
  try {
    const auth = getAuthProfile(request)
    const body = await parseBody(request, signAttendanceSchema)

    // Verify class session exists
    const session = await db.classSession.findUnique({
      where: { id: body.classSessionId },
      include: {
        class: {
          include: {
            teacher: { select: { id: true, user: { select: { name: true } } } },
          },
        },
      },
    })
    if (!session) {
      return apiError('Class session not found', 404)
    }

    // Check if session is already signed
    if (session.signature) {
      return apiError('This session has already been signed', 400)
    }

    // Validate that the signer is the class teacher (or admin/coordinator)
    if (session.class.teacherId !== auth.id && auth.role !== 'ADMIN' && auth.role !== 'COORDINATOR') {
      return apiError('Only the class teacher can sign attendance', 403)
    }

    // Update session with digital signature
    const signedSession = await db.classSession.update({
      where: { id: body.classSessionId },
      data: {
        signature: body.signatureData,
        signedAt: new Date(),
      },
      include: {
        class: {
          select: {
            id: true, code: true, name: true,
            subject: { select: { code: true, name: true } },
          },
        },
        _count: { select: { attendance: true } },
      },
    })

    await createAuditLog({
      action: 'UPDATE',
      profileId: auth.id,
      resource: 'ClassSession',
      resourceId: body.classSessionId,
      details: { action: 'signed' },
      request,
    })

    return apiResponse({
      message: 'Attendance signed successfully',
      session: signedSession,
      signedAt: signedSession.signedAt,
    })
  } catch (error) {
    return handleApiError(error)
  }
}
