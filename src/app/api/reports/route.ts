import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAuth, AuthError } from '@/lib/get-user'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')
    const page = Number(searchParams.get('page')) || 1
    const limit = Number(searchParams.get('limit')) || 50

    const where: Record<string, unknown> = {}
    if (type) where.type = type

    const [reports, total] = await Promise.all([
      db.report.findMany({
        where,
        include: {
          generator: { select: { id: true, name: true, email: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.report.count({ where }),
    ])

    return NextResponse.json({
      data: reports,
      meta: { total, page, limit, pages: Math.ceil(total / limit) },
    })
  } catch (error) {
    console.error('Error fetching reports:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request)

    const body = await request.json()
    const { type, parameters } = body

    if (!type) {
      return NextResponse.json({ error: 'Report type is required' }, { status: 400 })
    }

    let data: string = ''
    let title = ''

    switch (type) {
      case 'hours': {
        title = 'Relatório de Horas'
        const teacherId = parameters?.teacherId
        const semesterId = parameters?.semesterId

        const lessons = await db.lesson.findMany({
          where: {
            ...(teacherId && { teacherId }),
            ...(semesterId && { class: { semesterId } }),
            status: { in: ['COMPLETED', 'SCHEDULED'] },
          },
          include: {
            teacher: { select: { name: true } },
            class: {
              include: {
                discipline: { select: { name: true, code: true } },
                semester: { select: { name: true } },
              },
            },
          },
        })

        // Calculate hours
        const teacherHours: Record<string, { name: string; totalMinutes: number; lessonCount: number }> = {}
        for (const lesson of lessons) {
          const [startH, startM] = lesson.startTime.split(':').map(Number)
          const [endH, endM] = lesson.endTime.split(':').map(Number)
          const minutes = (endH * 60 + endM) - (startH * 60 + startM)

          if (!teacherHours[lesson.teacherId]) {
            teacherHours[lesson.teacherId] = { name: lesson.teacher.name, totalMinutes: 0, lessonCount: 0 }
          }
          teacherHours[lesson.teacherId].totalMinutes += minutes
          teacherHours[lesson.teacherId].lessonCount += 1
        }

        data = JSON.stringify({
          summary: Object.values(teacherHours).map((t) => ({
            name: t.name,
            totalHours: (t.totalMinutes / 60).toFixed(1),
            lessonCount: t.lessonCount,
          })),
        })
        break
      }

      case 'attendance': {
        title = 'Relatório de Frequência'
        const classId = parameters?.classId
        const studentId = parameters?.studentId

        const attendance = await db.attendance.findMany({
          where: {
            ...(classId && { lesson: { classId } }),
            ...(studentId && { studentId }),
          },
          include: {
            student: { select: { name: true } },
            lesson: {
              include: { class: { select: { name: true } } },
            },
          },
        })

        const total = attendance.length
        const present = attendance.filter((a) => a.status === 'PRESENT').length
        const absent = attendance.filter((a) => a.status === 'ABSENT').length
        const late = attendance.filter((a) => a.status === 'LATE').length
        const justified = attendance.filter((a) => a.status === 'JUSTIFIED').length

        data = JSON.stringify({
          summary: { total, present, absent, late, justified },
          rate: total > 0 ? ((present + late) / total * 100).toFixed(1) + '%' : 'N/A',
        })
        break
      }

      case 'dropout': {
        title = 'Relatório de Evasão'
        const enrollments = await db.enrollment.findMany({
          where: { status: { not: 'active' } },
          include: {
            student: { select: { name: true, email: true } },
            class: {
              include: {
                discipline: { select: { name: true } },
              },
            },
          },
        })

        data = JSON.stringify({
          totalDropouts: enrollments.length,
          details: enrollments.map((e) => ({
            student: e.student.name,
            class: e.class.name,
            status: e.status,
            enrolledAt: e.enrolledAt,
          })),
        })
        break
      }

      case 'room_usage': {
        title = 'Relatório de Uso de Salas'
        const rooms = await db.room.findMany({
          include: {
            _count: { select: { lessons: true } },
          },
        })

        data = JSON.stringify({
          rooms: rooms.map((r) => ({
            name: r.name,
            code: r.code,
            capacity: r.capacity,
            totalLessons: r._count.lessons,
          })),
        })
        break
      }

      case 'teacher_usage': {
        title = 'Relatório de Professores'
        const teachers = await db.user.findMany({
          where: { role: 'TEACHER' },
          include: {
            _count: {
              select: {
                teacherClasses: true,
                lessonsTaught: true,
                teacherAvailabilities: true,
              },
            },
          },
        })

        data = JSON.stringify({
          teachers: teachers.map((t) => ({
            name: t.name,
            email: t.email,
            activeClasses: t._count.teacherClasses,
            totalLessons: t._count.lessonsTaught,
            availabilities: t._count.teacherAvailabilities,
          })),
        })
        break
      }

      case 'academic': {
        title = 'Relatório Acadêmico Geral'
        const [
          totalStudents,
          totalTeachers,
          totalClasses,
          totalCourses,
          totalDisciplines,
        ] = await Promise.all([
          db.user.count({ where: { role: 'STUDENT', isActive: true } }),
          db.user.count({ where: { role: 'TEACHER', isActive: true } }),
          db.class.count({ where: { isActive: true } }),
          db.course.count({ where: { isActive: true } }),
          db.discipline.count({ where: { isActive: true } }),
        ])

        data = JSON.stringify({
          summary: {
            totalStudents,
            totalTeachers,
            totalClasses,
            totalCourses,
            totalDisciplines,
          },
        })
        break
      }

      default:
        return NextResponse.json({ error: 'Unknown report type' }, { status: 400 })
    }

    const report = await db.report.create({
      data: {
        title,
        type,
        data,
        generatedBy: user.id,
        parameters: parameters ? JSON.stringify(parameters) : undefined,
      },
    })

    return NextResponse.json({ data: report }, { status: 201 })
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }
    console.error('Error generating report:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
