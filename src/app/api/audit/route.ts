import { NextRequest, NextResponse } from 'next/server'
import { getStore, paginate, getProfile } from '@/lib/supabase/data-store'
import type { AuditLog, AuditAction, ApiResponse, PaginatedResponse } from '@/lib/types'

// GET /api/audit - List audit logs with filters
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const userId = searchParams.get('userId')
    const action = searchParams.get('action')
    const entity = searchParams.get('entity')
    const entityId = searchParams.get('entityId')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    const store = getStore()
    let logs = [...store.auditLogs]

    // Filters
    if (userId) {
      logs = logs.filter((l) => l.userId === userId)
    }
    if (action) {
      logs = logs.filter((l) => l.action === action)
    }
    if (entity) {
      logs = logs.filter((l) => l.entity === entity)
    }
    if (entityId) {
      logs = logs.filter((l) => l.entityId === entityId)
    }
    if (startDate) {
      logs = logs.filter((l) => l.createdAt >= startDate)
    }
    if (endDate) {
      logs = logs.filter((l) => l.createdAt <= endDate)
    }

    // Sort by most recent
    logs.sort((a, b) => b.createdAt.localeCompare(a.createdAt))

    const result = paginate(logs, page, limit)

    // Action labels for display
    const actionLabels: Record<string, string> = {
      login: 'Login',
      logout: 'Logout',
      upload: 'Upload',
      download: 'Download',
      create: 'Criação',
      update: 'Atualização',
      delete: 'Exclusão',
      signature: 'Assinatura Digital',
      attendance: 'Frequência',
      message: 'Mensagem',
      enrollment: 'Matrícula',
      schedule: 'Agendamento',
    }

    // Enrich with user names
    const enrichedData = result.data.map((log) => {
      const userProfile = getProfile(log.userId)
      return {
        ...log,
        actionLabel: actionLabels[log.action] || log.action,
        userName: userProfile.fullName,
        userRole: userProfile.email.includes('aluno') ? 'student' : userProfile.email.includes('escola') ? 'teacher' : 'admin',
      }
    })

    // Summary counts
    const actionSummary = Object.entries(
      store.auditLogs.reduce((acc, log) => {
        acc[log.action] = (acc[log.action] || 0) + 1
        return acc
      }, {} as Record<string, number>)
    ).map(([action, count]) => ({
      action,
      label: actionLabels[action] || action,
      count,
    }))

    return NextResponse.json<PaginatedResponse<AuditLog & {
      actionLabel: string; userName: string; userRole: string
    }>>({
      data: enrichedData,
      pagination: result.pagination,
      actionSummary,
    })
  } catch (error) {
    console.error('[API/audit] GET error:', error)
    return NextResponse.json<ApiResponse>(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Erro interno do servidor' } },
      { status: 500 }
    )
  }
}
