import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const PUBLIC_ROUTES = ['/login', '/register', '/forgot-password']
const DASHBOARD_ROUTE = '/dashboard'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Allow public routes
  if (PUBLIC_ROUTES.some(route => pathname.startsWith(route))) {
    // If already logged in, redirect to dashboard
    const token = request.cookies.get('orkestrando-token')
    if (token) {
      return NextResponse.redirect(new URL(DASHBOARD_ROUTE, request.url))
    }
    return NextResponse.next()
  }

  // Protect dashboard routes
  if (pathname.startsWith(DASHBOARD_ROUTE)) {
    const token = request.cookies.get('orkestrando-token')
    if (!token) {
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('callbackUrl', pathname)
      return NextResponse.redirect(loginUrl)
    }
    // Decode JWT and add role to headers
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
      requestHeaders.set('x-user-id', payload.profileId || payload.userId || payload.sub || '')
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

  // Allow root page - redirect to dashboard if authenticated, or to login
  if (pathname === '/') {
    const token = request.cookies.get('orkestrando-token')
    if (token) {
      return NextResponse.redirect(new URL(DASHBOARD_ROUTE, request.url))
    }
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|components|lib|styles|logo.svg).*)'],
}
