import { NextRequest, NextResponse } from 'next/server'
import { createTeacherSchema } from '@/lib/utils/validation'
import { getStore, paginate, searchItems, insertItem, getProfile, enrichClass } from '@/lib/supabase/data-store'
import type { Teacher, ApiResponse, PaginatedResponse } from '@/lib/types'

// GET /api/teachers - List teachers
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const search = searchParams.get('search') || ''
    const isActive = searchParams.get('isActive')
    const contractType = searchParams.get('contractType')

    const store = getStore()
    let teachers = [...store.teachers]

    // Filters
    if (isActive !== null && isActive !== '') {
      teachers = teachers.filter((t) => t.isActive === (isActive === 'true'))
    }
    if (contractType) {
      teachers = teachers.filter((t) => t.contractType === contractType)
    }

    // Search by name (via profile)
    if (search) {
      teachers = teachers.filter((t) => {
        const profile = getProfile(t.profileId)
        return (
          profile.fullName.toLowerCase().includes(search.toLowerCase()) ||
          profile.email.toLowerCase().includes(search.toLowerCase()) ||
          t.id.toLowerCase().includes(search.toLowerCase())
        )
      })
    }

    // Sort by name
    teachers.sort((a, b) => {
      const nameA = getProfile(a.profileId).fullName
      const nameB = getProfile(b.profileId).fullName
      return nameA.localeCompare(nameB)
    })

    const result = paginate(teachers, page, limit)

    // Enrich with profile data
    const enrichedData = result.data.map((t) => {
      const profile = getProfile(t.profileId)
      const classCount = store.classes.filter((c) => c.teacherId === t.id).length
      return {
        ...t,
        teacherName: profile.fullName,
        teacherEmail: profile.email,
        avatarUrl: profile.fullName,
        classCount,
      }
    })

    return NextResponse.json<PaginatedResponse<Teacher & { teacherName: string; teacherEmail: string; classCount: number }>>({
      data: enrichedData,
      pagination: result.pagination,
    })
  } catch (error) {
    console.error('[API/teachers] GET error:', error)
    return NextResponse.json<ApiResponse>(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Erro interno do servidor' } },
      { status: 500 }
    )
  }
}

// POST /api/teachers - Create teacher
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const parsed = createTeacherSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: { code: 'VALIDATION_ERROR', message: 'Dados inválidos', details: parsed.error.issues } },
        { status: 400 }
      )
    }

    const store = getStore()
    const now = new Date().toISOString()

    const teacher: Teacher = {
      id: crypto.randomUUID(),
      ...parsed.data,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    }

    const result = insertItem(store.teachers, teacher)

    if (result.error) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: { code: 'CREATE_ERROR', message: result.error.message } },
        { status: 500 }
      )
    }

    const profile = getProfile(teacher.profileId)
    return NextResponse.json<ApiResponse>(
      {
        success: true,
        data: { ...teacher, teacherName: profile.fullName, teacherEmail: profile.email },
        message: 'Professor criado com sucesso',
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('[API/teachers] POST error:', error)
    return NextResponse.json<ApiResponse>(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Erro interno do servidor' } },
      { status: 500 }
    )
  }
}
