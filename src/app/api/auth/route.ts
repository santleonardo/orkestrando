import { NextRequest, NextResponse } from 'next/server'

// ==================== POST /api/auth/login ====================

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = body

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: { message: 'Email and password are required' } },
        { status: 400 }
      )
    }

    const { createClient } = await import('@supabase/supabase-js')
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    const supabase = createClient(supabaseUrl, supabaseKey)

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      return NextResponse.json(
        { success: false, error: { message: error.message } },
        { status: 401 }
      )
    }

    const user = data.user
    const session = data.session

    // Fetch profile from profiles table
    let profile = null
    const { data: profileData } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (profileData) {
      profile = {
        id: profileData.id,
        email: profileData.email || user.email,
        firstName: profileData.first_name || '',
        lastName: profileData.last_name || '',
        name: `${profileData.first_name || ''} ${profileData.last_name || ''}`.trim(),
        role: profileData.role,
        avatarUrl: profileData.avatar_url || null,
        phone: profileData.phone || null,
        bio: profileData.bio || null,
        orgId: profileData.org_id || null,
      }
    }

    const response = NextResponse.json({
      success: true,
      data: {
        tokens: {
          accessToken: session?.access_token,
          refreshToken: session?.refresh_token,
          expiresIn: session?.expires_in,
        },
        user: {
          id: user.id,
          email: user.email,
          name: profile?.name || user.user_metadata?.name || '',
          avatarUrl: profile?.avatarUrl || null,
          role: profile?.role || user.user_metadata?.role || 'STUDENT',
          profile: profile,
        },
      },
    })

    // Set auth cookies
    if (session?.access_token) {
      const maxAge = body.rememberMe ? 60 * 60 * 24 * 30 : session.expires_in || 3600
      response.cookies.set('orkestrando-token', session.access_token, {
        path: '/',
        maxAge,
        httpOnly: false,
        sameSite: 'lax',
      })
    }
    if (session?.refresh_token) {
      response.cookies.set('orkestrando-refresh-token', session.refresh_token, {
        path: '/',
        maxAge: 60 * 60 * 24 * 7,
        httpOnly: true,
        sameSite: 'lax',
      })
    }

    return response
  } catch (error) {
    console.error('[Auth Login Error]', error)
    return NextResponse.json(
      { success: false, error: { message: 'Internal server error' } },
      { status: 500 }
    )
  }
}

// ==================== GET /api/auth/me ====================

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('orkestrando-token')?.value ||
      request.headers.get('Authorization')?.replace('Bearer ', '')

    if (!token) {
      return NextResponse.json(
        { success: false, error: { message: 'Authentication required' } },
        { status: 401 }
      )
    }

    const { createClient } = await import('@supabase/supabase-js')
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    const supabase = createClient(supabaseUrl, supabaseKey)

    const { data: { user }, error } = await supabase.auth.getUser(token)

    if (error || !user) {
      return NextResponse.json(
        { success: false, error: { message: 'Invalid or expired token' } },
        { status: 401 }
      )
    }

    // Fetch profile
    const { data: profileData } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    const profile = profileData ? {
      id: profileData.id,
      email: profileData.email || user.email,
      firstName: profileData.first_name || '',
      lastName: profileData.last_name || '',
      name: `${profileData.first_name || ''} ${profileData.last_name || ''}`.trim(),
      role: profileData.role,
      avatarUrl: profileData.avatar_url || null,
      phone: profileData.phone || null,
      bio: profileData.bio || null,
      orgId: profileData.org_id || null,
    } : null

    return NextResponse.json({
      success: true,
      data: {
        id: user.id,
        email: user.email,
        name: profile?.name || user.user_metadata?.name || '',
        avatarUrl: profile?.avatarUrl || null,
        profile,
      },
    })
  } catch (error) {
    console.error('[Auth Me Error]', error)
    return NextResponse.json(
      { success: false, error: { message: 'Internal server error' } },
      { status: 500 }
    )
  }
}
