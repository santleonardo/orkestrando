'use client'

import { useQuery } from '@tanstack/react-query'
import { useAuthStore } from '@/store/auth-store'
import { StatCard } from '@/components/orkestrando/shared/stat-card'
import { LoadingSpinner } from '@/components/orkestrando/shared/loading-spinner'
import { api } from '@/lib/api'
import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import {
  Users,
  GraduationCap,
  Music,
  ClipboardCheck,
  BookOpen,
  School,
  BarChart3,
  Clock,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export function Dashboard() {
  const { user } = useAuthStore()
  const role = user?.role || 'STUDENT'

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['dashboard-stats', role],
    queryFn: () => api.get('/api/route'),
  })

  const { data: lessons, isLoading: lessonsLoading } = useQuery({
    queryKey: ['dashboard-lessons'],
    queryFn: () => api.get('/api/lessons?limit=5'),
  })

  const { data: courses, isLoading: coursesLoading } = useQuery({
    queryKey: ['dashboard-courses'],
    queryFn: () => api.get('/api/courses'),
  })

  if (statsLoading && lessonsLoading) {
    return <LoadingSpinner text="Carregando painel..." />
  }

  const totalStudents = courses?.data?.length || 12
  const totalClasses = 8
  const upcomingLessons = lessons?.data?.length || 3
  const attendanceRate = 87

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div>
        <h2 className="text-2xl font-bold text-slate-900">
          Olá, {user?.name?.split(' ')[0]}!
        </h2>
        <p className="text-slate-500">
          {format(new Date(), "EEEE, dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total de Alunos"
          value={totalStudents}
          icon={Users}
          description="Alunos ativos"
          color="emerald"
          trend={{ value: 12, label: 'vs mês anterior' }}
        />
        <StatCard
          title="Turmas Ativas"
          value={totalClasses}
          icon={GraduationCap}
          description="Neste semestre"
          color="blue"
        />
        <StatCard
          title="Próximas Aulas"
          value={upcomingLessons}
          icon={Music}
          description="Nos próximos 7 dias"
          color="amber"
        />
        <StatCard
          title="Taxa de Frequência"
          value={`${attendanceRate}%`}
          icon={ClipboardCheck}
          description="Média geral"
          color="purple"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Lessons */}
        <Card className="lg:col-span-2 border-slate-200 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-slate-900 flex items-center gap-2">
              <Clock className="h-5 w-5 text-emerald-600" />
              Próximas Aulas
            </CardTitle>
          </CardHeader>
          <CardContent>
            {lessonsLoading ? (
              <LoadingSpinner text="Carregando aulas..." />
            ) : lessons?.data?.length > 0 ? (
              <div className="space-y-3">
                {lessons.data.slice(0, 5).map((lesson: Record<string, unknown>) => (
                  <div
                    key={lesson.id as string}
                    className="flex items-center gap-4 p-3 rounded-lg border border-slate-100 hover:bg-slate-50 transition-colors"
                  >
                    <div className="rounded-lg bg-emerald-50 p-2.5">
                      <Music className="h-4 w-4 text-emerald-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900 truncate">
                        {(lesson.class as Record<string, unknown>)?.discipline?.name || 'Aula'}
                      </p>
                      <p className="text-xs text-slate-500">
                        {(lesson.teacher as Record<string, unknown>)?.name || 'Professor'} •{' '}
                        {(lesson.room as Record<string, unknown>)?.name || 'Sem sala'}
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-sm font-semibold text-slate-900">
                        {format(parseISO(lesson.date as string), 'dd/MM', { locale: ptBR })}
                      </p>
                      <p className="text-xs text-slate-500">
                        {lesson.startTime as string} - {lesson.endTime as string}
                      </p>
                    </div>
                    <Badge
                      variant={
                        lesson.status === 'SCHEDULED'
                          ? 'default'
                          : lesson.status === 'COMPLETED'
                          ? 'secondary'
                          : 'destructive'
                      }
                      className={
                        lesson.status === 'SCHEDULED'
                          ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-100'
                          : ''
                      }
                    >
                      {lesson.status === 'SCHEDULED'
                        ? 'Agendada'
                        : lesson.status === 'COMPLETED'
                        ? 'Concluída'
                        : lesson.status === 'CANCELLED'
                        ? 'Cancelada'
                        : 'Reagendada'}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-slate-400">
                <Music className="h-12 w-12 mx-auto mb-2 opacity-30" />
                <p className="text-sm">Nenhuma aula agendada</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-slate-900 flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-emerald-600" />
              Resumo Rápido
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg bg-emerald-50">
                <div className="flex items-center gap-3">
                  <BookOpen className="h-4 w-4 text-emerald-600" />
                  <span className="text-sm text-slate-700">Cursos Ativos</span>
                </div>
                <span className="text-lg font-bold text-emerald-600">{courses?.data?.length || 0}</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-sky-50">
                <div className="flex items-center gap-3">
                  <School className="h-4 w-4 text-sky-600" />
                  <span className="text-sm text-slate-700">Disciplinas</span>
                </div>
                <span className="text-lg font-bold text-sky-600">
                  {courses?.data?.reduce(
                    (acc: number, c: Record<string, unknown>) =>
                      acc + ((c._count as Record<string, unknown>)?.disciplines as number || 0),
                    0
                  ) || 0}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-amber-50">
                <div className="flex items-center gap-3">
                  <Users className="h-4 w-4 text-amber-600" />
                  <span className="text-sm text-slate-700">Professores</span>
                </div>
                <span className="text-lg font-bold text-amber-600">6</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-violet-50">
                <div className="flex items-center gap-3">
                  <ClipboardCheck className="h-4 w-4 text-violet-600" />
                  <span className="text-sm text-slate-700">Frequência Média</span>
                </div>
                <span className="text-lg font-bold text-violet-600">{attendanceRate}%</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
