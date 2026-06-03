'use client'

import { useState, useEffect, useMemo } from 'react'
import {
  Plus, Search, Pencil, Trash2, Eye, BookOpen, MoreHorizontal,
  Mail, Phone, GraduationCap, CalendarDays, CheckCircle2, XCircle,
  Loader2, Users, Download, Upload, UserPlus, UserMinus,
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

// ---------------------------------------------------------------------------
// Types & Data
// ---------------------------------------------------------------------------

interface StudentItem {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string | null
  enrollmentNumber: string
  course: string
  semester: number
  shift: string
  status: string
  attendancePct: number
  gpa: number
  enrollmentsCount: number
}

interface StudentFormData {
  firstName: string
  lastName: string
  email: string
  phone: string
  enrollmentNumber: string
  course: string
  semester: number
  shift: string
}

const mockStudents: StudentItem[] = [
  { id: '1', firstName: 'Ana', lastName: 'Silva', email: 'ana.silva@uni.edu', phone: '(11) 98888-1111', enrollmentNumber: '2024001001', course: 'Computer Science', semester: 4, shift: 'Morning', status: 'active', attendancePct: 92, gpa: 8.5, enrollmentsCount: 5 },
  { id: '2', firstName: 'Carlos', lastName: 'Oliveira', email: 'carlos.oliveira@uni.edu', phone: '(11) 98888-2222', enrollmentNumber: '2024001002', course: 'Engineering', semester: 2, shift: 'Afternoon', status: 'active', attendancePct: 78, gpa: 7.2, enrollmentsCount: 6 },
  { id: '3', firstName: 'Maria', lastName: 'Santos', email: 'maria.santos@uni.edu', phone: '(11) 98888-3333', enrollmentNumber: '2024001003', course: 'Design', semester: 1, shift: 'Morning', status: 'active', attendancePct: 95, gpa: 9.1, enrollmentsCount: 4 },
  { id: '4', firstName: 'João', lastName: 'Lima', email: 'joao.lima@uni.edu', phone: '(11) 98888-4444', enrollmentNumber: '2024001004', course: 'Computer Science', semester: 6, shift: 'Night', status: 'active', attendancePct: 85, gpa: 7.8, enrollmentsCount: 4 },
  { id: '5', firstName: 'Beatriz', lastName: 'Costa', email: 'beatriz.costa@uni.edu', phone: '(11) 98888-5555', enrollmentNumber: '2024001005', course: 'Medicine', semester: 3, shift: 'Morning', status: 'suspended', attendancePct: 45, gpa: 5.2, enrollmentsCount: 6 },
  { id: '6', firstName: 'Pedro', lastName: 'Almeida', email: 'pedro.almeida@uni.edu', phone: '(11) 98888-6666', enrollmentNumber: '2024001006', course: 'Engineering', semester: 4, shift: 'Afternoon', status: 'active', attendancePct: 88, gpa: 8.0, enrollmentsCount: 5 },
  { id: '7', firstName: 'Lucia', lastName: 'Ferreira', email: 'lucia.ferreira@uni.edu', phone: '(11) 98888-7777', enrollmentNumber: '2024001007', course: 'Design', semester: 2, shift: 'Morning', status: 'active', attendancePct: 91, gpa: 8.7, enrollmentsCount: 5 },
  { id: '8', firstName: 'Rafael', lastName: 'Souza', email: 'rafael.souza@uni.edu', phone: '(11) 98888-8888', enrollmentNumber: '2024001008', course: 'Computer Science', semester: 1, shift: 'Night', status: 'active', attendancePct: 96, gpa: 9.3, enrollmentsCount: 4 },
]

const COURSES = ['Computer Science', 'Engineering', 'Design', 'Medicine']
const SHIFTS = ['Morning', 'Afternoon', 'Night']
const mockClasses = [
  { id: 'c1', code: 'CS201-A', name: 'Data Structures - A' },
  { id: 'c2', code: 'CS301-A', name: 'Algorithms - A' },
  { id: 'c3', code: 'DS110-A', name: 'UX Fundamentals - A' },
]

const emptyFormData: StudentFormData = { firstName: '', lastName: '', email: '', phone: '', enrollmentNumber: '', course: '', semester: 1, shift: 'Morning' }

export default function StudentManagementPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [students, setStudents] = useState<StudentItem[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [filterCourse, setFilterCourse] = useState<string>('all')
  const [filterSemester, setFilterSemester] = useState<string>('all')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [activeTab, setActiveTab] = useState('list')

  const [createOpen, setCreateOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [detailOpen, setDetailOpen] = useState(false)
  const [enrollOpen, setEnrollOpen] = useState(false)

  const [formData, setFormData] = useState<StudentFormData>(emptyFormData)
  const [selectedStudent, setSelectedStudent] = useState<StudentItem | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => { setStudents(mockStudents); setIsLoading(false) }, 800)
    return () => clearTimeout(timer)
  }, [])

  const filteredStudents = useMemo(() => {
    let items = [...students]
    if (filterCourse !== 'all') items = items.filter((s) => s.course === filterCourse)
    if (filterSemester !== 'all') items = items.filter((s) => s.semester.toString() === filterSemester)
    if (filterStatus !== 'all') items = items.filter((s) => s.status === filterStatus)
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      items = items.filter((s) => `${s.firstName} ${s.lastName}`.toLowerCase().includes(q) || s.enrollmentNumber.includes(q) || s.email.toLowerCase().includes(q))
    }
    return items
  }, [students, filterCourse, filterSemester, filterStatus, searchQuery])

  const handleCreate = () => { setFormData(emptyFormData); setCreateOpen(true) }
  const handleEdit = (s: StudentItem) => {
    setSelectedStudent(s)
    setFormData({ firstName: s.firstName, lastName: s.lastName, email: s.email, phone: s.phone || '', enrollmentNumber: s.enrollmentNumber, course: s.course, semester: s.semester, shift: s.shift })
    setEditOpen(true)
  }
  const handleDelete = (s: StudentItem) => { setSelectedStudent(s); setDeleteOpen(true) }
  const handleView = (s: StudentItem) => { setSelectedStudent(s); setDetailOpen(true) }
  const handleEnroll = (s: StudentItem) => { setSelectedStudent(s); setEnrollOpen(true) }

  const handleSubmitCreate = async () => {
    setIsSubmitting(true); await new Promise((r) => setTimeout(r, 1200))
    setStudents((prev) => [...prev, { id: String(Date.now()), ...formData, status: 'active', attendancePct: 100, gpa: 0, enrollmentsCount: 0 }])
    setIsSubmitting(false); setCreateOpen(false)
  }
  const handleSubmitEdit = async () => {
    setIsSubmitting(true); await new Promise((r) => setTimeout(r, 1200))
    setStudents((prev) => prev.map((s) => s.id === selectedStudent?.id ? { ...s, ...formData } : s))
    setIsSubmitting(false); setEditOpen(false)
  }
  const handleConfirmDelete = () => { setStudents((prev) => prev.filter((s) => s.id !== selectedStudent?.id)); setDeleteOpen(false) }

  const getInitials = (f: string, l: string) => `${f[0]}${l[0]}`.toUpperCase()
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-700'
      case 'suspended': return 'bg-red-100 text-red-700'
      case 'graduated': return 'bg-blue-100 text-blue-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  if (isLoading) return <div className="flex-1 space-y-6 p-6"><Skeleton className="h-10 w-48" /><Skeleton className="h-40 w-full" /><Skeleton className="h-96 w-full" /></div>

  return (
    <div className="flex-1 space-y-6 p-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-violet-700 to-purple-500 bg-clip-text text-transparent">Student Management</h1>
          <p className="text-muted-foreground mt-1">Manage student records, enrollments, and academic progress</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="gap-2"><Upload className="h-4 w-4" /> Import</Button>
          <Button variant="outline" className="gap-2"><Download className="h-4 w-4" /> Export</Button>
          <Button onClick={handleCreate} className="gap-2 bg-violet-600 hover:bg-violet-700"><Plus className="h-4 w-4" /> New Student</Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList><TabsTrigger value="list">Student List</TabsTrigger><TabsTrigger value="analytics">Analytics</TabsTrigger></TabsList>

        <TabsContent value="list" className="mt-4 space-y-4">
          <Card className="border-violet-200 dark:border-violet-800/50">
            <CardContent className="p-4">
              <div className="flex flex-col gap-3 md:flex-row md:items-center">
                <div className="relative flex-1"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input placeholder="Buscar por nome, matrícula ou e-mail..." className="pl-9" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} /></div>
                <Select value={filterCourse} onValueChange={setFilterCourse}><SelectTrigger className="w-44"><SelectValue placeholder="Curso" /></SelectTrigger><SelectContent><SelectItem value="all">Todos os cursos</SelectItem>{COURSES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select>
                <Select value={filterSemester} onValueChange={setFilterSemester}><SelectTrigger className="w-36"><SelectValue placeholder="Semestre" /></SelectTrigger><SelectContent><SelectItem value="all">Todos</SelectItem>{[1,2,3,4,5,6,7,8].map((s) => <SelectItem key={s} value={String(s)}>Semester {s}</SelectItem>)}</SelectContent></Select>
                <Select value={filterStatus} onValueChange={setFilterStatus}><SelectTrigger className="w-32"><SelectValue placeholder="Status" /></SelectTrigger><SelectContent><SelectItem value="all">Todos</SelectItem><SelectItem value="active">Ativo</SelectItem><SelectItem value="suspended">Suspenso</SelectItem></SelectContent></Select>
              </div>
            </CardContent>
          </Card>

          <Card className="border-violet-200 dark:border-violet-800/50">
            <CardContent className="p-0">
              <Table>
                <TableHeader><TableRow className="border-violet-100"><TableHead>Student</TableHead><TableHead>Enrollment #</TableHead><TableHead>Course</TableHead><TableHead>Semester</TableHead><TableHead>Attendance</TableHead><TableHead>GPA</TableHead><TableHead>Status</TableHead><TableHead className="w-12"></TableHead></TableRow></TableHeader>
                <TableBody>
                  {filteredStudents.map((s) => (
                    <TableRow key={s.id} className="border-violet-100 hover:bg-violet-50/50 dark:hover:bg-violet-950/10">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-9 w-9"><AvatarFallback className="bg-violet-100 text-violet-700 text-xs font-medium">{getInitials(s.firstName, s.lastName)}</AvatarFallback></Avatar>
                          <div><p className="text-sm font-medium">{s.firstName} {s.lastName}</p><p className="text-xs text-muted-foreground">{s.email}</p></div>
                        </div>
                      </TableCell>
                      <TableCell><Badge variant="outline" className="font-mono">{s.enrollmentNumber}</Badge></TableCell>
                      <TableCell><Badge variant="secondary">{s.course}</Badge></TableCell>
                      <TableCell> Semester {s.semester} </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Progress value={s.attendancePct} className="h-2 w-16" />
                          <span className={cn('text-xs font-medium', s.attendancePct >= 75 ? 'text-green-600' : 'text-red-600')}>{s.attendancePct}%</span>
                        </div>
                      </TableCell>
                      <TableCell><span className="text-sm font-medium">{s.gpa.toFixed(1)}</span></TableCell>
                      <TableCell><Badge className={getStatusBadge(s.status)}>{s.status}</Badge></TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleView(s)} className="gap-2 cursor-pointer"><Eye className="h-4 w-4" /> View Profile</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleEnroll(s)} className="gap-2 cursor-pointer"><UserPlus className="h-4 w-4" /> Enroll in Class</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleEdit(s)} className="gap-2 cursor-pointer"><Pencil className="h-4 w-4" /> Edit</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDelete(s)} className="gap-2 cursor-pointer text-red-600 focus:text-red-600"><Trash2 className="h-4 w-4" /> Delete</DropdownMenuItem>
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

        <TabsContent value="analytics" className="mt-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <Card className="border-violet-200 dark:border-violet-800/50">
              <CardHeader className="pb-2"><CardTitle className="text-lg">Total Students</CardTitle></CardHeader>
              <CardContent><p className="text-4xl font-bold text-violet-700">{students.length}</p><p className="text-sm text-muted-foreground mt-1">{students.filter((s) => s.status === 'active').length} active</p></CardContent>
            </Card>
            <Card className="border-violet-200 dark:border-violet-800/50">
              <CardHeader className="pb-2"><CardTitle className="text-lg">Average Attendance</CardTitle></CardHeader>
              <CardContent><p className="text-4xl font-bold text-violet-700">{Math.round(students.reduce((s, st) => s + st.attendancePct, 0) / students.length)}%</p></CardContent>
            </Card>
            <Card className="border-violet-200 dark:border-violet-800/50">
              <CardHeader className="pb-2"><CardTitle className="text-lg">Average GPA</CardTitle></CardHeader>
              <CardContent><p className="text-4xl font-bold text-violet-700">{(students.reduce((s, st) => s + st.gpa, 0) / students.length).toFixed(1)}</p></CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Create/Edit */}
      <Dialog open={createOpen || editOpen} onOpenChange={() => { setCreateOpen(false); setEditOpen(false) }}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle className="text-violet-700">{createOpen ? 'Create New Student' : 'Edit Student'}</DialogTitle><DialogDescription>{createOpen ? 'Register a new student.' : `Editing ${selectedStudent?.firstName} ${selectedStudent?.lastName}`}</DialogDescription></DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Nome</Label><Input value={formData.firstName} onChange={(e) => setFormData({ ...formData, firstName: e.target.value })} /></div>
              <div className="space-y-2"><Label>Sobrenome</Label><Input value={formData.lastName} onChange={(e) => setFormData({ ...formData, lastName: e.target.value })} /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Email</Label><Input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} /></div>
              <div className="space-y-2"><Label>Phone</Label><Input value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Enrollment Number</Label><Input value={formData.enrollmentNumber} onChange={(e) => setFormData({ ...formData, enrollmentNumber: e.target.value })} /></div>
              <div className="space-y-2"><Label>Semester</Label><Input type="number" min={1} max={12} value={formData.semester} onChange={(e) => setFormData({ ...formData, semester: parseInt(e.target.value) || 1 })} /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Curso</Label><Select value={formData.course} onValueChange={(v) => setFormData({ ...formData, course: v })}><SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger><SelectContent>{COURSES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select></div>
              <div className="space-y-2"><Label>Shift</Label><Select value={formData.shift} onValueChange={(v) => setFormData({ ...formData, shift: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{SHIFTS.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent></Select></div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setCreateOpen(false); setEditOpen(false) }}>Cancel</Button>
            <Button onClick={createOpen ? handleSubmitCreate : handleSubmitEdit} disabled={isSubmitting} className="bg-violet-600 hover:bg-violet-700">
              {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}{createOpen ? 'Create Student' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Delete Student</AlertDialogTitle><AlertDialogDescription>Delete <strong>{selectedStudent?.firstName} {selectedStudent?.lastName}</strong>? This cannot be undone.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={handleConfirmDelete} className="bg-red-600 hover:bg-red-700">Delete</AlertDialogAction></AlertDialogFooter></AlertDialogContent>
      </AlertDialog>

      {/* Detail */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle className="text-violet-700">{selectedStudent?.firstName} {selectedStudent?.lastName}</DialogTitle><DialogDescription>{selectedStudent?.enrollmentNumber}</DialogDescription></DialogHeader>
          {selectedStudent && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16"><AvatarFallback className="bg-violet-100 text-violet-700 text-xl font-medium">{getInitials(selectedStudent.firstName, selectedStudent.lastName)}</AvatarFallback></Avatar>
                <div><p className="text-muted-foreground">{selectedStudent.email}</p><p className="text-muted-foreground">{selectedStudent.phone}</p><div className="flex gap-2 mt-1"><Badge variant="secondary">{selectedStudent.course}</Badge><Badge>Semester {selectedStudent.semester}</Badge><Badge className={getStatusBadge(selectedStudent.status)}>{selectedStudent.status}</Badge></div></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg bg-muted/50"><p className="text-xs text-muted-foreground">Attendance</p><p className="font-medium text-lg">{selectedStudent.attendancePct}%</p><Progress value={selectedStudent.attendancePct} className="h-2 mt-2" /></div>
                <div className="p-3 rounded-lg bg-muted/50"><p className="text-xs text-muted-foreground">GPA</p><p className="font-medium text-lg">{selectedStudent.gpa.toFixed(1)}</p></div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Enroll */}
      <Dialog open={enrollOpen} onOpenChange={setEnrollOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle className="text-violet-700">Enroll {selectedStudent?.firstName} in Class</DialogTitle><DialogDescription>Select a class to enroll the student.</DialogDescription></DialogHeader>
          <div className="space-y-3">
            {mockClasses.map((cls) => (
              <div key={cls.id} className="flex items-center justify-between p-3 rounded-lg border border-violet-100 hover:bg-violet-50/50 cursor-pointer">
                <div><p className="text-sm font-medium">{cls.name}</p><p className="text-xs text-muted-foreground">{cls.code}</p></div>
                <Button size="sm" className="bg-violet-600 hover:bg-violet-700"><UserPlus className="h-4 w-4 mr-1" />Enroll</Button>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
