'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { DataTable, type Column } from '@/components/orkestrando/shared/data-table'
import { FormDialog, type FormField } from '@/components/orkestrando/shared/form-dialog'
import { ConfirmDialog } from '@/components/orkestrando/shared/confirm-dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Plus, Pencil, Trash2, Users, Music } from 'lucide-react'
import { toast } from 'sonner'

export function ClassesView() {
  const queryClient = useQueryClient()
  const [createOpen, setCreateOpen] = useState(false)
  const [editItem, setEditItem] = useState<Record<string, unknown> | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [generateId, setGenerateId] = useState<string | null>(null)

  const { data: courses } = useQuery({ queryKey: ['classes-courses'], queryFn: () => api.get('/api/courses') })
  const { data: disciplines } = useQuery({ queryKey: ['classes-disciplines'], queryFn: () => api.get('/api/disciplines') })
  const { data: semesters } = useQuery({ queryKey: ['classes-semesters'], queryFn: () => api.get('/api/semesters') })
  const { data: teachers } = useQuery({ queryKey: ['classes-teachers'], queryFn: () => api.get('/api/route') })
  const { data: rooms } = useQuery({ queryKey: ['classes-rooms'], queryFn: () => api.get('/api/rooms') })

  const { data, isLoading } = useQuery({
    queryKey: ['classes'],
    queryFn: () => api.get('/api/classes'),
  })

  const createMutation = useMutation({
    mutationFn: (values: Record<string, unknown>) => api.post('/api/classes', values),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['classes'] }); toast.success('Turma criada com sucesso!'); setCreateOpen(false) },
    onError: () => toast.error('Erro ao criar turma'),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, ...values }: Record<string, unknown>) => api.put(`/api/classes/${id}`, values),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['classes'] }); toast.success('Turma atualizada!'); setEditItem(null) },
    onError: () => toast.error('Erro ao atualizar turma'),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/api/classes/${id}`),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['classes'] }); toast.success('Turma excluída!'); setDeleteId(null) },
    onError: () => toast.error('Erro ao excluir turma'),
  })

  const generateMutation = useMutation({
    mutationFn: (id: string) => api.post('/api/lessons/generate', { classId: id }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['classes'] }); toast.success('Aulas geradas com sucesso!'); setGenerateId(null) },
    onError: () => toast.error('Erro ao gerar aulas'),
  })

  const fields: FormField[] = [
    { type: 'text', name: 'name', label: 'Nome da Turma', placeholder: 'Ex: Turma A - POO', required: true },
    { type: 'text', name: 'code', label: 'Código', placeholder: 'Ex: POO-2025-1A', required: true },
    { type: 'select', name: 'disciplineId', label: 'Disciplina', required: true, options: (disciplines?.data || []).map((d: Record<string, unknown>) => ({ label: `${d.code} - ${d.name}` as string, value: d.id as string })) },
    { type: 'select', name: 'semesterId', label: 'Semestre', required: true, options: (semesters?.data || []).map((s: Record<string, unknown>) => ({ label: s.name as string, value: s.id as string })) },
    { type: 'text', name: 'teacherId', label: 'ID do Professor', placeholder: 'ID do professor', required: true },
    { type: 'textarea', name: 'schedule', label: 'Horário (JSON)', placeholder: '[{"day":1,"start":"08:00","end":"10:00"}]', required: true },
    { type: 'text', name: 'room', label: 'Sala (código)', placeholder: 'Ex: SAL-101' },
    { type: 'number', name: 'maxStudents', label: 'Máx. Alunos', defaultValue: 40, min: 1 },
  ]

  const columns: Column[] = [
    { key: 'code', label: 'Código' },
    { key: 'name', label: 'Nome' },
    { key: 'discipline', label: 'Disciplina', render: (v) => (v as Record<string, unknown>)?.name || '-' },
    { key: 'semester', label: 'Semestre', render: (v) => (v as Record<string, unknown>)?.name || '-' },
    { key: 'teacher', label: 'Professor', render: (v) => (v as Record<string, unknown>)?.name || '-' },
    {
      key: '_count', label: 'Alunos', render: (v) => (v as Record<string, unknown>)?.enrollments || 0,
    },
    {
      key: 'id', label: 'Ações', render: (v, row) => (
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => { e.stopPropagation(); setEditItem(row) }}><Pencil className="h-4 w-4" /></Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-emerald-600" onClick={(e) => { e.stopPropagation(); setGenerateId(v as string) }} title="Gerar Aulas"><Music className="h-4 w-4" /></Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500" onClick={(e) => { e.stopPropagation(); setDeleteId(v as string) }}><Trash2 className="h-4 w-4" /></Button>
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Turmas</h2>
          <p className="text-sm text-slate-500">Gerencie as turmas e aulas</p>
        </div>
        <Button onClick={() => setCreateOpen(true)} className="bg-emerald-600 hover:bg-emerald-700 text-white">
          <Plus className="h-4 w-4 mr-2" /> Nova Turma
        </Button>
      </div>

      <DataTable columns={columns} data={data?.data || []} isLoading={isLoading} searchPlaceholder="Buscar turmas..." />

      <FormDialog open={createOpen} onOpenChange={setCreateOpen} title="Nova Turma" description="Configure a turma" fields={fields} onSubmit={(values) => createMutation.mutate(values)} isLoading={createMutation.isPending} submitLabel="Criar Turma" />

      {editItem && (
        <FormDialog open={!!editItem} onOpenChange={() => setEditItem(null)} title="Editar Turma" fields={fields} defaultValues={editItem as Record<string, string>} onSubmit={(values) => updateMutation.mutate({ id: editItem.id, ...values })} isLoading={updateMutation.isPending} submitLabel="Salvar" />
      )}

      <ConfirmDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)} title="Excluir Turma" description="Tem certeza que deseja excluir esta turma?" confirmLabel="Excluir" onConfirm={() => deleteId && deleteMutation.mutate(deleteId)} />

      <ConfirmDialog open={!!generateId} onOpenChange={() => setGenerateId(null)} title="Gerar Aulas" description="Isso vai gerar aulas para esta turma baseado no horário. Aulas existentes serão substituídas." confirmLabel="Gerar" destructive={false} onConfirm={() => generateId && generateMutation.mutate(generateId)} />
    </div>
  )
}
