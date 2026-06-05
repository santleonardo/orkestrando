import { NextRequest, NextResponse } from 'next/server'
import { getStore, paginate, insertItem, getProfile, enrichClass } from '@/lib/supabase/data-store'
import { AIService } from '@/server/services/ai-service'
import type { ApiResponse } from '@/lib/types'

// GET /api/reports - Generate reports
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl
    const type = searchParams.get('type') || 'attendance'
    const classId = searchParams.get('classId')
    const courseId = searchParams.get('courseId')
    const teacherId = searchParams.get('teacherId')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    const store = getStore()

    let reportData: Record<string, unknown> = {}

    switch (type) {
      case 'attendance': {
        // Attendance rate report
        const classes = classId
          ? store.classes.filter((c) => c.id === classId)
          : store.classes.filter((c) => c.status === 'active')

        const classStats = classes.map((cls) => {
          const classAttendance = store.attendance.filter((a) => a.classId === cls.id)
          const total = classAttendance.length
          const present = classAttendance.filter(
            (a) => a.status === 'present' || a.status === 'late'
          ).length
          const absent = classAttendance.filter((a) => a.status === 'absent').length
          const justified = classAttendance.filter((a) => a.status === 'justified').length
          const rate = total > 0 ? Math.round((present / total) * 1000) / 10 : 0

          const enrolledStudents = store.enrollments.filter(
            (e) => e.classId === cls.id && e.status === 'active'
          ).length

          return {
            classId: cls.id,
            className: cls.name,
            classCode: cls.code,
            totalRecords: total,
            presentCount: present,
            absentCount: absent,
            justifiedCount: justified,
            attendanceRate: rate,
            enrolledStudents,
          }
        })

        const totalRecords = classStats.reduce((sum, c) => sum + c.totalRecords, 0)
        const totalPresent = classStats.reduce((sum, c) => sum + c.presentCount, 0)
        const overallRate = totalRecords > 0
          ? Math.round((totalPresent / totalRecords) * 1000) / 10
          : 0

        reportData = {
          reportType: 'attendance',
          title: 'Relatório de Frequência',
          generatedAt: new Date().toISOString(),
          period: { startDate: startDate || 'Início', endDate: endDate || 'Atual' },
          overallAttendanceRate: overallRate,
          totalRecords,
          classBreakdown: classStats,
          summary: {
            totalClasses: classes.length,
            classesWithHighRate: classStats.filter((c) => c.attendanceRate >= 90).length,
            classesWithLowRate: classStats.filter((c) => c.attendanceRate < 75).length,
            averageRate: classStats.length > 0
              ? Math.round(classStats.reduce((s, c) => s + c.attendanceRate, 0) / classStats.length * 10) / 10
              : 0,
          },
        }
        break
      }

      case 'dropout': {
        // Dropout rate report
        const allEnrollments = store.enrollments
        const activeEnrollments = allEnrollments.filter((e) => e.status === 'active')
        const droppedEnrollments = allEnrollments.filter((e) => e.status === 'dropped')
        const totalEnrollments = allEnrollments.length
        const dropoutRate = totalEnrollments > 0
          ? Math.round((droppedEnrollments.length / totalEnrollments) * 1000) / 10
          : 0

        // Students at risk (low GPA or low attendance)
        const atRiskStudents = store.students.filter((s) => {
          const studentEnrollments = store.enrollments.filter(
            (e) => e.studentId === s.id && e.status === 'active'
          )
          const studentAttendance = store.attendance.filter(
            (a) => studentEnrollments.some((e) => e.classId === a.classId) &&
              a.studentId === s.id
          )
          const rate = studentAttendance.length > 0
            ? studentAttendance.filter((a) => a.status === 'present' || a.status === 'late').length / studentAttendance.length
            : 0

          return (s.overallGpa !== undefined && s.overallGpa < 7.0) || rate < 0.75
        })

        reportData = {
          reportType: 'dropout',
          title: 'Relatório de Evasão',
          generatedAt: new Date().toISOString(),
          totalEnrollments,
          activeEnrollments: activeEnrollments.length,
          droppedEnrollments: droppedEnrollments.length,
          dropoutRate,
          atRiskStudents: atRiskStudents.map((s) => {
            const profile = getProfile(s.profileId)
            return {
              studentId: s.id,
              studentName: profile.fullName,
              overallGpa: s.overallGpa,
              courseLevel: s.courseLevel,
            }
          }),
          atRiskCount: atRiskStudents.length,
        }
        break
      }

      case 'room_usage': {
        // Room usage report
        const roomUsage = store.rooms.map((room) => {
          const sessionsInRoom = store.sessions.filter(
            (s) => s.roomId === room.id && s.status !== 'cancelled'
          )
          const hoursUsed = sessionsInRoom.reduce((sum, s) => {
            const [sh, sm] = s.startTime.split(':').map(Number)
            const [eh, em] = s.endTime.split(':').map(Number)
            return sum + (eh * 60 + em - sh * 60 - sm) / 60
          }, 0)

          const daysUsed = new Set(sessionsInRoom.map((s) => s.date)).size
          const avgSessionPerDay = daysUsed > 0
            ? Math.round((sessionsInRoom.length / daysUsed) * 10) / 10
            : 0

          return {
            roomId: room.id,
            roomName: room.name,
            roomCode: room.code,
            roomType: room.roomType,
            capacity: room.capacity,
            totalSessions: sessionsInRoom.length,
            hoursUsed: Math.round(hoursUsed * 10) / 10,
            daysUsed,
            avgSessionsPerDay: avgSessionPerDay,
            utilizationRate: 0, // would need total possible hours
          }
        })

        reportData = {
          reportType: 'room_usage',
          title: 'Relatório de Utilização de Salas',
          generatedAt: new Date().toISOString(),
          period: { startDate: startDate || 'Início', endDate: endDate || 'Atual' },
          totalRooms: store.rooms.length,
          activeRooms: store.rooms.filter((r) => r.isActive).length,
          totalSessionsScheduled: store.sessions.filter((s) => s.status !== 'cancelled').length,
          roomBreakdown: roomUsage,
          mostUsed: roomUsage.sort((a, b) => b.totalSessions - a.totalSessions).slice(0, 5),
          leastUsed: roomUsage.sort((a, b) => a.totalSessions - b.totalSessions).slice(0, 5),
        }
        break
      }

      case 'teaching_hours': {
        // Teaching hours report
        const teacherHours = store.teachers.map((teacher) => {
          const teacherSessions = store.sessions.filter(
            (s) => s.teacherId === teacher.id && s.status !== 'cancelled'
          )
          const totalHours = teacherSessions.reduce((sum, s) => {
            const [sh, sm] = s.startTime.split(':').map(Number)
            const [eh, em] = s.endTime.split(':').map(Number)
            return sum + (eh * 60 + em - sh * 60 - sm) / 60
          }, 0)

          const completedSessions = teacherSessions.filter((s) => s.status === 'completed').length
          const scheduledSessions = teacherSessions.filter((s) => s.status === 'scheduled').length
          const classes = store.classes.filter((c) => c.teacherId === teacher.id)

          const profile = getProfile(teacher.profileId)

          return {
            teacherId: teacher.id,
            teacherName: profile.fullName,
            contractType: teacher.contractType,
            maxWeeklyHours: teacher.maxWeeklyHours,
            totalHours: Math.round(totalHours * 10) / 10,
            completedSessions,
            scheduledSessions,
            totalSessions: teacherSessions.length,
            classesCount: classes.length,
            activeClasses: classes.filter((c) => c.status === 'active').length,
          }
        })

        const totalTeachingHours = teacherHours.reduce((sum, t) => sum + t.totalHours, 0)

        reportData = {
          reportType: 'teaching_hours',
          title: 'Relatório de Horas Docentes',
          generatedAt: new Date().toISOString(),
          totalTeachers: teacherHours.length,
          totalTeachingHours: Math.round(totalTeachingHours * 10) / 10,
          averageHoursPerTeacher: teacherHours.length > 0
            ? Math.round((totalTeachingHours / teacherHours.length) * 10) / 10
            : 0,
          teacherBreakdown: teacherHours.sort((a, b) => b.totalHours - a.totalHours),
        }
        break
      }

      default: {
        reportData = { reportType: type, message: `Tipo de relatório "${type}" não implementado` }
      }
    }

    return NextResponse.json<ApiResponse>({
      success: true,
      data: reportData,
      message: 'Relatório gerado com sucesso',
    })
  } catch (error) {
    console.error('[API/reports] GET error:', error)
    return NextResponse.json<ApiResponse>(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Erro interno do servidor' } },
      { status: 500 }
    )
  }
}

// POST /api/reports - Create scheduled report or AI-generated report
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const store = getStore()
    const now = new Date().toISOString()

    // AI-generated report
    if (body.useAI && body.type) {
      const aiService = new AIService()
      const reportContent = await aiService.generateReport(body.type, body.data || {})

      return NextResponse.json<ApiResponse>({
        success: true,
        data: {
          reportType: body.type,
          content: reportContent,
          generatedAt: now,
          generatedByAI: true,
        },
        message: 'Relatório gerado pela IA com sucesso',
      })
    }

    // Create a report record
    const { title, description, reportType, parameters, format, createdById } = body

    if (!title || !reportType || !createdById) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: { code: 'VALIDATION_ERROR', message: 'title, reportType e createdById são obrigatórios' } },
        { status: 400 }
      )
    }

    const report = {
      id: crypto.randomUUID(),
      organizationId: store.organizationId,
      createdById,
      title,
      description: description || '',
      reportType: reportType || 'custom',
      parameters: parameters || {},
      dataUrl: null,
      format: format || 'pdf',
      status: 'pending' as const,
      fileSize: null,
      createdAt: now,
      updatedAt: now,
    }

    return NextResponse.json<ApiResponse>(
      { success: true, data: report, message: 'Relatório agendado com sucesso' },
      { status: 201 }
    )
  } catch (error) {
    console.error('[API/reports] POST error:', error)
    return NextResponse.json<ApiResponse>(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Erro interno do servidor' } },
      { status: 500 }
    )
  }
}
