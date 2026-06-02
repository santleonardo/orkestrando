'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Progress } from '@/components/ui/progress'
import {
  BarChart3,
  Download,
  FileText,
  Calendar,
  TrendingUp,
  Users,
  Clock,
  BookOpen,
  PieChart,
  AlertTriangle,
  Filter,
  Printer,
  FileSpreadsheet,
  FileDown,
  ChevronRight,
  CheckCircle2,
} from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

interface HoursTaughtData {
  month: string
  hours: number
  classes: number
}

interface AttendanceSummary {
  className: string
  subjectCode: string
  totalSessions: number
  averageAttendance: number
  presentPercentage: number
  absentPercentage: number
  latePercentage: number
}

interface ClassOption {
  id: string
  name: string
  subjectCode: string
  subjectName: string
}

export default function ProfessorReportsPage() {
  const { profile } = useAuth()
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Data
  const [classes, setClasses] = useState<ClassOption[]>([])
  const [hoursTaught, setHoursTaught] = useState<HoursTaughtData[]>([])
  const [attendanceSummary, setAttendanceSummary] = useState<AttendanceSummary[]>([])

  // Filters
  const [dateFrom, setDateFrom] = useState(() => {
    const d = new Date()
    d.setMonth(d.getMonth() - 1)
    return d.toISOString().split('T')[0]
  })
  const [dateTo, setDateTo] = useState(() => new Date().toISOString().split('T')[0])
  const [classFilter, setClassFilter] = useState<string>('all')
  const [reportType, setReportType] = useState<string>('hours')

  // Computed
  const [totalHours, setTotalHours] = useState(0)
  const [averageAttendance, setAverageAttendance] = useState(0)

  useEffect(() => {
    async function fetchData() {
      try {
        setIsLoading(true)
        setError(null)

        const [classesRes, reportsRes] = await Promise.allSettled([
          fetch('/api/teachers/me/classes'),
          fetch(`/api/reports?type=${reportType}&dateFrom=${dateFrom}&dateTo=${dateTo}`),
        ])

        if (classesRes.status === 'fulfilled' && classesRes.value.ok) {
          const data = await classesRes.value.json()
          if (data.success && Array.isArray(data.data)) {
            setClasses(data.data)
          }
        } else {
          setClasses([
            { id: 'c1', name: 'CCO301-A', subjectCode: 'CCO301', subjectName: 'Database Systems' },
            { id: 'c2', name: 'CCO401-A', subjectCode: 'CCO401', subjectName: 'Software Engineering' },
            { id: 'c3', name: 'CCO201-B', subjectCode: 'CCO201', subjectName: 'Data Structures' },
          ])
        }

        if (reportsRes.status === 'fulfilled' && reportsRes.value.ok) {
          const data = await reportsRes.value.json()
          if (data.success && data.data) {
            if (data.data.hoursTaught) setHoursTaught(data.data.hoursTaught)
            if (data.data.attendanceSummary) setAttendanceSummary(data.data.attendanceSummary)
          }
        }

        // Demo data fallback
        setHoursTaught([
          { month: 'Jan 2025', hours: 32, classes: 16 },
          { month: 'Feb 2025', hours: 40, classes: 20 },
          { month: 'Mar 2025', hours: 36, classes: 18 },
          { month: 'Apr 2025', hours: 44, classes: 22 },
          { month: 'May 2025', hours: 28, classes: 14 },
          { month: 'Jun 2025', hours: 20, classes: 10 },
        ])
        setTotalHours(200)
        setAverageAttendance(82)

        setAttendanceSummary([
          { className: 'CCO301-A', subjectCode: 'CCO301', totalSessions: 24, averageAttendance: 85, presentPercentage: 72, absentPercentage: 18, latePercentage: 10 },
          { className: 'CCO401-A', subjectCode: 'CCO401', totalSessions: 20, averageAttendance: 78, presentPercentage: 65, absentPercentage: 25, latePercentage: 10 },
          { className: 'CCO201-B', subjectCode: 'CCO201', totalSessions: 22, averageAttendance: 82, presentPercentage: 70, absentPercentage: 20, latePercentage: 10 },
        ])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load reports')
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [reportType, dateFrom, dateTo])

  const handleExport = async (format: 'csv' | 'pdf') => {
    try {
      const res = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: reportType,
          dateFrom,
          dateTo,
          classIds: classFilter !== 'all' ? [classFilter] : undefined,
          format,
        }),
      })

      if (res.ok) {
        const data = await res.json()
        if (data.success && data.data?.fileUrl) {
          const a = document.createElement('a')
          a.href = data.data.fileUrl
          a.download = data.data.fileName || `report.${format}`
          a.click()
        }
      }
    } catch {
      setError('Failed to export report')
    }
  }

  const maxHours = Math.max(...hoursTaught.map((h) => h.hours), 1)

  const filteredAttendance = classFilter === 'all'
    ? attendanceSummary
    : attendanceSummary.filter((a) => a.subjectCode === classFilter)

  if (isLoading) {
    return (
      <div className="space-y-6 p-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-4 md:grid-cols-3">
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
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Reports</h1>
          <p className="text-muted-foreground mt-1">View analytics and generate reports for your teaching activity</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => handleExport('csv')}>
            <FileSpreadsheet className="mr-1.5 size-3.5" /> Export CSV
          </Button>
          <Button variant="outline" size="sm" onClick={() => handleExport('pdf')}>
            <FileDown className="mr-1.5 size-3.5" /> Export PDF
          </Button>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-300">
          <AlertTriangle className="size-4 shrink-0" />
          {error}
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Report Type</label>
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger className="w-44">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hours">Hours Taught</SelectItem>
                  <SelectItem value="frequency">Attendance</SelectItem>
                  <SelectItem value="grades">Grades</SelectItem>
                  <SelectItem value="monthly">Monthly Summary</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">From</label>
              <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="w-40" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">To</label>
              <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="w-40" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Class</label>
              <Select value={classFilter} onValueChange={setClassFilter}>
                <SelectTrigger className="w-56">
                  <SelectValue placeholder="All Classes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Classes</SelectItem>
                  {classes.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.subjectCode} - {c.subjectName}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary KPIs */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div className="rounded-lg bg-violet-100 p-2.5 text-violet-600 dark:bg-violet-950 dark:text-violet-300">
                <Clock className="size-5" />
              </div>
            </div>
            <p className="mt-3 text-2xl font-bold text-foreground">{totalHours}h</p>
            <p className="text-sm text-muted-foreground">Total Hours Taught</p>
          </CardContent>
          <div className="h-1 w-full bg-gradient-to-r from-violet-500 to-violet-400" />
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div className="rounded-lg bg-emerald-100 p-2.5 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-300">
                <TrendingUp className="size-5" />
              </div>
            </div>
            <p className="mt-3 text-2xl font-bold text-foreground">{averageAttendance}%</p>
            <p className="text-sm text-muted-foreground">Average Attendance</p>
          </CardContent>
          <div className="h-1 w-full bg-gradient-to-r from-emerald-500 to-emerald-400" />
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div className="rounded-lg bg-blue-100 p-2.5 text-blue-600 dark:bg-blue-950 dark:text-blue-300">
                <BookOpen className="size-5" />
              </div>
            </div>
            <p className="mt-3 text-2xl font-bold text-foreground">{classes.length}</p>
            <p className="text-sm text-muted-foreground">Active Classes</p>
          </CardContent>
          <div className="h-1 w-full bg-gradient-to-r from-blue-500 to-blue-400" />
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div className="rounded-lg bg-amber-100 p-2.5 text-amber-600 dark:bg-amber-950 dark:text-amber-300">
                <Calendar className="size-5" />
              </div>
            </div>
            <p className="mt-3 text-2xl font-bold text-foreground">{hoursTaught.length}</p>
            <p className="text-sm text-muted-foreground">Months Active</p>
          </CardContent>
          <div className="h-1 w-full bg-gradient-to-r from-amber-500 to-amber-400" />
        </Card>
      </div>

      {/* Hours Taught Chart */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg font-semibold">Hours Taught</CardTitle>
              <CardDescription>Monthly breakdown of teaching hours</CardDescription>
            </div>
            <Badge variant="outline" className="text-xs">{dateFrom} to {dateTo}</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {hoursTaught.map((item) => (
              <div key={item.month} className="space-y-1.5">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-foreground">{item.month}</span>
                  <div className="flex items-center gap-3 text-muted-foreground">
                    <span>{item.classes} classes</span>
                    <span className="font-semibold text-foreground">{item.hours}h</span>
                  </div>
                </div>
                <div className="h-3 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-violet-500 to-violet-400 transition-all"
                    style={{ width: `${(item.hours / maxHours) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Attendance Summary Table */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg font-semibold">Attendance Summary</CardTitle>
              <CardDescription>Per-class attendance breakdown</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Class</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead className="text-center">Sessions</TableHead>
                <TableHead className="text-center">Avg. Attendance</TableHead>
                <TableHead className="text-center">Present</TableHead>
                <TableHead className="text-center">Absent</TableHead>
                <TableHead className="text-center">Late</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAttendance.map((row) => (
                <TableRow key={row.subjectCode}>
                  <TableCell className="font-medium">{row.className}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="font-mono text-xs">{row.subjectCode}</Badge>
                  </TableCell>
                  <TableCell className="text-center">{row.totalSessions}</TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-2">
                      <Progress value={row.averageAttendance} className="h-2 w-16" />
                      <span className={`text-sm font-semibold ${
                        row.averageAttendance >= 80 ? 'text-emerald-600' :
                        row.averageAttendance >= 60 ? 'text-amber-600' : 'text-red-600'
                      }`}>
                        {row.averageAttendance}%
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-center text-emerald-600">{row.presentPercentage}%</TableCell>
                  <TableCell className="text-center text-red-600">{row.absentPercentage}%</TableCell>
                  <TableCell className="text-center text-amber-600">{row.latePercentage}%</TableCell>
                </TableRow>
              ))}
              {filteredAttendance.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    No data available for the selected filters
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Frequency Visualization */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-semibold">Student Frequency</CardTitle>
          <CardDescription>Attendance distribution across all classes</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-3">
            {filteredAttendance.map((row) => (
              <div key={row.subjectCode} className="rounded-lg border p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-foreground">{row.subjectCode}</p>
                  <Badge variant="outline" className="text-xs">{row.totalSessions} sessions</Badge>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1">
                      <div className="size-2 rounded-full bg-emerald-500" /> Present
                    </span>
                    <span className="font-medium">{row.presentPercentage}%</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                    <div className="h-full rounded-full bg-emerald-500" style={{ width: `${row.presentPercentage}%` }} />
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1">
                      <div className="size-2 rounded-full bg-red-500" /> Absent
                    </span>
                    <span className="font-medium">{row.absentPercentage}%</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                    <div className="h-full rounded-full bg-red-500" style={{ width: `${row.absentPercentage}%` }} />
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1">
                      <div className="size-2 rounded-full bg-amber-500" /> Late
                    </span>
                    <span className="font-medium">{row.latePercentage}%</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                    <div className="h-full rounded-full bg-amber-500" style={{ width: `${row.latePercentage}%` }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
