// =============================================================================
// ORKESTRANDO - Academic Management System
// Audit Logging Library
// =============================================================================

import type { AuditLog } from '@/types';

// -----------------------------------------------------------------------------
// Audit Action Constants
// -----------------------------------------------------------------------------

export const AUDIT_ACTIONS = {
  // Auth
  AUTH_LOGIN: 'auth.login',
  AUTH_LOGOUT: 'auth.logout',
  AUTH_LOGIN_FAILED: 'auth.login_failed',
  AUTH_PASSWORD_RESET: 'auth.password_reset',
  AUTH_TOKEN_REFRESH: 'auth.token_refresh',

  // Organization
  ORG_CREATE: 'org.create',
  ORG_UPDATE: 'org.update',
  ORG_DELETE: 'org.delete',
  ORG_SETTINGS_UPDATE: 'org.settings_update',

  // Users & Profiles
  USER_CREATE: 'user.create',
  USER_UPDATE: 'user.update',
  USER_DELETE: 'user.delete',
  USER_ROLE_CHANGE: 'user.role_change',
  USER_IMPORT: 'user.import',
  USER_EXPORT: 'user.export',
  PROFILE_UPDATE: 'profile.update',

  // Teachers
  TEACHER_CREATE: 'teacher.create',
  TEACHER_UPDATE: 'teacher.update',
  TEACHER_DELETE: 'teacher.delete',
  TEACHER_AVAILABILITY_CREATE: 'teacher.availability.create',
  TEACHER_AVAILABILITY_UPDATE: 'teacher.availability.update',
  TEACHER_AVAILABILITY_DELETE: 'teacher.availability.delete',
  TEACHER_BLOCK_CREATE: 'teacher.block.create',
  TEACHER_BLOCK_UPDATE: 'teacher.block.update',
  TEACHER_BLOCK_DELETE: 'teacher.block.delete',
  TEACHER_BLOCK_APPROVE: 'teacher.block.approve',
  TEACHER_BLOCK_REJECT: 'teacher.block.reject',

  // Students
  STUDENT_CREATE: 'student.create',
  STUDENT_UPDATE: 'student.update',
  STUDENT_DELETE: 'student.delete',
  STUDENT_IMPORT: 'student.import',
  STUDENT_EXPORT: 'student.export',
  STUDENT_ENROLL: 'student.enroll',
  STUDENT_UNENROLL: 'student.unenroll',

  // Courses & Subjects
  COURSE_CREATE: 'course.create',
  COURSE_UPDATE: 'course.update',
  COURSE_DELETE: 'course.delete',
  SUBJECT_CREATE: 'subject.create',
  SUBJECT_UPDATE: 'subject.update',
  SUBJECT_DELETE: 'subject.delete',

  // Rooms
  ROOM_CREATE: 'room.create',
  ROOM_UPDATE: 'room.update',
  ROOM_DELETE: 'room.delete',

  // Semesters
  SEMESTER_CREATE: 'semester.create',
  SEMESTER_UPDATE: 'semester.update',
  SEMESTER_DELETE: 'semester.delete',
  SEMESTER_ACTIVATE: 'semester.activate',
  SEMESTER_DEACTIVATE: 'semester.deactivate',
  SEMESTER_SET_CURRENT: 'semester.set_current',

  // Holidays
  HOLIDAY_CREATE: 'holiday.create',
  HOLIDAY_UPDATE: 'holiday.update',
  HOLIDAY_DELETE: 'holiday.delete',

  // Classes
  CLASS_CREATE: 'class.create',
  CLASS_UPDATE: 'class.update',
  CLASS_DELETE: 'class.delete',
  CLASS_SESSION_CREATE: 'class.session.create',
  CLASS_SESSION_UPDATE: 'class.session.update',
  CLASS_SESSION_DELETE: 'class.session.delete',
  CLASS_SESSION_OPEN: 'class.session.open',
  CLASS_SESSION_CLOSE: 'class.session.close',
  CLASS_SESSION_CANCEL: 'class.session.cancel',

  // Attendance
  ATTENDANCE_RECORD: 'attendance.record',
  ATTENDANCE_BULK_RECORD: 'attendance.bulk_record',
  ATTENDANCE_UPDATE: 'attendance.update',
  ATTENDANCE_DELETE: 'attendance.delete',
  ATTENDANCE_SIGNATURE_OPEN: 'attendance.signature.open',
  ATTENDANCE_SIGNATURE_CLOSE: 'attendance.signature.close',

  // Materials
  MATERIAL_UPLOAD: 'material.upload',
  MATERIAL_UPDATE: 'material.update',
  MATERIAL_DELETE: 'material.delete',
  MATERIAL_DOWNLOAD: 'material.download',
  MATERIAL_PUBLISH: 'material.publish',
  MATERIAL_UNPUBLISH: 'material.unpublish',

  // Assignments
  ASSIGNMENT_CREATE: 'assignment.create',
  ASSIGNMENT_UPDATE: 'assignment.update',
  ASSIGNMENT_DELETE: 'assignment.delete',
  ASSIGNMENT_SUBMIT: 'assignment.submit',
  ASSIGNMENT_GRADE: 'assignment.grade',
  ASSIGNMENT_RETURN: 'assignment.return',

  // Messages
  MESSAGE_SEND: 'message.send',
  MESSAGE_EDIT: 'message.edit',
  MESSAGE_DELETE: 'message.delete',
  CONVERSATION_CREATE: 'conversation.create',
  ANNOUNCEMENT_CREATE: 'announcement.create',
  ANNOUNCEMENT_UPDATE: 'announcement.update',
  ANNOUNCEMENT_DELETE: 'announcement.delete',

  // Notifications
  NOTIFICATION_CREATE: 'notification.create',
  NOTIFICATION_READ: 'notification.read',
  NOTIFICATION_SEND: 'notification.send',
  NOTIFICATION_PREFERENCES_UPDATE: 'notification.preferences_update',

  // Reports
  REPORT_GENERATE: 'report.generate',
  REPORT_DOWNLOAD: 'report.download',
  REPORT_AI_GENERATE: 'report.ai_generate',

  // Schedule
  SCHEDULE_GENERATE: 'schedule.generate',
  SCHEDULE_UPDATE: 'schedule.update',
  SCHEDULE_CONFLICT_RESOLVE: 'schedule.conflict_resolve',

  // System
  SYSTEM_SETTINGS_UPDATE: 'system.settings_update',
  SYSTEM_BACKUP_CREATE: 'system.backup_create',
  SYSTEM_BACKUP_RESTORE: 'system.backup_restore',
} as const;

// -----------------------------------------------------------------------------
// Audit Resource Constants
// -----------------------------------------------------------------------------

export const AUDIT_RESOURCES = {
  ORGANIZATION: 'organization',
  USER: 'user',
  PROFILE: 'profile',
  TEACHER: 'teacher',
  STUDENT: 'student',
  COURSE: 'course',
  SUBJECT: 'subject',
  ROOM: 'room',
  SEMESTER: 'semester',
  HOLIDAY: 'holiday',
  CLASS: 'class',
  SESSION: 'session',
  ENROLLMENT: 'enrollment',
  ATTENDANCE: 'attendance',
  MATERIAL: 'material',
  ASSIGNMENT: 'assignment',
  SUBMISSION: 'submission',
  CONVERSATION: 'conversation',
  MESSAGE: 'message',
  NOTIFICATION: 'notification',
  REPORT: 'report',
  SCHEDULE: 'schedule',
  SYSTEM: 'system',
  AUTH: 'auth',
  AVAILABILITY: 'availability',
  BLOCK: 'block',
  ANNOUNCEMENT: 'announcement',
} as const;

// -----------------------------------------------------------------------------
// Log Action Parameters
// -----------------------------------------------------------------------------

export interface LogActionParams {
  orgId: string;
  profileId: string;
  action: string;
  resource: string;
  resourceId?: string;
  details?: string | Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
}

// -----------------------------------------------------------------------------
// logAction - Server-side Audit Logger
// -----------------------------------------------------------------------------

export async function logAction(params: LogActionParams): Promise<void> {
  const {
    orgId,
    profileId,
    action,
    resource,
    resourceId,
    details,
    ipAddress,
    userAgent,
  } = params;

  // Serialize details if it's an object
  const serializedDetails = typeof details === 'object'
    ? JSON.stringify(details)
    : details;

  try {
    // Dynamic import to avoid importing Prisma client at build-time
    // if this module is imported on the client side
    const { db } = await import('@/lib/db');

    await (db as any).auditLog.create({
      data: {
        orgId,
        profileId,
        action,
        resource,
        resourceId: resourceId ?? null,
        details: serializedDetails ?? null,
        ipAddress: ipAddress ?? null,
        userAgent: userAgent ?? null,
      },
    });
  } catch (error) {
    console.error('[AUDIT] Failed to log action:', {
      action,
      resource,
      resourceId,
      error,
    });
    // Don't throw - audit logging should never break the main flow
  }
}

// -----------------------------------------------------------------------------
// logActionSync - For use in API routes (returns a promise that can be awaited)
// -----------------------------------------------------------------------------

export function logActionSync(params: LogActionParams): void {
  // Fire-and-forget pattern - log in background
  logAction(params).catch((err) => {
    console.error('[AUDIT] Background logging failed:', err);
  });
}

// -----------------------------------------------------------------------------
// createAuditEntry - Creates an audit entry object without persisting
// Useful for testing or custom persistence strategies
// -----------------------------------------------------------------------------

export function createAuditEntry(
  params: LogActionParams
): Omit<AuditLog, 'id' | 'createdAt' | 'profile'> {
  const { orgId, profileId, action, resource, resourceId, details, ipAddress, userAgent } = params;

  return {
    orgId,
    profileId,
    action,
    resource,
    resourceId: resourceId ?? null,
    details: typeof details === 'object' ? JSON.stringify(details) : details ?? null,
    ipAddress: ipAddress ?? null,
    userAgent: userAgent ?? null,
  };
}

// -----------------------------------------------------------------------------
// formatAuditDetails - Formats audit details for display
// -----------------------------------------------------------------------------

export function formatAuditDetails(details: string | null): Record<string, unknown> {
  if (!details) return {};

  try {
    return JSON.parse(details);
  } catch {
    return { raw: details };
  }
}

// -----------------------------------------------------------------------------
// getActionLabel - Returns a human-readable label for audit actions
// -----------------------------------------------------------------------------

export function getActionLabel(action: string): string {
  const labels: Record<string, string> = {
    [AUDIT_ACTIONS.AUTH_LOGIN]: 'Login',
    [AUDIT_ACTIONS.AUTH_LOGOUT]: 'Logout',
    [AUDIT_ACTIONS.AUTH_LOGIN_FAILED]: 'Tentativa de Login Falhou',
    [AUDIT_ACTIONS.AUTH_PASSWORD_RESET]: 'Redefinição de Senha',
    [AUDIT_ACTIONS.ORG_CREATE]: 'Organização Criada',
    [AUDIT_ACTIONS.ORG_UPDATE]: 'Organização Atualizada',
    [AUDIT_ACTIONS.ORG_DELETE]: 'Organização Excluída',
    [AUDIT_ACTIONS.USER_CREATE]: 'Usuário Criado',
    [AUDIT_ACTIONS.USER_UPDATE]: 'Usuário Atualizado',
    [AUDIT_ACTIONS.USER_DELETE]: 'Usuário Excluído',
    [AUDIT_ACTIONS.USER_ROLE_CHANGE]: 'Papel do Usuário Alterado',
    [AUDIT_ACTIONS.PROFILE_UPDATE]: 'Perfil Atualizado',
    [AUDIT_ACTIONS.TEACHER_CREATE]: 'Professor Criado',
    [AUDIT_ACTIONS.TEACHER_UPDATE]: 'Professor Atualizado',
    [AUDIT_ACTIONS.TEACHER_DELETE]: 'Professor Excluído',
    [AUDIT_ACTIONS.TEACHER_AVAILABILITY_CREATE]: 'Disponibilidade do Professor Criada',
    [AUDIT_ACTIONS.TEACHER_AVAILABILITY_UPDATE]: 'Disponibilidade do Professor Atualizada',
    [AUDIT_ACTIONS.TEACHER_AVAILABILITY_DELETE]: 'Disponibilidade do Professor Excluída',
    [AUDIT_ACTIONS.STUDENT_CREATE]: 'Aluno Criado',
    [AUDIT_ACTIONS.STUDENT_UPDATE]: 'Aluno Atualizado',
    [AUDIT_ACTIONS.STUDENT_DELETE]: 'Aluno Excluído',
    [AUDIT_ACTIONS.STUDENT_ENROLL]: 'Aluno Matriculado',
    [AUDIT_ACTIONS.STUDENT_UNENROLL]: 'Aluno Desmatriculado',
    [AUDIT_ACTIONS.COURSE_CREATE]: 'Curso Criado',
    [AUDIT_ACTIONS.COURSE_UPDATE]: 'Curso Atualizado',
    [AUDIT_ACTIONS.COURSE_DELETE]: 'Curso Excluído',
    [AUDIT_ACTIONS.SUBJECT_CREATE]: 'Disciplina Criada',
    [AUDIT_ACTIONS.SUBJECT_UPDATE]: 'Disciplina Atualizada',
    [AUDIT_ACTIONS.SUBJECT_DELETE]: 'Disciplina Excluída',
    [AUDIT_ACTIONS.ROOM_CREATE]: 'Sala Criada',
    [AUDIT_ACTIONS.ROOM_UPDATE]: 'Sala Atualizada',
    [AUDIT_ACTIONS.ROOM_DELETE]: 'Sala Excluída',
    [AUDIT_ACTIONS.SEMESTER_CREATE]: 'Semestre Criado',
    [AUDIT_ACTIONS.SEMESTER_UPDATE]: 'Semestre Atualizado',
    [AUDIT_ACTIONS.SEMESTER_DELETE]: 'Semestre Excluído',
    [AUDIT_ACTIONS.SEMESTER_ACTIVATE]: 'Semestre Ativado',
    [AUDIT_ACTIONS.CLASS_CREATE]: 'Turma Criada',
    [AUDIT_ACTIONS.CLASS_UPDATE]: 'Turma Atualizada',
    [AUDIT_ACTIONS.CLASS_DELETE]: 'Turma Excluída',
    [AUDIT_ACTIONS.ATTENDANCE_RECORD]: 'Frequência Registrada',
    [AUDIT_ACTIONS.ATTENDANCE_BULK_RECORD]: 'Frequência em Massa Registrada',
    [AUDIT_ACTIONS.ATTENDANCE_UPDATE]: 'Frequência Atualizada',
    [AUDIT_ACTIONS.CLASS_SESSION_OPEN]: 'Aula Iniciada',
    [AUDIT_ACTIONS.CLASS_SESSION_CLOSE]: 'Aula Encerrada',
    [AUDIT_ACTIONS.MATERIAL_UPLOAD]: 'Material Enviado',
    [AUDIT_ACTIONS.MATERIAL_DELETE]: 'Material Excluído',
    [AUDIT_ACTIONS.ASSIGNMENT_CREATE]: 'Atividade Criada',
    [AUDIT_ACTIONS.ASSIGNMENT_SUBMIT]: 'Atividade Entregue',
    [AUDIT_ACTIONS.ASSIGNMENT_GRADE]: 'Atividade Avaliada',
    [AUDIT_ACTIONS.MESSAGE_SEND]: 'Mensagem Enviada',
    [AUDIT_ACTIONS.ANNOUNCEMENT_CREATE]: 'Comunicado Criado',
    [AUDIT_ACTIONS.NOTIFICATION_SEND]: 'Notificação Enviada',
    [AUDIT_ACTIONS.REPORT_GENERATE]: 'Relatório Gerado',
    [AUDIT_ACTIONS.REPORT_AI_GENERATE]: 'Relatório IA Gerado',
    [AUDIT_ACTIONS.SCHEDULE_GENERATE]: 'Grade Horária Gerada',
  };

  return labels[action] || action;
}

// -----------------------------------------------------------------------------
// getResourceLabel - Returns a human-readable label for resources
// -----------------------------------------------------------------------------

export function getResourceLabel(resource: string): string {
  const labels: Record<string, string> = {
    [AUDIT_RESOURCES.ORGANIZATION]: 'Organização',
    [AUDIT_RESOURCES.USER]: 'Usuário',
    [AUDIT_RESOURCES.PROFILE]: 'Perfil',
    [AUDIT_RESOURCES.TEACHER]: 'Professor',
    [AUDIT_RESOURCES.STUDENT]: 'Aluno',
    [AUDIT_RESOURCES.COURSE]: 'Curso',
    [AUDIT_RESOURCES.SUBJECT]: 'Disciplina',
    [AUDIT_RESOURCES.ROOM]: 'Sala',
    [AUDIT_RESOURCES.SEMESTER]: 'Semestre',
    [AUDIT_RESOURCES.HOLIDAY]: 'Feriado',
    [AUDIT_RESOURCES.CLASS]: 'Turma',
    [AUDIT_RESOURCES.SESSION]: 'Sessão de Aula',
    [AUDIT_RESOURCES.ENROLLMENT]: 'Matrícula',
    [AUDIT_RESOURCES.ATTENDANCE]: 'Frequência',
    [AUDIT_RESOURCES.MATERIAL]: 'Material',
    [AUDIT_RESOURCES.ASSIGNMENT]: 'Atividade',
    [AUDIT_RESOURCES.SUBMISSION]: 'Entrega',
    [AUDIT_RESOURCES.CONVERSATION]: 'Conversa',
    [AUDIT_RESOURCES.MESSAGE]: 'Mensagem',
    [AUDIT_RESOURCES.NOTIFICATION]: 'Notificação',
    [AUDIT_RESOURCES.REPORT]: 'Relatório',
    [AUDIT_RESOURCES.SCHEDULE]: 'Grade Horária',
    [AUDIT_RESOURCES.SYSTEM]: 'Sistema',
    [AUDIT_RESOURCES.AUTH]: 'Autenticação',
    [AUDIT_RESOURCES.AVAILABILITY]: 'Disponibilidade',
    [AUDIT_RESOURCES.BLOCK]: 'Bloqueio',
    [AUDIT_RESOURCES.ANNOUNCEMENT]: 'Comunicado',
  };

  return labels[resource] || resource;
}

// -----------------------------------------------------------------------------
// getChangesDescription - Creates a human-readable description of changes
// -----------------------------------------------------------------------------

export function getChangesDescription(
  action: string,
  oldData?: Record<string, unknown> | null,
  newData?: Record<string, unknown> | null
): string {
  if (action.includes('create')) return 'Registro criado';
  if (action.includes('delete')) return 'Registro excluído';
  if (action.includes('login') || action.includes('logout')) return '';

  if (!oldData || !newData) return '';

  const changes: string[] = [];
  const allKeys = new Set([...Object.keys(oldData), ...Object.keys(newData)]);

  for (const key of allKeys) {
    if (key === 'updatedAt' || key === 'createdAt' || key === 'id') continue;

    const oldVal = oldData[key];
    const newVal = newData[key];

    if (JSON.stringify(oldVal) !== JSON.stringify(newVal)) {
      changes.push(`${key}: ${oldVal ?? '(vazio)'} → ${newVal ?? '(vazio)'}`);
    }
  }

  return changes.length > 0 ? changes.join(', ') : '';
}
