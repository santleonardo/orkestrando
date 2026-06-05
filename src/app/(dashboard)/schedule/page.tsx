'use client'

import React, { useState, useMemo } from 'react'
import { format, addDays, startOfWeek, isSameDay, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { motion, AnimatePresence } from 'framer-motion'
import {
  CalendarDays,
  Clock,
  MapPin,
  Users,
  Printer,
  ChevronLeft,
  ChevronRight,
  Filter,
  BookOpen,
  GraduationCap,
  DoorOpen,
  X,
  Calendar,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Calendar as CalendarUI } from '@/components/ui/calendar'
import { SESSION_STATUS_LABELS } from '@/lib/constants'
import { formatTime } from '@/lib/utils/date'

// Mock data
const COURSES = [
  { id: '1', name: 'Música', color: 'bg-emerald-500', lightColor: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  { id: '2', name: 'Teatro', color: 'bg-violet-500', lightColor: 'bg-violet-50 text-violet-700 border-violet-200' },
  { id: '3', name: 'Dança', color: 'bg-amber-500', lightColor: 'bg-amber-50 text-amber-700 border-amber-200' },
  { id: '4', name: 'Artes Visuais', color: 'bg-rose-500', lightColor: 'bg-rose-50 text-rose-700 border-rose-200' },
  { id: '5', name: 'Canto', color: 'bg-cyan-500', lightColor: 'bg-cyan-50 text-cyan-700 border-cyan-200' },
]

const TEACHERS = [
  { id: '1', name: 'Prof. Carlos Silva' },
  { id: '2', name: 'Prof. Ana Beatriz' },
  { id: '3', name: 'Prof. Roberto Lima' },
  { id: '4', name: 'Prof. Juliana Costa' },
]

const ROOMS = [
  { id: '1', name: 'Sala 101', code: '101' },
  { id: '2', name: 'Sala 202', code: '202' },
  { id: '3', name: 'Auditorio', code: 'AUD' },
  { id: '4', name: 'Lab Música', code: 'LM' },
]

function generateSessions() {
  const sessions = []
  const base = new Date()
  for (let d = -2; d < 7; d++) {
    const date = addDays(base, d)
    const dayOfWeek = date.getDay()
    if (dayOfWeek === 0) continue
    const count = dayOfWeek === 6 ? 2 : 4
    for (let i = 0; i < count; i++) {
      const course = COURSES[i % COURSES.length]
      const teacher = TEACHERS[i % TEACHERS.length]
      const room = ROOMS[i % ROOMS.length]
      const startHour = 7 + i * 2
      sessions.push({
        id: `s-${d}-${i}`,
        classId: `c-${d}-${i}`,
        courseName: course.name,
        courseColor: course.color,
        courseLightColor: course.lightColor,
        className: `${course.name} - Turma ${2025 + Math.floor(i / 2)}/${(i % 2) + 1}`,
        teacherName: teacher.name,
        teacherId: teacher.id,
        roomId: room.id,
        roomName: room.name,
        date: format(date, 'yyyy-MM-dd'),
        startTime: `${String(startHour).padStart(2, '0')}:00`,
        endTime: `${String(startHour + 1).padStart(2, '0')}:50`,
        status: d < 0 ? 'completed' : d === 0 ? 'scheduled' : 'scheduled',
        topic: i === 0 ? 'Introdução' : i === 1 ? 'Prática' : i === 2 ? 'Teoria Avançada' : 'Avaliação',
        studentCount: 15 + (i * 5),
      })
    }
  }
  return sessions
}

const ALL_SESSIONS = generateSessions()

export default function SchedulePage() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'day'>('month')
  const [filterTeacher, setFilterTeacher] = useState<string>('all')
  const [filterRoom, setFilterRoom] = useState<string>('all')
  const [filterCourse, setFilterCourse] = useState<string>('all')
  const [selectedSession, setSelectedSession] = useState<typeof ALL_SESSIONS[0] | null>(null)

  const filteredSessions = useMemo(() => {
    return ALL_SESSIONS.filter((s) => {
      if (filterTeacher !== 'all' && s.teacherId !== filterTeacher) return false
      if (filterRoom !== 'all' && s.roomId !== filterRoom) return false
      if (filterCourse !== 'all' && !s.courseName.includes(COURSES.find(c => c.id === filterCourse)?.name || '')) return false
      return true
    })
  }, [filterTeacher, filterRoom, filterCourse])

  const todaySessions = useMemo(() => {
    return filteredSessions
      .filter((s) => isSameDay(parseISO(s.date), selectedDate))
      .sort((a, b) => a.startTime.localeCompare(b.startTime))
  }, [filteredSessions, selectedDate])

  const weekStart = startOfWeek(selectedDate, { weekStartsOn: 0 })

  const weekSessions = useMemo(() => {
    const sessions: Record<string, typeof ALL_SESSIONS> = {}
    for (let i = 0; i < 7; i++) {
      const day = addDays(weekStart, i)
      const dateStr = format(day, 'yyyy-MM-dd')
      sessions[dateStr] = filteredSessions
        .filter((s) => s.date === dateStr)
        .sort((a, b) => a.startTime.localeCompare(b.startTime))
    }
    return sessions
  }, [filteredSessions, weekStart])

  const stats = useMemo(() => {
    const today = format(new Date(), 'yyyy-MM-dd')
    const todayCount = filteredSessions.filter((s) => s.date === today).length
    const upcoming = filteredSessions.filter((s) => s.date > today).length
    const usedRooms = new Set(filteredSessions.filter((s) => s.date === today).map((s) => s.roomId)).size
    return { todayClasses: todayCount, upcoming, roomsInUse: usedRooms }
  }, [filteredSessions])

  const sessionsWithDots = useMemo(() => {
    const dates = new Set(filteredSessions.map((s) => s.date))
    return dates
  }, [filteredSessions])

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Agenda</h1>
          <p className="text-muted-foreground">Gerencie aulas e sessões acadêmicas</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-2">
            <Printer className="h-4 w-4" />
            Imprimir
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { label: 'Aulas Hoje', value: stats.todayClasses, icon: CalendarDays, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Próximas Aulas', value: stats.upcoming, icon: Clock, color: 'text-violet-600', bg: 'bg-violet-50' },
          { label: 'Salas em Uso', value: stats.roomsInUse, icon: MapPin, color: 'text-amber-600', bg: 'bg-amber-50' },
        ].map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${stat.bg}`}>
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Filter className="h-4 w-4" />
              <span className="font-medium">Filtros:</span>
            </div>
            <Select value={filterTeacher} onValueChange={setFilterTeacher}>
              <SelectTrigger className="h-8 w-40">
                <SelectValue placeholder="Professor" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos Professores</SelectItem>
                {TEACHERS.map((t) => (
                  <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterRoom} onValueChange={setFilterRoom}>
              <SelectTrigger className="h-8 w-32">
                <SelectValue placeholder="Sala" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas Salas</SelectItem>
                {ROOMS.map((r) => (
                  <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterCourse} onValueChange={setFilterCourse}>
              <SelectTrigger className="h-8 w-36">
                <SelectValue placeholder="Curso" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos Cursos</SelectItem>
                {COURSES.map((c) => (
                  <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
        {/* Calendar */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Calendário
            </CardTitle>
          </CardHeader>
          <CardContent>
            <CalendarUI
              mode="single"
              selected={selectedDate}
              onSelect={(date) => date && setSelectedDate(date)}
              locale={ptBR}
              modifiers={{
                hasSessions: sessionsWithDots.has(format(selectedDate, 'yyyy-MM-dd')) ? [selectedDate] : [],
              }}
              modifiersStyles={{
                hasSessions: {},
              }}
              className="mx-auto"
            />
            <div className="mt-4 flex flex-wrap gap-2">
              {COURSES.map((c) => (
                <div key={c.id} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <div className={`h-2.5 w-2.5 rounded-full ${c.color}`} />
                  <span>{c.name}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Session List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setSelectedDate(addDays(selectedDate, -1))}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <h2 className="text-lg font-semibold">
                {format(selectedDate, "EEEE, dd 'de' MMMM", { locale: ptBR })}
              </h2>
              <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setSelectedDate(addDays(selectedDate, 1))}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as typeof viewMode)}>
              <TabsList className="h-8">
                <TabsTrigger value="day" className="text-xs px-3 h-6">Dia</TabsTrigger>
                <TabsTrigger value="week" className="text-xs px-3 h-6">Semana</TabsTrigger>
                <TabsTrigger value="month" className="text-xs px-3 h-6">Mês</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          <AnimatePresence mode="wait">
            {viewMode === 'day' && (
              <motion.div
                key="day"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="space-y-3"
              >
                {todaySessions.length === 0 ? (
                  <Card>
                    <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                      <CalendarDays className="h-12 w-12 text-muted-foreground/30 mb-3" />
                      <p className="text-sm text-muted-foreground">Nenhuma aula neste dia</p>
                    </CardContent>
                  </Card>
                ) : (
                  todaySessions.map((session, i) => (
                    <motion.div
                      key={session.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                    >
                      <Card
                        className="cursor-pointer hover:shadow-md transition-shadow border-l-4"
                        style={{ borderLeftColor: undefined }}
                        onClick={() => setSelectedSession(session)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start gap-4">
                            <div className={`flex h-12 w-1 rounded-full ${session.courseColor} shrink-0`} />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2">
                                <div>
                                  <h3 className="font-semibold text-sm">{session.className}</h3>
                                  <p className="text-xs text-muted-foreground mt-0.5">{session.topic}</p>
                                </div>
                                <Badge variant="secondary" className={session.courseLightColor} style={{ borderWidth: 1 }}>
                                  {session.courseName}
                                </Badge>
                              </div>
                              <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  {session.startTime} - {session.endTime}
                                </span>
                                <span className="flex items-center gap-1">
                                  <MapPin className="h-3 w-3" />
                                  {session.roomName}
                                </span>
                                <span className="flex items-center gap-1">
                                  <GraduationCap className="h-3 w-3" />
                                  {session.teacherName}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Users className="h-3 w-3" />
                                  {session.studentCount} alunos
                                </span>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))
                )}
              </motion.div>
            )}

            {viewMode === 'week' && (
              <motion.div
                key="week"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
              >
                <Card>
                  <CardContent className="p-0">
                    <ScrollArea className="h-[500px]">
                      <div className="min-w-[640px]">
                        {/* Week header */}
                        <div className="grid grid-cols-8 border-b bg-muted/30 sticky top-0 z-10">
                          <div className="p-2 text-xs font-medium text-muted-foreground">Horário</div>
                          {Array.from({ length: 7 }, (_, i) => {
                            const day = addDays(weekStart, i)
                            const isToday = isSameDay(day, new Date())
                            return (
                              <div key={i} className={`p-2 text-center ${isToday ? 'bg-emerald-50' : ''}`}>
                                <div className="text-[10px] text-muted-foreground">
                                  {format(day, 'EEE', { locale: ptBR })}
                                </div>
                                <div className={`text-sm font-semibold ${isToday ? 'text-emerald-600' : ''}`}>
                                  {format(day, 'dd')}
                                </div>
                              </div>
                            )
                          })}
                        </div>
                        {/* Time slots */}
                        {Array.from({ length: 12 }, (_, i) => {
                          const hour = 7 + i
                          return (
                            <div key={hour} className="grid grid-cols-8 border-b min-h-[50px]">
                              <div className="p-1 text-xs text-muted-foreground flex items-start justify-end pr-2">
                                {`${String(hour).padStart(2, '0')}:00`}
                              </div>
                              {Array.from({ length: 7 }, (_, j) => {
                                const day = addDays(weekStart, j)
                                const dateStr = format(day, 'yyyy-MM-dd')
                                const slotSessions = weekSessions[dateStr]?.filter(
                                  (s) => parseInt(s.startTime.split(':')[0]) === hour
                                )
                                return (
                                  <div key={j} className="border-l p-0.5">
                                    {slotSessions?.map((s) => (
                                      <button
                                        key={s.id}
                                        className={`w-full text-left rounded p-1 text-[10px] leading-tight mb-0.5 ${s.courseColor} text-white hover:opacity-90 transition-opacity`}
                                        onClick={() => setSelectedSession(s)}
                                      >
                                        <div className="font-medium truncate">{s.courseName}</div>
                                        <div className="opacity-80 truncate">{s.roomName}</div>
                                      </button>
                                    ))}
                                  </div>
                                )
                              })}
                            </div>
                          )
                        })}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {viewMode === 'month' && (
              <motion.div
                key="month"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
              >
                <Card>
                  <CardContent className="p-4">
                    <div className="flex flex-wrap gap-2">
                      {filteredSessions.slice(0, 20).map((session, i) => (
                        <motion.div
                          key={session.id}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: i * 0.03 }}
                        >
                          <Card
                            className="cursor-pointer hover:shadow-md transition-shadow"
                            onClick={() => {
                              setSelectedDate(parseISO(session.date))
                              setSelectedSession(session)
                            }}
                          >
                            <CardContent className="p-3">
                              <div className="flex items-center gap-2">
                                <div className={`h-2 w-2 rounded-full ${session.courseColor}`} />
                                <div className="min-w-0">
                                  <p className="text-xs font-medium truncate">{session.courseName}</p>
                                  <p className="text-[10px] text-muted-foreground">
                                    {format(parseISO(session.date), "dd MMM", { locale: ptBR })} • {session.startTime}-{session.endTime}
                                  </p>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </motion.div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Session Detail Dialog */}
      <Dialog open={!!selectedSession} onOpenChange={() => setSelectedSession(null)}>
        <DialogContent className="sm:max-w-lg">
          {selectedSession && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-3">
                  <div className={`h-3 w-3 rounded-full ${selectedSession.courseColor}`} />
                  {selectedSession.className}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Curso</p>
                    <p className="text-sm font-medium">{selectedSession.courseName}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Tópico</p>
                    <p className="text-sm font-medium">{selectedSession.topic}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Horário</p>
                    <p className="text-sm font-medium">{selectedSession.startTime} - {selectedSession.endTime}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Data</p>
                    <p className="text-sm font-medium">{format(parseISO(selectedSession.date), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Sala</p>
                    <p className="text-sm font-medium flex items-center gap-1">
                      <MapPin className="h-3 w-3" /> {selectedSession.roomName}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Professor</p>
                    <p className="text-sm font-medium flex items-center gap-1">
                      <GraduationCap className="h-3 w-3" /> {selectedSession.teacherName}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Alunos</p>
                    <p className="text-sm font-medium flex items-center gap-1">
                      <Users className="h-3 w-3" /> {selectedSession.studentCount}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Status</p>
                    <Badge variant="secondary" className="text-xs">
                      {SESSION_STATUS_LABELS[selectedSession.status]}
                    </Badge>
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
