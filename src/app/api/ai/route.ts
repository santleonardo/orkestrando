import { NextRequest, NextResponse } from 'next/server'
import { getStore, enrichClass, getProfile } from '@/lib/supabase/data-store'
import { AIService } from '@/server/services/ai-service'
import { ConflictEngine } from '@/server/services/conflict-engine'
import type { ApiResponse, ValidationContext } from '@/lib/types'

type AIAction =
  | 'suggest_schedule'
  | 'detect_conflicts'
  | 'predict_dropout'
  | 'generate_report'
  | 'assistant'
  | 'analyze_attendance'

// POST /api/ai - AI assistant endpoint
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, params } = body

    if (!action || !params) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: { code: 'VALIDATION_ERROR', message: 'action e params são obrigatórios' } },
        { status: 400 }
      )
    }

    const store = getStore()
    const aiService = new AIService()

    switch (action as AIAction) {
      case 'suggest_schedule': {
        // Suggest optimal schedule slots
        const { teacherId, preferences } = params

        if (!teacherId) {
          return NextResponse.json<ApiResponse>(
            { success: false, error: { code: 'VALIDATION_ERROR', message: 'teacherId é obrigatório' } },
            { status: 400 }
          )
        }

        const teacher = store.teachers.find((t) => t.id === teacherId)
        if (!teacher) {
          return NextResponse.json<ApiResponse>(
            { success: false, error: { code: 'NOT_FOUND', message: 'Professor não encontrado' } },
            { status: 404 }
          )
        }

        const suggestions = await aiService.suggestScheduleSlots(
          teacherId,
          preferences || [
            { dayOfWeek: 1, weight: 0.9, preferredStartTime: '08:00', preferredEndTime: '12:00' },
            { dayOfWeek: 3, weight: 0.7, preferredStartTime: '08:00', preferredEndTime: '12:00' },
            { dayOfWeek: 5, weight: 0.5 },
          ]
        )

        return NextResponse.json<ApiResponse>({
          success: true,
          data: {
            teacherId,
            teacherName: getProfile(teacher.profileId).fullName,
            suggestions,
            message: suggestions.length > 0
              ? `${suggestions.length} sugestões de horário geradas`
              : 'Nenhuma sugestão disponível',
          },
        })
      }

      case 'detect_conflicts': {
        // Detect scheduling conflicts using AI
        const { classId, dateRange } = params

        let sessions = [...store.sessions].filter((s) => s.status !== 'cancelled')

        if (classId) {
          sessions = sessions.filter((s) => s.classId === classId)
        }
        if (dateRange?.start) {
          sessions = sessions.filter((s) => s.date >= dateRange.start)
        }
        if (dateRange?.end) {
          sessions = sessions.filter((s) => s.date <= dateRange.end)
        }

        // Limit to 50 sessions for AI analysis
        const sessionsToAnalyze = sessions.slice(0, 50)

        const conflicts = await aiService.detectConflictsWarning(sessionsToAnalyze)

        return NextResponse.json<ApiResponse>({
          success: true,
          data: {
            sessionsAnalyzed: sessionsToAnalyze.length,
            conflicts,
            conflictCount: conflicts.length,
            ...(conflicts.length > 0
              ? { hasCritical: conflicts.some((c) => c.severity === 'high' || c.severity === 'critical') }
              : {}),
          },
        })
      }

      case 'predict_dropout': {
        // Predict dropout risk for a student
        const { studentId } = params

        if (!studentId) {
          return NextResponse.json<ApiResponse>(
            { success: false, error: { code: 'VALIDATION_ERROR', message: 'studentId é obrigatório' } },
            { status: 400 }
          )
        }

        const student = store.students.find((s) => s.id === studentId)
        if (!student) {
          return NextResponse.json<ApiResponse>(
            { success: false, error: { code: 'NOT_FOUND', message: 'Aluno não encontrado' } },
            { status: 404 }
          )
        }

        // Gather student data
        const studentEnrollments = store.enrollments.filter((e) => e.studentId === studentId)
        const activeEnrollments = studentEnrollments.filter((e) => e.status === 'active')
        const droppedEnrollments = studentEnrollments.filter((e) => e.status === 'dropped')
        const studentAttendance = store.attendance.filter((a) =>
          activeEnrollments.some((e) => e.classId === a.classId) && a.studentId === studentId
        )
        const presentCount = studentAttendance.filter(
          (a) => a.status === 'present' || a.status === 'late'
        ).length
        const attendanceRate = studentAttendance.length > 0
          ? presentCount / studentAttendance.length
          : 0

        // Calculate consecutive absences
        const recentSessions = store.sessions
          .filter((s) => activeEnrollments.some((e) => e.classId === s.classId) && s.status !== 'cancelled')
          .sort((a, b) => b.date.localeCompare(a.date))
          .slice(0, 10)

        let consecutiveAbsences = 0
        for (const session of recentSessions) {
          const record = studentAttendance.find((a) => a.sessionId === session.id)
          if (!record || record.status === 'absent') {
            consecutiveAbsences++
          } else {
            break
          }
        }

        const prediction = await aiService.predictDropout(studentId, {
          attendanceRate: Math.round(attendanceRate * 1000) / 10,
          gradeAverage: student.overallGpa || 0,
          consecutiveAbsences,
          totalEnrollments: studentEnrollments.length,
          droppedEnrollments: droppedEnrollments.length,
          semester: student.semester,
          lastActiveDate: student.updatedAt,
        })

        return NextResponse.json<ApiResponse>({
          success: true,
          data: {
            studentId,
            studentName: getProfile(student.profileId).fullName,
            ...prediction,
          },
        })
      }

      case 'generate_report': {
        // Generate AI report
        const { reportType, reportData } = params

        if (!reportType) {
          return NextResponse.json<ApiResponse>(
            { success: false, error: { code: 'VALIDATION_ERROR', message: 'reportType é obrigatório' } },
            { status: 400 }
          )
        }

        // Gather relevant data based on report type
        let dataForAI: Record<string, unknown> = { ...reportData }

        if (reportType === 'attendance' || !reportData) {
          const classIdFilter = params.classId as string | undefined
          const classesToReport = classIdFilter
            ? store.classes.filter((c) => c.id === classIdFilter)
            : store.classes.filter((c) => c.status === 'active')

          const classAttendanceStats = classesToReport.slice(0, 5).map((cls) => {
            const records = store.attendance.filter((a) => a.classId === cls.id)
            const total = records.length
            const present = records.filter((a) => a.status === 'present' || a.status === 'late').length
            return {
              turma: cls.name,
              totalRegistros: total,
              presentes: present,
              taxa: total > 0 ? Math.round((present / total) * 100) : 0,
            }
          })

          dataForAI.estatisticasPorTurma = classAttendanceStats
          dataForAI.totalProfessores = store.teachers.length
          dataForAI.totalAlunos = store.students.length
          dataForAI.totalTurmas = store.classes.length
        }

        const reportContent = await aiService.generateReport(reportType, dataForAI)

        return NextResponse.json<ApiResponse>({
          success: true,
          data: {
            type: reportType,
            content: reportContent,
            generatedAt: new Date().toISOString(),
          },
          message: 'Relatório gerado pela IA com sucesso',
        })
      }

      case 'assistant': {
        // Academic assistant Q&A
        const { question, context } = params

        if (!question) {
          return NextResponse.json<ApiResponse>(
            { success: false, error: { code: 'VALIDATION_ERROR', message: 'question é obrigatória' } },
            { status: 400 }
          )
        }

        const answer = await aiService.academicAssistant(question, {
          classId: context?.classId,
          subjectName: context?.subjectName,
          topic: context?.topic,
          studentLevel: context?.studentLevel,
          previousTopics: context?.previousTopics,
          language: context?.language || 'pt-BR',
        })

        return NextResponse.json<ApiResponse>({
          success: true,
          data: {
            question,
            answer,
            context,
            generatedAt: new Date().toISOString(),
          },
        })
      }

      case 'analyze_attendance': {
        // Analyze attendance trends for a class
        const { classId } = params

        if (!classId) {
          return NextResponse.json<ApiResponse>(
            { success: false, error: { code: 'VALIDATION_ERROR', message: 'classId é obrigatório' } },
            { status: 400 }
          )
        }

        const cls = store.classes.find((c) => c.id === classId)
        if (!cls) {
          return NextResponse.json<ApiResponse>(
            { success: false, error: { code: 'NOT_FOUND', message: 'Turma não encontrada' } },
            { status: 404 }
          )
        }

        // Gather attendance data
        const sessions = store.sessions
          .filter((s) => s.classId === classId && s.status !== 'cancelled')
          .sort((a, b) => a.date.localeCompare(b.date))

        const enrolledStudents = store.enrollments
          .filter((e) => e.classId === classId && e.status === 'active')
          .map((e) => {
            const student = store.students.find((s) => s.id === e.studentId)
            const profile = student ? getProfile(student.profileId) : null
            return { studentId: e.studentId, studentName: profile?.fullName || 'Desconhecido' }
          })

        const sessionData = sessions.map((s) => {
          const records = store.attendance.filter((a) => a.sessionId === s.id)
          return {
            date: s.date,
            totalStudents: enrolledStudents.length,
            presentCount: records.filter((a) => a.status === 'present' || a.status === 'late').length,
            dayOfWeek: new Date(s.date).getDay(),
          }
        })

        const studentAttendanceData = enrolledStudents.map(({ studentId, studentName }) => {
          const records = store.attendance.filter((a) => a.studentId === studentId && a.classId === classId)
          const presentCount = records.filter((a) => a.status === 'present' || a.status === 'late').length

          // Calculate consecutive absences from most recent
          let consecutiveAbsences = 0
          for (const session of [...sessions].reverse()) {
            const record = records.find((a) => a.sessionId === session.id)
            if (!record || record.status === 'absent') {
              consecutiveAbsences++
            } else {
              break
            }
          }

          const lastRecord = records.sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0]

          return {
            studentId,
            studentName,
            totalPresent: presentCount,
            totalSessions: sessions.length,
            consecutiveAbsences,
            lastAttendanceDate: lastRecord?.createdAt,
          }
        })

        const analysis = await aiService.analyzeAttendanceTrends(
          classId,
          cls.name,
          {
            sessions: sessionData,
            studentAttendance: studentAttendanceData,
          }
        )

        return NextResponse.json<ApiResponse>({
          success: true,
          data: analysis,
        })
      }

      default: {
        return NextResponse.json<ApiResponse>(
          { success: false, error: { code: 'INVALID_ACTION', message: `Ação "${action}" não suportada. Ações disponíveis: suggest_schedule, detect_conflicts, predict_dropout, generate_report, assistant, analyze_attendance` } },
          { status: 400 }
        )
      }
    }
  } catch (error) {
    console.error('[API/ai] POST error:', error)
    return NextResponse.json<ApiResponse>(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Erro interno do servidor' } },
      { status: 500 }
    )
  }
}
