import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAuth, AuthError } from '@/lib/get-user'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const classId = searchParams.get('classId')
    const type = searchParams.get('type')
    const uploadedBy = searchParams.get('uploadedBy')
    const page = Number(searchParams.get('page')) || 1
    const limit = Number(searchParams.get('limit')) || 50

    const where: Record<string, unknown> = { isActive: true }
    if (classId) where.classId = classId
    if (type) where.type = type
    if (uploadedBy) where.uploadedBy = uploadedBy

    const [materials, total] = await Promise.all([
      db.material.findMany({
        where,
        include: {
          class: { select: { id: true, name: true, code: true } },
          uploader: { select: { id: true, name: true, email: true } },
          _count: { select: { versions: true, submissions: true, lessonMaterials: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.material.count({ where }),
    ])

    return NextResponse.json({
      data: materials,
      meta: { total, page, limit, pages: Math.ceil(total / limit) },
    })
  } catch (error) {
    console.error('Error fetching materials:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request)

    const body = await request.json()
    const { title, description, type, fileName, fileSize, fileUrl, mimeType, classId, lessonId } = body

    if (!title || !fileName || !fileSize || !fileUrl || !classId) {
      return NextResponse.json(
        { error: 'title, fileName, fileSize, fileUrl, and classId are required' },
        { status: 400 }
      )
    }

    const material = await db.material.create({
      data: {
        title,
        description,
        type: type || 'LESSON_MATERIAL',
        fileName,
        fileSize,
        fileUrl,
        mimeType: mimeType || 'application/octet-stream',
        classId,
        lessonId,
        uploadedBy: user.id,
      },
    })

    return NextResponse.json({ data: material }, { status: 201 })
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }
    console.error('Error creating material:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
