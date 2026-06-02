// =============================================================================
// ORKESTRANDO - Academic Management System
// Utility / Helper Functions
// =============================================================================

import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import {
  Role,
  Weekday,
  AttendanceStatus,
  type ScheduleSlot,
  type ScheduleConflict,
  type ConflictDetection,
  type TimeSlot,
  type KPI,
  type PaginatedResponse,
  type DeviceInfo,
} from '@/types';
import { WEEKDAY_SHORT, TIME_SLOTS } from '@/constants';

// -----------------------------------------------------------------------------
// cn() - Tailwind CSS Class Name Merging
// -----------------------------------------------------------------------------

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

// -----------------------------------------------------------------------------
// generateSlug
// -----------------------------------------------------------------------------

export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
    .trim()
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
}

// -----------------------------------------------------------------------------
// formatFileSize
// -----------------------------------------------------------------------------

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';

  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  const k = 1024;
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  const size = bytes / Math.pow(k, i);

  return `${size.toFixed(i === 0 ? 0 : 2)} ${units[i]}`;
}

// -----------------------------------------------------------------------------
// formatDate
// -----------------------------------------------------------------------------

export function formatDate(
  date: Date | string,
  format: 'short' | 'long' | 'iso' | 'relative' | 'time' | 'datetime' | 'date' = 'short',
  locale: string = 'pt-BR'
): string {
  const d = typeof date === 'string' ? new Date(date) : date;

  if (isNaN(d.getTime())) return 'Data inválida';

  switch (format) {
    case 'iso':
      return d.toISOString();

    case 'date':
      return d.toLocaleDateString(locale, {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });

    case 'time':
      return d.toLocaleTimeString(locale, {
        hour: '2-digit',
        minute: '2-digit',
      });

    case 'datetime':
      return d.toLocaleDateString(locale, {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });

    case 'long':
      return d.toLocaleDateString(locale, {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });

    case 'short':
      return d.toLocaleDateString(locale, {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });

    case 'relative':
      return formatRelativeTime(d);

    default:
      return d.toLocaleDateString(locale);
  }
}

function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);
  const diffWeeks = Math.floor(diffDays / 7);
  const diffMonths = Math.floor(diffDays / 30);
  const diffYears = Math.floor(diffDays / 365);

  if (diffSeconds < 60) return 'agora mesmo';
  if (diffMinutes < 60) return `há ${diffMinutes} min`;
  if (diffHours < 24) return `há ${diffHours}h`;
  if (diffDays < 7) return `há ${diffDays}d`;
  if (diffWeeks < 4) return `há ${diffWeeks} sem`;
  if (diffMonths < 12) return `há ${diffMonths} meses`;
  return `há ${diffYears} anos`;
}

// -----------------------------------------------------------------------------
// formatTime
// -----------------------------------------------------------------------------

export function formatTime(time: string, format: 'short' | 'long' = 'short'): string {
  if (!time) return '';

  const [hours, minutes] = time.split(':').map(Number);

  if (isNaN(hours) || isNaN(minutes)) return time;

  if (format === 'long') {
    const period = hours < 12 ? 'AM' : 'PM';
    const displayHours = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
    return `${displayHours}:${String(minutes).padStart(2, '0')} ${period}`;
  }

  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}

// -----------------------------------------------------------------------------
// Weekday Conversion
// -----------------------------------------------------------------------------

const WEEKDAY_ORDER: Weekday[] = [
  Weekday.MONDAY,
  Weekday.TUESDAY,
  Weekday.WEDNESDAY,
  Weekday.THURSDAY,
  Weekday.FRIDAY,
  Weekday.SATURDAY,
  Weekday.SUNDAY,
];

export function getWeekdayNumber(weekday: Weekday): number {
  return WEEKDAY_ORDER.indexOf(weekday);
}

export function getWeekdayFromNumber(number: number): Weekday {
  return WEEKDAY_ORDER[number] ?? Weekday.MONDAY;
}

export function getWeekdayLabel(weekday: Weekday): string {
  return WEEKDAY_SHORT[weekday] ?? weekday;
}

// -----------------------------------------------------------------------------
// isTimeOverlap
// -----------------------------------------------------------------------------

export function isTimeOverlap(
  start1: string,
  end1: string,
  start2: string,
  end2: string
): boolean {
  const toMinutes = (time: string): number => {
    const [h, m] = time.split(':').map(Number);
    return h * 60 + m;
  };

  const s1 = toMinutes(start1);
  const e1 = toMinutes(end1);
  const s2 = toMinutes(start2);
  const e2 = toMinutes(end2);

  return s1 < e2 && s2 < e1;
}

// -----------------------------------------------------------------------------
// detectScheduleConflicts
// -----------------------------------------------------------------------------

export function detectScheduleConflicts(slots: ScheduleSlot[]): ConflictDetection {
  const conflicts: ScheduleConflict[] = [];

  for (let i = 0; i < slots.length; i++) {
    for (let j = i + 1; j < slots.length; j++) {
      const slotA = slots[i];
      const slotB = slots[j];

      if (slotA.weekday !== slotB.weekday) continue;

      if (isTimeOverlap(slotA.startTime, slotA.endTime, slotB.startTime, slotB.endTime)) {
        // Determine the type of conflict
        // In a real scenario we'd look up the resource, but here we detect the overlap
        conflicts.push({
          type: 'TEACHER_OVERLAP',
          conflictingSlot: slotA,
          existingSlot: slotB,
          resourceId: '',
          resourceName: '',
          description: `Conflito de horário entre ${WEEKDAY_SHORT[slotA.weekday]} ${slotA.startTime}-${slotA.endTime} e ${WEEKDAY_SHORT[slotB.weekday]} ${slotB.startTime}-${slotB.endTime}`,
        });
      }
    }
  }

  return {
    hasConflicts: conflicts.length > 0,
    conflicts,
    suggestedSlots: findFreeSlots(slots),
  };
}

// -----------------------------------------------------------------------------
// findFreeSlots
// -----------------------------------------------------------------------------

function findFreeSlots(occupiedSlots: ScheduleSlot[]): ScheduleSlot[] {
  const freeSlots: ScheduleSlot[] = [];

  // Get all occupied time ranges grouped by weekday
  const occupiedByDay = new Map<Weekday, Array<{ start: number; end: number }>>();

  for (const slot of occupiedSlots) {
    if (!occupiedByDay.has(slot.weekday)) {
      occupiedByDay.set(slot.weekday, []);
    }
    occupiedByDay.get(slot.weekday)!.push({
      start: timeToMinutes(slot.startTime),
      end: timeToMinutes(slot.endTime),
    });
  }

  // For each weekday, find gaps
  for (const weekday of WEEKDAY_ORDER) {
    const occupied = occupiedByDay.get(weekday) ?? [];

    // Sort by start time
    occupied.sort((a, b) => a.start - b.start);

    // Find gaps between 6:00 (360 min) and 23:00 (1380 min)
    let current = 360; // 06:00
    for (const range of occupied) {
      if (current < range.start && range.start - current >= 60) {
        // Gap of at least 1 hour
        freeSlots.push({
          weekday,
          startTime: minutesToTime(current),
          endTime: minutesToTime(range.start),
          label: `${WEEKDAY_SHORT[weekday]} ${minutesToTime(current)}-${minutesToTime(range.start)}`,
        });
      }
      current = Math.max(current, range.end);
    }

    // Check after last occupied slot
    if (current < 1380 && 1380 - current >= 60) {
      freeSlots.push({
        weekday,
        startTime: minutesToTime(current),
        endTime: '23:00',
        label: `${WEEKDAY_SHORT[weekday]} ${minutesToTime(current)}-23:00`,
      });
    }
  }

  return freeSlots;
}

// -----------------------------------------------------------------------------
// generateClassCode
// -----------------------------------------------------------------------------

export function generateClassCode(prefix: string = 'TUR'): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}-${timestamp}-${random}`;
}

// -----------------------------------------------------------------------------
// calculateAttendancePercentage
// -----------------------------------------------------------------------------

export function calculateAttendancePercentage(
  records: Array<{ status: AttendanceStatus }>
): number {
  if (records.length === 0) return 0;

  const presentCount = records.filter(
    (r) => r.status === AttendanceStatus.PRESENT || r.status === AttendanceStatus.LATE
  ).length;

  return Math.round((presentCount / records.length) * 10000) / 100; // 2 decimal places
}

// -----------------------------------------------------------------------------
// buildPagination
// -----------------------------------------------------------------------------

export function buildPagination<T>(
  data: T[],
  total: number,
  page: number,
  pageSize: number
): PaginatedResponse<T> {
  const totalPages = Math.ceil(total / pageSize);

  return {
    data,
    total,
    page,
    pageSize,
    totalPages,
    hasNextPage: page < totalPages,
    hasPreviousPage: page > 1,
  };
}

// -----------------------------------------------------------------------------
// hashData (Digital Signatures)
// -----------------------------------------------------------------------------

export function hashData(data: string): string {
  // Use SubtleCrypto in browser context, Node crypto in server context
  if (typeof window !== 'undefined' && window.crypto?.subtle) {
    // Browser: async - caller must await
    // For sync usage we fall back to a simple hash
    return simpleHash(data);
  }

  // Server-side: use synchronous simple hash for sync context
  // For proper SHA-256 on server, use hashDataAsync() instead
  return simpleHash(data);
}

export async function hashDataAsync(data: string): Promise<string> {
  if (typeof window !== 'undefined' && window.crypto?.subtle) {
    const encoder = new TextEncoder();
    const buffer = await window.crypto.subtle.digest('SHA-256', encoder.encode(data));
    return Array.from(new Uint8Array(buffer))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
  }

  try {
    const { createHash } = await import('crypto');
    return createHash('sha256').update(data).digest('hex');
  } catch {
    return simpleHash(data);
  }
}

function simpleHash(data: string): string {
  let hash = 0;
  for (let i = 0; i < data.length; i++) {
    const char = data.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return Math.abs(hash).toString(16).padStart(8, '0');
}

// -----------------------------------------------------------------------------
// getDeviceInfo
// -----------------------------------------------------------------------------

export function getDeviceInfo(userAgent: string): DeviceInfo {
  const ua = userAgent || '';

  // Browser detection
  const browserMatch =
    ua.match(/(opera|chrome|safari|firefox|msie|trident|edge|edg)\/?\s*(\d+\.?\d*)/i) ||
    ua.match(/(opr|brave|vivaldi)\/?\s*(\d+\.?\d*)/i);

  let browser = 'Unknown';
  let browserVersion = '';

  if (browserMatch) {
    const rawBrowser = browserMatch[1].toLowerCase();
    browserVersion = browserMatch[2];

    const browserMap: Record<string, string> = {
      chrome: 'Chrome',
      safari: 'Safari',
      firefox: 'Firefox',
      edge: 'Edge',
      edg: 'Edge',
      msie: 'Internet Explorer',
      trident: 'Internet Explorer',
      opera: 'Opera',
      opr: 'Opera',
      brave: 'Brave',
      vivaldi: 'Vivaldi',
    };

    browser = browserMap[rawBrowser] || rawBrowser.charAt(0).toUpperCase() + rawBrowser.slice(1);
  }

  // OS detection
  const osMatch =
    ua.match(/(windows nt|windows|macintosh|mac os x|linux|android|iphone|ipad|ipod)/i) ||
    [null, ''];

  let os = 'Unknown';
  let osVersion = '';

  const osRaw = (osMatch[1] || '').toLowerCase();

  if (osRaw.includes('windows')) {
    os = 'Windows';
    const winMatch = ua.match(/Windows NT (\d+\.?\d*)/);
    if (winMatch) osVersion = winMatch[1];
  } else if (osRaw.includes('macintosh') || osRaw.includes('mac os x')) {
    os = 'macOS';
    const macMatch = ua.match(/Mac OS X (\d+[._]\d+[._]?\d*)/);
    if (macMatch) osVersion = macMatch[1].replace(/_/g, '.');
  } else if (osRaw.includes('linux')) {
    os = 'Linux';
    if (osRaw.includes('android')) {
      os = 'Android';
      const androidMatch = ua.match(/Android (\d+\.?\d*)/);
      if (androidMatch) osVersion = androidMatch[1];
    }
  } else if (osRaw.includes('iphone') || osRaw.includes('ipad') || osRaw.includes('ipod')) {
    os = 'iOS';
    const iosMatch = ua.match(/OS (\d+_\d+)/);
    if (iosMatch) osVersion = iosMatch[1].replace('_', '.');
  }

  // Device detection
  const isMobile = /android|iphone|ipad|ipod|mobile/i.test(ua);
  const isTablet = /ipad|android(?!.*mobile)/i.test(ua);
  const isBot = /bot|crawler|spider|scrapy|curl|wget/i.test(ua);

  let device = 'Desktop';
  let deviceType: 'desktop' | 'mobile' | 'tablet' = 'desktop';

  if (isBot) {
    device = 'Bot';
  } else if (isTablet) {
    device = 'Tablet';
    deviceType = 'tablet';
  } else if (isMobile) {
    device = 'Mobile';
    deviceType = 'mobile';
  }

  return {
    browser,
    browserVersion,
    os,
    osVersion,
    device,
    deviceType,
    isBot,
  };
}

// -----------------------------------------------------------------------------
// getKPIData
// -----------------------------------------------------------------------------

export function getKPIData(
  role: Role,
  orgId: string
): Promise<KPI[]> {
  // This function would normally fetch data from the API
  // For now, return a placeholder implementation
  const baseKPIs: Record<Role, KPI[]> = {
    [Role.SUPER_ADMIN]: [
      { id: 'total_orgs', label: 'Organizações', value: 0, icon: 'Building2', color: 'blue' },
      { id: 'total_users', label: 'Usuários Totais', value: 0, icon: 'Users', color: 'purple' },
    ],
    [Role.COORDINATOR]: [
      { id: 'total_teachers', label: 'Professores', value: 0, icon: 'GraduationCap', color: 'blue' },
      { id: 'total_students', label: 'Alunos', value: 0, icon: 'BookOpen', color: 'green' },
      { id: 'total_classes', label: 'Turmas', value: 0, icon: 'Calendar', color: 'purple' },
    ],
    [Role.PROFESSOR]: [
      { id: 'total_classes', label: 'Minhas Turmas', value: 0, icon: 'Calendar', color: 'blue' },
      { id: 'total_students', label: 'Alunos', value: 0, icon: 'BookOpen', color: 'green' },
      { id: 'pending_grading', label: 'Avaliações Pendentes', value: 0, icon: 'PenTool', color: 'orange' },
    ],
    [Role.STUDENT]: [
      { id: 'total_classes', label: 'Minhas Disciplinas', value: 0, icon: 'Calendar', color: 'blue' },
      { id: 'pending_assignments', label: 'Atividades Pendentes', value: 0, icon: 'FileText', color: 'orange' },
      { id: 'attendance_pct', label: 'Frequência', value: '0%', icon: 'CheckCircle', color: 'emerald' },
    ],
    [Role.ASSISTANT]: [
      { id: 'total_classes', label: 'Turmas', value: 0, icon: 'Calendar', color: 'blue' },
      { id: 'pending_tasks', label: 'Tarefas Pendentes', value: 0, icon: 'ListTodo', color: 'orange' },
    ],
  };

  // In real implementation, this would fetch from API:
  // const response = await fetch(`/api/dashboard/kpis?orgId=${orgId}&role=${role}`);
  // return response.data;

  return Promise.resolve(baseKPIs[role] ?? []);
}

// -----------------------------------------------------------------------------
// Time Helpers
// -----------------------------------------------------------------------------

function timeToMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
}

function minutesToTime(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

// -----------------------------------------------------------------------------
// getTimeSlotLabel
// -----------------------------------------------------------------------------

export function getTimeSlotLabel(startTime: string, endTime: string): string {
  return `${startTime} - ${endTime}`;
}

// -----------------------------------------------------------------------------
// getAvailableTimeSlots
// -----------------------------------------------------------------------------

export function getAvailableTimeSlots(
  startTime?: string,
  endTime?: string
): TimeSlot[] {
  const allSlots: TimeSlot[] = TIME_SLOTS.map((slot) => ({
    startTime: slot.value,
    endTime: getNextHalfHour(slot.value),
    label: `${slot.label} - ${getNextHalfHour(slot.value)}`,
  }));

  if (!startTime && !endTime) return allSlots;

  return allSlots.filter((slot) => {
    const startMatch = !startTime || slot.startTime >= startTime;
    const endMatch = !endTime || slot.startTime < endTime;
    return startMatch && endMatch;
  });
}

function getNextHalfHour(time: string): string {
  const [h, m] = time.split(':').map(Number);
  if (m === 0) return `${String(h).padStart(2, '0')}:30`;
  return `${String(h + 1).padStart(2, '0')}:00`;
}

// -----------------------------------------------------------------------------
// getShiftFromTime
// -----------------------------------------------------------------------------

export function getShiftFromTime(time: string): 'MATUTINO' | 'VESPERTINO' | 'NOTURNO' {
  const hour = parseInt(time.split(':')[0], 10);

  if (hour < 12) return 'MATUTINO';
  if (hour < 18) return 'VESPERTINO';
  return 'NOTURNO';
}

// -----------------------------------------------------------------------------
// getGradeColor
// -----------------------------------------------------------------------------

export function getGradeColor(grade: number, maxGrade: number = 10): string {
  const percentage = (grade / maxGrade) * 100;

  if (percentage >= 90) return 'text-green-600';
  if (percentage >= 70) return 'text-blue-600';
  if (percentage >= 50) return 'text-yellow-600';
  if (percentage >= 30) return 'text-orange-600';
  return 'text-red-600';
}

// -----------------------------------------------------------------------------
// getAttendanceColor
// -----------------------------------------------------------------------------

export function getAttendanceColor(percentage: number): string {
  if (percentage >= 90) return 'text-green-600';
  if (percentage >= 75) return 'text-blue-600';
  if (percentage >= 60) return 'text-yellow-600';
  if (percentage >= 40) return 'text-orange-600';
  return 'text-red-600';
}

// -----------------------------------------------------------------------------
// getInitials
// -----------------------------------------------------------------------------

export function getInitials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase())
    .slice(0, 2)
    .join('');
}

// -----------------------------------------------------------------------------
// debounce
// -----------------------------------------------------------------------------

export function debounce<T extends (...args: unknown[]) => unknown>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout>;

  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}

// -----------------------------------------------------------------------------
// throttle
// -----------------------------------------------------------------------------

export function throttle<T extends (...args: unknown[]) => unknown>(
  fn: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle = false;

  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      fn(...args);
      inThrottle = true;
      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }
  };
}

// -----------------------------------------------------------------------------
// sleep
// -----------------------------------------------------------------------------

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// -----------------------------------------------------------------------------
// truncate
// -----------------------------------------------------------------------------

export function truncate(text: string, maxLength: number, suffix: string = '...'): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - suffix.length) + suffix;
}

// -----------------------------------------------------------------------------
// capitalize
// -----------------------------------------------------------------------------

export function capitalize(text: string): string {
  if (!text) return text;
  return text.charAt(0).toUpperCase() + text.slice(1);
}

// -----------------------------------------------------------------------------
// formatGrade
// -----------------------------------------------------------------------------

export function formatGrade(grade: number | null | undefined, maxGrade: number = 10): string {
  if (grade === null || grade === undefined) return '—';
  if (maxGrade === 10) return grade.toFixed(1);
  return `${grade}/${maxGrade}`;
}

// -----------------------------------------------------------------------------
// isValidCPF (Brazilian ID validation)
// -----------------------------------------------------------------------------

export function isValidCPF(cpf: string): boolean {
  const cleaned = cpf.replace(/\D/g, '');

  if (cleaned.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(cleaned)) return false;

  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cleaned.charAt(i), 10) * (10 - i);
  }
  let remainder = (sum * 10) % 11;
  if (remainder === 10) remainder = 0;
  if (remainder !== parseInt(cleaned.charAt(9), 10)) return false;

  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cleaned.charAt(i), 10) * (11 - i);
  }
  remainder = (sum * 10) % 11;
  if (remainder === 10) remainder = 0;

  return remainder === parseInt(cleaned.charAt(10), 10);
}

// -----------------------------------------------------------------------------
// maskCPF
// -----------------------------------------------------------------------------

export function maskCPF(cpf: string): string {
  const cleaned = cpf.replace(/\D/g, '');
  return cleaned.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
}

// -----------------------------------------------------------------------------
// maskPhone
// -----------------------------------------------------------------------------

export function maskPhone(phone: string): string {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 11) {
    return cleaned.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  }
  if (cleaned.length === 10) {
    return cleaned.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
  }
  return phone;
}

// -----------------------------------------------------------------------------
// buildQueryString
// -----------------------------------------------------------------------------

export function buildQueryString(params: Record<string, string | number | boolean | undefined | null>): string {
  const searchParams = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.append(key, String(value));
    }
  }

  const qs = searchParams.toString();
  return qs ? `?${qs}` : '';
}

// -----------------------------------------------------------------------------
// parseQueryString
// -----------------------------------------------------------------------------

export function parseQueryString(queryString: string): Record<string, string> {
  const params: Record<string, string> = {};
  const searchParams = new URLSearchParams(queryString);

  searchParams.forEach((value, key) => {
    params[key] = value;
  });

  return params;
}

// -----------------------------------------------------------------------------
// deepClone
// -----------------------------------------------------------------------------

export function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

// -----------------------------------------------------------------------------
// groupBy
// -----------------------------------------------------------------------------

export function groupBy<T>(array: T[], key: keyof T): Record<string, T[]> {
  return array.reduce((result, item) => {
    const groupKey = String(item[key]);
    if (!result[groupKey]) result[groupKey] = [];
    result[groupKey].push(item);
    return result;
  }, {} as Record<string, T[]>);
}

// -----------------------------------------------------------------------------
// uniqueBy
// -----------------------------------------------------------------------------

export function uniqueBy<T>(array: T[], key: keyof T): T[] {
  const seen = new Set();
  return array.filter((item) => {
    const value = String(item[key]);
    if (seen.has(value)) return false;
    seen.add(value);
    return true;
  });
}

// -----------------------------------------------------------------------------
// isWithinDateRange
// -----------------------------------------------------------------------------

export function isWithinDateRange(
  date: Date | string,
  startDate: Date | string,
  endDate: Date | string
): boolean {
  const d = new Date(date);
  const start = new Date(startDate);
  const end = new Date(endDate);
  return d >= start && d <= end;
}

// -----------------------------------------------------------------------------
// isWeekday
// -----------------------------------------------------------------------------

export function isWeekday(date: Date | string): boolean {
  const d = new Date(date);
  const day = d.getDay(); // 0 = Sunday, 6 = Saturday
  return day >= 1 && day <= 5;
}

// -----------------------------------------------------------------------------
// daysBetween
// -----------------------------------------------------------------------------

export function daysBetween(start: Date | string, end: Date | string): number {
  const s = new Date(start);
  const e = new Date(end);
  const diffMs = e.getTime() - s.getTime();
  return Math.floor(diffMs / (1000 * 60 * 60 * 24));
}
