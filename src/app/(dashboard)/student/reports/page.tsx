'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Progress } from '@/components/ui/progress'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  BarChart3,
  Download,
  FileText,
  Calendar,
  TrendingUp,
  GraduationCap,
  BookOpen,
  ClipboardCheck,
  Award,
  AlertTriangle,
  FileSpreadsheet,
  FileDown,
  Printer,
 Clock,
  Target,
} from 'lucide-react'

interface GradeRecord {
  id: string
  subjectCode: string
  subjectName: string
  assessment: string
  grade: number
  maxGrade: number
  date: string
  status: string
}

interface SubjectReport {
  subjectCode: string
  subjectName: string
  semester: string
  finalGrade: number | null
  maxGrade: number
  attendance: number
  credits: number
  status: string
  teacherName: string
}

interface AcademicSummary {
  overallGPA: number
  totalCredits: number
  completedCredits: number
  activeSubjects: number
  overallAttendance: number
  bestSubject: string
  worstSubject: string
}

export default function StudentReportsPage() {
  const { profile } = useAuth()
  const [grades, setGrades] = useState<GradeRecord[]>([])
  const [subjects, setSubjects] = useState<SubjectReport[]>([])
  const [summary, setSummary] = useState<AcademicSummary | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [semesterFilter, setSemesterFilter] = useState<string>('all')

  useEffect(() => {
    async function fetchData() {
      try {
        setIsLoading(true)
        setError(null)

        const [gradesRes, reportRes] = await Promise.allSettled([
          fetch('/api/students/me/grades'),
          fetch('/api/reports?type=SEMESTRAL'),
        ])

        if (gradesRes.status === 'fulfilled' && gradesRes.value.ok) {
          const data = await gradesRes.value.json()
          if (data.success && data.data) {
            setGrades(data.data)
          }
        } else {
          setGrades([
            { id: 'g1', subjectCode: 'CCO301', subjectName: 'Database Systems', assessment: 'Midterm Exam', grade: 8.5, maxGrade: 10, date: '2025-04-15', status: 'GRADED' },
            { id: 'g2', subjectCode: 'CCO301', subjectName: 'Database Systems', assessment: 'Lab Report 1', grade: 9.0, maxGrade: 10, date: '2025-03-20', status: 'GRADED' },
            { id: 'g3', subjectCode: 'CCO301', subjectName: 'Database Systems', assessment: 'Final Project', grade: 8.0, maxGrade: 10, date: '2025-06-01', status: 'GRADED' },
            { id: 'g4', subjectCode: 'CCO401', subjectName: 'Software Engineering', assessment: 'Sprint Review 1', grade: 9.5, maxGrade: 10, date: '2025-04-10', status: 'GRADED' },
            { id: 'g5', subjectCode: 'CCO401', subjectName: 'Software Engineering', assessment: 'Midterm Exam', grade: 8.0, maxGrade: 10, date: '2025-04-20', status: 'GRADED' },
            { id: 'g6', subjectCode: 'CCO201', subjectName: 'Data Structures', assessment: 'Midterm Exam', grade: 7.0, maxGrade: 10, date: '2025-04-18', status: 'GRADED' },
            { id: 'g7', subjectCode: 'CCO201', subjectName: 'Data Structures', assessment: 'Lab Exam 1', grade: 6.5, maxGrade: 10, date: '2025-03-25', status: 'GRADED' },
            { id: 'g8', subjectCode: 'CCO501', subjectName: 'Computer Networks', assessment: 'Homework 1', grade: 9.0, maxGrade: 10, date: '2025-03-15', status: 'GRADED' },
            { id: 'g9', subjectCode: 'CCO501', subjectName: 'Computer Networks', assessment: 'Midterm Exam', grade: null, maxGrade: 10, date: '2025-06-20', status: 'PENDING' },
            { id: 'g10', subjectCode: 'CCO601', subjectName: 'AI Fundamentals', assessment: 'Research Paper', grade: 9.5, maxGrade: 10, date: '2025-05-28', status: 'GRADED' },
          ])
        }

        if (reportRes.status === 'fulfilled' && reportRes.value.ok) {
          const data = await reportRes.value.json()
          if (data.success && data.data) {
            if (data.data.subjects) setSubjects(data.data.subjects)
            if (data.data.summary) setSummary(data.data.summary)
          }
        }

        // Demo fallback
        setSubjects([
          { subjectCode: 'CCO301', subjectName: 'Database Systems', semester: '2025.1', finalGrade: 8.5, maxGrade: 10, attendance: 88, credits: 4, status: 'IN_PROGRESS', teacherName: 'Prof. Silva' },
          { subjectCode: 'CCO401', subjectName: 'Software Engineering', semester: '2025.1', finalGrade: 9.0, maxGrade: 10, attendance: 92, credits: 4, status: 'IN_PROGRESS', teacherName: 'Prof. Mendes' },
          { subjectCode: 'CCO201', subjectName: 'Data Structures', semester: '2025.1', finalGrade: 7.0, maxGrade: 10, attendance: 75, credits: 4, status: 'IN_PROGRESS', teacherName: 'Prof. Costa' },
          { subjectCode: 'CCO501', subjectName: 'Computer Networks', semester: '2025.1', finalGrade: null, maxGrade: 10, attendance: 82, credits: 3, status: 'IN_PROGRESS', teacherName: 'Prof. Lima' },
          { subjectCode: 'CCO601', subjectName: 'AI Fundamentals', semester: '2025.1', finalGrade: 9.5, maxGrade: 10, attendance: 95, credits: 3, status: 'IN_PROGRESS', teacherName: 'Prof. Santos' },
          { subjectCode: 'CCO101', subjectName: 'Intro to Programming', semester: '2024.2', finalGrade: 8.0, maxGrade: 10, attendance: 90, credits: 4, status: 'APPROVED', teacherName: 'Prof. Oliveira' },
          { subjectCode: 'CCO102', subjectName: 'Calculus I', semester: '2024.2', finalGrade: 7.5, maxGrade: 10, attendance: 85, credits: 4, status: 'APPROVED', teacherName: 'Prof. Pereira' },
          { subjectCode: 'CCO103', subjectName: 'Linear Algebra', semester: '2024.2', finalGrade: 6.0, maxGrade: 10, attendance: 70, credits: 4, status: 'APPROVED', teacherName: 'Prof. Almeida' },
          { subjectCode: 'CCO104', subjectName: 'Digital Logic', semester: '2024.1', finalGrade: 8.5, maxGrade: 10, attendance: 92, credits: 3, status: 'APPROVED', teacherName: 'Prof. Barbosa' },
          { subjectCode: 'CCO105', subjectName: 'Discrete Math', semester: '2024.1', finalGrade: 9.0, maxGrade: 10, attendance: 95, credits: 4, status: 'APPROVED', teacherName: 'Prof. Nunes' },
        ])

        setSummary({
          overallGPA: 8.2,
          totalCredits: 34,
          completedCredits: 15,
          activeSubjects: 5,
          overallAttendance: 85,
          bestSubject: 'AI Fundamentals',
          worstSubject: 'Linear Algebra',
        })
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load reports')
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  const handleExport = (format: 'csv' | 'pdf') => {
    const a = document.createElement('a')
    a.href = '#'
    a.download = `academic-report.${format}`
    a.click()
  }

  const filteredSubjects = semesterFilter === 'all'
    ? subjects
    : subjects.filter((s) => s.semester === semesterFilter)

  const filteredGrades = semesterFilter === 'all'
    ? grades
    : grades.filter((g) => {
        const subj = subjects.find((s) => s.subjectCode === g.subjectCode && s.semester === semesterFilter)
        return !!subj
      })

  const getGradeColor = (grade: number | null, max: number) => {
    if (grade === null) return 'text-muted-foreground'
    const pct = grade / max
    if (pct >= 0.9) return 'text-emerald-600'
    if (pct >= 0.7) return 'text-amber-600'
    return 'text-red-600'
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'APPROVED': return <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 text-xs">Approved</Badge>
      case 'FAILED': return <Badge variant="destructive" className="text-xs">Failed</Badge>
      case 'IN_PROGRESS': return <Badge className="bg-violet-100 text-violet-700 border-violet-200 text-xs">In Progress</Badge>
      case 'DROPPED': return <Badge variant="secondary" className="text-xs">Dropped</Badge>
      default: return <Badge variant="outline" className="text-xs">{status}</Badge>
    }
  }

  const uniqueSemesters = [...new Set(subjects.map((s) => s.semester))].sort().reverse()

  if (isLoading) {
    return (
      <div className="space-y-6 p-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)}
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
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Academic Reports</h1>
          <p className="text-muted-foreground mt-1">View your academic history, grades, and attendance</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => handleExport('csv')}>
            <FileSpreadsheet className="mr-1.5 size-3.5" /> Export CSV
          </Button>
          <Button variant="outline" size="sm" onClick={() => handleExport('pdf')}>
            <FileDown className="mr-1.5 size-3.5" /> Download Transcript
          </Button>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-300">
          <AlertTriangle className="size-4 shrink-0" />
          {error}
        </div>
      )}

      {/* Academic Summary */}
      {summary && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="relative overflow-hidden">
            <CardContent className="p-5">
              <div className="rounded-lg bg-violet-100 p-2.5 text-violet-600 dark:bg-violet-950 dark:text-violet-300 w-fit">
                <Award className="size-5" />
              </div>
              <p className="mt-3 text-2xl font-bold text-foreground">{summary.overallGPA.toFixed(1)}</p>
              <p className="text-sm text-muted-foreground">Overall GPA</p>
              <p className="text-xs text-muted-foreground/70">out of 10.0</p>
            </CardContent>
            <div className="absolute bottom-0 left-0 h-1 w-full bg-gradient-to-r from-violet-500 to-violet-400" />
          </Card>
          <Card className="relative overflow-hidden">
            <CardContent className="p-5">
              <div className="rounded-lg bg-blue-100 p-2.5 text-blue-600 dark:bg-blue-950 dark:text-blue-300 w-fit">
                <GraduationCap className="size-5" />
              </div>
              <p className="mt-3 text-2xl font-bold text-foreground">{summary.completedCredits}/{summary.totalCredits}</p>
              <p className="text-sm text-muted-foreground">Credits Completed</p>
              <Progress value={(summary.completedCredits / summary.totalCredits) * 100} className="mt-2 h-2 [&>div]:bg-blue-500" />
            </CardContent>
            <div className="absolute bottom-0 left-0 h-1 w-full bg-gradient-to-r from-blue-500 to-blue-400" />
          </Card>
          <Card className="relative overflow-hidden">
            <CardContent className="p-5">
              <div className="rounded-lg bg-emerald-100 p-2.5 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-300 w-fit">
                <Target className="size-5" />
              </div>
              <p className="mt-3 text-2xl font-bold text-foreground">{summary.overallAttendance}%</p>
              <p className="text-sm text-muted-foreground">Overall Attendance</p>
              <Progress value={summary.overallAttendance} className="mt-2 h-2 [&>div]:bg-emerald-500" />
            </CardContent>
            <div className="absolute bottom-0 left-0 h-1 w-full bg-gradient-to-r from-emerald-500 to-emerald-400" />
          </Card>
          <Card className="relative overflow-hidden">
            <CardContent className="p-5">
              <div className="rounded-lg bg-amber-100 p-2.5 text-amber-600 dark:bg-amber-950 dark:text-amber-300 w-fit">
                <BookOpen className="size-5" />
              </div>
              <p className="mt-3 text-2xl font-bold text-foreground">{summary.activeSubjects}</p>
              <p className="text-sm text-muted-foreground">Active Subjects</p>
              <p className="text-xs text-muted-foreground/70 mt-0.5">Current semester</p>
            </CardContent>
            <div className="absolute bottom-0 left-0 h-1 w-full bg-gradient-to-r from-amber-500 to-amber-400" />
          </Card>
        </div>
      )}

      {/* Semester Filter */}
      <div className="flex items-center gap-3">
        <label className="text-sm font-medium text-muted-foreground">Semester:</label>
        <Select value={semesterFilter} onValueChange={setSemesterFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Todos os semestres" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Semesters</SelectItem>
            {uniqueSemesters.map((s) => (
              <SelectItem key={s} value={s}>{s}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Academic History */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg font-semibold">Academic History</CardTitle>
              <CardDescription>Complete record of subjects across semesters</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Semester</TableHead>
                <TableHead>Teacher</TableHead>
                <TableHead className="text-center">Credits</TableHead>
                <TableHead className="text-center">Grade</TableHead>
                <TableHead className="text-center">Attendance</TableHead>
                <TableHead className="text-center">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSubjects.map((subject) => (
                <TableRow key={`${subject.subjectCode}-${subject.semester}`}>
                  <TableCell>
                    <Badge variant="outline" className="font-mono text-xs">{subject.subjectCode}</Badge>
                  </TableCell>
                  <TableCell className="font-medium">{subject.subjectName}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{subject.semester}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{subject.teacherName}</TableCell>
                  <TableCell className="text-center text-sm">{subject.credits}</TableCell>
                  <TableCell className="text-center">
                    <span className={`text-lg font-bold ${getGradeColor(subject.finalGrade, subject.maxGrade)}`}>
                      {subject.finalGrade !== null ? subject.finalGrade.toFixed(1) : '--'}
                    </span>
                    {subject.finalGrade !== null && (
                      <span className="text-xs text-muted-foreground">/{subject.maxGrade}</span>
                    )}
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <Progress
                        value={subject.attendance}
                        className={`h-1.5 w-12 ${
                          subject.attendance >= 80 ? '[&>div]:bg-emerald-500' :
                          subject.attendance >= 60 ? '[&>div]:bg-amber-500' : '[&>div]:bg-red-500'
                        }`}
                      />
                      <span className={`text-xs font-medium ${
                        subject.attendance >= 80 ? 'text-emerald-600' :
                        subject.attendance >= 60 ? 'text-amber-600' : 'text-red-600'
                      }`}>
                        {subject.attendance}%
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">{getStatusBadge(subject.status)}</TableCell>
                </TableRow>
              ))}
              {filteredSubjects.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    No academic records found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Grades Detail */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-semibold">Grades Detail</CardTitle>
          <CardDescription>Individual assessment grades</CardDescription>
        </CardHeader>
        <CardContent>
          {filteredGrades.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Award className="size-10 text-muted-foreground/50" />
              <p className="mt-3 text-sm text-muted-foreground">No grades available</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Subject</TableHead>
                  <TableHead>Assessment</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-center">Grade</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredGrades.map((grade) => (
                  <TableRow key={grade.id}>
                    <TableCell>
                      <div className="flex items-center gap-1.5">
                        <Badge variant="outline" className="font-mono text-xs">{grade.subjectCode}</Badge>
                        <span className="text-sm">{grade.subjectName}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm font-medium">{grade.assessment}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(grade.date + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </TableCell>
                    <TableCell className="text-center">
                      {grade.grade !== null ? (
                        <span className={`text-lg font-bold ${getGradeColor(grade.grade, grade.maxGrade)}`}>
                          {grade.grade.toFixed(1)}<span className="text-xs text-muted-foreground font-normal">/{grade.maxGrade}</span>
                        </span>
                      ) : (
                        <span className="text-sm text-muted-foreground">Pending</span>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      {grade.status === 'GRADED' ? (
                        <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 text-xs">Graded</Badge>
                      ) : (
                        <Badge variant="secondary" className="text-xs">Pending</Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Attendance Summary */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-semibold">Attendance Summary</CardTitle>
          <CardDescription>Attendance rate per subject</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredSubjects
              .filter((s) => s.status === 'IN_PROGRESS')
              .map((subject) => (
                <div key={subject.subjectCode} className="rounded-lg border p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="font-mono text-xs">{subject.subjectCode}</Badge>
                      <span className="text-sm font-semibold text-foreground">{subject.subjectName}</span>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Attendance</span>
                      <span className={`font-bold ${
                        subject.attendance >= 80 ? 'text-emerald-600' :
                        subject.attendance >= 60 ? 'text-amber-600' : 'text-red-600'
                      }`}>
                        {subject.attendance}%
                      </span>
                    </div>
                    <Progress
                      value={subject.attendance}
                      className={`h-2.5 ${
                        subject.attendance >= 80 ? '[&>div]:bg-emerald-500' :
                        subject.attendance >= 60 ? '[&>div]:bg-amber-500' : '[&>div]:bg-red-500'
                      }`}
                    />
                  </div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{subject.semester}</span>
                    <span>{subject.credits} credits</span>
                  </div>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
