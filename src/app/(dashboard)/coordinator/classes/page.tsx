'use client'

import { useState, useEffect, useMemo } from 'react'
import {
  Plus,
  Search,
  Download,
  Upload,
  Filter,
  MoreHorizontal,
  Pencil,
  Trash2,
  Eye,
  Users,
  CalendarDays,
  BookOpen,
  MapPin,
  GraduationCap,
  X,
  Loader2,
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

// ---------------------------------------------------------------------------
// Types & Mock Data
// ---------------------------------------------------------------------------

interface ClassItem {
  id: string
  code: string
  name: string
  subject: string
  subjectCode: string
  teacher: string
  room: string
  semester: string
  weekday: string
  startTime: string
  endTime: string
  maxStudents: number
  currentStudents: number
  status: string
}

interface ClassFormData {
  subjectId: string
  teacherId: string
  roomId: string
  semesterId: string
  code: string
  name: string
  maxStudents: number
  weekday: string
  startTime: string
  endTime: string
}

const mockClasses: ClassItem[] = [
  { id: '1', code: 'CS201-A', name: 'Data Structures - Turma A', subject: 'Data Structures', subjectCode: 'CS201', teacher: 'Prof. Rodrigues', room: 'Lab A', semester: '2024.1', weekday: 'MONDAY', startTime: '08:00', endTime: '09:50', maxStudents: 40, currentStudents: 35, status: 'ACTIVE' },
  { id: '2', code: 'MA102-A', name: 'Calculus II - Turma A', subject: 'Calculus II', subjectCode: 'MA102', teacher: 'Prof. Mendes', room: 'Room 101', semester: '2024.1', weekday: 'MONDAY', startTime: '10:00', endTime: '11:50', maxStudents: 50, currentStudents: 48, status: 'ACTIVE' },
  { id: '3', code: 'DS110-A', name: 'UX Fundamentals - Turma A', subject: 'UX Fundamentals', subjectCode: 'DS110', teacher: 'Prof. Ferreira', room: 'Studio 1', semester: '2024.1', weekday: 'MONDAY', startTime: '14:00', endTime: '15:50', maxStudents: 30, currentStudents: 28, status: 'ACTIVE' },
  { id: '4', code: 'CS301-A', name: 'Algorithms - Turma A', subject: 'Algorithms', subjectCode: 'CS301', teacher: 'Prof. Rodrigues', room: 'Lab B', semester: '2024.1', weekday: 'TUESDAY', startTime: '08:00', endTime: '09:50', maxStudents: 35, currentStudents: 33, status: 'ACTIVE' },
  { id: '5', code: 'MA201-A', name: 'Linear Algebra - Turma A', subject: 'Linear Algebra', subjectCode: 'MA201', teacher: 'Prof. Costa', room: 'Room 102', semester: '2024.1', weekday: 'TUESDAY', startTime: '10:00', endTime: '11:50', maxStudents: 45, currentStudents: 42, status: 'ACTIVE' },
  { id: '6', code: 'CS202-A', name: 'Web Development - Turma A', subject: 'Web Development', subjectCode: 'CS202', teacher: 'Prof. Santos', room: 'Lab A', semester: '2024.1', weekday: 'TUESDAY', startTime: '14:00', endTime: '15:50', maxStudents: 35, currentStudents: 35, status: 'ACTIVE' },
  { id: '7', code: 'CS303-A', name: 'Database Systems - Turma A', subject: 'Database Systems', subjectCode: 'CS303', teacher: 'Prof. Lima', room: 'Lab A', semester: '2024.1', weekday: 'WEDNESDAY', startTime: '08:00', endTime: '09:50', maxStudents: 35, currentStudents: 30, status: 'ACTIVE' },
  { id: '8', code: 'PH101-A', name: 'Physics I - Turma A', subject: 'Physics I', subjectCode: 'PH101', teacher: 'Prof. Almeida', room: 'Room 101', semester: '2024.1', weekday: 'FRIDAY', startTime: '08:00', endTime: '09:50', maxStudents: 50, currentStudents: 38, status: 'ACTIVE' },
  { id: '9', code: 'CS401-A', name: 'Operating Systems - Turma A', subject: 'Operating Systems', subjectCode: 'CS401', teacher: 'Prof. Lima', room: 'Lab B', semester: '2023.2', weekday: 'THURSDAY', startTime: '08:00', endTime: '09:50', maxStudents: 30, currentStudents: 25, status: 'COMPLETED' },
]

const mockSubjects = [
  { id: '1', name: 'Data Structures (CS201)' },
  { id: '2', name: 'Calculus II (MA102)' },
  { id: '3', name: 'UX Fundamentals (DS110)' },
  { id: '4', name: 'Algorithms (CS301)' },
  { id: '5', name: 'Linear Algebra (MA201)' },
  { id: '6', name: 'Web Development (CS202)' },
  { id: '7', name: 'Database Systems (CS303)' },
  { id: '8', name: 'Physics I (PH101)' },
]

const mockTeachers = [
  { id: '1', name: 'Prof. Rodrigues' },
  { id: '2', name: 'Prof. Mendes' },
  { id: '3', name: 'Prof. Ferreira' },
  { id: '4', name: 'Prof. Almeida' },
  { id: '5', name: 'Prof. Costa' },
  { id: '6', name: 'Prof. Lima' },
  { id: '7', name: 'Prof. Santos' },
]

const mockRooms = [
  { id: '1', name: 'Lab A' },
  { id: '2', name: 'Lab B' },
  { id: '3', name: 'Room 101' },
  { id: '4', name: 'Room 102' },
  { id: '5', name: 'Studio 1' },
]

const emptyFormData: ClassFormData = {
  subjectId: '',
  teacherId: '',
  roomId: '',
  semesterId: '2024.1',
  code: '',
  name: '',
  maxStudents: 40,
  weekday: 'MONDAY',
  startTime: '08:00',
  endTime: '09:50',
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function ClassManagementPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [classes, setClasses] = useState<ClassItem[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [filterSemester, setFilterSemester] = useState<string>('all')
  const [filterSubject, setFilterSubject] = useState<string>('all')
  const [filterTeacher, setFilterTeacher] = useState<string>('all')
  const [filterStatus, setFilterStatus] = useState<string>('all')

  // Dialog states
  const [createOpen, setCreateOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [detailOpen, setDetailOpen] = useState(false)
  const [studentsOpen, setStudentsOpen] = useState(false)

  const [formData, setFormData] = useState<ClassFormData>(emptyFormData)
  const [selectedClass, setSelectedClass] = useState<ClassItem | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setClasses(mockClasses)
      setIsLoading(false)
    }, 1000)
    return () => clearTimeout(timer)
  }, [])

  const filteredClasses = useMemo(() => {
    let items = [...classes]
    if (filterSemester !== 'all') items = items.filter((c) => c.semester === filterSemester)
    if (filterSubject !== 'all') items = items.filter((c) => c.subject === filterSubject)
    if (filterTeacher !== 'all') items = items.filter((c) => c.teacher === filterTeacher)
    if (filterStatus !== 'all') items = items.filter((c) => c.status === filterStatus)
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      items = items.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.code.toLowerCase().includes(q) ||
          c.subject.toLowerCase().includes(q) ||
          c.teacher.toLowerCase().includes(q)
      )
    }
    return items
  }, [classes, filterSemester, filterSubject, filterTeacher, filterStatus, searchQuery])

  const handleCreate = () => {
    setFormData(emptyFormData)
    setCreateOpen(true)
  }

  const handleEdit = (cls: ClassItem) => {
    setSelectedClass(cls)
    setFormData({
      subjectId: cls.subjectCode,
      teacherId: cls.teacher,
      roomId: cls.room,
      semesterId: cls.semester,
      code: cls.code,
      name: cls.name,
      maxStudents: cls.maxStudents,
      weekday: cls.weekday,
      startTime: cls.startTime,
      endTime: cls.endTime,
    })
    setEditOpen(true)
  }

  const handleDelete = (cls: ClassItem) => {
    setSelectedClass(cls)
    setDeleteOpen(true)
  }

  const handleViewDetail = (cls: ClassItem) => {
    setSelectedClass(cls)
    setDetailOpen(true)
  }

  const handleViewStudents = (cls: ClassItem) => {
    setSelectedClass(cls)
    setStudentsOpen(true)
  }

  const handleSubmitCreate = async () => {
    setIsSubmitting(true)
    await new Promise((r) => setTimeout(r, 1500))
    const newItem: ClassItem = {
      id: String(Date.now()),
      code: formData.code,
      name: formData.name,
      subject: formData.subjectId,
      subjectCode: formData.subjectId,
      teacher: formData.teacherId,
      room: formData.roomId,
      semester: formData.semesterId,
      weekday: formData.weekday,
      startTime: formData.startTime,
      endTime: formData.endTime,
      maxStudents: formData.maxStudents,
      currentStudents: 0,
      status: 'ACTIVE',
    }
    setClasses((prev) => [...prev, newItem])
    setIsSubmitting(false)
    setCreateOpen(false)
  }

  const handleSubmitEdit = async () => {
    setIsSubmitting(true)
    await new Promise((r) => setTimeout(r, 1500))
    setClasses((prev) =>
      prev.map((c) => (c.id === selectedClass?.id ? { ...c, ...formData, subject: formData.subjectId, teacher: formData.teacherId, room: formData.roomId } as ClassItem : c))
    )
    setIsSubmitting(false)
    setEditOpen(false)
  }

  const handleConfirmDelete = async () => {
    setClasses((prev) => prev.filter((c) => c.id !== selectedClass?.id))
    setDeleteOpen(false)
  }

  const getOccupancyColor = (current: number, max: number) => {
    const pct = (current / max) * 100
    if (pct >= 90) return 'text-red-600'
    if (pct >= 70) return 'text-yellow-600'
    return 'text-green-600'
  }

  if (isLoading) {
    return (
      <div className="flex-1 space-y-6 p-6">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    )
  }

  return (
    <div className="flex-1 space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-violet-700 to-purple-500 bg-clip-text text-transparent">
            Class Management
          </h1>
          <p className="text-muted-foreground mt-1">Create, edit, and manage all classes</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="gap-2">
            <Upload className="h-4 w-4" /> Import
          </Button>
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" /> Export
          </Button>
          <Button onClick={handleCreate} className="gap-2 bg-violet-600 hover:bg-violet-700">
            <Plus className="h-4 w-4" /> New Class
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="border-violet-200 dark:border-violet-800/50">
        <CardContent className="p-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search classes..." className="pl-9" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
            </div>
            <Select value={filterSemester} onValueChange={setFilterSemester}>
              <SelectTrigger className="w-36"><SelectValue placeholder="Semester" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Semesters</SelectItem>
                <SelectItem value="2024.1">2024.1</SelectItem>
                <SelectItem value="2023.2">2023.2</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterSubject} onValueChange={setFilterSubject}>
              <SelectTrigger className="w-44"><SelectValue placeholder="Subject" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Subjects</SelectItem>
                {mockSubjects.map((s) => <SelectItem key={s.id} value={s.name}>{s.name}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={filterTeacher} onValueChange={setFilterTeacher}>
              <SelectTrigger className="w-44"><SelectValue placeholder="Teacher" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Teachers</SelectItem>
                {mockTeachers.map((t) => <SelectItem key={t.id} value={t.name}>{t.name}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-32"><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="ACTIVE">Active</SelectItem>
                <SelectItem value="COMPLETED">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="border-violet-200 dark:border-violet-800/50">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-violet-100">
                <TableHead>Code</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Teacher</TableHead>
                <TableHead>Room</TableHead>
                <TableHead>Schedule</TableHead>
                <TableHead>Students</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredClasses.map((cls) => (
                <TableRow key={cls.id} className="border-violet-100 hover:bg-violet-50/50 dark:hover:bg-violet-950/10">
                  <TableCell><Badge variant="outline" className="font-mono">{cls.code}</Badge></TableCell>
                  <TableCell className="font-medium max-w-[200px] truncate">{cls.name}</TableCell>
                  <TableCell>{cls.subject}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5">
                      <GraduationCap className="h-3.5 w-3.5 text-muted-foreground" />
                      {cls.teacher}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                      {cls.room}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5">
                      <CalendarDays className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="text-xs">{cls.weekday.slice(0, 3)}</span>
                      <span className="text-xs text-muted-foreground">{cls.startTime}-{cls.endTime}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className={cn('text-sm font-medium', getOccupancyColor(cls.currentStudents, cls.maxStudents))}>
                      {cls.currentStudents}/{cls.maxStudents}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge className={cls.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}>
                      {cls.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleViewDetail(cls)} className="gap-2 cursor-pointer">
                          <Eye className="h-4 w-4" /> View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleViewStudents(cls)} className="gap-2 cursor-pointer">
                          <Users className="h-4 w-4" /> View Students
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleEdit(cls)} className="gap-2 cursor-pointer">
                          <Pencil className="h-4 w-4" /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDelete(cls)} className="gap-2 cursor-pointer text-red-600 focus:text-red-600">
                          <Trash2 className="h-4 w-4" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
              {filteredClasses.length === 0 && (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-12 text-muted-foreground">
                    No classes found. Try adjusting your filters or create a new class.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Create Class Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-violet-700">Create New Class</DialogTitle>
            <DialogDescription>Add a new class with subject, teacher, room, and schedule.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Class Code</Label>
                <Input placeholder="e.g. CS201-A" value={formData.code} onChange={(e) => setFormData({ ...formData, code: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Class Name</Label>
                <Input placeholder="e.g. Data Structures - Turma A" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Subject</Label>
                <Select value={formData.subjectId} onValueChange={(v) => setFormData({ ...formData, subjectId: v })}>
                  <SelectTrigger><SelectValue placeholder="Select subject" /></SelectTrigger>
                  <SelectContent>
                    {mockSubjects.map((s) => <SelectItem key={s.id} value={s.name}>{s.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Teacher</Label>
                <Select value={formData.teacherId} onValueChange={(v) => setFormData({ ...formData, teacherId: v })}>
                  <SelectTrigger><SelectValue placeholder="Select teacher" /></SelectTrigger>
                  <SelectContent>
                    {mockTeachers.map((t) => <SelectItem key={t.id} value={t.name}>{t.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Room</Label>
                <Select value={formData.roomId} onValueChange={(v) => setFormData({ ...formData, roomId: v })}>
                  <SelectTrigger><SelectValue placeholder="Select room" /></SelectTrigger>
                  <SelectContent>
                    {mockRooms.map((r) => <SelectItem key={r.id} value={r.name}>{r.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Semester</Label>
                <Select value={formData.semesterId} onValueChange={(v) => setFormData({ ...formData, semesterId: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2024.1">2024.1</SelectItem>
                    <SelectItem value="2024.2">2024.2</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Weekday</Label>
                <Select value={formData.weekday} onValueChange={(v) => setFormData({ ...formData, weekday: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'].map((d) => (
                      <SelectItem key={d} value={d}>{d.charAt(0) + d.slice(1).toLowerCase()}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Max Students</Label>
                <Input type="number" min={1} value={formData.maxStudents} onChange={(e) => setFormData({ ...formData, maxStudents: parseInt(e.target.value) || 0 })} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Start Time</Label>
                <Input type="time" value={formData.startTime} onChange={(e) => setFormData({ ...formData, startTime: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>End Time</Label>
                <Input type="time" value={formData.endTime} onChange={(e) => setFormData({ ...formData, endTime: e.target.value })} />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button>
            <Button onClick={handleSubmitCreate} disabled={isSubmitting} className="bg-violet-600 hover:bg-violet-700">
              {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Create Class
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog (reuses same form) */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-violet-700">Edit Class</DialogTitle>
            <DialogDescription>Update class details for {selectedClass?.name}</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Class Code</Label><Input value={formData.code} onChange={(e) => setFormData({ ...formData, code: e.target.value })} /></div>
              <div className="space-y-2"><Label>Class Name</Label><Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Teacher</Label>
                <Select value={formData.teacherId} onValueChange={(v) => setFormData({ ...formData, teacherId: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{mockTeachers.map((t) => <SelectItem key={t.id} value={t.name}>{t.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Room</Label>
                <Select value={formData.roomId} onValueChange={(v) => setFormData({ ...formData, roomId: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{mockRooms.map((r) => <SelectItem key={r.id} value={r.name}>{r.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Weekday</Label>
                <Select value={formData.weekday} onValueChange={(v) => setFormData({ ...formData, weekday: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'].map((d) => (
                      <SelectItem key={d} value={d}>{d.charAt(0) + d.slice(1).toLowerCase()}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2"><Label>Start Time</Label><Input type="time" value={formData.startTime} onChange={(e) => setFormData({ ...formData, startTime: e.target.value })} /></div>
              <div className="space-y-2"><Label>End Time</Label><Input type="time" value={formData.endTime} onChange={(e) => setFormData({ ...formData, endTime: e.target.value })} /></div>
            </div>
            <div className="space-y-2"><Label>Max Students</Label><Input type="number" min={1} value={formData.maxStudents} onChange={(e) => setFormData({ ...formData, maxStudents: parseInt(e.target.value) || 0 })} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>Cancel</Button>
            <Button onClick={handleSubmitEdit} disabled={isSubmitting} className="bg-violet-600 hover:bg-violet-700">
              {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Class</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <strong>{selectedClass?.name}</strong> ({selectedClass?.code})?
              This action cannot be undone. All associated enrollments and sessions will be removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete} className="bg-red-600 hover:bg-red-700">
              Delete Class
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Detail View */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-violet-700">{selectedClass?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {selectedClass && (
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><span className="text-muted-foreground">Code:</span> <Badge variant="outline" className="font-mono ml-1">{selectedClass.code}</Badge></div>
                <div><span className="text-muted-foreground">Status:</span> <Badge className="ml-1">{selectedClass.status}</Badge></div>
                <div><span className="text-muted-foreground">Subject:</span> <span className="ml-1">{selectedClass.subject}</span></div>
                <div><span className="text-muted-foreground">Teacher:</span> <span className="ml-1">{selectedClass.teacher}</span></div>
                <div><span className="text-muted-foreground">Room:</span> <span className="ml-1">{selectedClass.room}</span></div>
                <div><span className="text-muted-foreground">Semester:</span> <span className="ml-1">{selectedClass.semester}</span></div>
                <div><span className="text-muted-foreground">Schedule:</span> <span className="ml-1">{selectedClass.weekday.slice(0,3)} {selectedClass.startTime}-{selectedClass.endTime}</span></div>
                <div><span className="text-muted-foreground">Occupancy:</span> <span className={cn('ml-1 font-medium', getOccupancyColor(selectedClass.currentStudents, selectedClass.maxStudents))}>{selectedClass.currentStudents}/{selectedClass.maxStudents}</span></div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Enrolled Students View */}
      <Dialog open={studentsOpen} onOpenChange={setStudentsOpen}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-violet-700">Enrolled Students - {selectedClass?.code}</DialogTitle>
            <DialogDescription>{selectedClass?.currentStudents} of {selectedClass?.maxStudents} seats filled</DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            {Array.from({ length: selectedClass?.currentStudents || 0 }, (_, i) => (
              <div key={i} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-violet-100 text-violet-700 text-xs font-medium">
                  S{i + 1}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Student Name {i + 1}</p>
                  <p className="text-xs text-muted-foreground">enrollment_{(i + 1).toString().padStart(4, '0')}</p>
                </div>
                <Badge variant="outline" className="text-xs">ACTIVE</Badge>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
