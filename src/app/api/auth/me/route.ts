import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { validateToken } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    const token = authHeader?.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json({ success: false, error: 'Token required' }, { status: 401 })
    }

    const payload = validateToken(token)
    if (!payload) {
      return NextResponse.json({ success: false, error: 'Invalid or expired token' }, { status: 401 })
    }

    const profile = await db.profile.findUnique({ where: { id: payload.profileId } })
    if (!profile) {
      return NextResponse.json({ success: false, error: 'Profile not found' }, { status: 404 })
    }

    const { password: _, ...safeProfile } = profile
    return NextResponse.json({ success: true, data: safeProfile })
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed to fetch profile'
    return NextResponse.json({ success: false, error: msg }, { status: 500 })
  }
}
