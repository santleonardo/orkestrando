import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireRole, AuthError } from '@/lib/get-user'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const semesterId = searchParams.get('semesterId')
    const month = searchParams.get('month')
    const type = searchParams.get('type')

    const where: Record<string, unknown> = {}
    if (semesterId) where.semesterId = semesterId
    if (type) where.type = type
    if (month) {
      const startDate = new Date(month + '-01')
      const endDate = new Date(startDate)
      endDate.setMonth(endDate.getMonth() + 1)
      where.date = { gte: startDate, lt: endDate }
    }

    const events = await db.academicCalendar.findMany({
      where,
      include: {
        semester: { select: { id: true, name: true, code: true } },
      },
      orderBy: { date: 'asc' },
    })

    return NextResponse.json({ data: events })
  } catch (error) {
    console.error('Error fetching calendar events:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireRole(request, ['ADMIN', 'COORDINATOR'])

    const body = await request.json()
    const { title, description, date, type, semesterId, isRecurring, recurrencePattern } = body

    if (!title || !date || !type) {
      return NextResponse.json({ error: 'Title, date, and type are required' }, { status: 400 })
    }

    const event = await db.academicCalendar.create({
      data: {
        title,
        description,
        date: new Date(date),
        type,
        semesterId,
        isRecurring: isRecurring || false,
        recurrencePattern,
      },
    })

    return NextResponse.json({ data: event }, { status: 201 })
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }
    console.error('Error creating calendar event:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
