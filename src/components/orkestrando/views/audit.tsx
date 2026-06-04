'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { DataTable, type Column } from '@/components/orkestrando/shared/data-table'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Shield, Search, Eye, X } from 'lucide-react'
import { format, parseISO } from 'date-fns'

export function AuditView() {
  const [actionFilter, setActionFilter] = useState('')
  const [entityFilter, setEntityFilter] = useState('')
  const [searchQuery, setSearchQuery] = useState('')

  const params = new URLSearchParams()
  if (actionFilter) params.set('action', actionFilter)
  if (entityFilter) params.set('entity', entityFilter)

  const { data, isLoading } = useQuery({
    queryKey: ['audit', actionFilter, entityFilter],
    queryFn: () => api.get(`/api/audit?${params.toString()}`),
  })

  const logs = (data?.data || []) as Array<Record<string, unknown>>
  const meta = data?.meta as Record<string, unknown> | undefined

  const actionColors: Record<string, string> = {
    CREATE: 'bg-emerald-100 text-emerald-700',
    UPDATE: 'bg-amber-100 text-amber-700',
    DELETE: 'bg-red-100 text-red-700',
    LOGIN: 'bg-sky-100 text-sky-700',
    GENERATE: 'bg-violet-100 text-violet-700',
    APPROVE: 'bg-emerald-100 text-emerald-700',
    REJECT: 'bg-red-100 text-red-700',
  }

  const columns: Column[] = [
    {
      key: 'createdAt', label: 'Data/Hora', render: (v) => (
        <div>
          <p className="text-sm">{format(parseISO(v as string), 'dd/MM/yyyy')}</p>
          <p className="text-xs text-slate-500">{format(parseISO(v as string), 'HH:mm:ss')}</p>
        </div>
      ),
    },
    {
      key: 'user', label: 'Usuário', render: (v) => (
        <div>
          <p className="text-sm font-medium">{(v as Record<string, unknown>)?.name || 'Sistema'}</p>
          <p className="text-xs text-slate-500">{(v as Record<string, unknown>)?.email || ''}</p>
        </div>
      ),
    },
    {
      key: 'action', label: 'Ação', render: (v) => (
        <Badge className={actionColors[v as string] || 'bg-slate-100 text-slate-700'}>{v as string}</Badge>
      ),
    },
    { key: 'entity', label: 'Entidade' },
    { key: 'entityId', label: 'ID', render: (v) => v ? <span className="text-xs font-mono text-slate-500">{String(v).substring(0, 12)}...</span> : '-' },
    {
      key: 'details', label: 'Detalhes', render: (v) => {
        if (!v) return '-'
        try {
          const details = typeof v === 'string' ? JSON.parse(v) : v
          return <span className="text-xs text-slate-600 max-w-xs truncate block">{JSON.stringify(details).substring(0, 80)}...</span>
        } catch {
          return <span className="text-xs text-slate-600">{String(v).substring(0, 80)}</span>
        }
      },
    },
  ]

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold text-slate-900">Auditoria</h2>
        <p className="text-sm text-slate-500">Registro de todas as ações do sistema</p>
      </div>

      {/* Filters */}
      <Card className="border-slate-200 shadow-sm">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Buscar..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9" />
            </div>
            <Select value={actionFilter} onValueChange={setActionFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Ação" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todas</SelectItem>
                <SelectItem value="CREATE">Criar</SelectItem>
                <SelectItem value="UPDATE">Atualizar</SelectItem>
                <SelectItem value="DELETE">Excluir</SelectItem>
                <SelectItem value="LOGIN">Login</SelectItem>
                <SelectItem value="GENERATE">Gerar</SelectItem>
                <SelectItem value="APPROVE">Aprovar</SelectItem>
                <SelectItem value="REJECT">Rejeitar</SelectItem>
              </SelectContent>
            </Select>
            <Select value={entityFilter} onValueChange={setEntityFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Entidade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todas</SelectItem>
                <SelectItem value="User">Usuário</SelectItem>
                <SelectItem value="Course">Curso</SelectItem>
                <SelectItem value="Discipline">Disciplina</SelectItem>
                <SelectItem value="Class">Turma</SelectItem>
                <SelectItem value="Lesson">Aula</SelectItem>
                <SelectItem value="Enrollment">Matrícula</SelectItem>
                <SelectItem value="Attendance">Frequência</SelectItem>
                <SelectItem value="Material">Material</SelectItem>
              </SelectContent>
            </Select>
            {(actionFilter || entityFilter) && (
              <Button variant="outline" size="icon" onClick={() => { setActionFilter(''); setEntityFilter('') }}>
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {meta && (
        <p className="text-sm text-slate-500">
          Exibindo {meta.total} registros
        </p>
      )}

      <DataTable columns={columns} data={logs} isLoading={isLoading} searchPlaceholder="Buscar logs..." pageSize={15} />
    </div>
  )
}
