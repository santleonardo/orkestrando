import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAuth, AuthError } from '@/lib/get-user'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const material = await db.material.findUnique({
      where: { id },
      include: {
        class: true,
        uploader: { select: { id: true, name: true, email: true } },
        versions: {
          orderBy: { version: 'desc' },
        },
        lessonMaterials: {
          include: { lesson: { select: { id: true, date: true, topic: true } } },
        },
        submissions: {
          include: {
            student: { select: { id: true, name: true, email: true } },
          },
        },
      },
    })

    if (!material) {
      return NextResponse.json({ error: 'Material not found' }, { status: 404 })
    }

    return NextResponse.json({ data: material })
  } catch (error) {
    console.error('Error fetching material:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth(request)

    const { id } = await params
    const body = await request.json()

    const existing = await db.material.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'Material not found' }, { status: 404 })
    }

    // If new file is uploaded, create a version entry
    if (body.fileName && body.fileSize && body.fileUrl) {
      const newVersion = existing.version + 1

      await db.materialVersion.create({
        data: {
          materialId: id,
          fileName: existing.fileName,
          fileSize: existing.fileSize,
          fileUrl: existing.fileUrl,
          version: existing.version,
          uploadedBy: user.id,
        },
      })

      const material = await db.material.update({
        where: { id },
        data: {
          title: body.title || existing.title,
          description: body.description !== undefined ? body.description : existing.description,
          fileName: body.fileName,
          fileSize: body.fileSize,
          fileUrl: body.fileUrl,
          mimeType: body.mimeType || existing.mimeType,
          version: newVersion,
        },
      })

      return NextResponse.json({ data: material })
    }

    // Simple metadata update
    const material = await db.material.update({
      where: { id },
      data: {
        ...(body.title && { title: body.title }),
        ...(body.description !== undefined && { description: body.description }),
        ...(body.type && { type: body.type }),
        ...(body.isActive !== undefined && { isActive: body.isActive }),
      },
    })

    return NextResponse.json({ data: material })
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }
    console.error('Error updating material:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth(request)

    const { id } = await params
    await db.material.delete({ where: { id } })

    return NextResponse.json({ data: { success: true } })
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }
    console.error('Error deleting material:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
