import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireRole, AuthError } from '@/lib/get-user'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const discipline = await db.discipline.findUnique({
      where: { id },
      include: {
        course: true,
        classes: {
          include: {
            semester: true,
            teacher: { select: { id: true, name: true, email: true } },
          },
        },
      },
    })

    if (!discipline) {
      return NextResponse.json({ error: 'Discipline not found' }, { status: 404 })
    }

    return NextResponse.json({ data: discipline })
  } catch (error) {
    console.error('Error fetching discipline:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireRole(request, ['ADMIN', 'COORDINATOR'])

    const { id } = await params
    const body = await request.json()

    const discipline = await db.discipline.update({
      where: { id },
      data: {
        ...(body.name && { name: body.name }),
        ...(body.code && { code: body.code.toUpperCase() }),
        ...(body.description !== undefined && { description: body.description }),
        ...(body.workload !== undefined && { workload: body.workload }),
        ...(body.isActive !== undefined && { isActive: body.isActive }),
      },
    })

    return NextResponse.json({ data: discipline })
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }
    console.error('Error updating discipline:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireRole(request, ['ADMIN', 'COORDINATOR'])

    const { id } = await params
    const discipline = await db.discipline.update({
      where: { id },
      data: { isActive: false },
    })

    return NextResponse.json({ data: discipline })
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }
    console.error('Error deleting discipline:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
