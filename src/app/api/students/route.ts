import { NextRequest, NextResponse } from 'next/server'
import { createStudentSchema } from '@/lib/utils/validation'
import { getStore, paginate, insertItem, getProfile } from '@/lib/supabase/data-store'
import type { Student, ApiResponse, PaginatedResponse } from '@/lib/types'

// GET /api/students - List students
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const search = searchParams.get('search') || ''
    const isActive = searchParams.get('isActive')
    const courseLevel = searchParams.get('courseLevel')
    const semester = searchParams.get('semester')
    const classId = searchParams.get('classId')

    const store = getStore()
    let students = [...store.students]

    // Filters
    if (isActive !== null && isActive !== '') {
      students = students.filter((s) => s.isActive === (isActive === 'true'))
    }
    if (courseLevel) {
      students = students.filter((s) => s.courseLevel === courseLevel)
    }
    if (semester) {
      students = students.filter((s) => s.semester === parseInt(semester))
    }

    // Filter by class enrollment
    if (classId) {
      const enrolledIds = store.enrollments
        .filter((e) => e.classId === classId && e.status === 'active')
        .map((e) => e.studentId)
      students = students.filter((s) => enrolledIds.includes(s.id))
    }

    // Search by name or enrollment number
    if (search) {
      students = students.filter((s) => {
        const profile = getProfile(s.profileId)
        return (
          profile.fullName.toLowerCase().includes(search.toLowerCase()) ||
          s.enrollmentNumber.toLowerCase().includes(search.toLowerCase()) ||
          s.id.toLowerCase().includes(search.toLowerCase())
        )
      })
    }

    // Sort by enrollment number
    students.sort((a, b) => a.enrollmentNumber.localeCompare(b.enrollmentNumber))

    const result = paginate(students, page, limit)

    // Enrich with profile data
    const enrichedData = result.data.map((s) => {
      const profile = getProfile(s.profileId)
      const enrollCount = store.enrollments.filter((e) => e.studentId === s.id && e.status === 'active').length
      return {
        ...s,
        studentName: profile.fullName,
        studentEmail: profile.email,
        activeEnrollments: enrollCount,
      }
    })

    return NextResponse.json<PaginatedResponse<Student & { studentName: string; studentEmail: string; activeEnrollments: number }>>({
      data: enrichedData,
      pagination: result.pagination,
    })
  } catch (error) {
    console.error('[API/students] GET error:', error)
    return NextResponse.json<ApiResponse>(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Erro interno do servidor' } },
      { status: 500 }
    )
  }
}

// POST /api/students - Create student
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const parsed = createStudentSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: { code: 'VALIDATION_ERROR', message: 'Dados inválidos', details: parsed.error.issues } },
        { status: 400 }
      )
    }

    const store = getStore()
    const now = new Date().toISOString()

    // Check if enrollment number already exists
    const exists = store.students.some((s) => s.enrollmentNumber === parsed.data.enrollmentNumber)
    if (exists) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: { code: 'DUPLICATE', message: 'Número de matrícula já cadastrado', field: 'enrollmentNumber' } },
        { status: 409 }
      )
    }

    const student: Student = {
      id: crypto.randomUUID(),
      ...parsed.data,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    }

    const result = insertItem(store.students, student)

    if (result.error) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: { code: 'CREATE_ERROR', message: result.error.message } },
        { status: 500 }
      )
    }

    const profile = getProfile(student.profileId)
    return NextResponse.json<ApiResponse>(
      {
        success: true,
        data: { ...student, studentName: profile.fullName, studentEmail: profile.email },
        message: 'Aluno criado com sucesso',
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('[API/students] POST error:', error)
    return NextResponse.json<ApiResponse>(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Erro interno do servidor' } },
      { status: 500 }
    )
  }
}
