'use client'

import { useState, useEffect, useMemo } from 'react'
import {
  Plus, Search, Download, MoreHorizontal, Eye, Pencil,
  UserPlus, Users, BookOpen, CheckCircle2, XCircle, Loader2,
  Filter,
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

// ---------------------------------------------------------------------------
// Types & Data
// ---------------------------------------------------------------------------

interface EnrollmentItem {
  id: string
  studentId: string
  studentName: string
  studentEmail: string
  classId: string
  className: string
  classCode: string
  subjectName: string
  teacherName: string
  semester: string
  status: 'ACTIVE' | 'DROPPED' | 'COMPLETED' | 'FAILED'
  enrolledAt: string
  attendancePct: number
  finalGrade: number | null
}

interface EnrollmentFormData {
  studentId: string
  classId: string
}

const mockEnrollments: EnrollmentItem[] = [
  { id: '1', studentId: '1', studentName: 'Ana Silva', studentEmail: 'ana.silva@uni.edu', classId: 'c1', className: 'Data Structures - A', classCode: 'CS201-A', subjectName: 'Data Structures', teacherName: 'Prof. Rodrigues', semester: '2024.1', status: 'ACTIVE', enrolledAt: '2024-01-15', attendancePct: 92, finalGrade: null },
  { id: '2', studentId: '2', studentName: 'Carlos Oliveira', studentEmail: 'carlos.oliveira@uni.edu', classId: 'c2', className: 'Calculus II - A', classCode: 'MA102-A', subjectName: 'Calculus II', teacherName: 'Prof. Mendes', semester: '2024.1', status: 'ACTIVE', enrolledAt: '2024-01-14', attendancePct: 78, finalGrade: null },
  { id: '3', studentId: '3', studentName: 'Maria Santos', studentEmail: 'maria.santos@uni.edu', classId: 'c3', className: 'UX Fundamentals - A', classCode: 'DS110-A', subjectName: 'UX Fundamentals', teacherName: 'Prof. Ferreira', semester: '2024.1', status: 'ACTIVE', enrolledAt: '2024-01-14', attendancePct: 95, finalGrade: null },
  { id: '4', studentId: '4', studentName: 'João Lima', studentEmail: 'joao.lima@uni.edu', classId: 'c4', className: 'Algorithms - A', classCode: 'CS301-A', subjectName: 'Algorithms', teacherName: 'Prof. Rodrigues', semester: '2024.1', status: 'ACTIVE', enrolledAt: '2024-01-13', attendancePct: 85, finalGrade: null },
  { id: '5', studentId: '5', studentName: 'Beatriz Costa', studentEmail: 'beatriz.costa@uni.edu', classId: 'c1', className: 'Data Structures - A', classCode: 'CS201-A', subjectName: 'Data Structures', teacherName: 'Prof. Rodrigues', semester: '2024.1', status: 'DROPPED', enrolledAt: '2024-01-12', attendancePct: 45, finalGrade: null },
  { id: '6', studentId: '6', studentName: 'Pedro Almeida', studentEmail: 'pedro.almeida@uni.edu', classId: 'c5', className: 'Physics I - A', classCode: 'PH101-A', subjectName: 'Physics I', teacherName: 'Prof. Almeida', semester: '2023.2', status: 'COMPLETED', enrolledAt: '2023-08-01', attendancePct: 88, finalGrade: 7.5 },
  { id: '7', studentId: '7', studentName: 'Lucia Ferreira', studentEmail: 'lucia.ferreira@uni.edu', classId: 'c6', className: 'Web Development - A', classCode: 'CS202-A', subjectName: 'Web Development', teacherName: 'Prof. Santos', semester: '2023.2', status: 'COMPLETED', enrolledAt: '2023-08-01', attendancePct: 92, finalGrade: 8.8 },
  { id: '8', studentId: '8', studentName: 'Rafael Souza', studentEmail: 'rafael.souza@uni.edu', classId: 'c7', className: 'Database Systems - A', classCode: 'CS303-A', subjectName: 'Database Systems', teacherName: 'Prof. Lima', semester: '2023.2', status: 'FAILED', enrolledAt: '2023-08-02', attendancePct: 55, finalGrade: 4.2 },
]

const mockStudentOptions = [
  { id: '1', name: 'Ana Silva' },
  { id: '4', name: 'João Lima' },
  { id: '6', name: 'Pedro Almeida' },
  { id: '7', name: 'Lucia Ferreira' },
]

const mockClassOptions = [
  { id: 'c1', name: 'Data Structures - A (CS201-A)' },
  { id: 'c2', name: 'Calculus II - A (MA102-A)' },
  { id: 'c3', name: 'UX Fundamentals - A (DS110-A)' },
  { id: 'c4', name: 'Algorithms - A (CS301-A)' },
  { id: 'c5', name: 'Physics I - A (PH101-A)' },
]

const emptyFormData: EnrollmentFormData = { studentId: '', classId: '' }

export default function EnrollmentManagementPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [enrollments, setEnrollments] = useState<EnrollmentItem[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [filterClass, setFilterClass] = useState<string>('all')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [filterSemester, setFilterSemester] = useState<string>('all')
  const [activeTab, setActiveTab] = useState('enrollments')

  const [createOpen, setCreateOpen] = useState(false)
  const [bulkOpen, setBulkOpen] = useState(false)
  const [detailOpen, setDetailOpen] = useState(false)

  const [formData, setFormData] = useState<EnrollmentFormData>(emptyFormData)
  const [selectedEnrollment, setSelectedEnrollment] = useState<EnrollmentItem | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => { setEnrollments(mockEnrollments); setIsLoading(false) }, 800)
    return () => clearTimeout(timer)
  }, [])

  const filteredEnrollments = useMemo(() => {
    let items = [...enrollments]
    if (filterClass !== 'all') items = items.filter((e) => e.classCode === filterClass)
    if (filterStatus !== 'all') items = items.filter((e) => e.status === filterStatus)
    if (filterSemester !== 'all') items = items.filter((e) => e.semester === filterSemester)
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      items = items.filter((e) => e.studentName.toLowerCase().includes(q) || e.className.toLowerCase().includes(q) || e.subjectName.toLowerCase().includes(q))
    }
    return items
  }, [enrollments, filterClass, filterStatus, filterSemester, searchQuery])

  const statusCounts = useMemo(() => ({
    active: enrollments.filter((e) => e.status === 'ACTIVE').length,
    dropped: enrollments.filter((e) => e.status === 'DROPPED').length,
    completed: enrollments.filter((e) => e.status === 'COMPLETED').length,
    failed: enrollments.filter((e) => e.status === 'FAILED').length,
  }), [enrollments])

  const handleCreate = () => { setFormData(emptyFormData); setCreateOpen(true) }
  const handleSubmitCreate = async () => {
    setIsSubmitting(true); await new Promise((r) => setTimeout(r, 1000))
    const student = mockStudentOptions.find((s) => s.id === formData.studentId)
    const cls = mockClassOptions.find((c) => c.id === formData.classId)
    if (student && cls) {
      setEnrollments((prev) => [...prev, { id: String(Date.now()), studentId: formData.studentId, studentName: student.name, studentEmail: '', classId: formData.classId, className: cls.name.split('(')[0].trim(), classCode: cls.name.match(/\(([^)]+)\)/)?.[1] || '', subjectName: cls.name, teacherName: '', semester: '2024.1', status: 'ACTIVE', enrolledAt: new Date().toISOString().split('T')[0], attendancePct: 100, finalGrade: null }])
    }
    setIsSubmitting(false); setCreateOpen(false)
  }

  const handleStatusChange = (id: string, newStatus: string) => {
    setEnrollments((prev) => prev.map((e) => e.id === id ? { ...e, status: newStatus as EnrollmentItem['status'] } : e))
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'bg-green-100 text-green-700'
      case 'DROPPED': return 'bg-red-100 text-red-700'
      case 'COMPLETED': return 'bg-blue-100 text-blue-700'
      case 'FAILED': return 'bg-orange-100 text-orange-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  if (isLoading) return <div className="flex-1 space-y-6 p-6"><Skeleton className="h-10 w-48" /><Skeleton className="h-40 w-full" /><Skeleton className="h-96 w-full" /></div>

  return (
    <div className="flex-1 space-y-6 p-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-violet-700 to-purple-500 bg-clip-text text-transparent">Enrollment Management</h1>
          <p className="text-muted-foreground mt-1">Manage class enrollments and student registrations</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="gap-2"><Download className="h-4 w-4" /> Export</Button>
          <Button variant="outline" className="gap-2" onClick={() => setBulkOpen(true)}><UserPlus className="h-4 w-4" /> Bulk Enroll</Button>
          <Button onClick={handleCreate} className="gap-2 bg-violet-600 hover:bg-violet-700"><Plus className="h-4 w-4" /> New Enrollment</Button>
        </div>
      </div>

      {/* Status Summary */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {[
          { label: 'Active', count: statusCounts.active, color: 'bg-green-100 text-green-700' },
          { label: 'Dropped', count: statusCounts.dropped, color: 'bg-red-100 text-red-700' },
          { label: 'Completed', count: statusCounts.completed, color: 'bg-blue-100 text-blue-700' },
          { label: 'Failed', count: statusCounts.failed, color: 'bg-orange-100 text-orange-700' },
        ].map((item) => (
          <Card key={item.label} className="border-violet-200 dark:border-violet-800/50">
            <CardContent className="p-4 flex items-center gap-3">
              <div className={cn('flex h-10 w-10 items-center justify-center rounded-lg', item.color.split(' ')[0])}>
                <Users className={cn('h-5 w-5', item.color.split(' ')[1])} />
              </div>
              <div><p className="text-sm text-muted-foreground">{item.label}</p><p className="text-2xl font-bold">{item.count}</p></div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList><TabsTrigger value="enrollments">All Enrollments</TabsTrigger><TabsTrigger value="active">Active</TabsTrigger><TabsTrigger value="dropped">Dropped</TabsTrigger></TabsList>

        {['enrollments', 'active', 'dropped'].map((tab) => (
          <TabsContent key={tab} value={tab} className="mt-4 space-y-4">
            <Card className="border-violet-200 dark:border-violet-800/50">
              <CardContent className="p-4">
                <div className="flex flex-col gap-3 md:flex-row md:items-center">
                  <div className="relative flex-1"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input placeholder="Search by student or class..." className="pl-9" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} /></div>
                  <Select value={filterClass} onValueChange={setFilterClass}><SelectTrigger className="w-44"><SelectValue placeholder="Class" /></SelectTrigger><SelectContent><SelectItem value="all">All Classes</SelectItem>{mockClassOptions.map((c) => <SelectItem key={c.id} value={c.name.match(/\(([^)]+)\)/)?.[1] || c.id}>{c.name}</SelectItem>)}</SelectContent></Select>
                  <Select value={filterSemester} onValueChange={setFilterSemester}><SelectTrigger className="w-36"><SelectValue placeholder="Semester" /></SelectTrigger><SelectContent><SelectItem value="all">All</SelectItem><SelectItem value="2024.1">2024.1</SelectItem><SelectItem value="2023.2">2023.2</SelectItem></SelectContent></Select>
                </div>
              </CardContent>
            </Card>

            <Card className="border-violet-200 dark:border-violet-800/50">
              <CardContent className="p-0">
                <Table>
                  <TableHeader><TableRow className="border-violet-100"><TableHead>Student</TableHead><TableHead>Class</TableHead><TableHead>Subject</TableHead><TableHead>Teacher</TableHead><TableHead>Semester</TableHead><TableHead>Attendance</TableHead><TableHead>Grade</TableHead><TableHead>Status</TableHead><TableHead>Actions</TableHead></TableRow></TableHeader>
                  <TableBody>
                    {(tab === 'active' ? filteredEnrollments.filter((e) => e.status === 'ACTIVE') : tab === 'dropped' ? filteredEnrollments.filter((e) => e.status === 'DROPPED') : filteredEnrollments).map((enr) => (
                      <TableRow key={enr.id} className="border-violet-100 hover:bg-violet-50/50 dark:hover:bg-violet-950/10">
                        <TableCell className="font-medium">{enr.studentName}<p className="text-xs text-muted-foreground">{enr.studentEmail}</p></TableCell>
                        <TableCell><Badge variant="outline" className="font-mono">{enr.classCode}</Badge></TableCell>
                        <TableCell>{enr.subjectName}</TableCell>
                        <TableCell className="text-sm">{enr.teacherName}</TableCell>
                        <TableCell>{enr.semester}</TableCell>
                        <TableCell>
                          <span className={cn('text-sm font-medium', enr.attendancePct >= 75 ? 'text-green-600' : 'text-red-600')}>{enr.attendancePct}%</span>
                        </TableCell>
                        <TableCell>{enr.finalGrade !== null ? <span className="font-medium">{enr.finalGrade.toFixed(1)}</span> : <span className="text-xs text-muted-foreground">—</span>}</TableCell>
                        <TableCell><Badge className={getStatusBadge(enr.status)}>{enr.status}</Badge></TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              {enr.status === 'ACTIVE' && (
                                <DropdownMenuItem onClick={() => handleStatusChange(enr.id, 'DROPPED')} className="gap-2 cursor-pointer text-red-600"><XCircle className="h-4 w-4" /> Mark Dropped</DropdownMenuItem>
                              )}
                              {enr.status === 'DROPPED' && (
                                <DropdownMenuItem onClick={() => handleStatusChange(enr.id, 'ACTIVE')} className="gap-2 cursor-pointer text-green-600"><CheckCircle2 className="h-4 w-4" /> Re-enroll</DropdownMenuItem>
                              )}
                              <DropdownMenuItem onClick={() => { setSelectedEnrollment(enr); setDetailOpen(true) }} className="gap-2 cursor-pointer"><Eye className="h-4 w-4" /> Details</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>

      {/* Create Enrollment */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle className="text-violet-700">New Enrollment</DialogTitle><DialogDescription>Select student and class.</DialogDescription></DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2"><Label>Student</Label><Select value={formData.studentId} onValueChange={(v) => setFormData({ ...formData, studentId: v })}><SelectTrigger><SelectValue placeholder="Select student" /></SelectTrigger><SelectContent>{mockStudentOptions.map((s) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent></Select></div>
            <div className="space-y-2"><Label>Class</Label><Select value={formData.classId} onValueChange={(v) => setFormData({ ...formData, classId: v })}><SelectTrigger><SelectValue placeholder="Select class" /></SelectTrigger><SelectContent>{mockClassOptions.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent></Select></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button>
            <Button onClick={handleSubmitCreate} disabled={isSubmitting || !formData.studentId || !formData.classId} className="bg-violet-600 hover:bg-violet-700">
              {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}Enroll Student
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk Enroll */}
      <Dialog open={bulkOpen} onOpenChange={setBulkOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle className="text-violet-700">Bulk Enrollment</DialogTitle><DialogDescription>Enroll multiple students in a class at once.</DialogDescription></DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2"><Label>Class</Label><Select><SelectTrigger><SelectValue placeholder="Select class" /></SelectTrigger><SelectContent>{mockClassOptions.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent></Select></div>
            <div className="space-y-2"><Label>Students (comma-separated names or IDs)</Label><Textarea placeholder="e.g. Ana Silva, João Lima, Pedro Almeida" rows={4} /></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setBulkOpen(false)}>Cancel</Button><Button className="bg-violet-600 hover:bg-violet-700">Enroll All</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Detail */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle className="text-violet-700">Enrollment Details</DialogTitle></DialogHeader>
          {selectedEnrollment && (
            <div className="space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-2">
                <div className="p-2 rounded bg-muted/50"><p className="text-xs text-muted-foreground">Student</p><p className="font-medium">{selectedEnrollment.studentName}</p></div>
                <div className="p-2 rounded bg-muted/50"><p className="text-xs text-muted-foreground">Class</p><p className="font-medium">{selectedEnrollment.classCode}</p></div>
                <div className="p-2 rounded bg-muted/50"><p className="text-xs text-muted-foreground">Enrolled</p><p className="font-medium">{selectedEnrollment.enrolledAt}</p></div>
                <div className="p-2 rounded bg-muted/50"><p className="text-xs text-muted-foreground">Status</p><Badge className={getStatusBadge(selectedEnrollment.status)}>{selectedEnrollment.status}</Badge></div>
                <div className="p-2 rounded bg-muted/50"><p className="text-xs text-muted-foreground">Attendance</p><p className="font-medium">{selectedEnrollment.attendancePct}%</p></div>
                <div className="p-2 rounded bg-muted/50"><p className="text-xs text-muted-foreground">Final Grade</p><p className="font-medium">{selectedEnrollment.finalGrade?.toFixed(1) ?? '—'}</p></div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
