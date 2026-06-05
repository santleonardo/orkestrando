'use client'

import React from 'react'
import { motion } from 'framer-motion'
import {
  CalendarDays,
  Clock,
  FileText,
  ClipboardCheck,
  GraduationCap,
  BookOpen,
  ChevronRight,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Download,
  Star,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import Link from 'next/link'
import { formatRelativeTime } from '@/lib/utils/date'

const TODAY_CLASSES = [
  { id: '1', subject: 'Teoria Musical', teacher: 'Prof. Carlos Silva', room: 'Sala 101', time: '07:00 - 08:50', color: 'border-l-emerald-500' },
  { id: '2', subject: 'Instrumento - Piano', teacher: 'Prof. Ana Beatriz', room: 'Lab Música', time: '09:00 - 10:50', color: 'border-l-violet-500' },
  { id: '3', subject: 'Coral', teacher: 'Prof. Roberto Lima', room: 'Auditório', time: '13:00 - 14:50', color: 'border-l-amber-500' },
]

const UPCOMING_DEADLINES = [
  { id: '1', title: 'Trabalho Prático — Harmonia', dueDate: '2025-01-20T23:59:00', type: 'assignment', urgency: 'high' },
  { id: '2', title: 'Relatório de Estgio', dueDate: '2025-01-25T23:59:00', type: 'assignment', urgency: 'medium' },
  { id: '3', title: 'Prova de Teoria Musical', dueDate: '2025-01-30T07:00:00', type: 'exam', urgency: 'low' },
]

const RECENT_MATERIALS = [
  { id: '1', title: 'Apostila de Teoria Musical v3', type: 'pdf', uploadedAt: '2025-01-15T10:30:00', subject: 'Teoria Musical' },
  { id: '2', title: 'Exerccios — Módulo 2', type: 'pdf', uploadedAt: '2025-01-13T14:00:00', subject: 'Teoria Musical' },
  { id: '3', title: 'Partituras — Beethoven', type: 'zip', uploadedAt: '2025-01-10T09:00:00', subject: 'Instrumento' },
]

export default function StudentHomePage() {
  return (
    <div className="space-y-6">
      {/* Welcome */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 p-6 text-white"
      >
        <h1 className="text-2xl font-bold">Olá, Ana Clara! 👋</h1>
        <p className="text-teal-100 mt-1">Música — 3º Semestre | Matrícula: 2025001</p>
        <div className="flex gap-3 mt-4">
          <Button variant="secondary" size="sm" className="gap-2 bg-white/20 text-white hover:bg-white/30">
            <CalendarDays className="h-4 w-4" />
            Ver Agenda
          </Button>
          <Button variant="secondary" size="sm" className="gap-2 bg-white/20 text-white hover:bg-white/30">
            <FileText className="h-4 w-4" />
            Materiais
          </Button>
        </div>
      </motion.div>

      {/* Quick Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Frequência Geral', value: '94,5%', icon: ClipboardCheck, color: 'text-teal-600', bg: 'bg-teal-50' },
          { label: 'CR Atual', value: '8,7', icon: Star, color: 'text-amber-600', bg: 'bg-amber-50' },
          { label: 'Aulas Hoje', value: '3', icon: CalendarDays, color: 'text-violet-600', bg: 'bg-violet-50' },
          { label: 'Pendências', value: '1', icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-50' },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${stat.bg}`}>
                    <stat.icon className={`h-5 w-5 ${stat.color}`} />
                  </div>
                  <div>
                    <p className="text-xl font-bold">{stat.value}</p>
                    <p className="text-xs text-muted-foreground">{stat.label}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Today's Classes */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <CalendarDays className="h-4 w-4" />
                Aulas de Hoje
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {TODAY_CLASSES.map(cls => (
                <div key={cls.id} className={`p-3 rounded-lg border border-l-4 ${cls.color} hover:bg-muted/30 transition-colors`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-semibold">{cls.subject}</h3>
                      <p className="text-xs text-muted-foreground mt-0.5">{cls.teacher}</p>
                    </div>
                    <Badge variant="secondary" className="text-[10px]">{cls.time}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                    📍 {cls.room}
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>

        {/* Upcoming Deadlines */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Prazos Próximos
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {UPCOMING_DEADLINES.map(item => (
                <div key={item.id} className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted/30 transition-colors">
                  <div className={`flex h-8 w-8 items-center justify-center rounded-full text-white text-xs ${
                    item.urgency === 'high' ? 'bg-red-500' : item.urgency === 'medium' ? 'bg-amber-500' : 'bg-teal-500'
                  }`}>
                    {item.type === 'assignment' ? '📄' : '📝'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium truncate">{item.title}</h3>
                    <p className="text-xs text-muted-foreground">{formatRelativeTime(item.dueDate)}</p>
                  </div>
                  <Badge variant={item.urgency === 'high' ? 'destructive' : 'secondary'} className="text-[10px]">
                    {item.urgency === 'high' ? 'Urgente' : item.urgency === 'medium' ? 'Em breve' : 'Futuro'}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>

        {/* Recent Materials */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Materiais Recentes
                </CardTitle>
                <Link href="/student/materials">
                  <Button variant="ghost" size="sm" className="text-xs gap-1">
                    Ver todos <ChevronRight className="h-3 w-3" />
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {RECENT_MATERIALS.map(mat => (
                <div key={mat.id} className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted/30 transition-colors">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-50 text-red-500 shrink-0">
                    <FileText className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium truncate">{mat.title}</h3>
                    <p className="text-xs text-muted-foreground">{mat.subject} • {formatRelativeTime(mat.uploadedAt)}</p>
                  </div>
                  <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0">
                    <Download className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>

        {/* Attendance Overview */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
        >
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <ClipboardCheck className="h-4 w-4" />
                Frequência por Disciplina
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { name: 'Teoria Musical', rate: 98, total: 30, present: 29 },
                  { name: 'Instrumento — Piano', rate: 92, total: 28, present: 26 },
                  { name: 'Coral', rate: 95, total: 20, present: 19 },
                  { name: 'História da Música', rate: 90, total: 25, present: 23 },
                  { name: 'Composição', rate: 96, total: 24, present: 23 },
                ].map(cls => (
                  <div key={cls.name} className="space-y-1.5">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">{cls.name}</span>
                      <span className={`font-semibold text-xs ${cls.rate >= 90 ? 'text-teal-600' : cls.rate >= 75 ? 'text-amber-600' : 'text-red-600'}`}>
                        {cls.rate.toFixed(1)}% ({cls.present}/{cls.total})
                      </span>
                    </div>
                    <Progress value={cls.rate} className="h-2" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Quick Links */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-wrap gap-2">
              {[
                { label: 'Ver Notas', href: '/student/grades', icon: GraduationCap },
                { label: 'Agenda', href: '/student/schedule', icon: CalendarDays },
                { label: 'Materiais', href: '/student/materials', icon: FileText },
                { label: 'Frequência', href: '/student/attendance', icon: ClipboardCheck },
                { label: 'Histórico', href: '/student/history', icon: BookOpen },
              ].map(link => (
                <Link key={link.href} href={link.href}>
                  <Button variant="outline" size="sm" className="gap-2">
                    <link.icon className="h-4 w-4" />
                    {link.label}
                  </Button>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
