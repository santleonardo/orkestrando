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
import { Plus, Trash2, Check, X, Clock } from 'lucide-react'
import { toast } from 'sonner'

const dayLabels = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado']
const dayShort = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

const statusLabels: Record<string, string> = { PENDING: 'Pendente', APPROVED: 'Aprovado', REJECTED: 'Rejeitado' }
const statusColors: Record<string, string> = { PENDING: 'bg-amber-100 text-amber-700', APPROVED: 'bg-emerald-100 text-emerald-700', REJECTED: 'bg-red-100 text-red-700' }

export function AvailabilityView() {
  const queryClient = useQueryClient()
  const { user } = useAuthStore()
  const [createOpen, setCreateOpen] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [approveItem, setApproveItem] = useState<{ id: string; action: string } | null>(null)
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table')

  const { data: semesters } = useQuery({ queryKey: ['avail-semesters'], queryFn: () => api.get('/api/semesters') })

  const { data, isLoading } = useQuery({
    queryKey: ['availability'],
    queryFn: () => api.get('/api/availability'),
  })

  const createMutation = useMutation({
    mutationFn: (values: Record<string, unknown>) => api.post('/api/availability', { ...values, teacherId: values.teacherId || user?.id }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['availability'] }); toast.success('Disponibilidade criada!'); setCreateOpen(false) },
    onError: () => toast.error('Erro ao criar disponibilidade'),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/api/availability/${id}`),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['availability'] }); toast.success('Disponibilidade removida!'); setDeleteId(null) },
    onError: () => toast.error('Erro ao remover'),
  })

  const approveMutation = useMutation({
    mutationFn: ({ id, action }: { id: string; action: string }) => api.post(`/api/availability/${id}/approve`, { action }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['availability'] }); toast.success('Status atualizado!'); setApproveItem(null) },
    onError: () => toast.error('Erro ao atualizar status'),
  })

  const fields: FormField[] = [
    { type: 'text', name: 'teacherId', label: 'ID do Professor', placeholder: user?.id || 'ID do professor' },
    { type: 'select', name: 'semesterId', label: 'Semestre', required: true, options: (semesters?.data || []).map((s: Record<string, unknown>) => ({ label: s.name as string, value: s.id as string })) },
    { type: 'select', name: 'dayOfWeek', label: 'Dia da Semana', required: true, options: dayLabels.map((l, i) => ({ label: l, value: String(i) })) },
    { type: 'time', name: 'startTime', label: 'Hora Início', required: true },
    { type: 'time', name: 'endTime', label: 'Hora Fim', required: true },
    {
      type: 'select', name: 'type', label: 'Tipo', required: true,
      options: [
        { label: 'Disponível', value: 'AVAILABLE' },
        { label: 'Bloqueado', value: 'BLOCKED' },
        { label: 'Férias', value: 'VACATION' },
      ],
    },
    { type: 'textarea', name: 'reason', label: 'Motivo' },
    { type: 'date', name: 'effectiveFrom', label: 'Vigente a partir de', required: true },
  ]

  // Build grid data
  const availabilities = data?.data || []
  const gridData: Record<number, Record<string, typeof availabilities>> = {}
  availabilities.forEach((a: Record<string, unknown>) => {
    const day = a.dayOfWeek as number
    if (!gridData[day]) gridData[day] = {}
    const key = `${a.startTime}-${a.endTime}`
    if (!gridData[day][key]) gridData[day][key] = []
    gridData[day][key].push(a)
  })

  const columns: Column[] = [
    { key: 'teacher', label: 'Professor', render: (v) => (v as Record<string, unknown>)?.name || '-' },
    { key: 'semester', label: 'Semestre', render: (v) => (v as Record<string, unknown>)?.name || '-' },
    { key: 'dayOfWeek', label: 'Dia', render: (v) => dayLabels[v as number] || '-' },
    { key: 'startTime', label: 'Início' },
    { key: 'endTime', label: 'Fim' },
    { key: 'type', label: 'Tipo', render: (v) => <Badge variant="outline">{v === 'AVAILABLE' ? 'Disponível' : v === 'BLOCKED' ? 'Bloqueado' : 'Férias'}</Badge> },
    {
      key: 'status', label: 'Status', render: (v, row) => (
        <div className="flex items-center gap-1">
          <Badge className={statusColors[v as string] || ''}>{statusLabels[v as string] || v}</Badge>
          {v === 'PENDING' && (
            <>
              <Button variant="ghost" size="icon" className="h-6 w-6 text-emerald-600" onClick={(e) => { e.stopPropagation(); setApproveItem({ id: row.id as string, action: 'approve' }) }}><Check className="h-3 w-3" /></Button>
              <Button variant="ghost" size="icon" className="h-6 w-6 text-red-500" onClick={(e) => { e.stopPropagation(); setApproveItem({ id: row.id as string, action: 'reject' }) }}><X className="h-3 w-3" /></Button>
            </>
          )}
        </div>
      ),
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
          <h2 className="text-xl font-bold text-slate-900">Disponibilidade</h2>
          <p className="text-sm text-slate-500">Gerencie a disponibilidade dos professores</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setViewMode(viewMode === 'table' ? 'grid' : 'table')}>
            <Clock className="h-4 w-4 mr-1" /> {viewMode === 'table' ? 'Grade' : 'Tabela'}
          </Button>
          <Button onClick={() => setCreateOpen(true)} className="bg-emerald-600 hover:bg-emerald-700 text-white">
            <Plus className="h-4 w-4 mr-2" /> Adicionar
          </Button>
        </div>
      </div>

      {viewMode === 'table' ? (
        <DataTable columns={columns} data={availabilities} isLoading={isLoading} searchPlaceholder="Buscar disponibilidade..." />
      ) : (
        <Card className="border-slate-200 shadow-sm">
          <CardContent className="p-4">
            <div className="overflow-x-auto">
              <div className="min-w-[600px]">
                <div className="grid grid-cols-8 gap-1">
                  <div className="text-xs font-semibold text-slate-500 p-2">Horário</div>
                  {dayShort.map((d) => (
                    <div key={d} className="text-xs font-semibold text-slate-500 p-2 text-center">{d}</div>
                  ))}
                  {['08:00-10:00', '10:00-12:00', '14:00-16:00', '16:00-18:00'].map((slot) => (
                    <>
                      <div key={slot} className="text-xs text-slate-600 p-2 font-medium">{slot}</div>
                      {[0, 1, 2, 3, 4, 5, 6].map((day) => {
                        const items = gridData[day]?.[slot] || []
                        return (
                          <div key={`${day}-${slot}`} className="p-1">
                            {items.map((a: Record<string, unknown>) => (
                              <div key={a.id as string} className={`text-[10px] px-1 py-0.5 rounded mb-0.5 ${a.type === 'AVAILABLE' ? 'bg-emerald-50 text-emerald-700' : a.type === 'BLOCKED' ? 'bg-red-50 text-red-700' : 'bg-amber-50 text-amber-700'}`}>
                                {(a.teacher as Record<string, unknown>)?.name?.split(' ')[0]}
                              </div>
                            ))}
                          </div>
                        )
                      })}
                    </>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <FormDialog open={createOpen} onOpenChange={setCreateOpen} title="Nova Disponibilidade" description="Adicione um horário de disponibilidade" fields={fields} onSubmit={(values) => createMutation.mutate(values)} isLoading={createMutation.isPending} submitLabel="Adicionar" />

      <ConfirmDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)} title="Remover Disponibilidade" description="Tem certeza que deseja remover?" confirmLabel="Remover" onConfirm={() => deleteId && deleteMutation.mutate(deleteId)} />

      {approveItem && (
        <ConfirmDialog
          open={!!approveItem}
          onOpenChange={() => setApproveItem(null)}
          title={approveItem.action === 'approve' ? 'Aprovar Disponibilidade' : 'Rejeitar Disponibilidade'}
          description={approveItem.action === 'approve' ? 'Aprovar esta disponibilidade?' : 'Rejeitar esta disponibilidade?'}
          confirmLabel={approveItem.action === 'approve' ? 'Aprovar' : 'Rejeitar'}
          destructive={approveItem.action === 'reject'}
          onConfirm={() => approveMutation.mutate({ id: approveItem.id, action: approveItem.action })}
        />
      )}
    </div>
  )
}
