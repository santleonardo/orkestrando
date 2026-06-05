import { describe, it, expect } from 'bun:test'
import { SessionGenerator } from '../session-generator'
import type { Class, Holiday, TeacherBlock } from '@/lib/types'

// Helper to create a base class
function makeClass(overrides: Partial<Class> = {}): Class {
  return {
    id: 'class-1',
    organizationId: 'org-1',
    courseId: 'course-1',
    subjectId: 'subject-1',
    teacherId: 'teacher-1',
    semesterId: 'sem-1',
    roomId: 'room-1',
    name: 'Turma A',
    code: 'TURMA-A',
    schedule: {
      dayOfWeek: 1, // Monday
      startTime: '08:00',
      endTime: '09:50',
      recurring: true,
      recurrencePattern: 'weekly',
    },
    maxCapacity: 30,
    currentEnrollment: 15,
    status: 'active',
    startDate: '2025-02-03',
    endDate: '2025-06-30',
    startTime: '08:00',
    endTime: '09:50',
    dayOfWeek: 1,
    createdAt: '2025-01-01T00:00:00.000Z',
    updatedAt: '2025-01-01T00:00:00.000Z',
    ...overrides,
  }
}

describe('SessionGenerator', () => {
  const generator = new SessionGenerator()
  const semesterStart = new Date('2025-02-03') // Monday, Feb 3
  const semesterEnd = new Date('2025-06-27')   // Friday, Jun 27

  describe('generateSessions', () => {
    it('should generate correct number of sessions for a weekly Monday class', () => {
      const classData = makeClass({
        dayOfWeek: 1, // Monday
        startTime: '08:00',
        endTime: '09:50',
      })

      const result = generator.generateSessions(classData, semesterStart, semesterEnd)

      // Should generate all Mondays between Feb 3 and Jun 27 (approximately 21)
      expect(result.totalSessions).toBeGreaterThan(0)
      expect(result.warnings.length).toBe(0) // no skipped dates

      // All sessions should be on Mondays
      for (const session of result.sessions) {
        const date = new Date(session.date)
        expect(date.getDay()).toBe(1)
      }

      // All sessions should have correct time
      for (const session of result.sessions) {
        expect(session.startTime).toBe('08:00')
        expect(session.endTime).toBe('09:50')
      }

      // All sessions should be scheduled
      for (const session of result.sessions) {
        expect(session.status).toBe('scheduled')
      }
    })

    it('should skip holidays', () => {
      const classData = makeClass({
        dayOfWeek: 4, // Thursday
        startTime: '08:00',
        endTime: '09:50',
      })

      // Mar 20, 2025 is a Thursday — create a holiday for that date
      const holidays: Holiday[] = [
        {
          id: 'holiday-1',
          organizationId: 'org-1',
          name: 'Feriado Especial',
          date: '2025-03-20',
          type: 'institutional',
          isRecurring: false,
          affectsClasses: true,
          createdAt: '2025-01-01T00:00:00.000Z',
          updatedAt: '2025-01-01T00:00:00.000Z',
        },
      ]

      const result = generator.generateSessions(classData, semesterStart, semesterEnd, holidays)

      // Should have skipped dates
      expect(result.skippedCount).toBeGreaterThan(0)
      expect(result.skippedDates.some((s) => s.date === '2025-03-20')).toBe(true)
      expect(result.skippedDates.find((s) => s.date === '2025-03-20')?.reason).toBe('holiday')

      // No session should exist for the holiday date
      expect(result.sessions.find((s) => s.date === '2025-03-20')).toBeUndefined()
    })

    it('should skip blocked periods', () => {
      const classData = makeClass({
        teacherId: 'teacher-1',
        dayOfWeek: 1, // Monday
        startTime: '08:00',
        endTime: '09:50',
      })

      // Block teacher-1 from March 10 to March 21 (covers 2 Mondays: Mar 10, Mar 17)
      const blocks: TeacherBlock[] = [
        {
          id: 'block-1',
          teacherId: 'teacher-1',
          organizationId: 'org-1',
          blockType: 'vacation',
          startDate: '2025-03-10',
          endDate: '2025-03-21',
          reason: 'Férias',
          isApproved: true,
          createdAt: '2025-01-01T00:00:00.000Z',
          updatedAt: '2025-01-01T00:00:00.000Z',
        },
      ]

      const result = generator.generateSessions(classData, semesterStart, semesterEnd, [], blocks)

      // Should have skipped blocked dates
      expect(result.skippedCount).toBeGreaterThan(0)
      expect(
        result.skippedDates.some(
          (s) => (s.date === '2025-03-10' || s.date === '2025-03-17') && s.reason === 'block'
        )
      ).toBe(true)

      // No sessions for blocked Mondays
      expect(result.sessions.find((s) => s.date === '2025-03-10')).toBeUndefined()
      expect(result.sessions.find((s) => s.date === '2025-03-17')).toBeUndefined()
    })

    it('should handle maxSessions limit', () => {
      const classData = makeClass({
        dayOfWeek: 1, // Monday
        startTime: '08:00',
        endTime: '09:50',
      })

      const result = generator.generateSessions(classData, semesterStart, semesterEnd, [], [], {
        maxSessions: 5,
      })

      expect(result.totalSessions).toBe(5)
      expect(result.warnings.some((w) => w.includes('Limite máximo'))).toBe(true)
    })

    it('should return empty for invalid date range', () => {
      const classData = makeClass({
        dayOfWeek: 1,
        startTime: '08:00',
        endTime: '09:50',
        startDate: '2025-06-30',
        endDate: '2025-02-01', // end before start
      })

      const result = generator.generateSessions(classData, semesterStart, semesterEnd)

      expect(result.totalSessions).toBe(0)
      expect(result.warnings.some((w) => w.includes('inválido'))).toBe(true)
    })

    it('should handle semester boundaries correctly', () => {
      const classData = makeClass({
        dayOfWeek: 1, // Monday
        startTime: '08:00',
        endTime: '09:50',
        startDate: '2025-03-01', // Starts in March
        endDate: '2025-04-30',   // Ends in April
      })

      // Semester is Feb-Jun, but class starts in March
      const result = generator.generateSessions(classData, semesterStart, semesterEnd)

      // All sessions should be between March 1 and April 30
      for (const session of result.sessions) {
        const date = new Date(session.date)
        expect(date >= new Date('2025-03-01')).toBe(true)
        expect(date <= new Date('2025-04-30')).toBe(true)
      }

      expect(result.totalSessions).toBeGreaterThan(0)
    })

    it('should return warning when class has no day of week', () => {
      const classData = makeClass({
        dayOfWeek: undefined as unknown as 1,
      })

      const result = generator.generateSessions(classData, semesterStart, semesterEnd)

      expect(result.totalSessions).toBe(0)
      expect(result.warnings.some((w) => w.includes('dia da semana'))).toBe(true)
    })

    it('should return warning when class has no times', () => {
      const classData = makeClass({
        startTime: '',
        endTime: '',
      })

      const result = generator.generateSessions(classData, semesterStart, semesterEnd)

      expect(result.totalSessions).toBe(0)
      expect(result.warnings.some((w) => w.includes('horário'))).toBe(true)
    })
  })

  describe('rescheduleSession', () => {
    it('should update session date and time correctly', () => {
      const originalSession = {
        id: 'session-1',
        classId: 'class-1',
        teacherId: 'teacher-1',
        roomId: 'room-1',
        date: '2025-03-10',
        startTime: '08:00',
        endTime: '09:50',
        status: 'scheduled' as const,
        attendanceRecorded: false,
        topic: 'Aula 1',
        createdAt: '2025-01-01T00:00:00.000Z',
        updatedAt: '2025-01-01T00:00:00.000Z',
      }

      const rescheduled = generator.rescheduleSession(
        originalSession,
        '2025-03-11',
        '10:00',
        '11:50',
        'Doença do professor'
      )

      expect(rescheduled.date).toBe('2025-03-11')
      expect(rescheduled.startTime).toBe('10:00')
      expect(rescheduled.endTime).toBe('11:50')
      expect(rescheduled.status).toBe('rescheduled')
      expect(rescheduled.notes).toContain('Remarcada')
      expect(rescheduled.notes).toContain('Doença do professor')
    })
  })

  describe('cancelSession', () => {
    it('should set status to cancelled', () => {
      const session = {
        id: 'session-1',
        classId: 'class-1',
        teacherId: 'teacher-1',
        roomId: 'room-1',
        date: '2025-03-10',
        startTime: '08:00',
        endTime: '09:50',
        status: 'scheduled' as const,
        attendanceRecorded: false,
        topic: 'Aula 1',
        createdAt: '2025-01-01T00:00:00.000Z',
        updatedAt: '2025-01-01T00:00:00.000Z',
      }

      const cancelled = generator.cancelSession(session, 'Feriado municipal')

      expect(cancelled.status).toBe('cancelled')
      expect(cancelled.notes).toContain('Cancelada')
      expect(cancelled.notes).toContain('Feriado municipal')
    })
  })

  describe('createReplacementSession', () => {
    it('should create a new session for a different date', () => {
      const cancelledSession = {
        id: 'session-1',
        classId: 'class-1',
        teacherId: 'teacher-1',
        roomId: 'room-1',
        date: '2025-03-10',
        startTime: '08:00',
        endTime: '09:50',
        status: 'cancelled' as const,
        topic: 'Aula 5',
        attendanceRecorded: false,
        createdAt: '2025-01-01T00:00:00.000Z',
        updatedAt: '2025-01-01T00:00:00.000Z',
      }

      const replacement = generator.createReplacementSession(cancelledSession, '2025-03-15')

      expect(replacement.id).not.toBe(cancelledSession.id)
      expect(replacement.date).toBe('2025-03-15')
      expect(replacement.startTime).toBe(cancelledSession.startTime)
      expect(replacement.endTime).toBe(cancelledSession.endTime)
      expect(replacement.status).toBe('scheduled')
      expect(replacement.teacherId).toBe(cancelledSession.teacherId)
      expect(replacement.classId).toBe(cancelledSession.classId)
      expect(replacement.topic).toContain('Reposição')
      expect(replacement.notes).toContain('reposição')
    })
  })
})
