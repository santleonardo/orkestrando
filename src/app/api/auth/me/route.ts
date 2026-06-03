import { NextRequest, NextResponse } from 'next/server'

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
