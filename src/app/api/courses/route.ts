import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireRole, AuthError } from '@/lib/get-user'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''
    const includeInactive = searchParams.get('includeInactive') === 'true'

    const courses = await db.course.findMany({
      where: {
        ...(search && {
          OR: [
            { name: { contains: search } },
            { code: { contains: search } },
          ],
        }),
        ...(!includeInactive && { isActive: true }),
      },
      include: {
        disciplines: {
          where: { isActive: true },
          select: { id: true, name: true, code: true },
        },
        _count: { select: { disciplines: true } },
      },
      orderBy: { name: 'asc' },
    })

    return NextResponse.json({ data: courses })
  } catch (error) {
    console.error('Error fetching courses:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireRole(request, ['ADMIN', 'COORDINATOR'])

    const body = await request.json()
    const { name, code, description, duration } = body

    if (!name || !code) {
      return NextResponse.json({ error: 'Name and code are required' }, { status: 400 })
    }

    const existing = await db.course.findUnique({ where: { code } })
    if (existing) {
      return NextResponse.json({ error: 'Course code already exists' }, { status: 409 })
    }

    const course = await db.course.create({
      data: {
        name,
        code: code.toUpperCase(),
        description,
        duration: duration || 8,
      },
    })

    return NextResponse.json({ data: course }, { status: 201 })
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }
    console.error('Error creating course:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
