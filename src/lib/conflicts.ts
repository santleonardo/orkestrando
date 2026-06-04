import { db } from '@/lib/db'

interface ConflictResult {
  type: string
  message: string
  severity: 'error' | 'warning' | 'info'
}

export async function checkTeacherConflict(
  teacherId: string,
  date: Date,
  startTime: string,
  endTime: string
): Promise<ConflictResult | null> {
  const lessons = await db.lesson.findMany({
    where: {
      teacherId,
      date,
      status: { in: ['SCHEDULED', 'RESCHEDULED', 'REPLACEMENT'] },
    },
  })

  for (const lesson of lessons) {
    if (hasTimeOverlap(startTime, endTime, lesson.startTime, lesson.endTime)) {
      return {
        type: 'TEACHER_CONFLICT',
        message: `Teacher has another lesson scheduled on this date/time (${lesson.startTime}-${lesson.endTime})`,
        severity: 'error',
      }
    }
  }

  return null
}

export async function checkRoomConflict(
  roomId: string,
  date: Date,
  startTime: string,
  endTime: string
): Promise<ConflictResult | null> {
  const lessons = await db.lesson.findMany({
    where: {
      roomId,
      date,
      status: { in: ['SCHEDULED', 'RESCHEDULED', 'REPLACEMENT'] },
    },
  })

  for (const lesson of lessons) {
    if (hasTimeOverlap(startTime, endTime, lesson.startTime, lesson.endTime)) {
      return {
        type: 'ROOM_CONFLICT',
        message: `Room is occupied on this date/time (${lesson.startTime}-${lesson.endTime})`,
        severity: 'error',
      }
    }
  }

  return null
}

export async function checkStudentConflict(
  studentId: string,
  date: Date,
  startTime: string,
  endTime: string
): Promise<ConflictResult | null> {
  const enrollments = await db.enrollment.findMany({
    where: { studentId, status: 'active' },
    include: {
      class: {
        include: {
          lessons: {
            where: {
              date,
              status: { in: ['SCHEDULED', 'RESCHEDULED', 'REPLACEMENT'] },
            },
          },
        },
      },
    },
  })

  for (const enrollment of enrollments) {
    for (const lesson of enrollment.class.lessons) {
      if (hasTimeOverlap(startTime, endTime, lesson.startTime, lesson.endTime)) {
        return {
          type: 'STUDENT_CONFLICT',
          message: `Student is enrolled in another class at this time (${enrollment.class.name}: ${lesson.startTime}-${lesson.endTime})`,
          severity: 'warning',
        }
      }
    }
  }

  return null
}

export async function checkHoliday(date: Date): Promise<ConflictResult | null> {
  const holidays = await db.academicCalendar.findMany({
    where: {
      date,
      type: 'holiday',
    },
  })

  if (holidays.length > 0) {
    return {
      type: 'HOLIDAY',
      message: `This date is a holiday: ${holidays.map((h) => h.title).join(', ')}`,
      severity: 'warning',
    }
  }

  return null
}

export async function checkAvailability(
  teacherId: string,
  dayOfWeek: number,
  startTime: string,
  endTime: string,
  semesterId: string
): Promise<ConflictResult | null> {
  const availabilities = await db.teacherAvailability.findMany({
    where: {
      teacherId,
      semesterId,
      dayOfWeek,
      status: 'APPROVED',
    },
  })

  // Check if there's an approved AVAILABLE slot covering this time
  const hasAvailableSlot = availabilities.some(
    (a) =>
      a.type === 'AVAILABLE' &&
      hasTimeOverlap(startTime, endTime, a.startTime, a.endTime)
  )

  if (!hasAvailableSlot) {
    // Check if there's a BLOCKED slot
    const blockedSlots = availabilities.filter(
      (a) => a.type === 'BLOCKED' && hasTimeOverlap(startTime, endTime, a.startTime, a.endTime)
    )

    if (blockedSlots.length > 0) {
      return {
        type: 'AVAILABILITY_BLOCKED',
        message: `Teacher has blocked availability at this time`,
        severity: 'error',
      }
    }

    return {
      type: 'NO_AVAILABILITY',
      message: `No approved availability found for teacher on this day/time`,
      severity: 'warning',
    }
  }

  return null
}

export async function detectAllConflicts(lessonData: {
  teacherId?: string
  roomId?: string
  classId?: string
  date: Date
  startTime: string
  endTime: string
  semesterId?: string
}): Promise<ConflictResult[]> {
  const conflicts: ConflictResult[] = []

  // Check holiday
  const holidayConflict = await checkHoliday(lessonData.date)
  if (holidayConflict) conflicts.push(holidayConflict)

  // Check weekend
  const dayOfWeek = lessonData.date.getDay()
  if (dayOfWeek === 0 || dayOfWeek === 6) {
    conflicts.push({
      type: 'WEEKEND',
      message: 'This date falls on a weekend',
      severity: 'info',
    })
  }

  // Check teacher conflict
  if (lessonData.teacherId) {
    const teacherConflict = await checkTeacherConflict(
      lessonData.teacherId,
      lessonData.date,
      lessonData.startTime,
      lessonData.endTime
    )
    if (teacherConflict) conflicts.push(teacherConflict)

    // Check availability
    if (lessonData.semesterId) {
      const availabilityConflict = await checkAvailability(
        lessonData.teacherId,
        dayOfWeek,
        lessonData.startTime,
        lessonData.endTime,
        lessonData.semesterId
      )
      if (availabilityConflict) conflicts.push(availabilityConflict)
    }
  }

  // Check room conflict
  if (lessonData.roomId) {
    const roomConflict = await checkRoomConflict(
      lessonData.roomId,
      lessonData.date,
      lessonData.startTime,
      lessonData.endTime
    )
    if (roomConflict) conflicts.push(roomConflict)
  }

  // Check student conflicts if classId is provided
  if (lessonData.classId) {
    const enrollments = await db.enrollment.findMany({
      where: { classId: lessonData.classId, status: 'active' },
      select: { studentId: true },
    })

    for (const enrollment of enrollments) {
      const studentConflict = await checkStudentConflict(
        enrollment.studentId,
        lessonData.date,
        lessonData.startTime,
        lessonData.endTime
      )
      if (studentConflict) {
        conflicts.push(studentConflict)
        break // One student conflict is enough to flag
      }
    }
  }

  return conflicts
}

function hasTimeOverlap(
  start1: string,
  end1: string,
  start2: string,
  end2: string
): boolean {
  return start1 < end2 && start2 < end1
}
