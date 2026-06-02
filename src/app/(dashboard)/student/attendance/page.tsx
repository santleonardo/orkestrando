'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Progress } from '@/components/ui/progress'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  ClipboardCheck,
  Calendar,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  BookOpen,
  BarChart3,
  Filter,
  Target,
  CalendarDays,
  User,
} from 'lucide-react'

interface AttendanceRecord {
  id: string
  date: string
  subjectName: string
  subjectCode: string
  teacherName: string
  status: 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED'
  notes: string
}

interface SubjectAttendance {
  subjectId: string
  subjectCode: string
  subjectName: string
  totalSessions: number
  present: number
  absent: number
  late: number
  excused: number
  percentage: number
}

interface CalendarDay {
  date: string
  day: number
  month: number
  isCurrentMonth: boolean
  hasAttendance: boolean
  allPresent: boolean
  hasAbsence: boolean
  sessions: AttendanceRecord[]
}

const STATUS_CONFIG: Record<string, { label: string; badgeClass: string; icon: React.ElementType }> = {
  PRESENT: { label: 'Present', badgeClass: 'bg-emerald-100 text-emerald-700 border-emerald-200', icon: CheckCircle2 },
  ABSENT: { label: 'Absent', badgeClass: 'bg-red-100 text-red-700 border-red-200', icon: XCircle },
  LATE: { label: 'Late', badgeClass: 'bg-amber-100 text-amber-700 border-amber-200', icon: Clock },
  EXCUSED: { label: 'Excused', badgeClass: 'bg-blue-100 text-blue-700 border-blue-200', icon: CheckCircle2 },
}

export default function StudentAttendancePage() {
  const { profile } = useAuth()
  const [records, setRecords] = useState<AttendanceRecord[]>([])
  const [subjectAttendance, setSubjectAttendance] = useState<SubjectAttendance[]>([])
  const [overallPercentage, setOverallPercentage] = useState(0)
  const [subjects, setSubjects] = useState<{ id: string; code: string; name: string }[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Filters
  const [subjectFilter, setSubjectFilter] = useState<string>('all')
  const [view, setView] = useState<'table' | 'calendar'>('table')

  // Calendar state
  const [calendarMonth, setCalendarMonth] = useState(new Date().getMonth())
  const [calendarYear, setCalendarYear] = useState(new Date().getFullYear())

  useEffect(() => {
    async function fetchData() {
      try {
        setIsLoading(true)
        setError(null)

        const res = await fetch('/api/students/me/attendance')
        if (res.ok) {
          const data = await res.json()
          if (data.success && data.data) {
            if (data.data.records) setRecords(data.data.records)
            if (data.data.subjects) setSubjectAttendance(data.data.subjects)
            if (data.data.overallPercentage !== undefined) setOverallPercentage(data.data.overallPercentage)
          }
        }

        // Demo data fallback
        setRecords([
          { id: 'a1', date: '2025-06-16', subjectName: 'Database Systems', subjectCode: 'CCO301', teacherName: 'Prof. Silva', status: 'PRESENT', notes: '' },
          { id: 'a2', date: '2025-06-16', subjectName: 'Software Engineering', subjectCode: 'CCO401', teacherName: 'Prof. Mendes', status: 'PRESENT', notes: '' },
          { id: 'a3', date: '2025-06-15', subjectName: 'Database Systems', subjectCode: 'CCO301', teacherName: 'Prof. Silva', status: 'LATE', notes: 'Arrived 15 min late - traffic' },
          { id: 'a4', date: '2025-06-14', subjectName: 'Data Structures', subjectCode: 'CCO201', teacherName: 'Prof. Costa', status: 'PRESENT', notes: '' },
          { id: 'a5', date: '2025-06-13', subjectName: 'Software Engineering', subjectCode: 'CCO401', teacherName: 'Prof. Mendes', status: 'ABSENT', notes: 'Medical certificate provided' },
          { id: 'a6', date: '2025-06-12', subjectName: 'Database Systems', subjectCode: 'CCO301', teacherName: 'Prof. Silva', status: 'PRESENT', notes: '' },
          { id: 'a7', date: '2025-06-11', subjectName: 'Computer Networks', subjectCode: 'CCO501', teacherName: 'Prof. Lima', status: 'PRESENT', notes: '' },
          { id: 'a8', date: '2025-06-10', subjectName: 'AI Fundamentals', subjectCode: 'CCO601', teacherName: 'Prof. Santos', status: 'EXCUSED', notes: 'University event' },
          { id: 'a9', date: '2025-06-09', subjectName: 'Data Structures', subjectCode: 'CCO201', teacherName: 'Prof. Costa', status: 'PRESENT', notes: '' },
          { id: 'a10', date: '2025-06-06', subjectName: 'Database Systems', subjectCode: 'CCO301', teacherName: 'Prof. Silva', status: 'PRESENT', notes: '' },
          { id: 'a11', date: '2025-06-05', subjectName: 'Software Engineering', subjectCode: 'CCO401', teacherName: 'Prof. Mendes', status: 'PRESENT', notes: '' },
          { id: 'a12', date: '2025-06-04', subjectName: 'Computer Networks', subjectCode: 'CCO501', teacherName: 'Prof. Lima', status: 'ABSENT', notes: '' },
          { id: 'a13', date: '2025-06-03', subjectName: 'AI Fundamentals', subjectCode: 'CCO601', teacherName: 'Prof. Santos', status: 'PRESENT', notes: '' },
        ])
        setOverallPercentage(85)
        setSubjectAttendance([
          { subjectId: 's1', subjectCode: 'CCO301', subjectName: 'Database Systems', totalSessions: 24, present: 21, absent: 1, late: 1, excused: 1, percentage: 88 },
          { subjectId: 's2', subjectCode: 'CCO401', subjectName: 'Software Engineering', totalSessions: 20, present: 18, absent: 1, late: 0, excused: 1, percentage: 92 },
          { subjectId: 's3', subjectCode: 'CCO201', subjectName: 'Data Structures', totalSessions: 22, present: 17, absent: 3, late: 2, excused: 0, percentage: 75 },
          { subjectId: 's4', subjectCode: 'CCO501', subjectName: 'Computer Networks', totalSessions: 22, present: 18, absent: 3, late: 1, excused: 0, percentage: 82 },
          { subjectId: 's5', subjectCode: 'CCO601', subjectName: 'AI Fundamentals', totalSessions: 16, present: 15, absent: 0, late: 0, excused: 1, percentage: 95 },
        ])

        // Derive subject options
        const subjMap = new Map<string, { id: string; code: string; name: string }>()
        records.forEach((r) => {
          if (!subjMap.has(r.subjectCode)) {
            subjMap.set(r.subjectCode, { id: r.subjectCode, code: r.subjectCode, name: r.subjectName })
          }
        })
        setSubjects(Array.from(subjMap.values()))
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load attendance')
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  const filteredRecords = subjectFilter === 'all'
    ? records
    : records.filter((r) => r.subjectCode === subjectFilter)

  const filteredSubjectAttendance = subjectFilter === 'all'
    ? subjectAttendance
    : subjectAttendance.filter((s) => s.subjectCode === subjectFilter)

  // Calendar generation
  const generateCalendarDays = (): CalendarDay[] => {
    const days: CalendarDay[] = []
    const firstDay = new Date(calendarYear, calendarMonth, 1)
    const lastDay = new Date(calendarYear, calendarMonth + 1, 0)
    const startPadding = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1

    for (let i = 0; i < startPadding; i++) {
      const d = new Date(calendarYear, calendarMonth, -startPadding + 1 + i)
      days.push({ date: d.toISOString().split('T')[0], day: d.getDate(), month: d.getMonth(), isCurrentMonth: false, hasAttendance: false, allPresent: false, hasAbsence: false, sessions: [] })
    }

    for (let day = 1; day <= lastDay.getDate(); day++) {
      const dateStr = `${calendarYear}-${String(calendarMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
      const dayRecords = records.filter((r) => r.date === dateStr)
      const hasAttendance = dayRecords.length > 0
      const allPresent = hasAttendance && dayRecords.every((r) => r.status === 'PRESENT' || r.status === 'EXCUSED')
      const hasAbsence = hasAttendance && dayRecords.some((r) => r.status === 'ABSENT')

      days.push({
        date: dateStr,
        day,
        month: calendarMonth,
        isCurrentMonth: true,
        hasAttendance,
        allPresent,
        hasAbsence,
        sessions: dayRecords,
      })
    }

    const remaining = 42 - days.length
    for (let i = 1; i <= remaining; i++) {
      const d = new Date(calendarYear, calendarMonth + 1, i)
      days.push({ date: d.toISOString().split('T')[0], day: d.getDate(), month: d.getMonth(), isCurrentMonth: false, hasAttendance: false, allPresent: false, hasAbsence: false, sessions: [] })
    }

    return days
  }

  const getStatusBadge = (status: string) => {
    const config = STATUS_CONFIG[status]
    if (!config) return <Badge variant="outline">{status}</Badge>
    const Icon = config.icon
    return (
      <Badge className={`${config.badgeClass} text-xs`}>
        <Icon className="mr-0.5 size-3" />
        {config.label}
      </Badge>
    )
  }

  const getPercentageColor = (pct: number) => {
    if (pct >= 80) return 'text-emerald-600'
    if (pct >= 60) return 'text-amber-600'
    return 'text-red-600'
  }

  const prevMonth = () => {
    if (calendarMonth === 0) {
      setCalendarMonth(11)
      setCalendarYear(calendarYear - 1)
    } else {
      setCalendarMonth(calendarMonth - 1)
    }
  }

  const nextMonth = () => {
    if (calendarMonth === 11) {
      setCalendarMonth(0)
      setCalendarYear(calendarYear + 1)
    } else {
      setCalendarMonth(calendarMonth + 1)
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6 p-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-4 sm:grid-cols-3">
          {[...Array(3)].map((_, i) => (
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
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">My Attendance</h1>
          <p className="text-muted-foreground mt-1">Track your attendance history and statistics</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={subjectFilter} onValueChange={setSubjectFilter}>
            <SelectTrigger className="w-52">
              <SelectValue placeholder="All Subjects" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Subjects</SelectItem>
              {subjects.map((s) => (
                <SelectItem key={s.id} value={s.id}>{s.code} - {s.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="flex rounded-md border">
            <Button
              variant={view === 'table' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setView('table')}
              className={`rounded-r-none ${view === 'table' ? 'bg-violet-600 text-white hover:bg-violet-700' : ''}`}
            >
              <Table className="size-3.5" /> Table
            </Button>
            <Button
              variant={view === 'calendar' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setView('calendar')}
              className={`rounded-l-none ${view === 'calendar' ? 'bg-violet-600 text-white hover:bg-violet-700' : ''}`}
            >
              <CalendarDays className="size-3.5" /> Calendar
            </Button>
          </div>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-300">
          <AlertTriangle className="size-4 shrink-0" />
          {error}
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div className="rounded-lg bg-violet-100 p-2.5 text-violet-600 dark:bg-violet-950 dark:text-violet-300">
                <Target className="size-5" />
              </div>
            </div>
            <p className={`mt-3 text-3xl font-bold ${getPercentageColor(overallPercentage)}`}>
              {overallPercentage}%
            </p>
            <p className="text-sm text-muted-foreground">Overall Attendance</p>
            <Progress value={overallPercentage} className="mt-2 h-2 [&>div]:bg-violet-500" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div className="rounded-lg bg-emerald-100 p-2.5 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-300">
                <CheckCircle2 className="size-5" />
              </div>
            </div>
            <p className="mt-3 text-3xl font-bold text-foreground">
              {records.filter((r) => r.status === 'PRESENT').length}
            </p>
            <p className="text-sm text-muted-foreground">Classes Present</p>
            <p className="text-xs text-muted-foreground/70 mt-1">
              out of {records.length} total sessions
            </p>
          </CardContent>
        </Card>
        <Card className="sm:col-span-2 lg:col-span-1">
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div className="rounded-lg bg-red-100 p-2.5 text-red-600 dark:bg-red-950 dark:text-red-300">
                <XCircle className="size-5" />
              </div>
            </div>
            <p className="mt-3 text-3xl font-bold text-foreground">
              {records.filter((r) => r.status === 'ABSENT').length}
            </p>
            <p className="text-sm text-muted-foreground">Classes Absent</p>
            <p className="text-xs text-muted-foreground/70 mt-1">
              {records.filter((r) => r.status === 'LATE').length} late arrivals
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Per-Subject Attendance */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-semibold">Attendance by Subject</CardTitle>
          <CardDescription>Your attendance rate for each enrolled subject</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {filteredSubjectAttendance.map((subject) => (
              <div key={subject.subjectCode} className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="font-mono text-xs">{subject.subjectCode}</Badge>
                    <span className="text-sm font-medium text-foreground">{subject.subjectName}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <span className="text-muted-foreground">
                      {subject.present}/{subject.totalSessions}
                    </span>
                    <span className={`font-bold ${getPercentageColor(subject.percentage)}`}>
                      {subject.percentage}%
                    </span>
                  </div>
                </div>
                <Progress
                  value={subject.percentage}
                  className={`h-2 ${
                    subject.percentage >= 80 ? '[&>div]:bg-emerald-500' :
                    subject.percentage >= 60 ? '[&>div]:bg-amber-500' : '[&>div]:bg-red-500'
                  }`}
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Table or Calendar View */}
      {view === 'table' ? (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-semibold">Attendance History</CardTitle>
            <CardDescription>Detailed record of your attendance</CardDescription>
          </CardHeader>
          <CardContent>
            {filteredRecords.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <ClipboardCheck className="size-10 text-muted-foreground/50" />
                <p className="mt-3 text-sm text-muted-foreground">No attendance records found</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>Teacher</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Notes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRecords.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="size-3.5 text-muted-foreground" />
                          {new Date(record.date + 'T12:00:00').toLocaleDateString('en-US', {
                            month: 'short', day: 'numeric', year: 'numeric'
                          })}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5">
                          <Badge variant="outline" className="font-mono text-xs">{record.subjectCode}</Badge>
                          <span className="text-sm">{record.subjectName}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">{record.teacherName}</TableCell>
                      <TableCell>{getStatusBadge(record.status)}</TableCell>
                      <TableCell className="max-w-48 text-sm text-muted-foreground truncate">{record.notes || '—'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold">Attendance Calendar</CardTitle>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" className="size-8" onClick={prevMonth}>
                  ←
                </Button>
                <span className="text-sm font-medium w-32 text-center">
                  {new Date(calendarYear, calendarMonth).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </span>
                <Button variant="ghost" size="icon" className="size-8" onClick={nextMonth}>
                  →
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* Legend */}
            <div className="mb-3 flex flex-wrap items-center gap-3 text-xs">
              <div className="flex items-center gap-1.5">
                <div className="size-3 rounded-sm bg-emerald-400" />
                <span className="text-muted-foreground">All Present</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="size-3 rounded-sm bg-red-400" />
                <span className="text-muted-foreground">Has Absence</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="size-3 rounded-sm bg-amber-400" />
                <span className="text-muted-foreground">Late</span>
              </div>
            </div>
            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-px rounded-lg border bg-border overflow-hidden">
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d) => (
                <div key={d} className="bg-muted p-2 text-center text-xs font-medium text-muted-foreground">
                  {d}
                </div>
              ))}
              {generateCalendarDays().map((day, idx) => {
                const bgColor = !day.isCurrentMonth ? 'bg-background' :
                  day.allPresent ? 'bg-emerald-50 dark:bg-emerald-950/20' :
                  day.hasAbsence ? 'bg-red-50 dark:bg-red-950/20' :
                  day.hasAttendance ? 'bg-amber-50 dark:bg-amber-950/20' :
                  'bg-background'

                return (
                  <div
                    key={idx}
                    className={`${bgColor} p-2 min-h-[60px] ${!day.isCurrentMonth ? 'opacity-40' : ''}`}
                  >
                    <span className={`text-xs font-medium ${
                      !day.isCurrentMonth ? 'text-muted-foreground/50' : 'text-foreground'
                    }`}>
                      {day.day}
                    </span>
                    {day.hasAttendance && day.sessions.length > 0 && (
                      <div className="mt-0.5 space-y-0.5">
                        {day.sessions.slice(0, 2).map((s, i) => (
                          <div
                            key={i}
                            className={`text-[10px] leading-tight truncate rounded px-0.5 ${
                              s.status === 'PRESENT' ? 'text-emerald-700 dark:text-emerald-400' :
                              s.status === 'ABSENT' ? 'text-red-700 dark:text-red-400' :
                              s.status === 'LATE' ? 'text-amber-700 dark:text-amber-400' :
                              'text-blue-700 dark:text-blue-400'
                            }`}
                          >
                            {s.subjectCode}
                          </div>
                        ))}
                        {day.sessions.length > 2 && (
                          <p className="text-[9px] text-muted-foreground">+{day.sessions.length - 2}</p>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
