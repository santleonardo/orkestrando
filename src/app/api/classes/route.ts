import { NextRequest, NextResponse } from 'next/server'
import { createClassSchema } from '@/lib/utils/validation'
import { getStore, paginate, insertItem, enrichClass } from '@/lib/supabase/data-store'
import { ConflictEngine } from '@/server/services/conflict-engine'
import { LessonGenerator } from '@/server/services/lesson-generator'
import type { Class, ClassSession, ApiResponse, PaginatedResponse } from '@/lib/types'

// GET /api/classes - List classes with enriched details
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const search = searchParams.get('search') || ''
    const status = searchParams.get('status')
    const teacherId = searchParams.get('teacherId')
    const courseId = searchParams.get('courseId')
    const semesterId = searchParams.get('semesterId')

    const store = getStore()
    let classes = [...store.classes]

    // Filters
    if (status) {
      classes = classes.filter((c) => c.status === status)
    }
    if (teacherId) {
      classes = classes.filter((c) => c.teacherId === teacherId)
    }
    if (courseId) {
      classes = classes.filter((c) => c.courseId === courseId)
    }
    if (semesterId) {
      classes = classes.filter((c) => c.semesterId === semesterId)
    }

    // Search
    if (search) {
      classes = classes.filter((c) =>
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.code.toLowerCase().includes(search.toLowerCase())
      )
    }

    // Sort by name
    classes.sort((a, b) => a.name.localeCompare(b.name))

    const result = paginate(classes, page, limit)

    // Enrich with teacher/room/course/subject names
    const enrichedData = result.data.map((cls) => enrichClass(cls, store))

    return NextResponse.json<PaginatedResponse<ReturnType<typeof enrichClass>>>({
      data: enrichedData,
      pagination: result.pagination,
    })
  } catch (error) {
    console.error('[API/classes] GET error:', error)
    return NextResponse.json<ApiResponse>(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Erro interno do servidor' } },
      { status: 500 }
    )
  }
}

// POST /api/classes - Create class + auto-generate sessions with conflict validation
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const parsed = createClassSchema.safeParse(body)

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

    // Validate course exists
    const course = store.courses.find((c) => c.id === data.courseId)
    if (!course) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: { code: 'NOT_FOUND', message: 'Curso não encontrado', field: 'courseId' } },
        { status: 400 }
      )
    }

    // Validate subject exists
    const subject = store.subjects.find((s) => s.id === data.subjectId)
    if (!subject) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: { code: 'NOT_FOUND', message: 'Disciplina não encontrada', field: 'subjectId' } },
        { status: 400 }
      )
    }

    // Validate semester exists
    const semester = store.semesters.find((s) => s.id === data.semesterId)
    if (!semester) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: { code: 'NOT_FOUND', message: 'Semestre não encontrado', field: 'semesterId' } },
        { status: 400 }
      )
    }

    // Validate room exists (if provided)
    if (data.roomId) {
      const room = store.rooms.find((r) => r.id === data.roomId)
      if (!room) {
        return NextResponse.json<ApiResponse>(
          { success: false, error: { code: 'NOT_FOUND', message: 'Sala não encontrada', field: 'roomId' } },
          { status: 400 }
        )
      }
    }

    // Create the class
    const newClass: Class = {
      id: crypto.randomUUID(),
      organizationId: data.organizationId,
      courseId: data.courseId,
      subjectId: data.subjectId,
      teacherId: data.teacherId,
      semesterId: data.semesterId,
      roomId: data.roomId,
      name: data.name,
      code: data.code,
      schedule: {
        dayOfWeek: data.dayOfWeek as 0 | 1 | 2 | 3 | 4 | 5 | 6,
        startTime: data.startTime,
        endTime: data.endTime,
        recurring: true,
        recurrencePattern: 'weekly',
      },
      maxCapacity: data.maxCapacity,
      currentEnrollment: 0,
      status: 'active',
      startDate: data.startDate,
      endDate: data.endDate,
      startTime: data.startTime,
      endTime: data.endTime,
      dayOfWeek: data.dayOfWeek as 0 | 1 | 2 | 3 | 4 | 5 | 6,
      description: data.description,
      syllabus: data.syllabus,
      gradingCriteria: data.gradingCriteria,
      createdAt: now,
      updatedAt: now,
    }

    insertItem(store.classes, newClass)

    // Generate sessions using LessonGenerator
    const generator = new LessonGenerator()
    const semesterStart = new Date(semester.startDate)
    const semesterEnd = new Date(semester.endDate)

    const generationResult = generator.generateLessons(
      newClass,
      semesterStart,
      semesterEnd,
      store.holidays,
      [], // no blocks for now
      { skipHolidays: true, skipBlocks: true, maxSessions: 200 }
    )

    // Validate generated sessions with ConflictEngine
    const conflictEngine = new ConflictEngine()
    const errors: string[] = []
    const warnings: string[] = []

    for (const session of generationResult.sessions) {
      const report = conflictEngine.validateAllConflicts(session, {
        existingSessions: [...store.sessions, ...generationResult.sessions.filter(s => s.id !== session.id)],
        teacherAvailability: store.availability,
        holidays: store.holidays,
        teacherBlocks: [],
        existingEnrollments: store.enrollments,
      })

      if (!report.valid) {
        errors.push(...report.errors.map(e => e.message))
      }
      warnings.push(...report.warnings.map(w => w.description))
    }

    // If there are critical errors, return warnings but still create
    const hasCriticalErrors = errors.some(e => e.includes('Conflito de horário do professor') || e.includes('Conflito de sala'))

    // Add generated sessions to store
    for (const session of generationResult.sessions) {
      insertItem(store.sessions, session)
    }

    const enrichedNewClass = enrichClass(newClass, store)

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        data: {
          class: enrichedNewClass,
          sessionsGenerated: generationResult.totalSessions,
          skippedDates: generationResult.skippedDates,
          warnings: [...generationResult.warnings, ...warnings],
          conflicts: hasCriticalErrors ? errors : undefined,
        },
        message: 'Turma criada com sucesso',
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('[API/classes] POST error:', error)
    return NextResponse.json<ApiResponse>(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Erro interno do servidor' } },
      { status: 500 }
    )
  }
}
