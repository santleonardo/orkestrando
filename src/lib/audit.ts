import { db } from '@/lib/db'

export async function logAudit(
  action: string,
  entity: string,
  entityId?: string,
  details?: string,
  userId?: string,
  ipAddress?: string,
  userAgent?: string
) {
  try {
    await db.auditLog.create({
      data: {
        action,
        entity,
        entityId,
        details: details ? JSON.stringify(details) : undefined,
        userId,
        ipAddress,
        userAgent,
      },
    })
  } catch (error) {
    console.error('Audit log error:', error)
  }
}
