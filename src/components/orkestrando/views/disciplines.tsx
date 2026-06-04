'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { DataTable, type Column } from '@/components/orkestrando/shared/data-table'
import { FormDialog, type FormField } from '@/components/orkestrando/shared/form-dialog'
import { ConfirmDialog } from '@/components/orkestrando/shared/confirm-dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { toast } from 'sonner'

export function DisciplinesView() {
  const queryClient = useQueryClient()
  const [createOpen, setCreateOpen] = useState(false)
  const [editItem, setEditItem] = useState<Record<string, unknown> | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [courseFilter, setCourseFilter] = useState('')

  const { data: courses } = useQuery({
    queryKey: ['courses-list'],
    queryFn: () => api.get('/api/courses'),
  })

  const { data, isLoading } = useQuery({
    queryKey: ['disciplines', courseFilter],
    queryFn: () => api.get(`/api/disciplines${courseFilter ? `?courseId=${courseFilter}` : ''}`),
  })

  const createMutation = useMutation({
    mutationFn: (values: Record<string, unknown>) => api.post('/api/disciplines', values),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['disciplines'] }); toast.success('Disciplina criada!'); setCreateOpen(false) },
    onError: () => toast.error('Erro ao criar disciplina'),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, ...values }: Record<string, unknown>) => api.put(`/api/disciplines/${id}`, values),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['disciplines'] }); toast.success('Disciplina atualizada!'); setEditItem(null) },
    onError: () => toast.error('Erro ao atualizar disciplina'),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/api/disciplines/${id}`),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['disciplines'] }); toast.success('Disciplina excluída!'); setDeleteId(null) },
    onError: () => toast.error('Erro ao excluir disciplina'),
  })

  const fields: FormField[] = [
    { type: 'text', name: 'name', label: 'Nome da Disciplina', placeholder: 'Ex: Programação Orientada a Objetos', required: true },
    { type: 'text', name: 'code', label: 'Código', placeholder: 'Ex: POO101', required: true },
    { type: 'select', name: 'courseId', label: 'Curso', placeholder: 'Selecione o curso', required: true, options: (courses?.data || []).map((c: Record<string, unknown>) => ({ label: c.name as string, value: c.id as string })) },
    { type: 'textarea', name: 'description', label: 'Descrição', placeholder: 'Ementa da disciplina' },
    { type: 'number', name: 'workload', label: 'Carga Horária (horas)', placeholder: '60', defaultValue: 60 },
  ]

  const columns: Column[] = [
    { key: 'code', label: 'Código' },
    { key: 'name', label: 'Nome' },
    { key: 'course', label: 'Curso', render: (v) => (v as Record<string, unknown>)?.name || '-' },
    { key: 'workload', label: 'Carga Horária', render: (v) => `${v}h` },
    {
      key: 'isActive',
      label: 'Status',
      render: (v) => <Badge variant={v ? 'default' : 'secondary'} className={v ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-100' : ''}>{v ? 'Ativa' : 'Inativa'}</Badge>,
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
          <h2 className="text-xl font-bold text-slate-900">Disciplinas</h2>
          <p className="text-sm text-slate-500">Gerencie as disciplinas dos cursos</p>
        </div>
        <Button onClick={() => setCreateOpen(true)} className="bg-emerald-600 hover:bg-emerald-700 text-white">
          <Plus className="h-4 w-4 mr-2" /> Nova Disciplina
        </Button>
      </div>

      <DataTable columns={columns} data={data?.data || []} isLoading={isLoading} searchPlaceholder="Buscar disciplinas..." />

      <FormDialog open={createOpen} onOpenChange={setCreateOpen} title="Nova Disciplina" description="Preencha os dados da disciplina" fields={fields} onSubmit={(values) => createMutation.mutate(values)} isLoading={createMutation.isPending} submitLabel="Criar Disciplina" />

      {editItem && (
        <FormDialog open={!!editItem} onOpenChange={() => setEditItem(null)} title="Editar Disciplina" fields={fields} defaultValues={editItem as Record<string, string>} onSubmit={(values) => updateMutation.mutate({ id: editItem.id, ...values })} isLoading={updateMutation.isPending} submitLabel="Salvar" />
      )}

      <ConfirmDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)} title="Excluir Disciplina" description="Tem certeza que deseja excluir esta disciplina?" confirmLabel="Excluir" onConfirm={() => deleteId && deleteMutation.mutate(deleteId)} />
    </div>
  )
}
