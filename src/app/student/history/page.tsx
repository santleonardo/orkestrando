'use client'

import React from 'react'
import { motion } from 'framer-motion'
import {
  History,
  GraduationCap,
  Award,
  Clock,
  BookOpen,
  Download,
  CheckCircle2,
  Calendar,
  TrendingUp,
  ChevronDown,
  ChevronUp,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'

// ── Mock Data ──
interface CompletedSubject {
  name: string
  code: string
  grade: number
  maxGrade: number
  workload: number
  status: 'Aprovado' | 'Cursando'
}

interface SemesterData {
  id: string
  name: string
  period: string
  status: 'Cursando' | 'Concluído'
  gpa: number
  totalCredits: number
  subjects: CompletedSubject[]
}

const SEMESTERS: SemesterData[] = [
  {
    id: '1',
    name: '1º Semestre',
    period: '2024/1',
    status: 'Concluído',
    gpa: 8.2,
    totalCredits: 20,
    subjects: [
      { name: 'Introdução à Música', code: 'MUS001', grade: 8.5, maxGrade: 10, workload: 60, status: 'Aprovado' },
      { name: 'Teoria Musical I', code: 'MUS002', grade: 7.8, maxGrade: 10, workload: 60, status: 'Aprovado' },
      { name: 'Piano Básico I', code: 'MUS003', grade: 8.0, maxGrade: 10, workload: 60, status: 'Aprovado' },
      { name: 'Leitura Musical', code: 'MUS004', grade: 8.5, maxGrade: 10, workload: 30, status: 'Aprovado' },
    ],
  },
  {
    id: '2',
    name: '2º Semestre',
    period: '2024/2',
    status: 'Concluído',
    gpa: 8.9,
    totalCredits: 22,
    subjects: [
      { name: 'Teoria Musical II', code: 'MUS005', grade: 9.0, maxGrade: 10, workload: 60, status: 'Aprovado' },
      { name: 'Piano Básico II', code: 'MUS006', grade: 8.7, maxGrade: 10, workload: 60, status: 'Aprovado' },
      { name: 'História da Música I', code: 'MUS007', grade: 9.2, maxGrade: 10, workload: 60, status: 'Aprovado' },
      { name: 'Canto Coral I', code: 'MUS008', grade: 8.8, maxGrade: 10, workload: 30, status: 'Aprovado' },
    ],
  },
  {
    id: '3',
    name: '3º Semestre',
    period: '2025/1',
    status: 'Cursando',
    gpa: 8.7,
    totalCredits: 0,
    subjects: [
      { name: 'Teoria Musical', code: 'MUS101', grade: 9.2, maxGrade: 10, workload: 60, status: 'Cursando' },
      { name: 'Instrumento — Piano', code: 'MUS102', grade: 8.5, maxGrade: 10, workload: 60, status: 'Cursando' },
      { name: 'Coral', code: 'MUS103', grade: 9.8, maxGrade: 10, workload: 60, status: 'Cursando' },
      { name: 'História da Música', code: 'MUS104', grade: 7.5, maxGrade: 10, workload: 60, status: 'Cursando' },
      { name: 'Composição', code: 'MUS105', grade: 8.8, maxGrade: 10, workload: 60, status: 'Cursando' },
      { name: 'Percepção Musical', code: 'MUS106', grade: 8.4, maxGrade: 10, workload: 60, status: 'Cursando' },
    ],
  },
]

const ACADEMIC_SUMMARY = {
  totalSubjects: 14,
  completedSubjects: 8,
  overallGpa: 8.7,
  totalHoursCompleted: 360,
  totalHoursEnrolled: 720,
  academicStatus: 'Cursando',
  enrollmentDate: '2024-02-01',
  expectedCompletion: '2027-12-15',
}

function getStatusVariant(status: string) {
  switch (status) {
    case 'Concluído':
      return <Badge className="bg-teal-50 text-teal-700 border-teal-200 text-[10px]">Concluído</Badge>
    case 'Cursando':
      return <Badge className="bg-blue-50 text-blue-700 border-blue-200 text-[10px]">Cursando</Badge>
    case 'Aprovado':
      return <Badge className="bg-teal-50 text-teal-700 border-teal-200 text-[10px]">Aprovado</Badge>
    default:
      return <Badge variant="secondary" className="text-[10px]">{status}</Badge>
  }
}

function getGradeColor(grade: number): string {
  if (grade >= 9) return 'text-teal-600'
  if (grade >= 7) return 'text-emerald-600'
  if (grade >= 5) return 'text-amber-600'
  return 'text-red-600'
}

export default function HistoryPage() {
  const completedHours = ACADEMIC_SUMMARY.totalHoursCompleted
  const totalHours = ACADEMIC_SUMMARY.totalHoursEnrolled
  const progressPct = (completedHours / totalHours) * 100

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Histórico Acadêmico</h1>
          <p className="text-sm text-muted-foreground">Visualize seu histórico completo de disciplinas e semestres</p>
        </div>
        <Button variant="outline" size="sm" className="gap-2">
          <Download className="h-4 w-4" />
          Baixar Certificado
        </Button>
      </div>

      {/* Academic Summary */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className="overflow-hidden">
          <div className="bg-gradient-to-r from-teal-600 to-emerald-600 p-6 text-white">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm">
                  <Award className="h-8 w-8" />
                </div>
                <div>
                  <p className="text-teal-100 text-sm font-medium">Resumo Acadêmico</p>
                  <p className="text-4xl font-extrabold">CR {ACADEMIC_SUMMARY.overallGpa.toFixed(1)}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {[
                  { label: 'Disciplinas Concluídas', value: `${ACADEMIC_SUMMARY.completedSubjects}/${ACADEMIC_SUMMARY.totalSubjects}`, icon: BookOpen },
                  { label: 'Carga Horária', value: `${completedHours}h`, icon: Clock },
                  { label: 'Status', value: ACADEMIC_SUMMARY.academicStatus, icon: TrendingUp },
                ].map((stat) => (
                  <div key={stat.label} className="flex items-center gap-2.5">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/15">
                      <stat.icon className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-base font-bold">{stat.value}</p>
                      <p className="text-[10px] text-teal-200">{stat.label}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium">Progresso no Curso</p>
              <span className="text-sm font-semibold text-teal-600">{progressPct.toFixed(0)}%</span>
            </div>
            <Progress value={progressPct} className="h-3 [&>div]:bg-gradient-to-r [&>div]:from-teal-500 [&>div]:to-emerald-500" />
            <div className="flex items-center justify-between mt-2 text-[11px] text-muted-foreground">
              <span>Matrícula: Fevereiro 2024</span>
              <span>Previsão de conclusão: Dezembro 2027</span>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Semester Cards */}
      <div className="space-y-4">
        {SEMESTERS.map((semester, i) => (
          <motion.div
            key={semester.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + i * 0.08 }}
          >
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                      semester.status === 'Concluído'
                        ? 'bg-teal-50 text-teal-600'
                        : 'bg-blue-50 text-blue-600'
                    }`}>
                      {semester.status === 'Concluído'
                        ? <CheckCircle2 className="h-5 w-5" />
                        : <Calendar className="h-5 w-5" />
                      }
                    </div>
                    <div>
                      <CardTitle className="text-base">{semester.name} — {semester.period}</CardTitle>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {semester.subjects.length} disciplinas{semester.status === 'Concluído' ? ` • ${semester.totalCredits} créditos` : ''}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right hidden sm:block">
                      <p className="text-xs text-muted-foreground">CR do Semestre</p>
                      <p className={`text-lg font-bold ${getGradeColor(semester.gpa)}`}>{semester.gpa.toFixed(1)}</p>
                    </div>
                    {getStatusVariant(semester.status)}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {semester.subjects.map((subject) => (
                    <div
                      key={subject.code}
                      className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/30 transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={`flex h-8 w-8 items-center justify-center rounded-lg shrink-0 ${
                          subject.status === 'Aprovado' ? 'bg-teal-50' : 'bg-blue-50'
                        }`}>
                          <BookOpen className={`h-4 w-4 ${
                            subject.status === 'Aprovado' ? 'text-teal-600' : 'text-blue-600'
                          }`} />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium truncate">{subject.name}</p>
                          <p className="text-[11px] text-muted-foreground">{subject.code} • {subject.workload}h</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <span className={`text-sm font-bold ${getGradeColor(subject.grade)}`}>
                          {subject.grade.toFixed(1).replace('.', ',')}
                        </span>
                        <span className="text-xs text-muted-foreground">/10</span>
                        <div className="hidden sm:block">{getStatusVariant(subject.status)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Summary Stats */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              title: 'Total de Horas',
              value: `${completedHours}h`,
              desc: `de ${totalHours}h previstas`,
              icon: Clock,
              color: 'text-teal-600',
              bg: 'bg-teal-50',
            },
            {
              title: 'Maior Nota',
              value: '9,8',
              desc: 'Coral — 3º Semestre',
              icon: TrendingUp,
              color: 'text-emerald-600',
              bg: 'bg-emerald-50',
            },
            {
              title: 'Semestre Anterior',
              value: 'CR 8,9',
              desc: '2º Semestre — 2024/2',
              icon: GraduationCap,
              color: 'text-amber-600',
              bg: 'bg-amber-50',
            },
            {
              title: 'Aprovação',
              value: '100%',
              desc: '8 de 8 disciplinas',
              icon: Award,
              color: 'text-teal-600',
              bg: 'bg-teal-50',
            },
          ].map((stat, i) => (
            <Card key={stat.title}>
              <CardContent className="p-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${stat.bg}`}>
                    <stat.icon className={`h-5 w-5 ${stat.color}`} />
                  </div>
                  <p className="text-xs text-muted-foreground">{stat.title}</p>
                </div>
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-[11px] text-muted-foreground mt-1">{stat.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </motion.div>
    </div>
  )
}
