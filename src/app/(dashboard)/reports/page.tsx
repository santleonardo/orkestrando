'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import {
  BarChart3,
  LineChart,
  PieChart,
  TrendingUp,
  TrendingDown,
  Download,
  FileSpreadsheet,
  FileText,
  Calendar,
  Filter,
  RefreshCw,
  Clock,
  Users,
  GraduationCap,
  DoorOpen,
  AlertTriangle,
  Printer,
  Eye,
  ChevronRight,
  Zap,
  Target,
  Activity,
  CalendarDays,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Progress } from '@/components/ui/progress'
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from '@/components/ui/chart'
import { Bar, BarChart, XAxis, YAxis, CartesianGrid, Line, LineChart as RechartsLine, Pie, PieChart as RechartsPie, Cell, ResponsiveContainer, Area, AreaChart } from 'recharts'
import { formatPercentage, formatNumber } from '@/lib/utils/format'
import { toast } from 'sonner'

const COLORS = ['#10b981', '#8b5cf6', '#f59e0b', '#ef4444', '#06b6d4', '#ec4899', '#6366f1', '#14b8a6']

const attendanceData = [
  { month: 'Jan', presente: 92, ausente: 8 },
  { month: 'Fev', presente: 88, ausente: 12 },
  { month: 'Mar', presente: 95, ausente: 5 },
  { month: 'Abr', presente: 91, ausente: 9 },
  { month: 'Mai', presente: 87, ausente: 13 },
  { month: 'Jun', presente: 93, ausente: 7 },
  { month: 'Jul', presente: 90, ausente: 10 },
  { month: 'Ago', presente: 94, ausente: 6 },
  { month: 'Set', presente: 89, ausente: 11 },
  { month: 'Out', presente: 92, ausente: 8 },
  { month: 'Nov', presente: 96, ausente: 4 },
  { month: 'Dez', presente: 85, ausente: 15 },
]

const roomUsageData = [
  { name: 'Sala 101', utilizacao: 85, capacity: 30 },
  { name: 'Sala 202', utilizacao: 72, capacity: 25 },
  { name: 'Auditório', utilizacao: 45, capacity: 100 },
  { name: 'Lab Música', utilizacao: 90, capacity: 20 },
  { name: 'Sala 303', utilizacao: 60, capacity: 35 },
  { name: 'Lab Dança', utilizacao: 78, capacity: 15 },
]

const teachingHoursData = [
  { month: 'Jan', horas: 320 },
  { month: 'Fev', horas: 290 },
  { month: 'Mar', horas: 350 },
  { month: 'Abr', horas: 310 },
  { month: 'Mai', horas: 280 },
  { month: 'Jun', horas: 340 },
  { month: 'Jul', horas: 200 },
  { month: 'Ago', horas: 360 },
  { month: 'Set', horas: 330 },
  { month: 'Out', horas: 300 },
  { month: 'Nov', horas: 370 },
  { month: 'Dez', horas: 250 },
]

const dropoutData = [
  { name: 'Música', evasao: 5 },
  { name: 'Teatro', evasao: 8 },
  { name: 'Dança', evasao: 12 },
  { name: 'Artes', evasao: 3 },
  { name: 'Canto', evasao: 7 },
  { name: 'Composição', evasao: 10 },
]

const courseDistribution = [
  { name: 'Música', value: 35, fill: '#10b981' },
  { name: 'Teatro', value: 20, fill: '#8b5cf6' },
  { name: 'Dança', value: 18, fill: '#f59e0b' },
  { name: 'Artes Visuais', value: 15, fill: '#ef4444' },
  { name: 'Canto', value: 12, fill: '#06b6d4' },
]

const attendanceChartConfig = {
  presente: { label: 'Presença (%)', color: '#10b981' },
  ausente: { label: 'Ausência (%)', color: '#ef4444' },
}

const roomChartConfig = {
  utilizacao: { label: 'Utilização (%)', color: '#8b5cf6' },
}

const hoursChartConfig = {
  horas: { label: 'Horas Ministradas', color: '#f59e0b' },
}

const dropoutChartConfig = {
  evasao: { label: 'Taxa de Evasão (%)', color: '#ef4444' },
}

const REPORT_TYPES = [
  {
    id: 'attendance',
    title: 'Taxa de Presença',
    description: 'Relatório detalhado de frequência por turma, aluno e período',
    icon: Activity,
    color: 'text-emerald-600',
    bg: 'bg-emerald-50',
  },
  {
    id: 'dropout',
    title: 'Taxa de Evasão',
    description: 'Análise de evasão por curso com indicadores de risco',
    icon: AlertTriangle,
    color: 'text-red-600',
    bg: 'bg-red-50',
  },
  {
    id: 'rooms',
    title: 'Utilização de Salas',
    description: 'Ocupação e disponibilidade das salas por horário',
    icon: DoorOpen,
    color: 'text-violet-600',
    bg: 'bg-violet-50',
  },
  {
    id: 'hours',
    title: 'Horas Ministradas',
    description: 'Total de horas por professor, turma e disciplina',
    icon: Clock,
    color: 'text-amber-600',
    bg: 'bg-amber-50',
  },
  {
    id: 'monthly',
    title: 'Relatório Mensal',
    description: 'Resumo mensal de todas as métricas acadêmicas',
    icon: CalendarDays,
    color: 'text-cyan-600',
    bg: 'bg-cyan-50',
  },
  {
    id: 'semester',
    title: 'Relatório Semestral',
    description: 'Análise completa do semestre letivo',
    icon: Target,
    color: 'text-pink-600',
    bg: 'bg-pink-50',
  },
]

export default function ReportsPage() {
  const [selectedPeriod, setSelectedPeriod] = useState('2025')
  const [selectedSemester, setSelectedSemester] = useState('all')
  const [selectedReport, setSelectedReport] = useState<string | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)

  const handleGenerate = (type: string) => {
    setIsGenerating(true)
    toast.info('Gerando relatório...')
    setTimeout(() => {
      setIsGenerating(false)
      toast.success(`Relatório "${type}" gerado com sucesso!`)
    }, 2000)
  }

  const handleExport = (format: string) => {
    toast.success(`Exportando relatório em ${format.toUpperCase()}...`)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Relatórios</h1>
          <p className="text-muted-foreground">Análises e indicadores acadêmicos</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="h-9 w-28">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="2025">2025</SelectItem>
              <SelectItem value="2024">2024</SelectItem>
              <SelectItem value="2023">2023</SelectItem>
            </SelectContent>
          </Select>
          <Select value={selectedSemester} onValueChange={setSelectedSemester}>
            <SelectTrigger className="h-9 w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos Semestres</SelectItem>
              <SelectItem value="1">1º Semestre</SelectItem>
              <SelectItem value="2">2º Semestre</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid gap-4 sm:grid-cols-4">
        {[
          { label: 'Presença Geral', value: '91,2%', change: '+2.1%', trend: 'up', icon: Activity, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Evasão Total', value: '7,5%', change: '-1.3%', trend: 'down', icon: AlertTriangle, color: 'text-red-600', bg: 'bg-red-50' },
          { label: 'Salas em Uso', value: '78%', change: '+5%', trend: 'up', icon: DoorOpen, color: 'text-violet-600', bg: 'bg-violet-50' },
          { label: 'Horas/Mês', value: '312h', change: '+8%', trend: 'up', icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
        ].map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${stat.bg}`}>
                  <stat.icon className={`h-4 w-4 ${stat.color}`} />
                </div>
                <div className={`flex items-center gap-0.5 text-xs font-medium ${stat.trend === 'up' ? 'text-emerald-600' : 'text-red-600'}`}>
                  {stat.trend === 'up' ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                  {stat.change}
                </div>
              </div>
              <p className="text-2xl font-bold">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Report Type Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {REPORT_TYPES.map((report, i) => (
          <motion.div
            key={report.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Card className="cursor-pointer hover:shadow-md transition-shadow h-full" onClick={() => setSelectedReport(report.id)}>
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${report.bg} shrink-0`}>
                    <report.icon className={`h-5 w-5 ${report.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm">{report.title}</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">{report.description}</p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0 mt-1" />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Charts Section */}
      <Tabs defaultValue="attendance" className="space-y-4">
        <TabsList>
          <TabsTrigger value="attendance">Presença</TabsTrigger>
          <TabsTrigger value="dropout">Evasão</TabsTrigger>
          <TabsTrigger value="rooms">Salas</TabsTrigger>
          <TabsTrigger value="hours">Horas</TabsTrigger>
          <TabsTrigger value="distribution">Distribuição</TabsTrigger>
        </TabsList>

        <TabsContent value="attendance">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">Taxa de Presença Mensal</CardTitle>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleExport('pdf')}>
                      <Download className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleExport('xlsx')}>
                      <FileSpreadsheet className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <ChartContainer config={attendanceChartConfig} className="h-[300px] w-full">
                  <BarChart data={attendanceData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <ChartLegend content={<ChartLegendContent />} />
                    <Bar dataKey="presente" fill="#10b981" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="ausente" fill="#ef4444" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ChartContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Presença por Turma (Atual)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { name: 'Música - 2025/1', rate: 95, students: 28 },
                    { name: 'Teatro - 2025/1', rate: 88, students: 22 },
                    { name: 'Dança - 2025/2', rate: 82, students: 18 },
                    { name: 'Artes Visuais - 2025/1', rate: 93, students: 25 },
                    { name: 'Canto - 2025/1', rate: 79, students: 15 },
                    { name: 'Composição - 2025/2', rate: 91, students: 20 },
                  ].map(cls => (
                    <div key={cls.name} className="space-y-1.5">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium">{cls.name}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">{cls.students} alunos</span>
                          <span className={`font-semibold ${cls.rate >= 85 ? 'text-emerald-600' : cls.rate >= 70 ? 'text-amber-600' : 'text-red-600'}`}>
                            {formatPercentage(cls.rate)}
                          </span>
                        </div>
                      </div>
                      <Progress value={cls.rate} className="h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="dropout">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Taxa de Evasão por Curso</CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer config={dropoutChartConfig} className="h-[300px] w-full">
                  <BarChart data={dropoutData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                    <XAxis type="number" domain={[0, 20]} tick={{ fontSize: 12 }} />
                    <YAxis dataKey="name" type="category" tick={{ fontSize: 12 }} width={90} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="evasao" fill="#ef4444" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ChartContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Alunos em Risco</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { name: 'Daniel Ferreira', course: 'Música', rate: 20, absences: 8 },
                    { name: 'Larissa Ribeiro', course: 'Dança', rate: 0, absences: 12 },
                    { name: 'Pedro Henrique', course: 'Teatro', rate: 45, absences: 6 },
                    { name: 'Amanda Souza', course: 'Canto', rate: 55, absences: 5 },
                  ].map(student => (
                    <div key={student.name} className="flex items-center gap-3 p-3 rounded-lg border">
                      <div className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold text-white ${
                        student.rate <= 30 ? 'bg-red-500' : student.rate <= 60 ? 'bg-amber-500' : 'bg-emerald-500'
                      }`}>
                        {student.rate <= 30 ? '!' : student.rate <= 60 ? '⚠' : '✓'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">{student.name}</p>
                        <p className="text-xs text-muted-foreground">{student.course}</p>
                      </div>
                      <div className="text-right">
                        <p className={`text-sm font-bold ${student.rate <= 30 ? 'text-red-600' : student.rate <= 60 ? 'text-amber-600' : 'text-emerald-600'}`}>
                          {formatPercentage(student.rate)}
                        </p>
                        <p className="text-[10px] text-muted-foreground">{student.absences} faltas</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="rooms">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Utilização de Salas</CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer config={roomChartConfig} className="h-[300px] w-full">
                  <BarChart data={roomUsageData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="utilizacao" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ChartContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Detalhes por Sala</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {roomUsageData.map(room => (
                    <div key={room.name} className="flex items-center gap-3 p-3 rounded-lg border">
                      <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${
                        room.utilizacao >= 80 ? 'bg-emerald-50 text-emerald-600' :
                        room.utilizacao >= 50 ? 'bg-amber-50 text-amber-600' :
                        'bg-red-50 text-red-600'
                      }`}>
                        <DoorOpen className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">{room.name}</p>
                        <p className="text-xs text-muted-foreground">Capacidade: {room.capacity}</p>
                      </div>
                      <div className="w-20">
                        <Progress value={room.utilizacao} className="h-2" />
                        <p className="text-xs font-medium mt-0.5 text-right">{formatPercentage(room.utilizacao)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="hours">
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Horas Ministradas por Mês</CardTitle>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" className="h-7 w-7"><Download className="h-3.5 w-3.5" /></Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ChartContainer config={hoursChartConfig} className="h-[350px] w-full">
                <AreaChart data={teachingHoursData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <defs>
                    <linearGradient id="hoursGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <Area type="monotone" dataKey="horas" stroke="#f59e0b" fill="url(#hoursGradient)" strokeWidth={2} />
                </AreaChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="distribution">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Distribuição de Alunos por Curso</CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer config={{}} className="h-[300px] w-full">
                  <RechartsPie>
                    <Pie
                      data={courseDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {courseDistribution.map((entry, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <ChartTooltip content={<ChartTooltipContent />} />
                  </RechartsPie>
                </ChartContainer>
                <div className="flex flex-wrap justify-center gap-3 mt-4">
                  {courseDistribution.map((item, i) => (
                    <div key={item.name} className="flex items-center gap-1.5 text-xs">
                      <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: COLORS[i] }} />
                      <span className="text-muted-foreground">{item.name}</span>
                      <span className="font-medium">{item.value}%</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Agendamento de Relatórios</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Configure relatórios automáticos para serem gerados periodicamente.
                  </p>
                  {[
                    { name: 'Relatório Mensal de Presença', freq: 'Todo dia 1º', active: true },
                    { name: 'Resumo Semanal', freq: 'Toda segunda-feira', active: true },
                    { name: 'Relatório Semestral Completo', freq: 'Ao final do semestre', active: false },
                    { name: 'Alerta de Evasão', freq: 'Semanal (se houver casos)', active: true },
                  ].map(item => (
                    <div key={item.name} className="flex items-center justify-between p-3 rounded-lg border">
                      <div>
                        <p className="text-sm font-medium">{item.name}</p>
                        <p className="text-xs text-muted-foreground">{item.freq}</p>
                      </div>
                      <Badge variant={item.active ? 'default' : 'secondary'} className={`text-xs ${item.active ? 'bg-emerald-100 text-emerald-700' : ''}`}>
                        {item.active ? 'Ativo' : 'Inativo'}
                      </Badge>
                    </div>
                  ))}
                  <Button className="w-full bg-emerald-600 hover:bg-emerald-700" size="sm">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Configurar Agendamentos
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
