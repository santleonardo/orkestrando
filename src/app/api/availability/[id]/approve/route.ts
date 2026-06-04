import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireRole, AuthError } from '@/lib/get-user'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireRole(request, ['ADMIN', 'COORDINATOR'])

    const { id } = await params
    const body = await request.json()
    const { action } = body // 'approve' or 'reject'

    if (!action || !['approve', 'reject'].includes(action)) {
      return NextResponse.json({ error: 'Action must be "approve" or "reject"' }, { status: 400 })
    }

    const availability = await db.teacherAvailability.findUnique({ where: { id } })
    if (!availability) {
      return NextResponse.json({ error: 'Availability not found' }, { status: 404 })
    }

    const updated = await db.teacherAvailability.update({
      where: { id },
      data: {
        status: action === 'approve' ? 'APPROVED' : 'REJECTED',
        approvedBy: user.id,
        approvedAt: new Date(),
      },
    })

    return NextResponse.json({ data: updated })
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }
    console.error('Error approving availability:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
