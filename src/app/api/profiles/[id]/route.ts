import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const profile = await db.profile.findUnique({ where: { id } })
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

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await request.json()
    const profile = await db.profile.update({ where: { id }, data: body })
    const { password: _, ...safeProfile } = profile
    return NextResponse.json({ success: true, data: safeProfile })
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed to update profile'
    return NextResponse.json({ success: false, error: msg }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    await db.profile.delete({ where: { id } })
    return NextResponse.json({ success: true, data: null })
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed to delete profile'
    return NextResponse.json({ success: false, error: msg }, { status: 500 })
  }
}
