'use client'

import { useState, useEffect, useMemo } from 'react'
import {
  Plus, Search, Pencil, Trash2, Eye, GraduationCap, MoreHorizontal,
  Mail, Phone, CalendarDays, Clock, Check, X, Loader2, Users, BookOpen,
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
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
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

// ---------------------------------------------------------------------------
// Types & Data
// ---------------------------------------------------------------------------

interface TeacherItem {
  id: string
  profileId: string
  firstName: string
  lastName: string
  email: string
  phone: string | null
  department: string | null
  specializations: string[]
  hireDate: string | null
  maxHoursPerWeek: number
  currentHours: number
  totalClasses: number
  totalStudents: number
  avgAttendance: number
  isActive: boolean
  availabilityApproved: boolean
}

interface TeacherFormData {
  firstName: string
  lastName: string
  email: string
  phone: string
  department: string
  specializations: string[]
  maxHoursPerWeek: number
}

const mockTeachers: TeacherItem[] = [
  { id: '1', profileId: 'p1', firstName: 'Ricardo', lastName: 'Rodrigues', email: 'rodrigues@uni.edu', phone: '(11) 99999-1111', department: 'Computer Science', specializations: ['Algorithms', 'Data Structures'], hireDate: '2018-03-15', maxHoursPerWeek: 20, currentHours: 16, totalClasses: 4, totalStudents: 140, avgAttendance: 91, isActive: true, availabilityApproved: true },
  { id: '2', profileId: 'p2', firstName: 'Ana', lastName: 'Mendes', email: 'mendes@uni.edu', phone: '(11) 99999-2222', department: 'Mathematics', specializations: ['Calculus', 'Linear Algebra'], hireDate: '2015-07-01', maxHoursPerWeek: 20, currentHours: 12, totalClasses: 3, totalStudents: 150, avgAttendance: 88, isActive: true, availabilityApproved: true },
  { id: '3', profileId: 'p3', firstName: 'Carlos', lastName: 'Ferreira', email: 'ferreira@uni.edu', phone: '(11) 99999-3333', department: 'Design', specializations: ['UX', 'UI Design'], hireDate: '2020-02-10', maxHoursPerWeek: 16, currentHours: 8, totalClasses: 2, totalStudents: 56, avgAttendance: 93, isActive: true, availabilityApproved: false },
  { id: '4', profileId: 'p4', firstName: 'Paulo', lastName: 'Almeida', email: 'almeida@uni.edu', phone: '(11) 99999-4444', department: 'Physics', specializations: ['Mechanics', 'Thermodynamics'], hireDate: '2012-01-20', maxHoursPerWeek: 20, currentHours: 10, totalClasses: 2, totalStudents: 88, avgAttendance: 85, isActive: true, availabilityApproved: true },
  { id: '5', profileId: 'p5', firstName: 'Maria', lastName: 'Costa', email: 'costa@uni.edu', phone: '(11) 99999-5555', department: 'Mathematics', specializations: ['Linear Algebra', 'Discrete Math'], hireDate: '2019-08-05', maxHoursPerWeek: 20, currentHours: 14, totalClasses: 3, totalStudents: 130, avgAttendance: 90, isActive: true, availabilityApproved: true },
  { id: '6', profileId: 'p6', firstName: 'João', lastName: 'Lima', email: 'lima@uni.edu', phone: '(11) 99999-6666', department: 'Computer Science', specializations: ['Databases', 'OS'], hireDate: '2016-04-12', maxHoursPerWeek: 20, currentHours: 18, totalClasses: 4, totalStudents: 135, avgAttendance: 87, isActive: true, availabilityApproved: true },
  { id: '7', profileId: 'p7', firstName: 'Lucia', lastName: 'Santos', email: 'santos@uni.edu', phone: '(11) 99999-7777', department: 'Computer Science', specializations: ['Web Dev', 'Mobile'], hireDate: '2021-01-15', maxHoursPerWeek: 16, currentHours: 10, totalClasses: 2, totalStudents: 70, avgAttendance: 92, isActive: true, availabilityApproved: true },
]

const DEPARTMENTS = ['Computer Science', 'Mathematics', 'Physics', 'Design', 'Engineering', 'Medicine']

const emptyFormData: TeacherFormData = { firstName: '', lastName: '', email: '', phone: '', department: '', specializations: [], maxHoursPerWeek: 20 }

export default function TeacherManagementPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [teachers, setTeachers] = useState<TeacherItem[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [filterDept, setFilterDept] = useState<string>('all')

  const [createOpen, setCreateOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [detailOpen, setDetailOpen] = useState(false)
  const [scheduleOpen, setScheduleOpen] = useState(false)

  const [formData, setFormData] = useState<TeacherFormData>(emptyFormData)
  const [selectedTeacher, setSelectedTeacher] = useState<TeacherItem | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => { setTeachers(mockTeachers); setIsLoading(false) }, 800)
    return () => clearTimeout(timer)
  }, [])

  const filteredTeachers = useMemo(() => {
    let items = [...teachers]
    if (filterDept !== 'all') items = items.filter((t) => t.department === filterDept)
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      items = items.filter((t) => `${t.firstName} ${t.lastName}`.toLowerCase().includes(q) || t.email.toLowerCase().includes(q))
    }
    return items
  }, [teachers, filterDept, searchQuery])

  const handleCreate = () => { setFormData(emptyFormData); setCreateOpen(true) }
  const handleEdit = (t: TeacherItem) => {
    setSelectedTeacher(t)
    setFormData({ firstName: t.firstName, lastName: t.lastName, email: t.email, phone: t.phone || '', department: t.department || '', specializations: [...t.specializations], maxHoursPerWeek: t.maxHoursPerWeek })
    setEditOpen(true)
  }
  const handleDelete = (t: TeacherItem) => { setSelectedTeacher(t); setDeleteOpen(true) }
  const handleView = (t: TeacherItem) => { setSelectedTeacher(t); setDetailOpen(true) }
  const handleSchedule = (t: TeacherItem) => { setSelectedTeacher(t); setScheduleOpen(true) }

  const handleSubmitCreate = async () => {
    setIsSubmitting(true); await new Promise((r) => setTimeout(r, 1200))
    setTeachers((prev) => [...prev, { id: String(Date.now()), profileId: String(Date.now()), ...formData, hireDate: null, currentHours: 0, totalClasses: 0, totalStudents: 0, avgAttendance: 0, isActive: true, availabilityApproved: false }])
    setIsSubmitting(false); setCreateOpen(false)
  }
  const handleSubmitEdit = async () => {
    setIsSubmitting(true); await new Promise((r) => setTimeout(r, 1200))
    setTeachers((prev) => prev.map((t) => t.id === selectedTeacher?.id ? { ...t, ...formData } : t))
    setIsSubmitting(false); setEditOpen(false)
  }
  const handleConfirmDelete = () => { setTeachers((prev) => prev.filter((t) => t.id !== selectedTeacher?.id)); setDeleteOpen(false) }
  const handleApproveAvailability = (id: string) => { setTeachers((prev) => prev.map((t) => t.id === id ? { ...t, availabilityApproved: true } : t)) }

  const getInitials = (f: string, l: string) => `${f[0]}${l[0]}`.toUpperCase()
  const getWorkloadColor = (current: number, max: number) => (current / max >= 0.9 ? 'text-red-600' : current / max >= 0.7 ? 'text-yellow-600' : 'text-green-600')

  if (isLoading) return <div className="flex-1 space-y-6 p-6"><Skeleton className="h-10 w-48" /><Skeleton className="h-40 w-full" /><Skeleton className="h-96 w-full" /></div>

  return (
    <div className="flex-1 space-y-6 p-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-violet-700 to-purple-500 bg-clip-text text-transparent">Teacher Management</h1>
          <p className="text-muted-foreground mt-1">Manage teacher profiles, availability, and schedules</p>
        </div>
        <Button onClick={handleCreate} className="gap-2 bg-violet-600 hover:bg-violet-700"><Plus className="h-4 w-4" /> New Teacher</Button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card className="border-violet-200 dark:border-violet-800/50">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-100 dark:bg-violet-900/50"><GraduationCap className="h-5 w-5 text-violet-600" /></div>
            <div><p className="text-sm text-muted-foreground">Total Teachers</p><p className="text-2xl font-bold">{teachers.length}</p></div>
          </CardContent>
        </Card>
        <Card className="border-violet-200 dark:border-violet-800/50">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-yellow-100 dark:bg-yellow-900/50"><Clock className="h-5 w-5 text-yellow-600" /></div>
            <div><p className="text-sm text-muted-foreground">Pending Availability</p><p className="text-2xl font-bold">{teachers.filter((t) => !t.availabilityApproved).length}</p></div>
          </CardContent>
        </Card>
        <Card className="border-violet-200 dark:border-violet-800/50">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900/50"><Users className="h-5 w-5 text-green-600" /></div>
            <div><p className="text-sm text-muted-foreground">Total Students Taught</p><p className="text-2xl font-bold">{teachers.reduce((s, t) => s + t.totalStudents, 0)}</p></div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="border-violet-200 dark:border-violet-800/50">
        <CardContent className="p-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-center">
            <div className="relative flex-1"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input placeholder="Buscar por nome ou e-mail..." className="pl-9" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} /></div>
            <Select value={filterDept} onValueChange={setFilterDept}><SelectTrigger className="w-48"><SelectValue placeholder="Departamento" /></SelectTrigger><SelectContent><SelectItem value="all">Todos os departamentos</SelectItem>{DEPARTMENTS.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent></Select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="border-violet-200 dark:border-violet-800/50">
        <CardContent className="p-0">
          <Table>
            <TableHeader><TableRow className="border-violet-100"><TableHead>Teacher</TableHead><TableHead>Department</TableHead><TableHead>Classes</TableHead><TableHead>Students</TableHead><TableHead>Workload</TableHead><TableHead>Avg Attendance</TableHead><TableHead>Availability</TableHead><TableHead className="w-12"></TableHead></TableRow></TableHeader>
            <TableBody>
              {filteredTeachers.map((t) => (
                <TableRow key={t.id} className="border-violet-100 hover:bg-violet-50/50 dark:hover:bg-violet-950/10">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9"><AvatarFallback className="bg-violet-100 text-violet-700 text-xs font-medium">{getInitials(t.firstName, t.lastName)}</AvatarFallback></Avatar>
                      <div><p className="text-sm font-medium">{t.firstName} {t.lastName}</p><p className="text-xs text-muted-foreground">{t.email}</p></div>
                    </div>
                  </TableCell>
                  <TableCell><Badge variant="secondary">{t.department}</Badge></TableCell>
                  <TableCell><div className="flex items-center gap-1"><BookOpen className="h-3.5 w-3.5 text-muted-foreground" />{t.totalClasses}</div></TableCell>
                  <TableCell><div className="flex items-center gap-1"><Users className="h-3.5 w-3.5 text-muted-foreground" />{t.totalStudents}</div></TableCell>
                  <TableCell>
                    <span className={cn('text-sm font-medium', getWorkloadColor(t.currentHours, t.maxHoursPerWeek))}>
                      {t.currentHours}/{t.maxHoursPerWeek}h
                    </span>
                  </TableCell>
                  <TableCell><span className="text-sm">{t.avgAttendance}%</span></TableCell>
                  <TableCell>
                    {t.availabilityApproved ? (
                      <Badge className="bg-green-100 text-green-700 gap-1"><Check className="h-3 w-3" /> Approved</Badge>
                    ) : (
                      <Button size="sm" variant="outline" className="gap-1 h-7 text-xs border-yellow-300 text-yellow-700" onClick={() => handleApproveAvailability(t.id)}>
                        <Check className="h-3 w-3" /> Approve
                      </Button>
                    )}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleView(t)} className="gap-2 cursor-pointer"><Eye className="h-4 w-4" /> View Details</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleSchedule(t)} className="gap-2 cursor-pointer"><CalendarDays className="h-4 w-4" /> View Schedule</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleEdit(t)} className="gap-2 cursor-pointer"><Pencil className="h-4 w-4" /> Edit</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDelete(t)} className="gap-2 cursor-pointer text-red-600 focus:text-red-600"><Trash2 className="h-4 w-4" /> Delete</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Create/Edit */}
      <Dialog open={createOpen || editOpen} onOpenChange={() => { setCreateOpen(false); setEditOpen(false) }}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle className="text-violet-700">{createOpen ? 'Create New Teacher' : 'Edit Teacher'}</DialogTitle><DialogDescription>{createOpen ? 'Add a new teacher to the institution.' : `Editing ${selectedTeacher?.firstName} ${selectedTeacher?.lastName}`}</DialogDescription></DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Nome</Label><Input placeholder="Nome" value={formData.firstName} onChange={(e) => setFormData({ ...formData, firstName: e.target.value })} /></div>
              <div className="space-y-2"><Label>Sobrenome</Label><Input placeholder="Sobrenome" value={formData.lastName} onChange={(e) => setFormData({ ...formData, lastName: e.target.value })} /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Email</Label><Input type="email" placeholder="teacher@uni.edu" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} /></div>
              <div className="space-y-2"><Label>Phone</Label><Input placeholder="(11) 99999-0000" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} /></div>
            </div>
            <div className="space-y-2"><Label>Departamento</Label><Select value={formData.department} onValueChange={(v) => setFormData({ ...formData, department: v })}><SelectTrigger><SelectValue placeholder="Selecione o departamento" /></SelectTrigger><SelectContent>{DEPARTMENTS.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent></Select></div>
            <div className="space-y-2"><Label>Max Hours/Week</Label><Input type="number" min={1} max={40} value={formData.maxHoursPerWeek} onChange={(e) => setFormData({ ...formData, maxHoursPerWeek: parseInt(e.target.value) || 0 })} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setCreateOpen(false); setEditOpen(false) }}>Cancel</Button>
            <Button onClick={createOpen ? handleSubmitCreate : handleSubmitEdit} disabled={isSubmitting} className="bg-violet-600 hover:bg-violet-700">
              {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}{createOpen ? 'Create Teacher' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Delete Teacher</AlertDialogTitle><AlertDialogDescription>Delete <strong>{selectedTeacher?.firstName} {selectedTeacher?.lastName}</strong>? This cannot be undone.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={handleConfirmDelete} className="bg-red-600 hover:bg-red-700">Delete</AlertDialogAction></AlertDialogFooter></AlertDialogContent>
      </AlertDialog>

      {/* Detail */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle className="text-violet-700">{selectedTeacher?.firstName} {selectedTeacher?.lastName}</DialogTitle></DialogHeader>
          {selectedTeacher && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16"><AvatarFallback className="bg-violet-100 text-violet-700 text-xl font-medium">{getInitials(selectedTeacher.firstName, selectedTeacher.lastName)}</AvatarFallback></Avatar>
                <div><p className="text-muted-foreground">{selectedTeacher.email}</p><p className="text-muted-foreground">{selectedTeacher.phone}</p><Badge variant="secondary">{selectedTeacher.department}</Badge></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg bg-muted/50"><p className="text-xs text-muted-foreground">Classes</p><p className="font-medium text-lg">{selectedTeacher.totalClasses}</p></div>
                <div className="p-3 rounded-lg bg-muted/50"><p className="text-xs text-muted-foreground">Students</p><p className="font-medium text-lg">{selectedTeacher.totalStudents}</p></div>
                <div className="p-3 rounded-lg bg-muted/50"><p className="text-xs text-muted-foreground">Workload</p><p className="font-medium text-lg">{selectedTeacher.currentHours}/{selectedTeacher.maxHoursPerWeek}h</p><Progress value={(selectedTeacher.currentHours / selectedTeacher.maxHoursPerWeek) * 100} className="h-2 mt-2" /></div>
                <div className="p-3 rounded-lg bg-muted/50"><p className="text-xs text-muted-foreground">Avg Attendance</p><p className="font-medium text-lg">{selectedTeacher.avgAttendance}%</p></div>
              </div>
              <div><p className="text-xs text-muted-foreground mb-2">Specializations</p><div className="flex gap-1 flex-wrap">{selectedTeacher.specializations.map((s) => <Badge key={s} variant="outline">{s}</Badge>)}</div></div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Schedule */}
      <Dialog open={scheduleOpen} onOpenChange={setScheduleOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle className="text-violet-700">Schedule - {selectedTeacher?.firstName} {selectedTeacher?.lastName}</DialogTitle><DialogDescription>Current semester schedule</DialogDescription></DialogHeader>
          <div className="space-y-3">
            {['MONDAY 08:00-09:50 Data Structures (Lab A)', 'TUESDAY 08:00-09:50 Algorithms (Lab B)', 'FRIDAY 10:00-11:50 Physics I (Room 101)'].map((item, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-lg border border-violet-100 bg-violet-50/50">
                <CalendarDays className="h-4 w-4 text-violet-600" /><span className="text-sm">{item}</span>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
