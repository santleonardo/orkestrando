import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import {
  handleApiError,
  apiResponse,
  NotFoundError,
} from '@/lib/api-utils'

// ==================== GET /api/reports/[id] ====================

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const report = await db.report.findUnique({
      where: { id },
      include: {
        generator: {
          select: { id: true, role: true, user: { select: { id: true, name: true, email: true, avatarUrl: true } } },
        },
      },
    })

    if (!report) {
      throw new NotFoundError('Report', id)
    }

    // Parse JSON fields
    const parsedParameters = report.parameters ? JSON.parse(report.parameters) : null
    const parsedResult = report.result ? JSON.parse(report.result) : null

    return apiResponse({
      ...report,
      parameters: parsedParameters,
      result: parsedResult,
    })
  } catch (error) {
    return handleApiError(error)
  }
}
