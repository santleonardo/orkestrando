import { NextRequest } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db'
import {
  parseBody,
  handleApiError,
  apiResponse,
} from '@/lib/api-utils'

// ==================== POST /api/ai/evasion ====================

export async function POST(request: NextRequest) {
  try {
    const body = await parseBody(request, z.object({
      classId: z.string().optional(),
      studentId: z.string().optional(),
      semesterId: z.string().optional(),
    }))

    // PLACEHOLDER: In production, integrate with ML model for evasion prediction
    // For now, use heuristics based on attendance patterns

    const where: Record<string, unknown> = {
      status: 'ACTIVE',
    }
    if (body.semesterId) where.class = { ...where.class, semesterId: body.semesterId }
    if (body.studentId) where.studentId = body.studentId
    if (body.classId) where.classId = body.classId

    const enrollments = await db.enrollment.findMany({
      where,
      include: {
        student: {
          select: { id: true, registrationNumber: true, user: { select: { name: true, email: true } } },
        },
        class: {
          select: {
            id: true, code: true, name: true,
            subject: { select: { code: true, name: true } },
            sessions: { select: { id: true } },
          },
        },
        attendance: {
          orderBy: { createdAt: 'asc' },
          include: {
            classSession: { select: { date: true, startTime: true } },
          },
        },
      },
    })

    const predictions: Array<{
      studentId: string
      studentName: string
      classId: string
      classCode: string
      riskLevel: 'HIGH' | 'MEDIUM' | 'LOW'
      riskScore: number
      factors: string[]
      recommendation: string
    }> = []

    for (const enrollment of enrollments) {
      const attendance = enrollment.attendance
      if (attendance.length < 3) continue // Need minimum data for prediction

      const totalSessions = attendance.length
      const absentCount = attendance.filter((a) => a.status === 'ABSENT').length
      const lateCount = attendance.filter((a) => a.status === 'LATE').length
      const excusedCount = attendance.filter((a) => a.status === 'EXCUSED').length

      const absenceRate = absentCount / totalSessions
      const lateRate = lateCount / totalSessions

      // Check for increasing absence trend (last 3 sessions vs first 3)
      const recentSessions = attendance.slice(-3)
      const recentAbsentRate = recentSessions.filter((a) => a.status === 'ABSENT').length / recentSessions.length

      const factors: string[] = []
      let riskScore = 0

      if (absenceRate > 0.3) {
        riskScore += 40
        factors.push(`High absence rate (${Math.round(absenceRate * 100)}%)`)
      } else if (absenceRate > 0.15) {
        riskScore += 20
        factors.push(`Moderate absence rate (${Math.round(absenceRate * 100)}%)`)
      }

      if (recentAbsentRate > 0.5) {
        riskScore += 30
        factors.push('Recent increase in absences')
      }

      if (lateRate > 0.2) {
        riskScore += 15
        factors.push(`Frequent tardiness (${Math.round(lateRate * 100)}%)`)
      }

      if (excusedCount > totalSessions * 0.15) {
        riskScore += 10
        factors.push('High number of excused absences')
      }

      // Check consecutive absences at the end
      const lastRecords = attendance.slice(-5)
      let consecutiveAbsent = 0
      for (let i = lastRecords.length - 1; i >= 0; i--) {
        if (lastRecords[i].status === 'ABSENT') consecutiveAbsent++
        else break
      }
      if (consecutiveAbsent >= 2) {
        riskScore += 25
        factors.push(`${consecutiveAbsent} consecutive absences`)
      }

      riskScore = Math.min(100, riskScore)

      const riskLevel = riskScore >= 70 ? 'HIGH' : riskScore >= 40 ? 'MEDIUM' : 'LOW'

      if (riskLevel !== 'LOW') {
        predictions.push({
          studentId: enrollment.studentId,
          studentName: enrollment.student?.user?.name ?? "",
          classId: enrollment.class.id,
          classCode: enrollment.class.code,
          riskLevel,
          riskScore,
          factors,
          recommendation: riskLevel === 'HIGH'
            ? 'URGENT: Contact student immediately. Consider intervention measures.'
            : 'Monitor attendance closely. Consider early intervention if pattern continues.',
        })
      }
    }

    // Sort by risk score descending
    predictions.sort((a, b) => b.riskScore - a.riskScore)

    return apiResponse({
      predictions,
      summary: {
        totalAnalyzed: enrollments.length,
        atRisk: predictions.length,
        highRisk: predictions.filter((p) => p.riskLevel === 'HIGH').length,
        mediumRisk: predictions.filter((p) => p.riskLevel === 'MEDIUM').length,
      },
      analyzedAt: new Date().toISOString(),
      note: 'AI-powered evasion prediction will be enhanced with ML models trained on historical data',
    })
  } catch (error) {
    return handleApiError(error)
  }
}
