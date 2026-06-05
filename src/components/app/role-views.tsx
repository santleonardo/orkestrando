'use client'

import React, { useState, useEffect } from 'react'
import { useStore } from '@/lib/store'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { ScrollArea } from '@/components/ui/scroll-area'
import { WEEKDAYS, WEEKDAY_SHORT } from './constants'
import { formatDate, getAttendanceColor, getAttendanceLabel, EmptyState, LoadingCard } from './helpers'
import { BookOpen, CalendarDays, ClipboardCheck, School, Users, Building2 } from 'lucide-react'

/* ─── Aluno: Minhas Disciplinas ─── */

export function MySubjectsView() {
  const { classes, fetchClasses } = useStore()
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchClasses().then(() => setLoading(false)) }, [])

  if (loading) return <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">{[...Array(3)].map((_, i) => <LoadingCard key={i} />)}</div>

  return (
    <div className="space-y-6">
      <div><h2 className="text-xl font-bold">Minhas Disciplinas</h2><p className="text-sm text-muted-foreground">{classes.length} disciplinas matriculadas</p></div>
      {classes.length === 0 ? (
        <Card className="shadow-sm"><CardContent><EmptyState icon={BookOpen} title="Nenhuma disciplina" desc="Você ainda não está matriculado em nenhuma disciplina." /></CardContent></Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {classes.map(c => (
            <Card key={c.id} className="shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-5">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-emerald-50"><BookOpen className="h-5 w-5 text-emerald-600" /></div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm">{c.subject?.name || c.code}</p>
                    <p className="text-xs text-muted-foreground">{c.code}</p>
                    <div className="flex flex-wrap gap-1 mt-2">
                      <Badge variant="outline" className="text-xs">{WEEKDAY_SHORT[c.weekday] || c.weekday}</Badge>
                      <Badge variant="outline" className="text-xs">{c.startTime} - {c.endTime}</Badge>
                      <Badge variant="outline" className="text-xs">{c.room?.code || '-'}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">Prof. {c.teacher?.displayName || '-'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

/* ─── Aluno: Meu Horário ─── */

export function MyScheduleView() {
  const { classes, fetchClasses } = useStore()
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchClasses().then(() => setLoading(false)) }, [])

  if (loading) return <LoadingCard />

  const scheduleByDay: Record<string, typeof classes> = {}
  WEEKDAYS.forEach(d => { scheduleByDay[d] = classes.filter(c => c.weekday === d).sort((a, b) => a.startTime.localeCompare(b.startTime)) })

  return (
    <div className="space-y-6">
      <div><h2 className="text-xl font-bold">Meu Horário</h2><p className="text-sm text-muted-foreground">Grade semanal de aulas</p></div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {WEEKDAYS.map(day => (
          <Card key={day} className="shadow-sm">
            <CardHeader className="pb-3"><CardTitle className="text-sm font-semibold flex items-center gap-2"><CalendarDays className="h-4 w-4 text-emerald-600" /> {day}</CardTitle></CardHeader>
            <CardContent>
              {scheduleByDay[day].length === 0 ? (
                <p className="text-xs text-muted-foreground">Sem aulas</p>
              ) : (
                <div className="space-y-2">
                  {scheduleByDay[day].map(c => (
                    <div key={c.id} className="flex items-center gap-3 p-2 rounded-lg bg-muted/50">
                      <div className="text-xs font-mono text-muted-foreground whitespace-nowrap">{c.startTime}-{c.endTime}</div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{c.subject?.name || c.code}</p>
                        <p className="text-xs text-muted-foreground">{c.room?.code} - Prof. {c.teacher?.displayName}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

/* ─── Aluno: Minhas Frequências ─── */

export function MyAttendanceView() {
  const { attendance, enrollments, fetchAttendance, fetchEnrollments } = useStore()
  const [loading, setLoading] = useState(true)

  useEffect(() => { Promise.all([fetchAttendance(), fetchEnrollments()]).then(() => setLoading(false)) }, [])

  const myEnrollmentIds = enrollments.map(e => e.id)
  const myAttendance = attendance.filter(a => myEnrollmentIds.includes(a.enrollmentId))
  const present = myAttendance.filter(a => a.status === 'PRESENT').length
  const rate = myAttendance.length > 0 ? Math.round((present / myAttendance.length) * 100) : 0

  if (loading) return <LoadingCard />

  return (
    <div className="space-y-6">
      <div><h2 className="text-xl font-bold">Minhas Frequências</h2><p className="text-sm text-muted-foreground">{myAttendance.length} registros no total</p></div>
      <Card className="shadow-sm">
        <CardContent className="p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium">Taxa Geral de Frequência</span>
            <Badge className="bg-emerald-100 text-emerald-700">{rate}%</Badge>
          </div>
          <Progress value={rate} className="h-2" />
        </CardContent>
      </Card>
      <Card className="shadow-sm">
        <CardContent className="p-0">
          {myAttendance.length === 0 ? (
            <div className="p-8"><EmptyState icon={ClipboardCheck} title="Nenhum registro" desc="Os registros aparecerão aqui." /></div>
          ) : (
            <ScrollArea className="max-h-96">
              <Table>
                <TableHeader><TableRow><TableHead>Data</TableHead><TableHead>Disciplina</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
                <TableBody>
                  {myAttendance.map(a => (
                    <TableRow key={a.id}>
                      <TableCell className="text-sm">{formatDate(a.date)}</TableCell>
                      <TableCell className="text-sm">{a.enrollment?.class?.subject?.name || '-'}</TableCell>
                      <TableCell><Badge className={getAttendanceColor(a.status)} variant="outline">{getAttendanceLabel(a.status)}</Badge></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

/* ─── Professor: Minhas Turmas ─── */

export function MyClassesView() {
  const { classes, fetchClasses } = useStore()
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchClasses().then(() => setLoading(false)) }, [])

  if (loading) return <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{[...Array(3)].map((_, i) => <LoadingCard key={i} />)}</div>

  return (
    <div className="space-y-6">
      <div><h2 className="text-xl font-bold">Minhas Turmas</h2><p className="text-sm text-muted-foreground">{classes.length} turmas atribuídas</p></div>
      {classes.length === 0 ? (
        <Card className="shadow-sm"><CardContent><EmptyState icon={School} title="Nenhuma turma" desc="Nenhuma turma atribuída ainda." /></CardContent></Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {classes.map(c => (
            <Card key={c.id} className="shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-5">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-teal-50"><School className="h-5 w-5 text-teal-600" /></div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium">{c.subject?.name || c.code}</p>
                    <Badge className="mt-1 bg-teal-100 text-teal-700" variant="outline">{c.code}</Badge>
                    <div className="mt-3 space-y-1">
                      <p className="text-xs text-muted-foreground flex items-center gap-1"><CalendarDays className="h-3 w-3" />{c.weekday} {c.startTime}-{c.endTime}</p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1"><Building2 className="h-3 w-3" />{c.room?.code} - {c.room?.name}</p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1"><Users className="h-3 w-3" />{c.vacancies} vagas</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
