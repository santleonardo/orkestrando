import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import {
  handleApiError,
  apiResponse,
  NotFoundError,
} from '@/lib/api-utils'

// ==================== GET /api/students/[id]/grades ====================

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { searchParams } = new URL(request.url)
    const semesterId = searchParams.get('semesterId')

    // Verify student exists
    const student = await db.profile.findUnique({ where: { id, role: 'STUDENT' } })
    if (!student) {
      throw new NotFoundError('Student', id)
    }

    // Get enrollments with grades
    const enrollments = await db.enrollment.findMany({
      where: {
        studentId: id,
        grade: { not: null },
        ...(semesterId ? { class: { semesterId } } : {}),
      },
      include: {
        class: {
          include: {
            subject: { select: { code: true, name: true, credits: true } },
            teacher: { select: { profile: { select: { firstName: true, lastName: true } } } },
            semester: { select: { name: true } },
          },
        },
      },
      orderBy: [{ completedAt: 'desc' }],
    })

    // Compute grade statistics
    const grades = enrollments.map((e) => e.grade!).filter((g): g is number => g !== null && g !== undefined)
    const avgGrade = grades.length > 0 ? grades.reduce((a, b) => a + b, 0) / grades.length : 0
    const maxGrade = grades.length > 0 ? Math.max(...grades) : 0
    const minGrade = grades.length > 0 ? Math.min(...grades) : 0
    const passingGrades = grades.filter((g) => g >= 5)
    const weightedSum = enrollments.reduce((sum, e) => sum + (e.grade || 0) * e.class.subject.credits, 0)
    const totalCredits = enrollments.reduce((sum, e) => sum + e.class.subject.credits, 0)
    const weightedAvg = totalCredits > 0 ? weightedSum / totalCredits : 0

    return apiResponse({
      studentId: id,
      summary: {
        totalGraded: enrollments.length,
        averageGrade: Math.round(avgGrade * 100) / 100,
        weightedAverage: Math.round(weightedAvg * 100) / 100,
        highestGrade: maxGrade,
        lowestGrade: minGrade,
        totalCredits,
        passingRate: grades.length > 0 ? Math.round((passingGrades.length / grades.length) * 100) : 0,
      },
      grades: enrollments.map((e) => ({
        enrollmentId: e.id,
        classId: e.class.id,
        classCode: e.class.code,
        className: e.class.name,
        subjectCode: e.class.subject.code,
        subjectName: e.class.subject.name,
        credits: e.class.subject.credits,
        teacherName: `${e.class.teacher?.profile?.firstName ?? ""} ${e.class.teacher?.profile?.lastName ?? ""}`.trim(),
        semesterName: e.class.semester.name,
        grade: e.grade,
        status: e.status,
        completedAt: e.completedAt,
      })),
    })
  } catch (error) {
    return handleApiError(error)
  }
}
