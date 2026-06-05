// =============================================================================
// ORKESTRANDO - Session Generator Service
// Moved to correct path: src/lib/scheduling/session-generator.ts
// Generates recurring class sessions for a semester
// =============================================================================

import { v4 as uuidv4 } from 'uuid'
import type { Class, ClassSession, Holiday, TeacherBlock } from '@/lib/types'
import {
  generateRecurringDates,
  isDateInRange,
  formatDate,
  isHoliday as checkIsHoliday,
  isBlockedDate,
  getDayOfWeekNumber,
} from '@/lib/utils/date'

export interface GenerationOptions {
  /** Skip sessions that fall on holidays */
  skipHolidays?: boolean
  /** Skip sessions that fall during teacher blocks */
  skipBlocks?: boolean
  /** Generate sessions only for specific months (0-indexed) */
  onlyMonths?: number[]
  /** Maximum number of sessions to generate */
  maxSessions?: number
  /** Starting session number (for numbering) */
  startNumber?: number
}

export interface GenerationResult {
  sessions: ClassSession[]
  skippedDates: SkippedDate[]
  warnings: string[]
  totalSessions: number
  skippedCount: number
}

export interface SkippedDate {
  date: string
  reason: string
  holidayName?: string
  blockType?: string
}

export class SessionGenerator {
  /**
   * Generates all class sessions for a given class within the semester period.
   * Automatically skips holidays, vacation periods, blocked dates, and weekends.
   *
   * @param classData - The class (turma) definition with schedule info
   * @param semesterStart - Start date of the semester
   * @param semesterEnd - End date of the semester
   * @param holidays - List of holidays to skip
   * @param blocks - List of teacher blocks to skip
   * @param options - Generation options
   * @returns GenerationResult with sessions and metadata
   */
  generateSessions(
    classData: Class,
    semesterStart: Date,
    semesterEnd: Date,
    holidays: Holiday[] = [],
    blocks: TeacherBlock[] = [],
    options: GenerationOptions = {}
  ): GenerationResult {
    const result: GenerationResult = {
      sessions: [],
      skippedDates: [],
      warnings: [],
      totalSessions: 0,
      skippedCount: 0,
    }

    const {
      skipHolidays = true,
      skipBlocks = true,
      onlyMonths,
      maxSessions = 200,
      startNumber = 1,
    } = options

    // Validate inputs
    if (classData.dayOfWeek === undefined || classData.dayOfWeek === null) {
      result.warnings.push('Turma não possui dia da semana definido. Nenhuma aula gerada.')
      return result
    }

    if (!classData.startTime || !classData.endTime) {
      result.warnings.push('Turma não possui horário definido. Nenhuma aula gerada.')
      return result
    }

    // Use class dates if available, otherwise use semester dates
    const classStart = classData.startDate
      ? new Date(classData.startDate)
      : semesterStart
    const classEnd = classData.endDate
      ? new Date(classData.endDate)
      : semesterEnd

    // Ensure class dates are within semester bounds
    const effectiveStart =
      classStart > semesterStart ? classStart : semesterStart
    const effectiveEnd =
      classEnd < semesterEnd ? classEnd : semesterEnd

    // Validate effective date range
    if (effectiveStart >= effectiveEnd) {
      result.warnings.push(
        'Período efetivo da turma é inválido (início >= fim). Nenhuma aula gerada.'
      )
      return result
    }

    // Generate all recurring dates for the specified day of week
    const recurringDates = generateRecurringDates(
      effectiveStart,
      effectiveEnd,
      classData.dayOfWeek
    )

    if (recurringDates.length === 0) {
      result.warnings.push(
        `Nenhuma data encontrada para o dia da semana ${classData.dayOfWeek} no período especificado.`
      )
      return result
    }

    // Filter teacher blocks for this class's teacher
    const teacherBlocks = skipBlocks
      ? blocks.filter((b) => b.teacherId === classData.teacherId)
      : []

    // Track session numbering
    let sessionNumber = startNumber

    // Generate sessions for each date
    for (const date of recurringDates) {
      const dateStr = date.toISOString().split('T')[0]

      // Skip weekends (Saturday=6, Sunday=0)
      const dayOfWeek = getDayOfWeekNumber(date)
      if (dayOfWeek === 0 || dayOfWeek === 6) {
        result.skippedDates.push({
          date: dateStr,
          reason: 'weekend',
        })
        result.skippedCount++
        continue
      }

      // Stop if we've reached the max
      if (result.sessions.length >= maxSessions) {
        result.warnings.push(
          `Limite máximo de ${maxSessions} sessões atingido. Geração interrompida.`
        )
        break
      }

      // Filter by specific months if specified
      if (onlyMonths && !onlyMonths.includes(date.getMonth())) {
        continue
      }

      // Check holiday
      if (skipHolidays) {
        const holiday = holidays.find((h) => checkIsHoliday(date, [h]))
        if (holiday) {
          result.skippedDates.push({
            date: dateStr,
            reason: 'holiday',
            holidayName: holiday.name,
          })
          result.skippedCount++
          continue
        }
      }

      // Check teacher blocks
      if (skipBlocks) {
        const isBlocked = isBlockedDate(date, teacherBlocks)
        if (isBlocked) {
          const block = teacherBlocks.find((b) =>
            isDateInRange(date, b.startDate, b.endDate)
          )
          result.skippedDates.push({
            date: dateStr,
            reason: 'block',
            blockType: block?.blockType,
          })
          result.skippedCount++
          continue
        }
      }

      // Create the session
      const session: ClassSession = {
        id: uuidv4(),
        classId: classData.id,
        teacherId: classData.teacherId,
        roomId: classData.roomId,
        date: dateStr,
        startTime: classData.startTime,
        endTime: classData.endTime,
        status: 'scheduled',
        topic: `Aula ${sessionNumber}`,
        attendanceRecorded: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      result.sessions.push(session)
      sessionNumber++
    }

    result.totalSessions = result.sessions.length

    // Generate summary warnings
    if (result.skippedCount > 0) {
      result.warnings.push(
        `${result.skippedCount} aula(s) foram puladas devido a feriados, bloqueios do professor ou fins de semana.`
      )
    }

    if (result.totalSessions === 0 && recurringDates.length > 0) {
      result.warnings.push(
        `Todas as ${recurringDates.length} datas possíveis foram puladas. Verifique os feriados e bloqueios.`
      )
    }

    return result
  }

  /**
   * Generates sessions for multiple classes at once, returning a map
   * of classId -> GenerationResult.
   */
  generateSessionsBatch(
    classes: Class[],
    semesterStart: Date,
    semesterEnd: Date,
    holidays: Holiday[] = [],
    blocks: TeacherBlock[] = [],
    options: GenerationOptions = {}
  ): Map<string, GenerationResult> {
    const results = new Map<string, GenerationResult>()

    for (const classData of classes) {
      const result = this.generateSessions(
        classData,
        semesterStart,
        semesterEnd,
        holidays,
        blocks,
        options
      )
      results.set(classData.id, result)
    }

    return results
  }

  /**
   * Reschedules a specific session to a new date/time,
   * returning the updated session object.
   */
  rescheduleSession(
    session: ClassSession,
    newDate: string,
    newStartTime: string,
    newEndTime: string,
    reason?: string
  ): ClassSession {
    return {
      ...session,
      date: newDate,
      startTime: newStartTime,
      endTime: newEndTime,
      status: 'rescheduled',
      notes: reason
        ? `Remarcada: ${reason}. Data original: ${formatDate(session.date)} (${session.startTime}-${session.endTime}).`
        : `Remarcada de ${formatDate(session.date)} (${session.startTime}-${session.endTime}).`,
      updatedAt: new Date().toISOString(),
    }
  }

  /**
   * Cancels a session, returning the updated session object.
   */
  cancelSession(
    session: ClassSession,
    reason?: string
  ): ClassSession {
    return {
      ...session,
      status: 'cancelled',
      notes: reason
        ? `Cancelada: ${reason}`
        : session.notes,
      updatedAt: new Date().toISOString(),
    }
  }

  /**
   * Creates a replacement session for a cancelled session on a new date.
   */
  createReplacementSession(
    cancelledSession: ClassSession,
    newDate: string
  ): ClassSession {
    return {
      id: uuidv4(),
      classId: cancelledSession.classId,
      teacherId: cancelledSession.teacherId,
      roomId: cancelledSession.roomId,
      date: newDate,
      startTime: cancelledSession.startTime,
      endTime: cancelledSession.endTime,
      status: 'scheduled',
      topic: cancelledSession.topic
        ? `${cancelledSession.topic} (Reposição)`
        : 'Aula de reposição',
      description: cancelledSession.description,
      materials: cancelledSession.materials,
      attendanceRecorded: false,
      notes: `Sessão de reposição para a aula cancelada de ${formatDate(cancelledSession.date)}.`,
      substituteTeacherId: cancelledSession.substituteTeacherId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
  }
}
