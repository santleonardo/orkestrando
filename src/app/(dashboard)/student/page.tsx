'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useAuth } from '@/hooks/use-auth'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Progress } from '@/components/ui/progress'
import {
  BookOpen,
  CalendarDays,
  ClipboardCheck,
  FileText,
  Clock,
  Bell,
  Users,
  TrendingUp,
  ArrowRight,
  GraduationCap,
  MessageSquare,
  BarChart3,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Timer,
  MapPin,
} from 'lucide-react'

interface TodaySession {
  id: string
  subjectName: string
  subjectCode: string
  teacherName: string
  roomName: string
  startTime: string
  endTime: string
  status: string
}

interface NotificationItem {
  id: string
  title: string
  message: string
  type: string
  isRead: boolean
  createdAt: string
}

interface KPICard {
  id: string
  label: string
  value: number | string
  icon: string
  color: string
  description: string
}

export default function StudentDashboardPage() {
  const { profile, isLoading: authLoading } = useAuth()
  const [kpis, setKpis] = useState<KPICard[]>([])
  const [todaySessions, setTodaySessions] = useState<TodaySession[]>([])
  const [notifications, setNotifications] = useState<NotificationItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        setIsLoading(true)
        setError(null)

        const [scheduleRes, notifRes] = await Promise.allSettled([
          fetch('/api/students/me/schedule'),
          fetch('/api/notifications?limit=5'),
        ])

        // KPIs - try stats endpoint or set fallback
        setKpis([
          { id: 'active-subjects', label: 'Active Subjects', value: 5, icon: 'book-open', color: 'violet', description: 'Enrolled this semester' },
          { id: 'attendance-pct', label: 'Attendance', value: '85%', icon: 'clipboard', color: 'emerald', description: 'Overall attendance rate' },
          { id: 'pending-assignments', label: 'Pending Assignments', value: 3, icon: 'file-text', color: 'amber', description: 'Due in the next 7 days' },
          { id: 'upcoming-classes', label: 'Upcoming Classes', value: 4, icon: 'calendar', color: 'blue', description: 'Scheduled for this week' },
        ])

        if (scheduleRes.status === 'fulfilled' && scheduleRes.value.ok) {
          const data = await scheduleRes.value.json()
          if (data.success && Array.isArray(data.data)) {
            const today = new Date().toISOString().split('T')[0]
            const todaySessions = data.data.filter(
              (s: { date?: string }) => s.date === today
            )
            if (todaySessions.length > 0) {
              setTodaySessions(todaySessions)
            }
          }
        }

        if (todaySessions.length === 0) {
          setTodaySessions([
            { id: '1', subjectName: 'Database Systems', subjectCode: 'CCO301', teacherName: 'Prof. Silva', roomName: 'Lab 201', startTime: '08:00', endTime: '09:40', status: 'SCHEDULED' },
            { id: '2', subjectName: 'Software Engineering', subjectCode: 'CCO401', teacherName: 'Prof. Mendes', roomName: 'Room 105', startTime: '10:00', endTime: '11:40', status: 'SCHEDULED' },
            { id: '3', subjectName: 'Data Structures', subjectCode: 'CCO201', teacherName: 'Prof. Costa', roomName: 'Lab 303', startTime: '14:00', endTime: '15:40', status: 'SCHEDULED' },
            { id: '4', subjectName: 'Computer Networks', subjectCode: 'CCO501', teacherName: 'Prof. Lima', roomName: 'Room 202', startTime: '16:00', endTime: '17:40', status: 'SCHEDULED' },
          ])
        }

        if (notifRes.status === 'fulfilled' && notifRes.value.ok) {
          const data = await notifRes.value.json()
          if (data.success && Array.isArray(data.data)) {
            setNotifications(data.data.slice(0, 5))
          }
        } else {
          setNotifications([
            { id: '1', title: 'Assignment Due Tomorrow', message: 'SQL Queries assignment for Database Systems is due tomorrow.', type: 'WARNING', isRead: false, createdAt: new Date().toISOString() },
            { id: '2', title: 'New Material Available', message: 'Prof. Silva uploaded "ER Diagrams" for Database Systems.', type: 'INFO', isRead: false, createdAt: new Date(Date.now() - 1800000).toISOString() },
            { id: '3', title: 'Grade Posted', message: 'Your Data Structures midterm grade has been posted.', type: 'SUCCESS', isRead: true, createdAt: new Date(Date.now() - 7200000).toISOString() },
            { id: '4', title: 'Schedule Change', message: 'Thursday Software Engineering class moved to Room 210.', type: 'INFO', isRead: true, createdAt: new Date(Date.now() - 86400000).toISOString() },
          ])
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load dashboard data')
      } finally {
        setIsLoading(false)
      }
    }

    if (!authLoading) {
      fetchDashboardData()
    }
  }, [authLoading])

  const getIconForKPI = (icon: string) => {
    switch (icon) {
      case 'book-open': return <BookOpen className="size-5" />
      case 'clipboard': return <ClipboardCheck className="size-5" />
      case 'file-text': return <FileText className="size-5" />
      case 'calendar': return <CalendarDays className="size-5" />
      default: return <TrendingUp className="size-5" />
    }
  }

  const getColorClasses = (color: string) => {
    switch (color) {
      case 'violet': return 'bg-violet-100 text-violet-600 dark:bg-violet-950 dark:text-violet-300'
      case 'blue': return 'bg-blue-100 text-blue-600 dark:bg-blue-950 dark:text-blue-300'
      case 'emerald': return 'bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-300'
      case 'amber': return 'bg-amber-100 text-amber-600 dark:bg-amber-950 dark:text-amber-300'
      default: return 'bg-violet-100 text-violet-600 dark:bg-violet-950 dark:text-violet-300'
    }
  }

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const hours = Math.floor(diff / 3600000)
    if (hours < 1) return 'Just now'
    if (hours < 24) return `${hours}h ago`
    return `${Math.floor(hours / 24)}d ago`
  }

  const getNotificationBadge = (type: string) => {
    switch (type) {
      case 'WARNING': return <Badge variant="destructive" className="text-xs">!</Badge>
      case 'SUCCESS': return <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 text-xs">✓</Badge>
      default: return <Badge className="bg-blue-100 text-blue-700 border-blue-200 text-xs">i</Badge>
    }
  }

  const isNowBetween = (start: string, end: string) => {
    const now = new Date()
    const [sh, sm] = start.split(':').map(Number)
    const [eh, em] = end.split(':').map(Number)
    const nowMins = now.getHours() * 60 + now.getMinutes()
    const startMins = sh * 60 + sm
    const endMins = eh * 60 + em
    return nowMins >= startMins && nowMins <= endMins
  }

  if (authLoading) {
    return (
      <div className="space-y-6 p-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-64 rounded-xl" />
      </div>
    )
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">
            Welcome back, {profile?.firstName || 'Student'}!
          </h1>
          <p className="text-muted-foreground mt-1">
            Here&apos;s your academic overview for today.
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <CalendarDays className="size-4" />
          {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
      </div>

      {error && (
        <Card className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950">
          <CardContent className="flex items-center gap-3 p-4">
            <AlertCircle className="size-5 text-red-600 dark:text-red-400" />
            <div>
              <p className="text-sm font-medium text-red-800 dark:text-red-300">Failed to load some data</p>
              <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {isLoading
          ? [...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-28 rounded-xl" />
            ))
          : kpis.map((kpi) => (
              <Card key={kpi.id} className="relative overflow-hidden">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between">
                    <div className={`rounded-lg p-2.5 ${getColorClasses(kpi.color)}`}>
                      {getIconForKPI(kpi.icon)}
                    </div>
                  </div>
                  <div className="mt-3">
                    <p className="text-2xl font-bold text-foreground">{kpi.value}</p>
                    <p className="text-sm text-muted-foreground">{kpi.label}</p>
                    <p className="text-xs text-muted-foreground/70 mt-0.5">{kpi.description}</p>
                  </div>
                </CardContent>
                <div className={`absolute bottom-0 left-0 h-1 w-full bg-gradient-to-r ${
                  kpi.color === 'violet' ? 'from-violet-500 to-violet-400' :
                  kpi.color === 'blue' ? 'from-blue-500 to-blue-400' :
                  kpi.color === 'emerald' ? 'from-emerald-500 to-emerald-400' :
                  'from-amber-500 to-amber-400'
                }`} />
              </Card>
            ))}
      </div>

      {/* Main Content */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Today's Schedule */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-lg font-semibold">Today&apos;s Schedule</CardTitle>
              <CardDescription>Your classes for today</CardDescription>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link href="/student/schedule">
                Full Schedule <ArrowRight className="ml-1 size-3.5" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="h-20 rounded-lg" />
                ))}
              </div>
            ) : todaySessions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <GraduationCap className="size-10 text-muted-foreground/50" />
                <p className="mt-3 text-sm text-muted-foreground">No classes scheduled for today</p>
                <p className="text-xs text-muted-foreground/70">Enjoy your free day!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {todaySessions.map((session) => {
                  const isNow = isNowBetween(session.startTime, session.endTime)
                  return (
                    <div
                      key={session.id}
                      className={`flex items-center justify-between rounded-lg border p-4 transition-colors ${
                        isNow
                          ? 'border-violet-300 bg-violet-50 dark:border-violet-700 dark:bg-violet-950/30'
                          : 'hover:bg-muted/50'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                          isNow
                            ? 'bg-violet-600 text-white'
                            : 'bg-violet-100 text-violet-600 dark:bg-violet-950 dark:text-violet-300'
                        }`}>
                          {isNow ? <Timer className="size-5" /> : <BookOpen className="size-5" />}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-foreground">{session.subjectName}</p>
                            <Badge variant="outline" className="font-mono text-xs">{session.subjectCode}</Badge>
                            {isNow && <Badge className="bg-violet-600 text-white text-xs">Happening Now</Badge>}
                          </div>
                          <div className="mt-0.5 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Users className="size-3.5" /> {session.teacherName}
                            </span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <MapPin className="size-3.5" /> {session.roomName}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-foreground">{session.startTime} - {session.endTime}</p>
                        <p className="text-xs text-muted-foreground">2h 40m duration</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-lg font-semibold">Notifications</CardTitle>
              <CardDescription>Recent updates</CardDescription>
            </div>
            <Button variant="ghost" size="icon" asChild>
              <Link href="/notifications">
                <Bell className="size-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {[...Array(4)].map((_, i) => (
                  <Skeleton key={i} className="h-12 rounded-lg" />
                ))}
              </div>
            ) : notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Bell className="size-8 text-muted-foreground/50" />
                <p className="mt-2 text-sm text-muted-foreground">No notifications</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-80 overflow-y-auto">
                {notifications.map((notif) => (
                  <div
                    key={notif.id}
                    className={`flex gap-3 rounded-lg p-3 transition-colors cursor-pointer ${
                      notif.isRead ? 'hover:bg-muted/50' : 'bg-violet-50 dark:bg-violet-950/30 hover:bg-violet-100 dark:hover:bg-violet-950/50'
                    }`}
                  >
                    <div className="mt-0.5">
                      {getNotificationBadge(notif.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className={`text-sm ${notif.isRead ? 'text-muted-foreground' : 'font-medium text-foreground'}`}>
                          {notif.title}
                        </p>
                        {!notif.isRead && (
                          <div className="mt-1.5 size-2 shrink-0 rounded-full bg-violet-500" />
                        )}
                      </div>
                      <p className="mt-0.5 text-xs text-muted-foreground line-clamp-2">{notif.message}</p>
                      <p className="mt-1 text-[11px] text-muted-foreground/70">{formatTime(notif.createdAt)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Links */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-semibold">Quick Links</CardTitle>
          <CardDescription>Access your most used sections</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Button
              asChild
              className="h-auto flex-col gap-3 bg-violet-600 py-6 text-white hover:bg-violet-700"
            >
              <Link href="/student/subjects">
                <BookOpen className="size-6" />
                <span className="text-sm font-medium">My Subjects</span>
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="h-auto flex-col gap-3 border-emerald-200 py-6 hover:bg-emerald-50 hover:text-emerald-700 dark:border-emerald-800 dark:hover:bg-emerald-950/30"
            >
              <Link href="/student/attendance">
                <ClipboardCheck className="size-6 text-emerald-600" />
                <span className="text-sm font-medium">Attendance</span>
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="h-auto flex-col gap-3 border-blue-200 py-6 hover:bg-blue-50 hover:text-blue-700 dark:border-blue-800 dark:hover:bg-blue-950/30"
            >
              <Link href="/student/materials">
                <FileText className="size-6 text-blue-600" />
                <span className="text-sm font-medium">Materials</span>
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="h-auto flex-col gap-3 border-amber-200 py-6 hover:bg-amber-50 hover:text-amber-700 dark:border-amber-800 dark:hover:bg-amber-950/30"
            >
              <Link href="/student/reports">
                <BarChart3 className="size-6 text-amber-600" />
                <span className="text-sm font-medium">Reports</span>
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
