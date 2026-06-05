'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import {
  GraduationCap,
  Star,
  Upload,
  Download,
  TrendingUp,
  Award,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'

// ── Mock Data ──
interface SubjectGrade {
  subject: string
  code: string
  grade: number
  maxGrade: number
  status: 'Pendente' | 'Entregue' | 'Corrigido'
  date: string
}

interface AssignmentSubmission {
  id: string
  title: string
  subject: string
  dueDate: string
  submittedAt: string | null
  grade: number | null
  maxGrade: number
  status: 'pending' | 'submitted' | 'graded' | 'returned'
}

const GPA = 8.7
const CREDITS_COMPLETED = 42
const CREDITS_TOTAL = 60

const SUBJECT_GRADES: SubjectGrade[] = [
  { subject: 'Teoria Musical', code: 'MUS101', grade: 9.2, maxGrade: 10, status: 'Corrigido', date: '2025-01-10' },
  { subject: 'Instrumento — Piano', code: 'MUS102', grade: 8.5, maxGrade: 10, status: 'Corrigido', date: '2025-01-12' },
  { subject: 'Coral', code: 'MUS103', grade: 9.8, maxGrade: 10, status: 'Corrigido', date: '2025-01-14' },
  { subject: 'História da Música', code: 'MUS104', grade: 7.5, maxGrade: 10, status: 'Corrigido', date: '2025-01-08' },
  { subject: 'Composição', code: 'MUS105', grade: 8.8, maxGrade: 10, status: 'Corrigido', date: '2025-01-15' },
  { subject: 'Percepção Musical', code: 'MUS106', grade: 8.4, maxGrade: 10, status: 'Entregue', date: '2025-01-16' },
]

const ASSIGNMENTS: AssignmentSubmission[] = [
  { id: '1', title: 'Trabalho Prático — Harmonia', subject: 'Teoria Musical', dueDate: '2025-01-20', submittedAt: '2025-01-19T22:30:00', grade: 9.0, maxGrade: 10, status: 'graded' },
  { id: '2', title: 'Relatório de Estágio', subject: 'Instrumento — Piano', dueDate: '2025-01-25', submittedAt: '2025-01-24T18:00:00', grade: null, maxGrade: 10, status: 'submitted' },
  { id: '3', title: 'Análise de Coral — Bach', subject: 'Coral', dueDate: '2025-01-28', submittedAt: null, grade: null, maxGrade: 10, status: 'pending' },
  { id: '4', title: 'Prova de Teoria Musical', subject: 'Teoria Musical', dueDate: '2025-01-30', submittedAt: null, grade: null, maxGrade: 10, status: 'pending' },
  { id: '5', title: 'Composição Original', subject: 'Composição', dueDate: '2025-02-05', submittedAt: null, grade: null, maxGrade: 10, status: 'pending' },
  { id: '6', title: 'Exercícios de Ditado Musical', subject: 'Percepção Musical', dueDate: '2025-02-10', submittedAt: null, grade: null, maxGrade: 10, status: 'pending' },
]

const GRADE_DISTRIBUTION = [
  { range: '0-4', count: 0, fill: '#ef4444' },
  { range: '4-5', count: 0, fill: '#f97316' },
  { range: '5-6', count: 0, fill: '#f59e0b' },
  { range: '6-7', count: 1, fill: '#eab308' },
  { range: '7-8', count: 2, fill: '#84cc16' },
  { range: '8-9', count: 2, fill: '#22c55e' },
  { range: '9-10', count: 1, fill: '#10b981' },
]

function getStatusBadge(status: string) {
  switch (status) {
    case 'Corrigido':
      return <Badge className="bg-teal-50 text-teal-700 border-teal-200 text-[10px]">Corrigido</Badge>
    case 'Entregue':
      return <Badge className="bg-blue-50 text-blue-700 border-blue-200 text-[10px]">Entregue</Badge>
    case 'Pendente':
      return <Badge className="bg-amber-50 text-amber-700 border-amber-200 text-[10px]">Pendente</Badge>
    case 'submitted':
      return <Badge className="bg-blue-50 text-blue-700 border-blue-200 text-[10px]">Entregue</Badge>
    case 'graded':
      return <Badge className="bg-teal-50 text-teal-700 border-teal-200 text-[10px]">Corrigido</Badge>
    case 'pending':
      return <Badge className="bg-amber-50 text-amber-700 border-amber-200 text-[10px]">Pendente</Badge>
    default:
      return <Badge variant="secondary" className="text-[10px]">{status}</Badge>
  }
}

function getGradeColor(grade: number, maxGrade: number): string {
  const pct = grade / maxGrade
  if (pct >= 0.9) return 'text-teal-600'
  if (pct >= 0.7) return 'text-amber-600'
  return 'text-red-600'
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })
}

export default function GradesPage() {
  const [semester, setSemester] = useState('2025-1')
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Notas e Avaliações</h1>
          <p className="text-sm text-muted-foreground">Acompanhe seu desempenho acadêmico</p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={semester} onValueChange={setSemester}>
            <SelectTrigger className="w-[160px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="2025-1">2025/1 — Atual</SelectItem>
              <SelectItem value="2024-2">2024/2</SelectItem>
              <SelectItem value="2024-1">2024/1</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* GPA Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          {
            title: 'CR (Coeficiente de Rendimento)',
            value: GPA.toFixed(1),
            icon: Star,
            color: 'text-amber-600',
            bg: 'bg-amber-50',
            desc: 'Máximo: 10.0',
          },
          {
            title: 'Créditos Concluídos',
            value: `${CREDITS_COMPLETED}`,
            icon: Award,
            color: 'text-teal-600',
            bg: 'bg-teal-50',
            desc: `de ${CREDITS_TOTAL} totais`,
          },
          {
            title: 'Disciplinas Aprovadas',
            value: '5',
            icon: CheckCircle2,
            color: 'text-teal-600',
            bg: 'bg-teal-50',
            desc: 'de 6 cursando',
          },
          {
            title: 'Pendências',
            value: '2',
            icon: AlertCircle,
            color: 'text-amber-600',
            bg: 'bg-amber-50',
            desc: 'Trabalhos a entregar',
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
          </motion.div>
        ))}
      </div>

      {/* Progress towards graduation */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
      >
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium">Progresso para Conclusão</p>
              <span className="text-sm font-semibold text-teal-600">{((CREDITS_COMPLETED / CREDITS_TOTAL) * 100).toFixed(0)}%</span>
            </div>
            <Progress value={(CREDITS_COMPLETED / CREDITS_TOTAL) * 100} className="h-3 [&>div]:bg-gradient-to-r [&>div]:from-teal-500 [&>div]:to-emerald-500" />
            <p className="text-xs text-muted-foreground mt-2">{CREDITS_COMPLETED} de {CREDITS_TOTAL} créditos concluídos</p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Tabs: Grades Table & Assignments */}
      <Tabs defaultValue="grades" className="space-y-6">
        <TabsList>
          <TabsTrigger value="grades">Notas por Disciplina</TabsTrigger>
          <TabsTrigger value="assignments">Trabalhos</TabsTrigger>
          <TabsTrigger value="chart">Distribuição</TabsTrigger>
        </TabsList>

        {/* Grades Table */}
        <TabsContent value="grades">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Disciplina</TableHead>
                      <TableHead className="text-center">Nota</TableHead>
                      <TableHead className="text-center">Máx.</TableHead>
                      <TableHead className="text-center hidden sm:table-cell">Data</TableHead>
                      <TableHead className="text-center">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {SUBJECT_GRADES.map((item) => (
                      <TableRow key={item.code}>
                        <TableCell>
                          <div>
                            <p className="text-sm font-medium">{item.subject}</p>
                            <p className="text-[11px] text-muted-foreground">{item.code}</p>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <span className={`text-sm font-bold ${getGradeColor(item.grade, item.maxGrade)}`}>
                            {item.grade.toFixed(1).replace('.', ',')}
                          </span>
                        </TableCell>
                        <TableCell className="text-center text-sm text-muted-foreground">
                          {item.maxGrade.toFixed(1).replace('.', ',')}
                        </TableCell>
                        <TableCell className="text-center text-xs text-muted-foreground hidden sm:table-cell">
                          {formatDate(item.date)}
                        </TableCell>
                        <TableCell className="text-center">{getStatusBadge(item.status)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        {/* Assignments */}
        <TabsContent value="assignments">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex justify-end mb-4">
              <Button size="sm" className="gap-2 bg-teal-600 hover:bg-teal-700" onClick={() => setUploadDialogOpen(true)}>
                <Upload className="h-4 w-4" />
                Enviar Trabalho
              </Button>
            </div>
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Trabalho</TableHead>
                      <TableHead className="hidden sm:table-cell">Disciplina</TableHead>
                      <TableHead className="text-center hidden md:table-cell">Prazo</TableHead>
                      <TableHead className="text-center">Nota</TableHead>
                      <TableHead className="text-center">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {ASSIGNMENTS.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                            <div>
                              <p className="text-sm font-medium">{item.title}</p>
                              {item.submittedAt && (
                                <p className="text-[10px] text-muted-foreground">
                                  Entregue em {new Date(item.submittedAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                </p>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="hidden sm:table-cell text-xs text-muted-foreground">{item.subject}</TableCell>
                        <TableCell className="text-center hidden md:table-cell text-xs text-muted-foreground">{formatDate(item.dueDate)}</TableCell>
                        <TableCell className="text-center">
                          {item.grade !== null ? (
                            <span className={`text-sm font-bold ${getGradeColor(item.grade, item.maxGrade)}`}>
                              {item.grade.toFixed(1).replace('.', ',')}
                            </span>
                          ) : (
                            <span className="text-xs text-muted-foreground">—</span>
                          )}
                        </TableCell>
                        <TableCell className="text-center">{getStatusBadge(item.status)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        {/* Grade Distribution Chart */}
        <TabsContent value="chart">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Distribuição de Notas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[320px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={GRADE_DISTRIBUTION} margin={{ top: 20, right: 20, bottom: 5, left: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="range" tick={{ fontSize: 12 }} className="text-muted-foreground" />
                      <YAxis allowDecimals={false} tick={{ fontSize: 12 }} className="text-muted-foreground" />
                      <Tooltip
                        contentStyle={{
                          borderRadius: '8px',
                          border: '1px solid hsl(var(--border))',
                          backgroundColor: 'hsl(var(--card))',
                        }}
                        formatter={(value: number) => [`${value} disciplina(s)`, 'Quantidade']}
                        labelFormatter={(label) => `Nota: ${label}`}
                      />
                      <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                        {GRADE_DISTRIBUTION.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>
      </Tabs>

      {/* Upload Assignment Dialog */}
      <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Enviar Trabalho</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Trabalho</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o trabalho" />
                </SelectTrigger>
                <SelectContent>
                  {ASSIGNMENTS.filter(a => a.status === 'pending').map((a) => (
                    <SelectItem key={a.id} value={a.id}>{a.title}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Observações (opcional)</Label>
              <Textarea placeholder="Adicione observações para o professor..." rows={3} />
            </div>
            <div className="space-y-2">
              <Label>Arquivo</Label>
              <div className="border-2 border-dashed rounded-lg p-6 text-center hover:bg-muted/50 transition-colors cursor-pointer">
                <Upload className="h-8 w-8 text-muted-foreground/50 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Clique ou arraste o arquivo aqui</p>
                <p className="text-xs text-muted-foreground mt-1">PDF, DOCX, PPTX, ZIP — máx. 50MB</p>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setUploadDialogOpen(false)}>Cancelar</Button>
            <Button className="bg-teal-600 hover:bg-teal-700">Enviar Trabalho</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
