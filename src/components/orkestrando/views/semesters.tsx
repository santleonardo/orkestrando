'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { DataTable, type Column } from '@/components/orkestrando/shared/data-table'
import { FormDialog, type FormField } from '@/components/orkestrando/shared/form-dialog'
import { ConfirmDialog } from '@/components/orkestrando/shared/confirm-dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Plus, Pencil, Trash2, CalendarDays } from 'lucide-react'
import { toast } from 'sonner'
import { format, parseISO } from 'date-fns'

export function SemestersView() {
  const queryClient = useQueryClient()
  const [createOpen, setCreateOpen] = useState(false)
  const [editItem, setEditItem] = useState<Record<string, unknown> | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const { data, isLoading } = useQuery({
    queryKey: ['semesters'],
    queryFn: () => api.get('/api/semesters?activeOnly=false'),
  })

  const createMutation = useMutation({
    mutationFn: (values: Record<string, unknown>) => api.post('/api/semesters', values),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['semesters'] }); toast.success('Semestre criado!'); setCreateOpen(false) },
    onError: () => toast.error('Erro ao criar semestre'),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, ...values }: Record<string, unknown>) => api.put(`/api/semesters/${id}`, values),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['semesters'] }); toast.success('Semestre atualizado!'); setEditItem(null) },
    onError: () => toast.error('Erro ao atualizar semestre'),
  })

  const activateMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) => api.put(`/api/semesters/${id}`, { isActive }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['semesters'] }); toast.success('Status alterado!') },
    onError: () => toast.error('Erro ao alterar status'),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/api/semesters/${id}`),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['semesters'] }); toast.success('Semestre excluído!'); setDeleteId(null) },
    onError: () => toast.error('Erro ao excluir semestre'),
  })

  const fields: FormField[] = [
    { type: 'text', name: 'name', label: 'Nome', placeholder: 'Ex: 1° Semestre 2025', required: true },
    { type: 'text', name: 'code', label: 'Código', placeholder: 'Ex: 2025-1', required: true },
    { type: 'date', name: 'startDate', label: 'Data de Início', required: true },
    { type: 'date', name: 'endDate', label: 'Data de Término', required: true },
  ]

  const columns: Column[] = [
    { key: 'code', label: 'Código' },
    { key: 'name', label: 'Nome' },
    {
      key: 'startDate',
      label: 'Início',
      render: (v) => format(parseISO(v as string), 'dd/MM/yyyy'),
    },
    {
      key: 'endDate',
      label: 'Término',
      render: (v) => format(parseISO(v as string), 'dd/MM/yyyy'),
    },
    {
      key: '_count',
      label: 'Turmas',
      render: (v) => (v as Record<string, unknown>)?.classes || 0,
    },
    {
      key: 'isActive',
      label: 'Status',
      render: (v, row) => (
        <Badge
          variant={v ? 'default' : 'secondary'}
          className={`cursor-pointer ${v ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-100' : 'bg-slate-100 text-slate-600 hover:bg-slate-100'}`}
          onClick={(e) => { e.stopPropagation(); activateMutation.mutate({ id: row.id as string, isActive: !v as boolean }) }}
        >
          {v ? 'Ativo' : 'Inativo'}
        </Badge>
      ),
    },
    {
      key: 'id',
      label: 'Ações',
      render: (v, row) => (
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
          <h2 className="text-xl font-bold text-slate-900">Semestres</h2>
          <p className="text-sm text-slate-500">Gerencie os semestres letivos</p>
        </div>
        <Button onClick={() => setCreateOpen(true)} className="bg-emerald-600 hover:bg-emerald-700 text-white">
          <Plus className="h-4 w-4 mr-2" /> Novo Semestre
        </Button>
      </div>

      <DataTable columns={columns} data={data?.data || []} isLoading={isLoading} searchPlaceholder="Buscar semestres..." />

      <FormDialog open={createOpen} onOpenChange={setCreateOpen} title="Novo Semestre" description="Configure o semestre letivo" fields={fields} onSubmit={(values) => createMutation.mutate(values)} isLoading={createMutation.isPending} submitLabel="Criar Semestre" />

      {editItem && (
        <FormDialog open={!!editItem} onOpenChange={() => setEditItem(null)} title="Editar Semestre" fields={fields} defaultValues={editItem as Record<string, string>} onSubmit={(values) => updateMutation.mutate({ id: editItem.id, ...values })} isLoading={updateMutation.isPending} submitLabel="Salvar" />
      )}

      <ConfirmDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)} title="Excluir Semestre" description="Tem certeza que deseja excluir este semestre?" confirmLabel="Excluir" onConfirm={() => deleteId && deleteMutation.mutate(deleteId)} />
    </div>
  )
}
