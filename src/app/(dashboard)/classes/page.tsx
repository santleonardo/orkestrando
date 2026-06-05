'use client'

import { useState, useMemo } from 'react'
import { PageHeader } from '@/components/shared/page-header'
import { DataTable, SortableHeader } from '@/components/shared/data-table'
import { StatsCard } from '@/components/shared/stats-card'
import { ConfirmDialog } from '@/components/shared/confirm-dialog'
import { EmptyState } from '@/components/shared/empty-state'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '@/components/ui/drawer'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { Plus, DoorOpen, Users, Clock, MoreHorizontal, Eye, Pencil, Trash2, CalendarDays, MapPin, BookOpen, UserPlus } from 'lucide-react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { getInitials } from '@/lib/utils/format'
import { WEEKDAYS_SHORT, CLASS_STATUS_LABELS } from '@/lib/constants'
import { toast } from 'sonner'
import { motion } from 'framer-motion'
import type { ColumnDef } from '@tanstack/react-table'
import type { Class as ClassType } from '@/lib/types'

// Mock data
const mockClasses: ClassType[] = [
  {
    id: '1', organizationId: 'o1', courseId: 'c1', subjectId: 's1', teacherId: 't1',
    semesterId: 'sem1', roomId: 'r1', name: 'Matemática A - Turma 1', code: 'MAT-A1',
    schedule: { dayOfWeek: 1, startTime: '08:00', endTime: '09:40', recurring: true, recurrencePattern: 'weekly' },
    maxCapacity: 35, currentEnrollment: 30, status: 'active',
    startDate: '2025-02-03', endDate: '2025-06-30', startTime: '08:00', endTime: '09:40', dayOfWeek: 1,
    description: 'Turma de Matemática Avançada', createdAt: '2025-01-15', updatedAt: '2025-01-15',
  },
  {
    id: '2', organizationId: 'o1', courseId: 'c2', subjectId: 's2', teacherId: 't2',
    semesterId: 'sem1', roomId: 'r2', name: 'Física II - Turma 1', code: 'FIS-B1',
    schedule: { dayOfWeek: 2, startTime: '09:50', endTime: '11:30', recurring: true, recurrencePattern: 'weekly' },
    maxCapacity: 30, currentEnrollment: 28, status: 'active',
    startDate: '2025-02-04', endDate: '2025-06-30', startTime: '09:50', endTime: '11:30', dayOfWeek: 2,
    createdAt: '2025-01-15', updatedAt: '2025-01-15',
  },
  {
    id: '3', organizationId: 'o1', courseId: 'c3', subjectId: 's3', teacherId: 't3',
    semesterId: 'sem1', roomId: 'r3', name: 'Programação Web', code: 'PRG-W1',
    schedule: { dayOfWeek: 3, startTime: '13:00', endTime: '14:40', recurring: true, recurrencePattern: 'weekly' },
    maxCapacity: 40, currentEnrollment: 35, status: 'active',
    startDate: '2025-02-05', endDate: '2025-06-30', startTime: '13:00', endTime: '14:40', dayOfWeek: 3,
    createdAt: '2025-01-15', updatedAt: '2025-01-15',
  },
  {
    id: '4', organizationId: 'o1', courseId: 'c4', subjectId: 's4', teacherId: 't1',
    semesterId: 'sem1', roomId: 'r1', name: 'Cálculo I - Turma 2', code: 'CAL-A2',
    schedule: { dayOfWeek: 4, startTime: '08:00', endTime: '09:40', recurring: true, recurrencePattern: 'weekly' },
    maxCapacity: 35, currentEnrollment: 33, status: 'active',
    startDate: '2025-02-06', endDate: '2025-06-30', startTime: '08:00', endTime: '09:40', dayOfWeek: 4,
    createdAt: '2025-01-15', updatedAt: '2025-01-15',
  },
  {
    id: '5', organizationId: 'o1', courseId: 'c5', subjectId: 's5', teacherId: 't4',
    semesterId: 'sem1', roomId: 'r4', name: 'Português Avançado', code: 'POR-C1',
    schedule: { dayOfWeek: 5, startTime: '14:50', endTime: '16:30', recurring: true, recurrencePattern: 'weekly' },
    maxCapacity: 30, currentEnrollment: 25, status: 'completed',
    startDate: '2024-08-05', endDate: '2024-12-20', startTime: '14:50', endTime: '16:30', dayOfWeek: 5,
    createdAt: '2024-07-20', updatedAt: '2024-12-20',
  },
  {
    id: '6', organizationId: 'o1', courseId: 'c6', subjectId: 's6', teacherId: 't5',
    semesterId: 'sem1', roomId: 'r5', name: 'Química Orgânica', code: 'QUI-D1',
    schedule: { dayOfWeek: 1, startTime: '19:00', endTime: '20:40', recurring: true, recurrencePattern: 'weekly' },
    maxCapacity: 25, currentEnrollment: 20, status: 'cancelled',
    startDate: '2025-02-03', endDate: '2025-06-30', startTime: '19:00', endTime: '20:40', dayOfWeek: 1,
    createdAt: '2025-01-15', updatedAt: '2025-03-01',
  },
]

const statusColor: Record<string, string> = {
  active: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300',
  completed: 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300',
  inactive: 'bg-gray-100 text-gray-700 dark:bg-gray-900/50 dark:text-gray-300',
  cancelled: 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300',
}

export default function ClassesPage() {
  const [classes, setClasses] = useState(mockClasses)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [detailOpen, setDetailOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [selectedClass, setSelectedClass] = useState<ClassType | null>(null)
  const [formData, setFormData] = useState({
    name: '', code: '', courseId: '', subjectId: '', teacherId: '', roomId: '',
    maxCapacity: '30', startTime: '08:00', endTime: '09:40', dayOfWeek: '1',
    startDate: '2025-02-03', endDate: '2025-06-30',
  })

  const statsData = useMemo(() => ({
    total: classes.length,
    active: classes.filter((c) => c.status === 'active').length,
    completed: classes.filter((c) => c.status === 'completed').length,
  }), [classes])

  const columns: ColumnDef<ClassType>[] = [
    {
      accessorKey: 'name',
      header: ({ column }) => <SortableHeader column={column}>Turma</SortableHeader>,
      cell: ({ row }) => (
        <div>
          <p className="font-medium text-sm">{row.original.name}</p>
          <p className="text-xs text-muted-foreground">{row.original.code}</p>
        </div>
      ),
    },
    {
      accessorKey: 'teacherId',
      header: 'Professor',
      cell: () => <span className="text-sm">Prof. Silva</span>,
    },
    {
      accessorKey: 'roomId',
      header: 'Sala',
      cell: () => <span className="text-sm">Sala 201</span>,
    },
    {
      accessorKey: 'currentEnrollment',
      header: 'Alunos',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden max-w-[60px]">
            <div
              className="h-full rounded-full bg-emerald-500"
              style={{ width: `${(row.original.currentEnrollment / row.original.maxCapacity) * 100}%` }}
            />
          </div>
          <span className="text-xs text-muted-foreground">{row.original.currentEnrollment}/{row.original.maxCapacity}</span>
        </div>
      ),
    },
    {
      accessorKey: 'dayOfWeek',
      header: 'Horário',
      cell: ({ row }) => (
        <span className="text-sm">
          {WEEKDAYS_SHORT[row.original.dayOfWeek as keyof typeof WEEKDAYS_SHORT]} {row.original.startTime} - {row.original.endTime}
        </span>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => (
        <Badge variant="secondary" className={`text-xs ${statusColor[row.original.status] || ''}`}>
          {CLASS_STATUS_LABELS[row.original.status] || row.original.status}
        </Badge>
      ),
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => { setSelectedClass(row.original); setDetailOpen(true) }}>
              <Eye className="mr-2 h-4 w-4" /> Ver detalhes
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => { setSelectedClass(row.original); openEditDialog(row.original) }}>
              <Pencil className="mr-2 h-4 w-4" /> Editar
            </DropdownMenuItem>
            <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => { setSelectedClass(row.original); setDeleteOpen(true) }}>
              <Trash2 className="mr-2 h-4 w-4" /> Excluir
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ]

  const openEditDialog = (cls: ClassType) => {
    setFormData({
      name: cls.name, code: cls.code, courseId: cls.courseId, subjectId: cls.subjectId,
      teacherId: cls.teacherId, roomId: cls.roomId || '',
      maxCapacity: String(cls.maxCapacity), startTime: cls.startTime, endTime: cls.endTime,
      dayOfWeek: String(cls.dayOfWeek), startDate: cls.startDate, endDate: cls.endDate,
    })
    setDialogOpen(true)
  }

  const handleSave = () => {
    toast.success(selectedClass ? 'Turma atualizada com sucesso!' : 'Turma criada com sucesso!')
    setDialogOpen(false)
  }

  const handleDelete = () => {
    setClasses((prev) => prev.filter((c) => c.id !== selectedClass?.id))
    toast.success('Turma excluída com sucesso!')
    setDeleteOpen(false)
  }

  const handleGenerateLessons = (clsId: string) => {
    toast.success('Aulas geradas com sucesso para esta turma!')
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <PageHeader
        title="Turmas"
        description="Gerencie as turmas e aulas da instituição"
        breadcrumbs={[{ label: 'Dashboard', href: '/' }, { label: 'Turmas' }]}
        actions={<Button onClick={() => { setSelectedClass(null); setFormData({ name: '', code: '', courseId: '', subjectId: '', teacherId: '', roomId: '', maxCapacity: '30', startTime: '08:00', endTime: '09:40', dayOfWeek: '1', startDate: '2025-02-03', endDate: '2025-06-30' }); setDialogOpen(true) }}>
          <Plus className="mr-2 h-4 w-4" /> Nova Turma
        </Button>}
      />

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
        <StatsCard title="Total Turmas" value={statsData.total} icon={DoorOpen} iconColor="text-amber-600 bg-amber-50 dark:bg-amber-950/50" />
        <StatsCard title="Ativas" value={statsData.active} icon={Users} iconColor="text-emerald-600 bg-emerald-50 dark:bg-emerald-950/50" />
        <StatsCard title="Concluídas" value={statsData.completed} icon={CalendarDays} iconColor="text-blue-600 bg-blue-50 dark:bg-blue-950/50" />
      </div>

      <DataTable
        columns={columns}
        data={classes}
        searchKey="name"
        searchPlaceholder="Buscar turma..."
        emptyIcon={DoorOpen}
        emptyTitle="Nenhuma turma encontrada"
        emptyDescription="Comece criando uma nova turma."
        emptyAction={{ label: 'Nova Turma', onClick: () => setDialogOpen(true) }}
      />

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedClass ? 'Editar Turma' : 'Nova Turma'}</DialogTitle>
            <DialogDescription>{selectedClass ? 'Atualize os dados da turma.' : 'Preencha os dados para criar uma nova turma.'}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2"><Label>Nome</Label><Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="Matemática A - Turma 1" /></div>
              <div className="space-y-2"><Label>Código</Label><Input value={formData.code} onChange={(e) => setFormData({ ...formData, code: e.target.value })} placeholder="MAT-A1" /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2"><Label>Curso</Label>
                <Select value={formData.courseId} onValueChange={(v) => setFormData({ ...formData, courseId: v })}>
                  <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent><SelectItem value="c1">Ciência da Computação</SelectItem><SelectItem value="c2">Engenharia</SelectItem><SelectItem value="c3">Administração</SelectItem></SelectContent>
                </Select>
              </div>
              <div className="space-y-2"><Label>Disciplina</Label>
                <Select value={formData.subjectId} onValueChange={(v) => setFormData({ ...formData, subjectId: v })}>
                  <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent><SelectItem value="s1">Matemática</SelectItem><SelectItem value="s2">Física</SelectItem><SelectItem value="s3">Programação</SelectItem></SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2"><Label>Professor</Label>
                <Select value={formData.teacherId} onValueChange={(v) => setFormData({ ...formData, teacherId: v })}>
                  <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent><SelectItem value="t1">Prof. Carlos Silva</SelectItem><SelectItem value="t2">Prof. Maria Santos</SelectItem><SelectItem value="t3">Prof. João Oliveira</SelectItem></SelectContent>
                </Select>
              </div>
              <div className="space-y-2"><Label>Sala</Label>
                <Select value={formData.roomId} onValueChange={(v) => setFormData({ ...formData, roomId: v })}>
                  <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent><SelectItem value="r1">Sala 201</SelectItem><SelectItem value="r2">Lab 03</SelectItem><SelectItem value="r3">Lab 01</SelectItem></SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-2"><Label>Dia</Label>
                <Select value={formData.dayOfWeek} onValueChange={(v) => setFormData({ ...formData, dayOfWeek: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Segunda</SelectItem><SelectItem value="2">Terça</SelectItem><SelectItem value="3">Quarta</SelectItem>
                    <SelectItem value="4">Quinta</SelectItem><SelectItem value="5">Sexta</SelectItem><SelectItem value="6">Sábado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2"><Label>Início</Label><Input type="time" value={formData.startTime} onChange={(e) => setFormData({ ...formData, startTime: e.target.value })} /></div>
              <div className="space-y-2"><Label>Fim</Label><Input type="time" value={formData.endTime} onChange={(e) => setFormData({ ...formData, endTime: e.target.value })} /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2"><Label>Data Início</Label><Input type="date" value={formData.startDate} onChange={(e) => setFormData({ ...formData, startDate: e.target.value })} /></div>
              <div className="space-y-2"><Label>Data Fim</Label><Input type="date" value={formData.endDate} onChange={(e) => setFormData({ ...formData, endDate: e.target.value })} /></div>
            </div>
            <div className="space-y-2"><Label>Vagas</Label><Input type="number" value={formData.maxCapacity} onChange={(e) => setFormData({ ...formData, maxCapacity: e.target.value })} /></div>
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
          <div className="max-w-2xl mx-auto">
            <DrawerHeader><DrawerTitle>Detalhes da Turma</DrawerTitle></DrawerHeader>
            {selectedClass && (
              <div className="space-y-6 px-4 pb-8">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold">{selectedClass.name}</h3>
                    <p className="text-sm text-muted-foreground">{selectedClass.code}</p>
                  </div>
                  <Badge variant="secondary" className={statusColor[selectedClass.status]}>
                    {CLASS_STATUS_LABELS[selectedClass.status]}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                  <div className="flex items-center gap-2"><Users className="h-4 w-4 text-muted-foreground" /><div><p className="text-xs text-muted-foreground">Alunos</p><p className="font-medium">{selectedClass.currentEnrollment}/{selectedClass.maxCapacity}</p></div></div>
                  <div className="flex items-center gap-2"><MapPin className="h-4 w-4 text-muted-foreground" /><div><p className="text-xs text-muted-foreground">Sala</p><p className="font-medium">Sala 201</p></div></div>
                  <div className="flex items-center gap-2"><Clock className="h-4 w-4 text-muted-foreground" /><div><p className="text-xs text-muted-foreground">Horário</p><p className="font-medium">{WEEKDAYS_SHORT[selectedClass.dayOfWeek as keyof typeof WEEKDAYS_SHORT]} {selectedClass.startTime}-{selectedClass.endTime}</p></div></div>
                  <div className="flex items-center gap-2"><CalendarDays className="h-4 w-4 text-muted-foreground" /><div><p className="text-xs text-muted-foreground">Período</p><p className="font-medium">{selectedClass.startDate} a {selectedClass.endDate}</p></div></div>
                </div>

                <Tabs defaultValue="students">
                  <TabsList>
                    <TabsTrigger value="students">Alunos</TabsTrigger>
                    <TabsTrigger value="lessons">Aulas</TabsTrigger>
                    <TabsTrigger value="attendance">Frequência</TabsTrigger>
                    <TabsTrigger value="materials">Materiais</TabsTrigger>
                  </TabsList>
                  <TabsContent value="students" className="mt-4">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm">Alunos Matriculados ({selectedClass.currentEnrollment})</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {Array.from({ length: Math.min(selectedClass.currentEnrollment, 5) }).map((_, i) => (
                            <div key={i} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50">
                              <Avatar className="h-8 w-8">
                                <AvatarFallback className="text-xs">{String.fromCharCode(65 + i)}</AvatarFallback>
                              </Avatar>
                              <div className="flex-1"><p className="text-sm font-medium">Aluno {i + 1}</p><p className="text-xs text-muted-foreground">matricula{i + 1}@escola.com</p></div>
                              <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => toast.info('Funcionalidade de desmatrícula')}>
                                <UserPlus className="h-3 w-3 mr-1" />
                              </Button>
                            </div>
                          ))}
                          {selectedClass.currentEnrollment > 5 && (
                            <p className="text-xs text-muted-foreground text-center pt-2">...e mais {selectedClass.currentEnrollment - 5} alunos</p>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                  <TabsContent value="lessons" className="mt-4">
                    <Card>
                      <CardHeader className="pb-2 flex flex-row items-center justify-between">
                        <CardTitle className="text-sm">Aulas Geradas</CardTitle>
                        <Button size="sm" variant="outline" onClick={() => handleGenerateLessons(selectedClass.id)}>
                          <CalendarDays className="mr-1.5 h-3.5 w-3.5" /> Gerar Aulas
                        </Button>
                      </CardHeader>
                      <CardContent>
                        <EmptyState
                          icon={CalendarDays}
                          title="Nenhuma aula gerada"
                          description="Clique em 'Gerar Aulas' para criar todas as aulas recorrentes do semestre."
                        />
                      </CardContent>
                    </Card>
                  </TabsContent>
                  <TabsContent value="attendance" className="mt-4">
                    <Card>
                      <CardContent className="pt-6">
                        <EmptyState icon={BookOpen} title="Sem dados de frequência" description="A frequência será registrada após a geração de aulas." />
                      </CardContent>
                    </Card>
                  </TabsContent>
                  <TabsContent value="materials" className="mt-4">
                    <Card>
                      <CardContent className="pt-6">
                        <EmptyState icon={BookOpen} title="Nenhum material" description="Nenhum material foi adicionado a esta turma ainda." />
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </div>
            )}
          </div>
        </DrawerContent>
      </Drawer>

      <ConfirmDialog
        open={deleteOpen} onOpenChange={setDeleteOpen}
        title="Excluir Turma"
        description={`Tem certeza que deseja excluir a turma "${selectedClass?.name}"?`}
        confirmLabel="Excluir" variant="destructive" onConfirm={handleDelete}
      />
    </motion.div>
  )
}
