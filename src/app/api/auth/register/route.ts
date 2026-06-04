import { NextRequest, NextResponse } from 'next/server'
import { supabase, supabaseAdmin } from '@/lib/supabase'
import { db } from '@/lib/db'

const DEFAULT_ORG_ID = 'org-001'

export async function POST(request: NextRequest) {
  try {
    const { email, password, firstName, lastName, role, phone } = await request.json()

    if (!email || !password || !firstName || !lastName) {
      return NextResponse.json({ error: 'Required fields missing' }, { status: 400 })
    }

    // Create user in Supabase Auth via admin client (auto-confirms email)
    const { data: adminData, error: adminError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    })

    if (adminError || !adminData.user) {
      if (adminError?.message?.includes('already registered') || adminError?.message?.includes('already been registered')) {
        return NextResponse.json({ error: 'Email already registered' }, { status: 409 })
      }
      console.error('Supabase admin createUser error:', adminError?.message)
      return NextResponse.json({ error: 'Failed to create account' }, { status: 500 })
    }

    // Create profile row in our profiles table
    const profile = await db.profile.create({
      data: {
        user_id: adminData.user.id,
        org_id: DEFAULT_ORG_ID,
        email,
        first_name: firstName,
        last_name: lastName,
        role: role || 'STUDENT',
        phone: phone || null,
      },
    })

    // Sign in with anon client to get session token
    const { data: sessionData, error: sessionError } = await supabase.auth.signInWithPassword({ email, password })

    if (sessionError || !sessionData.session) {
      // Account created, but couldn't get token — return profile id as fallback
      return NextResponse.json({ token: profile.id, user: profile }, { status: 201 })
    }

    return NextResponse.json({
      token: sessionData.session.access_token,
      user: profile,
    }, { status: 201 })
  } catch (error: any) {
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'Email already registered' }, { status: 409 })
    }
    console.error('Register error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
