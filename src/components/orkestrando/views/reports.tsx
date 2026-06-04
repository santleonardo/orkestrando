'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { DataTable, type Column } from '@/components/orkestrando/shared/data-table'
import { BarChart3, Download, FileText, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { format, parseISO } from 'date-fns'

const reportTypes = [
  { value: 'hours', label: 'Horas Docentes' },
  { value: 'attendance', label: 'Frequência' },
  { value: 'dropout', label: 'Evasão' },
  { value: 'room_usage', label: 'Uso de Salas' },
  { value: 'teacher_usage', label: 'Professores' },
  { value: 'academic', label: 'Acadêmico Geral' },
]

export function ReportsView() {
  const queryClient = useQueryClient()
  const [selectedType, setSelectedType] = useState('')
  const [classId, setClassId] = useState('')
  const [teacherId, setTeacherId] = useState('')

  const { data: existingReports, isLoading: reportsLoading } = useQuery({
    queryKey: ['reports'],
    queryFn: () => api.get('/api/reports'),
  })

  const { data: classes } = useQuery({ queryKey: ['report-classes'], queryFn: () => api.get('/api/classes') })

  const generateMutation = useMutation({
    mutationFn: (type: string) => api.post('/api/reports', {
      type,
      parameters: { classId: classId || undefined, teacherId: teacherId || undefined },
    }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['reports'] }); toast.success('Relatório gerado com sucesso!') },
    onError: () => toast.error('Erro ao gerar relatório'),
  })

  const reports = (existingReports?.data || []) as Array<Record<string, unknown>>

  const columns: Column[] = [
    { key: 'title', label: 'Título', render: (v) => <div className="flex items-center gap-2"><FileText className="h-4 w-4 text-emerald-600" /><span className="font-medium">{v as string}</span></div> },
    { key: 'type', label: 'Tipo', render: (v) => <Badge variant="outline">{reportTypes.find(t => t.value === v)?.label || v}</Badge> },
    { key: 'generator', label: 'Gerado por', render: (v) => (v as Record<string, unknown>)?.name || '-' },
    {
      key: 'createdAt', label: 'Data', render: (v) => format(parseISO(v as string), 'dd/MM/yyyy HH:mm'),
    },
    {
      key: 'id', label: 'Dados', render: (v, row) => {
        let reportData: Record<string, unknown> | undefined
        try { reportData = JSON.parse(row.data as string) } catch { reportData = undefined }
        return (
          <details className="max-w-xs">
            <summary className="text-xs text-emerald-600 cursor-pointer hover:underline">Ver dados</summary>
            <pre className="text-xs mt-1 p-2 bg-slate-50 rounded overflow-auto max-h-40 text-slate-700">{JSON.stringify(reportData, null, 2)}</pre>
          </details>
        )
      },
    },
  ]

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold text-slate-900">Relatórios</h2>
        <p className="text-sm text-slate-500">Gere relatórios acadêmicos</p>
      </div>

      {/* Generate Report */}
      <Card className="border-slate-200 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-slate-900 flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-emerald-600" />
            Gerar Novo Relatório
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row items-end gap-3">
            <div className="flex-1 space-y-2">
              <label className="text-sm font-medium text-slate-700">Tipo de Relatório</label>
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  {reportTypes.map((t) => (
                    <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {(selectedType === 'attendance' || selectedType === 'hours') && (
              <div className="w-full sm:w-48 space-y-2">
                <label className="text-sm font-medium text-slate-700">Turma (opcional)</label>
                <Select value={classId} onValueChange={setClassId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todas" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Todas</SelectItem>
                    {(classes?.data || []).map((c: Record<string, unknown>) => (
                      <SelectItem key={c.id as string} value={c.id as string}>{c.name as string}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            <Button
              onClick={() => { if (selectedType) generateMutation.mutate(selectedType) }}
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
              disabled={!selectedType || generateMutation.isPending}
            >
              {generateMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              <BarChart3 className="h-4 w-4 mr-2" /> Gerar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Reports History */}
      <Card className="border-slate-200 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-slate-900">Relatórios Gerados</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable columns={columns} data={reports} isLoading={reportsLoading} searchPlaceholder="Buscar relatórios..." />
        </CardContent>
      </Card>
    </div>
  )
}
