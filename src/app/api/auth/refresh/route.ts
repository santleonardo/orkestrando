import { NextRequest, NextResponse } from 'next/server'

// ==================== POST /api/auth/refresh ====================

export async function POST(request: NextRequest) {
  try {
    const refreshToken =
      request.cookies.get('orkestrando-refresh-token')?.value ||
      (await request.json()).refreshToken

    if (!refreshToken) {
      return NextResponse.json(
        { success: false, error: { message: 'Refresh token is required' } },
        { status: 401 }
      )
    }

    const { createClient } = await import('@supabase/supabase-js')
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    const supabase = createClient(supabaseUrl, supabaseKey)

    const { data, error } = await supabase.auth.refreshSession({
      refresh_token: refreshToken,
    })

    if (error) {
      return NextResponse.json(
        { success: false, error: { message: 'Invalid or expired refresh token' } },
        { status: 401 }
      )
    }

    const session = data.session

    if (!session) {
      return NextResponse.json(
        { success: false, error: { message: 'Could not refresh session' } },
        { status: 401 }
      )
    }

    const response = NextResponse.json({
      success: true,
      data: {
        tokens: {
          accessToken: session.access_token,
          refreshToken: session.refresh_token,
          expiresIn: session.expires_in,
        },
      },
    })

    response.cookies.set('orkestrando-token', session.access_token, {
      path: '/',
      maxAge: session.expires_in || 3600,
      httpOnly: false,
      sameSite: 'lax',
    })
    response.cookies.set('orkestrando-refresh-token', session.refresh_token, {
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
      httpOnly: true,
      sameSite: 'lax',
    })

    return response
  } catch (error) {
    console.error('[Auth Refresh Error]', error)
    return NextResponse.json(
      { success: false, error: { message: 'Internal server error' } },
      { status: 500 }
    )
  }
}
