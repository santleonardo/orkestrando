import { NextRequest, NextResponse } from 'next/server'
import { createTeacherAvailabilitySchema } from '@/lib/utils/validation'
import { getStore, paginate, insertItem, getProfile } from '@/lib/supabase/data-store'
import type { TeacherAvailability, ApiResponse, PaginatedResponse } from '@/lib/types'

// GET /api/availability - List teacher availability
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const teacherId = searchParams.get('teacherId')
    const status = searchParams.get('status')
    const dayOfWeek = searchParams.get('dayOfWeek')

    const store = getStore()
    let availability = [...store.availability]

    // Filters
    if (teacherId) {
      availability = availability.filter((a) => a.teacherId === teacherId)
    }
    if (status) {
      availability = availability.filter((a) => a.status === status)
    }
    if (dayOfWeek !== null && dayOfWeek !== '') {
      availability = availability.filter((a) => a.dayOfWeek === parseInt(dayOfWeek))
    }

    // Sort by day of week then start time
    availability.sort((a, b) => a.dayOfWeek === b.dayOfWeek
      ? a.startTime.localeCompare(b.startTime)
      : a.dayOfWeek - b.dayOfWeek
    )

    const result = paginate(availability, page, limit)

    // Enrich with teacher name
    const enrichedData = result.data.map((a) => {
      const teacher = store.teachers.find((t) => t.id === a.teacherId)
      const profile = teacher ? getProfile(teacher.profileId) : null
      return {
        ...a,
        teacherName: profile?.fullName || 'Professor não encontrado',
      }
    })

    return NextResponse.json<PaginatedResponse<TeacherAvailability & { teacherName: string }>>({
      data: enrichedData,
      pagination: result.pagination,
    })
  } catch (error) {
    console.error('[API/availability] GET error:', error)
    return NextResponse.json<ApiResponse>(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Erro interno do servidor' } },
      { status: 500 }
    )
  }
}

// POST /api/availability - Create/update availability
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const parsed = createTeacherAvailabilitySchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: { code: 'VALIDATION_ERROR', message: 'Dados inválidos', details: parsed.error.issues } },
        { status: 400 }
      )
    }

    const store = getStore()
    const now = new Date().toISOString()
    const data = parsed.data

    // Validate teacher exists
    const teacher = store.teachers.find((t) => t.id === data.teacherId)
    if (!teacher) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: { code: 'NOT_FOUND', message: 'Professor não encontrado', field: 'teacherId' } },
        { status: 400 }
      )
    }

    // Check for overlapping availability
    const overlapping = store.availability.find(
      (a) =>
        a.teacherId === data.teacherId &&
        a.dayOfWeek === data.dayOfWeek &&
        a.status !== 'rejected' &&
        data.startTime < a.endTime &&
        data.endTime > a.startTime
    )

    const availabilityItem: TeacherAvailability = {
      id: crypto.randomUUID(),
      teacherId: data.teacherId,
      organizationId: data.organizationId,
      dayOfWeek: data.dayOfWeek as 0 | 1 | 2 | 3 | 4 | 5 | 6,
      startTime: data.startTime,
      endTime: data.endTime,
      recurringPattern: data.recurringPattern,
      status: 'approved',
      validFrom: data.validFrom,
      validUntil: data.validUntil,
      notes: data.notes,
      createdAt: now,
      updatedAt: now,
    }

    const result = insertItem(store.availability, availabilityItem)

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
        data: { ...availabilityItem, teacherName: profile.fullName },
        message: 'Disponibilidade registrada com sucesso',
        ...(overlapping ? { warning: 'Existe disponibilidade sobreposta para este professor neste dia/horário' } : {}),
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('[API/availability] POST error:', error)
    return NextResponse.json<ApiResponse>(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Erro interno do servidor' } },
      { status: 500 }
    )
  }
}
