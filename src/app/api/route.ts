import { NextResponse } from 'next/server'
import type { ApiResponse, DashboardStats, UpcomingClass } from '@/lib/types'
import { getStore, enrichClass, getProfile } from '@/lib/supabase/data-store'

// GET /api - Dashboard stats & overview
export async function GET() {
  try {
    const store = getStore()
    const today = new Date().toISOString().split('T')[0]

    const totalStudents = store.students.filter((s) => s.isActive).length
    const totalTeachers = store.teachers.filter((t) => t.isActive).length
    const totalClasses = store.classes.filter((c) => c.status === 'active').length
    const totalCourses = store.courses.filter((c) => c.isActive).length

    // Active sessions today
    const todaySessions = store.sessions.filter(
      (s) => s.date === today && s.status !== 'cancelled'
    )
    const activeSessions = todaySessions.length

    // Today's attendance rate
    const todayAttendance = store.attendance.filter((a) =>
      todaySessions.some((s) => s.id === a.sessionId)
    )
    const todayPresent = todayAttendance.filter(
      (a) => a.status === 'present' || a.status === 'late'
    ).length
    const todayAttendanceRate = todayAttendance.length > 0
      ? Math.round((todayPresent / todayAttendance.length) * 1000) / 10
      : 0

    // Pending alerts (notifications not read)
    const pendingAlerts = store.notifications.filter((n) => !n.isRead).length

    // Upcoming classes (next 5 sessions)
    const upcomingSessions = store.sessions
      .filter((s) => s.date >= today && s.status === 'scheduled')
      .sort((a, b) => a.date.localeCompare(b.date) || a.startTime.localeCompare(b.startTime))
      .slice(0, 5)

    const upcomingClasses: UpcomingClass[] = upcomingSessions.map((session) => {
      const cls = store.classes.find((c) => c.id === session.classId)
      const teacher = store.teachers.find((t) => t.id === session.teacherId)
      const room = store.rooms.find((r) => r.id === session.roomId)
      const subject = cls ? store.subjects.find((s) => s.id === cls.subjectId) : null
      const teacherProfile = teacher ? getProfile(teacher.profileId) : null

      return {
        id: session.id,
        className: cls?.name || 'N/A',
        subjectName: subject?.name || 'N/A',
        teacherName: teacherProfile?.fullName || 'N/A',
        roomName: room?.name || 'N/A',
        startTime: session.startTime,
        endTime: session.endTime,
        date: session.date,
      }
    })

    const stats: DashboardStats = {
      totalStudents,
      totalTeachers,
      totalClasses,
      totalCourses,
      activeSessions,
      todayAttendanceRate,
      pendingAlerts,
      upcomingClasses,
    }

    return NextResponse.json<ApiResponse<DashboardStats>>({
      success: true,
      data: stats,
    })
  } catch (error) {
    console.error('[API] GET error:', error)
    return NextResponse.json<ApiResponse>(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Erro interno do servidor' } },
      { status: 500 }
    )
  }
}
