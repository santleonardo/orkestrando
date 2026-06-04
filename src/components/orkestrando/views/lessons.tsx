'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuthStore } from '@/store/auth-store'
import { api } from '@/lib/api'
import { DataTable, type Column } from '@/components/orkestrando/shared/data-table'
import { FormDialog, type FormField } from '@/components/orkestrando/shared/form-dialog'
import { ConfirmDialog } from '@/components/orkestrando/shared/confirm-dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus, Pencil, Trash2, Music, CalendarDays, Filter } from 'lucide-react'
import { toast } from 'sonner'
import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'

const statusLabels: Record<string, string> = { SCHEDULED: 'Agendada', COMPLETED: 'Concluída', CANCELLED: 'Cancelada', RESCHEDULED: 'Reagendada', REPLACEMENT: 'Substituição' }
const statusColors: Record<string, string> = { SCHEDULED: 'bg-emerald-100 text-emerald-700', COMPLETED: 'bg-slate-100 text-slate-700', CANCELLED: 'bg-red-100 text-red-700', RESCHEDULED: 'bg-amber-100 text-amber-700', REPLACEMENT: 'bg-violet-100 text-violet-700' }

export function LessonsView() {
  const queryClient = useQueryClient()
  const { user } = useAuthStore()
  const [createOpen, setCreateOpen] = useState(false)
  const [editItem, setEditItem] = useState<Record<string, unknown> | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState('')

  const { data: classes } = useQuery({ queryKey: ['lessons-classes'], queryFn: () => api.get('/api/classes') })
  const { data: rooms } = useQuery({ queryKey: ['lessons-rooms'], queryFn: () => api.get('/api/rooms') })

  const queryParams = new URLSearchParams()
  if (statusFilter) queryParams.set('status', statusFilter)
  const { data, isLoading } = useQuery({
    queryKey: ['lessons', statusFilter],
    queryFn: () => api.get(`/api/lessons?${queryParams.toString()}`),
  })

  const createMutation = useMutation({
    mutationFn: (values: Record<string, unknown>) => api.post('/api/lessons', values),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['lessons'] }); toast.success('Aula criada!'); setCreateOpen(false) },
    onError: () => toast.error('Erro ao criar aula'),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, ...values }: Record<string, unknown>) => api.put(`/api/lessons/${id}`, values),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['lessons'] }); toast.success('Aula atualizada!'); setEditItem(null) },
    onError: () => toast.error('Erro ao atualizar aula'),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/api/lessons/${id}`),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['lessons'] }); toast.success('Aula excluída!'); setDeleteId(null) },
    onError: () => toast.error('Erro ao excluir aula'),
  })

  const fields: FormField[] = [
    { type: 'select', name: 'classId', label: 'Turma', required: true, options: (classes?.data || []).map((c: Record<string, unknown>) => ({ label: `${c.code} - ${c.name}` as string, value: c.id as string })) },
    { type: 'text', name: 'teacherId', label: 'ID do Professor', placeholder: user?.id || 'ID', required: true },
    { type: 'date', name: 'date', label: 'Data', required: true },
    { type: 'time', name: 'startTime', label: 'Hora Início', required: true },
    { type: 'time', name: 'endTime', label: 'Hora Fim', required: true },
    { type: 'select', name: 'roomId', label: 'Sala', options: (rooms?.data || []).map((r: Record<string, unknown>) => ({ label: r.name as string, value: r.id as string })) },
    { type: 'text', name: 'topic', label: 'Tópico', placeholder: 'Tópico da aula' },
    { type: 'textarea', name: 'notes', label: 'Observações' },
    {
      type: 'select', name: 'status', label: 'Status',
      options: [
        { label: 'Agendada', value: 'SCHEDULED' },
        { label: 'Concluída', value: 'COMPLETED' },
        { label: 'Cancelada', value: 'CANCELLED' },
        { label: 'Reagendada', value: 'RESCHEDULED' },
      ],
    },
  ]

  const columns: Column[] = [
    {
      key: 'date', label: 'Data', render: (v) => (
        <div className="flex items-center gap-2">
          <div className="rounded-lg bg-emerald-50 p-1.5">
            <Music className="h-3.5 w-3.5 text-emerald-600" />
          </div>
          <div>
            <p className="text-sm font-medium">{format(parseISO(v as string), 'dd/MM/yyyy')}</p>
            <p className="text-xs text-slate-500">{format(parseISO(v as string), 'EEEE', { locale: ptBR })}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'startTime', label: 'Horário', render: (v, row) => `${v} - ${row.endTime}`,
    },
    { key: 'class', label: 'Turma', render: (v) => (v as Record<string, unknown>)?.discipline?.name || (v as Record<string, unknown>)?.name || '-' },
    { key: 'teacher', label: 'Professor', render: (v) => (v as Record<string, unknown>)?.name || '-' },
    { key: 'room', label: 'Sala', render: (v) => (v as Record<string, unknown>)?.name || '-' },
    { key: 'topic', label: 'Tópico' },
    {
      key: 'status', label: 'Status', render: (v) => (
        <Badge className={statusColors[v as string] || ''}>{statusLabels[v as string] || v}</Badge>
      ),
    },
    {
      key: 'id', label: 'Ações', render: (v, row) => (
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => { e.stopPropagation(); setEditItem(row) }}><Pencil className="h-4 w-4" /></Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500" onClick={(e) => { e.stopPropagation(); setDeleteId(v as string) }}><Trash2 className="h-4 w-4" /></Button>
        </div>
      ),
    },
  ]

  const lessons = data?.data || []
  const meta = data?.meta

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Agenda de Aulas</h2>
          <p className="text-sm text-slate-500">Visualize e gerencie todas as aulas</p>
        </div>
        <Button onClick={() => setCreateOpen(true)} className="bg-emerald-600 hover:bg-emerald-700 text-white">
          <Plus className="h-4 w-4 mr-2" /> Nova Aula
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="border-slate-200 shadow-sm">
          <CardContent className="p-3">
            <p className="text-xs text-slate-500">Total</p>
            <p className="text-xl font-bold text-slate-900">{meta?.total || lessons.length}</p>
          </CardContent>
        </Card>
        <Card className="border-slate-200 shadow-sm">
          <CardContent className="p-3">
            <p className="text-xs text-emerald-600">Agendadas</p>
            <p className="text-xl font-bold text-emerald-600">{lessons.filter((l: Record<string, unknown>) => l.status === 'SCHEDULED').length}</p>
          </CardContent>
        </Card>
        <Card className="border-slate-200 shadow-sm">
          <CardContent className="p-3">
            <p className="text-xs text-slate-500">Concluídas</p>
            <p className="text-xl font-bold text-slate-900">{lessons.filter((l: Record<string, unknown>) => l.status === 'COMPLETED').length}</p>
          </CardContent>
        </Card>
        <Card className="border-slate-200 shadow-sm">
          <CardContent className="p-3">
            <p className="text-xs text-red-500">Canceladas</p>
            <p className="text-xl font-bold text-red-600">{lessons.filter((l: Record<string, unknown>) => l.status === 'CANCELLED').length}</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 flex-wrap">
        <Button variant={statusFilter === '' ? 'default' : 'outline'} size="sm" className={statusFilter === '' ? 'bg-emerald-600 text-white' : ''} onClick={() => setStatusFilter('')}>Todas</Button>
        {Object.entries(statusLabels).map(([key, label]) => (
          <Button key={key} variant={statusFilter === key ? 'default' : 'outline'} size="sm" className={statusFilter === key ? 'bg-emerald-600 text-white' : ''} onClick={() => setStatusFilter(key)}>{label}</Button>
        ))}
      </div>

      <DataTable columns={columns} data={lessons} isLoading={isLoading} searchPlaceholder="Buscar aulas..." />

      <FormDialog open={createOpen} onOpenChange={setCreateOpen} title="Nova Aula" description="Agende uma nova aula" fields={fields} onSubmit={(values) => createMutation.mutate(values)} isLoading={createMutation.isPending} submitLabel="Agendar" />

      {editItem && (
        <FormDialog open={!!editItem} onOpenChange={() => setEditItem(null)} title="Editar Aula" fields={fields} defaultValues={editItem as Record<string, string>} onSubmit={(values) => updateMutation.mutate({ id: editItem.id, ...values })} isLoading={updateMutation.isPending} submitLabel="Salvar" />
      )}

      <ConfirmDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)} title="Excluir Aula" description="Tem certeza que deseja excluir esta aula?" confirmLabel="Excluir" onConfirm={() => deleteId && deleteMutation.mutate(deleteId)} />
    </div>
  )
}
