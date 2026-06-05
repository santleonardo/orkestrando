import { describe, it, expect } from 'bun:test'
import { ConflictEngine } from '../conflict-engine'
import type {
  ClassSession,
  TeacherAvailability,
  Holiday,
  TeacherBlock,
  Enrollment,
  ValidationContext,
} from '@/lib/types'

// Helper to create a base session
function makeSession(overrides: Partial<ClassSession> = {}): ClassSession {
  return {
    id: 'session-1',
    classId: 'class-1',
    teacherId: 'teacher-1',
    roomId: 'room-1',
    date: '2025-03-10', // Monday
    startTime: '08:00',
    endTime: '09:50',
    status: 'scheduled',
    attendanceRecorded: false,
    createdAt: '2025-01-01T00:00:00.000Z',
    updatedAt: '2025-01-01T00:00:00.000Z',
    ...overrides,
  }
}

// Helper to create a base holiday
function makeHoliday(overrides: Partial<Holiday> = {}): Holiday {
  return {
    id: 'holiday-1',
    organizationId: 'org-1',
    name: 'Carnaval',
    date: '2025-03-04',
    type: 'national',
    isRecurring: true,
    affectsClasses: true,
    createdAt: '2025-01-01T00:00:00.000Z',
    updatedAt: '2025-01-01T00:00:00.000Z',
    ...overrides,
  }
}

// Helper to create a base block
function makeBlock(overrides: Partial<TeacherBlock> = {}): TeacherBlock {
  return {
    id: 'block-1',
    teacherId: 'teacher-1',
    organizationId: 'org-1',
    blockType: 'vacation',
    startDate: '2025-03-01',
    endDate: '2025-03-15',
    reason: 'Férias de verão',
    isApproved: true,
    createdAt: '2025-01-01T00:00:00.000Z',
    updatedAt: '2025-01-01T00:00:00.000Z',
    ...overrides,
  }
}

// Helper to create base availability
function makeAvailability(overrides: Partial<TeacherAvailability> = {}): TeacherAvailability {
  return {
    id: 'avail-1',
    teacherId: 'teacher-1',
    organizationId: 'org-1',
    dayOfWeek: 1, // Monday
    startTime: '07:00',
    endTime: '22:00',
    recurringPattern: 'weekly',
    status: 'approved',
    createdAt: '2025-01-01T00:00:00.000Z',
    updatedAt: '2025-01-01T00:00:00.000Z',
    ...overrides,
  }
}

describe('ConflictEngine', () => {
  const engine = new ConflictEngine()

  describe('checkTeacherConflict', () => {
    it('should detect conflict when same teacher has overlapping sessions', () => {
      const session = makeSession({
        id: 'new-1',
        teacherId: 'teacher-1',
        date: '2025-03-10',
        startTime: '08:00',
        endTime: '09:50',
      })
      const existing = [
        makeSession({
          id: 'existing-1',
          teacherId: 'teacher-1',
          date: '2025-03-10',
          startTime: '08:30',
          endTime: '10:20',
        }),
      ]

      const result = engine.checkTeacherConflict(session, existing)
      expect(result.hasConflict).toBe(true)
      expect(result.conflicts).toHaveLength(1)
      expect(result.conflicts[0].type).toBe('teacher_overlap')
      expect(result.conflicts[0].severity).toBe('error')
      expect(result.conflicts[0].message).toContain('Conflito de horário do professor')
    })

    it('should NOT detect conflict for different teachers', () => {
      const session = makeSession({
        id: 'new-1',
        teacherId: 'teacher-1',
        date: '2025-03-10',
        startTime: '08:00',
        endTime: '09:50',
      })
      const existing = [
        makeSession({
          id: 'existing-1',
          teacherId: 'teacher-2',
          date: '2025-03-10',
          startTime: '08:30',
          endTime: '10:20',
        }),
      ]

      const result = engine.checkTeacherConflict(session, existing)
      expect(result.hasConflict).toBe(false)
      expect(result.conflicts).toHaveLength(0)
    })

    it('should NOT detect conflict when sessions are on different dates', () => {
      const session = makeSession({
        id: 'new-1',
        teacherId: 'teacher-1',
        date: '2025-03-10',
        startTime: '08:00',
        endTime: '09:50',
      })
      const existing = [
        makeSession({
          id: 'existing-1',
          teacherId: 'teacher-1',
          date: '2025-03-17', // different date
          startTime: '08:00',
          endTime: '09:50',
        }),
      ]

      const result = engine.checkTeacherConflict(session, existing)
      expect(result.hasConflict).toBe(false)
    })

    it('should skip cancelled sessions', () => {
      const session = makeSession({
        id: 'new-1',
        teacherId: 'teacher-1',
        date: '2025-03-10',
        startTime: '08:00',
        endTime: '09:50',
      })
      const existing = [
        makeSession({
          id: 'existing-1',
          teacherId: 'teacher-1',
          date: '2025-03-10',
          startTime: '08:00',
          endTime: '09:50',
          status: 'cancelled',
        }),
      ]

      const result = engine.checkTeacherConflict(session, existing)
      expect(result.hasConflict).toBe(false)
    })
  })

  describe('checkRoomConflict', () => {
    it('should detect conflict when same room is used simultaneously', () => {
      const session = makeSession({
        id: 'new-1',
        roomId: 'room-1',
        date: '2025-03-10',
        startTime: '08:00',
        endTime: '09:50',
      })
      const existing = [
        makeSession({
          id: 'existing-1',
          roomId: 'room-1',
          date: '2025-03-10',
          startTime: '09:00',
          endTime: '10:50',
        }),
      ]

      const result = engine.checkRoomConflict(session, existing)
      expect(result.hasConflict).toBe(true)
      expect(result.conflicts).toHaveLength(1)
      expect(result.conflicts[0].type).toBe('room_overlap')
      expect(result.conflicts[0].severity).toBe('error')
      expect(result.conflicts[0].message).toContain('Conflito de sala')
    })

    it('should NOT detect conflict for different rooms', () => {
      const session = makeSession({
        id: 'new-1',
        roomId: 'room-1',
        date: '2025-03-10',
        startTime: '08:00',
        endTime: '09:50',
      })
      const existing = [
        makeSession({
          id: 'existing-1',
          roomId: 'room-2',
          date: '2025-03-10',
          startTime: '08:00',
          endTime: '09:50',
        }),
      ]

      const result = engine.checkRoomConflict(session, existing)
      expect(result.hasConflict).toBe(false)
    })

    it('should return no conflict when session has no room assigned', () => {
      const session = makeSession({
        id: 'new-1',
        roomId: undefined,
      })
      const existing = [
        makeSession({
          id: 'existing-1',
          roomId: 'room-1',
          date: '2025-03-10',
        }),
      ]

      const result = engine.checkRoomConflict(session, existing)
      expect(result.hasConflict).toBe(false)
    })
  })

  describe('checkStudentConflict', () => {
    it('should warn when students share classes with overlapping enrollment', () => {
      const session = makeSession({ classId: 'class-1' })
      const enrollments: Enrollment[] = [
        {
          id: 'enr-1',
          studentId: 'student-1',
          classId: 'class-1',
          semesterId: 'sem-1',
          organizationId: 'org-1',
          status: 'active',
          enrollmentDate: '2025-01-01',
          createdAt: '2025-01-01T00:00:00.000Z',
          updatedAt: '2025-01-01T00:00:00.000Z',
        },
        {
          id: 'enr-2',
          studentId: 'student-1',
          classId: 'class-2',
          semesterId: 'sem-1',
          organizationId: 'org-1',
          status: 'active',
          enrollmentDate: '2025-01-01',
          createdAt: '2025-01-01T00:00:00.000Z',
          updatedAt: '2025-01-01T00:00:00.000Z',
        },
      ]

      const result = engine.checkStudentConflict(session, enrollments)
      expect(result.hasConflict).toBe(true)
      expect(result.conflicts).toHaveLength(1)
      expect(result.conflicts[0].type).toBe('student_overlap')
      expect(result.conflicts[0].severity).toBe('warning')
      expect(result.conflicts[0].message).toContain('aluno(s) desta turma possuem matrícula')
    })

    it('should NOT warn when no students share classes', () => {
      const session = makeSession({ classId: 'class-1' })
      const enrollments: Enrollment[] = [
        {
          id: 'enr-1',
          studentId: 'student-1',
          classId: 'class-1',
          semesterId: 'sem-1',
          organizationId: 'org-1',
          status: 'active',
          enrollmentDate: '2025-01-01',
          createdAt: '2025-01-01T00:00:00.000Z',
          updatedAt: '2025-01-01T00:00:00.000Z',
        },
      ]

      const result = engine.checkStudentConflict(session, enrollments)
      expect(result.hasConflict).toBe(false)
    })
  })

  describe('checkHolidayConflict', () => {
    it('should detect conflict for exact date match', () => {
      const session = makeSession({ date: '2025-03-04' })
      const holidays = [makeHoliday({ date: '2025-03-04', isRecurring: false })]

      const result = engine.checkHolidayConflict(session, holidays)
      expect(result.hasConflict).toBe(true)
      expect(result.conflicts).toHaveLength(1)
      expect(result.conflicts[0].type).toBe('holiday')
      expect(result.conflicts[0].message).toContain('feriado')
      expect(result.conflicts[0].message).toContain('Carnaval')
    })

    it('should detect conflict for recurring holidays', () => {
      // Holiday is 2024-03-04, session is 2025-03-04 — should match because recurring
      const session = makeSession({ date: '2025-03-04' })
      const holidays = [makeHoliday({ date: '2024-03-04', isRecurring: true })]

      const result = engine.checkHolidayConflict(session, holidays)
      expect(result.hasConflict).toBe(true)
      expect(result.conflicts).toHaveLength(1)
    })

    it('should NOT detect conflict when holiday does not affect classes', () => {
      const session = makeSession({ date: '2025-03-04' })
      const holidays = [makeHoliday({ date: '2025-03-04', affectsClasses: false })]

      const result = engine.checkHolidayConflict(session, holidays)
      expect(result.hasConflict).toBe(false)
    })
  })

  describe('checkVacationConflict', () => {
    it('should detect conflict when session is within a vacation block', () => {
      const session = makeSession({
        teacherId: 'teacher-1',
        date: '2025-03-10',
      })
      const blocks = [makeBlock({ teacherId: 'teacher-1', startDate: '2025-03-01', endDate: '2025-03-15' })]

      const result = engine.checkVacationConflict(session, blocks)
      expect(result.hasConflict).toBe(true)
      expect(result.conflicts).toHaveLength(1)
      expect(result.conflicts[0].type).toBe('vacation')
      expect(result.conflicts[0].severity).toBe('error')
      expect(result.conflicts[0].message).toContain('férias')
    })

    it('should NOT detect conflict for different teacher blocks', () => {
      const session = makeSession({
        teacherId: 'teacher-1',
        date: '2025-03-10',
      })
      const blocks = [makeBlock({ teacherId: 'teacher-2', startDate: '2025-03-01', endDate: '2025-03-15' })]

      const result = engine.checkVacationConflict(session, blocks)
      expect(result.hasConflict).toBe(false)
    })

    it('should NOT detect conflict when session is outside the block period', () => {
      const session = makeSession({
        teacherId: 'teacher-1',
        date: '2025-04-01', // outside March 1-15 block
      })
      const blocks = [makeBlock({ teacherId: 'teacher-1', startDate: '2025-03-01', endDate: '2025-03-15' })]

      const result = engine.checkVacationConflict(session, blocks)
      expect(result.hasConflict).toBe(false)
    })
  })

  describe('checkAvailabilityConflict', () => {
    it('should warn when session time is outside declared availability', () => {
      const session = makeSession({
        teacherId: 'teacher-1',
        date: '2025-03-10', // Monday
        startTime: '23:00',
        endTime: '23:50',
      })
      const availability = [
        makeAvailability({
          teacherId: 'teacher-1',
          dayOfWeek: 1, // Monday
          startTime: '07:00',
          endTime: '22:00',
        }),
      ]

      const result = engine.checkAvailabilityConflict(session, availability)
      expect(result.hasConflict).toBe(true)
      expect(result.conflicts.length).toBeGreaterThan(0)
      const mismatchConflict = result.conflicts.find((c) => c.message.includes('fora da disponibilidade'))
      expect(mismatchConflict).toBeDefined()
    })

    it('should NOT warn when session time is within availability', () => {
      const session = makeSession({
        teacherId: 'teacher-1',
        date: '2025-03-10', // Monday
        startTime: '08:00',
        endTime: '09:50',
      })
      const availability = [
        makeAvailability({
          teacherId: 'teacher-1',
          dayOfWeek: 1, // Monday
          startTime: '07:00',
          endTime: '22:00',
        }),
      ]

      const result = engine.checkAvailabilityConflict(session, availability)
      expect(result.hasConflict).toBe(false)
      expect(result.conflicts).toHaveLength(0)
    })

    it('should warn when teacher has no availability for the day of week', () => {
      const session = makeSession({
        teacherId: 'teacher-1',
        date: '2025-03-10', // Monday
        startTime: '08:00',
        endTime: '09:50',
      })
      // Availability only for Tuesday (dayOfWeek=2)
      const availability = [
        makeAvailability({
          teacherId: 'teacher-1',
          dayOfWeek: 2,
          startTime: '07:00',
          endTime: '22:00',
        }),
      ]

      const result = engine.checkAvailabilityConflict(session, availability)
      expect(result.hasConflict).toBe(true)
      expect(result.conflicts[0].message).toContain('não possui disponibilidade declarada')
    })
  })

  describe('validateAllConflicts', () => {
    const cleanContext: ValidationContext = {
      existingSessions: [],
      teacherAvailability: [],
      holidays: [],
      teacherBlocks: [],
      existingEnrollments: [],
    }

    it('should return valid=true when no conflicts exist', () => {
      const session = makeSession({
        id: 'new-1',
        teacherId: 'teacher-1',
        roomId: 'room-1',
        date: '2025-03-10',
        startTime: '08:00',
        endTime: '09:50',
      })

      const report = engine.validateAllConflicts(session, cleanContext)
      expect(report.valid).toBe(true)
      expect(report.errors).toHaveLength(0)
      expect(report.warnings).toHaveLength(0)
    })

    it('should return errors for blocking conflicts (teacher overlap)', () => {
      const session = makeSession({
        id: 'new-1',
        teacherId: 'teacher-1',
        date: '2025-03-10',
        startTime: '08:00',
        endTime: '09:50',
      })
      const context: ValidationContext = {
        ...cleanContext,
        existingSessions: [
          makeSession({
            id: 'existing-1',
            teacherId: 'teacher-1',
            date: '2025-03-10',
            startTime: '08:30',
            endTime: '10:20',
          }),
        ],
      }

      const report = engine.validateAllConflicts(session, context)
      expect(report.valid).toBe(false)
      expect(report.errors.length).toBeGreaterThan(0)
      expect(report.errors.some((e) => e.type === 'teacher_overlap')).toBe(true)
    })

    it('should return errors for vacation blocks', () => {
      const session = makeSession({
        id: 'new-1',
        teacherId: 'teacher-1',
        date: '2025-03-10',
      })
      const context: ValidationContext = {
        ...cleanContext,
        teacherBlocks: [
          makeBlock({
            teacherId: 'teacher-1',
            startDate: '2025-03-01',
            endDate: '2025-03-15',
          }),
        ],
      }

      const report = engine.validateAllConflicts(session, context)
      expect(report.valid).toBe(false)
      expect(report.errors.some((e) => e.type === 'vacation')).toBe(true)
    })

    it('should include warnings for holidays and student overlaps', () => {
      const session = makeSession({ id: 'new-1', classId: 'class-1', date: '2025-03-04' })
      const context: ValidationContext = {
        ...cleanContext,
        holidays: [makeHoliday({ date: '2025-03-04' })],
        existingEnrollments: [
          {
            id: 'enr-1',
            studentId: 'student-1',
            classId: 'class-1',
            semesterId: 'sem-1',
            organizationId: 'org-1',
            status: 'active',
            enrollmentDate: '2025-01-01',
            createdAt: '2025-01-01T00:00:00.000Z',
            updatedAt: '2025-01-01T00:00:00.000Z',
          },
          {
            id: 'enr-2',
            studentId: 'student-1',
            classId: 'class-2',
            semesterId: 'sem-1',
            organizationId: 'org-1',
            status: 'active',
            enrollmentDate: '2025-01-01',
            createdAt: '2025-01-01T00:00:00.000Z',
            updatedAt: '2025-01-01T00:00:00.000Z',
          },
        ],
      }

      const report = engine.validateAllConflicts(session, context)
      expect(report.warnings.length).toBeGreaterThan(0)
      expect(report.warnings.some((w) => w.type === 'holiday')).toBe(true)
      expect(report.warnings.some((w) => w.type === 'student_overlap')).toBe(true)
    })
  })
})
