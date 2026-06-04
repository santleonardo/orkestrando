'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { DataTable, type Column } from '@/components/orkestrando/shared/data-table'
import { FormDialog, type FormField } from '@/components/orkestrando/shared/form-dialog'
import { ConfirmDialog } from '@/components/orkestrando/shared/confirm-dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Plus, Pencil, Trash2, DoorOpen } from 'lucide-react'
import { toast } from 'sonner'

export function RoomsView() {
  const queryClient = useQueryClient()
  const [createOpen, setCreateOpen] = useState(false)
  const [editItem, setEditItem] = useState<Record<string, unknown> | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const { data, isLoading } = useQuery({
    queryKey: ['rooms'],
    queryFn: () => api.get('/api/rooms'),
  })

  const createMutation = useMutation({
    mutationFn: (values: Record<string, unknown>) => api.post('/api/rooms', values),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['rooms'] }); toast.success('Sala criada!'); setCreateOpen(false) },
    onError: () => toast.error('Erro ao criar sala'),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, ...values }: Record<string, unknown>) => api.put(`/api/rooms/${id}`, values),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['rooms'] }); toast.success('Sala atualizada!'); setEditItem(null) },
    onError: () => toast.error('Erro ao atualizar sala'),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/api/rooms/${id}`),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['rooms'] }); toast.success('Sala excluída!'); setDeleteId(null) },
    onError: () => toast.error('Erro ao excluir sala'),
  })

  const fields: FormField[] = [
    { type: 'text', name: 'name', label: 'Nome da Sala', placeholder: 'Ex: Sala 101', required: true },
    { type: 'text', name: 'code', label: 'Código', placeholder: 'Ex: SAL-101', required: true },
    { type: 'number', name: 'capacity', label: 'Capacidade', placeholder: '40', required: true, min: 1 },
    {
      type: 'select', name: 'type', label: 'Tipo', required: true,
      options: [
        { label: 'Sala de Aula', value: 'classroom' },
        { label: 'Laboratório', value: 'lab' },
        { label: 'Auditório', value: 'auditorium' },
        { label: 'Sala de Reunião', value: 'meeting' },
      ],
      defaultValue: 'classroom',
    },
  ]

  const typeLabels: Record<string, string> = { classroom: 'Sala de Aula', lab: 'Laboratório', auditorium: 'Auditório', meeting: 'Reunião' }

  const columns: Column[] = [
    { key: 'code', label: 'Código' },
    { key: 'name', label: 'Nome' },
    { key: 'capacity', label: 'Capacidade', render: (v) => `${v} alunos` },
    { key: 'type', label: 'Tipo', render: (v) => <Badge variant="outline">{typeLabels[v as string] || v}</Badge> },
    {
      key: '_count', label: 'Aulas', render: (v) => (v as Record<string, unknown>)?.lessons || 0,
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

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Salas</h2>
          <p className="text-sm text-slate-500">Gerencie as salas da instituição</p>
        </div>
        <Button onClick={() => setCreateOpen(true)} className="bg-emerald-600 hover:bg-emerald-700 text-white">
          <Plus className="h-4 w-4 mr-2" /> Nova Sala
        </Button>
      </div>

      <DataTable columns={columns} data={data?.data || []} isLoading={isLoading} searchPlaceholder="Buscar salas..." />

      <FormDialog open={createOpen} onOpenChange={setCreateOpen} title="Nova Sala" description="Configure a sala" fields={fields} onSubmit={(values) => createMutation.mutate(values)} isLoading={createMutation.isPending} submitLabel="Criar Sala" />

      {editItem && (
        <FormDialog open={!!editItem} onOpenChange={() => setEditItem(null)} title="Editar Sala" fields={fields} defaultValues={editItem as Record<string, string>} onSubmit={(values) => updateMutation.mutate({ id: editItem.id, ...values })} isLoading={updateMutation.isPending} submitLabel="Salvar" />
      )}

      <ConfirmDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)} title="Excluir Sala" description="Tem certeza que deseja excluir esta sala?" confirmLabel="Excluir" onConfirm={() => deleteId && deleteMutation.mutate(deleteId)} />
    </div>
  )
}
