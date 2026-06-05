import { NextRequest, NextResponse } from 'next/server'
import { createCourseSchema } from '@/lib/utils/validation'
import { getStore, paginate, insertItem } from '@/lib/supabase/data-store'
import type { Course, ApiResponse, PaginatedResponse } from '@/lib/types'

// GET /api/courses - List courses
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const search = searchParams.get('search') || ''
    const level = searchParams.get('level')
    const modality = searchParams.get('modality')
    const isActive = searchParams.get('isActive')

    const store = getStore()
    let courses = [...store.courses]

    // Filters
    if (level) {
      courses = courses.filter((c) => c.level === level)
    }
    if (modality) {
      courses = courses.filter((c) => c.modality === modality)
    }
    if (isActive !== null && isActive !== '') {
      courses = courses.filter((c) => c.isActive === (isActive === 'true'))
    }

    // Search
    if (search) {
      courses = courses.filter((c) =>
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.code.toLowerCase().includes(search.toLowerCase()) ||
        (c.description || '').toLowerCase().includes(search.toLowerCase())
      )
    }

    // Sort by code
    courses.sort((a, b) => a.code.localeCompare(b.code))

    const result = paginate(courses, page, limit)

    // Add class count for each course
    const enrichedData = result.data.map((c) => {
      const classCount = store.classes.filter((cls) => cls.courseId === c.id).length
      const subjectCount = store.subjects.filter((s) => s.courseIds.includes(c.id)).length
      return { ...c, classCount, subjectCount }
    })

    return NextResponse.json<PaginatedResponse<Course & { classCount: number; subjectCount: number }>>({
      data: enrichedData,
      pagination: result.pagination,
    })
  } catch (error) {
    console.error('[API/courses] GET error:', error)
    return NextResponse.json<ApiResponse>(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Erro interno do servidor' } },
      { status: 500 }
    )
  }
}

// POST /api/courses - Create course
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const parsed = createCourseSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: { code: 'VALIDATION_ERROR', message: 'Dados inválidos', details: parsed.error.issues } },
        { status: 400 }
      )
    }

    const store = getStore()
    const now = new Date().toISOString()

    // Check duplicate code
    const exists = store.courses.some((c) => c.code === parsed.data.code)
    if (exists) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: { code: 'DUPLICATE', message: 'Código de curso já cadastrado', field: 'code' } },
        { status: 409 }
      )
    }

    const course: Course = {
      id: crypto.randomUUID(),
      ...parsed.data,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    }

    const result = insertItem(store.courses, course)

    if (result.error) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: { code: 'CREATE_ERROR', message: result.error.message } },
        { status: 500 }
      )
    }

    return NextResponse.json<ApiResponse>(
      { success: true, data: course, message: 'Curso criado com sucesso' },
      { status: 201 }
    )
  } catch (error) {
    console.error('[API/courses] POST error:', error)
    return NextResponse.json<ApiResponse>(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Erro interno do servidor' } },
      { status: 500 }
    )
  }
}
