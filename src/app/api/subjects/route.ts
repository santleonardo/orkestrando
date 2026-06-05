import { NextRequest, NextResponse } from 'next/server'
import { createSubjectSchema } from '@/lib/utils/validation'
import { getStore, paginate, insertItem } from '@/lib/supabase/data-store'
import type { Subject, ApiResponse, PaginatedResponse } from '@/lib/types'

// GET /api/subjects - List subjects
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const search = searchParams.get('search') || ''
    const isActive = searchParams.get('isActive')
    const courseId = searchParams.get('courseId')

    const store = getStore()
    let subjects = [...store.subjects]

    // Filters
    if (isActive !== null && isActive !== '') {
      subjects = subjects.filter((s) => s.isActive === (isActive === 'true'))
    }
    if (courseId) {
      subjects = subjects.filter((s) => s.courseIds.includes(courseId))
    }

    // Search
    if (search) {
      subjects = subjects.filter((s) =>
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.code.toLowerCase().includes(search.toLowerCase()) ||
        (s.description || '').toLowerCase().includes(search.toLowerCase())
      )
    }

    // Sort by code
    subjects.sort((a, b) => a.code.localeCompare(b.code))

    const result = paginate(subjects, page, limit)

    // Enrich with course names
    const enrichedData = result.data.map((s) => {
      const courseNames = s.courseIds
        .map((cid) => store.courses.find((c) => c.id === cid)?.name)
        .filter(Boolean)
      return { ...s, courseNames }
    })

    return NextResponse.json<PaginatedResponse<Subject & { courseNames: (string | undefined)[] }>>({
      data: enrichedData,
      pagination: result.pagination,
    })
  } catch (error) {
    console.error('[API/subjects] GET error:', error)
    return NextResponse.json<ApiResponse>(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Erro interno do servidor' } },
      { status: 500 }
    )
  }
}

// POST /api/subjects - Create subject
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const parsed = createSubjectSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: { code: 'VALIDATION_ERROR', message: 'Dados inválidos', details: parsed.error.issues } },
        { status: 400 }
      )
    }

    const store = getStore()
    const now = new Date().toISOString()

    // Check duplicate code
    const exists = store.subjects.some((s) => s.code === parsed.data.code)
    if (exists) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: { code: 'DUPLICATE', message: 'Código de disciplina já cadastrado', field: 'code' } },
        { status: 409 }
      )
    }

    const subject: Subject = {
      id: crypto.randomUUID(),
      ...parsed.data,
      courseIds: parsed.data.courseIds || [],
      prerequisites: parsed.data.prerequisites || [],
      isActive: true,
      createdAt: now,
      updatedAt: now,
    }

    const result = insertItem(store.subjects, subject)

    if (result.error) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: { code: 'CREATE_ERROR', message: result.error.message } },
        { status: 500 }
      )
    }

    return NextResponse.json<ApiResponse>(
      { success: true, data: subject, message: 'Disciplina criada com sucesso' },
      { status: 201 }
    )
  } catch (error) {
    console.error('[API/subjects] POST error:', error)
    return NextResponse.json<ApiResponse>(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Erro interno do servidor' } },
      { status: 500 }
    )
  }
}
