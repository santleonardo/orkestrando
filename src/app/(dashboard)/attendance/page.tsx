'use client'

import React, { useState, useMemo } from 'react'
import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ClipboardCheck,
  CheckCircle2,
  XCircle,
  Clock,
  ShieldCheck,
  Search,
  Filter,
  Users,
  Save,
  PenTool,
  ChevronDown,
  CalendarDays,
  Check,
  X,
  AlertTriangle,
  BarChart3,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Progress } from '@/components/ui/progress'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { ATTENDANCE_STATUS_LABELS } from '@/lib/constants'
import { formatDate } from '@/lib/utils/date'
import { formatPercentage } from '@/lib/utils/format'
import { toast } from 'sonner'
import type { AttendanceStatus } from '@/lib/types'

const STATUS_CONFIG: Record<AttendanceStatus, { label: string; color: string; bg: string; icon: React.ElementType }> = {
  present: { label: 'Presente', color: 'text-emerald-700', bg: 'bg-emerald-100', icon: CheckCircle2 },
  absent: { label: 'Ausente', color: 'text-red-700', bg: 'bg-red-100', icon: XCircle },
  late: { label: 'Atrasado', color: 'text-amber-700', bg: 'bg-amber-100', icon: Clock },
  justified: { label: 'Justificado', color: 'text-blue-700', bg: 'bg-blue-100', icon: ShieldCheck },
}

const MOCK_CLASSES = [
  { id: '1', name: 'Música - Turma 2025/1', teacher: 'Prof. Carlos Silva', schedule: 'Seg/Qua 07:00-08:50' },
  { id: '2', name: 'Teatro - Turma 2025/1', teacher: 'Prof. Roberto Lima', schedule: 'Ter/Qui 09:00-10:50' },
  { id: '3', name: 'Dança - Turma 2025/2', teacher: 'Prof. Juliana Costa', schedule: 'Seg/Qui 13:00-14:50' },
  { id: '4', name: 'Artes Visuais - Turma 2025/1', teacher: 'Prof. Ana Beatriz', schedule: 'Ter/Sex 10:00-11:50' },
]

const MOCK_SESSIONS = [
  { id: 's1', classId: '1', date: '2025-01-15', topic: 'Harização e Acordes', status: 'completed' as const },
  { id: 's2', classId: '1', date: '2025-01-13', topic: 'Estrutura Musical', status: 'completed' as const },
  { id: 's3', classId: '1', date: '2025-01-10', topic: 'Notação Musical', status: 'completed' as const },
  { id: 's4', classId: '2', date: '2025-01-14', topic: 'Expressão Corporal', status: 'completed' as const },
  { id: 's5', classId: '2', date: '2025-01-12', topic: 'Interpretação Cênica', status: 'completed' as const },
]

interface MockStudent {
  id: string
  name: string
  enrollmentNumber: string
  attendance: Record<string, AttendanceStatus>
  notes?: Record<string, string>
}

const MOCK_STUDENTS: MockStudent[] = [
  { id: 'st1', name: 'Ana Clara Mendes', enrollmentNumber: '2025001', attendance: { s1: 'present', s2: 'present', s3: 'present', s4: 'present', s5: 'late' }, notes: { s5: 'Trânsito' } },
  { id: 'st2', name: 'Bruno Oliveira', enrollmentNumber: '2025002', attendance: { s1: 'present', s2: 'late', s3: 'present', s4: 'absent', s5: 'present' }, notes: { s2: 'Transporte' } },
  { id: 'st3', name: 'Carolina Santos', enrollmentNumber: '2025003', attendance: { s1: 'present', s2: 'present', s3: 'justified', s4: 'present', s5: 'present' }, notes: { s3: 'Atestado médico' } },
  { id: 'st4', name: 'Daniel Ferreira', enrollmentNumber: '2025004', attendance: { s1: 'absent', s2: 'absent', s3: 'present', s4: 'absent', s5: 'absent' }, notes: {} },
  { id: 'st5', name: 'Eduarda Nascimento', enrollmentNumber: '2025005', attendance: { s1: 'present', s2: 'present', s3: 'present', s4: 'present', s5: 'present' }, notes: {} },
  { id: 'st6', name: 'Felipe Martins', enrollmentNumber: '2025006', attendance: { s1: 'late', s2: 'present', s3: 'present', s4: 'late', s5: 'present' }, notes: { s1: 'Dentista', s4: 'Problemas de saúde' } },
  { id: 'st7', name: 'Gabriela Lima', enrollmentNumber: '2025007', attendance: { s1: 'present', s2: 'present', s3: 'present', s4: 'present', s5: 'present' }, notes: {} },
  { id: 'st8', name: 'Henrique Costa', enrollmentNumber: '2025008', attendance: { s1: 'justified', s2: 'absent', s3: 'justified', s4: 'present', s5: 'present' }, notes: { s1: 'Viagem', s3: 'Competição' } },
  { id: 'st9', name: 'Isabela Alves', enrollmentNumber: '2025009', attendance: { s1: 'present', s2: 'late', s3: 'present', s4: 'absent', s5: 'present' }, notes: {} },
  { id: 'st10', name: 'João Pedro Souza', enrollmentNumber: '2025010', attendance: { s1: 'present', s2: 'present', s3: 'present', s4: 'present', s5: 'justified' }, notes: { s5: 'Consulta médica' } },
  { id: 'st11', name: 'Larissa Ribeiro', enrollmentNumber: '2025011', attendance: { s1: 'absent', s2: 'absent', s3: 'absent', s4: 'absent', s5: 'absent' }, notes: {} },
  { id: 'st12', name: 'Matheus Carvalho', enrollmentNumber: '2025012', attendance: { s1: 'present', s2: 'present', s3: 'late', s4: 'present', s5: 'present' }, notes: { s3: 'Despertador não tocou' } },
]

export default function AttendancePage() {
  const [selectedClass, setSelectedClass] = useState<string>('1')
  const [selectedSession, setSelectedSession] = useState<string>('s1')
  const [studentAttendance, setStudentAttendance] = useState<Record<string, Record<string, AttendanceStatus>>>(
    () => Object.fromEntries(MOCK_STUDENTS.map(s => [s.id, { ...s.attendance }]))
  )
  const [studentNotes, setStudentNotes] = useState<Record<string, Record<string, string>>>(
    () => Object.fromEntries(MOCK_STUDENTS.map(s => [s.id, { ...s.notes }]))
  )
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedStudentForNote, setSelectedStudentForNote] = useState<MockStudent | null>(null)
  const [noteText, setNoteText] = useState('')
  const [bulkAction, setBulkAction] = useState<AttendanceStatus | null>(null)

  const currentClass = MOCK_CLASSES.find(c => c.id === selectedClass)!
  const classSessions = MOCK_SESSIONS.filter(s => s.classId === selectedClass)

  const filteredStudents = MOCK_STUDENTS.filter(s =>
    !searchQuery || s.name.toLowerCase().includes(searchQuery.toLowerCase()) || s.enrollmentNumber.includes(searchQuery)
  )

  const calculateStudentRate = (studentId: string) => {
    const att = studentAttendance[studentId] || {}
    const total = classSessions.length
    const present = classSessions.filter(s => {
      const status = att[s.id]
      return status === 'present' || status === 'late' || status === 'justified'
    }).length
    return total > 0 ? (present / total) * 100 : 0
  }

  const classStats = useMemo(() => {
    const totalStudents = MOCK_STUDENTS.length
    let totalPresent = 0
    let totalAbsent = 0
    let totalLate = 0
    let totalJustified = 0
    MOCK_STUDENTS.forEach(s => {
      const status = studentAttendance[s.id]?.[selectedSession]
      if (status === 'present') totalPresent++
      else if (status === 'absent') totalAbsent++
      else if (status === 'late') totalLate++
      else if (status === 'justified') totalJustified++
    })
    const rate = totalStudents > 0 ? ((totalPresent + totalLate + totalJustified) / totalStudents) * 100 : 0
    return { totalPresent, totalAbsent, totalLate, totalJustified, rate, totalStudents }
  }, [studentAttendance, selectedSession])

  const handleStatusChange = (studentId: string, status: AttendanceStatus) => {
    setStudentAttendance(prev => ({
      ...prev,
      [studentId]: { ...prev[studentId], [selectedSession]: status },
    }))
  }

  const handleBulkAction = () => {
    if (!bulkAction) return
    const newAttendance = { ...studentAttendance }
    MOCK_STUDENTS.forEach(s => {
      newAttendance[s.id] = { ...newAttendance[s.id], [selectedSession]: bulkAction }
    })
    setStudentAttendance(newAttendance)
    toast.success(`Todos os alunos marcados como ${ATTENDANCE_STATUS_LABELS[bulkAction]}`)
    setBulkAction(null)
  }

  const handleSaveNote = () => {
    if (!selectedStudentForNote || !noteText.trim()) return
    setStudentNotes(prev => ({
      ...prev,
      [selectedStudentForNote.id]: { ...prev[selectedStudentForNote.id], [selectedSession]: noteText },
    }))
    toast.success('Observação salva')
    setNoteText('')
    setSelectedStudentForNote(null)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Frequência</h1>
          <p className="text-muted-foreground">Controle de presença e faltas</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="gap-2">
            <PenTool className="h-4 w-4" />
            Assinar Digitalmente
          </Button>
          <Button size="sm" className="gap-2 bg-emerald-600 hover:bg-emerald-700" onClick={() => toast.success('Frequência salva com sucesso!')}>
            <Save className="h-4 w-4" />
            Salvar
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-5">
        {[
          { label: 'Presentes', value: classStats.totalPresent, icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Ausentes', value: classStats.totalAbsent, icon: XCircle, color: 'text-red-600', bg: 'bg-red-50' },
          { label: 'Atrasados', value: classStats.totalLate, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
          { label: 'Justificados', value: classStats.totalJustified, icon: ShieldCheck, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Taxa Geral', value: formatPercentage(classStats.rate), icon: BarChart3, color: 'text-violet-600', bg: 'bg-violet-50' },
        ].map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-3">
              <div className="flex items-center gap-2">
                <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${stat.bg}`}>
                  <stat.icon className={`h-4 w-4 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-lg font-bold">{stat.value}</p>
                  <p className="text-[10px] text-muted-foreground">{stat.label}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Selectors */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-3">
            <Select value={selectedClass} onValueChange={setSelectedClass}>
              <SelectTrigger className="h-9 w-56">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {MOCK_CLASSES.map(c => (
                  <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedSession} onValueChange={setSelectedSession}>
              <SelectTrigger className="h-9 w-56">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {classSessions.map(s => (
                  <SelectItem key={s.id} value={s.id}>
                    {format(parseISO(s.date), "dd MMM yyyy", { locale: ptBR })} — {s.topic}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="relative flex-1 min-w-[150px] max-w-xs">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar aluno..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 h-9"
              />
            </div>
            <Select value={bulkAction || ''} onValueChange={(v) => setBulkAction(v as AttendanceStatus)}>
              <SelectTrigger className="h-9 w-40">
                <SelectValue placeholder="Marcar todos" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
                  <SelectItem key={key} value={key}>{cfg.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button size="sm" variant="outline" onClick={handleBulkAction} disabled={!bulkAction} className="h-9">
              Aplicar a Todos
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Student List */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Users className="h-4 w-4" />
            Lista de Alunos — {currentClass.name}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="max-h-[500px]">
            <div className="divide-y">
              <AnimatePresence>
                {filteredStudents.map((student, i) => {
                  const currentStatus = studentAttendance[student.id]?.[selectedSession]
                  const rate = calculateStudentRate(student.id)
                  const note = studentNotes[student.id]?.[selectedSession]
                  const cfg = currentStatus ? STATUS_CONFIG[currentStatus] : null
                  return (
                    <motion.div
                      key={student.id}
                      initial={{ opacity: 0, y: 3 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.02 }}
                      className="flex items-center gap-3 p-3 hover:bg-muted/30 transition-colors"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium truncate">{student.name}</p>
                          <span className="text-[10px] text-muted-foreground">{student.enrollmentNumber}</span>
                        </div>
                        {note && (
                          <p className="text-[10px] text-muted-foreground mt-0.5 flex items-center gap-1">
                            <AlertTriangle className="h-2.5 w-2.5" /> {note}
                          </p>
                        )}
                      </div>
                      <div className="hidden sm:flex items-center gap-2 w-32">
                        <Progress value={rate} className="h-2 flex-1" />
                        <span className="text-[10px] font-medium text-muted-foreground w-10 text-right">{formatPercentage(rate, 0)}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        {(Object.entries(STATUS_CONFIG) as [AttendanceStatus, typeof STATUS_CONFIG[AttendanceStatus]][]).map(([key, statusCfg]) => {
                          const isActive = currentStatus === key
                          return (
                            <Button
                              key={key}
                              size="sm"
                              variant={isActive ? 'default' : 'outline'}
                              className={`h-7 px-2 text-[11px] gap-1 ${
                                isActive ? `${statusCfg.bg} ${statusCfg.color} hover:${statusCfg.bg} border-current/20` : ''
                              }`}
                              onClick={() => handleStatusChange(student.id, key)}
                            >
                              <statusCfg.icon className="h-3 w-3" />
                              <span className="hidden sm:inline">{statusCfg.label}</span>
                            </Button>
                          )
                        })}
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => {
                          setSelectedStudentForNote(student)
                          setNoteText(studentNotes[student.id]?.[selectedSession] || '')
                        }}
                      >
                        <PenTool className="h-3.5 w-3.5" />
                      </Button>
                    </motion.div>
                  )
                })}
              </AnimatePresence>
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Attendance by Class */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Frequência por Turma
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2">
            {MOCK_CLASSES.map(cls => {
              const rate = 75 + Math.random() * 20
              return (
                <div key={cls.id} className="flex items-center gap-3 p-3 rounded-lg border">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{cls.name}</p>
                    <p className="text-xs text-muted-foreground">{cls.teacher}</p>
                  </div>
                  <div className="w-24">
                    <Progress value={rate} className="h-2.5" />
                    <p className={`text-xs font-medium mt-0.5 text-right ${rate >= 75 ? 'text-emerald-600' : 'text-red-600'}`}>
                      {formatPercentage(rate, 0)}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Note Dialog */}
      <Dialog open={!!selectedStudentForNote} onOpenChange={() => setSelectedStudentForNote(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Observação — {selectedStudentForNote?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Textarea
              placeholder="Adicionar observação (ex: motivo da falta, atraso, etc.)"
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              rows={3}
            />
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setSelectedStudentForNote(null)}>Cancelar</Button>
              <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={handleSaveNote}>
                <Save className="h-4 w-4 mr-1" />
                Salvar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
