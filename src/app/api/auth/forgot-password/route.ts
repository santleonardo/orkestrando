import { NextRequest, NextResponse } from 'next/server'

// ==================== POST /api/auth/forgot-password ====================

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json(
        { success: false, error: { message: 'Email is required' } },
        { status: 400 }
      )
    }

    const { createClient } = await import('@supabase/supabase-js')
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    const supabase = createClient(supabaseUrl, supabaseKey)

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL || 'https://orkestrando.vercel.app'}/login`,
    })

    if (error) {
      // Always return success to prevent email enumeration
      console.error('[Forgot Password Error]', error.message)
    }

    return NextResponse.json({
      success: true,
      message: 'If an account with this email exists, we have sent a password reset link.',
    })
  } catch (error) {
    console.error('[Forgot Password Error]', error)
    return NextResponse.json({
      success: true,
      message: 'If an account with this email exists, we have sent a password reset link.',
    })
  }
}
