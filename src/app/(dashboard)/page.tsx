'use client'

import { useAuth } from '@/lib/hooks/use-auth'
import { StatsCard } from '@/components/shared/stats-card'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { getInitials } from '@/lib/utils/format'
import {
  GraduationCap,
  Users,
  DoorOpen,
  Calendar,
  TrendingUp,
  Clock,
  ArrowRight,
  BookOpen,
  AlertCircle,
  CheckCircle2,
  UserPlus,
  Plus,
  CalendarDays,
} from 'lucide-react'
import Link from 'next/link'
import { motion } from 'framer-motion'

// Mock data
const stats = {
  totalStudents: 1247,
  totalTeachers: 89,
  activeClasses: 42,
  todayClasses: 16,
  studentChange: 5.2,
  teacherChange: 2.1,
  classChange: -1.5,
  todayChange: 0,
}

const recentActivities = [
  { id: '1', text: 'Novo aluno matriculado: Maria Santos', time: 'há 15 min', type: 'success' as const },
  { id: '2', text: 'Professor Carlos solicitou férias', time: 'há 1h', type: 'warning' as const },
  { id: '3', text: 'Aula de Matemática remarcada para 14:00', time: 'há 2h', type: 'info' as const },
  { id: '4', text: 'Aluno João Silva trancou matrícula', time: 'há 3h', type: 'error' as const },
  { id: '5', text: 'Material publicado em Física II', time: 'há 5h', type: 'success' as const },
]

const upcomingClasses = [
  { id: '1', subject: 'Matemática Avançada', teacher: 'Prof. Dr. Silva', room: 'Sala 201', time: '08:00 - 09:40', students: 32 },
  { id: '2', subject: 'Física II', teacher: 'Prof. Santos', room: 'Lab 03', time: '09:50 - 11:30', students: 28 },
  { id: '3', subject: 'Programação Web', teacher: 'Prof. Oliveira', room: 'Lab 01', time: '13:00 - 14:40', students: 35 },
  { id: '4', subject: 'Banco de Dados', teacher: 'Prof. Lima', room: 'Sala 105', time: '14:50 - 16:30', students: 30 },
  { id: '5', subject: 'Inteligência Artificial', teacher: 'Prof. Costa', room: 'Lab 02', time: '19:00 - 20:40', students: 25 },
]

const attendanceData = [
  { day: 'Seg', rate: 92 },
  { day: 'Ter', rate: 88 },
  { day: 'Qua', rate: 95 },
  { day: 'Qui', rate: 91 },
  { day: 'Sex', rate: 85 },
]

const quickActions = [
  { label: 'Novo Professor', href: '/teachers', icon: Users },
  { label: 'Nova Turma', href: '/classes', icon: Plus },
  { label: 'Registrar Presença', href: '/attendance', icon: CheckCircle2 },
  { label: 'Ver Agenda', href: '/schedule', icon: CalendarDays },
]

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
}

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
}

export default function DashboardPage() {
  const { profile } = useAuth()
  const firstName = profile?.firstName || 'Coordenador'
  const maxRate = Math.max(...attendanceData.map((d) => d.rate))

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-6"
    >
      {/* Welcome */}
      <motion.div variants={item}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Olá, {firstName}! 👋
            </h1>
            <p className="text-muted-foreground mt-1">
              Aqui está o resumo da sua instituição hoje.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-emerald-600 border-emerald-200 bg-emerald-50 dark:bg-emerald-950/50 dark:border-emerald-800">
              <span className="h-2 w-2 rounded-full bg-emerald-500 mr-1.5 animate-pulse" />
              Semestre Ativo 2025/1
            </Badge>
          </div>
        </div>
      </motion.div>

      {/* Stats */}
      <motion.div variants={item} className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Alunos"
          value={stats.totalStudents}
          change={stats.studentChange}
          changeLabel="vs. mês anterior"
          icon={GraduationCap}
          iconColor="text-blue-600 bg-blue-50 dark:bg-blue-950/50"
        />
        <StatsCard
          title="Total Professores"
          value={stats.totalTeachers}
          change={stats.teacherChange}
          changeLabel="vs. mês anterior"
          icon={Users}
          iconColor="text-purple-600 bg-purple-50 dark:bg-purple-950/50"
        />
        <StatsCard
          title="Turmas Ativas"
          value={stats.activeClasses}
          change={stats.classChange}
          changeLabel="vs. mês anterior"
          icon={DoorOpen}
          iconColor="text-amber-600 bg-amber-50 dark:bg-amber-950/50"
        />
        <StatsCard
          title="Aulas Hoje"
          value={stats.todayClasses}
          icon={Calendar}
          iconColor="text-emerald-600 bg-emerald-50 dark:bg-emerald-950/50"
        />
      </motion.div>

      {/* Main content grid */}
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
        {/* Upcoming Classes */}
        <motion.div variants={item} className="lg:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle className="text-base">Próximas Aulas Hoje</CardTitle>
                <CardDescription>{upcomingClasses.length} aulas programadas</CardDescription>
              </div>
              <Button variant="outline" size="sm" asChild>
                <Link href="/schedule">
                  Ver todas <ArrowRight className="ml-1 h-3.5 w-3.5" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {upcomingClasses.map((cls, i) => (
                  <div
                    key={cls.id}
                    className="flex items-center gap-3 p-3 rounded-lg border bg-muted/30 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary font-bold text-sm shrink-0">
                      {i + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{cls.subject}</p>
                      <p className="text-xs text-muted-foreground">
                        {cls.teacher} • {cls.room} • {cls.students} alunos
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-medium">{cls.time}</p>
                      <Badge variant="secondary" className="text-[10px]">
                        <Clock className="mr-1 h-3 w-3" />
                        Em breve
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Attendance Overview */}
        <motion.div variants={item}>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Presença Semanal</CardTitle>
              <CardDescription>Média por dia da semana</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {attendanceData.map((data) => (
                  <div key={data.day} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground w-8">{data.day}</span>
                      <span className="font-medium">{data.rate}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-muted overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          data.rate >= 90 ? 'bg-emerald-500' : data.rate >= 85 ? 'bg-amber-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${(data.rate / maxRate) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Média geral</span>
                  <span className="text-lg font-bold text-emerald-600">
                    {Math.round(attendanceData.reduce((a, b) => a + b.rate, 0) / attendanceData.length)}%
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Bottom grid */}
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
        {/* Recent Activities */}
        <motion.div variants={item} className="lg:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle className="text-base">Últimas Atividades</CardTitle>
                <CardDescription>Atualizações recentes da plataforma</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivities.map((activity) => (
                  <div key={activity.id} className="flex items-start gap-3">
                    <div className={`mt-0.5 rounded-full p-1.5 shrink-0 ${
                      activity.type === 'success' ? 'bg-emerald-100 dark:bg-emerald-900/50' :
                      activity.type === 'warning' ? 'bg-amber-100 dark:bg-amber-900/50' :
                      activity.type === 'error' ? 'bg-red-100 dark:bg-red-900/50' :
                      'bg-blue-100 dark:bg-blue-900/50'
                    }`}>
                      {activity.type === 'success' ? (
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                      ) : activity.type === 'warning' ? (
                        <AlertCircle className="h-3.5 w-3.5 text-amber-600" />
                      ) : activity.type === 'error' ? (
                        <AlertCircle className="h-3.5 w-3.5 text-red-600" />
                      ) : (
                        <AlertCircle className="h-3.5 w-3.5 text-blue-600" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm">{activity.text}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Quick Actions */}
        <motion.div variants={item}>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Ações Rápidas</CardTitle>
              <CardDescription>Acesso direto às funções mais usadas</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                {quickActions.map((action) => (
                  <Button
                    key={action.label}
                    variant="outline"
                    className="h-auto py-3 px-3 flex flex-col items-center gap-2 hover:bg-primary/5 hover:border-primary/30"
                    asChild
                  >
                    <Link href={action.href}>
                      <action.icon className="h-5 w-5 text-primary" />
                      <span className="text-xs font-medium">{action.label}</span>
                    </Link>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  )
}
