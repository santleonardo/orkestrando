// =============================================================================
// ORKESTRANDO - Audit Middleware
// Automatic audit logging for API routes
// =============================================================================

import { NextRequest, NextResponse } from 'next/server'
import { createAuditService } from '@/lib/audit/audit-service'

// Actions that should be audited
const AUDITED_METHODS = ['POST', 'PUT', 'PATCH', 'DELETE']

// Entities extracted from URL paths
const ENTITY_MAP: Record<string, string> = {
  '/api/teachers': 'teacher',
  '/api/students': 'student',
  '/api/classes': 'class',
  '/api/rooms': 'room',
  '/api/courses': 'course',
  '/api/subjects': 'subject',
  '/api/availability': 'availability',
  '/api/schedule': 'session',
  '/api/materials': 'material',
  '/api/messages': 'message',
  '/api/attendance': 'attendance',
  '/api/enrollments': 'enrollment',
  '/api/semesters': 'semester',
  '/api/holidays': 'holiday',
  '/api/notifications': 'notification',
}

export async function auditMiddleware(
  request: NextRequest,
  response: NextResponse,
  userId?: string
): Promise<void> {
  if (!AUDITED_METHODS.includes(request.method)) return

  const path = request.nextUrl.pathname
  const entity = ENTITY_MAP[path] || 'unknown'
  const action = request.method.toLowerCase() as 'post' | 'put' | 'patch' | 'delete'

  // Try to get user from Supabase
  let extractedUserId = userId || 'anonymous'

  try {
    const audit = createAuditService('system')
    await audit.log(action, entity, 'auto', extractedUserId, {
      path,
      method: request.method,
      userAgent: request.headers.get('user-agent'),
    })
  } catch {
    // Audit should never break the request
  }
}
