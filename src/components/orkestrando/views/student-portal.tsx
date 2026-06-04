'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useAuthStore } from '@/store/auth-store'
import { api } from '@/lib/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { StatCard } from '@/components/orkestrando/shared/stat-card'
import { LoadingSpinner } from '@/components/orkestrando/shared/loading-spinner'
import { EmptyState } from '@/components/orkestrando/shared/empty-state'
import { Button } from '@/components/ui/button'
import { School, GraduationCap, ClipboardCheck, FileText, Music, BookOpen } from 'lucide-react'
import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export function StudentPortalView() {
  const { user } = useAuthStore()
  const userId = user?.id || ''

  const { data: enrollments, isLoading: enrollLoading } = useQuery({
    queryKey: ['student-enrollments', userId],
    queryFn: () => api.get(`/api/enrollments?studentId=${userId}`),
  })

  const { data: lessons, isLoading: lessonsLoading } = useQuery({
    queryKey: ['student-lessons'],
    queryFn: () => api.get('/api/lessons?limit=20'),
  })

  const { data: attendance, isLoading: attendanceLoading } = useQuery({
    queryKey: ['student-attendance', userId],
    queryFn: () => api.get(`/api/attendance?studentId=${userId}`),
  })

  const { data: materials, isLoading: materialsLoading } = useQuery({
    queryKey: ['student-materials'],
    queryFn: () => api.get('/api/materials'),
  })

  if (enrollLoading && lessonsLoading) {
    return <LoadingSpinner text="Carregando portal..." />
  }

  const enrollList = enrollments?.data || []
  const lessonsList = lessons?.data || []
  const attendanceList = attendance?.data || []
  const materialsList = materials?.data || []

  // Calculate stats
  const totalClasses = enrollList.length
  const totalAttendance = attendanceList.length
  const presentCount = attendanceList.filter((a: Record<string, unknown>) => a.status === 'PRESENT' || a.status === 'LATE').length
  const attendanceRate = totalAttendance > 0 ? Math.round((presentCount / totalAttendance) * 100) : 0

  // Group schedule by day
  const schedule: Record<number, Array<Record<string, unknown>>> = {}
  lessonsList.forEach((l: Record<string, unknown>) => {
    const day = new Date(l.date as string).getDay()
    if (!schedule[day]) schedule[day] = []
    schedule[day].push(l)
  })

  const dayNames = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado']

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold text-slate-900">Portal do Aluno</h2>
        <p className="text-sm text-slate-500">Acompanhe sua vida acadêmica</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Turmas Matriculadas" value={totalClasses} icon={GraduationCap} color="emerald" />
        <StatCard title="Frequência" value={`${attendanceRate}%`} icon={ClipboardCheck} color="blue" description={`${presentCount}/${totalAttendance} presenças`} />
        <StatCard title="Aulas Este Mês" value={lessonsList.filter((l: Record<string, unknown>) => {
          const d = new Date(l.date as string)
          const now = new Date()
          return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
        }).length} icon={Music} color="amber" />
        <StatCard title="Materiais" value={materialsList.length} icon={FileText} color="purple" />
      </div>

      {/* Tabs */}
      <Tabs defaultValue="grades">
        <TabsList>
          <TabsTrigger value="grades">Notas</TabsTrigger>
          <TabsTrigger value="schedule">Agenda</TabsTrigger>
          <TabsTrigger value="attendance">Frequência</TabsTrigger>
          <TabsTrigger value="materials">Materiais</TabsTrigger>
        </TabsList>

        {/* Grades Tab */}
        <TabsContent value="grades">
          <Card className="border-slate-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-slate-900">Boletim</CardTitle>
            </CardHeader>
            <CardContent>
              {enrollList.length === 0 ? (
                <EmptyState icon={BookOpen} title="Nenhuma turma" description="Você não está matriculado em nenhuma turma." />
              ) : (
                <div className="space-y-3">
                  {enrollList.map((e: Record<string, unknown>) => (
                    <div key={e.id as string} className="flex items-center justify-between p-3 rounded-lg border border-slate-100 hover:bg-slate-50 transition-colors">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <div className="rounded-lg bg-emerald-50 p-1.5">
                            <BookOpen className="h-3.5 w-3.5 text-emerald-600" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-slate-900">
                              {(e.class as Record<string, unknown>)?.discipline?.name || '-'}
                            </p>
                            <p className="text-xs text-slate-500">
                              {(e.class as Record<string, unknown>)?.code || '-'} • {(e.class as Record<string, unknown>)?.teacher?.name || '-'}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0 ml-4">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl font-bold text-slate-900">
                            {e.grade ? Number(e.grade).toFixed(1) : '-'}
                          </span>
                          {e.grade && (
                            <Badge className={Number(e.grade) >= 7 ? 'bg-emerald-100 text-emerald-700' : Number(e.grade) >= 5 ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'}>
                              {Number(e.grade) >= 7 ? 'Aprovado' : Number(e.grade) >= 5 ? 'Recuperação' : 'Reprovado'}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Schedule Tab */}
        <TabsContent value="schedule">
          <Card className="border-slate-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-slate-900">Grade Semanal</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((day) => (
                  <div key={day}>
                    <h3 className="text-sm font-semibold text-slate-700 mb-2">{dayNames[day]}</h3>
                    {schedule[day]?.length > 0 ? (
                      <div className="space-y-2">
                        {schedule[day].map((l: Record<string, unknown>) => (
                          <div key={l.id as string} className="flex items-center gap-3 p-2 rounded-lg bg-emerald-50/50 border border-emerald-100">
                            <div className="rounded bg-emerald-100 p-1.5">
                              <Music className="h-3.5 w-3.5 text-emerald-600" />
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-medium text-slate-900">{(l.class as Record<string, unknown>)?.discipline?.name}</p>
                              <p className="text-xs text-slate-500">
                                {l.startTime} - {l.endTime} • {(l.room as Record<string, unknown>)?.name || 'Sem sala'}
                              </p>
                            </div>
                            <Badge variant="outline" className="text-xs">{format(parseISO(l.date as string), 'dd/MM')}</Badge>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-slate-400 pl-4">Sem aulas</p>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Attendance Tab */}
        <TabsContent value="attendance">
          <Card className="border-slate-200 shadow-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-slate-900">Frequência</CardTitle>
                <Badge className={attendanceRate >= 75 ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}>
                  {attendanceRate}%
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              {attendanceRate < 75 && (
                <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-100">
                  <p className="text-sm text-red-700 font-medium">Atenção: Sua frequência está abaixo de 75%</p>
                </div>
              )}
              <Progress value={attendanceRate} className="h-2 mb-4" />
              {attendanceList.length === 0 ? (
                <EmptyState icon={ClipboardCheck} title="Sem registros" description="Nenhum registro de frequência encontrado." />
              ) : (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {attendanceList.slice(0, 30).map((a: Record<string, unknown>) => {
                    const statusColors: Record<string, string> = {
                      PRESENT: 'bg-emerald-100 text-emerald-700',
                      ABSENT: 'bg-red-100 text-red-700',
                      LATE: 'bg-amber-100 text-amber-700',
                      JUSTIFIED: 'bg-sky-100 text-sky-700',
                    }
                    const statusLabels: Record<string, string> = {
                      PRESENT: 'Presente', ABSENT: 'Ausente', LATE: 'Atrasado', JUSTIFIED: 'Justificado',
                    }
                    return (
                      <div key={a.id as string} className="flex items-center gap-3 p-2 rounded-lg border border-slate-100">
                        <Badge className={statusColors[a.status as string] || ''}>{statusLabels[a.status as string] || a.status}</Badge>
                        <div className="flex-1">
                          <p className="text-sm text-slate-700">{(a.lesson as Record<string, unknown>)?.class?.name || '-'}</p>
                        </div>
                        <span className="text-xs text-slate-400">{format(parseISO(a.recordedAt as string), 'dd/MM/yyyy')}</span>
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Materials Tab */}
        <TabsContent value="materials">
          <Card className="border-slate-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-slate-900">Materiais Disponíveis</CardTitle>
            </CardHeader>
            <CardContent>
              {materialsList.length === 0 ? (
                <EmptyState icon={FileText} title="Nenhum material" description="Nenhum material foi publicado ainda." />
              ) : (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {materialsList.map((m: Record<string, unknown>) => (
                    <div key={m.id as string} className="flex items-center gap-3 p-3 rounded-lg border border-slate-100 hover:bg-slate-50 transition-colors">
                      <div className="rounded-lg bg-violet-50 p-2">
                        <FileText className="h-4 w-4 text-violet-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-900 truncate">{m.title as string}</p>
                        <p className="text-xs text-slate-500">
                          {(m.class as Record<string, unknown>)?.name || '-'} • {(m.uploader as Record<string, unknown>)?.name || '-'}
                        </p>
                      </div>
                      <Button variant="outline" size="sm" onClick={() => window.open(m.fileUrl as string, '_blank')}>
                        Baixar
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
