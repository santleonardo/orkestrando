import { NextRequest, NextResponse } from 'next/server'
import { createEnrollmentSchema } from '@/lib/utils/validation'
import { getStore, paginate, insertItem, getProfile, enrichClass } from '@/lib/supabase/data-store'
import type { Enrollment, ApiResponse, PaginatedResponse } from '@/lib/types'

// GET /api/enrollments - List enrollments
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const classId = searchParams.get('classId')
    const studentId = searchParams.get('studentId')
    const semesterId = searchParams.get('semesterId')
    const status = searchParams.get('status')

    const store = getStore()
    let enrollments = [...store.enrollments]

    // Filters
    if (classId) {
      enrollments = enrollments.filter((e) => e.classId === classId)
    }
    if (studentId) {
      enrollments = enrollments.filter((e) => e.studentId === studentId)
    }
    if (semesterId) {
      enrollments = enrollments.filter((e) => e.semesterId === semesterId)
    }
    if (status) {
      enrollments = enrollments.filter((e) => e.status === status)
    }

    // Sort by enrollment date descending
    enrollments.sort((a, b) => b.enrollmentDate.localeCompare(a.enrollmentDate))

    const result = paginate(enrollments, page, limit)

    // Enrich with student/class details
    const enrichedData = result.data.map((enrollment) => {
      const student = store.students.find((s) => s.id === enrollment.studentId)
      const studentProfile = student ? getProfile(student.profileId) : null
      const cls = store.classes.find((c) => c.id === enrollment.classId)
      const course = cls ? store.courses.find((c) => c.id === cls.courseId) : null

      // Compute attendance rate for this enrollment
      const attendanceRecords = store.attendance.filter(
        (a) => a.studentId === enrollment.studentId && a.classId === enrollment.classId
      )
      const total = attendanceRecords.length
      const present = attendanceRecords.filter(
        (a) => a.status === 'present' || a.status === 'late'
      ).length
      const attendanceRate = total > 0 ? Math.round((present / total) * 1000) / 10 : 0

      return {
        ...enrollment,
        studentName: studentProfile?.fullName || 'Aluno não encontrado',
        studentEnrollmentNumber: student?.enrollmentNumber || '',
        className: cls?.name || 'Turma não encontrada',
        classCode: cls?.code || '',
        courseName: course?.name || '',
        computedAttendanceRate: attendanceRate,
      }
    })

    // Summary stats if filtered by class
    let summary = undefined
    if (classId) {
      const classEnrollments = store.enrollments.filter((e) => e.classId === classId)
      const cls = store.classes.find((c) => c.id === classId)
      summary = {
        totalEnrolled: classEnrollments.length,
        activeEnrolled: classEnrollments.filter((e) => e.status === 'active').length,
        droppedCount: classEnrollments.filter((e) => e.status === 'dropped').length,
        maxCapacity: cls?.maxCapacity || 0,
        availableSlots: cls ? Math.max(0, cls.maxCapacity - classEnrollments.filter((e) => e.status === 'active').length) : 0,
      }
    }

    return NextResponse.json<PaginatedResponse<Enrollment & {
      studentName: string; studentEnrollmentNumber: string
      className: string; classCode: string; courseName: string
      computedAttendanceRate: number
    }>>({
      data: enrichedData,
      pagination: result.pagination,
      ...(summary ? { summary } : {}),
    })
  } catch (error) {
    console.error('[API/enrollments] GET error:', error)
    return NextResponse.json<ApiResponse>(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Erro interno do servidor' } },
      { status: 500 }
    )
  }
}

// POST /api/enrollments - Enroll student in class (with capacity check)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const parsed = createEnrollmentSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: { code: 'VALIDATION_ERROR', message: 'Dados inválidos', details: parsed.error.issues } },
        { status: 400 }
      )
    }

    const store = getStore()
    const now = new Date().toISOString()
    const data = parsed.data

    // Validate student exists
    const student = store.students.find((s) => s.id === data.studentId)
    if (!student) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: { code: 'NOT_FOUND', message: 'Aluno não encontrado', field: 'studentId' } },
        { status: 404 }
      )
    }

    // Validate class exists
    const cls = store.classes.find((c) => c.id === data.classId)
    if (!cls) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: { code: 'NOT_FOUND', message: 'Turma não encontrada', field: 'classId' } },
        { status: 404 }
      )
    }

    // Check if class is active
    if (cls.status !== 'active') {
      return NextResponse.json<ApiResponse>(
        { success: false, error: { code: 'CLASS_INACTIVE', message: 'Esta turma não está aceitando matrículas no momento' } },
        { status: 400 }
      )
    }

    // Check for duplicate enrollment
    const existing = store.enrollments.find(
      (e) => e.studentId === data.studentId && e.classId === data.classId && e.status === 'active'
    )
    if (existing) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: { code: 'DUPLICATE', message: 'Aluno já matriculado nesta turma' } },
        { status: 409 }
      )
    }

    // Capacity check
    const activeEnrollments = store.enrollments.filter(
      (e) => e.classId === data.classId && e.status === 'active'
    )
    if (activeEnrollments.length >= cls.maxCapacity) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: {
            code: 'CAPACITY_REACHED',
            message: `Turma atingiu capacidade máxima (${cls.maxCapacity} vagas)`,
            details: { currentEnrollment: activeEnrollments.length, maxCapacity: cls.maxCapacity },
          },
        },
        { status: 400 }
      )
    }

    // Check schedule conflict (student already enrolled in overlapping class)
    const studentClasses = store.enrollments
      .filter((e) => e.studentId === data.studentId && e.status === 'active')
      .map((e) => store.classes.find((c) => c.id === e.classId))
      .filter(Boolean)

    const scheduleConflict = studentClasses.find((sc) =>
      sc && sc.dayOfWeek === cls.dayOfWeek &&
      cls.startTime < sc.endTime &&
      cls.endTime > sc.startTime
    )

    if (scheduleConflict) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: {
            code: 'SCHEDULE_CONFLICT',
            message: `Conflito de horário com a turma "${scheduleConflict.name}"`,
            details: { conflictingClassId: scheduleConflict.id, conflictingClassName: scheduleConflict.name },
          },
        },
        { status: 409 }
      )
    }

    const enrollment: Enrollment = {
      id: crypto.randomUUID(),
      studentId: data.studentId,
      classId: data.classId,
      semesterId: data.semesterId,
      organizationId: data.organizationId,
      status: 'active',
      enrollmentDate: data.enrollmentDate,
      createdAt: now,
      updatedAt: now,
    }

    const result = insertItem(store.enrollments, enrollment)

    if (result.error) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: { code: 'CREATE_ERROR', message: result.error.message } },
        { status: 500 }
      )
    }

    // Update class enrollment count
    cls.currentEnrollment = activeEnrollments.length + 1
    cls.updatedAt = now

    const studentProfile = getProfile(student.profileId)
    const course = store.courses.find((c) => c.id === cls.courseId)

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        data: {
          ...enrollment,
          studentName: studentProfile.fullName,
          className: cls.name,
          classCode: cls.code,
          courseName: course?.name || '',
          remainingSlots: cls.maxCapacity - cls.currentEnrollment,
        },
        message: 'Matrícula realizada com sucesso',
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('[API/enrollments] POST error:', error)
    return NextResponse.json<ApiResponse>(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Erro interno do servidor' } },
      { status: 500 }
    )
  }
}
