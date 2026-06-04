import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { db } from '@/lib/db'

const DEFAULT_ORG_ID = 'org-001'

export async function POST(request: NextRequest) {
  try {
    const { email, password, firstName, lastName, role, phone } = await request.json()

    if (!email || !password || !firstName || !lastName) {
      return NextResponse.json({ error: 'Required fields missing' }, { status: 400 })
    }

    // Create user in Supabase Auth
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    })

    if (error || !data.user) {
      if (error?.message?.includes('already registered')) {
        return NextResponse.json({ error: 'Email already registered' }, { status: 409 })
      }
      console.error('Supabase Auth error:', error)
      return NextResponse.json({ error: 'Failed to create account' }, { status: 500 })
    }

    // Create profile in our profiles table
    const profile = await db.profile.create({
      data: {
        user_id: data.user.id,
        org_id: DEFAULT_ORG_ID,
        email,
        first_name: firstName,
        last_name: lastName,
        role: role || 'STUDENT',
        phone: phone || null,
      },
    })

    // Sign in to get the session token
    const { data: sessionData, error: sessionError } = await supabaseAdmin.auth.signInWithPassword({
      email,
      password,
    })

    if (sessionError || !sessionData.session) {
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
