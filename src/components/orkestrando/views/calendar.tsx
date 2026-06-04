'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { FormDialog, type FormField } from '@/components/orkestrando/shared/form-dialog'
import { ConfirmDialog } from '@/components/orkestrando/shared/confirm-dialog'
import { Plus, ChevronLeft, ChevronRight, Trash2, Pencil, Calendar as CalendarIcon } from 'lucide-react'
import { toast } from 'sonner'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, getDay } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export function CalendarView() {
  const queryClient = useQueryClient()
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [createOpen, setCreateOpen] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [editItem, setEditItem] = useState<Record<string, unknown> | null>(null)

  const { data: semesters } = useQuery({ queryKey: ['cal-semesters'], queryFn: () => api.get('/api/semesters') })

  const monthStr = format(currentMonth, 'yyyy-MM')
  const { data, isLoading } = useQuery({
    queryKey: ['calendar', monthStr],
    queryFn: () => api.get(`/api/calendar?month=${monthStr}`),
  })

  const createMutation = useMutation({
    mutationFn: (values: Record<string, unknown>) => api.post('/api/calendar', values),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['calendar'] }); toast.success('Evento criado!'); setCreateOpen(false) },
    onError: () => toast.error('Erro ao criar evento'),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, ...values }: Record<string, unknown>) => api.put(`/api/calendar/${id}`, values),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['calendar'] }); toast.success('Evento atualizado!'); setEditItem(null) },
    onError: () => toast.error('Erro ao atualizar evento'),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/api/calendar/${id}`),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['calendar'] }); toast.success('Evento excluído!'); setDeleteId(null) },
    onError: () => toast.error('Erro ao excluir evento'),
  })

  const events = data?.data || []
  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(currentMonth)
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd })

  const dayOfWeek = getDay(monthStart)
  const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

  const getEventsForDay = (day: Date) => events.filter((e: Record<string, unknown>) => isSameDay(parseISO(e.date as string), day))

  const typeColors: Record<string, string> = {
    holiday: 'bg-red-100 text-red-700 border-red-200',
    exam: 'bg-amber-100 text-amber-700 border-amber-200',
    event: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    deadline: 'bg-violet-100 text-violet-700 border-violet-200',
    meeting: 'bg-sky-100 text-sky-700 border-sky-200',
  }

  const typeLabels: Record<string, string> = {
    holiday: 'Feriado',
    exam: 'Prova',
    event: 'Evento',
    deadline: 'Prazo',
    meeting: 'Reunião',
  }

  const fields: FormField[] = [
    { type: 'text', name: 'title', label: 'Título', placeholder: 'Nome do evento', required: true },
    { type: 'date', name: 'date', label: 'Data', required: true, defaultValue: selectedDate ? format(selectedDate, 'yyyy-MM-dd') : undefined },
    {
      type: 'select', name: 'type', label: 'Tipo', required: true,
      options: [
        { label: 'Feriado', value: 'holiday' },
        { label: 'Prova', value: 'exam' },
        { label: 'Evento', value: 'event' },
        { label: 'Prazo', value: 'deadline' },
        { label: 'Reunião', value: 'meeting' },
      ],
    },
    { type: 'textarea', name: 'description', label: 'Descrição' },
    { type: 'select', name: 'semesterId', label: 'Semestre', options: (semesters?.data || []).map((s: Record<string, unknown>) => ({ label: s.name as string, value: s.id as string })) },
  ]

  const selectedDayEvents = selectedDate ? getEventsForDay(selectedDate) : []

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Calendário Acadêmico</h2>
          <p className="text-sm text-slate-500">Gerencie eventos e datas importantes</p>
        </div>
        <Button onClick={() => setCreateOpen(true)} className="bg-emerald-600 hover:bg-emerald-700 text-white">
          <Plus className="h-4 w-4 mr-2" /> Novo Evento
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar Grid */}
        <Card className="lg:col-span-2 border-slate-200 shadow-sm">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <CardTitle className="text-slate-900">
                {format(currentMonth, 'MMMM yyyy', { locale: ptBR })}
              </CardTitle>
              <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-1">
              {weekDays.map((d) => (
                <div key={d} className="text-center text-xs font-semibold text-slate-500 py-2">{d}</div>
              ))}
              {Array.from({ length: dayOfWeek }).map((_, i) => (
                <div key={`empty-${i}`} className="h-20" />
              ))}
              {days.map((day) => {
                const dayEvents = getEventsForDay(day)
                const isToday = isSameDay(day, new Date())
                const isSelected = selectedDate && isSameDay(day, selectedDate)
                return (
                  <div
                    key={day.toISOString()}
                    onClick={() => setSelectedDate(day)}
                    className={`h-20 p-1 border cursor-pointer transition-colors text-xs ${
                      isToday ? 'border-emerald-500' : isSelected ? 'border-emerald-300 bg-emerald-50' : 'border-slate-100 hover:bg-slate-50'
                    }`}
                  >
                    <span className={`font-medium ${isToday ? 'text-emerald-600' : 'text-slate-700'}`}>{format(day, 'd')}</span>
                    <div className="mt-1 space-y-0.5">
                      {dayEvents.slice(0, 2).map((e: Record<string, unknown>) => (
                        <div key={e.id as string} className={`text-[10px] px-1 py-0.5 rounded truncate ${typeColors[e.type as string] || 'bg-slate-100'}`}>
                          {e.title as string}
                        </div>
                      ))}
                      {dayEvents.length > 2 && <div className="text-[10px] text-slate-400">+{dayEvents.length - 2}</div>}
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Selected Day Events */}
        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-slate-900 text-base">
              {selectedDate ? format(selectedDate, 'dd/MM/yyyy', { locale: ptBR }) : 'Selecione uma data'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedDayEvents.length > 0 ? (
              <div className="space-y-2">
                {selectedDayEvents.map((e: Record<string, unknown>) => (
                  <div key={e.id as string} className={`p-3 rounded-lg border ${typeColors[e.type as string] || 'border-slate-200'}`}>
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm font-medium">{e.title as string}</p>
                        <p className="text-xs mt-1 opacity-80">{e.description as string || typeLabels[e.type as string] || (e.type as string)}</p>
                      </div>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setEditItem(e)}><Pencil className="h-3 w-3" /></Button>
                        <Button variant="ghost" size="icon" className="h-6 w-6 text-red-500" onClick={() => setDeleteId(e.id as string)}><Trash2 className="h-3 w-3" /></Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-slate-400">
                <CalendarIcon className="h-10 w-10 mx-auto mb-2 opacity-30" />
                <p className="text-sm">
                  {selectedDate ? 'Nenhum evento nesta data' : 'Clique em uma data'}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <FormDialog open={createOpen} onOpenChange={setCreateOpen} title="Novo Evento" description="Adicione um evento ao calendário" fields={fields} onSubmit={(values) => createMutation.mutate(values)} isLoading={createMutation.isPending} submitLabel="Criar Evento" />

      {editItem && (
        <FormDialog open={!!editItem} onOpenChange={() => setEditItem(null)} title="Editar Evento" fields={fields} defaultValues={editItem as Record<string, string>} onSubmit={(values) => updateMutation.mutate({ id: editItem.id, ...values })} isLoading={updateMutation.isPending} submitLabel="Salvar" />
      )}

      <ConfirmDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)} title="Excluir Evento" description="Tem certeza que deseja excluir este evento?" confirmLabel="Excluir" onConfirm={() => deleteId && deleteMutation.mutate(deleteId)} />
    </div>
  )
}
