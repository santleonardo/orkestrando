import { NextRequest, NextResponse } from 'next/server'

// ==================== POST /api/auth/logout ====================

export async function POST(request: NextRequest) {
  try {
    const { createClient } = await import('@supabase/supabase-js')
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Get token from cookie
    const token = request.cookies.get('orkestrando-token')?.value
    if (token) {
      await supabase.auth.admin.signOut(token)
    }

    const response = NextResponse.json({ success: true, data: { message: 'Logged out' } })
    response.cookies.delete('orkestrando-token')
    response.cookies.delete('orkestrando-refresh-token')
    return response
  } catch (error) {
    console.error('[Auth Logout Error]', error)
    const response = NextResponse.json({ success: true, data: { message: 'Logged out' } })
    response.cookies.delete('orkestrando-token')
    response.cookies.delete('orkestrando-refresh-token')
    return response
  }
}
