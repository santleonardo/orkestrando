import { NextRequest, NextResponse } from 'next/server'

// ==================== POST /api/auth/register ====================

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { firstName, lastName, email, password, role } = body

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: { message: 'Email and password are required' } },
        { status: 400 }
      )
    }

    if (!firstName || !lastName) {
      return NextResponse.json(
        { success: false, error: { message: 'First name and last name are required' } },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { success: false, error: { message: 'Password must be at least 6 characters' } },
        { status: 400 }
      )
    }

    const { createClient } = await import('@supabase/supabase-js')
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Sign up with Supabase Auth
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: firstName,
          last_name: lastName,
          role: role || 'STUDENT',
        },
      },
    })

    if (error) {
      // Handle specific error messages in Portuguese
      let message = error.message
      if (message.includes('already registered') || message.includes('already exists')) {
        message = 'Este e-mail ja esta cadastrado.'
      }
      return NextResponse.json(
        { success: false, error: { message } },
        { status: 409 }
      )
    }

    const user = data.user
    const session = data.session

    // Create/update profile in profiles table
    if (user) {
      const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || supabaseKey
      const adminClient = createClient(supabaseUrl, serviceKey)

      await adminClient.from('profiles').upsert({
        id: user.id,
        email: user.email,
        first_name: firstName,
        last_name: lastName,
        role: role || 'STUDENT',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }, { onConflict: 'id' })
    }

    // Set auth cookies if session available (auto-confirmed)
    const response = NextResponse.json({
      success: true,
      message: session
        ? 'Registro realizado com sucesso!'
        : 'Registro realizado! Verifique seu e-mail para confirmar a conta.',
    }, { status: 201 })

    if (session?.access_token) {
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
    }

    return response
  } catch (error) {
    console.error('[Auth Register Error]', error)
    return NextResponse.json(
      { success: false, error: { message: 'Erro interno do servidor. Tente novamente.' } },
      { status: 500 }
    )
  }
}
