'use client'

import { useState, useMemo } from 'react'
import { PageHeader } from '@/components/shared/page-header'
import { DataTable, SortableHeader } from '@/components/shared/data-table'
import { StatsCard } from '@/components/shared/stats-card'
import { ConfirmDialog } from '@/components/shared/confirm-dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Plus, BookOpen, Clock, MoreHorizontal, Pencil, Trash2, GraduationCap } from 'lucide-react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { formatDuration } from '@/lib/utils/format'
import { toast } from 'sonner'
import { motion } from 'framer-motion'
import type { ColumnDef } from '@tanstack/react-table'
import type { Course } from '@/lib/types'

const mockCourses: Course[] = [
  { id: '1', organizationId: 'o1', name: 'Ciência da Computação', code: 'CC', description: 'Curso de graduação em Ciência da Computação', durationHours: 3600, totalCredits: 240, level: 'advanced', modality: 'in_person', tuitionFee: 1500, maxCapacity: 60, isActive: true, createdAt: '2024-01-01', updatedAt: '2024-01-01' },
  { id: '2', organizationId: 'o1', name: 'Engenharia de Software', code: 'ES', description: 'Curso de Engenharia de Software', durationHours: 3200, totalCredits: 220, level: 'advanced', modality: 'hybrid', tuitionFee: 1800, maxCapacity: 50, isActive: true, createdAt: '2024-01-01', updatedAt: '2024-01-01' },
  { id: '3', organizationId: 'o1', name: 'Administração', code: 'ADM', description: 'Curso de Administração', durationHours: 3000, totalCredits: 200, level: 'intermediate', modality: 'in_person', tuitionFee: 1200, maxCapacity: 80, isActive: true, createdAt: '2024-01-01', updatedAt: '2024-01-01' },
  { id: '4', organizationId: 'o1', name: 'Design Digital', code: 'DD', description: 'Curso de Design Digital', durationHours: 2400, totalCredits: 160, level: 'mixed', modality: 'online', tuitionFee: 900, maxCapacity: 100, isActive: false, createdAt: '2024-01-01', updatedAt: '2024-01-01' },
]

const levelLabels: Record<string, string> = { beginner: 'Iniciante', intermediate: 'Intermediário', advanced: 'Avançado', mixed: 'Misto' }
const modalityLabels: Record<string, string> = { in_person: 'Presencial', online: 'Online', hybrid: 'Híbrido' }

export default function CoursesPage() {
  const [courses, setCourses] = useState(mockCourses)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null)
  const [formData, setFormData] = useState({
    name: '', code: '', description: '', durationHours: '120', totalCredits: '80',
    level: 'mixed' as const, modality: 'in_person' as const, tuitionFee: '', maxCapacity: '30',
  })

  const columns: ColumnDef<Course>[] = [
    {
      accessorKey: 'name',
      header: ({ column }) => <SortableHeader column={column}>Nome</SortableHeader>,
      cell: ({ row }) => (
        <div><p className="font-medium text-sm">{row.original.name}</p><p className="text-xs text-muted-foreground">{row.original.code}</p></div>
      ),
    },
    {
      accessorKey: 'durationHours',
      header: 'Carga Horária',
      cell: ({ row }) => <span className="text-sm">{row.original.durationHours}h ({row.original.totalCredits} créditos)</span>,
    },
    {
      accessorKey: 'modality',
      header: 'Tipo',
      cell: ({ row }) => (
        <div className="flex gap-1">
          <Badge variant="secondary" className="text-xs">{levelLabels[row.original.level]}</Badge>
          <Badge variant="outline" className="text-xs">{modalityLabels[row.original.modality]}</Badge>
        </div>
      ),
    },
    {
      accessorKey: 'isActive',
      header: 'Status',
      cell: ({ row }) => (
        <Badge variant={row.original.isActive ? 'default' : 'secondary'} className={row.original.isActive ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300' : ''}>
          {row.original.isActive ? 'Ativo' : 'Inativo'}
        </Badge>
      ),
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => { setSelectedCourse(row.original); openEditDialog(row.original) }}><Pencil className="mr-2 h-4 w-4" /> Editar</DropdownMenuItem>
            <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => { setSelectedCourse(row.original); setDeleteOpen(true) }}><Trash2 className="mr-2 h-4 w-4" /> Excluir</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ]

  const openEditDialog = (course: Course) => {
    setFormData({
      name: course.name, code: course.code, description: course.description || '',
      durationHours: String(course.durationHours), totalCredits: String(course.totalCredits),
      level: course.level, modality: course.modality, tuitionFee: course.tuitionFee ? String(course.tuitionFee) : '',
      maxCapacity: String(course.maxCapacity),
    })
    setDialogOpen(true)
  }

  const handleSave = () => { toast.success(selectedCourse ? 'Curso atualizado!' : 'Curso criado!'); setDialogOpen(false) }
  const handleDelete = () => { setCourses((prev) => prev.filter((c) => c.id !== selectedCourse?.id)); toast.success('Curso excluído!'); setDeleteOpen(false) }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <PageHeader title="Cursos" description="Gerencie os cursos da instituição" breadcrumbs={[{ label: 'Dashboard', href: '/' }, { label: 'Cursos' }]}
        actions={<Button onClick={() => { setSelectedCourse(null); setFormData({ name: '', code: '', description: '', durationHours: '120', totalCredits: '80', level: 'mixed', modality: 'in_person', tuitionFee: '', maxCapacity: '30' }); setDialogOpen(true) }}><Plus className="mr-2 h-4 w-4" /> Novo Curso</Button>}
      />
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
        <StatsCard title="Total Cursos" value={courses.length} icon={BookOpen} iconColor="text-purple-600 bg-purple-50 dark:bg-purple-950/50" />
        <StatsCard title="Ativos" value={courses.filter((c) => c.isActive).length} icon={GraduationCap} iconColor="text-emerald-600 bg-emerald-50 dark:bg-emerald-950/50" />
        <StatsCard title="Créditos Totais" value={courses.reduce((a, c) => a + c.totalCredits, 0)} icon={Clock} iconColor="text-blue-600 bg-blue-50 dark:bg-blue-950/50" />
      </div>
      <DataTable columns={columns} data={courses} searchKey="name" searchPlaceholder="Buscar curso..." emptyIcon={BookOpen} emptyTitle="Nenhum curso encontrado" />

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedCourse ? 'Editar Curso' : 'Novo Curso'}</DialogTitle>
            <DialogDescription>Preencha os dados do curso.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2"><Label>Nome</Label><Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} /></div>
              <div className="space-y-2"><Label>Código</Label><Input value={formData.code} onChange={(e) => setFormData({ ...formData, code: e.target.value })} placeholder="CC" /></div>
            </div>
            <div className="space-y-2"><Label>Descrição</Label><Textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={3} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2"><Label>Carga Horária (h)</Label><Input type="number" value={formData.durationHours} onChange={(e) => setFormData({ ...formData, durationHours: e.target.value })} /></div>
              <div className="space-y-2"><Label>Créditos</Label><Input type="number" value={formData.totalCredits} onChange={(e) => setFormData({ ...formData, totalCredits: e.target.value })} /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2"><Label>Nível</Label>
                <Select value={formData.level} onValueChange={(v) => setFormData({ ...formData, level: v as typeof formData.level })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="beginner">Iniciante</SelectItem><SelectItem value="intermediate">Intermediário</SelectItem><SelectItem value="advanced">Avançado</SelectItem><SelectItem value="mixed">Misto</SelectItem></SelectContent>
                </Select>
              </div>
              <div className="space-y-2"><Label>Modalidade</Label>
                <Select value={formData.modality} onValueChange={(v) => setFormData({ ...formData, modality: v as typeof formData.modality })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="in_person">Presencial</SelectItem><SelectItem value="online">Online</SelectItem><SelectItem value="hybrid">Híbrido</SelectItem></SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2"><Label>Mensalidade (R$)</Label><Input type="number" value={formData.tuitionFee} onChange={(e) => setFormData({ ...formData, tuitionFee: e.target.value })} /></div>
              <div className="space-y-2"><Label>Vagas</Label><Input type="number" value={formData.maxCapacity} onChange={(e) => setFormData({ ...formData, maxCapacity: e.target.value })} /></div>
            </div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button><Button onClick={handleSave}>Salvar</Button></DialogFooter>
        </DialogContent>
      </Dialog>
      <ConfirmDialog open={deleteOpen} onOpenChange={setDeleteOpen} title="Excluir Curso" description={`Excluir "${selectedCourse?.name}"?`} confirmLabel="Excluir" variant="destructive" onConfirm={handleDelete} />
    </motion.div>
  )
}
