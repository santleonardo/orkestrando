import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAuth, AuthError } from '@/lib/get-user'
import crypto from 'crypto'

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request)

    const body = await request.json()
    const { entityType, entityId, deviceInfo } = body

    if (!entityType || !entityId) {
      return NextResponse.json({ error: 'entityType and entityId are required' }, { status: 400 })
    }

    const ipAddress = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
    const userAgent = request.headers.get('user-agent') || 'unknown'

    // Create hash from combination of data
    const hashData = `${user.id}-${entityType}-${entityId}-${Date.now()}-${crypto.randomUUID()}`
    const hash = crypto.createHash('sha256').update(hashData).digest('hex')

    const signature = await db.digitalSignature.create({
      data: {
        userId: user.id,
        entityType,
        entityId,
        ipAddress,
        userAgent,
        deviceInfo,
        hash,
      },
    })

    return NextResponse.json({ data: signature }, { status: 201 })
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }
    console.error('Error creating signature:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
