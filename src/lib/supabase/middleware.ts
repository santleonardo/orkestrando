import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // IMPORTANT: Avoid writing any logic between createServerClient and
  // supabase.auth.getUser(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // If no user and not on a public route, redirect to login
  const publicPaths = ['/', '/login', '/register', '/forgot-password']
  const isPublicPath = publicPaths.some((path) =>
    request.nextUrl.pathname.startsWith(path)
  )

  if (
    !user &&
    !isPublicPath &&
    !request.nextUrl.pathname.startsWith('/_next') &&
    !request.nextUrl.pathname.startsWith('/api') &&
    !request.nextUrl.pathname.startsWith('/auth')
  ) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // Role-based redirect after login
  if (user && request.nextUrl.pathname === '/login') {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('user_id', user.id)
      .single()

    if (profile) {
      const url = request.nextUrl.clone()
      switch (profile.role) {
        case 'coordinator':
        case 'admin':
          url.pathname = '/dashboard'
          break
        case 'teacher':
          url.pathname = '/dashboard/availability'
          break
        case 'student':
          url.pathname = '/student'
          break
        default:
          url.pathname = '/dashboard'
      }
      return NextResponse.redirect(url)
    }
  }

  // Route protection by role
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('user_id', user.id)
      .single()

    if (profile) {
      const restrictedPaths: Record<string, string[]> = {
        student: ['/dashboard'],
        teacher: ['/student'],
        coordinator: ['/student'],
      }

      const role = profile.role as string
      const disallowed = restrictedPaths[role]

      if (
        disallowed &&
        disallowed.some((p) => request.nextUrl.pathname.startsWith(p))
      ) {
        const url = request.nextUrl.clone()
        url.pathname = role === 'student' ? '/student' : '/dashboard'
        return NextResponse.redirect(url)
      }
    }
  }

  return supabaseResponse
}
