import { NextRequest, NextResponse } from 'next/server'
import { createMaterialSchema } from '@/lib/utils/validation'
import { getStore, paginate, insertItem, getProfile, enrichClass } from '@/lib/supabase/data-store'
import type { Material, ApiResponse, PaginatedResponse } from '@/lib/types'

// GET /api/materials - List materials
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const search = searchParams.get('search') || ''
    const classId = searchParams.get('classId')
    const materialType = searchParams.get('materialType')
    const uploadedById = searchParams.get('uploadedById')
    const isPublished = searchParams.get('isPublished')

    const store = getStore()
    let materials = [...store.materials]

    // Filters
    if (classId) {
      materials = materials.filter((m) => m.classId === classId)
    }
    if (materialType) {
      materials = materials.filter((m) => m.materialType === materialType)
    }
    if (uploadedById) {
      materials = materials.filter((m) => m.uploadedById === uploadedById)
    }
    if (isPublished !== null && isPublished !== '') {
      materials = materials.filter((m) => m.isPublished === (isPublished === 'true'))
    }

    // Search
    if (search) {
      materials = materials.filter((m) =>
        m.title.toLowerCase().includes(search.toLowerCase()) ||
        m.fileName.toLowerCase().includes(search.toLowerCase()) ||
        (m.description || '').toLowerCase().includes(search.toLowerCase())
      )
    }

    // Sort by most recent
    materials.sort((a, b) => b.createdAt.localeCompare(a.createdAt))

    const result = paginate(materials, page, limit)

    // Enrich with class/uploader names
    const enrichedData = result.data.map((m) => {
      const cls = store.classes.find((c) => c.id === m.classId)
      const uploaderProfile = getProfile(m.uploadedById)
      return {
        ...m,
        className: cls?.name || 'Turma não encontrada',
        uploaderName: uploaderProfile.fullName || 'Usuário não encontrado',
        fileSizeFormatted: formatFileSize(m.fileSize),
      }
    })

    return NextResponse.json<PaginatedResponse<Material & { className: string; uploaderName: string; fileSizeFormatted: string }>>({
      data: enrichedData,
      pagination: result.pagination,
    })
  } catch (error) {
    console.error('[API/materials] GET error:', error)
    return NextResponse.json<ApiResponse>(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Erro interno do servidor' } },
      { status: 500 }
    )
  }
}

// POST /api/materials - Create material (simulated upload)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const parsed = createMaterialSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: { code: 'VALIDATION_ERROR', message: 'Dados inválidos', details: parsed.error.issues } },
        { status: 400 }
      )
    }

    const store = getStore()
    const now = new Date().toISOString()
    const data = parsed.data

    // Validate class exists
    const cls = store.classes.find((c) => c.id === data.classId)
    if (!cls) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: { code: 'NOT_FOUND', message: 'Turma não encontrada', field: 'classId' } },
        { status: 400 }
      )
    }

    const materialId = crypto.randomUUID()

    const material: Material = {
      id: materialId,
      organizationId: data.organizationId,
      classId: data.classId,
      uploadedById: data.uploadedById,
      title: data.title,
      description: data.description,
      materialType: data.materialType,
      fileUrl: data.fileUrl,
      fileSize: data.fileSize,
      fileName: data.fileName,
      mimeType: data.mimeType,
      version: 1,
      currentVersionId: materialId,
      downloadCount: 0,
      isPublished: true,
      tags: data.tags || [],
      createdAt: now,
      updatedAt: now,
    }

    const result = insertItem(store.materials, material)

    if (result.error) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: { code: 'CREATE_ERROR', message: result.error.message } },
        { status: 500 }
      )
    }

    const uploaderProfile = getProfile(data.uploadedById)

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        data: {
          ...material,
          className: cls.name,
          uploaderName: uploaderProfile.fullName,
          fileSizeFormatted: formatFileSize(material.fileSize),
        },
        message: 'Material criado com sucesso',
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('[API/materials] POST error:', error)
    return NextResponse.json<ApiResponse>(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Erro interno do servidor' } },
      { status: 500 }
    )
  }
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`
}
