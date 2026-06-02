import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const PUBLIC_ROUTES = ['/login', '/register', '/forgot-password']

// These match the actual Next.js routes under src/app/(dashboard)/
const PROTECTED_ROUTES = ['/coordinator', '/professor', '/student']

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Allow public routes
  if (PUBLIC_ROUTES.some(route => pathname.startsWith(route))) {
    const token = request.cookies.get('orkestrando-token')
    if (token) {
      // Already logged in – send to the right dashboard
      return NextResponse.redirect(new URL('/coordinator', request.url))
    }
    return NextResponse.next()
  }

  // Protect dashboard routes (no /dashboard prefix – route group (dashboard) strips it)
  if (PROTECTED_ROUTES.some(route => pathname.startsWith(route))) {
    const token = request.cookies.get('orkestrando-token')
    if (!token) {
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('callbackUrl', pathname)
      return NextResponse.redirect(loginUrl)
    }

    try {
      const parts = token.value.split('.')
      if (parts.length !== 3) {
        throw new Error('Invalid token format')
      }
      const payload = JSON.parse(
        Buffer.from(parts[1], 'base64url').toString('utf-8')
      )
      const requestHeaders = new Headers(request.headers)
      requestHeaders.set('x-user-role', payload.role || '')
      // Set BOTH headers so getAuthProfile() can read x-profile-id
      requestHeaders.set('x-user-id', payload.userId || payload.sub || '')
      requestHeaders.set('x-profile-id', payload.profileId || payload.sub || '')
      requestHeaders.set('x-org-id', payload.orgId || '')
      requestHeaders.set('x-user-email', payload.email || '')
      return NextResponse.next({
        request: { headers: requestHeaders },
      })
    } catch {
      const response = NextResponse.redirect(new URL('/login', request.url))
      response.cookies.delete('orkestrando-token')
      response.cookies.delete('orkestrando-refresh-token')
      return response
    }
  }

  // Root redirect
  if (pathname === '/') {
    const token = request.cookies.get('orkestrando-token')
    if (token) {
      return NextResponse.redirect(new URL('/coordinator', request.url))
    }
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|components|lib|styles|logo.svg).*)'],
}
