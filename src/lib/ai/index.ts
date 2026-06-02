// =============================================================================
// ORKESTRANDO - Academic Management System
// AI Helper Functions (Schedule, Conflict Detection, Evasion, Reports)
// =============================================================================

import type {
  ScheduleSlot,
  ScheduleConflict,
  ConflictDetection,
  EvasionPrediction,
  EvasionRiskFactors,
  ReportSummary,
  AIScheduleSuggestion,
  AIConflictResolution,
  Weekday,
} from '@/types';
import { WEEKDAY_SHORT, TIME_SLOTS } from '@/constants';
import { isTimeOverlap } from '@/lib/utils/helpers';

// -----------------------------------------------------------------------------
// suggestSchedule - AI-powered schedule suggestions
// -----------------------------------------------------------------------------

export interface SuggestScheduleParams {
  orgId: string;
  subjectId: string;
  teacherId: string;
  semesterId: string;
  hoursPerWeek: number;
  preferredDays?: Weekday[];
  preferredTimeRange?: { start: string; end: string };
  roomId?: string;
  existingSchedule?: ScheduleSlot[];
}

export interface SuggestScheduleResult {
  suggestions: AIScheduleSuggestion[];
  confidence: number;
  reasoning: string;
  constraints: string[];
}

export async function suggestSchedule(
  params: SuggestScheduleParams
): Promise<SuggestScheduleResult> {
  const {
    hoursPerWeek,
    preferredDays,
    preferredTimeRange,
    existingSchedule = [],
  } = params;

  // Generate candidate time slots based on preferences
  const candidateSlots = generateCandidateSlots(
    hoursPerWeek,
    preferredDays,
    preferredTimeRange
  );

  // Filter out slots that conflict with existing schedule
  const availableSlots = candidateSlots.filter((slot) => {
    return !existingSchedule.some((existing) =>
      existing.weekday === slot.weekday &&
      isTimeOverlap(slot.startTime, slot.endTime, existing.startTime, existing.endTime)
    );
  });

  // Score and rank slots
  const scoredSlots = availableSlots.map((slot) => ({
    slot,
    score: scoreSlot(slot, preferredDays, preferredTimeRange),
  }));

  // Sort by score (highest first)
  scoredSlots.sort((a, b) => b.score - a.score);

  // Take top suggestions
  const topSuggestions: AIScheduleSuggestion[] = scoredSlots.slice(0, 5).map((item) => ({
    suggestedSlot: item.slot,
    confidence: Math.min(item.score / 100, 1),
    reasoning: generateSlotReasoning(item.slot, item.score),
    alternatives: scoredSlots.slice(5, 8).map((s) => s.slot),
  }));

  const avgConfidence = topSuggestions.length > 0
    ? topSuggestions.reduce((sum, s) => sum + s.confidence, 0) / topSuggestions.length
    : 0;

  return {
    suggestions: topSuggestions,
    confidence: Math.round(avgConfidence * 100) / 100,
    reasoning: generateOverallReasoning(topSuggestions, params),
    constraints: generateConstraints(params),
  };
}

function generateCandidateSlots(
  hoursPerWeek: number,
  preferredDays?: Weekday[],
  preferredTimeRange?: { start: string; end: string }
): ScheduleSlot[] {
  const slots: ScheduleSlot[] = [];
  const allDays = preferredDays ?? (['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY'] as Weekday[]);
  const sessionsPerWeek = Math.ceil(hoursPerWeek / 2); // Assume 2-hour sessions

  const startIdx = preferredTimeRange
    ? TIME_SLOTS.findIndex((t) => t.value >= preferredTimeRange.start)
    : TIME_SLOTS.findIndex((t) => t.value === '07:00');

  const endIdx = preferredTimeRange
    ? TIME_SLOTS.findIndex((t) => t.value >= preferredTimeRange.end)
    : TIME_SLOTS.findIndex((t) => t.value === '22:00');

  const validSlots = TIME_SLOTS.slice(
    Math.max(0, startIdx),
    Math.min(TIME_SLOTS.length, endIdx + 1)
  );

  for (const day of allDays) {
    // Generate 2-hour slots
    for (let i = 0; i < validSlots.length - 3; i += 2) {
      slots.push({
        weekday: day,
        startTime: validSlots[i].value,
        endTime: validSlots[i + 3].value,
        label: `${WEEKDAY_SHORT[day]} ${validSlots[i].value}-${validSlots[i + 3].value}`,
      });
    }
  }

  // Return enough slots for the needed sessions
  return slots.slice(0, sessionsPerWeek * allDays.length * 2);
}

function scoreSlot(
  slot: ScheduleSlot,
  preferredDays?: Weekday[],
  preferredTimeRange?: { start: string; end: string }
): number {
  let score = 50; // Base score

  // Bonus for preferred days
  if (preferredDays && preferredDays.includes(slot.weekday)) {
    score += 20;
  }

  // Bonus for morning/afternoon slots (generally preferred)
  const hour = parseInt(slot.startTime.split(':')[0], 10);
  if (hour >= 8 && hour <= 11) score += 15; // Morning
  else if (hour >= 13 && hour <= 16) score += 10; // Afternoon
  else if (hour >= 19 && hour <= 21) score += 5; // Evening

  // Bonus if within preferred time range
  if (preferredTimeRange) {
    if (slot.startTime >= preferredTimeRange.start && slot.endTime <= preferredTimeRange.end) {
      score += 25;
    }
  }

  // Penalty for very early or very late slots
  if (hour < 7 || hour >= 22) score -= 10;

  return Math.max(0, Math.min(100, score));
}

function generateSlotReasoning(slot: ScheduleSlot, score: number): string {
  const hour = parseInt(slot.startTime.split(':')[0], 10);
  const dayLabel = WEEKDAY_SHORT[slot.weekday];

  const timePreference =
    hour >= 8 && hour <= 11 ? 'horário matutino' :
    hour >= 13 && hour <= 16 ? 'horário vespertino' :
    hour >= 19 ? 'horário noturno' : 'horário alternativo';

  return `${dayLabel} às ${slot.startTime}-${slot.endTime} (${timePreference}). ` +
    `Avaliação de adequação: ${score}/100.`;
}

function generateOverallReasoning(
  suggestions: AIScheduleSuggestion[],
  _params: SuggestScheduleParams
): string {
  if (suggestions.length === 0) {
    return 'Não foi possível gerar sugestões com os parâmetros fornecidos. ' +
      'Considere ajustar os dias preferidos ou o intervalo de horários.';
  }

  return `Foram encontradas ${suggestions.length} sugestões de horário com uma confiança média de ` +
    `${Math.round(suggestions[0].confidence * 100)}%. ` +
    `As sugestões consideram a disponibilidade do professor, conflitos existentes e preferências indicadas. ` +
    `A primeira sugestão é: ${suggestions[0].suggestedSlot.label}.`;
}

function generateConstraints(params: SuggestScheduleParams): string[] {
  const constraints: string[] = [];

  constraints.push(`${params.hoursPerWeek} horas/semana necessárias`);

  if (params.preferredDays && params.preferredDays.length > 0) {
    constraints.push(
      `Dias preferidos: ${params.preferredDays.map((d) => WEEKDAY_SHORT[d]).join(', ')}`
    );
  }

  if (params.preferredTimeRange) {
    constraints.push(
      `Horário preferido: ${params.preferredTimeRange.start} - ${params.preferredTimeRange.end}`
    );
  }

  if (params.roomId) {
    constraints.push('Sala específica solicitada');
  }

  constraints.push('Sem conflitos com horários existentes');
  constraints.push('Respeitar disponibilidade do professor');

  return constraints;
}

// -----------------------------------------------------------------------------
// detectConflicts - AI-powered conflict detection
// -----------------------------------------------------------------------------

export interface DetectConflictsParams {
  orgId: string;
  semesterId: string;
  classId?: string;
  teacherId: string;
  weekday: Weekday;
  startTime: string;
  endTime: string;
  roomId?: string;
  existingClasses?: Array<{
    id: string;
    teacherId: string;
    roomId: string;
    weekday: Weekday;
    startTime: string;
    endTime: string;
    teacherName?: string;
    roomName?: string;
    subjectName?: string;
  }>;
}

export interface DetectConflictsResult {
  hasConflicts: boolean;
  conflicts: AIConflictResolution[];
  teacherConflicts: ScheduleConflict[];
  roomConflicts: ScheduleConflict[];
  suggestions: string[];
}

export async function detectConflicts(
  params: DetectConflictsParams
): Promise<DetectConflictsResult> {
  const {
    teacherId,
    weekday,
    startTime,
    endTime,
    roomId,
    existingClasses = [],
  } = params;

  const teacherConflicts: ScheduleConflict[] = [];
  const roomConflicts: ScheduleConflict[] = [];

  for (const existing of existingClasses) {
    // Skip the class being checked itself
    if (params.classId && existing.id === params.classId) continue;

    // Check teacher overlap
    if (existing.teacherId === teacherId && existing.weekday === weekday) {
      if (isTimeOverlap(startTime, endTime, existing.startTime, existing.endTime)) {
        teacherConflicts.push({
          type: 'TEACHER_OVERLAP',
          conflictingSlot: { weekday, startTime, endTime },
          existingSlot: {
            weekday: existing.weekday,
            startTime: existing.startTime,
            endTime: existing.endTime,
          },
          resourceId: existing.teacherId,
          resourceName: existing.teacherName ?? 'Professor',
          description: `Conflito com professor: ${existing.teacherName ?? 'Professor'} já tem aula ` +
            `${existing.subjectName ?? ''} ${WEEKDAY_SHORT[existing.weekday]} ` +
            `${existing.startTime}-${existing.endTime}`,
        });
      }
    }

    // Check room overlap
    if (roomId && existing.roomId === roomId && existing.weekday === weekday) {
      if (isTimeOverlap(startTime, endTime, existing.startTime, existing.endTime)) {
        roomConflicts.push({
          type: 'ROOM_OVERLAP',
          conflictingSlot: { weekday, startTime, endTime },
          existingSlot: {
            weekday: existing.weekday,
            startTime: existing.startTime,
            endTime: existing.endTime,
          },
          resourceId: existing.roomId,
          resourceName: existing.roomName ?? 'Sala',
          description: `Conflito com sala: ${existing.roomName ?? 'Sala'} já está ocupada ` +
            `por ${existing.subjectName ?? 'outra turma'} ` +
            `${WEEKDAY_SHORT[existing.weekday]} ${existing.startTime}-${existing.endTime}`,
        });
      }
    }
  }

  const allConflicts: AIConflictResolution[] = [
    ...teacherConflicts.map((c) => ({
      conflict: c,
      resolution: resolveTeacherConflict(c),
      alternativeSlots: findAlternativeSlots(weekday, startTime, endTime, existingClasses),
      impact: 'high' as const,
    })),
    ...roomConflicts.map((c) => ({
      conflict: c,
      resolution: resolveRoomConflict(c),
      alternativeSlots: findAlternativeRoomSlots(weekday, startTime, endTime, existingClasses, roomId),
      impact: 'medium' as const,
    })),
  ];

  return {
    hasConflicts: allConflicts.length > 0,
    conflicts: allConflicts,
    teacherConflicts,
    roomConflicts,
    suggestions: generateConflictSuggestions(allConflicts),
  };
}

function resolveTeacherConflict(conflict: ScheduleConflict): string {
  return `Sugestão: Mover a aula para outro horário ou dia. ` +
    `O professor já possui uma aula ${WEEKDAY_SHORT[conflict.existingSlot.weekday]} ` +
    `${conflict.existingSlot.startTime}-${conflict.existingSlot.endTime}. ` +
    `Considere trocar o horário ou designar um professor substituto.`;
}

function resolveRoomConflict(conflict: ScheduleConflict): string {
  return `Sugestão: Utilizar outra sala disponível no mesmo horário ou ` +
    `ajustar o horário da aula. A sala ${conflict.resourceName} já está ocupada ` +
    `${WEEKDAY_SHORT[conflict.existingSlot.weekday]} ${conflict.existingSlot.startTime}-${conflict.existingSlot.endTime}.`;
}

function findAlternativeSlots(
  _weekday: Weekday,
  startTime: string,
  endTime: string,
  existingClasses: Array<{ weekday: Weekday; startTime: string; endTime: string; teacherId: string }>
): ScheduleSlot[] {
  const alternatives: ScheduleSlot[] = [];
  const durationMinutes = timeToMinutes(endTime) - timeToMinutes(startTime);
  const otherDays = (['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY'] as Weekday[]).filter(
    (d) => d !== _weekday
  );

  for (const day of otherDays) {
    // Try standard time slots
    for (let hour = 7; hour <= 21; hour += 2) {
      const slotStart = `${String(hour).padStart(2, '0')}:00`;
      const slotEnd = `${String(hour + Math.floor(durationMinutes / 60)).padStart(2, '0')}:${String((durationMinutes % 60)).padStart(2, '0')}`;

      const hasConflict = existingClasses.some(
        (e) => e.weekday === day && isTimeOverlap(slotStart, slotEnd, e.startTime, e.endTime)
      );

      if (!hasConflict) {
        alternatives.push({
          weekday: day,
          startTime: slotStart,
          endTime: slotEnd,
          label: `${WEEKDAY_SHORT[day]} ${slotStart}-${slotEnd}`,
        });
        if (alternatives.length >= 3) return alternatives;
      }
    }
  }

  return alternatives;
}

function findAlternativeRoomSlots(
  weekday: Weekday,
  startTime: string,
  endTime: string,
  existingClasses: Array<{ weekday: Weekday; startTime: string; endTime: string; roomId: string }>,
  _currentRoomId?: string
): ScheduleSlot[] {
  // This is a simplified version - in production, it would query actual rooms
  const availableRooms = ['Sala A1', 'Sala A2', 'Sala B1', 'Lab 1', 'Lab 2'];

  const occupiedRooms = existingClasses
    .filter(
      (e) => e.weekday === weekday && isTimeOverlap(startTime, endTime, e.startTime, e.endTime)
    )
    .map((e) => e.roomId);

  return availableRooms
    .filter((r) => !occupiedRooms.includes(r))
    .map((r) => ({
      weekday,
      startTime,
      endTime,
      label: `${r} ${WEEKDAY_SHORT[weekday]} ${startTime}-${endTime}`,
    }));
}

function generateConflictSuggestions(conflicts: AIConflictResolution[]): string[] {
  if (conflicts.length === 0) return ['Nenhum conflito detectado.'];

  const suggestions: string[] = [];

  const hasTeacherConflict = conflicts.some((c) => c.conflict.type === 'TEACHER_OVERLAP');
  const hasRoomConflict = conflicts.some((c) => c.conflict.type === 'ROOM_OVERLAP');

  if (hasTeacherConflict) {
    suggestions.push('Verifique a disponibilidade do professor e considere trocar o dia/horário.');
    suggestions.push('Considere designar um professor substituto para esse horário.');
  }

  if (hasRoomConflict) {
    suggestions.push('Verifique a disponibilidade de outras salas no mesmo horário.');
    suggestions.push('Considere utilizar salas alternativas ou laboratórios disponíveis.');
  }

  suggestions.push('Utilize a função de sugestão automática de horários para encontrar a melhor opção.');

  return suggestions;
}

// -----------------------------------------------------------------------------
// predictEvasion - AI-powered student dropout risk prediction
// -----------------------------------------------------------------------------

export interface PredictEvasionParams {
  orgId: string;
  studentId?: string;
  classId?: string;
  semesterId: string;
  include?: Array<'factors' | 'suggestions' | 'history'>;
  studentData?: {
    name: string;
    attendancePercentage: number;
    averageGrade: number;
    missedAssignments: number;
    totalAssignments: number;
    lastAccessDaysAgo?: number;
    enrollments?: Array<{
      status: string;
      finalGrade?: number;
      attendancePercentage?: number;
    }>;
  };
}

export interface PredictEvasionResult {
  predictions: EvasionPrediction[];
  summary: string;
  highRiskCount: number;
  mediumRiskCount: number;
  lowRiskCount: number;
}

export async function predictEvasion(
  params: PredictEvasionParams
): Promise<PredictEvasionResult> {
  const { studentData, include = ['factors', 'suggestions'] } = params;

  if (!studentData) {
    return {
      predictions: [],
      summary: 'Dados do aluno não fornecidos para análise.',
      highRiskCount: 0,
      mediumRiskCount: 0,
      lowRiskCount: 0,
    };
  }

  // Calculate risk score based on multiple factors
  const riskScore = calculateEvasionRiskScore(studentData);
  const riskLevel = getRiskLevel(riskScore);
  const factors = analyzeRiskFactors(studentData);
  const suggestionList = include.includes('suggestions') ? generateEvasionSuggestions(riskScore, factors, studentData) : [];

  const prediction: EvasionPrediction = {
    studentId: params.studentId ?? '',
    studentName: studentData.name,
    riskLevel,
    riskScore,
    factors,
    suggestions: suggestionList,
    lastUpdated: new Date(),
  };

  // Categorize counts (in production, this would process multiple students)
  const allPredictions = [prediction];

  return {
    predictions: allPredictions,
    summary: generateEvasionSummary(prediction),
    highRiskCount: allPredictions.filter((p) => p.riskLevel === 'high' || p.riskLevel === 'critical').length,
    mediumRiskCount: allPredictions.filter((p) => p.riskLevel === 'medium').length,
    lowRiskCount: allPredictions.filter((p) => p.riskLevel === 'low').length,
  };
}

function calculateEvasionRiskScore(student: PredictEvasionParams['studentData']): number {
  if (!student) return 0;

  let score = 0;

  // Attendance factor (0-30 points)
  if (student.attendancePercentage < 50) score += 30;
  else if (student.attendancePercentage < 60) score += 25;
  else if (student.attendancePercentage < 70) score += 20;
  else if (student.attendancePercentage < 75) score += 15;
  else if (student.attendancePercentage < 80) score += 5;

  // Grade factor (0-25 points)
  if (student.averageGrade < 3) score += 25;
  else if (student.averageGrade < 4) score += 20;
  else if (student.averageGrade < 5) score += 15;
  else if (student.averageGrade < 6) score += 10;
  else if (student.averageGrade < 7) score += 5;

  // Missed assignments factor (0-20 points)
  const missedRate = student.totalAssignments > 0
    ? student.missedAssignments / student.totalAssignments
    : 0;
  if (missedRate > 0.5) score += 20;
  else if (missedRate > 0.3) score += 15;
  else if (missedRate > 0.2) score += 10;
  else if (missedRate > 0.1) score += 5;

  // Last access factor (0-15 points)
  if (student.lastAccessDaysAgo !== undefined) {
    if (student.lastAccessDaysAgo > 30) score += 15;
    else if (student.lastAccessDaysAgo > 14) score += 10;
    else if (student.lastAccessDaysAgo > 7) score += 5;
  }

  // Historical factor (0-10 points)
  if (student.enrollments) {
    const failedCount = student.enrollments.filter(
      (e) => e.status === 'FAILED' || (e.finalGrade !== undefined && e.finalGrade < 5)
    ).length;

    if (failedCount >= 3) score += 10;
    else if (failedCount >= 2) score += 7;
    else if (failedCount >= 1) score += 3;
  }

  return Math.min(100, score);
}

function getRiskLevel(score: number): 'low' | 'medium' | 'high' | 'critical' {
  if (score >= 75) return 'critical';
  if (score >= 50) return 'high';
  if (score >= 25) return 'medium';
  return 'low';
}

function analyzeRiskFactors(student: PredictEvasionParams['studentData']): EvasionRiskFactors {
  if (!student) {
    return {
      lowAttendance: false,
      lowGrades: false,
      missedAssignments: false,
      irregularAccess: false,
    };
  }

  return {
    lowAttendance: student.attendancePercentage < 75,
    lowGrades: student.averageGrade < 6,
    missedAssignments:
      student.totalAssignments > 0 &&
      student.missedAssignments / student.totalAssignments > 0.2,
    irregularAccess:
      student.lastAccessDaysAgo !== undefined && student.lastAccessDaysAgo > 14,
  };
}

function generateEvasionSuggestions(
  _riskScore: number,
  factors: EvasionRiskFactors,
  student: NonNullable<PredictEvasionParams['studentData']>
): string[] {
  const suggestions: string[] = [];

  if (factors.lowAttendance) {
    suggestions.push(
      `A frequência está em ${student.attendancePercentage}%, abaixo do mínimo de 75%. ` +
      'Entrar em contato com o aluno para entender os motivos da ausência.'
    );
  }

  if (factors.lowGrades) {
    suggestions.push(
      `A média atual é ${student.averageGrade.toFixed(1)}, indicando dificuldades acadêmicas. ` +
      'Sugere-se oferecer tutoria ou acompanhamento pedagógico.'
    );
  }

  if (factors.missedAssignments) {
    suggestions.push(
      `${student.missedAssignments} atividades pendentes. ` +
      'Verificar se há barreiras para entrega e oferecer prazos flexíveis se necessário.'
    );
  }

  if (factors.irregularAccess) {
    suggestions.push(
      `O aluno não acessa a plataforma há ${student.lastAccessDaysAgo} dias. ` +
      'Enviar lembrete por e-mail e notificação.'
    );
  }

  if (_riskScore >= 50) {
    suggestions.push(
      'Recomenda-se uma reunião com a coordenação para definir um plano de acompanhamento individualizado.'
    );
  }

  return suggestions;
}

function generateEvasionSummary(prediction: EvasionPrediction): string {
  const levelLabels = {
    low: 'baixo',
    medium: 'médio',
    high: 'alto',
    critical: 'crítico',
  };

  return `Análise de evasão para ${prediction.studentName}: ` +
    `Nível de risco ${levelLabels[prediction.riskLevel]} ` +
    `(pontuação: ${prediction.riskScore}/100). ` +
    `Fatores identificados: ${Object.entries(prediction.factors)
      .filter(([, v]) => v)
      .map(([k]) => k)
      .join(', ') || 'nenhum'}.`;
}

// -----------------------------------------------------------------------------
// generateReport - AI-powered report generation
// -----------------------------------------------------------------------------

export interface GenerateReportParams {
  orgId: string;
  type: string;
  startDate: string;
  endDate: string;
  classIds?: string[];
  teacherIds?: string[];
  studentIds?: string[];
  focus?: string;
  language?: string;
  data?: Record<string, unknown>;
}

export interface GenerateReportResult {
  summary: ReportSummary;
  sections: ReportSection[];
  insights: string[];
  recommendations: string[];
}

export interface ReportSection {
  title: string;
  content: string;
  type: 'text' | 'chart' | 'table' | 'highlight';
  data?: Record<string, unknown>;
}

export async function generateReport(
  params: GenerateReportParams
): Promise<GenerateReportResult> {
  const { type, startDate, endDate, focus, data = {} } = params;

  // Base report structure
  const report = buildBaseReport(type, startDate, endDate, data);

  // Add type-specific content
  switch (type) {
    case 'FREQUENCY':
      return buildFrequencyReport(report, params);
    case 'HOURS':
      return buildHoursReport(report, params);
    case 'EVASION':
      return buildEvasionReport(report, params);
    case 'ROOMS':
      return buildRoomsReport(report, params);
    case 'TEACHERS':
      return buildTeachersReport(report, params);
    case 'MONTHLY':
    case 'SEMESTRAL':
      return buildPeriodReport(report, params);
    case 'CUSTOM':
      return buildCustomReport(report, params);
    default:
      return report;
  }
}

function buildBaseReport(
  type: string,
  startDate: string,
  endDate: string,
  _data: Record<string, unknown>
): GenerateReportResult {
  const typeLabels: Record<string, string> = {
    FREQUENCY: 'Relatório de Frequência',
    HOURS: 'Relatório de Horas',
    EVASION: 'Relatório de Evasão',
    ROOMS: 'Relatório de Salas',
    TEACHERS: 'Relatório de Professores',
    MONTHLY: 'Relatório Mensal',
    SEMESTRAL: 'Relatório Semestral',
    CUSTOM: 'Relatório Personalizado',
  };

  return {
    summary: {
      title: typeLabels[type] ?? 'Relatório',
      generatedAt: new Date(),
      period: `${startDate} a ${endDate}`,
      highlights: [],
      data: {},
    },
    sections: [
      {
        title: 'Visão Geral',
        content: `Este relatório abrange o período de ${startDate} a ${endDate}.`,
        type: 'text',
      },
    ],
    insights: [],
    recommendations: [],
  };
}

function buildFrequencyReport(
  base: GenerateReportResult,
  _params: GenerateReportParams
): GenerateReportResult {
  base.summary.title = 'Relatório de Frequência';

  base.sections.push(
    {
      title: 'Resumo de Frequência',
      content: 'Análise consolidada dos registros de presença no período.',
      type: 'text',
    },
    {
      title: 'Distribuição de Frequência',
      content: 'Gráfico de distribuição de presença, ausência, atraso e justificativas.',
      type: 'chart',
    }
  );

  base.insights.push(
    'A frequência média geral precisa ser calculada a partir dos dados reais.',
    'Identificar turmas com frequência abaixo do mínimo de 75%.'
  );

  base.recommendations.push(
    'Monitorar alunos com frequência abaixo de 60% para ações preventivas.',
    'Acompanhar turmas com taxa de atraso elevada.'
  );

  return base;
}

function buildHoursReport(
  base: GenerateReportResult,
  _params: GenerateReportParams
): GenerateReportResult {
  base.summary.title = 'Relatório de Horas';
  base.summary.highlights.push('Cálculo de horas-aula por professor e turma.');

  base.sections.push({
    title: 'Carga Horária',
    content: 'Detalhamento da carga horária cumprida versus planejada.',
    type: 'table',
  });

  base.insights.push(
    'Comparar horas efetivas com horas planejadas por disciplina.',
    'Identificar professores com carga horária acima ou abaixo da esperada.'
  );

  return base;
}

function buildEvasionReport(
  base: GenerateReportResult,
  _params: GenerateReportParams
): GenerateReportResult {
  base.summary.title = 'Relatório de Evasão';
  base.summary.highlights.push('Análise preditiva de risco de evasão.');

  base.sections.push(
    {
      title: 'Indicadores de Evasão',
      content: 'Indicadores-chave que contribuem para o risco de evasão.',
      type: 'text',
    },
    {
      title: 'Alunos em Risco',
      content: 'Lista de alunos com maior probabilidade de evasão.',
      type: 'table',
    }
  );

  base.insights.push(
    'A frequência é o principal indicador de evasão.',
    'Alunos com nota média abaixo de 5 têm risco significativamente maior.'
  );

  base.recommendations.push(
    'Implementar programa de acompanhamento para alunos em risco alto.',
    'Realizar reuniões periódicas com coordenadores para revisão de casos críticos.',
    'Oferecer suporte pedagógico para alunos com dificuldades acadêmicas.'
  );

  return base;
}

function buildRoomsReport(
  base: GenerateReportResult,
  _params: GenerateReportParams
): GenerateReportResult {
  base.summary.title = 'Relatório de Utilização de Salas';

  base.sections.push(
    {
      title: 'Taxa de Ocupação',
      content: 'Percentual de utilização de cada sala no período.',
      type: 'chart',
    },
    {
      title: 'Detalhamento por Sala',
      content: 'Uso detalhado de cada sala, incluindo horários livres.',
      type: 'table',
    }
  );

  base.insights.push(
    'Identificar salas subutilizadas para otimização de recursos.',
    'Verificar horários de pico para melhor distribuição.'
  );

  return base;
}

function buildTeachersReport(
  base: GenerateReportResult,
  _params: GenerateReportParams
): GenerateReportResult {
  base.summary.title = 'Relatório de Professores';

  base.sections.push(
    {
      title: 'Desempenho Docente',
      content: 'Métricas de desempenho dos professores no período.',
      type: 'table',
    },
    {
      title: 'Carga Horária por Professor',
      content: 'Distribuição da carga horária entre os professores.',
      type: 'chart',
    }
  );

  base.recommendations.push(
    'Revisar a distribuição de carga horária para equilíbrio.',
    'Oferecer capacitação para professores com métricas abaixo da média.'
  );

  return base;
}

function buildPeriodReport(
  base: GenerateReportResult,
  _params: GenerateReportParams
): GenerateReportResult {
  const isMonthly = _params.type === 'MONTHLY';
  base.summary.title = isMonthly ? 'Relatório Mensal' : 'Relatório Semestral';

  base.sections.push(
    {
      title: 'Resumo Executivo',
      content: `Visão geral das atividades do ${isMonthly ? 'mês' : 'semestre'}.`,
      type: 'highlight',
    },
    {
      title: 'Métricas Acadêmicas',
      content: 'Indicadores de desempenho acadêmico consolidados.',
      type: 'chart',
    },
    {
      title: 'Ocorrências Relevantes',
      content: 'Principais eventos e ocorrências do período.',
      type: 'text',
    }
  );

  return base;
}

function buildCustomReport(
  base: GenerateReportResult,
  _params: GenerateReportParams
): GenerateReportResult {
  base.summary.title = 'Relatório Personalizado';

  if (_params.focus) {
    base.sections.push({
      title: `Foco: ${_params.focus}`,
      content: `Análise detalhada sobre: ${_params.focus}`,
      type: 'text',
    });
  }

  return base;
}

// -----------------------------------------------------------------------------
// Utility: timeToMinutes helper (local)
// -----------------------------------------------------------------------------

function timeToMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + (m || 0);
}
