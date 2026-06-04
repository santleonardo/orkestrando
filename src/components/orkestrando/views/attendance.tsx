'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { DataTable, type Column } from '@/components/orkestrando/shared/data-table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { ClipboardCheck, Save, Music, UserCheck } from 'lucide-react'
import { toast } from 'sonner'
import { format, parseISO } from 'date-fns'

const statusLabels: Record<string, string> = { PRESENT: 'Presente', ABSENT: 'Ausente', LATE: 'Atrasado', JUSTIFIED: 'Justificado' }
const statusColors: Record<string, string> = { PRESENT: 'bg-emerald-100 text-emerald-700', ABSENT: 'bg-red-100 text-red-700', LATE: 'bg-amber-100 text-amber-700', JUSTIFIED: 'bg-sky-100 text-sky-700' }

export function AttendanceView() {
  const queryClient = useQueryClient()
  const [selectedLessonId, setSelectedLessonId] = useState('')
  const [attendanceData, setAttendanceData] = useState<Record<string, string>>({})
  const [notesData, setNotesData] = useState<Record<string, string>>({})

  const { data: lessons } = useQuery({
    queryKey: ['attendance-lessons'],
    queryFn: () => api.get('/api/lessons?limit=50&status=SCHEDULED'),
  })

  const { data: enrollments } = useQuery({
    queryKey: ['attendance-enrollments', selectedLessonId],
    queryFn: () => {
      if (!selectedLessonId) return { data: [] }
      const lesson = lessons?.data?.find((l: Record<string, unknown>) => l.id === selectedLessonId)
      if (!lesson) return { data: [] }
      return api.get(`/api/enrollments?classId=${(lesson as Record<string, unknown>).classId}`)
    },
    enabled: !!selectedLessonId,
  })

  const { data: existingAttendance, refetch } = useQuery({
    queryKey: ['attendance-existing', selectedLessonId],
    queryFn: () => api.get(`/api/attendance?lessonId=${selectedLessonId}`),
    enabled: !!selectedLessonId,
  })

  const saveMutation = useMutation({
    mutationFn: (records: Array<{ studentId: string; status: string; notes?: string }>) =>
      api.post('/api/attendance', { lessonId: selectedLessonId, records }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['attendance-existing'] }); toast.success('Frequência registrada!') },
    onError: () => toast.error('Erro ao registrar frequência'),
  })

  const handleSave = () => {
    const students = enrollments?.data || []
    const records = students.map((e: Record<string, unknown>) => {
      const student = e.student as Record<string, unknown>
      const studentId = student.id as string
      return {
        studentId,
        status: attendanceData[studentId] || 'PRESENT',
        notes: notesData[studentId] || '',
      }
    })
    saveMutation.mutate(records)
  }

  // Initialize attendance data from existing records
  const existingRecords: Record<string, string> = {}
  const existingNotes: Record<string, string> = {}
  if (existingAttendance?.data) {
    (existingAttendance.data as Array<Record<string, unknown>>).forEach((r) => {
      const student = r.student as Record<string, unknown>
      existingRecords[student.id as string] = r.status as string
      existingNotes[student.id as string] = (r.notes as string) || ''
    })
  }

  const selectedLesson = lessons?.data?.find((l: Record<string, unknown>) => l.id === selectedLessonId)
  const students = enrollments?.data || []

  const presentCount = students.filter((e: Record<string, unknown>) => {
    const student = e.student as Record<string, unknown>
    const status = attendanceData[student.id as string] || existingRecords[student.id as string] || 'PRESENT'
    return status === 'PRESENT' || status === 'LATE'
  }).length

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold text-slate-900">Frequência</h2>
        <p className="text-sm text-slate-500">Registre a frequência dos alunos nas aulas</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Lesson Selector */}
        <Card className="lg:col-span-1 border-slate-200 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-slate-900">Selecionar Aula</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Select value={selectedLessonId} onValueChange={(v) => setSelectedLessonId(v)}>
              <SelectTrigger>
                <SelectValue placeholder="Escolha uma aula" />
              </SelectTrigger>
              <SelectContent>
                {(lessons?.data || []).slice(0, 20).map((l: Record<string, unknown>) => (
                  <SelectItem key={l.id as string} value={l.id as string}>
                    {format(parseISO(l.date as string), 'dd/MM')} - {(l.class as Record<string, unknown>)?.discipline?.name} ({l.startTime})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {selectedLesson && (
              <div className="space-y-2 text-sm">
                <div className="p-2 bg-slate-50 rounded-lg">
                  <p className="font-medium text-slate-900">{(selectedLesson.class as Record<string, unknown>)?.discipline?.name}</p>
                  <p className="text-xs text-slate-500">{format(parseISO(selectedLesson.date as string), 'dd/MM/yyyy')} - {selectedLesson.startTime} às {selectedLesson.endTime}</p>
                  <p className="text-xs text-slate-500">Sala: {(selectedLesson.room as Record<string, unknown>)?.name || '-'}</p>
                </div>
                <div className="flex items-center gap-2 text-emerald-600">
                  <UserCheck className="h-4 w-4" />
                  <span className="text-sm font-medium">{presentCount}/{students.length} presentes</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Attendance List */}
        <Card className="lg:col-span-3 border-slate-200 shadow-sm">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm text-slate-900">Lista de Frequência</CardTitle>
              {selectedLessonId && students.length > 0 && (
                <Button onClick={handleSave} className="bg-emerald-600 hover:bg-emerald-700 text-white h-8" disabled={saveMutation.isPending}>
                  <Save className="h-3.5 w-3.5 mr-1" /> Salvar
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {!selectedLessonId ? (
              <div className="text-center py-12 text-slate-400">
                <ClipboardCheck className="h-12 w-12 mx-auto mb-2 opacity-30" />
                <p className="text-sm">Selecione uma aula para registrar a frequência</p>
              </div>
            ) : students.length === 0 ? (
              <div className="text-center py-12 text-slate-400">
                <p className="text-sm">Nenhum aluno matriculado nesta turma</p>
              </div>
            ) : (
              <div className="space-y-2">
                {students.map((e: Record<string, unknown>) => {
                  const student = e.student as Record<string, unknown>
                  const studentId = student.id as string
                  const currentStatus = attendanceData[studentId] || existingRecords[studentId] || 'PRESENT'
                  const currentNotes = notesData[studentId] || existingNotes[studentId] || ''

                  return (
                    <div key={studentId} className={`flex items-center gap-3 p-3 rounded-lg border ${currentStatus === 'ABSENT' ? 'border-red-100 bg-red-50/50' : 'border-slate-100'}`}>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-900 truncate">{student.name as string}</p>
                        <p className="text-xs text-slate-500">{student.email as string}</p>
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        {Object.entries(statusLabels).map(([key, label]) => (
                          <Button
                            key={key}
                            variant="outline"
                            size="sm"
                            className={`h-7 px-2 text-xs ${currentStatus === key ? statusColors[key] + ' ring-1 ring-current' : ''}`}
                            onClick={() => setAttendanceData({ ...attendanceData, [studentId]: key })}
                          >
                            {label}
                          </Button>
                        ))}
                        <Textarea
                          placeholder="Obs..."
                          value={currentNotes}
                          onChange={(ev) => setNotesData({ ...notesData, [studentId]: ev.target.value })}
                          className="w-24 h-7 text-xs resize-none"
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
