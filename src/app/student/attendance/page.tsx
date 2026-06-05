'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import {
  ClipboardCheck,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Clock,
  TrendingUp,
  Calendar,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  UserX,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

// ── Mock Data ──
interface SubjectAttendance {
  subject: string
  total: number
  present: number
  absent: number
  justified: number
  late: number
  rate: number
}

const OVERALL_STATS = {
  totalClasses: 127,
  totalPresent: 120,
  totalAbsent: 3,
  totalJustified: 2,
  totalLate: 2,
  overallRate: 94.5,
}

const SUBJECT_ATTENDANCE: SubjectAttendance[] = [
  { subject: 'Teoria Musical', total: 30, present: 29, absent: 0, justified: 1, late: 0, rate: 100 },
  { subject: 'Instrumento — Piano', total: 28, present: 26, absent: 1, justified: 0, late: 1, rate: 96.4 },
  { subject: 'Coral', total: 20, present: 19, absent: 0, justified: 1, late: 0, rate: 100 },
  { subject: 'História da Música', total: 25, present: 22, absent: 2, justified: 0, late: 1, rate: 92 },
  { subject: 'Composição', total: 24, present: 23, absent: 0, justified: 0, late: 1, rate: 100 },
  { subject: 'Percepção Musical', total: 20, present: 19, absent: 1, justified: 0, late: 0, rate: 95 },
]

type DayStatus = 'present' | 'absent' | 'justified' | 'late' | 'none'

// Generate calendar data for the current month (Jan 2025)
function generateCalendarDays(): { date: number; status: DayStatus; hasClass: boolean }[] {
  const days: { date: number; status: DayStatus; hasClass: boolean }[] = []
  const statuses: DayStatus[] = ['present', 'present', 'present', 'present', 'absent', 'present', 'present', 'justified', 'present', 'late', 'present', 'present', 'present', 'absent', 'present', 'present', 'present', 'present', 'present', 'present', 'present', 'justified', 'present', 'present', 'late']
  for (let i = 1; i <= 31; i++) {
    const isWeekend = (i === 5 || i === 6 || i === 12 || i === 13 || i === 19 || i === 20 || i === 26 || i === 27)
    if (isWeekend || i === 1) {
      days.push({ date: i, status: 'none', hasClass: false })
    } else {
      const idx = i < statuses.length ? i - 1 : (i % statuses.length)
      days.push({ date: i, status: statuses[idx], hasClass: true })
    }
  }
  return days
}

const CALENDAR_DAYS = generateCalendarDays()

function getStatusColor(status: DayStatus): string {
  switch (status) {
    case 'present': return 'bg-teal-500'
    case 'absent': return 'bg-red-500'
    case 'justified': return 'bg-amber-500'
    case 'late': return 'bg-orange-400'
    default: return ''
  }
}

function getRateColor(rate: number): string {
  if (rate >= 90) return 'text-teal-600 bg-teal-50'
  if (rate >= 75) return 'text-amber-600 bg-amber-50'
  return 'text-red-600 bg-red-50'
}

function getProgressColor(rate: number): string {
  if (rate >= 90) return '[&>div]:bg-teal-500'
  if (rate >= 75) return '[&>div]:bg-amber-500'
  return '[&>div]:bg-red-500'
}

export default function AttendancePage() {
  const [calendarMonth, setCalendarMonth] = useState(0) // January 2025

  const monthNames = [
    'Janeiro 2025', 'Fevereiro 2025', 'Março 2025', 'Abril 2025',
    'Maio 2025', 'Junho 2025', 'Julho 2025', 'Agosto 2025',
    'Setembro 2025', 'Outubro 2025', 'Novembro 2025', 'Dezembro 2025'
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Frequência</h1>
        <p className="text-sm text-muted-foreground">Acompanhe sua assiduidade nas disciplinas</p>
      </div>

      {/* Overall Attendance Card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className="overflow-hidden">
          <div className="bg-gradient-to-r from-teal-600 to-emerald-600 p-6 text-white">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm">
                  <ClipboardCheck className="h-8 w-8" />
                </div>
                <div>
                  <p className="text-teal-100 text-sm font-medium">Frequência Geral</p>
                  <p className="text-4xl font-extrabold">{OVERALL_STATS.overallRate.toFixed(1)}%</p>
                </div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  { label: 'Total de Aulas', value: OVERALL_STATS.totalClasses, icon: Calendar, color: 'bg-white/15' },
                  { label: 'Presentes', value: OVERALL_STATS.totalPresent, icon: CheckCircle2, color: 'bg-white/15' },
                  { label: 'Faltas', value: OVERALL_STATS.totalAbsent, icon: XCircle, color: 'bg-white/15' },
                  { label: 'Justificadas', value: OVERALL_STATS.totalJustified, icon: ShieldCheck, color: 'bg-white/15' },
                ].map((stat) => (
                  <div key={stat.label} className="flex items-center gap-2.5">
                    <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${stat.color}`}>
                      <stat.icon className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-xl font-bold">{stat.value}</p>
                      <p className="text-[10px] text-teal-200">{stat.label}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Tabs: Breakdown & Calendar */}
      <Tabs defaultValue="breakdown" className="space-y-6">
        <TabsList>
          <TabsTrigger value="breakdown">Por Disciplina</TabsTrigger>
          <TabsTrigger value="calendar">Calendário</TabsTrigger>
          <TabsTrigger value="summary">Resumo</TabsTrigger>
        </TabsList>

        {/* Per-subject breakdown */}
        <TabsContent value="breakdown">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Frequência por Disciplina</CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                {SUBJECT_ATTENDANCE.map((item) => (
                  <div key={item.subject} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold">{item.subject}</p>
                        <p className="text-xs text-muted-foreground">
                          {item.present} presentes, {item.absent} faltas{item.justified > 0 ? `, ${item.justified} justificadas` : ''}{item.late > 0 ? `, ${item.late} atrasos` : ''} de {item.total} aulas
                        </p>
                      </div>
                      <Badge className={`text-xs font-semibold ${getRateColor(item.rate)}`} variant="secondary">
                        {item.rate.toFixed(1)}%
                      </Badge>
                    </div>
                    <Progress value={item.rate} className={`h-2.5 ${getProgressColor(item.rate)}`} />
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        {/* Calendar view */}
        <TabsContent value="calendar">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">Calendário de Frequência</CardTitle>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="icon" className="h-8 w-8" disabled={calendarMonth === 0} onClick={() => setCalendarMonth(Math.max(0, calendarMonth - 1))}>
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <span className="text-sm font-medium min-w-[140px] text-center">{monthNames[calendarMonth]}</span>
                    <Button variant="outline" size="icon" className="h-8 w-8" disabled={calendarMonth >= 11} onClick={() => setCalendarMonth(Math.min(11, calendarMonth + 1))}>
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {/* Legend */}
                <div className="flex flex-wrap gap-3 mb-4">
                  {[
                    { color: 'bg-teal-500', label: 'Presente' },
                    { color: 'bg-amber-500', label: 'Justificado' },
                    { color: 'bg-orange-400', label: 'Atraso' },
                    { color: 'bg-red-500', label: 'Ausente' },
                    { color: 'bg-muted', label: 'Sem aula' },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center gap-1.5">
                      <div className={`h-3 w-3 rounded-full ${item.color}`} />
                      <span className="text-[11px] text-muted-foreground">{item.label}</span>
                    </div>
                  ))}
                </div>

                {/* Calendar grid */}
                <div className="grid grid-cols-7 gap-1.5">
                  {['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'].map((d) => (
                    <div key={d} className="text-center text-[10px] font-medium text-muted-foreground pb-1">
                      {d}
                    </div>
                  ))}
                  {CALENDAR_DAYS.map((day) => (
                    <div
                      key={day.date}
                      className={`aspect-square rounded-lg flex flex-col items-center justify-center text-xs relative ${
                        day.hasClass
                          ? day.status !== 'none'
                            ? 'bg-background border'
                            : 'bg-muted/30'
                          : 'bg-muted/20'
                      }`}
                    >
                      <span className={day.status === 'absent' ? 'font-semibold' : ''}>{day.date}</span>
                      {day.status !== 'none' && day.hasClass && (
                        <div className={`h-2 w-2 rounded-full mt-0.5 ${getStatusColor(day.status)}`} />
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        {/* Summary stats */}
        <TabsContent value="summary">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[
                {
                  title: 'Taxa Geral',
                  value: `${OVERALL_STATS.overallRate.toFixed(1)}%`,
                  desc: 'Acima da meta (90%)',
                  icon: TrendingUp,
                  color: 'text-teal-600',
                  bg: 'bg-teal-50',
                  trend: 'positive',
                },
                {
                  title: 'Melhor Disciplina',
                  value: 'Teoria Musical',
                  desc: '100% de frequência',
                  icon: CheckCircle2,
                  color: 'text-teal-600',
                  bg: 'bg-teal-50',
                },
                {
                  title: 'Atenção',
                  value: 'História da Música',
                  desc: `${(92).toFixed(0)}% — próxima da meta`,
                  icon: AlertCircle,
                  color: 'text-amber-600',
                  bg: 'bg-amber-50',
                },
                {
                  title: 'Total de Faltas',
                  value: `${OVERALL_STATS.totalAbsent}`,
                  desc: `${OVERALL_STATS.totalJustified} justificadas, ${OVERALL_STATS.totalAbsent} não justificadas`,
                  icon: UserX,
                  color: 'text-red-600',
                  bg: 'bg-red-50',
                },
              ].map((stat, i) => (
                <motion.div
                  key={stat.title}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${stat.bg}`}>
                          <stat.icon className={`h-5 w-5 ${stat.color}`} />
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground">{stat.title}</p>
                      <p className="text-lg font-bold mt-0.5">{stat.value}</p>
                      <p className="text-[11px] text-muted-foreground mt-1">{stat.desc}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            {/* Detailed summary card */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mt-4"
            >
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Status da Frequência</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-teal-50 dark:bg-teal-950 border border-teal-200 dark:border-teal-800">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-teal-600 text-white">
                        <CheckCircle2 className="h-4 w-4" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-teal-800 dark:text-teal-200">Frequência Regular</p>
                        <p className="text-xs text-teal-600 dark:text-teal-400">Sua frequência geral está acima de 90% — status excelente!</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-500 text-white">
                        <AlertCircle className="h-4 w-4" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-amber-800 dark:text-amber-200">Atenção em História da Música</p>
                        <p className="text-xs text-amber-600 dark:text-amber-400">Frequência de 92% — evite mais 1 falta para manter o mínimo de 75%.</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
