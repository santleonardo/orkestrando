import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const classId = searchParams.get('classId')
    const type = searchParams.get('type')
    const published = searchParams.get('published')
    const page = parseInt(searchParams.get('page') || '1')
    const pageSize = parseInt(searchParams.get('pageSize') || '20')

    const where: Record<string, unknown> = {}
    if (classId) where.class_id = classId
    if (type) where.type = type
    if (published !== null && published !== undefined) {
      where.isPublished = published === 'true'
    }

    const [materials, total] = await Promise.all([
      db.material.findMany({
        where,
        include: {
          uploader: { select: { id: true, firstName: true, lastName: true } },
          class: { include: { subject: true } },
        },
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { created_at: 'desc' },
      }),
      db.material.count({ where }),
    ])

    const totalPages = Math.ceil(total / pageSize)

    return NextResponse.json({
      success: true,
      data: materials,
      pagination: { page, pageSize, total, totalPages, hasNextPage: page < totalPages, hasPreviousPage: page > 1 },
    })
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed to fetch materials'
    return NextResponse.json({ success: false, error: msg }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { classId, title, fileUrl, fileName, uploadedBy, mimeType } = body
    if (!classId || !title || !fileUrl || !fileName || !uploadedBy) {
      return NextResponse.json({ success: false, error: 'Required fields missing' }, { status: 400 })
    }

    const material = await db.material.create({ data: body })
    return NextResponse.json({ success: true, data: material }, { status: 201 })
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed to create material'
    return NextResponse.json({ success: false, error: msg }, { status: 500 })
  }
}
