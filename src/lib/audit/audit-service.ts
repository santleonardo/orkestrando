// =============================================================================
// ORKESTRANDO - Audit Service
// Moved to correct path: src/lib/audit/audit-service.ts
// Tracks all system actions for compliance and accountability
// Uses Supabase for persistent audit log storage
// =============================================================================

import { v4 as uuidv4 } from 'uuid'
import type { AuditLog, AuditAction, AuditFilter } from '@/lib/types'

// Action constants for ALL audit event types
export const ACTIONS = {
  LOGIN: 'login' as AuditAction,
  LOGOUT: 'logout' as AuditAction,
  UPLOAD: 'upload' as AuditAction,
  DOWNLOAD: 'download' as AuditAction,
  CREATE: 'create' as AuditAction,
  UPDATE: 'update' as AuditAction,
  DELETE: 'delete' as AuditAction,
  SIGNATURE: 'signature' as AuditAction,
  ATTENDANCE: 'attendance' as AuditAction,
  MESSAGE: 'message' as AuditAction,
  ENROLLMENT: 'enrollment' as AuditAction,
  SCHEDULE: 'schedule' as AuditAction,
  VIEW: 'view' as AuditAction,
} as const

// Portuguese labels for all actions
export const ACTION_LABELS: Record<string, string> = {
  login: 'Login',
  logout: 'Logout',
  upload: 'Upload de Arquivo',
  download: 'Download de Arquivo',
  create: 'Criação',
  update: 'Atualização',
  delete: 'Exclusão',
  signature: 'Assinatura Digital',
  attendance: 'Registro de Frequência',
  message: 'Mensagem',
  enrollment: 'Matrícula',
  schedule: 'Agendamento',
  view: 'Visualização',
}

export class AuditService {
  private organizationId: string

  constructor(organizationId: string) {
    this.organizationId = organizationId
  }

  /**
   * Logs an action to the audit trail via Supabase.
   * Falls back gracefully if Supabase is unavailable.
   */
  async log(
    action: AuditAction,
    entity: string,
    entityId: string,
    userId: string,
    metadata?: Record<string, unknown>,
    previousValues?: Record<string, unknown>,
    newValues?: Record<string, unknown>,
    ipAddress?: string,
    userAgent?: string
  ): Promise<AuditLog> {
    const auditLog: AuditLog = {
      id: uuidv4(),
      organizationId: this.organizationId,
      userId,
      action,
      entity,
      entityId,
      metadata,
      previousValues,
      newValues,
      ipAddress,
      userAgent,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    try {
      const { createServiceSupabaseClient } = await import('@/lib/supabase/server')
      const supabase = await createServiceSupabaseClient()

      const { error } = await supabase
        .from('audit_logs')
        .insert({
          id: auditLog.id,
          organization_id: this.organizationId,
          user_id: userId,
          action: auditLog.action,
          entity,
          entity_id: entityId,
          metadata: auditLog.metadata ?? null,
          previous_values: auditLog.previousValues ?? null,
          new_values: auditLog.newValues ?? null,
          ip_address: ipAddress ?? null,
          user_agent: userAgent ?? null,
          created_at: auditLog.createdAt,
          updated_at: auditLog.updatedAt,
        })

      if (error) {
        // Log to console as fallback when Supabase insert fails
        console.error(
          `[AUDIT] Falha ao registrar no Supabase: ${error.message}. Log em memória: ${ACTION_LABELS[action] || action} | Entity: ${entity} | ID: ${entityId} | User: ${userId}`
        )
      }
    } catch {
      // Supabase not available — log to console as fallback
      console.log(
        `[AUDIT] ${ACTION_LABELS[action] || action} | Entity: ${entity} | ID: ${entityId} | User: ${userId}`
      )
    }

    return auditLog
  }

  /**
   * Retrieves audit logs with optional filters via Supabase.
   */
  async getLogs(filters: AuditFilter): Promise<{ logs: AuditLog[]; total: number }> {
    const {
      organizationId,
      userId,
      action,
      entity,
      entityId,
      startDate,
      endDate,
      limit = 50,
      offset = 0,
    } = filters

    try {
      const { createServiceSupabaseClient } = await import('@/lib/supabase/server')
      const supabase = await createServiceSupabaseClient()

      let query = supabase
        .from('audit_logs')
        .select('*', { count: 'exact' })
        .eq('organization_id', organizationId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1)

      if (userId) query = query.eq('user_id', userId)
      if (action) query = query.eq('action', action)
      if (entity) query = query.eq('entity', entity)
      if (entityId) query = query.eq('entity_id', entityId)
      if (startDate) query = query.gte('created_at', startDate)
      if (endDate) query = query.lte('created_at', endDate)

      const { data, error, count } = await query

      if (error || !data) {
        return { logs: [], total: 0 }
      }

      // Map snake_case columns to camelCase
      const logs: AuditLog[] = data.map((row: Record<string, unknown>) => ({
        id: row.id as string,
        organizationId: row.organization_id as string,
        userId: row.user_id as string,
        action: row.action as AuditAction,
        entity: row.entity as string,
        entityId: row.entity_id as string,
        ipAddress: row.ip_address as string | undefined,
        userAgent: row.user_agent as string | undefined,
        metadata: (row.metadata as Record<string, unknown>) ?? undefined,
        previousValues: (row.previous_values as Record<string, unknown>) ?? undefined,
        newValues: (row.new_values as Record<string, unknown>) ?? undefined,
        createdAt: row.created_at as string,
        updatedAt: row.updated_at as string,
      }))

      return { logs, total: count ?? 0 }
    } catch {
      return { logs: [], total: 0 }
    }
  }

  /**
   * Gets audit logs for a specific entity.
   */
  async getEntityHistory(
    entity: string,
    entityId: string,
    limit: number = 20
  ): Promise<AuditLog[]> {
    try {
      const { createServiceSupabaseClient } = await import('@/lib/supabase/server')
      const supabase = await createServiceSupabaseClient()

      const { data, error } = await supabase
        .from('audit_logs')
        .select('*')
        .eq('organization_id', this.organizationId)
        .eq('entity', entity)
        .eq('entity_id', entityId)
        .order('created_at', { ascending: false })
        .limit(limit)

      if (error || !data) return []

      return data.map((row: Record<string, unknown>) => ({
        id: row.id as string,
        organizationId: row.organization_id as string,
        userId: row.user_id as string,
        action: row.action as AuditAction,
        entity: row.entity as string,
        entityId: row.entity_id as string,
        ipAddress: row.ip_address as string | undefined,
        userAgent: row.user_agent as string | undefined,
        metadata: (row.metadata as Record<string, unknown>) ?? undefined,
        previousValues: (row.previous_values as Record<string, unknown>) ?? undefined,
        newValues: (row.new_values as Record<string, unknown>) ?? undefined,
        createdAt: row.created_at as string,
        updatedAt: row.updated_at as string,
      }))
    } catch {
      return []
    }
  }

  /**
   * Gets audit logs for a specific user.
   */
  async getUserActivity(
    userId: string,
    limit: number = 50
  ): Promise<AuditLog[]> {
    try {
      const { createServiceSupabaseClient } = await import('@/lib/supabase/server')
      const supabase = await createServiceSupabaseClient()

      const { data, error } = await supabase
        .from('audit_logs')
        .select('*')
        .eq('organization_id', this.organizationId)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit)

      if (error || !data) return []

      return data.map((row: Record<string, unknown>) => ({
        id: row.id as string,
        organizationId: row.organization_id as string,
        userId: row.user_id as string,
        action: row.action as AuditAction,
        entity: row.entity as string,
        entityId: row.entity_id as string,
        ipAddress: row.ip_address as string | undefined,
        userAgent: row.user_agent as string | undefined,
        metadata: (row.metadata as Record<string, unknown>) ?? undefined,
        previousValues: (row.previous_values as Record<string, unknown>) ?? undefined,
        newValues: (row.new_values as Record<string, unknown>) ?? undefined,
        createdAt: row.created_at as string,
        updatedAt: row.updated_at as string,
      }))
    } catch {
      return []
    }
  }

  /**
   * Exports audit logs as JSON for compliance reporting.
   */
  async exportLogs(filters: AuditFilter): Promise<string> {
    const { logs, total } = await this.getLogs({ ...filters, limit: 10000 })

    const exportData = {
      exportDate: new Date().toISOString(),
      organizationId: this.organizationId,
      totalRecords: total,
      filters,
      logs: logs.map((log) => ({
        timestamp: log.createdAt,
        action: ACTION_LABELS[log.action] || log.action,
        user: log.userId,
        entity: log.entity,
        entityId: log.entityId,
        metadata: log.metadata,
        ipAddress: log.ipAddress,
      })),
    }

    return JSON.stringify(exportData, null, 2)
  }
}

/**
 * Creates an audit service instance for the given organization.
 */
export function createAuditService(organizationId: string): AuditService {
  return new AuditService(organizationId)
}
