import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db'
import { parseBody, handleApiError, apiError, getAuthProfile } from '@/lib/api-utils'

// ==================== Schemas ====================

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

// ==================== POST /api/auth  (login) ====================

export async function POST(request: NextRequest) {
  try {
    const body = await parseBody(request, loginSchema)

    const user = await db.user.findUnique({
      where: { email: body.email },
      include: { profile: true },
    })

    if (!user) {
      // Return plain JSON so the hook can read data.error directly
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 })
    }

    // PLACEHOLDER: replace with bcrypt.compare in production
    const isValidPassword =
      body.password === user.passwordHash || user.passwordHash === 'PLACEHOLDER'

    if (!isValidPassword) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 })
    }

    // PLACEHOLDER: replace with real JWT signing in production
    const accessToken = `placeholder-token-${user.id}`
    const refreshToken = `placeholder-refresh-${user.id}`

    await db.auditLog.create({
      data: {
        action: 'LOGIN',
        profileId: user.profile?.id,
        resource: 'User',
        resourceId: user.id,
        ipAddress: request.headers.get('x-forwarded-for') || undefined,
        userAgent: request.headers.get('user-agent') || undefined,
      },
    })

    // Return shape that matches the hook's LoginResponse interface
    return NextResponse.json(
      {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          avatarUrl: user.avatarUrl,
          role: user.profile?.role ?? null,
          profile: user.profile
            ? {
                id: user.profile.id,
                role: user.profile.role,
                registrationNumber: user.profile.registrationNumber,
              }
            : null,
        },
        tokens: {
          accessToken,
          refreshToken,
          expiresIn: 86400,
        },
      },
      { status: 200 }
    )
  } catch (error) {
    return handleApiError(error)
  }
}

// ==================== GET /api/auth  (me / current user) ====================

export async function GET(request: NextRequest) {
  try {
    const profile = getAuthProfile(request)

    const user = await db.user.findUnique({
      where: { id: profile.userId },
      include: { profile: true },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Flat shape – hook reads the object directly as the user profile
    return NextResponse.json(
      {
        id: user.id,
        email: user.email,
        name: user.name,
        avatarUrl: user.avatarUrl,
        role: user.profile?.role ?? null,
        profile: user.profile
          ? {
              id: user.profile.id,
              role: user.profile.role,
              registrationNumber: user.profile.registrationNumber,
              phone: user.profile.phone,
              bio: user.profile.bio,
            }
          : null,
      },
      { status: 200 }
    )
  } catch (error) {
    return handleApiError(error)
  }
}

// ==================== DELETE /api/auth  (logout) ====================

export async function DELETE(request: NextRequest) {
  try {
    // Best-effort audit log; ignore if unauthenticated
    try {
      const profile = getAuthProfile(request)
      await db.auditLog.create({
        data: {
          action: 'LOGOUT',
          profileId: profile.id,
          resource: 'User',
          resourceId: profile.userId,
          ipAddress: request.headers.get('x-forwarded-for') || undefined,
          userAgent: request.headers.get('user-agent') || undefined,
        },
      })
    } catch {
      // Not authenticated – that's fine, just clear cookies
    }

    const response = NextResponse.json({ success: true }, { status: 200 })
    response.cookies.delete('orkestrando-token')
    response.cookies.delete('orkestrando-refresh-token')
    return response
  } catch (error) {
    return handleApiError(error)
  }
}

// ==================== OPTIONS (CORS preflight) ====================

export async function OPTIONS() {
  return NextResponse.json({}, { status: 204 })
}
