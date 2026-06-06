import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    const token = authHeader?.replace('Bearer ', '')

    if (!token) {
      return NextResponse.json({ success: false, error: 'Token required' }, { status: 401 })
    }

    // Validate token via Supabase Auth
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token)

    if (error || !user) {
      return NextResponse.json({ success: false, error: 'Invalid or expired token' }, { status: 401 })
    }

    const profile = await db.profile.findUnique({ where: { user_id: user.id } })

    if (!profile) {
      return NextResponse.json({ success: false, error: 'Profile not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: profile })
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed to fetch profile'
    return NextResponse.json({ success: false, error: msg }, { status: 500 })
  }
}
