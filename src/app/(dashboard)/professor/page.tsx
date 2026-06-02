'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useAuth } from '@/hooks/use-auth'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  BookOpen,
  CalendarDays,
  Users,
  ClipboardCheck,
  Clock,
  Bell,
  Upload,
  MessageSquare,
  Plus,
  TrendingUp,
  ArrowRight,
  GraduationCap,
  FileText,
} from 'lucide-react'

interface KPICard {
  id: string
  label: string
  value: number | string
  change?: number
  changeType?: 'positive' | 'negative' | 'neutral'
  icon: string
  color: string
}

interface Session {
  id: string
  subject: string
  subjectCode: string
  room: string
  startTime: string
  endTime: string
  status: string
  studentsCount: number
}

interface NotificationItem {
  id: string
  title: string
  message: string
  type: string
  isRead: boolean
  createdAt: string
}

export default function ProfessorDashboardPage() {
  const { profile, isLoading: authLoading } = useAuth()
  const [kpis, setKpis] = useState<KPICard[]>([])
  const [upcomingSessions, setUpcomingSessions] = useState<Session[]>([])
  const [notifications, setNotifications] = useState<NotificationItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        setIsLoading(true)
        setError(null)

        const [statsRes, sessionsRes, notificationsRes] = await Promise.allSettled([
          fetch('/api/teachers/me/stats'),
          fetch('/api/classes?upcoming=true'),
          fetch('/api/notifications?limit=5'),
        ])

        if (statsRes.status === 'fulfilled' && statsRes.value.ok) {
          const statsData = await statsRes.value.json()
          if (statsData.success && statsData.data) {
            setKpis([
              {
                id: 'total-classes',
                label: 'Total Classes',
                value: statsData.data.totalClasses ?? 0,
                change: statsData.data.classesChange,
                changeType: statsData.data.classesChange >= 0 ? 'positive' : 'negative',
                icon: 'book-open',
                color: 'violet',
              },
              {
                id: 'week-sessions',
                label: 'This Week Sessions',
                value: statsData.data.weekSessions ?? 0,
                icon: 'calendar',
                color: 'blue',
              },
              {
                id: 'students-count',
                label: 'Students Count',
                value: statsData.data.totalStudents ?? 0,
                change: statsData.data.studentsChange,
                changeType: statsData.data.studentsChange >= 0 ? 'positive' : 'negative',
                icon: 'users',
                color: 'emerald',
              },
              {
                id: 'pending-attendance',
                label: 'Pending Attendance',
                value: statsData.data.pendingAttendance ?? 0,
                icon: 'clipboard',
                color: 'amber',
              },
            ])
          }
        } else {
          // Fallback demo data
          setKpis([
            { id: 'total-classes', label: 'Total Classes', value: 6, change: 2, changeType: 'positive', icon: 'book-open', color: 'violet' },
            { id: 'week-sessions', label: 'This Week Sessions', value: 12, icon: 'calendar', color: 'blue' },
            { id: 'students-count', label: 'Students Count', value: 187, change: 12, changeType: 'positive', icon: 'users', color: 'emerald' },
            { id: 'pending-attendance', label: 'Pending Attendance', value: 3, icon: 'clipboard', color: 'amber' },
          ])
        }

        if (sessionsRes.status === 'fulfilled' && sessionsRes.value.ok) {
          const sessionsData = await sessionsRes.value.json()
          if (sessionsData.success && sessionsData.data) {
            setUpcomingSessions(
              (Array.isArray(sessionsData.data) ? sessionsData.data : []).slice(0, 5)
            )
          }
        } else {
          setUpcomingSessions([
            { id: '1', subject: 'Database Systems', subjectCode: 'CCO301', room: 'Lab 201', startTime: '08:00', endTime: '09:40', status: 'SCHEDULED', studentsCount: 35 },
            { id: '2', subject: 'Software Engineering', subjectCode: 'CCO401', room: 'Room 105', startTime: '10:00', endTime: '11:40', status: 'SCHEDULED', studentsCount: 28 },
            { id: '3', subject: 'Data Structures', subjectCode: 'CCO201', room: 'Lab 303', startTime: '14:00', endTime: '15:40', status: 'SCHEDULED', studentsCount: 42 },
          ])
        }

        if (notificationsRes.status === 'fulfilled' && notificationsRes.value.ok) {
          const notifData = await notificationsRes.value.json()
          if (notifData.success && notifData.data) {
            setNotifications(
              (Array.isArray(notifData.data) ? notifData.data : []).slice(0, 5)
            )
          }
        } else {
          setNotifications([
            { id: '1', title: 'Schedule Updated', message: 'Your Monday schedule has been updated by the coordinator.', type: 'INFO', isRead: false, createdAt: new Date().toISOString() },
            { id: '2', title: 'New Assignment Submitted', message: '15 students submitted assignments for Database Systems.', type: 'SUCCESS', isRead: false, createdAt: new Date(Date.now() - 3600000).toISOString() },
            { id: '3', title: 'Attendance Reminder', message: 'You have 2 sessions with pending attendance.', type: 'WARNING', isRead: true, createdAt: new Date(Date.now() - 7200000).toISOString() },
            { id: '4', title: 'Material Published', message: 'Your uploaded material "SQL Basics" is now live.', type: 'INFO', isRead: true, createdAt: new Date(Date.now() - 86400000).toISOString() },
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
      case 'calendar': return <CalendarDays className="size-5" />
      case 'users': return <Users className="size-5" />
      case 'clipboard': return <ClipboardCheck className="size-5" />
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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'IN_PROGRESS': return <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">In Progress</Badge>
      case 'COMPLETED': return <Badge variant="secondary">Completed</Badge>
      case 'CANCELLED': return <Badge variant="destructive">Cancelled</Badge>
      default: return <Badge className="bg-violet-100 text-violet-700 border-violet-200">Scheduled</Badge>
    }
  }

  const getNotificationBadge = (type: string) => {
    switch (type) {
      case 'WARNING': return <Badge variant="destructive">!</Badge>
      case 'SUCCESS': return <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">✓</Badge>
      case 'ERROR': return <Badge variant="destructive">✗</Badge>
      default: return <Badge className="bg-blue-100 text-blue-700 border-blue-200">i</Badge>
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
            Welcome back, {profile?.firstName || 'Professor'}!
          </h1>
          <p className="text-muted-foreground mt-1">
            Here&apos;s what&apos;s happening with your classes today.
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <CalendarDays className="size-4" />
          {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
      </div>

      {/* Error */}
      {error && (
        <Card className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950">
          <CardContent className="flex items-center gap-3 p-4">
            <div className="text-red-600 dark:text-red-400">
              <Bell className="size-5" />
            </div>
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
                    {kpi.change !== undefined && (
                      <span
                        className={`text-xs font-medium ${
                          kpi.changeType === 'positive'
                            ? 'text-emerald-600'
                            : kpi.changeType === 'negative'
                              ? 'text-red-600'
                              : 'text-muted-foreground'
                        }`}
                      >
                        {kpi.changeType === 'positive' ? '+' : ''}{kpi.change}%
                      </span>
                    )}
                  </div>
                  <div className="mt-3">
                    <p className="text-2xl font-bold text-foreground">{kpi.value}</p>
                    <p className="text-sm text-muted-foreground">{kpi.label}</p>
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

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Upcoming Sessions - takes 2 columns */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-lg font-semibold">Upcoming Sessions</CardTitle>
              <CardDescription>Your classes for today and this week</CardDescription>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link href="/professor/classes">
                View All <ArrowRight className="ml-1 size-3.5" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="h-16 rounded-lg" />
                ))}
              </div>
            ) : upcomingSessions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Clock className="size-10 text-muted-foreground/50" />
                <p className="mt-3 text-sm text-muted-foreground">No upcoming sessions</p>
                <p className="text-xs text-muted-foreground/70">Enjoy your free time!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {upcomingSessions.map((session) => (
                  <div
                    key={session.id}
                    className="flex items-center justify-between rounded-lg border border-border/50 bg-muted/30 p-4 transition-colors hover:bg-muted/60"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-100 text-violet-600 dark:bg-violet-950 dark:text-violet-300">
                        <BookOpen className="size-5" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{session.subject}</p>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <span className="font-mono text-xs">{session.subjectCode}</span>
                          <span>•</span>
                          <span>{session.room}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="text-sm font-medium text-foreground">{session.startTime} - {session.endTime}</p>
                        <p className="text-xs text-muted-foreground">{session.studentsCount} students</p>
                      </div>
                      {getStatusBadge(session.status)}
                    </div>
                  </div>
                ))}
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
              <ScrollArea className="max-h-80">
                <div className="space-y-2">
                  {notifications.map((notif) => (
                    <div
                      key={notif.id}
                      className={`flex gap-3 rounded-lg p-3 transition-colors ${
                        notif.isRead ? 'bg-transparent' : 'bg-violet-50 dark:bg-violet-950/30'
                      } hover:bg-muted/60 cursor-pointer`}
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
              </ScrollArea>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-semibold">Quick Actions</CardTitle>
          <CardDescription>Common tasks at your fingertips</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Button
              asChild
              className="h-auto flex-col gap-3 bg-violet-600 py-6 text-white hover:bg-violet-700"
            >
              <Link href="/professor/materials">
                <Upload className="size-6" />
                <span className="text-sm font-medium">Upload Material</span>
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="h-auto flex-col gap-3 border-violet-200 py-6 hover:bg-violet-50 hover:text-violet-700 dark:border-violet-800 dark:hover:bg-violet-950/30"
            >
              <Link href="/professor/attendance">
                <ClipboardCheck className="size-6 text-violet-600" />
                <span className="text-sm font-medium">Open Attendance</span>
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="h-auto flex-col gap-3 border-blue-200 py-6 hover:bg-blue-50 hover:text-blue-700 dark:border-blue-800 dark:hover:bg-blue-950/30"
            >
              <Link href="/professor/messages">
                <MessageSquare className="size-6 text-blue-600" />
                <span className="text-sm font-medium">Messages</span>
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="h-auto flex-col gap-3 border-emerald-200 py-6 hover:bg-emerald-50 hover:text-emerald-700 dark:border-emerald-800 dark:hover:bg-emerald-950/30"
            >
              <Link href="/professor/reports">
                <FileText className="size-6 text-emerald-600" />
                <span className="text-sm font-medium">Reports</span>
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function ScrollArea({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={`overflow-y-auto ${className || ''}`}>{children}</div>
}
