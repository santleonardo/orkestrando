'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { DataTable, type Column } from '@/components/orkestrando/shared/data-table'
import { FormDialog, type FormField } from '@/components/orkestrando/shared/form-dialog'
import { ConfirmDialog } from '@/components/orkestrando/shared/confirm-dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Plus, Trash2, UserCheck } from 'lucide-react'
import { toast } from 'sonner'
import { format, parseISO } from 'date-fns'

export function EnrollmentsView() {
  const queryClient = useQueryClient()
  const [createOpen, setCreateOpen] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const { data: classes } = useQuery({ queryKey: ['enroll-classes'], queryFn: () => api.get('/api/classes') })

  const { data, isLoading } = useQuery({
    queryKey: ['enrollments'],
    queryFn: () => api.get('/api/enrollments'),
  })

  const createMutation = useMutation({
    mutationFn: (values: Record<string, unknown>) => api.post('/api/enrollments', values),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['enrollments'] }); toast.success('Matrícula realizada!'); setCreateOpen(false) },
    onError: () => toast.error('Erro ao realizar matrícula'),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/api/enrollments/${id}`),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['enrollments'] }); toast.success('Matrícula removida!'); setDeleteId(null) },
    onError: () => toast.error('Erro ao remover matrícula'),
  })

  const fields: FormField[] = [
    { type: 'text', name: 'studentId', label: 'ID do Aluno', placeholder: 'ID do aluno', required: true },
    { type: 'select', name: 'classId', label: 'Turma', required: true, options: (classes?.data || []).map((c: Record<string, unknown>) => ({ label: `${c.code} - ${c.name}` as string, value: c.id as string })) },
  ]

  const columns: Column[] = [
    { key: 'student', label: 'Aluno', render: (v) => (v as Record<string, unknown>)?.name || '-' },
    { key: 'class', label: 'Turma', render: (v) => (v as Record<string, unknown>)?.name || '-' },
    {
      key: 'class', label: 'Disciplina', render: (v) => (v as Record<string, unknown>)?.discipline?.name || '-',
    },
    {
      key: 'class', label: 'Professor', render: (v) => (v as Record<string, unknown>)?.teacher?.name || '-',
    },
    {
      key: 'status', label: 'Status', render: (v) => (
        <Badge variant={v === 'active' ? 'default' : 'secondary'} className={v === 'active' ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-100' : ''}>
          {v === 'active' ? 'Ativa' : v === 'cancelled' ? 'Cancelada' : v === 'completed' ? 'Concluída' : v}
        </Badge>
      ),
    },
    {
      key: 'grade', label: 'Nota', render: (v) => v ? Number(v).toFixed(1) : '-',
    },
    {
      key: 'enrolledAt', label: 'Data', render: (v) => format(parseISO(v as string), 'dd/MM/yyyy'),
    },
    {
      key: 'id', label: 'Ações', render: (v) => (
        <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500" onClick={(e) => { e.stopPropagation(); setDeleteId(v as string) }}><Trash2 className="h-4 w-4" /></Button>
      ),
    },
  ]

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Matrículas</h2>
          <p className="text-sm text-slate-500">Gerencie as matrículas dos alunos</p>
        </div>
        <Button onClick={() => setCreateOpen(true)} className="bg-emerald-600 hover:bg-emerald-700 text-white">
          <Plus className="h-4 w-4 mr-2" /> Nova Matrícula
        </Button>
      </div>

      <DataTable columns={columns} data={data?.data || []} isLoading={isLoading} searchPlaceholder="Buscar matrículas..." />

      <FormDialog open={createOpen} onOpenChange={setCreateOpen} title="Nova Matrícula" description="Matricule um aluno em uma turma" fields={fields} onSubmit={(values) => createMutation.mutate(values)} isLoading={createMutation.isPending} submitLabel="Matricular" />

      <ConfirmDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)} title="Remover Matrícula" description="Tem certeza que deseja remover esta matrícula?" confirmLabel="Remover" onConfirm={() => deleteId && deleteMutation.mutate(deleteId)} />
    </div>
  )
}
