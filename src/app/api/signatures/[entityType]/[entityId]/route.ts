import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ entityType: string; entityId: string }> }
) {
  try {
    const { entityType, entityId } = await params

    const signatures = await db.digitalSignature.findMany({
      where: {
        entityType,
        entityId,
      },
      include: {
        user: {
          select: { id: true, name: true, email: true, avatar: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ data: signatures })
  } catch (error) {
    console.error('Error fetching signatures:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
