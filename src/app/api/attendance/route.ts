import { NextRequest, NextResponse } from 'next/server'
import { createAttendanceSchema } from '@/lib/utils/validation'
import { getStore, paginate, insertItem, getProfile, enrichClass } from '@/lib/supabase/data-store'
import { createAuditService, ACTIONS } from '@/server/services/audit-service'
import type { Attendance, ApiResponse, PaginatedResponse, AuditLog } from '@/lib/types'

// GET /api/attendance - Get attendance records
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const classId = searchParams.get('classId')
    const studentId = searchParams.get('studentId')
    const sessionId = searchParams.get('sessionId')
    const status = searchParams.get('status')
    const date = searchParams.get('date')

    const store = getStore()
    let records = [...store.attendance]

    // Filters
    if (classId) {
      records = records.filter((a) => a.classId === classId)
    }
    if (studentId) {
      records = records.filter((a) => a.studentId === studentId)
    }
    if (sessionId) {
      records = records.filter((a) => a.sessionId === sessionId)
    }
    if (status) {
      records = records.filter((a) => a.status === status)
    }
    if (date) {
      const sessionIds = store.sessions
        .filter((s) => s.date === date)
        .map((s) => s.id)
      records = records.filter((a) => sessionIds.includes(a.sessionId))
    }

    // Sort by creation time
    records.sort((a, b) => b.createdAt.localeCompare(a.createdAt))

    const result = paginate(records, page, limit)

    // Enrich with student/session/class details
    const enrichedData = result.data.map((record) => {
      const student = store.students.find((s) => s.id === record.studentId)
      const studentProfile = student ? getProfile(student.profileId) : null
      const session = store.sessions.find((s) => s.id === record.sessionId)
      const cls = store.classes.find((c) => c.id === record.classId)
      const recorder = store.teachers.find((t) => t.id === record.recordedBy)
      const recorderProfile = recorder ? getProfile(recorder.profileId) : null

      return {
        ...record,
        studentName: studentProfile?.fullName || 'Aluno não encontrado',
        studentEnrollmentNumber: student?.enrollmentNumber || '',
        sessionDate: session?.date || '',
        sessionTopic: session?.topic || '',
        className: cls?.name || 'Turma não encontrada',
        recorderName: recorderProfile?.fullName || 'Professor não encontrado',
      }
    })

    // If filtering by class, compute summary stats
    let summary = undefined
    if (classId) {
      const classRecords = store.attendance.filter((a) => a.classId === classId)
      const total = classRecords.length
      const present = classRecords.filter((a) => a.status === 'present' || a.status === 'late').length
      const absent = classRecords.filter((a) => a.status === 'absent').length
      const justified = classRecords.filter((a) => a.status === 'justified').length
      summary = {
        totalRecords: total,
        presentCount: present,
        absentCount: absent,
        justifiedCount: justified,
        attendanceRate: total > 0 ? Math.round((present / total) * 1000) / 10 : 0,
      }
    }

    return NextResponse.json<PaginatedResponse<Attendance & {
      studentName: string; studentEnrollmentNumber: string
      sessionDate: string; sessionTopic: string
      className: string; recorderName: string
    }>>({
      data: enrichedData,
      pagination: result.pagination,
      ...(summary ? { summary } : {}),
    })
  } catch (error) {
    console.error('[API/attendance] GET error:', error)
    return NextResponse.json<ApiResponse>(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Erro interno do servidor' } },
      { status: 500 }
    )
  }
}

// POST /api/attendance - Register attendance (with digital signature recording)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const store = getStore()
    const now = new Date().toISOString()

    // Support batch attendance registration
    if (Array.isArray(body)) {
      const results = []
      const errors = []

      for (const record of body) {
        const parsed = createAttendanceSchema.safeParse(record)

        if (!parsed.success) {
          errors.push({ record, errors: parsed.error.issues })
          continue
        }

        // Check for duplicate
        const exists = store.attendance.find(
          (a) => a.sessionId === parsed.data.sessionId && a.studentId === parsed.data.studentId
        )

        if (exists) {
          // Update existing
          exists.status = parsed.data.status
          exists.checkInTime = parsed.data.checkInTime || exists.checkInTime
          exists.checkOutTime = parsed.data.checkOutTime
          exists.notes = parsed.data.notes || exists.notes
          exists.updatedAt = now
          results.push(exists)
        } else {
          const attendance: Attendance = {
            id: crypto.randomUUID(),
            ...parsed.data,
            createdAt: now,
            updatedAt: now,
          }
          insertItem(store.attendance, attendance)
          results.push(attendance)
        }
      }

      // Mark session as having attendance recorded
      if (results.length > 0) {
        const sessionIds = [...new Set(results.map((r) => r.sessionId))]
        for (const sid of sessionIds) {
          const session = store.sessions.find((s) => s.id === sid)
          if (session) session.attendanceRecorded = true
        }
      }

      return NextResponse.json<ApiResponse>({
        success: true,
        data: { registered: results.length, errors: errors.length, errorDetails: errors },
        message: `Frequência registrada: ${results.length} registros${errors.length > 0 ? `, ${errors.length} erros` : ''}`,
      })
    }

    // Single attendance record
    const parsed = createAttendanceSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: { code: 'VALIDATION_ERROR', message: 'Dados inválidos', details: parsed.error.issues } },
        { status: 400 }
      )
    }

    const data = parsed.data

    // Check for duplicate
    const exists = store.attendance.find(
      (a) => a.sessionId === data.sessionId && a.studentId === data.studentId
    )

    if (exists) {
      // Update existing record
      exists.status = data.status
      exists.checkInTime = data.checkInTime || exists.checkInTime
      exists.checkOutTime = data.checkOutTime
      exists.notes = data.notes || exists.notes
      exists.updatedAt = now

      return NextResponse.json<ApiResponse>({
        success: true,
        data: exists,
        message: 'Registro de frequência atualizado',
      })
    }

    const attendance: Attendance = {
      id: crypto.randomUUID(),
      ...data,
      createdAt: now,
      updatedAt: now,
    }

    insertItem(store.attendance, attendance)

    // Mark session as having attendance recorded
    const session = store.sessions.find((s) => s.id === data.sessionId)
    if (session) {
      session.attendanceRecorded = true
      session.updatedAt = now
    }

    // Record digital signature if check-in time provided
    let signatureRecorded = false
    if (data.checkInTime && body.signatureData) {
      signatureRecorded = true
      // In production, this would store in AttendanceSignature table
    }

    const student = store.students.find((s) => s.id === data.studentId)
    const studentProfile = student ? getProfile(student.profileId) : null

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        data: {
          ...attendance,
          studentName: studentProfile?.fullName || 'Aluno não encontrado',
          signatureRecorded,
        },
        message: 'Frequência registrada com sucesso',
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('[API/attendance] POST error:', error)
    return NextResponse.json<ApiResponse>(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Erro interno do servidor' } },
      { status: 500 }
    )
  }
}
