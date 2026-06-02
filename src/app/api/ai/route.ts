import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import {
  handleApiError,
  apiResponse,
} from '@/lib/api-utils'

// ==================== GET /api/ai ====================

export async function GET(request: NextRequest) {
  try {
    // AI endpoints info
    return apiResponse({
      message: 'ORKESTRANDO AI API',
      endpoints: {
        suggest: {
          method: 'POST',
          path: '/api/ai/suggest',
          description: 'AI-powered schedule suggestions',
        },
        conflicts: {
          method: 'POST',
          path: '/api/ai/conflicts',
          description: 'AI-powered conflict detection and prediction',
        },
        evasion: {
          method: 'POST',
          path: '/api/ai/evasion',
          description: 'AI-powered class evasion prediction',
        },
        report: {
          method: 'POST',
          path: '/api/ai/report',
          description: 'AI-powered report generation',
        },
      },
      note: 'AI features use data-driven algorithms. LLM integration can be added for enhanced capabilities.',
    })
  } catch (error) {
    return handleApiError(error)
  }
}
