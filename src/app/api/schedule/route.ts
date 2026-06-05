import { NextRequest, NextResponse } from 'next/server'
import { getStore, paginate, insertItem, enrichClass, getProfile } from '@/lib/supabase/data-store'
import { ConflictEngine } from '@/server/services/conflict-engine'
import type { ClassSession, ApiResponse, PaginatedResponse, ValidationContext } from '@/lib/types'

// GET /api/schedule - Get schedule for a date range
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const teacherId = searchParams.get('teacherId')
    const roomId = searchParams.get('roomId')
    const studentId = searchParams.get('studentId')
    const classId = searchParams.get('classId')
    const status = searchParams.get('status')

    const store = getStore()
    let sessions = [...store.sessions]

    // Filter by date range
    if (startDate) {
      sessions = sessions.filter((s) => s.date >= startDate)
    }
    if (endDate) {
      sessions = sessions.filter((s) => s.date <= endDate)
    }

    // Other filters
    if (teacherId) {
      sessions = sessions.filter((s) => s.teacherId === teacherId)
    }
    if (roomId) {
      sessions = sessions.filter((s) => s.roomId === roomId)
    }
    if (classId) {
      sessions = sessions.filter((s) => s.classId === classId)
    }
    if (status) {
      sessions = sessions.filter((s) => s.status === status)
    }

    // Filter by student (via enrollments)
    if (studentId) {
      const enrolledClasses = store.enrollments
        .filter((e) => e.studentId === studentId && e.status === 'active')
        .map((e) => e.classId)
      sessions = sessions.filter((s) => enrolledClasses.includes(s.classId))
    }

    // Sort by date then start time
    sessions.sort((a, b) => {
      const dateCompare = a.date.localeCompare(b.date)
      if (dateCompare !== 0) return dateCompare
      return a.startTime.localeCompare(b.startTime)
    })

    const result = paginate(sessions, page, limit)

    // Enrich with class/teacher/room details
    const enrichedData = result.data.map((session) => {
      const cls = store.classes.find((c) => c.id === session.classId)
      const teacher = store.teachers.find((t) => t.id === session.teacherId)
      const room = store.rooms.find((r) => r.id === session.roomId)
      const teacherProfile = teacher ? getProfile(teacher.profileId) : null
      const subject = cls ? store.subjects.find((s) => s.id === cls.subjectId) : null

      // Count attendance
      const attendanceCount = store.attendance.filter((a) => a.sessionId === session.id).length
      const presentCount = store.attendance.filter((a) => a.sessionId === session.id && (a.status === 'present' || a.status === 'late')).length

      return {
        ...session,
        className: cls?.name || 'Turma não encontrada',
        classCode: cls?.code || '',
        subjectName: subject?.name || '',
        teacherName: teacherProfile?.fullName || 'Professor não atribuído',
        roomName: room?.name || 'Sem sala',
        roomCode: room?.code || '',
        attendanceCount,
        presentCount,
      }
    })

    return NextResponse.json<PaginatedResponse<ClassSession & {
      className: string; classCode: string; subjectName: string
      teacherName: string; roomName: string; roomCode: string
      attendanceCount: number; presentCount: number
    }>>({
      data: enrichedData,
      pagination: result.pagination,
    })
  } catch (error) {
    console.error('[API/schedule] GET error:', error)
    return NextResponse.json<ApiResponse>(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Erro interno do servidor' } },
      { status: 500 }
    )
  }
}

// POST /api/schedule - Create manual session (with conflict validation)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const { classId, date, startTime, endTime, topic, description, roomId } = body

    // Basic validation
    if (!classId || !date || !startTime || !endTime) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: { code: 'VALIDATION_ERROR', message: 'classId, date, startTime e endTime são obrigatórios' } },
        { status: 400 }
      )
    }

    const store = getStore()
    const now = new Date().toISOString()

    // Validate class exists
    const cls = store.classes.find((c) => c.id === classId)
    if (!cls) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: { code: 'NOT_FOUND', message: 'Turma não encontrada' } },
        { status: 404 }
      )
    }

    const newSession: ClassSession = {
      id: crypto.randomUUID(),
      classId,
      teacherId: cls.teacherId,
      roomId: roomId || cls.roomId,
      date,
      startTime,
      endTime,
      status: 'scheduled',
      topic: topic || 'Aula extra',
      description,
      attendanceRecorded: false,
      createdAt: now,
      updatedAt: now,
    }

    // Run conflict validation
    const conflictEngine = new ConflictEngine()
    const validationContext: ValidationContext = {
      existingSessions: store.sessions,
      teacherAvailability: store.availability,
      holidays: store.holidays,
      teacherBlocks: [],
      existingEnrollments: store.enrollments,
    }

    const conflictReport = conflictEngine.validateAllConflicts(newSession, validationContext)

    if (!conflictReport.valid) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: {
            code: 'CONFLICT',
            message: 'Conflitos de horário detectados',
            details: {
              errors: conflictReport.errors.map((e) => ({
                type: e.type,
                severity: e.severity,
                message: e.message,
              })),
              warnings: conflictReport.warnings.map((w) => ({
                type: w.type,
                severity: w.severity,
                description: w.description,
                suggestion: w.suggestion,
              })),
            },
          },
        },
        { status: 409 }
      )
    }

    // Insert session
    insertItem(store.sessions, newSession)

    const teacher = store.teachers.find((t) => t.id === cls.teacherId)
    const teacherProfile = teacher ? getProfile(teacher.profileId) : null
    const room = store.rooms.find((r) => r.id === (roomId || cls.roomId))

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        data: {
          ...newSession,
          className: cls.name,
          teacherName: teacherProfile?.fullName || 'Professor não atribuído',
          roomName: room?.name || 'Sem sala',
        },
        warnings: conflictReport.warnings.length > 0 ? conflictReport.warnings : undefined,
        message: 'Sessão criada com sucesso',
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('[API/schedule] POST error:', error)
    return NextResponse.json<ApiResponse>(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Erro interno do servidor' } },
      { status: 500 }
    )
  }
}
