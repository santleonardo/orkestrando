'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useAuth } from '@/hooks/use-auth'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import {
  BookOpen,
  Users,
  Clock,
  MapPin,
  ChevronDown,
  ChevronUp,
  GraduationCap,
  Calendar,
  Search,
  ArrowRight,
  AlertCircle,
} from 'lucide-react'

interface ClassItem {
  id: string
  code: string
  name: string
  subjectId: string
  subjectName: string
  subjectCode: string
  teacherId: string
  roomId: string
  roomName: string
  semesterId: string
  semesterName: string
  weekday: string
  startTime: string
  endTime: string
  isActive: boolean
  vacancies: number
  totalEnrolled: number
  sessions?: ClassSessionItem[]
  students?: StudentItem[]
}

interface ClassSessionItem {
  id: string
  date: string
  startTime: string
  endTime: string
  status: string
  topic: string
}

interface StudentItem {
  id: string
  studentId: string
  name: string
  email: string
  attendancePercentage: number
}

interface Semester {
  id: string
  name: string
  isCurrent: boolean
}

const WEEKDAY_LABELS: Record<string, string> = {
  MONDAY: 'Mon',
  TUESDAY: 'Tue',
  WEDNESDAY: 'Wed',
  THURSDAY: 'Thu',
  FRIDAY: 'Fri',
  SATURDAY: 'Sat',
}

export default function ProfessorClassesPage() {
  const { user: profile } = useAuth()
  const [classes, setClasses] = useState<ClassItem[]>([])
  const [semesters, setSemesters] = useState<Semester[]>([])
  const [selectedSemester, setSelectedSemester] = useState<string>('all')
  const [expandedClass, setExpandedClass] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    async function fetchData() {
      try {
        setIsLoading(true)
        setError(null)

        const [classesRes, semestersRes] = await Promise.allSettled([
          fetch('/api/teachers/me/classes'),
          fetch('/api/schedules?include=semesters'),
        ])

        if (semestersRes.status === 'fulfilled' && semestersRes.value.ok) {
          const data = await semestersRes.value.json()
          if (data.success && Array.isArray(data.data)) {
            setSemesters(data.data)
          }
        } else {
          setSemesters([
            { id: '1', name: '2025.1', isCurrent: true },
            { id: '2', name: '2024.2', isCurrent: false },
          ])
        }

        if (classesRes.status === 'fulfilled' && classesRes.value.ok) {
          const data = await classesRes.value.json()
          if (data.success && Array.isArray(data.data)) {
            setClasses(data.data)
          }
        } else {
          setClasses([
            {
              id: '1', code: 'CCO301-A', name: 'Database Systems - Turma A',
              subjectId: 's1', subjectName: 'Database Systems', subjectCode: 'CCO301',
              teacherId: 't1', roomId: 'r1', roomName: 'Lab 201',
              semesterId: '1', semesterName: '2025.1',
              weekday: 'MONDAY', startTime: '08:00', endTime: '09:40',
              isActive: true, vacancies: 5, totalEnrolled: 35,
              sessions: [
                { id: 'ses1', date: '2025-06-16', startTime: '08:00', endTime: '09:40', status: 'COMPLETED', topic: 'SQL Joins' },
                { id: 'ses2', date: '2025-06-17', startTime: '08:00', endTime: '09:40', status: 'SCHEDULED', topic: 'Normalization' },
              ],
              students: [
                { id: 'st1', studentId: '2025001', name: 'Ana Silva', email: 'ana@edu.br', attendancePercentage: 92 },
                { id: 'st2', studentId: '2025002', name: 'Bruno Costa', email: 'bruno@edu.br', attendancePercentage: 85 },
                { id: 'st3', studentId: '2025003', name: 'Carla Mendes', email: 'carla@edu.br', attendancePercentage: 78 },
              ],
            },
            {
              id: '2', code: 'CCO401-A', name: 'Software Engineering - Turma A',
              subjectId: 's2', subjectName: 'Software Engineering', subjectCode: 'CCO401',
              teacherId: 't1', roomId: 'r2', roomName: 'Room 105',
              semesterId: '1', semesterName: '2025.1',
              weekday: 'TUESDAY', startTime: '10:00', endTime: '11:40',
              isActive: true, vacancies: 2, totalEnrolled: 28,
              sessions: [
                { id: 'ses3', date: '2025-06-17', startTime: '10:00', endTime: '11:40', status: 'SCHEDULED', topic: 'Agile Methods' },
              ],
              students: [
                { id: 'st4', studentId: '2025004', name: 'Daniel Ferreira', email: 'daniel@edu.br', attendancePercentage: 95 },
                { id: 'st5', studentId: '2025005', name: 'Elena Souza', email: 'elena@edu.br', attendancePercentage: 88 },
              ],
            },
            {
              id: '3', code: 'CCO201-B', name: 'Data Structures - Turma B',
              subjectId: 's3', subjectName: 'Data Structures', subjectCode: 'CCO201',
              teacherId: 't1', roomId: 'r3', roomName: 'Lab 303',
              semesterId: '1', semesterName: '2025.1',
              weekday: 'WEDNESDAY', startTime: '14:00', endTime: '15:40',
              isActive: true, vacancies: 0, totalEnrolled: 42,
              sessions: [],
              students: [],
            },
            {
              id: '4', code: 'CCO501-A', name: 'Computer Networks - Turma A',
              subjectId: 's4', subjectName: 'Computer Networks', subjectCode: 'CCO501',
              teacherId: 't1', roomId: 'r4', roomName: 'Room 202',
              semesterId: '2', semesterName: '2024.2',
              weekday: 'THURSDAY', startTime: '08:00', endTime: '09:40',
              isActive: false, vacancies: 10, totalEnrolled: 22,
              sessions: [],
              students: [],
            },
          ])
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load classes')
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  const filteredClasses = classes.filter((c) => {
    const matchesSemester = selectedSemester === 'all' || c.semesterId === selectedSemester
    const matchesSearch = searchQuery === '' ||
      c.subjectName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.subjectCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.code.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesSemester && matchesSearch
  })

  const toggleExpand = (classId: string) => {
    setExpandedClass((prev) => (prev === classId ? null : classId))
  }

  const getSessionStatusBadge = (status: string) => {
    switch (status) {
      case 'IN_PROGRESS': return <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">In Progress</Badge>
      case 'COMPLETED': return <Badge variant="secondary">Completed</Badge>
      case 'CANCELLED': return <Badge variant="destructive">Cancelled</Badge>
      default: return <Badge className="bg-violet-100 text-violet-700 border-violet-200">Scheduled</Badge>
    }
  }

  const getAttendanceColor = (pct: number) => {
    if (pct >= 80) return 'text-emerald-600'
    if (pct >= 60) return 'text-amber-600'
    return 'text-red-600'
  }

  if (isLoading) {
    return (
      <div className="space-y-6 p-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-10 w-full max-w-md" />
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">My Classes</h1>
        <p className="text-muted-foreground mt-1">Manage and view all your assigned classes</p>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-300">
          <AlertCircle className="size-4 shrink-0" />
          {error}
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar por nome ou código da disciplina..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-9 w-full rounded-md border border-input bg-transparent pl-9 pr-3 text-sm shadow-xs outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-200 dark:focus:ring-violet-800"
          />
        </div>
        <Select value={selectedSemester} onValueChange={setSelectedSemester}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Todos os semestres" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Semesters</SelectItem>
            {semesters.map((s) => (
              <SelectItem key={s.id} value={s.id}>
                {s.name} {s.isCurrent && '(Current)'}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Classes List */}
      <div className="space-y-4">
        {filteredClasses.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <BookOpen className="size-12 text-muted-foreground/40" />
              <p className="mt-3 text-lg font-medium text-muted-foreground">No classes found</p>
              <p className="text-sm text-muted-foreground/70">
                {searchQuery ? 'Try a different search term' : 'No classes are assigned to you yet'}
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredClasses.map((cls) => (
            <Card key={cls.id} className="overflow-hidden">
              <CardContent className="p-0">
                {/* Class Header */}
                <div
                  className="flex cursor-pointer items-center justify-between p-5 transition-colors hover:bg-muted/30"
                  onClick={() => toggleExpand(cls.id)}
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-100 text-violet-600 dark:bg-violet-950 dark:text-violet-300">
                      <BookOpen className="size-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-foreground">{cls.subjectName}</h3>
                        <Badge variant="outline" className="font-mono text-xs">{cls.subjectCode}</Badge>
                        {cls.isActive ? (
                          <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 text-xs">Active</Badge>
                        ) : (
                          <Badge variant="secondary" className="text-xs">Inactive</Badge>
                        )}
                      </div>
                      <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="size-3.5" />
                          {WEEKDAY_LABELS[cls.weekday] || cls.weekday} {cls.startTime} - {cls.endTime}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="size-3.5" />
                          {cls.roomName}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="size-3.5" />
                          {cls.totalEnrolled} students
                        </span>
                        <span className="text-xs">
                          {cls.vacancies > 0 ? (
                            <span className="text-emerald-600">{cls.vacancies} vacancies</span>
                          ) : (
                            <span className="text-amber-600">Full</span>
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="hidden text-xs sm:inline-flex">{cls.semesterName}</Badge>
                    {expandedClass === cls.id ? (
                      <ChevronUp className="size-5 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="size-5 text-muted-foreground" />
                    )}
                  </div>
                </div>

                {/* Expanded Details */}
                {expandedClass === cls.id && (
                  <>
                    <Separator />
                    <div className="p-5">
                      {/* Quick Stats */}
                      <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                        <div className="rounded-lg bg-muted/50 p-3 text-center">
                          <p className="text-2xl font-bold text-foreground">{cls.sessions?.length || 0}</p>
                          <p className="text-xs text-muted-foreground">Sessions</p>
                        </div>
                        <div className="rounded-lg bg-muted/50 p-3 text-center">
                          <p className="text-2xl font-bold text-foreground">{cls.totalEnrolled}</p>
                          <p className="text-xs text-muted-foreground">Enrolled</p>
                        </div>
                        <div className="rounded-lg bg-muted/50 p-3 text-center">
                          <p className="text-2xl font-bold text-foreground">{cls.vacancies}</p>
                          <p className="text-xs text-muted-foreground">Vacancies</p>
                        </div>
                        <div className="rounded-lg bg-muted/50 p-3 text-center">
                          <p className="text-2xl font-bold text-foreground">
                            {cls.sessions?.filter((s) => s.status === 'COMPLETED').length || 0}
                          </p>
                          <p className="text-xs text-muted-foreground">Completed</p>
                        </div>
                      </div>

                      {/* Recent Sessions */}
                      {cls.sessions && cls.sessions.length > 0 && (
                        <div className="mb-4">
                          <h4 className="mb-2 text-sm font-semibold text-foreground">Recent Sessions</h4>
                          <div className="space-y-2">
                            {cls.sessions.map((session) => (
                              <div
                                key={session.id}
                                className="flex items-center justify-between rounded-lg border bg-muted/20 p-3"
                              >
                                <div className="flex items-center gap-3">
                                  <Calendar className="size-4 text-muted-foreground" />
                                  <div>
                                    <p className="text-sm font-medium text-foreground">{session.topic || 'No topic'}</p>
                                    <p className="text-xs text-muted-foreground">
                                      {session.date} • {session.startTime} - {session.endTime}
                                    </p>
                                  </div>
                                </div>
                                {getSessionStatusBadge(session.status)}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Enrolled Students */}
                      {cls.students && cls.students.length > 0 && (
                        <div>
                          <h4 className="mb-2 text-sm font-semibold text-foreground">Enrolled Students</h4>
                          <div className="overflow-x-auto rounded-lg border">
                            <table className="w-full text-sm">
                              <thead>
                                <tr className="border-b bg-muted/50">
                                  <th className="px-3 py-2 text-left font-medium text-muted-foreground">ID</th>
                                  <th className="px-3 py-2 text-left font-medium text-muted-foreground">Name</th>
                                  <th className="px-3 py-2 text-left font-medium text-muted-foreground">Email</th>
                                  <th className="px-3 py-2 text-right font-medium text-muted-foreground">Attendance</th>
                                </tr>
                              </thead>
                              <tbody>
                                {cls.students.map((student) => (
                                  <tr key={student.id} className="border-b last:border-b-0 hover:bg-muted/30">
                                    <td className="px-3 py-2 font-mono text-xs">{student.studentId}</td>
                                    <td className="px-3 py-2 font-medium">{student.name}</td>
                                    <td className="px-3 py-2 text-muted-foreground">{student.email}</td>
                                    <td className={`px-3 py-2 text-right font-semibold ${getAttendanceColor(student.attendancePercentage)}`}>
                                      {student.attendancePercentage}%
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="mt-4 flex flex-wrap gap-2">
                        <Button size="sm" variant="outline" className="border-violet-200 text-violet-600 hover:bg-violet-50 dark:border-violet-800 dark:hover:bg-violet-950/30" asChild>
                          <Link href={`/professor/attendance?classId=${cls.id}`}>
                            <ClipboardCheck className="mr-1 size-3.5" /> Attendance
                          </Link>
                        </Button>
                        <Button size="sm" variant="outline" className="border-blue-200 text-blue-600 hover:bg-blue-50 dark:border-blue-800 dark:hover:bg-blue-950/30" asChild>
                          <Link href={`/professor/materials?classId=${cls.id}`}>
                            <Upload className="mr-1 size-3.5" /> Materials
                          </Link>
                        </Button>
                        <Button size="sm" variant="outline" asChild>
                          <Link href={`/professor/reports?classId=${cls.id}`}>
                            <FileText className="mr-1 size-3.5" /> Reports
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}

function ClipboardCheck(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect width="8" height="4" x="8" y="2" rx="1" ry="1" />
      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
      <path d="m9 14 2 2 4-4" />
    </svg>
  )
}

function Upload(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="17 8 12 3 7 8" />
      <line x1="12" x2="12" y1="3" y2="15" />
    </svg>
  )
}

function FileText(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
      <path d="M14 2v4a2 2 0 0 0 2 2h4" />
      <path d="M10 9H8" />
      <path d="M16 13H8" />
      <path d="M16 17H8" />
    </svg>
  )
}
