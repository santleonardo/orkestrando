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
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '@/components/ui/drawer'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { Plus, Users, UserCheck, UserX, MoreHorizontal, Eye, Pencil, Trash2, Phone, Mail, Briefcase } from 'lucide-react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { getInitials, formatPhone } from '@/lib/utils/format'
import { toast } from 'sonner'
import { motion } from 'framer-motion'
import type { ColumnDef } from '@tanstack/react-table'
import type { Teacher, Profile } from '@/lib/types'

// Mock data
const mockTeachers: (Teacher & { profile: Profile })[] = [
  {
    id: '1', profileId: 'p1', userId: 'u1', organizationId: 'o1',
    hireDate: '2020-03-15', contractType: 'full_time', subjects: ['s1', 's2'],
    maxWeeklyHours: 40, specialties: ['Matemática', 'Estatística'], qualifications: 'Doutorado em Matemática',
    salary: 8000, isActive: true, createdAt: '2020-03-15', updatedAt: '2024-01-01',
    profile: { id: 'p1', userId: 'u1', role: 'teacher', firstName: 'Carlos', lastName: 'Silva',
      fullName: 'Carlos Silva', avatarUrl: undefined, dateOfBirth: '1980-05-20', gender: 'male',
      document: '12345678901', bio: 'Professor doutor com 20 anos de experiência.',
      preferences: {}, organizationId: 'o1', createdAt: '2020-03-15', updatedAt: '2024-01-01' },
  },
  {
    id: '2', profileId: 'p2', userId: 'u2', organizationId: 'o1',
    hireDate: '2019-08-01', contractType: 'full_time', subjects: ['s3'],
    maxWeeklyHours: 40, specialties: ['Física', 'Mecânica'], qualifications: 'Mestrado em Física',
    salary: 6500, isActive: true, createdAt: '2019-08-01', updatedAt: '2024-01-01',
    profile: { id: 'p2', userId: 'u2', role: 'teacher', firstName: 'Maria', lastName: 'Santos',
      fullName: 'Maria Santos', avatarUrl: undefined, dateOfBirth: '1985-11-10', gender: 'female',
      document: '98765432101', bio: 'Professora de física com experiência em laboratórios.',
      preferences: {}, organizationId: 'o1', createdAt: '2019-08-01', updatedAt: '2024-01-01' },
  },
  {
    id: '3', profileId: 'p3', userId: 'u3', organizationId: 'o1',
    hireDate: '2022-02-10', contractType: 'part_time', subjects: ['s4', 's5'],
    maxWeeklyHours: 20, specialties: ['Programação', 'Web'], qualifications: 'Graduação em Ciência da Computação',
    salary: 3500, isActive: true, createdAt: '2022-02-10', updatedAt: '2024-01-01',
    profile: { id: 'p3', userId: 'u3', role: 'teacher', firstName: 'João', lastName: 'Oliveira',
      fullName: 'João Oliveira', avatarUrl: undefined, dateOfBirth: '1992-03-25', gender: 'male',
      document: '45678912301', bio: 'Desenvolvedor full-stack e professor de programação.',
      preferences: {}, organizationId: 'o1', createdAt: '2022-02-10', updatedAt: '2024-01-01' },
  },
  {
    id: '4', profileId: 'p4', userId: 'u4', organizationId: 'o1',
    hireDate: '2021-06-20', contractType: 'freelancer', subjects: ['s6'],
    maxWeeklyHours: 10, specialties: ['Design', 'UX'], qualifications: 'Especialização em Design Digital',
    salary: 2000, isActive: false, createdAt: '2021-06-20', updatedAt: '2024-01-01',
    profile: { id: 'p4', userId: 'u4', role: 'teacher', firstName: 'Ana', lastName: 'Lima',
      fullName: 'Ana Lima', avatarUrl: undefined, dateOfBirth: '1990-09-15', gender: 'female',
      document: '32165498701', bio: 'Designer UX/UI com foco em educação digital.',
      preferences: {}, organizationId: 'o1', createdAt: '2021-06-20', updatedAt: '2024-01-01' },
  },
  {
    id: '5', profileId: 'p5', userId: 'u5', organizationId: 'o1',
    hireDate: '2023-01-05', contractType: 'full_time', subjects: ['s7', 's8'],
    maxWeeklyHours: 40, specialties: ['Redes', 'Segurança'], qualifications: 'Mestrado em Ciência da Computação',
    salary: 7000, isActive: true, createdAt: '2023-01-05', updatedAt: '2024-01-01',
    profile: { id: 'p5', userId: 'u5', role: 'teacher', firstName: 'Pedro', lastName: 'Costa',
      fullName: 'Pedro Costa', avatarUrl: undefined, dateOfBirth: '1988-07-08', gender: 'male',
      document: '65432198701', bio: 'Especialista em redes de computadores e segurança da informação.',
      preferences: {}, organizationId: 'o1', createdAt: '2023-01-05', updatedAt: '2024-01-01' },
  },
]

const contractTypeLabels: Record<string, string> = { full_time: 'Integral', part_time: 'Parcial', freelancer: 'Freelancer' }

export default function TeachersPage() {
  const [teachers, setTeachers] = useState(mockTeachers)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [detailOpen, setDetailOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [selectedTeacher, setSelectedTeacher] = useState<(typeof mockTeachers)[0] | null>(null)
  const [formData, setFormData] = useState({
    firstName: '', lastName: '', email: '', phone: '', contractType: 'part_time' as const,
    maxWeeklyHours: '20', specialties: '', qualifications: '',
  })

  const statsData = useMemo(() => {
    const active = teachers.filter((t) => t.isActive).length
    return { total: teachers.length, active, inactive: teachers.length - active }
  }, [teachers])

  const columns: ColumnDef<(typeof mockTeachers)[0]>[] = [
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
            <p className="text-xs text-muted-foreground">{row.original.profile.email || 'professor@escola.com'}</p>
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'profile.phone',
      header: 'Telefone',
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">
          {row.original.profile.phone || '—'}
        </span>
      ),
    },
    {
      accessorKey: 'subjects',
      header: 'Disciplinas',
      cell: ({ row }) => (
        <div className="flex flex-wrap gap-1">
          {row.original.subjects.slice(0, 2).map((_, i) => (
            <Badge key={i} variant="secondary" className="text-[10px]">
              Disciplina {i + 1}
            </Badge>
          ))}
          {row.original.subjects.length > 2 && (
            <Badge variant="outline" className="text-[10px]">+{row.original.subjects.length - 2}</Badge>
          )}
        </div>
      ),
    },
    {
      accessorKey: 'contractType',
      header: 'Contrato',
      cell: ({ row }) => (
        <Badge variant="outline" className="text-xs">
          {contractTypeLabels[row.original.contractType]}
        </Badge>
      ),
    },
    {
      accessorKey: 'isActive',
      header: 'Status',
      cell: ({ row }) => (
        <Badge variant={row.original.isActive ? 'default' : 'secondary'} className={
          row.original.isActive ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300' : ''
        }>
          {row.original.isActive ? 'Ativo' : 'Inativo'}
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
            <DropdownMenuItem onClick={() => { setSelectedTeacher(row.original); setDetailOpen(true) }}>
              <Eye className="mr-2 h-4 w-4" /> Ver detalhes
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => { setSelectedTeacher(row.original); openEditDialog(row.original) }}>
              <Pencil className="mr-2 h-4 w-4" /> Editar
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              onClick={() => { setSelectedTeacher(row.original); setDeleteOpen(true) }}
            >
              <Trash2 className="mr-2 h-4 w-4" /> Excluir
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ]

  const openEditDialog = (teacher: (typeof mockTeachers)[0]) => {
    setFormData({
      firstName: teacher.profile.firstName,
      lastName: teacher.profile.lastName,
      email: '', phone: '', contractType: teacher.contractType,
      maxWeeklyHours: String(teacher.maxWeeklyHours),
      specialties: teacher.specialties?.join(', ') || '',
      qualifications: teacher.qualifications || '',
    })
    setDialogOpen(true)
  }

  const handleCreate = () => {
    setFormData({ firstName: '', lastName: '', email: '', phone: '', contractType: 'part_time', maxWeeklyHours: '20', specialties: '', qualifications: '' })
    setDialogOpen(true)
  }

  const handleSave = () => {
    toast.success(selectedTeacher ? 'Professor atualizado com sucesso!' : 'Professor criado com sucesso!')
    setDialogOpen(false)
  }

  const handleDelete = () => {
    setTeachers((prev) => prev.filter((t) => t.id !== selectedTeacher?.id))
    toast.success('Professor excluído com sucesso!')
    setDeleteOpen(false)
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <PageHeader
        title="Professores"
        description="Gerencie os professores da instituição"
        breadcrumbs={[{ label: 'Dashboard', href: '/' }, { label: 'Professores' }]}
        actions={
          <Button onClick={handleCreate}>
            <Plus className="mr-2 h-4 w-4" /> Novo Professor
          </Button>
        }
      />

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
        <StatsCard title="Total Professores" value={statsData.total} icon={Users} iconColor="text-purple-600 bg-purple-50 dark:bg-purple-950/50" />
        <StatsCard title="Ativos" value={statsData.active} icon={UserCheck} iconColor="text-emerald-600 bg-emerald-50 dark:bg-emerald-950/50" />
        <StatsCard title="Inativos" value={statsData.inactive} icon={UserX} iconColor="text-red-500 bg-red-50 dark:bg-red-950/50" />
      </div>

      <DataTable
        columns={columns}
        data={teachers}
        searchKey="profile.fullName"
        searchPlaceholder="Buscar professor..."
        emptyIcon={Users}
        emptyTitle="Nenhum professor encontrado"
        emptyDescription="Comece adicionando um novo professor."
        emptyAction={{ label: 'Novo Professor', onClick: handleCreate }}
      />

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedTeacher ? 'Editar Professor' : 'Novo Professor'}</DialogTitle>
            <DialogDescription>
              {selectedTeacher ? 'Atualize os dados do professor.' : 'Preencha os dados para criar um novo professor.'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Nome</Label>
                <Input value={formData.firstName} onChange={(e) => setFormData({ ...formData, firstName: e.target.value })} placeholder="Carlos" />
              </div>
              <div className="space-y-2">
                <Label>Sobrenome</Label>
                <Input value={formData.lastName} onChange={(e) => setFormData({ ...formData, lastName: e.target.value })} placeholder="Silva" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>E-mail</Label>
              <Input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} placeholder="professor@escola.com" />
            </div>
            <div className="space-y-2">
              <Label>Telefone</Label>
              <Input value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} placeholder="(11) 99999-9999" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Tipo de Contrato</Label>
                <Select value={formData.contractType} onValueChange={(v) => setFormData({ ...formData, contractType: v as typeof formData.contractType })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="full_time">Integral</SelectItem>
                    <SelectItem value="part_time">Parcial</SelectItem>
                    <SelectItem value="freelancer">Freelancer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Carga Horária Semanal</Label>
                <Input type="number" value={formData.maxWeeklyHours} onChange={(e) => setFormData({ ...formData, maxWeeklyHours: e.target.value })} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Especialidades</Label>
              <Input value={formData.specialties} onChange={(e) => setFormData({ ...formData, specialties: e.target.value })} placeholder="Matemática, Estatística" />
            </div>
            <div className="space-y-2">
              <Label>Qualificações</Label>
              <Textarea value={formData.qualifications} onChange={(e) => setFormData({ ...formData, qualifications: e.target.value })} placeholder="Doutorado em..." rows={3} />
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
            <DrawerHeader>
              <DrawerTitle>Detalhes do Professor</DrawerTitle>
            </DrawerHeader>
            {selectedTeacher && (
              <div className="space-y-4 px-4 pb-8">
                <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16">
                    <AvatarFallback className="text-lg bg-primary/10 text-primary font-medium">
                      {getInitials(selectedTeacher.profile.fullName)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-lg font-semibold">{selectedTeacher.profile.fullName}</h3>
                    <Badge variant={selectedTeacher.isActive ? 'default' : 'secondary'} className={selectedTeacher.isActive ? 'bg-emerald-100 text-emerald-700' : ''}>
                      {selectedTeacher.isActive ? 'Ativo' : 'Inativo'}
                    </Badge>
                  </div>
                </div>
                <Separator />
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">E-mail</p>
                    <p className="font-medium">{selectedTeacher.profile.email || '—'}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Telefone</p>
                    <p className="font-medium">{selectedTeacher.profile.phone || '—'}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Contrato</p>
                    <p className="font-medium">{contractTypeLabels[selectedTeacher.contractType]}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Carga Horária</p>
                    <p className="font-medium">{selectedTeacher.maxWeeklyHours}h/semana</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Especialidades</p>
                    <p className="font-medium">{selectedTeacher.specialties?.join(', ') || '—'}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Qualificações</p>
                    <p className="font-medium">{selectedTeacher.qualifications || '—'}</p>
                  </div>
                </div>
                {selectedTeacher.profile.bio && (
                  <>
                    <Separator />
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Sobre</p>
                      <p className="text-sm">{selectedTeacher.profile.bio}</p>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </DrawerContent>
      </Drawer>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Excluir Professor"
        description={`Tem certeza que deseja excluir o professor "${selectedTeacher?.profile.fullName}"? Esta ação não pode ser desfeita.`}
        confirmLabel="Excluir"
        variant="destructive"
        onConfirm={handleDelete}
      />
    </motion.div>
  )
}
