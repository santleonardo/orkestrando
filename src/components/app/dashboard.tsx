'use client'

import React, { useState, useEffect } from 'react'
import { useStore } from '@/lib/store'
import { cn } from '@/lib/utils'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { LoadingCard } from './helpers'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RTooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, AreaChart, Area,
} from 'recharts'
import { Users, GraduationCap, BookOpen, ClipboardCheck, FolderOpen, Award, UserPlus, Upload, CalendarDays, School } from 'lucide-react'
import { PIE_COLORS } from './constants'

export function DashboardView() {
  const store = useStore()
  const { user, profiles, subjects, classes, attendance, enrollments } = store
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      store.fetchProfiles(), store.fetchSubjects(), store.fetchRooms(),
      store.fetchClasses(), store.fetchEnrollments(), store.fetchAttendance(),
    ]).then(() => setLoading(false))
  }, [])

  if (loading) {
    return <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">{[...Array(4)].map((_, i) => <LoadingCard key={i} />)}</div>
  }

  const teachers = profiles.filter(p => p.role === 'PROFESSOR')
  const students = profiles.filter(p => p.role === 'STUDENT')
  const presentCount = attendance.filter(a => a.status === 'PRESENT').length
  const attendanceRate = attendance.length > 0 ? Math.round((presentCount / attendance.length) * 100) : 0

  const kpis = user?.role === 'COORDINATOR' ? [
    { title: 'Total de Alunos', value: students.length || 0, icon: Users, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { title: 'Professores', value: teachers.length || 0, icon: GraduationCap, color: 'text-teal-600', bg: 'bg-teal-50' },
    { title: 'Disciplinas Ativas', value: subjects.length || 0, icon: BookOpen, color: 'text-cyan-600', bg: 'bg-cyan-50' },
    { title: 'Taxa de Frequência', value: `${attendanceRate}%`, icon: ClipboardCheck, color: 'text-amber-600', bg: 'bg-amber-50' },
  ] : user?.role === 'PROFESSOR' ? [
    { title: 'Minhas Turmas', value: classes.length || 0, icon: School, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { title: 'Total de Alunos', value: enrollments.length || 0, icon: Users, color: 'text-teal-600', bg: 'bg-teal-50' },
    { title: 'Taxa de Frequência', value: `${attendanceRate}%`, icon: ClipboardCheck, color: 'text-cyan-600', bg: 'bg-cyan-50' },
    { title: 'Materiais', value: 0, icon: FolderOpen, color: 'text-amber-600', bg: 'bg-amber-50' },
  ] : [
    { title: 'Minhas Disciplinas', value: classes.length || 0, icon: BookOpen, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { title: 'Frequência', value: `${attendanceRate}%`, icon: ClipboardCheck, color: 'text-teal-600', bg: 'bg-teal-50' },
    { title: 'Materiais', value: 0, icon: FolderOpen, color: 'text-cyan-600', bg: 'bg-cyan-50' },
    { title: 'CR', value: '3.75', icon: Award, color: 'text-amber-600', bg: 'bg-amber-50' },
  ]

  const attendancePie = [
    { name: 'Presente', value: presentCount || 1 },
    { name: 'Ausente', value: attendance.filter(a => a.status === 'ABSENT').length || 0 },
    { name: 'Atrasado', value: attendance.filter(a => a.status === 'LATE').length || 0 },
    { name: 'Justificado', value: attendance.filter(a => a.status === 'EXCUSED').length || 0 },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Olá, {user?.firstName}!</h1>
        <p className="text-muted-foreground">Confira um resumo do seu painel acadêmico.</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi, i) => (
          <Card key={i} className="shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <div className={cn('p-2 rounded-lg', kpi.bg)}><kpi.icon className={cn('h-5 w-5', kpi.color)} /></div>
              </div>
              <div className="text-2xl font-bold">{kpi.value}</div>
              <p className="text-sm text-muted-foreground mt-1">{kpi.title}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Tendência de Matrículas</CardTitle>
            <CardDescription>Matrículas mensais de alunos</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={[
                { month: 'Jan', students: 120 }, { month: 'Fev', students: 145 },
                { month: 'Mar', students: 180 }, { month: 'Abr', students: 210 },
                { month: 'Mai', students: 195 }, { month: 'Jun', students: 230 },
              ]}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="month" fontSize={12} />
                <YAxis fontSize={12} />
                <RTooltip />
                <Area type="monotone" dataKey="students" stroke="#10b981" fill="#10b98120" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Distribuição de Frequência</CardTitle>
            <CardDescription>Resumo geral de presenças</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie data={attendancePie} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={4} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                  {attendancePie.map((_, i) => <Cell key={i} fill={PIE_COLORS[i]} />)}
                </Pie>
                <RTooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {user?.role === 'COORDINATOR' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-base">Desempenho Semanal</CardTitle>
              <CardDescription>Taxa de frequência por dia</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={[
                  { day: 'Seg', rate: 96 }, { day: 'Ter', rate: 93 }, { day: 'Qua', rate: 91 },
                  { day: 'Qui', rate: 95 }, { day: 'Sex', rate: 88 }, { day: 'Sáb', rate: 82 },
                ]}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="day" fontSize={12} />
                  <YAxis fontSize={12} domain={[70, 100]} />
                  <RTooltip />
                  <Line type="monotone" dataKey="rate" stroke="#06b6d4" strokeWidth={2} dot={{ fill: '#06b6d4' }} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-base">Matrículas por Disciplina</CardTitle>
              <CardDescription>Alunos por disciplina</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={subjects.slice(0, 6).map(s => ({ name: s.code, students: Math.floor(Math.random() * 40) + 15 }))}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="name" fontSize={12} />
                  <YAxis fontSize={12} />
                  <RTooltip />
                  <Bar dataKey="students" fill="#14b8a6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Atividade Recente */}
      <Card className="shadow-sm">
        <CardHeader><CardTitle className="text-base">Atividade Recente</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { action: 'Nova matrícula registrada', detail: 'Maria Silva matriculou-se em CS101', time: '2 min atrás', icon: UserPlus, color: 'text-emerald-600 bg-emerald-50' },
              { action: 'Frequência enviada', detail: 'Prof. Oliveira registrou frequência em MA201', time: '15 min atrás', icon: ClipboardCheck, color: 'text-teal-600 bg-teal-50' },
              { action: 'Novo material enviado', detail: 'Sistemas de Banco de Dados - Aula 12', time: '1 hora atrás', icon: Upload, color: 'text-cyan-600 bg-cyan-50' },
              { action: 'Horário atualizado', detail: 'PH301 mudou para Sala 204B', time: '2 horas atrás', icon: CalendarDays, color: 'text-amber-600 bg-amber-50' },
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className={cn('p-2 rounded-lg', item.color)}><item.icon className="h-4 w-4" /></div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{item.action}</p>
                  <p className="text-xs text-muted-foreground">{item.detail}</p>
                </div>
                <span className="text-xs text-muted-foreground whitespace-nowrap">{item.time}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
