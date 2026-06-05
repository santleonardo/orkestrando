import { NextRequest, NextResponse } from 'next/server'
import { createHolidaySchema } from '@/lib/utils/validation'
import { getStore, paginate, insertItem } from '@/lib/supabase/data-store'
import type { Holiday, ApiResponse, PaginatedResponse } from '@/lib/types'

// GET /api/holidays - List holidays
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const search = searchParams.get('search') || ''
    const type = searchParams.get('type')
    const year = searchParams.get('year')
    const affectsClasses = searchParams.get('affectsClasses')

    const store = getStore()
    let holidays = [...store.holidays]

    // Filters
    if (type) {
      holidays = holidays.filter((h) => h.type === type)
    }
    if (year) {
      holidays = holidays.filter((h) => new Date(h.date).getFullYear() === parseInt(year))
    }
    if (affectsClasses !== null && affectsClasses !== '') {
      holidays = holidays.filter((h) => h.affectsClasses === (affectsClasses === 'true'))
    }

    // Search
    if (search) {
      holidays = holidays.filter((h) =>
        h.name.toLowerCase().includes(search.toLowerCase())
      )
    }

    // Sort by date ascending
    holidays.sort((a, b) => a.date.localeCompare(b.date))

    const result = paginate(holidays, page, limit)

    return NextResponse.json<PaginatedResponse<Holiday>>({
      data: result.data,
      pagination: result.pagination,
    })
  } catch (error) {
    console.error('[API/holidays] GET error:', error)
    return NextResponse.json<ApiResponse>(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Erro interno do servidor' } },
      { status: 500 }
    )
  }
}

// POST /api/holidays - Create holiday
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const parsed = createHolidaySchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: { code: 'VALIDATION_ERROR', message: 'Dados inválidos', details: parsed.error.issues } },
        { status: 400 }
      )
    }

    const store = getStore()
    const now = new Date().toISOString()

    // Check for duplicate (same date)
    const existing = store.holidays.find((h) => h.date === parsed.data.date)
    if (existing) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: { code: 'DUPLICATE', message: 'Já existe um feriado cadastrado para esta data' } },
        { status: 409 }
      )
    }

    const holiday: Holiday = {
      id: crypto.randomUUID(),
      organizationId: parsed.data.organizationId,
      name: parsed.data.name,
      date: parsed.data.date,
      type: parsed.data.type,
      isRecurring: parsed.data.isRecurring ?? false,
      affectsClasses: parsed.data.affectsClasses ?? true,
      createdAt: now,
      updatedAt: now,
    }

    const result = insertItem(store.holidays, holiday)

    if (result.error) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: { code: 'CREATE_ERROR', message: result.error.message } },
        { status: 500 }
      )
    }

    return NextResponse.json<ApiResponse>(
      { success: true, data: holiday, message: 'Feriado criado com sucesso' },
      { status: 201 }
    )
  } catch (error) {
    console.error('[API/holidays] POST error:', error)
    return NextResponse.json<ApiResponse>(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Erro interno do servidor' } },
      { status: 500 }
    )
  }
}
