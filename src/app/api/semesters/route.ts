import { NextRequest, NextResponse } from 'next/server'
import { createSemesterSchema } from '@/lib/utils/validation'
import { getStore, paginate, insertItem } from '@/lib/supabase/data-store'
import type { Semester, ApiResponse, PaginatedResponse } from '@/lib/types'

// GET /api/semesters - List semesters
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const isActive = searchParams.get('isActive')
    const year = searchParams.get('year')

    const store = getStore()
    let semesters = [...store.semesters]

    // Filters
    if (isActive !== null && isActive !== '') {
      semesters = semesters.filter((s) => s.isActive === (isActive === 'true'))
    }
    if (year) {
      semesters = semesters.filter((s) => s.year === parseInt(year))
    }

    // Sort by start date descending
    semesters.sort((a, b) => b.startDate.localeCompare(a.startDate))

    const result = paginate(semesters, page, limit)

    // Enrich with class count and other stats
    const enrichedData = result.data.map((sem) => {
      const classCount = store.classes.filter((c) => c.semesterId === sem.id).length
      const activeClassCount = store.classes.filter((c) => c.semesterId === sem.id && c.status === 'active').length
      const enrollmentCount = store.enrollments.filter((e) => e.semesterId === sem.id).length
      const sessionCount = store.sessions.filter((s) => {
        const cls = store.classes.find((c) => c.id === s.classId)
        return cls?.semesterId === sem.id
      }).length

      return {
        ...sem,
        classCount,
        activeClassCount,
        enrollmentCount,
        sessionCount,
      }
    })

    return NextResponse.json<PaginatedResponse<Semester & {
      classCount: number; activeClassCount: number
      enrollmentCount: number; sessionCount: number
    }>>({
      data: enrichedData,
      pagination: result.pagination,
    })
  } catch (error) {
    console.error('[API/semesters] GET error:', error)
    return NextResponse.json<ApiResponse>(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Erro interno do servidor' } },
      { status: 500 }
    )
  }
}

// POST /api/semesters - Create semester
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const parsed = createSemesterSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: { code: 'VALIDATION_ERROR', message: 'Dados inválidos', details: parsed.error.issues } },
        { status: 400 }
      )
    }

    const store = getStore()
    const now = new Date().toISOString()

    // Deactivate other active semesters if this one is active
    if (parsed.data.year && parsed.data.term) {
      store.semesters.forEach((s) => {
        if (s.year === parsed.data.year && s.term === parsed.data.term) {
          s.isActive = false
        }
      })
    }

    const semester: Semester = {
      id: crypto.randomUUID(),
      organizationId: parsed.data.organizationId,
      name: parsed.data.name,
      year: parsed.data.year,
      term: parsed.data.term,
      startDate: parsed.data.startDate,
      endDate: parsed.data.endDate,
      currentWeek: 1,
      totalWeeks: parsed.data.totalWeeks,
      isActive: true,
      holidays: [],
      createdAt: now,
      updatedAt: now,
    }

    const result = insertItem(store.semesters, semester)

    if (result.error) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: { code: 'CREATE_ERROR', message: result.error.message } },
        { status: 500 }
      )
    }

    return NextResponse.json<ApiResponse>(
      { success: true, data: semester, message: 'Semestre criado com sucesso' },
      { status: 201 }
    )
  } catch (error) {
    console.error('[API/semesters] POST error:', error)
    return NextResponse.json<ApiResponse>(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Erro interno do servidor' } },
      { status: 500 }
    )
  }
}
