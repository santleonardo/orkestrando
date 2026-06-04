import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireRole, AuthError } from '@/lib/get-user'
import { generateLessons } from '@/lib/class-generator'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const semesterId = searchParams.get('semesterId')
    const teacherId = searchParams.get('teacherId')
    const disciplineId = searchParams.get('disciplineId')

    const classes = await db.class.findMany({
      where: {
        ...(semesterId && { semesterId }),
        ...(teacherId && { teacherId }),
        ...(disciplineId && { disciplineId }),
        isActive: true,
      },
      include: {
        discipline: {
          include: { course: { select: { id: true, name: true, code: true } } },
        },
        semester: { select: { id: true, name: true, code: true } },
        teacher: { select: { id: true, name: true, email: true } },
        _count: { select: { enrollments: true, lessons: true, materials: true } },
      },
      orderBy: [{ code: 'asc' }],
    })

    return NextResponse.json({ data: classes })
  } catch (error) {
    console.error('Error fetching classes:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireRole(request, ['ADMIN', 'COORDINATOR'])

    const body = await request.json()
    const { name, code, disciplineId, semesterId, teacherId, schedule, room, maxStudents } = body

    if (!name || !code || !disciplineId || !semesterId || !teacherId || !schedule) {
      return NextResponse.json(
        { error: 'Name, code, disciplineId, semesterId, teacherId, and schedule are required' },
        { status: 400 }
      )
    }

    const existing = await db.class.findUnique({ where: { code } })
    if (existing) {
      return NextResponse.json({ error: 'Class code already exists' }, { status: 409 })
    }

    const newClass = await db.class.create({
      data: {
        name,
        code,
        disciplineId,
        semesterId,
        teacherId,
        schedule: JSON.stringify(schedule),
        room,
        maxStudents: maxStudents || 40,
      },
    })

    // Generate lessons for the class
    let lessonsCount = 0
    try {
      lessonsCount = await generateLessons(newClass.id)
    } catch (lessonError) {
      console.error('Error generating lessons:', lessonError)
    }

    return NextResponse.json(
      { data: newClass, meta: { lessonsGenerated: lessonsCount } },
      { status: 201 }
    )
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }
    console.error('Error creating class:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
