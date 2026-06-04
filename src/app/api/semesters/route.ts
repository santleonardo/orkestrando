import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireRole, AuthError } from '@/lib/get-user'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const activeOnly = searchParams.get('activeOnly') !== 'false'

    const semesters = await db.semester.findMany({
      where: {
        ...(activeOnly ? { isActive: true } : {}),
      },
      include: {
        _count: {
          select: {
            classes: true,
            academicCalendars: true,
          },
        },
      },
      orderBy: [{ startDate: 'desc' }],
    })

    return NextResponse.json({ data: semesters })
  } catch (error) {
    console.error('Error fetching semesters:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireRole(request, ['ADMIN', 'COORDINATOR'])

    const body = await request.json()
    const { name, code, startDate, endDate } = body

    if (!name || !code || !startDate || !endDate) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 })
    }

    const existing = await db.semester.findUnique({ where: { code } })
    if (existing) {
      return NextResponse.json({ error: 'Semester code already exists' }, { status: 409 })
    }

    const semester = await db.semester.create({
      data: {
        name,
        code,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
      },
    })

    return NextResponse.json({ data: semester }, { status: 201 })
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }
    console.error('Error creating semester:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
