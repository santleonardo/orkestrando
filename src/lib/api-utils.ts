import { NextRequest, NextResponse } from 'next/server'
import { z, ZodSchema } from 'zod'

// ==================== Auth Profile Types ====================

export interface AuthProfile {
  id: string
  userId: string
  email: string
  name: string
  role: string
}

// ==================== Request Parsing ====================

/**
 * Parses and validates the request body against a Zod schema.
 * Returns the validated data or throws an error.
 */
export async function parseBody<T>(request: NextRequest, schema: ZodSchema<T>): Promise<T> {
  try {
    const rawBody = await request.json()
    return schema.parse(rawBody) as T
  } catch (error) {
    if (error instanceof z.ZodError) {
      const firstError = error.errors[0]
      throw new ApiValidationError(
        firstError.message,
        error.errors.map((e) => ({
          field: String(e.path.join('.')),
          message: e.message,
        }))
      )
    }
    throw error
  }
}

/**
 * Parses and validates query parameters against a Zod schema.
 * Query params are always strings, so coerce is applied automatically.
 */
export function parseQuery<T>(request: NextRequest, schema: ZodSchema<T>): T {
  const { searchParams } = new URL(request.url)
  const rawQuery: Record<string, string | string[] | undefined> = {}

  searchParams.forEach((value, key) => {
    // Handle multiple values for the same key
    const existing = rawQuery[key]
    if (existing !== undefined) {
      if (Array.isArray(existing)) {
        existing.push(value)
      } else {
        rawQuery[key] = [existing, value]
      }
    } else {
      rawQuery[key] = value
    }
  })

  try {
    return schema.parse(rawQuery) as T
  } catch (error) {
    if (error instanceof z.ZodError) {
      const firstError = error.errors[0]
      throw new ApiValidationError(
        firstError.message,
        error.errors.map((e) => ({
          field: String(e.path.join('.')),
          message: e.message,
        }))
      )
    }
    throw error
  }
}

// ==================== Custom Error Classes ====================

export class ApiError extends Error {
  constructor(
    public message: string,
    public status: number = 500,
    public details?: unknown
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

export class ApiValidationError extends ApiError {
  constructor(
    message: string,
    public validationErrors: Array<{ field: string; message: string }>
  ) {
    super(message, 400, validationErrors)
    this.name = 'ApiValidationError'
  }
}

export class NotFoundError extends ApiError {
  constructor(resource: string, id?: string) {
    super(`${resource}${id ? ` with id '${id}'` : ''} not found`, 404)
    this.name = 'NotFoundError'
  }
}

export class UnauthorizedError extends ApiError {
  constructor(message = 'Authentication required') {
    super(message, 401)
    this.name = 'UnauthorizedError'
  }
}

export class ForbiddenError extends ApiError {
  constructor(message = 'Insufficient permissions') {
    super(message, 403)
    this.name = 'ForbiddenError'
  }
}

// ==================== Response Helpers ====================

/**
 * Wraps data in a standardized success response.
 */
export function apiResponse<T>(data: T, status: number = 200) {
  return NextResponse.json(
    {
      success: true,
      data,
    },
    { status }
  )
}

/**
 * Wraps paginated data with metadata.
 */
export function paginatedResponse<T>(
  data: T[],
  total: number,
  page: number,
  pageSize: number
) {
  const totalPages = Math.ceil(total / pageSize)

  return NextResponse.json({
    success: true,
    data,
    pagination: {
      page,
      pageSize,
      total,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    },
  })
}

/**
 * Returns a standardized error response.
 */
export function apiError(message: string, status: number = 500, details?: unknown) {
  return NextResponse.json(
    {
      success: false,
      error: {
        message,
        details,
      },
    },
    { status }
  )
}

/**
 * Central error handler that converts various error types to appropriate HTTP responses.
 */
export function handleApiError(error: unknown): NextResponse {
  // Handle known API errors
  if (error instanceof ApiValidationError) {
    return apiError('Validation failed', error.status, error.validationErrors)
  }

  if (error instanceof NotFoundError) {
    return apiError(error.message, error.status)
  }

  if (error instanceof UnauthorizedError) {
    return apiError(error.message, error.status)
  }

  if (error instanceof ForbiddenError) {
    return apiError(error.message, error.status)
  }

  if (error instanceof ApiError) {
    return apiError(error.message, error.status)
  }

  // Handle Prisma unique constraint violation
  if (isPrismaError(error)) {
    const prismaError = error as any
    if (prismaError.code === 'P2002') {
      const target = (prismaError.meta?.target as string[]) || []
      return apiError(
        `A record with this ${target.join(', ')} already exists`,
        409
      )
    }
    if (prismaError.code === 'P2025') {
      return apiError('Record not found', 404)
    }
    if (prismaError.code === 'P2003') {
      return apiError('Referenced record not found', 400)
    }
    // Log the full error in development
    if (process.env.NODE_ENV === 'development') {
      console.error('[Prisma Error]', prismaError)
    }
    return apiError('Database error', 500)
  }

  // Handle Zod errors that might slip through
  if (error instanceof z.ZodError) {
    return apiError(
      'Validation failed',
      400,
      error.errors.map((e) => ({
        field: String(e.path.join('.')),
        message: e.message,
      }))
    )
  }

  // Handle generic errors
  if (error instanceof Error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('[Unhandled Error]', error)
    }
    return apiError(
      process.env.NODE_ENV === 'development'
        ? error.message
        : 'Internal server error',
      500
    )
  }

  // Handle unknown error types
  return apiError('An unexpected error occurred', 500)
}

function isPrismaError(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    typeof (error as any).code === 'string' &&
    (error as any).code.startsWith('P')
  )
}

// ==================== Auth & Permissions ====================

/**
 * Extracts the authenticated user profile from request headers.
 * PLACEHOLDER: In production, this would decode a JWT token or use session data.
 */
export function getAuthProfile(request: NextRequest): AuthProfile {
  const userId = request.headers.get('x-user-id')
  const profileId = request.headers.get('x-profile-id')
  const email = request.headers.get('x-user-email')
  const name = request.headers.get('x-user-name')
  const role = request.headers.get('x-user-role')

  if (!userId || !profileId || !role) {
    throw new UnauthorizedError(
      'Authentication required. Provide x-user-id, x-profile-id, and x-user-role headers.'
    )
  }

  return {
    id: profileId,
    userId,
    email: email || '',
    name: name || '',
    role,
  }
}

/**
 * Checks if the authenticated profile has the required permission/role.
 * PLACEHOLDER: In production, this would check against a roles/permissions system.
 */
export function requirePermission(profile: AuthProfile, requiredRole: string): void {
  const roleHierarchy: Record<string, number> = {
    SUPER_ADMIN: 5,
    ADMIN: 4,
    COORDINATOR: 3,
    PROFESSOR: 2,
    TEACHER: 2,
    STUDENT: 1,
  }

  const profileLevel = roleHierarchy[profile.role] || 0
  const requiredLevel = roleHierarchy[requiredRole] || 0

  if (profileLevel < requiredLevel) {
    throw new ForbiddenError(
      `Role '${profile.role}' does not have sufficient permissions. Required: '${requiredRole}'.`
    )
  }
}

/**
 * Checks if the authenticated profile matches any of the given roles.
 */
export function requireAnyRole(profile: AuthProfile, roles: string[]): void {
  if (!roles.includes(profile.role)) {
    throw new ForbiddenError(
      `Role '${profile.role}' is not authorized. Required one of: ${roles.join(', ')}.`
    )
  }
}

// ==================== Pagination ====================

/**
 * Returns a paginated Prisma query with skip and take values,
 * plus the total count.
 */
export async function withPagination<T>(
  queryFn: (args: { skip: number; take: number }) => Promise<{ items: T[]; total: number }>,
  page: number = 1,
  pageSize: number = 20
): Promise<{ items: T[]; total: number; page: number; pageSize: number; totalPages: number }> {
  const validatedPage = Math.max(1, page)
  const validatedPageSize = Math.min(100, Math.max(1, pageSize))
  const skip = (validatedPage - 1) * validatedPageSize

  const { items, total } = await queryFn({ skip, take: validatedPageSize })
  const totalPages = Math.ceil(total / validatedPageSize)

  return {
    items,
    total,
    page: validatedPage,
    pageSize: validatedPageSize,
    totalPages,
  }
}

// ==================== Common Zod Schemas ====================

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
})

export const searchSchema = z.object({
  search: z.string().optional(),
})

export const dateRangeSchema = z.object({
  dateFrom: z.string().datetime({ offset: true }).or(z.string().datetime()).optional(),
  dateTo: z.string().datetime({ offset: true }).or(z.string().datetime()).optional(),
})

export function buildWhereClause<T extends Record<string, unknown>>(
  filters: Partial<T>,
  searchableFields?: string[],
  search?: string
): Record<string, unknown> {
  const where: Record<string, unknown> = {}

  // Add exact match filters
  for (const [key, value] of Object.entries(filters)) {
    if (value !== undefined && value !== null && value !== '') {
      where[key] = value
    }
  }

  // Add search filter (OR across specified fields)
  if (search && searchableFields && searchableFields.length > 0) {
    where.OR = searchableFields.map((field) => ({
      [field]: { contains: search, mode: 'insensitive' as const },
    }))
  }

  return where
}

/**
 * Helper to create audit log entries
 */
export async function createAuditLog(params: {
  action: string
  profileId?: string
  resource: string
  resourceId?: string
  details?: unknown
  request: NextRequest
}) {
  const { db } = await import('@/lib/db')
  await db.auditLog.create({
    data: {
      action: params.action as any,
      profileId: params.profileId,
      resource: params.resource,
      resourceId: params.resourceId,
      details: params.details ? JSON.stringify(params.details) : undefined,
      ipAddress: params.request.headers.get('x-forwarded-for') || params.request.headers.get('x-real-ip') || undefined,
      userAgent: params.request.headers.get('user-agent') || undefined,
    },
  })
}
