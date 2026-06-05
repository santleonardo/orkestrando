// =============================================================================
// ORKESTRANDO - Conflict Detection Engine
// Moved to correct path: src/lib/scheduling/conflict-engine.ts
// Critical service for scheduling conflict detection
// =============================================================================

import type {
  ClassSession,
  TeacherAvailability,
  Holiday,
  TeacherBlock,
  Enrollment,
  ConflictError,
  ConflictWarning,
  ConflictReport,
  ValidationContext,
} from '@/lib/types'
import { isOverlapping, formatDate, isDateInRange, getDayOfWeekNumber } from '@/lib/utils/date'

export class ConflictEngine {
  /**
   * Checks if a new session conflicts with any existing teacher sessions.
   * A teacher cannot be in two places at the same time.
   */
  checkTeacherConflict(
    session: ClassSession,
    existingSessions: ClassSession[]
  ): { hasConflict: boolean; conflicts: ConflictError[] } {
    const conflicts: ConflictError[] = []

    for (const existing of existingSessions) {
      if (existing.teacherId !== session.teacherId) continue
      if (existing.date !== session.date) continue
      if (existing.status === 'cancelled') continue
      if (existing.id === session.id) continue

      if (isOverlapping(session.startTime, session.endTime, existing.startTime, existing.endTime)) {
        conflicts.push({
          type: 'teacher_overlap',
          severity: 'error',
          message: `Conflito de horário do professor: o professor já possui uma aula marcada (${existing.startTime} - ${existing.endTime}) na turma "${existing.classId}" em ${formatDate(existing.date)}.`,
          conflictingEntityId: existing.id,
          conflictingEntityName: `Sessão ${existing.id}`,
          details: {
            existingSessionId: existing.id,
            existingStartTime: existing.startTime,
            existingEndTime: existing.endTime,
            proposedStartTime: session.startTime,
            proposedEndTime: session.endTime,
          },
        })
      }
    }

    return { hasConflict: conflicts.length > 0, conflicts }
  }

  /**
   * Checks if a new session conflicts with any existing room usage.
   * A room can only host one class at a time.
   */
  checkRoomConflict(
    session: ClassSession,
    existingSessions: ClassSession[]
  ): { hasConflict: boolean; conflicts: ConflictError[] } {
    const conflicts: ConflictError[] = []

    if (!session.roomId) {
      return { hasConflict: false, conflicts }
    }

    for (const existing of existingSessions) {
      if (!existing.roomId || existing.roomId !== session.roomId) continue
      if (existing.date !== session.date) continue
      if (existing.status === 'cancelled') continue
      if (existing.id === session.id) continue

      if (isOverlapping(session.startTime, session.endTime, existing.startTime, existing.endTime)) {
        conflicts.push({
          type: 'room_overlap',
          severity: 'error',
          message: `Conflito de sala: a sala já está ocupada pela turma "${existing.classId}" (${existing.startTime} - ${existing.endTime}) em ${formatDate(existing.date)}.`,
          conflictingEntityId: existing.id,
          conflictingEntityName: `Sessão ${existing.id}`,
          details: {
            existingSessionId: existing.id,
            roomId: session.roomId,
            existingStartTime: existing.startTime,
            existingEndTime: existing.endTime,
            proposedStartTime: session.startTime,
            proposedEndTime: session.endTime,
          },
        })
      }
    }

    return { hasConflict: conflicts.length > 0, conflicts }
  }

  /**
   * Checks if a new session conflicts with student enrollments.
   * Students enrolled in both classes would have overlapping sessions.
   */
  checkStudentConflict(
    session: ClassSession,
    existingEnrollments: Enrollment[]
  ): { hasConflict: boolean; conflicts: ConflictError[] } {
    const conflicts: ConflictError[] = []

    const studentIdsInClass = existingEnrollments
      .filter((e) => e.classId === session.classId && e.status === 'active')
      .map((e) => e.studentId)

    const otherEnrollments = existingEnrollments.filter(
      (e) =>
        e.classId !== session.classId &&
        e.status === 'active' &&
        studentIdsInClass.includes(e.studentId)
    )

    if (otherEnrollments.length > 0) {
      conflicts.push({
        type: 'student_overlap',
        severity: 'warning',
        message: `${otherEnrollments.length} aluno(s) desta turma possuem matrícula em outras turmas que podem ter conflito de horário.`,
        conflictingEntityId: session.classId,
        conflictingEntityName: 'Conflito de matrícula',
        details: {
          affectedStudentCount: otherEnrollments.length,
          conflictingClassIds: [...new Set(otherEnrollments.map((e) => e.classId))],
        },
      })
    }

    return { hasConflict: conflicts.length > 0, conflicts }
  }

  /**
   * Checks if a session falls on a holiday.
   * Supports both exact date matches and recurring holidays (same month/day, different year).
   */
  checkHolidayConflict(
    session: ClassSession,
    holidays: Holiday[]
  ): { hasConflict: boolean; conflicts: ConflictError[] } {
    const conflicts: ConflictError[] = []

    for (const holiday of holidays) {
      if (!holiday.affectsClasses) continue

      const sessionDate = new Date(session.date)
      const holidayDate = new Date(holiday.date)

      const isRecurringMatch =
        holiday.isRecurring &&
        sessionDate.getMonth() === holidayDate.getMonth() &&
        sessionDate.getDate() === holidayDate.getDate()

      const isExactMatch =
        sessionDate.getFullYear() === holidayDate.getFullYear() &&
        sessionDate.getMonth() === holidayDate.getMonth() &&
        sessionDate.getDate() === holidayDate.getDate()

      if (isExactMatch || isRecurringMatch) {
        conflicts.push({
          type: 'holiday',
          severity: 'warning',
          message: `A sessão está agendada em um feriado: ${holiday.name} (${formatDate(holiday.date)}).`,
          conflictingEntityId: holiday.id,
          conflictingEntityName: holiday.name,
          details: {
            holidayId: holiday.id,
            holidayName: holiday.name,
            holidayType: holiday.type,
            isRecurring: holiday.isRecurring,
          },
        })
      }
    }

    return { hasConflict: conflicts.length > 0, conflicts }
  }

  /**
   * Checks if a session falls within a teacher vacation/block period.
   * Blocks of type vacation, sick_leave, etc. prevent scheduling.
   */
  checkVacationConflict(
    session: ClassSession,
    blocks: TeacherBlock[]
  ): { hasConflict: boolean; conflicts: ConflictError[] } {
    const conflicts: ConflictError[] = []

    for (const block of blocks) {
      if (block.teacherId !== session.teacherId) continue

      if (isDateInRange(session.date, block.startDate, block.endDate)) {
        const blockTypeLabels: Record<string, string> = {
          vacation: 'férias',
          sick_leave: 'licença médica',
          personal: 'ausência pessoal',
          conference: 'conferência',
          other: 'bloqueio',
        }

        const label = blockTypeLabels[block.blockType] || 'bloqueio'

        conflicts.push({
          type: 'vacation',
          severity: 'error',
          message: `O professor possui ${label} programado de ${formatDate(block.startDate)} a ${formatDate(block.endDate)}. A sessão não pode ser agendada neste período.`,
          conflictingEntityId: block.id,
          conflictingEntityName: label,
          details: {
            blockId: block.id,
            blockType: block.blockType,
            blockStartDate: block.startDate,
            blockEndDate: block.endDate,
            reason: block.reason,
          },
        })
      }
    }

    return { hasConflict: conflicts.length > 0, conflicts }
  }

  /**
   * Checks if a session is within the teacher's declared availability.
   * A warning is issued if the session is outside availability.
   */
  checkAvailabilityConflict(
    session: ClassSession,
    availability: TeacherAvailability[]
  ): { hasConflict: boolean; conflicts: ConflictError[] } {
    const conflicts: ConflictError[] = []

    const sessionDayOfWeek = getDayOfWeekNumber(session.date)

    const dayAvailability = availability.filter(
      (a) =>
        a.teacherId === session.teacherId &&
        a.dayOfWeek === sessionDayOfWeek &&
        a.status === 'approved'
    )

    if (dayAvailability.length === 0) {
      conflicts.push({
        type: 'availability_mismatch',
        severity: 'warning',
        message: `O professor não possui disponibilidade declarada para este dia da semana.`,
        conflictingEntityId: session.teacherId,
        conflictingEntityName: 'Sem disponibilidade',
        details: {
          teacherId: session.teacherId,
          dayOfWeek: sessionDayOfWeek,
        },
      })
      return { hasConflict: true, conflicts }
    }

    const isWithinAvailability = dayAvailability.some(
      (a) =>
        isOverlapping(session.startTime, session.endTime, a.startTime, a.endTime) &&
        session.startTime >= a.startTime &&
        session.endTime <= a.endTime
    )

    const isWithinValidityPeriod = dayAvailability.some((a) => {
      if (a.validFrom && session.date < a.validFrom) return false
      if (a.validUntil && session.date > a.validUntil) return false
      return true
    })

    if (!isWithinAvailability) {
      conflicts.push({
        type: 'availability_mismatch',
        severity: 'warning',
        message: `O horário da sessão (${session.startTime} - ${session.endTime}) está fora da disponibilidade declarada do professor para este dia.`,
        conflictingEntityId: session.teacherId,
        conflictingEntityName: 'Fora da disponibilidade',
        details: {
          teacherId: session.teacherId,
          dayOfWeek: sessionDayOfWeek,
          sessionStartTime: session.startTime,
          sessionEndTime: session.endTime,
          availableSlots: dayAvailability.map((a) => ({
            startTime: a.startTime,
            endTime: a.endTime,
          })),
        },
      })
    }

    if (!isWithinValidityPeriod) {
      conflicts.push({
        type: 'availability_mismatch',
        severity: 'warning',
        message: `A disponibilidade do professor não é válida para a data desta sessão.`,
        conflictingEntityId: session.teacherId,
        conflictingEntityName: 'Disponibilidade expirada',
        details: {
          teacherId: session.teacherId,
          sessionDate: session.date,
        },
      })
    }

    return { hasConflict: conflicts.length > 0, conflicts }
  }

  /**
   * Runs all conflict checks and returns a comprehensive report.
   * Errors (blocking) and warnings (non-blocking) are separated.
   */
  validateAllConflicts(
    session: ClassSession,
    context: ValidationContext
  ): ConflictReport {
    const errors: ConflictError[] = []
    const warnings: ConflictWarning[] = []

    // Teacher overlap - ERROR
    const teacherConflicts = this.checkTeacherConflict(session, context.existingSessions)
    errors.push(...teacherConflicts.conflicts)

    // Room overlap - ERROR
    const roomConflicts = this.checkRoomConflict(session, context.existingSessions)
    errors.push(...roomConflicts.conflicts)

    // Vacation block - ERROR
    const vacationConflicts = this.checkVacationConflict(session, context.teacherBlocks)
    errors.push(...vacationConflicts.conflicts)

    // Holiday - WARNING
    const holidayConflicts = this.checkHolidayConflict(session, context.holidays)
    for (const conflict of holidayConflicts.conflicts) {
      warnings.push({
        type: 'holiday',
        severity: 'medium',
        description: conflict.message,
        affectedEntityId: conflict.conflictingEntityId,
        affectedEntityName: conflict.conflictingEntityName,
        suggestion: 'Considere remarcar a aula para outro dia ou marcar como feriado.',
      })
    }

    // Availability mismatch - WARNING
    const availabilityConflicts = this.checkAvailabilityConflict(
      session,
      context.teacherAvailability
    )
    for (const conflict of availabilityConflicts.conflicts) {
      warnings.push({
        type: 'teacher_overlap',
        severity: 'low',
        description: conflict.message,
        affectedEntityId: conflict.conflictingEntityId,
        affectedEntityName: conflict.conflictingEntityName,
        suggestion: 'Verifique com o professor se este horário está correto.',
      })
    }

    // Student overlap - WARNING
    const studentConflicts = this.checkStudentConflict(session, context.existingEnrollments)
    for (const conflict of studentConflicts.conflicts) {
      warnings.push({
        type: 'student_overlap',
        severity: 'medium',
        description: conflict.message,
        affectedEntityId: conflict.conflictingEntityId,
        affectedEntityName: conflict.conflictingEntityName,
        suggestion: 'Verifique se os alunos afetados podem participar de ambas as turmas.',
      })
    }

    // Sort errors by severity
    errors.sort((a, b) => {
      const severityOrder = { error: 0, warning: 1 }
      return (severityOrder[a.severity] ?? 2) - (severityOrder[b.severity] ?? 2)
    })

    // Sort warnings by severity
    warnings.sort((a, b) => {
      const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 }
      return (severityOrder[a.severity] ?? 4) - (severityOrder[b.severity] ?? 4)
    })

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    }
  }
}
