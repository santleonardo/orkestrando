import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { db } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 })
    }

    // Use the anon client to sign in — this is the correct client for signInWithPassword
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })

    if (error || !data.user || !data.session) {
      console.error('Supabase auth error:', error?.message)
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }

    // Fetch the profile from our profiles table using Prisma
    const profile = await db.profile.findUnique({
      where: { user_id: data.user.id },
    })

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found. Contact your administrator.' }, { status: 404 })
    }

    return NextResponse.json({
      token: data.session.access_token,
      user: profile,
    })
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
