import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAuth, AuthError } from '@/lib/get-user'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const teacherId = searchParams.get('teacherId')
    const semesterId = searchParams.get('semesterId')
    const status = searchParams.get('status')

    const availabilities = await db.teacherAvailability.findMany({
      where: {
        ...(teacherId && { teacherId }),
        ...(semesterId && { semesterId }),
        ...(status && { status }),
      },
      include: {
        teacher: { select: { id: true, name: true, email: true } },
        semester: { select: { id: true, name: true, code: true } },
        approver: { select: { id: true, name: true }, where: { id: { not: undefined } } },
      },
      orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }],
    })

    return NextResponse.json({ data: availabilities })
  } catch (error) {
    console.error('Error fetching availabilities:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request)

    const body = await request.json()
    const { teacherId, semesterId, dayOfWeek, startTime, endTime, type, reason, effectiveFrom, effectiveTo } = body

    if (!teacherId || !semesterId || dayOfWeek === undefined || !startTime || !endTime || !effectiveFrom) {
      return NextResponse.json(
        { error: 'teacherId, semesterId, dayOfWeek, startTime, endTime, and effectiveFrom are required' },
        { status: 400 }
      )
    }

    // Teachers can only create their own availability
    if (user.role !== 'ADMIN' && user.role !== 'COORDINATOR' && user.id !== teacherId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const availability = await db.teacherAvailability.create({
      data: {
        teacherId,
        semesterId,
        dayOfWeek: Number(dayOfWeek),
        startTime,
        endTime,
        type: type || 'AVAILABLE',
        reason,
        effectiveFrom: new Date(effectiveFrom),
        effectiveTo: effectiveTo ? new Date(effectiveTo) : null,
      },
    })

    return NextResponse.json({ data: availability }, { status: 201 })
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }
    console.error('Error creating availability:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
