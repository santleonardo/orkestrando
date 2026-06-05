// =============================================================================
// ORKESTRANDO - Format Utility Functions
// =============================================================================

/**
 * Formats a number as Brazilian Real currency (R$)
 */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

/**
 * Formats a number as a percentage
 */
export function formatPercentage(value: number, decimalPlaces: number = 1): string {
  return `${value.toFixed(decimalPlaces)}%`
}

/**
 * Formats a phone number to Brazilian format ((XX) XXXXX-XXXX)
 */
export function formatPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '')

  if (digits.length === 11) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`
  }
  if (digits.length === 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`
  }

  return phone
}

/**
 * Formats a CPF (Brazilian document number) to XXX.XXX.XXX-XX format
 */
export function formatDocument(document: string): string {
  const digits = document.replace(/\D/g, '')

  if (digits.length === 11) {
    return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`
  }

  return document
}

/**
 * Formats a class name to a display-friendly format
 * Example: "turma_a_2024_1" -> "Turma A - 2024/1"
 */
export function formatClassName(name: string): string {
  return name
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase())
    .replace(/(\d{4})\/?(\d)/, '$1/$2')
}

/**
 * Truncates text to a maximum length with ellipsis
 */
export function truncateText(text: string, maxLength: number = 100): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength).trim() + '...'
}

/**
 * Converts text to a URL-friendly slug
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '')
}

/**
 * Gets the initials from a person's name
 * Example: "João da Silva" -> "JS"
 */
export function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/)

  if (parts.length === 1) {
    return parts[0].charAt(0).toUpperCase()
  }

  const first = parts[0].charAt(0).toUpperCase()
  const last = parts[parts.length - 1].charAt(0).toUpperCase()

  return `${first}${last}`
}

/**
 * Formats a file size in bytes to a human-readable string
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B'

  const units = ['B', 'KB', 'MB', 'GB', 'TB']
  const k = 1024
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${units[i]}`
}

/**
 * Formats a grade value (0-10) with appropriate precision
 */
export function formatGrade(grade: number | null | undefined): string {
  if (grade === null || grade === undefined) return '—'
  return grade.toFixed(1).replace('.', ',')
}

/**
 * Formats a number with Brazilian locale formatting
 */
export function formatNumber(value: number): string {
  return new Intl.NumberFormat('pt-BR').format(value)
}

/**
 * Formats a time duration in minutes to human-readable format
 * Example: 90 -> "1h 30min"
 */
export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes}min`

  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60

  if (mins === 0) return `${hours}h`
  return `${hours}h ${mins}min`
}

/**
 * Capitalizes the first letter of a string
 */
export function capitalize(text: string): string {
  if (!text) return text
  return text.charAt(0).toUpperCase() + text.slice(1)
}

/**
 * Converts a role enum value to a display label
 */
export function formatRole(role: string): string {
  const roles: Record<string, string> = {
    admin: 'Administrador',
    coordinator: 'Coordenador',
    teacher: 'Professor',
    student: 'Aluno',
  }
  return roles[role] || role
}
