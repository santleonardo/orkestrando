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
  Users,
  Clock,
  MapPin,
  GraduationCap,
  BarChart3,
  FileText,
  Download,
  AlertTriangle,
  Search,
  TrendingUp,
  ExternalLink,
} from 'lucide-react'

interface Subject {
  id: string
  code: string
  name: string
  teacherName: string
  teacherId: string
  schedule: string
  roomName: string
  attendancePercentage: number
  grade: number | null
  gradeMax: number
  frequency: number
  materialsCount: number
  classes: number
  totalClasses: number
  isActive: boolean
  progress: number
}

export default function StudentSubjectsPage() {
  const { profile } = useAuth()
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    async function fetchData() {
      try {
        setIsLoading(true)
        setError(null)

        const res = await fetch('/api/enrollments?status=ACTIVE')
        if (res.ok) {
          const data = await res.json()
          if (data.success && Array.isArray(data.data)) {
            setSubjects(data.data)
            return
          }
        }

        // Demo data
        setSubjects([
          {
            id: 's1', code: 'CCO301', name: 'Database Systems',
            teacherName: 'Prof. Silva', teacherId: 't1',
            schedule: 'Mon/Wed 08:00-09:40', roomName: 'Lab 201',
            attendancePercentage: 88, grade: 8.5, gradeMax: 10, frequency: 88,
            materialsCount: 12, classes: 18, totalClasses: 24, isActive: true, progress: 75,
          },
          {
            id: 's2', code: 'CCO401', name: 'Software Engineering',
            teacherName: 'Prof. Mendes', teacherId: 't2',
            schedule: 'Mon/Wed 10:00-11:40', roomName: 'Room 105',
            attendancePercentage: 92, grade: 9.0, gradeMax: 10, frequency: 92,
            materialsCount: 8, classes: 16, totalClasses: 20, isActive: true, progress: 80,
          },
          {
            id: 's3', code: 'CCO201', name: 'Data Structures',
            teacherName: 'Prof. Costa', teacherId: 't3',
            schedule: 'Tue/Thu 08:00-09:40', roomName: 'Lab 303',
            attendancePercentage: 75, grade: 7.0, gradeMax: 10, frequency: 75,
            materialsCount: 15, classes: 20, totalClasses: 22, isActive: true, progress: 91,
          },
          {
            id: 's4', code: 'CCO501', name: 'Computer Networks',
            teacherName: 'Prof. Lima', teacherId: 't4',
            schedule: 'Tue 14:00-15:40 / Fri 08:00-09:40', roomName: 'Room 202',
            attendancePercentage: 82, grade: null, gradeMax: 10, frequency: 82,
            materialsCount: 6, classes: 12, totalClasses: 22, isActive: true, progress: 55,
          },
          {
            id: 's5', code: 'CCO601', name: 'Artificial Intelligence',
            teacherName: 'Prof. Santos', teacherId: 't5',
            schedule: 'Thu 14:00-15:40', roomName: 'Lab 401',
            attendancePercentage: 95, grade: 9.5, gradeMax: 10, frequency: 95,
            materialsCount: 10, classes: 8, totalClasses: 16, isActive: true, progress: 50,
          },
        ])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load subjects')
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  const filteredSubjects = subjects.filter((s) =>
    searchQuery === '' ||
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.teacherName.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const getGradeColor = (grade: number | null) => {
    if (grade === null) return 'text-muted-foreground'
    if (grade >= 9) return 'text-emerald-600'
    if (grade >= 7) return 'text-amber-600'
    return 'text-red-600'
  }

  const getAttendanceColor = (pct: number) => {
    if (pct >= 80) return 'text-emerald-600'
    if (pct >= 60) return 'text-amber-600'
    return 'text-red-600'
  }

  const getProgressColor = (pct: number) => {
    if (pct >= 75) return '[&>div]:bg-emerald-500'
    if (pct >= 50) return '[&>div]:bg-violet-500'
    return '[&>div]:bg-amber-500'
  }

  if (isLoading) {
    return (
      <div className="space-y-6 p-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-10 w-full max-w-sm" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-64 rounded-xl" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">My Subjects</h1>
          <p className="text-muted-foreground mt-1">View all enrolled subjects and their progress</p>
        </div>
        <Badge variant="outline" className="w-fit text-sm">
          {subjects.length} subjects enrolled
        </Badge>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-300">
          <AlertTriangle className="size-4 shrink-0" />
          {error}
        </div>
      )}

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search subjects..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="h-9 w-full rounded-md border border-input bg-transparent pl-9 pr-3 text-sm shadow-xs outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-200 dark:focus:ring-violet-800"
        />
      </div>

      {/* Subjects Grid */}
      {filteredSubjects.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <GraduationCap className="size-12 text-muted-foreground/40" />
            <p className="mt-3 text-lg font-medium text-muted-foreground">No subjects found</p>
            <p className="text-sm text-muted-foreground/70">
              {searchQuery ? 'Try a different search term' : 'You are not enrolled in any subjects yet'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredSubjects.map((subject) => (
            <Card key={subject.id} className="overflow-hidden">
              <CardContent className="p-0">
                {/* Subject Header */}
                <div className="p-5 pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-100 text-violet-600 dark:bg-violet-950 dark:text-violet-300">
                      <BookOpen className="size-6" />
                    </div>
                    <div className="flex items-center gap-2">
                      {subject.isActive && (
                        <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 text-xs">Active</Badge>
                      )}
                      <Badge variant="outline" className="font-mono text-xs">{subject.code}</Badge>
                    </div>
                  </div>
                  <h3 className="mt-3 font-semibold text-foreground">{subject.name}</h3>
                  <div className="mt-1.5 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Users className="size-3.5" /> {subject.teacherName}
                    </span>
                  </div>
                  <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="size-3" /> {subject.schedule}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <MapPin className="size-3" /> {subject.roomName}
                    </span>
                  </div>
                </div>

                <div className="px-5 pb-2">
                  {/* Progress */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Course Progress</span>
                      <span className="font-medium text-foreground">{subject.progress}%</span>
                    </div>
                    <Progress value={subject.progress} className={`h-2 ${getProgressColor(subject.progress)}`} />
                  </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-3 border-t bg-muted/30">
                  <div className="p-3 text-center border-r">
                    <p className={`text-lg font-bold ${getAttendanceColor(subject.attendancePercentage)}`}>
                      {subject.attendancePercentage}%
                    </p>
                    <p className="text-[11px] text-muted-foreground">Attendance</p>
                  </div>
                  <div className="p-3 text-center border-r">
                    <p className={`text-lg font-bold ${getGradeColor(subject.grade)}`}>
                      {subject.grade !== null ? subject.grade.toFixed(1) : '--'}
                    </p>
                    <p className="text-[11px] text-muted-foreground">Grade</p>
                  </div>
                  <div className="p-3 text-center">
                    <p className="text-lg font-bold text-foreground">{subject.materialsCount}</p>
                    <p className="text-[11px] text-muted-foreground">Materials</p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex border-t">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex-1 rounded-none text-xs hover:bg-muted/50"
                    asChild
                  >
                    <Link href={`/student/materials?subjectId=${subject.id}`}>
                      <FileText className="mr-1 size-3" /> Materials
                    </Link>
                  </Button>
                  <Separator orientation="vertical" />
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex-1 rounded-none text-xs hover:bg-muted/50"
                    asChild
                  >
                    <Link href={`/student/attendance?subjectId=${subject.id}`}>
                      <BarChart3 className="mr-1 size-3" /> Attendance
                    </Link>
                  </Button>
                  <Separator orientation="vertical" />
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex-1 rounded-none text-xs hover:bg-muted/50"
                    asChild
                  >
                    <Link href={`/student/schedule`}>
                      <Clock className="mr-1 size-3" /> Schedule
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

function Separator({ orientation }: { orientation?: 'horizontal' | 'vertical' }) {
  if (orientation === 'vertical') {
    return <div className="w-px self-stretch bg-border" />
  }
  return <div className="h-px w-full bg-border" />
}
