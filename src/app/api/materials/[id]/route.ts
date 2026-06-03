import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const material = await db.material.findUnique({
      where: { id },
      include: {
        uploader: { select: { id: true, firstName: true, lastName: true } },
        class: { include: { subject: true } },
      },
    })
    if (!material) {
      return NextResponse.json({ success: false, error: 'Material not found' }, { status: 404 })
    }
    return NextResponse.json({ success: true, data: material })
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed to fetch material'
    return NextResponse.json({ success: false, error: msg }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await request.json()
    const material = await db.material.update({ where: { id }, data: body })
    return NextResponse.json({ success: true, data: material })
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed to update material'
    return NextResponse.json({ success: false, error: msg }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    await db.material.delete({ where: { id } })
    return NextResponse.json({ success: true, data: null })
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed to delete material'
    return NextResponse.json({ success: false, error: msg }, { status: 500 })
  }
}
