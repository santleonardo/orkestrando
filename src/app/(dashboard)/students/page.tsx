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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '@/components/ui/drawer'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { Plus, GraduationCap, UserCheck, UserX, MoreHorizontal, Eye, Pencil, Trash2 } from 'lucide-react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { getInitials } from '@/lib/utils/format'
import { toast } from 'sonner'
import { motion } from 'framer-motion'
import type { ColumnDef } from '@tanstack/react-table'
import type { Student, Profile } from '@/lib/types'

// Mock data
const mockStudents: (Student & { profile: Profile })[] = [
  {
    id: '1', profileId: 'p1', userId: 'u1', organizationId: 'o1',
    enrollmentNumber: '2024001', enrollmentDate: '2024-02-01', courseLevel: 'Bacharelado',
    semester: 3, overallGpa: 8.5, totalCredits: 120, guardianName: 'José Santos',
    guardianPhone: '11999999999', isActive: true, createdAt: '2024-02-01', updatedAt: '2024-01-01',
    profile: { id: 'p1', userId: 'u1', role: 'student', firstName: 'Maria', lastName: 'Santos',
      fullName: 'Maria Santos', avatarUrl: undefined, dateOfBirth: '2002-05-15', gender: 'female',
      document: '12345678901', bio: '', preferences: {}, organizationId: 'o1', createdAt: '2024-02-01', updatedAt: '2024-01-01' },
  },
  {
    id: '2', profileId: 'p2', userId: 'u2', organizationId: 'o1',
    enrollmentNumber: '2024002', enrollmentDate: '2024-02-01', courseLevel: 'Bacharelado',
    semester: 5, overallGpa: 7.2, totalCredits: 200, guardianName: '',
    isActive: true, createdAt: '2024-02-01', updatedAt: '2024-01-01',
    profile: { id: 'p2', userId: 'u2', role: 'student', firstName: 'João', lastName: 'Silva',
      fullName: 'João Silva', avatarUrl: undefined, dateOfBirth: '2001-08-20', gender: 'male',
      document: '98765432101', bio: '', preferences: {}, organizationId: 'o1', createdAt: '2024-02-01', updatedAt: '2024-01-01' },
  },
  {
    id: '3', profileId: 'p3', userId: 'u3', organizationId: 'o1',
    enrollmentNumber: '2023001', enrollmentDate: '2023-02-01', courseLevel: 'Licenciatura',
    semester: 2, overallGpa: 6.8, totalCredits: 80, guardianName: 'Ana Oliveira',
    guardianPhone: '11988888888', isActive: true, createdAt: '2023-02-01', updatedAt: '2024-01-01',
    profile: { id: 'p3', userId: 'u3', role: 'student', firstName: 'Pedro', lastName: 'Oliveira',
      fullName: 'Pedro Oliveira', avatarUrl: undefined, dateOfBirth: '2003-12-03', gender: 'male',
      document: '45678912301', bio: '', preferences: {}, organizationId: 'o1', createdAt: '2023-02-01', updatedAt: '2024-01-01' },
  },
  {
    id: '4', profileId: 'p4', userId: 'u4', organizationId: 'o1',
    enrollmentNumber: '2023002', enrollmentDate: '2023-02-01', courseLevel: 'Bacharelado',
    semester: 4, overallGpa: 0, totalCredits: 150, guardianName: '',
    isActive: false, createdAt: '2023-02-01', updatedAt: '2024-01-01',
    profile: { id: 'p4', userId: 'u4', role: 'student', firstName: 'Ana', lastName: 'Costa',
      fullName: 'Ana Costa', avatarUrl: undefined, dateOfBirth: '2001-06-25', gender: 'female',
      document: '32165498701', bio: '', preferences: {}, organizationId: 'o1', createdAt: '2023-02-01', updatedAt: '2024-01-01' },
  },
  {
    id: '5', profileId: 'p5', userId: 'u5', organizationId: 'o1',
    enrollmentNumber: '2024003', enrollmentDate: '2024-02-01', courseLevel: 'Bacharelado',
    semester: 1, overallGpa: 9.1, totalCredits: 40, guardianName: 'Roberto Lima',
    guardianPhone: '11977777777', isActive: true, createdAt: '2024-02-01', updatedAt: '2024-01-01',
    profile: { id: 'p5', userId: 'u5', role: 'student', firstName: 'Lucas', lastName: 'Lima',
      fullName: 'Lucas Lima', avatarUrl: undefined, dateOfBirth: '2004-01-10', gender: 'male',
      document: '65432198701', bio: '', preferences: {}, organizationId: 'o1', createdAt: '2024-02-01', updatedAt: '2024-01-01' },
  },
]

export default function StudentsPage() {
  const [students, setStudents] = useState(mockStudents)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [detailOpen, setDetailOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [selectedStudent, setSelectedStudent] = useState<(typeof mockStudents)[0] | null>(null)
  const [formData, setFormData] = useState({
    firstName: '', lastName: '', email: '', phone: '', enrollmentNumber: '',
    courseLevel: 'Bacharelado', semester: '1',
  })

  const statsData = useMemo(() => {
    const active = students.filter((s) => s.isActive).length
    return { total: students.length, active, inactive: students.length - active }
  }, [students])

  const columns: ColumnDef<(typeof mockStudents)[0]>[] = [
    {
      accessorKey: 'profile.fullName',
      header: ({ column }) => <SortableHeader column={column}>Nome</SortableHeader>,
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="text-xs bg-primary/10 text-primary font-medium">
              {getInitials(row.original.profile.fullName)}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium text-sm">{row.original.profile.fullName}</p>
            <p className="text-xs text-muted-foreground">{row.original.enrollmentNumber}</p>
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'profile.email',
      header: 'E-mail',
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">{row.original.profile.email || '—'}</span>
      ),
    },
    {
      accessorKey: 'courseLevel',
      header: 'Turma',
      cell: ({ row }) => (
        <div>
          <p className="text-sm">{row.original.courseLevel}</p>
          <p className="text-xs text-muted-foreground">{row.original.semester}º semestre</p>
        </div>
      ),
    },
    {
      accessorKey: 'overallGpa',
      header: ({ column }) => <SortableHeader column={column}>CR</SortableHeader>,
      cell: ({ row }) => {
        const gpa = row.original.overallGpa
        return (
          <span className={`text-sm font-medium ${gpa >= 7 ? 'text-emerald-600' : gpa >= 5 ? 'text-amber-600' : gpa > 0 ? 'text-red-500' : 'text-muted-foreground'}`}>
            {gpa > 0 ? gpa.toFixed(1) : '—'}
          </span>
        )
      },
    },
    {
      accessorKey: 'isActive',
      header: 'Status',
      cell: ({ row }) => (
        <Badge variant={row.original.isActive ? 'default' : 'secondary'} className={
          row.original.isActive ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300' : ''
        }>
          {row.original.isActive ? 'Matriculado' : 'Evadido'}
        </Badge>
      ),
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => { setSelectedStudent(row.original); setDetailOpen(true) }}>
              <Eye className="mr-2 h-4 w-4" /> Ver detalhes
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => { setSelectedStudent(row.original); openEditDialog(row.original) }}>
              <Pencil className="mr-2 h-4 w-4" /> Editar
            </DropdownMenuItem>
            <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => { setSelectedStudent(row.original); setDeleteOpen(true) }}>
              <Trash2 className="mr-2 h-4 w-4" /> Excluir
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ]

  const openEditDialog = (student: (typeof mockStudents)[0]) => {
    setFormData({
      firstName: student.profile.firstName, lastName: student.profile.lastName,
      email: '', phone: '', enrollmentNumber: student.enrollmentNumber,
      courseLevel: student.courseLevel, semester: String(student.semester),
    })
    setDialogOpen(true)
  }

  const handleSave = () => {
    toast.success(selectedStudent ? 'Aluno atualizado com sucesso!' : 'Aluno criado com sucesso!')
    setDialogOpen(false)
  }

  const handleDelete = () => {
    setStudents((prev) => prev.filter((s) => s.id !== selectedStudent?.id))
    toast.success('Aluno excluído com sucesso!')
    setDeleteOpen(false)
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <PageHeader
        title="Alunos"
        description="Gerencie os alunos da instituição"
        breadcrumbs={[{ label: 'Dashboard', href: '/' }, { label: 'Alunos' }]}
        actions={<Button onClick={() => { setSelectedStudent(null); setFormData({ firstName: '', lastName: '', email: '', phone: '', enrollmentNumber: '', courseLevel: 'Bacharelado', semester: '1' }); setDialogOpen(true) }}>
          <Plus className="mr-2 h-4 w-4" /> Novo Aluno
        </Button>}
      />

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
        <StatsCard title="Total Alunos" value={statsData.total} icon={GraduationCap} iconColor="text-blue-600 bg-blue-50 dark:bg-blue-950/50" />
        <StatsCard title="Matriculados" value={statsData.active} icon={UserCheck} iconColor="text-emerald-600 bg-emerald-50 dark:bg-emerald-950/50" />
        <StatsCard title="Evadidos" value={statsData.inactive} icon={UserX} iconColor="text-red-500 bg-red-50 dark:bg-red-950/50" />
      </div>

      <DataTable
        columns={columns}
        data={students}
        searchKey="profile.fullName"
        searchPlaceholder="Buscar aluno..."
        emptyIcon={GraduationCap}
        emptyTitle="Nenhum aluno encontrado"
        emptyDescription="Comece adicionando um novo aluno."
        emptyAction={{ label: 'Novo Aluno', onClick: () => setDialogOpen(true) }}
      />

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedStudent ? 'Editar Aluno' : 'Novo Aluno'}</DialogTitle>
            <DialogDescription>
              {selectedStudent ? 'Atualize os dados do aluno.' : 'Preencha os dados para matricular um novo aluno.'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2"><Label>Nome</Label><Input value={formData.firstName} onChange={(e) => setFormData({ ...formData, firstName: e.target.value })} placeholder="Maria" /></div>
              <div className="space-y-2"><Label>Sobrenome</Label><Input value={formData.lastName} onChange={(e) => setFormData({ ...formData, lastName: e.target.value })} placeholder="Santos" /></div>
            </div>
            <div className="space-y-2"><Label>E-mail</Label><Input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} placeholder="aluno@escola.com" /></div>
            <div className="space-y-2"><Label>Telefone</Label><Input value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} placeholder="(11) 99999-9999" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2"><Label>Matrícula</Label><Input value={formData.enrollmentNumber} onChange={(e) => setFormData({ ...formData, enrollmentNumber: e.target.value })} placeholder="2024001" /></div>
              <div className="space-y-2"><Label>Semestre</Label><Input type="number" value={formData.semester} onChange={(e) => setFormData({ ...formData, semester: e.target.value })} /></div>
            </div>
            <div className="space-y-2">
              <Label>Nível do Curso</Label>
              <Select value={formData.courseLevel} onValueChange={(v) => setFormData({ ...formData, courseLevel: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Bacharelado">Bacharelado</SelectItem>
                  <SelectItem value="Licenciatura">Licenciatura</SelectItem>
                  <SelectItem value="Tecnólogo">Tecnólogo</SelectItem>
                  <SelectItem value="Pós-graduação">Pós-graduação</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleSave}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Detail Drawer */}
      <Drawer open={detailOpen} onOpenChange={setDetailOpen}>
        <DrawerContent>
          <div className="max-w-lg mx-auto">
            <DrawerHeader><DrawerTitle>Detalhes do Aluno</DrawerTitle></DrawerHeader>
            {selectedStudent && (
              <div className="space-y-4 px-4 pb-8">
                <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16">
                    <AvatarFallback className="text-lg bg-primary/10 text-primary font-medium">
                      {getInitials(selectedStudent.profile.fullName)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-lg font-semibold">{selectedStudent.profile.fullName}</h3>
                    <Badge variant={selectedStudent.isActive ? 'default' : 'secondary'} className={selectedStudent.isActive ? 'bg-emerald-100 text-emerald-700' : ''}>
                      {selectedStudent.isActive ? 'Matriculado' : 'Evadido'}
                    </Badge>
                  </div>
                </div>
                <Separator />
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div><p className="text-muted-foreground">Matrícula</p><p className="font-medium">{selectedStudent.enrollmentNumber}</p></div>
                  <div><p className="text-muted-foreground">E-mail</p><p className="font-medium">{selectedStudent.profile.email || '—'}</p></div>
                  <div><p className="text-muted-foreground">Curso</p><p className="font-medium">{selectedStudent.courseLevel}</p></div>
                  <div><p className="text-muted-foreground">Semestre</p><p className="font-medium">{selectedStudent.semester}º</p></div>
                  <div><p className="text-muted-foreground">CR</p><p className="font-medium">{selectedStudent.overallGpa > 0 ? selectedStudent.overallGpa.toFixed(1) : '—'}</p></div>
                  <div><p className="text-muted-foreground">Créditos</p><p className="font-medium">{selectedStudent.totalCredits}</p></div>
                </div>
              </div>
            )}
          </div>
        </DrawerContent>
      </Drawer>

      <ConfirmDialog
        open={deleteOpen} onOpenChange={setDeleteOpen}
        title="Excluir Aluno"
        description={`Tem certeza que deseja excluir o aluno "${selectedStudent?.profile.fullName}"?`}
        confirmLabel="Excluir" variant="destructive" onConfirm={handleDelete}
      />
    </motion.div>
  )
}
