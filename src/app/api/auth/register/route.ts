import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    const { email, password, firstName, lastName, role, phone, department, course, semester, shift } = data

    if (!email || !password || !firstName || !lastName) {
      return NextResponse.json({ error: 'Required fields missing' }, { status: 400 })
    }

    const existing = await db.profile.findUnique({ where: { email } })
    if (existing) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 409 })
    }

    const hashedPassword = await bcrypt.hash(password, 10)
    const displayName = `${firstName} ${lastName}`

    const profile = await db.profile.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        displayName,
        role: role || 'STUDENT',
        phone: phone || null,
        department: department || null,
        course: course || null,
        semester: semester || null,
        shift: shift || null,
      },
    })

    const { password: _, ...user } = profile
    return NextResponse.json({ token: profile.id, user }, { status: 201 })
  } catch (error) {
    console.error('Register error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
