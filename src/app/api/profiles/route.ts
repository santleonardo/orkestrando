import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const role = searchParams.get('role')
    const id = searchParams.get('id')

    if (id) {
      const profile = await db.profile.findUnique({ where: { id } })
      if (!profile) return NextResponse.json({ error: 'Not found' }, { status: 404 })
      const { password: _, ...user } = profile
      return NextResponse.json(user)
    }

    const where: any = {}
    if (role) where.role = role

    const profiles = await db.profile.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    })
    const safe = profiles.map(({ password: _, ...p }) => p)
    return NextResponse.json(safe)
  } catch (error) {
    console.error('Profiles GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    const profile = await db.profile.create({ data })
    const { password: _, ...user } = profile
    return NextResponse.json(user, { status: 201 })
  } catch (error: any) {
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'Email already exists' }, { status: 409 })
    }
    console.error('Profiles POST error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { id, ...data } = await request.json()
    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 })
    const profile = await db.profile.update({ where: { id }, data })
    const { password: _, ...user } = profile
    return NextResponse.json(user)
  } catch (error) {
    console.error('Profiles PUT error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 })
    await db.profile.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Profiles DELETE error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
