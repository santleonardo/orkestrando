'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { DataTable, type Column } from '@/components/orkestrando/shared/data-table'
import { FormDialog, type FormField } from '@/components/orkestrando/shared/form-dialog'
import { ConfirmDialog } from '@/components/orkestrando/shared/confirm-dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Plus, Pencil, Trash2, BookOpen } from 'lucide-react'
import { toast } from 'sonner'

export function CoursesView() {
  const queryClient = useQueryClient()
  const [createOpen, setCreateOpen] = useState(false)
  const [editItem, setEditItem] = useState<Record<string, unknown> | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const { data, isLoading } = useQuery({
    queryKey: ['courses'],
    queryFn: () => api.get('/api/courses'),
  })

  const createMutation = useMutation({
    mutationFn: (values: Record<string, unknown>) => api.post('/api/courses', values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] })
      toast.success('Curso criado com sucesso!')
      setCreateOpen(false)
    },
    onError: () => toast.error('Erro ao criar curso'),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, ...values }: Record<string, unknown>) => api.put(`/api/courses/${id}`, values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] })
      toast.success('Curso atualizado com sucesso!')
      setEditItem(null)
    },
    onError: () => toast.error('Erro ao atualizar curso'),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/api/courses/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] })
      toast.success('Curso excluído com sucesso!')
      setDeleteId(null)
    },
    onError: () => toast.error('Erro ao excluir curso'),
  })

  const fields: FormField[] = [
    { type: 'text', name: 'name', label: 'Nome do Curso', placeholder: 'Ex: Engenharia de Software', required: true },
    { type: 'text', name: 'code', label: 'Código', placeholder: 'Ex: ENG-SOFT', required: true },
    { type: 'textarea', name: 'description', label: 'Descrição', placeholder: 'Descrição do curso' },
    { type: 'number', name: 'duration', label: 'Duração (semestres)', placeholder: '8', defaultValue: 8, min: 1, max: 12 },
  ]

  const columns: Column[] = [
    { key: 'code', label: 'Código' },
    { key: 'name', label: 'Nome' },
    {
      key: 'duration',
      label: 'Duração',
      render: (v) => `${v} semestres`,
    },
    {
      key: '_count',
      label: 'Disciplinas',
      render: (v, row) => {
        const count = v as Record<string, unknown>
        return (count?.disciplines as number) || 0
      },
    },
    {
      key: 'isActive',
      label: 'Status',
      render: (v) => (
        <Badge variant={v ? 'default' : 'secondary'} className={v ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-100' : ''}>
          {v ? 'Ativo' : 'Inativo'}
        </Badge>
      ),
    },
    {
      key: 'id',
      label: 'Ações',
      render: (v, row) => (
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => { e.stopPropagation(); setEditItem(row) }}>
            <Pencil className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-600" onClick={(e) => { e.stopPropagation(); setDeleteId(v as string) }}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Cursos</h2>
          <p className="text-sm text-slate-500">Gerencie os cursos da instituição</p>
        </div>
        <Button onClick={() => setCreateOpen(true)} className="bg-emerald-600 hover:bg-emerald-700 text-white">
          <Plus className="h-4 w-4 mr-2" /> Novo Curso
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={data?.data || []}
        isLoading={isLoading}
        searchPlaceholder="Buscar cursos..."
        actions={
          <Button onClick={() => setCreateOpen(true)} size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white">
            <Plus className="h-4 w-4 mr-1" /> Novo
          </Button>
        }
      />

      <FormDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        title="Novo Curso"
        description="Preencha os dados do curso"
        fields={fields}
        onSubmit={(values) => createMutation.mutate(values)}
        isLoading={createMutation.isPending}
        submitLabel="Criar Curso"
      />

      {editItem && (
        <FormDialog
          open={!!editItem}
          onOpenChange={() => setEditItem(null)}
          title="Editar Curso"
          description="Altere os dados do curso"
          fields={fields}
          defaultValues={editItem as Record<string, string>}
          onSubmit={(values) => updateMutation.mutate({ id: editItem.id, ...values })}
          isLoading={updateMutation.isPending}
          submitLabel="Salvar Alterações"
        />
      )}

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={() => setDeleteId(null)}
        title="Excluir Curso"
        description="Tem certeza que deseja excluir este curso? Esta ação não pode ser desfeita."
        confirmLabel="Excluir"
        onConfirm={() => deleteId && deleteMutation.mutate(deleteId)}
      />
    </div>
  )
}
