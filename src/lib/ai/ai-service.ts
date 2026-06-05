// =============================================================================
// ORKESTRANDO - AI Service
// Moved to correct path: src/lib/ai/ai-service.ts
// Powered by z-ai-web-dev-sdk for academic intelligence features
// Backend only — must not be used on the client side
// =============================================================================

import ZAI from 'z-ai-web-dev-sdk'
import type {
  ClassSession,
  SchedulePreference,
  ScheduleSuggestion,
  ConflictWarning,
  DropoutPrediction,
  AcademicContext,
  AttendanceAnalysis,
} from '@/lib/types'
import { formatDate } from '@/lib/utils/date'

// Initialize the AI client
const ai = new ZAI()

export class AIService {
  /**
   * Suggests optimal schedule slots based on teacher preferences,
   * room availability, and historical usage patterns.
   */
  async suggestScheduleSlots(
    teacherId: string,
    preferences: SchedulePreference[]
  ): Promise<ScheduleSuggestion[]> {
    const preferencesDescription = preferences
      .map((p) => {
        const days = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado']
        return `Dia: ${days[p.dayOfWeek]}, Preferência: ${p.preferredStartTime || 'qualquer'} - ${p.preferredEndTime || 'qualquer'}, Peso: ${p.weight}`
      })
      .join('\n')

    const systemPrompt = `Você é um assistente acadêmico especializado em otimização de cronogramas.
Analise as preferências do professor e sugira os melhores horários disponíveis.
Retorne sugestões no formato JSON com: dayOfWeek (0-6), startTime (HH:mm), endTime (HH:mm), roomId, score (0-1), reasons (array de strings), conflicts (array de strings).
Retorne apenas o JSON sem markdown.`

    try {
      const response = await ai.chat({
        model: 'default',
        messages: [
          { role: 'system', content: systemPrompt },
          {
            role: 'user',
            content: `Professor ID: ${teacherId}\n\nPreferências:\n${preferencesDescription}\n\nSugira os 5 melhores horários para aulas deste professor.`,
          },
        ],
      })

      const content = response?.choices?.[0]?.message?.content || '[]'
      const jsonMatch = content.match(/\[[\s\S]*\]/)
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]) as ScheduleSuggestion[]
      }
      return []
    } catch (error) {
      console.error('[AI] Erro ao sugerir horários:', error)
      return []
    }
  }

  /**
   * Detects and warns about potential scheduling conflicts
   * using AI pattern recognition.
   */
  async detectConflictsWarning(
    sessions: ClassSession[]
  ): Promise<ConflictWarning[]> {
    if (sessions.length === 0) return []

    const sessionDescriptions = sessions
      .map(
        (s) =>
          `Sessão ${s.id}: Turma=${s.classId}, Data=${formatDate(s.date)}, Horário=${s.startTime}-${s.endTime}, Professor=${s.teacherId}, Sala=${s.roomId || 'sem sala'}`
      )
      .join('\n')

    const systemPrompt = `Você é um assistente acadêmico especializado em detecção de conflitos de horário.
Analise a lista de sessões e identifique potenciais problemas como:
1. Sobreposição de horários do mesmo professor
2. Sobreposição de uso de salas
3. Possíveis conflitos de alunos com múltiplas matrículas
4. Horários muito próximos entre diferentes locais
Retorne alertas no formato JSON com: type (teacher_overlap/room_overlap/student_overlap/holiday/vacation/availability), severity (low/medium/high/critical), description (string), affectedEntityId (string), affectedEntityName (string), suggestion (string).
Retorne apenas o JSON sem markdown.`

    try {
      const response = await ai.chat({
        model: 'default',
        messages: [
          { role: 'system', content: systemPrompt },
          {
            role: 'user',
            content: `Analise as seguintes sessões e identifique conflitos:\n\n${sessionDescriptions}`,
          },
        ],
      })

      const content = response?.choices?.[0]?.message?.content || '[]'
      const jsonMatch = content.match(/\[[\s\S]*\]/)
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]) as ConflictWarning[]
      }
      return []
    } catch (error) {
      console.error('[AI] Erro ao detectar conflitos:', error)
      return []
    }
  }

  /**
   * Predicts dropout risk for a student based on their academic data.
   */
  async predictDropout(
    studentId: string,
    studentData: {
      attendanceRate: number
      gradeAverage: number
      consecutiveAbsences: number
      totalEnrollments: number
      droppedEnrollments: number
      semester: number
      lastActiveDate: string
    }
  ): Promise<DropoutPrediction> {
    const systemPrompt = `Você é um assistente acadêmico especializado em análise de evasão escolar.
Analise os dados do aluno e forneça uma previsão de risco de evasão.
Retorne no formato JSON com: studentId (string), riskLevel (low/medium/high/critical), probability (0-1), factors (array com: factor, weight, description, currentValue, thresholdValue), recommendations (array de strings).
Retorne apenas o JSON sem markdown.`

    try {
      const response = await ai.chat({
        model: 'default',
        messages: [
          { role: 'system', content: systemPrompt },
          {
            role: 'user',
            content: `Aluno ID: ${studentId}
Taxa de frequência: ${studentData.attendanceRate}%
Média de notas: ${studentData.gradeAverage}
Faltas consecutivas: ${studentData.consecutiveAbsences}
Total de matrículas: ${studentData.totalEnrollments}
Matrículas trancadas: ${studentData.droppedEnrollments}
Semestre atual: ${studentData.semester}
Última atividade: ${studentData.lastActiveDate}

Analise o risco de evasão deste aluno.`,
          },
        ],
      })

      const content = response?.choices?.[0]?.message?.content || '{}'
      const jsonMatch = content.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]) as DropoutPrediction
      }
      return {
        studentId,
        riskLevel: 'low',
        probability: 0,
        factors: [],
        recommendations: [],
      }
    } catch (error) {
      console.error('[AI] Erro ao prever evasão:', error)
      return {
        studentId,
        riskLevel: 'low',
        probability: 0,
        factors: [],
        recommendations: ['Erro na análise de evasão. Tente novamente.'],
      }
    }
  }

  /**
   * Generates a report based on the specified type and data.
   */
  async generateReport(
    type: string,
    data: Record<string, unknown>
  ): Promise<string> {
    const systemPrompt = `Você é um assistente acadêmico especializado em geração de relatórios.
Gere um relatório detalhado e profissional baseado nos dados fornecidos.
O relatório deve ser em português (pt-BR), bem estruturado com títulos e subtítulos.`

    try {
      const response = await ai.chat({
        model: 'default',
        messages: [
          { role: 'system', content: systemPrompt },
          {
            role: 'user',
            content: `Tipo de relatório: ${type}\n\nDados:\n${JSON.stringify(data, null, 2)}\n\nGere um relatório detalhado.`,
          },
        ],
      })

      return response?.choices?.[0]?.message?.content || 'Erro ao gerar relatório.'
    } catch (error) {
      console.error('[AI] Erro ao gerar relatório:', error)
      return 'Erro ao gerar relatório. Por favor, tente novamente.'
    }
  }

  /**
   * Academic assistant that answers questions in the context of
   * a specific class, subject, or academic topic.
   */
  async academicAssistant(
    question: string,
    context: AcademicContext
  ): Promise<string> {
    const contextDescription = `
Contexto acadêmico:
- Turma: ${context.classId || 'Não especificada'}
- Disciplina: ${context.subjectName || 'Não especificada'}
- Tópico: ${context.topic || 'Não especificado'}
- Nível do aluno: ${context.studentLevel || 'Não especificado'}
- Tópicos anteriores: ${context.previousTopics?.join(', ') || 'Nenhum'}
- Idioma: ${context.language || 'Português (pt-BR)'}`

    const systemPrompt = `Você é um assistente acadêmico especializado chamado ORKESTRANDO AI.
Responda perguntas acadêmicas de forma clara, didática e precisa.
Use exemplos práticos quando relevante.
Responda em português (pt-BR) a menos que outro idioma seja especificado.
Se a pergunta não estiver relacionada ao contexto acadêmico, indique educadamente.`

    try {
      const response = await ai.chat({
        model: 'default',
        messages: [
          { role: 'system', content: systemPrompt },
          {
            role: 'user',
            content: `${contextDescription}\n\nPergunta: ${question}`,
          },
        ],
      })

      return response?.choices?.[0]?.message?.content || 'Não foi possível gerar uma resposta.'
    } catch (error) {
      console.error('[AI] Erro no assistente acadêmico:', error)
      return 'Desculpe, ocorreu um erro ao processar sua pergunta. Tente novamente.'
    }
  }

  /**
   * Analyzes attendance trends for a class and provides insights.
   * Combines deterministic analysis with AI-powered recommendations.
   */
  async analyzeAttendanceTrends(
    classId: string,
    className: string,
    attendanceData: {
      sessions: Array<{
        date: string
        totalStudents: number
        presentCount: number
        dayOfWeek: number
      }>
      studentAttendance: Array<{
        studentId: string
        studentName: string
        totalPresent: number
        totalSessions: number
        consecutiveAbsences: number
        lastAttendanceDate?: string
      }>
    }
  ): Promise<AttendanceAnalysis> {
    const totalRate =
      attendanceData.sessions.length > 0
        ? attendanceData.sessions.reduce(
            (acc, s) =>
              acc + (s.totalStudents > 0 ? s.presentCount / s.totalStudents : 0),
            0
          ) / attendanceData.sessions.length
        : 0

    // Identify at-risk students (attendance < 75%)
    const atRiskStudents = attendanceData.studentAttendance
      .filter((s) => {
        const rate = s.totalSessions > 0 ? s.totalPresent / s.totalSessions : 0
        return rate < 0.75
      })
      .map((s) => {
        const rate = s.totalSessions > 0 ? s.totalPresent / s.totalSessions : 0
        return {
          studentId: s.studentId,
          studentName: s.studentName,
          attendanceRate: Math.round(rate * 1000) / 1000,
          consecutiveAbsences: s.consecutiveAbsences,
          riskLevel:
            rate < 0.5
              ? ('high' as const)
              : rate < 0.65
                ? ('medium' as const)
                : ('low' as const),
          lastAttendanceDate: s.lastAttendanceDate,
        }
      })
      .sort((a, b) => a.attendanceRate - b.attendanceRate)

    // Day of week breakdown
    const dayMap = new Map<number, { total: number; count: number }>()
    for (const session of attendanceData.sessions) {
      const existing = dayMap.get(session.dayOfWeek) || { total: 0, count: 0 }
      existing.total +=
        session.totalStudents > 0 ? session.presentCount / session.totalStudents : 0
      existing.count += 1
      dayMap.set(session.dayOfWeek, existing)
    }

    const dayOfWeekBreakdown = Array.from(dayMap.entries()).map(
      ([dayOfWeek, data]) => ({
        dayOfWeek: dayOfWeek as 0 | 1 | 2 | 3 | 4 | 5 | 6,
        averageRate:
          data.count > 0 ? Math.round((data.total / data.count) * 1000) / 1000 : 0,
        totalSessions: data.count,
      })
    )

    // Determine trend
    let trend: 'improving' | 'stable' | 'declining' = 'stable'
    if (attendanceData.sessions.length >= 4) {
      const half = Math.floor(attendanceData.sessions.length / 2)
      const firstHalf = attendanceData.sessions.slice(0, half)
      const secondHalf = attendanceData.sessions.slice(half)
      const firstRate =
        firstHalf.reduce(
          (a, s) =>
            a + (s.totalStudents > 0 ? s.presentCount / s.totalStudents : 0),
          0
        ) / firstHalf.length
      const secondRate =
        secondHalf.reduce(
          (a, s) =>
            a + (s.totalStudents > 0 ? s.presentCount / s.totalStudents : 0),
          0
        ) / secondHalf.length
      if (secondRate > firstRate + 0.05) trend = 'improving'
      else if (secondRate < firstRate - 0.05) trend = 'declining'
    }

    // Generate recommendations using AI
    let recommendations: string[] = []
    if (atRiskStudents.length > 0) {
      try {
        const response = await ai.chat({
          model: 'default',
          messages: [
            {
              role: 'user',
              content: `Baseado nestes dados de frequência da turma "${className}":
- Taxa geral: ${(totalRate * 100).toFixed(1)}%
- Tendência: ${trend}
- Alunos em risco: ${atRiskStudents.length}
- ${atRiskStudents.slice(0, 3).map((s) => `${s.studentName}: ${(s.attendanceRate * 100).toFixed(1)}% (${s.consecutiveAbsences} faltas consecutivas)`).join('\n- ')}

Sugira 3 recomendações curtas para melhorar a frequência. Retorne apenas as recomendações em formato de lista, sem numeração ou markdown.`,
            },
          ],
        })
        const recContent = response?.choices?.[0]?.message?.content || ''
        recommendations = recContent
          .split('\n')
          .filter((r) => r.trim().length > 0)
      } catch {
        recommendations = [
          'Entre em contato individualmente com os alunos em risco.',
          'Revise o horário da turma para verificar se é adequado.',
          'Considere atividades que incentivem a presença.',
        ]
      }
    } else {
      recommendations = [
        'A frequência da turma está em bom nível. Continue monitorando.',
      ]
    }

    return {
      classId,
      className,
      overallRate: Math.round(totalRate * 1000) / 1000,
      trend,
      averagePerSession:
        attendanceData.sessions.length > 0
          ? Math.round(
              (attendanceData.sessions.reduce((a, s) => a + s.presentCount, 0) /
                attendanceData.sessions.length) *
                10
            ) / 10
          : 0,
      sessionsAnalyzed: attendanceData.sessions.length,
      atRiskStudents,
      dayOfWeekBreakdown,
      recommendations,
    }
  }
}
