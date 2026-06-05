import { NextRequest, NextResponse } from 'next/server'
import { createRoomSchema } from '@/lib/utils/validation'
import { getStore, paginate, insertItem } from '@/lib/supabase/data-store'
import type { Room, ApiResponse, PaginatedResponse } from '@/lib/types'

// GET /api/rooms - List rooms
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const search = searchParams.get('search') || ''
    const roomType = searchParams.get('roomType')
    const isActive = searchParams.get('isActive')
    const minCapacity = searchParams.get('minCapacity')

    const store = getStore()
    let rooms = [...store.rooms]

    // Filters
    if (roomType) {
      rooms = rooms.filter((r) => r.roomType === roomType)
    }
    if (isActive !== null && isActive !== '') {
      rooms = rooms.filter((r) => r.isActive === (isActive === 'true'))
    }
    if (minCapacity) {
      rooms = rooms.filter((r) => r.capacity >= parseInt(minCapacity))
    }

    // Search
    if (search) {
      rooms = rooms.filter((r) =>
        r.name.toLowerCase().includes(search.toLowerCase()) ||
        r.code.toLowerCase().includes(search.toLowerCase()) ||
        (r.building || '').toLowerCase().includes(search.toLowerCase())
      )
    }

    // Sort by code
    rooms.sort((a, b) => a.code.localeCompare(b.code))

    const result = paginate(rooms, page, limit)

    return NextResponse.json<PaginatedResponse<Room>>({
      data: result.data,
      pagination: result.pagination,
    })
  } catch (error) {
    console.error('[API/rooms] GET error:', error)
    return NextResponse.json<ApiResponse>(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Erro interno do servidor' } },
      { status: 500 }
    )
  }
}

// POST /api/rooms - Create room
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const parsed = createRoomSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: { code: 'VALIDATION_ERROR', message: 'Dados inválidos', details: parsed.error.issues } },
        { status: 400 }
      )
    }

    const store = getStore()
    const now = new Date().toISOString()

    // Check for duplicate code
    const exists = store.rooms.some((r) => r.code === parsed.data.code)
    if (exists) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: { code: 'DUPLICATE', message: 'Código de sala já cadastrado', field: 'code' } },
        { status: 409 }
      )
    }

    const room: Room = {
      id: crypto.randomUUID(),
      ...parsed.data,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    }

    const result = insertItem(store.rooms, room)

    if (result.error) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: { code: 'CREATE_ERROR', message: result.error.message } },
        { status: 500 }
      )
    }

    return NextResponse.json<ApiResponse>(
      { success: true, data: room, message: 'Sala criada com sucesso' },
      { status: 201 }
    )
  } catch (error) {
    console.error('[API/rooms] POST error:', error)
    return NextResponse.json<ApiResponse>(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Erro interno do servidor' } },
      { status: 500 }
    )
  }
}
