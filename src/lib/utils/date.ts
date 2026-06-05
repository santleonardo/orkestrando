// =============================================================================
// ORKESTRANDO - Date Utility Functions for Academic Scheduling
// =============================================================================

import { addDays as dateFnsAddDays, format, parseISO, isWithinInterval, eachDayOfInterval } from 'date-fns'
import { ptBR } from 'date-fns/locale'

/**
 * Returns the number of days between two dates (inclusive)
 */
export function getDaysBetween(startDate: string | Date, endDate: string | Date): number {
  const start = typeof startDate === 'string' ? parseISO(startDate) : startDate
  const end = typeof endDate === 'string' ? parseISO(endDate) : endDate

  const diffTime = Math.abs(end.getTime() - start.getTime())
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}

/**
 * Returns the day of week name in Portuguese
 */
export function getDayOfWeek(date: string | Date): string {
  const d = typeof date === 'string' ? parseISO(date) : date
  const dayNames = [
    'Domingo',
    'Segunda-feira',
    'Terça-feira',
    'Quarta-feira',
    'Quinta-feira',
    'Sexta-feira',
    'Sábado',
  ]
  return dayNames[d.getDay()]
}

/**
 * Returns short day name in Portuguese
 */
export function getDayOfWeekShort(date: string | Date): string {
  const d = typeof date === 'string' ? parseISO(date) : date
  const dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
  return dayNames[d.getDay()]
}

/**
 * Returns the numeric day of week (0 = Sunday, 6 = Saturday)
 */
export function getDayOfWeekNumber(date: string | Date): number {
  const d = typeof date === 'string' ? parseISO(date) : date
  return d.getDay()
}

/**
 * Checks if a date falls within a date range (inclusive)
 */
export function isDateInRange(
  date: string | Date,
  start: string | Date,
  end: string | Date
): boolean {
  const d = typeof date === 'string' ? parseISO(date) : date
  const s = typeof start === 'string' ? parseISO(start) : start
  const e = typeof end === 'string' ? parseISO(end) : end

  return isWithinInterval(d, { start: s, end: e })
}

/**
 * Generates all dates for a specific day of week within a date range.
 * Example: every Monday between Jan 1 and Jun 30
 */
export function generateRecurringDates(
  startDate: string | Date,
  endDate: string | Date,
  dayOfWeek: number // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
): Date[] {
  const start = typeof startDate === 'string' ? parseISO(startDate) : startDate
  const end = typeof endDate === 'string' ? parseISO(endDate) : endDate

  const allDays = eachDayOfInterval({ start, end })
  const matchingDays = allDays.filter((day) => day.getDay() === dayOfWeek)

  return matchingDays
}

/**
 * Generates recurring dates with biweekly or monthly patterns
 */
export function generateRecurringDatesWithPattern(
  startDate: string | Date,
  endDate: string | Date,
  dayOfWeek: number,
  pattern: 'weekly' | 'biweekly' | 'monthly'
): Date[] {
  const weeklyDates = generateRecurringDates(startDate, endDate, dayOfWeek)

  switch (pattern) {
    case 'weekly':
      return weeklyDates

    case 'biweekly':
      return weeklyDates.filter((_, index) => index % 2 === 0)

    case 'monthly': {
      const result: Date[] = []
      let lastMonth = -1
      for (const date of weeklyDates) {
        if (date.getMonth() !== lastMonth) {
          result.push(date)
          lastMonth = date.getMonth()
        }
      }
      return result
    }

    default:
      return weeklyDates
  }
}

/**
 * Formats a date according to the specified format string
 */
export function formatDate(
  date: string | Date,
  formatStr: string = 'dd/MM/yyyy'
): string {
  const d = typeof date === 'string' ? parseISO(date) : date
  return format(d, formatStr, { locale: ptBR })
}

/**
 * Formats a time string (HH:mm) to Brazilian format (HH:mm)
 */
export function formatTime(date: string | Date): string {
  const d = typeof date === 'string' ? parseISO(date) : date
  return format(d, 'HH:mm')
}

/**
 * Formats a date with time
 */
export function formatDateTime(date: string | Date): string {
  const d = typeof date === 'string' ? parseISO(date) : date
  return format(d, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })
}

/**
 * Formats a relative time description
 */
export function formatRelativeTime(date: string | Date): string {
  const d = typeof date === 'string' ? parseISO(date) : date
  const now = new Date()
  const diffMs = now.getTime() - d.getTime()
  const diffMinutes = Math.floor(diffMs / (1000 * 60))
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffMinutes < 1) return 'agora mesmo'
  if (diffMinutes < 60) return `há ${diffMinutes} min`
  if (diffHours < 24) return `há ${diffHours}h`
  if (diffDays === 1) return 'ontem'
  if (diffDays < 7) return `há ${diffDays} dias`
  return formatDate(d)
}

/**
 * Checks if two time ranges overlap.
 * Times are strings in 'HH:mm' format.
 * Dates are optional - if provided, the full date+time is considered.
 */
export function isOverlapping(
  start1: string,
  end1: string,
  start2: string,
  end2: string
): boolean {
  // Parse HH:mm to minutes since midnight for comparison
  const toMinutes = (time: string): number => {
    const [hours, minutes] = time.split(':').map(Number)
    return hours * 60 + minutes
  }

  const s1 = toMinutes(start1)
  const e1 = toMinutes(end1)
  const s2 = toMinutes(start2)
  const e2 = toMinutes(end2)

  // Two ranges overlap if one starts before the other ends
  return s1 < e2 && s2 < e1
}

/**
 * Checks if two date-time ranges overlap (full datetime)
 */
export function isDateTimeOverlapping(
  start1: Date,
  end1: Date,
  start2: Date,
  end2: Date
): boolean {
  return start1 < end2 && start2 < end1
}

/**
 * Adds a specified number of days to a date
 */
export function addDays(date: string | Date, days: number): Date {
  const d = typeof date === 'string' ? parseISO(date) : date
  return dateFnsAddDays(d, days)
}

/**
 * Gets the start and end dates for a semester
 */
export function getSemesterRange(
  semester: { year: number; term: number }
): { startDate: Date; endDate: Date } {
  const startMonth = semester.term === 1 ? 1 : 7 // February for term 1, August for term 2
  const endMonth = semester.term === 1 ? 6 : 12 // June for term 1, December for term 2

  return {
    startDate: new Date(semester.year, startMonth - 1, 1),
    endDate: new Date(semester.year, endMonth - 1, 30),
  }
}

/**
 * Checks if a date is a holiday (matches any holiday in the list)
 */
export function isHoliday(date: string | Date, holidays: Array<{ date: string }>): boolean {
  const d = formatDate(typeof date === 'string' ? date : date.toISOString(), 'yyyy-MM-dd')
  return holidays.some((h) => formatDate(h.date, 'yyyy-MM-dd') === d)
}

/**
 * Checks if a date falls within any teacher block period
 */
export function isBlockedDate(
  date: string | Date,
  blocks: Array<{ startDate: string; endDate: string }>
): boolean {
  return blocks.some((block) => isDateInRange(date, block.startDate, block.endDate))
}

/**
 * Converts a day of week number to its Portuguese name
 */
export function dayOfWeekToPortuguese(dayOfWeek: number): string {
  const days = [
    'Domingo',
    'Segunda-feira',
    'Terça-feira',
    'Quarta-feira',
    'Quinta-feira',
    'Sexta-feira',
    'Sábado',
  ]
  return days[dayOfWeek] || ''
}

/**
 * Converts a day of week number to short Portuguese name
 */
export function dayOfWeekToShort(dayOfWeek: number): string {
  const days = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
  return days[dayOfWeek] || ''
}

/**
 * Gets the current academic semester based on current date
 */
export function getCurrentSemester(): { year: number; term: number } {
  const now = new Date()
  const month = now.getMonth() + 1

  if (month >= 1 && month <= 6) {
    return { year: now.getFullYear(), term: 1 }
  } else {
    return { year: now.getFullYear(), term: 2 }
  }
}

/**
 * Returns a human-readable date range string in Portuguese
 */
export function formatDateRange(start: string | Date, end: string | Date): string {
  const s = formatDate(start, 'dd MMM yyyy')
  const e = formatDate(end, 'dd MMM yyyy')
  return `${s} - ${e}`
}
