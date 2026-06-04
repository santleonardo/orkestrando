import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireRole, AuthError } from '@/lib/get-user'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const courseId = searchParams.get('courseId')
    const search = searchParams.get('search') || ''

    const disciplines = await db.discipline.findMany({
      where: {
        ...(courseId && { courseId }),
        ...(search && {
          OR: [
            { name: { contains: search } },
            { code: { contains: search } },
          ],
        }),
        isActive: true,
      },
      include: {
        course: {
          select: { id: true, name: true, code: true },
        },
      },
      orderBy: [{ code: 'asc' }],
    })

    return NextResponse.json({ data: disciplines })
  } catch (error) {
    console.error('Error fetching disciplines:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireRole(request, ['ADMIN', 'COORDINATOR'])

    const body = await request.json()
    const { name, code, description, workload, courseId } = body

    if (!name || !code || !courseId) {
      return NextResponse.json({ error: 'Name, code, and courseId are required' }, { status: 400 })
    }

    const existing = await db.discipline.findUnique({
      where: { code_courseId: { code: code.toUpperCase(), courseId } },
    })

    if (existing) {
      return NextResponse.json({ error: 'Discipline code already exists in this course' }, { status: 409 })
    }

    const discipline = await db.discipline.create({
      data: {
        name,
        code: code.toUpperCase(),
        description,
        workload: workload || 60,
        courseId,
      },
    })

    return NextResponse.json({ data: discipline }, { status: 201 })
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }
    console.error('Error creating discipline:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
