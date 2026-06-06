import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { db } from '@/lib/db'

export async function POST(request: NextRequest) {
  // Step 1: parse body
  let email: string, password: string
  try {
    const body = await request.json()
    email = body.email
    password = body.password
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  if (!email || !password) {
    return NextResponse.json({ error: 'Email and password are required' }, { status: 400 })
  }

  // Step 2: authenticate via Supabase Auth
  let userId: string
  let accessToken: string
  try {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error || !data.user || !data.session) {
      return NextResponse.json({ error: error?.message || 'Invalid credentials' }, { status: 401 })
    }
    userId = data.user.id
    accessToken = data.session.access_token
  } catch (err: any) {
    console.error('[auth] Supabase signIn threw:', err?.message)
    return NextResponse.json({ error: 'Auth service error: ' + (err?.message || 'unknown') }, { status: 500 })
  }

  // Step 3: fetch profile from database
  try {
    const profile = await db.profile.findUnique({ where: { user_id: userId } })
    if (!profile) {
      return NextResponse.json({ error: 'Profile not found. Contact your administrator.' }, { status: 404 })
    }
    return NextResponse.json({ token: accessToken, user: profile })
  } catch (err: any) {
    console.error('[auth] Prisma error:', err?.message, err?.code)
    return NextResponse.json({
      error: 'Database error: ' + (err?.message || 'unknown'),
      code: err?.code,
    }, { status: 500 })
  }
}
