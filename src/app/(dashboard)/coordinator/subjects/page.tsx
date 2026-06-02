'use client'

import { useState, useEffect, useMemo } from 'react'
import {
  Plus, Search, Pencil, Trash2, Eye, BookOpen, MoreHorizontal,
  GraduationCap, Clock, Link as LinkIcon, Loader2, Filter,
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
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
import { Textarea } from '@/components/ui/textarea'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

// ---------------------------------------------------------------------------
// Types & Data
// ---------------------------------------------------------------------------

interface SubjectItem {
  id: string
  code: string
  name: string
  description: string
  courseId: string
  courseName: string
  credits: number
  workload: number
  semester: number | null
  prerequisites: string[]
  isActive: boolean
}

interface SubjectFormData {
  code: string
  name: string
  description: string
  courseId: string
  credits: number
  workload: number
  semester: number | null
  prerequisites: string[]
}

const mockSubjects: SubjectItem[] = [
  { id: '1', code: 'CS101', name: 'Introduction to CS', description: 'Fundamentals of computer science and programming', courseId: 'cs', courseName: 'Computer Science', credits: 4, workload: 60, semester: 1, prerequisites: [], isActive: true },
  { id: '2', code: 'CS201', name: 'Data Structures', description: 'Arrays, linked lists, trees, graphs, and algorithms', courseId: 'cs', courseName: 'Computer Science', credits: 4, workload: 60, semester: 2, prerequisites: ['CS101'], isActive: true },
  { id: '3', code: 'CS301', name: 'Algorithms', description: 'Design and analysis of algorithms', courseId: 'cs', courseName: 'Computer Science', credits: 4, workload: 60, semester: 3, prerequisites: ['CS201'], isActive: true },
  { id: '4', code: 'CS202', name: 'Web Development', description: 'Full-stack web application development', courseId: 'cs', courseName: 'Computer Science', credits: 4, workload: 60, semester: 2, prerequisites: ['CS101'], isActive: true },
  { id: '5', code: 'CS303', name: 'Database Systems', description: 'Relational databases, SQL, and data modeling', courseId: 'cs', courseName: 'Computer Science', credits: 4, workload: 60, semester: 3, prerequisites: ['CS201'], isActive: true },
  { id: '6', code: 'CS401', name: 'Operating Systems', description: 'Process management, memory, file systems', courseId: 'cs', courseName: 'Computer Science', credits: 4, workload: 60, semester: 4, prerequisites: ['CS301', 'CS303'], isActive: true },
  { id: '7', code: 'MA101', name: 'Calculus I', description: 'Limits, derivatives, and integrals', courseId: 'eng', courseName: 'Engineering', credits: 4, workload: 60, semester: 1, prerequisites: [], isActive: true },
  { id: '8', code: 'MA102', name: 'Calculus II', description: 'Integration techniques and series', courseId: 'eng', courseName: 'Engineering', credits: 4, workload: 60, semester: 2, prerequisites: ['MA101'], isActive: true },
  { id: '9', code: 'MA201', name: 'Linear Algebra', description: 'Vectors, matrices, and linear transformations', courseId: 'eng', courseName: 'Engineering', credits: 3, workload: 45, semester: 2, prerequisites: ['MA101'], isActive: true },
  { id: '10', code: 'DS110', name: 'UX Fundamentals', description: 'User experience design principles', courseId: 'des', courseName: 'Design', credits: 3, workload: 45, semester: 1, prerequisites: [], isActive: true },
  { id: '11', code: 'PH101', name: 'Physics I', description: 'Mechanics and thermodynamics', courseId: 'eng', courseName: 'Engineering', credits: 4, workload: 60, semester: 1, prerequisites: [], isActive: true },
]

const mockCourses = [
  { id: 'cs', name: 'Computer Science' },
  { id: 'eng', name: 'Engineering' },
  { id: 'des', name: 'Design' },
  { id: 'med', name: 'Medicine' },
]

const allSubjectCodes = mockSubjects.map((s) => ({ id: s.code, name: `${s.code} - ${s.name}` }))

const emptyFormData: SubjectFormData = { code: '', name: '', description: '', courseId: '', credits: 4, workload: 60, semester: 1, prerequisites: [] }

export default function SubjectManagementPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [subjects, setSubjects] = useState<SubjectItem[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [filterCourse, setFilterCourse] = useState<string>('all')
  const [filterSemester, setFilterSemester] = useState<string>('all')
  const [filterActive, setFilterActive] = useState<string>('all')

  const [createOpen, setCreateOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [detailOpen, setDetailOpen] = useState(false)

  const [formData, setFormData] = useState<SubjectFormData>(emptyFormData)
  const [selectedSubject, setSelectedSubject] = useState<SubjectItem | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => { setSubjects(mockSubjects); setIsLoading(false) }, 800)
    return () => clearTimeout(timer)
  }, [])

  const filteredSubjects = useMemo(() => {
    let items = [...subjects]
    if (filterCourse !== 'all') items = items.filter((s) => s.courseId === filterCourse)
    if (filterSemester !== 'all') items = items.filter((s) => s.semester?.toString() === filterSemester)
    if (filterActive !== 'all') items = items.filter((s) => filterActive === 'active' ? s.isActive : !s.isActive)
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      items = items.filter((s) => s.name.toLowerCase().includes(q) || s.code.toLowerCase().includes(q))
    }
    return items
  }, [subjects, filterCourse, filterSemester, filterActive, searchQuery])

  const handleCreate = () => { setFormData(emptyFormData); setCreateOpen(true) }
  const handleEdit = (sub: SubjectItem) => {
    setSelectedSubject(sub)
    setFormData({ code: sub.code, name: sub.name, description: sub.description, courseId: sub.courseId, credits: sub.credits, workload: sub.workload, semester: sub.semester, prerequisites: [...sub.prerequisites] })
    setEditOpen(true)
  }
  const handleDelete = (sub: SubjectItem) => { setSelectedSubject(sub); setDeleteOpen(true) }
  const handleView = (sub: SubjectItem) => { setSelectedSubject(sub); setDetailOpen(true) }

  const togglePrerequisite = (code: string) => {
    setFormData((prev) => ({
      ...prev,
      prerequisites: prev.prerequisites.includes(code) ? prev.prerequisites.filter((p) => p !== code) : [...prev.prerequisites, code],
    }))
  }

  const handleSubmitCreate = async () => {
    setIsSubmitting(true)
    await new Promise((r) => setTimeout(r, 1200))
    const course = mockCourses.find((c) => c.id === formData.courseId)
    setSubjects((prev) => [...prev, { id: String(Date.now()), ...formData, courseName: course?.name || '', isActive: true }])
    setIsSubmitting(false); setCreateOpen(false)
  }

  const handleSubmitEdit = async () => {
    setIsSubmitting(true)
    await new Promise((r) => setTimeout(r, 1200))
    const course = mockCourses.find((c) => c.id === formData.courseId)
    setSubjects((prev) => prev.map((s) => s.id === selectedSubject?.id ? { ...s, ...formData, courseName: course?.name || '' } : s))
    setIsSubmitting(false); setEditOpen(false)
  }

  const handleConfirmDelete = () => { setSubjects((prev) => prev.filter((s) => s.id !== selectedSubject?.id)); setDeleteOpen(false) }
  const handleToggleStatus = (id: string) => { setSubjects((prev) => prev.map((s) => s.id === id ? { ...s, isActive: !s.isActive } : s)) }

  if (isLoading) return <div className="flex-1 space-y-6 p-6"><Skeleton className="h-10 w-48" /><Skeleton className="h-40 w-full" /><Skeleton className="h-96 w-full" /></div>

  return (
    <div className="flex-1 space-y-6 p-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-violet-700 to-purple-500 bg-clip-text text-transparent">Subject Management</h1>
          <p className="text-muted-foreground mt-1">Manage subjects, prerequisites, and workload</p>
        </div>
        <Button onClick={handleCreate} className="gap-2 bg-violet-600 hover:bg-violet-700"><Plus className="h-4 w-4" /> New Subject</Button>
      </div>

      {/* Filters */}
      <Card className="border-violet-200 dark:border-violet-800/50">
        <CardContent className="p-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-center">
            <div className="relative flex-1"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input placeholder="Search subjects..." className="pl-9" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} /></div>
            <Select value={filterCourse} onValueChange={setFilterCourse}><SelectTrigger className="w-48"><SelectValue placeholder="Course" /></SelectTrigger><SelectContent><SelectItem value="all">All Courses</SelectItem>{mockCourses.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent></Select>
            <Select value={filterSemester} onValueChange={setFilterSemester}><SelectTrigger className="w-36"><SelectValue placeholder="Semester" /></SelectTrigger><SelectContent><SelectItem value="all">All</SelectItem>{[1, 2, 3, 4, 5, 6, 7, 8].map((s) => <SelectItem key={s} value={String(s)}>{s}</SelectItem>)}</SelectContent></Select>
            <Select value={filterActive} onValueChange={setFilterActive}><SelectTrigger className="w-32"><SelectValue placeholder="Status" /></SelectTrigger><SelectContent><SelectItem value="all">All</SelectItem><SelectItem value="active">Active</SelectItem><SelectItem value="inactive">Inactive</SelectItem></SelectContent></Select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="border-violet-200 dark:border-violet-800/50">
        <CardContent className="p-0">
          <Table>
            <TableHeader><TableRow className="border-violet-100"><TableHead>Code</TableHead><TableHead>Name</TableHead><TableHead>Course</TableHead><TableHead>Credits</TableHead><TableHead>Workload</TableHead><TableHead>Semester</TableHead><TableHead>Prerequisites</TableHead><TableHead>Status</TableHead><TableHead className="w-12"></TableHead></TableRow></TableHeader>
            <TableBody>
              {filteredSubjects.map((sub) => (
                <TableRow key={sub.id} className={cn('border-violet-100', !sub.isActive && 'opacity-50')}>
                  <TableCell><Badge variant="outline" className="font-mono">{sub.code}</Badge></TableCell>
                  <TableCell className="font-medium max-w-[200px] truncate">{sub.name}</TableCell>
                  <TableCell><Badge variant="secondary">{sub.courseName}</Badge></TableCell>
                  <TableCell><div className="flex items-center gap-1"><GraduationCap className="h-3.5 w-3.5 text-muted-foreground" />{sub.credits}</div></TableCell>
                  <TableCell><div className="flex items-center gap-1"><Clock className="h-3.5 w-3.5 text-muted-foreground" />{sub.workload}h</div></TableCell>
                  <TableCell>{sub.semester ?? '—'}</TableCell>
                  <TableCell>
                    <div className="flex gap-1 flex-wrap">
                      {sub.prerequisites.length === 0 ? (<span className="text-xs text-muted-foreground">None</span>) : sub.prerequisites.map((p) => <Badge key={p} variant="outline" className="text-[10px]">{p}</Badge>)}
                    </div>
                  </TableCell>
                  <TableCell><Switch checked={sub.isActive} onCheckedChange={() => handleToggleStatus(sub.id)} /></TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleView(sub)} className="gap-2 cursor-pointer"><Eye className="h-4 w-4" /> View</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleEdit(sub)} className="gap-2 cursor-pointer"><Pencil className="h-4 w-4" /> Edit</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDelete(sub)} className="gap-2 cursor-pointer text-red-600 focus:text-red-600"><Trash2 className="h-4 w-4" /> Delete</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={createOpen || editOpen} onOpenChange={() => { setCreateOpen(false); setEditOpen(false) }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-violet-700">{createOpen ? 'Create New Subject' : 'Edit Subject'}</DialogTitle>
            <DialogDescription>{createOpen ? 'Add a new subject to the curriculum.' : `Editing ${selectedSubject?.name}`}</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Subject Code</Label><Input placeholder="e.g. CS201" value={formData.code} onChange={(e) => setFormData({ ...formData, code: e.target.value })} /></div>
              <div className="space-y-2"><Label>Subject Name</Label><Input placeholder="e.g. Data Structures" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} /></div>
            </div>
            <div className="space-y-2"><Label>Description</Label><Textarea placeholder="Subject description..." rows={3} value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} /></div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2"><Label>Course</Label><Select value={formData.courseId} onValueChange={(v) => setFormData({ ...formData, courseId: v })}><SelectTrigger><SelectValue placeholder="Select course" /></SelectTrigger><SelectContent>{mockCourses.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent></Select></div>
              <div className="space-y-2"><Label>Credits</Label><Input type="number" min={1} max={10} value={formData.credits} onChange={(e) => setFormData({ ...formData, credits: parseInt(e.target.value) || 0 })} /></div>
              <div className="space-y-2"><Label>Workload (hours)</Label><Input type="number" min={1} value={formData.workload} onChange={(e) => setFormData({ ...formData, workload: parseInt(e.target.value) || 0 })} /></div>
            </div>
            <div className="space-y-2"><Label>Semester</Label><Input type="number" min={1} max={12} value={formData.semester ?? ''} onChange={(e) => setFormData({ ...formData, semester: parseInt(e.target.value) || null })} placeholder="e.g. 3" /></div>
            <div className="space-y-2">
              <Label>Prerequisites</Label>
              <div className="flex flex-wrap gap-2">
                {allSubjectCodes.filter((s) => s.id !== formData.code).map((s) => (
                  <Button key={s.id} type="button" variant={formData.prerequisites.includes(s.id) ? 'default' : 'outline'} size="sm" onClick={() => togglePrerequisite(s.id)} className={cn('gap-1.5', formData.prerequisites.includes(s.id) ? 'bg-violet-600 hover:bg-violet-700' : '')}>
                    <LinkIcon className="h-3 w-3" /> {s.id}
                  </Button>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setCreateOpen(false); setEditOpen(false) }}>Cancel</Button>
            <Button onClick={createOpen ? handleSubmitCreate : handleSubmitEdit} disabled={isSubmitting} className="bg-violet-600 hover:bg-violet-700">
              {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {createOpen ? 'Create Subject' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>Delete Subject</AlertDialogTitle><AlertDialogDescription>Delete <strong>{selectedSubject?.name}</strong> ({selectedSubject?.code})? This cannot be undone.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={handleConfirmDelete} className="bg-red-600 hover:bg-red-700">Delete</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Detail */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle className="text-violet-700">{selectedSubject?.name}</DialogTitle><DialogDescription>{selectedSubject?.code}</DialogDescription></DialogHeader>
          {selectedSubject && (
            <div className="space-y-4 text-sm">
              <p className="text-muted-foreground">{selectedSubject.description}</p>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg bg-muted/50"><p className="text-muted-foreground text-xs">Course</p><p className="font-medium mt-1">{selectedSubject.courseName}</p></div>
                <div className="p-3 rounded-lg bg-muted/50"><p className="text-muted-foreground text-xs">Credits</p><p className="font-medium mt-1">{selectedSubject.credits}</p></div>
                <div className="p-3 rounded-lg bg-muted/50"><p className="text-muted-foreground text-xs">Workload</p><p className="font-medium mt-1">{selectedSubject.workload} hours</p></div>
                <div className="p-3 rounded-lg bg-muted/50"><p className="text-muted-foreground text-xs">Semester</p><p className="font-medium mt-1">{selectedSubject.semester ?? '—'}</p></div>
              </div>
              <div>
                <p className="text-muted-foreground text-xs mb-2">Prerequisites</p>
                <div className="flex gap-1 flex-wrap">
                  {selectedSubject.prerequisites.length === 0 ? (<span className="text-xs">None</span>) : selectedSubject.prerequisites.map((p) => <Badge key={p} variant="outline">{p}</Badge>)}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
