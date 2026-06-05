'use client'

import { useState } from 'react'
import { PageHeader } from '@/components/shared/page-header'
import { DataTable, SortableHeader } from '@/components/shared/data-table'
import { ConfirmDialog } from '@/components/shared/confirm-dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Plus, Library, Clock, MoreHorizontal, Pencil, Trash2 } from 'lucide-react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { toast } from 'sonner'
import { motion } from 'framer-motion'
import type { ColumnDef } from '@tanstack/react-table'
import type { Subject } from '@/lib/types'

const mockSubjects: Subject[] = [
  { id: '1', organizationId: 'o1', name: 'Matemática Avançada', code: 'MAT101', description: 'Matemática para cursos de exatas', courseIds: ['c1', 'c2'], workloadHours: 64, isActive: true, createdAt: '2024-01-01', updatedAt: '2024-01-01' },
  { id: '2', organizationId: 'o1', name: 'Física II', code: 'FIS201', description: 'Física moderna e quântica', courseIds: ['c1'], workloadHours: 48, isActive: true, createdAt: '2024-01-01', updatedAt: '2024-01-01' },
  { id: '3', organizationId: 'o1', name: 'Programação Web', code: 'PRG301', description: 'Desenvolvimento web full-stack', courseIds: ['c1', 'c2'], workloadHours: 72, isActive: true, createdAt: '2024-01-01', updatedAt: '2024-01-01' },
  { id: '4', organizationId: 'o1', name: 'Banco de Dados', code: 'BD301', description: 'Modelagem e SQL', courseIds: ['c1'], workloadHours: 64, isActive: true, createdAt: '2024-01-01', updatedAt: '2024-01-01' },
  { id: '5', organizationId: 'o1', name: 'Português Instrumental', code: 'POR101', description: 'Redação e interpretação', courseIds: ['c3'], workloadHours: 32, isActive: false, createdAt: '2024-01-01', updatedAt: '2024-01-01' },
  { id: '6', organizationId: 'o1', name: 'Inteligência Artificial', code: 'IA401', description: 'Fundamentos de IA e ML', courseIds: ['c1'], workloadHours: 60, isActive: true, createdAt: '2024-01-01', updatedAt: '2024-01-01' },
]

export default function SubjectsPage() {
  const [subjects, setSubjects] = useState(mockSubjects)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null)
  const [formData, setFormData] = useState({
    name: '', code: '', description: '', workloadHours: '64', courseId: '',
  })

  const columns: ColumnDef<Subject>[] = [
    {
      accessorKey: 'name',
      header: ({ column }) => <SortableHeader column={column}>Nome</SortableHeader>,
      cell: ({ row }) => <div><p className="font-medium text-sm">{row.original.name}</p><p className="text-xs text-muted-foreground">{row.original.code}</p></div>,
    },
    {
      accessorKey: 'courseIds',
      header: 'Curso',
      cell: ({ row }) => <span className="text-sm">{row.original.courseIds.length} curso(s)</span>,
    },
    {
      accessorKey: 'workloadHours',
      header: ({ column }) => <SortableHeader column={column}>Carga Horária</SortableHeader>,
      cell: ({ row }) => <span className="text-sm">{row.original.workloadHours}h</span>,
    },
    {
      accessorKey: 'isActive',
      header: 'Status',
      cell: ({ row }) => (
        <Badge variant={row.original.isActive ? 'default' : 'secondary'} className={row.original.isActive ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300' : ''}>
          {row.original.isActive ? 'Ativa' : 'Inativa'}
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
            <DropdownMenuItem onClick={() => { setSelectedSubject(row.original); openEditDialog(row.original) }}><Pencil className="mr-2 h-4 w-4" /> Editar</DropdownMenuItem>
            <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => { setSelectedSubject(row.original); setDeleteOpen(true) }}><Trash2 className="mr-2 h-4 w-4" /> Excluir</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ]

  const openEditDialog = (subject: Subject) => {
    setFormData({ name: subject.name, code: subject.code, description: subject.description || '', workloadHours: String(subject.workloadHours), courseId: subject.courseIds[0] || '' })
    setDialogOpen(true)
  }

  const handleSave = () => { toast.success(selectedSubject ? 'Disciplina atualizada!' : 'Disciplina criada!'); setDialogOpen(false) }
  const handleDelete = () => { setSubjects((prev) => prev.filter((s) => s.id !== selectedSubject?.id)); toast.success('Disciplina excluída!'); setDeleteOpen(false) }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <PageHeader title="Disciplinas" description="Gerencie as disciplinas dos cursos" breadcrumbs={[{ label: 'Dashboard', href: '/' }, { label: 'Disciplinas' }]}
        actions={<Button onClick={() => { setSelectedSubject(null); setFormData({ name: '', code: '', description: '', workloadHours: '64', courseId: '' }); setDialogOpen(true) }}><Plus className="mr-2 h-4 w-4" /> Nova Disciplina</Button>}
      />
      <DataTable columns={columns} data={subjects} searchKey="name" searchPlaceholder="Buscar disciplina..." emptyIcon={Library} emptyTitle="Nenhuma disciplina encontrada" />

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{selectedSubject ? 'Editar Disciplina' : 'Nova Disciplina'}</DialogTitle>
            <DialogDescription>Preencha os dados da disciplina.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2"><Label>Nome</Label><Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} /></div>
              <div className="space-y-2"><Label>Código</Label><Input value={formData.code} onChange={(e) => setFormData({ ...formData, code: e.target.value })} placeholder="MAT101" /></div>
            </div>
            <div className="space-y-2"><Label>Descrição</Label><Textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={3} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2"><Label>Carga Horária (h)</Label><Input type="number" value={formData.workloadHours} onChange={(e) => setFormData({ ...formData, workloadHours: e.target.value })} /></div>
              <div className="space-y-2"><Label>Curso</Label>
                <Select value={formData.courseId} onValueChange={(v) => setFormData({ ...formData, courseId: v })}>
                  <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent><SelectItem value="c1">Ciência da Computação</SelectItem><SelectItem value="c2">Eng. Software</SelectItem><SelectItem value="c3">Administração</SelectItem></SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button><Button onClick={handleSave}>Salvar</Button></DialogFooter>
        </DialogContent>
      </Dialog>
      <ConfirmDialog open={deleteOpen} onOpenChange={setDeleteOpen} title="Excluir Disciplina" description={`Excluir "${selectedSubject?.name}"?`} confirmLabel="Excluir" variant="destructive" onConfirm={handleDelete} />
    </motion.div>
  )
}
