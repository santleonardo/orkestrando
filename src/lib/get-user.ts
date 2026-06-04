import { NextRequest } from 'next/server'
import { db } from '@/lib/db'

interface AuthUser {
  id: string
  email: string
  name: string
  role: string
  avatar?: string | null
}

/**
 * Get authenticated user from request.
 * Supports both NextAuth session and custom headers (for SPA mode).
 */
export async function getAuthUser(request: NextRequest): Promise<AuthUser | null> {
  // Try custom header auth first (SPA mode)
  const userId = request.headers.get('x-user-id')
  const userEmail = request.headers.get('x-user-email')

  if (userId && userEmail) {
    const user = await db.user.findUnique({
      where: { id: userId, email: userEmail },
      select: { id: true, email: true, name: true, role: true, avatar: true, isActive: true },
    })
    if (user && user.isActive) {
      return user
    }
    return null
  }

  // Fallback: try NextAuth session
  try {
    const { getServerSession } = await import('next-auth')
    const { authOptions } = await import('@/lib/auth')
    const session = await getServerSession(authOptions)
    if (session?.user) {
      const email = session.user.email
      if (email) {
        const user = await db.user.findUnique({
          where: { email },
          select: { id: true, email: true, name: true, role: true, avatar: true, isActive: true },
        })
        if (user && user.isActive) {
          return user
        }
      }
    }
  } catch {
    // NextAuth not configured or not available
  }

  return null
}

/**
 * Require authentication. Returns user or throws error response.
 */
export async function requireAuth(request: NextRequest): Promise<AuthUser> {
  const user = await getAuthUser(request)
  if (!user) {
    throw new AuthError('Não autorizado', 401)
  }
  return user
}

/**
 * Require specific role(s). Returns user or throws error response.
 */
export async function requireRole(request: NextRequest, roles: string[]): Promise<AuthUser> {
  const user = await requireAuth(request)
  if (!roles.includes(user.role)) {
    throw new AuthError('Acesso negado', 403)
  }
  return user
}

export class AuthError extends Error {
  status: number
  constructor(message: string, status: number) {
    super(message)
    this.status = status
  }
}
