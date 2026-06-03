'use client'

import { useState, useEffect } from 'react'
import {
  BarChart3, FileText, Download, Calendar, Filter, Search,
  TrendingUp, Users, BookOpen, Clock, AlertTriangle, Sparkles,
  Printer, ChevronDown, Loader2, RefreshCw,
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import {
  ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig,
} from '@/components/ui/chart'
import { Bar, BarChart, XAxis, YAxis, CartesianGrid, Line, LineChart, PieChart, Pie, Cell, ResponsiveContainer } from 'recharts'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

// ---------------------------------------------------------------------------
// Chart Data
// ---------------------------------------------------------------------------

const attendanceTrendData = [
  { month: 'Jan', rate: 92 }, { month: 'Feb', rate: 88 }, { month: 'Mar', rate: 91 },
  { month: 'Apr', rate: 85 }, { month: 'May', rate: 89 }, { month: 'Jun', rate: 93 },
  { month: 'Jul', rate: 90 }, { month: 'Aug', rate: 87 }, { month: 'Sep', rate: 94 },
  { month: 'Oct', rate: 91 }, { month: 'Nov', rate: 88 }, { month: 'Dec', rate: 85 },
]

const roomUtilData = [
  { name: 'Lab A', utilization: 92 }, { name: 'Lab B', utilization: 78 },
  { name: 'R-101', utilization: 85 }, { name: 'R-102', utilization: 64 },
  { name: 'Studio 1', utilization: 71 }, { name: 'Auditorium', utilization: 45 },
]

const teacherWorkloadData = [
  { name: 'Rodrigues', hours: 16, max: 20 }, { name: 'Mendes', hours: 12, max: 20 },
  { name: 'Ferreira', hours: 8, max: 16 }, { name: 'Almeida', hours: 10, max: 20 },
  { name: 'Costa', hours: 14, max: 20 }, { name: 'Lima', hours: 18, max: 20 },
  { name: 'Santos', hours: 10, max: 16 },
]

const evasionRiskData = [
  { name: 'Low', value: 65, fill: 'hsl(262, 83%, 78%)' },
  { name: 'Medium', value: 20, fill: 'hsl(262, 83%, 58%)' },
  { name: 'High', value: 12, fill: 'hsl(262, 83%, 38%)' },
  { name: 'Critical', value: 3, fill: 'hsl(0, 83%, 58%)' },
]

const studentGradeData = [
  { range: '9-10', count: 120 }, { range: '7-8.9', count: 280 }, { range: '5-6.9', count: 150 },
  { range: '3-4.9', count: 40 }, { range: '0-2.9', count: 15 },
]

const attendanceConfig = { rate: { label: 'Attendance %', color: 'hsl(262, 83%, 58%)' } } satisfies ChartConfig
const roomConfig = { utilization: { label: 'Utilization %', color: 'hsl(262, 83%, 58%)' } } satisfies ChartConfig
const evasionConfig = { value: { label: 'Students' } } satisfies ChartConfig
const gradeConfig = { count: { label: 'Students', color: 'hsl(262, 83%, 58%)' } } satisfies ChartConfig
const workConfig = { hours: { label: 'Hours', color: 'hsl(262, 83%, 58%)' } } satisfies ChartConfig

const REPORT_TYPES = [
  { id: 'frequency', label: 'Frequency Report', icon: BookOpen, desc: 'General, per class, per student attendance' },
  { id: 'evasion', label: 'Evasion Report', icon: AlertTriangle, desc: 'AI-powered dropout predictions' },
  { id: 'rooms', label: 'Room Utilization', icon: Clock, desc: 'Room usage and efficiency metrics' },
  { id: 'teachers', label: 'Teacher Workload', icon: Users, desc: 'Teaching hours and class distribution' },
  { id: 'monthly', label: 'Monthly Report', icon: Calendar, desc: 'Monthly summary of all activities' },
  { id: 'semestral', label: 'Semester Report', icon: FileText, desc: 'Complete semester overview' },
  { id: 'custom', label: 'Custom Report', icon: Sparkles, desc: 'Build your own report with filters' },
]

const FORMAT_OPTIONS = ['PDF', 'CSV', 'Excel']

export default function CoordinatorReportsPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')
  const [dateFrom, setDateFrom] = useState('2024-01-01')
  const [dateTo, setDateTo] = useState('2024-12-31')
  const [selectedReport, setSelectedReport] = useState<string | null>(null)
  const [exportFormat, setExportFormat] = useState('PDF')
  const [isGenerating, setIsGenerating] = useState(false)
  const [generateOpen, setGenerateOpen] = useState(false)
  const [customOpen, setCustomOpen] = useState(false)
  const [customFilters, setCustomFilters] = useState({ type: 'frequency', dateFrom: '', dateTo: '', classIds: '', teacherIds: '', includeCharts: true })

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1000)
    return () => clearTimeout(timer)
  }, [])

  const handleGenerate = async () => {
    setIsGenerating(true)
    await new Promise((r) => setTimeout(r, 3000))
    setIsGenerating(false)
    setGenerateOpen(false)
  }

  if (isLoading) return <div className="flex-1 space-y-6 p-6"><Skeleton className="h-10 w-48" /><Skeleton className="h-40 w-full" /><Skeleton className="h-96 w-full" /></div>

  return (
    <div className="flex-1 space-y-6 p-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-violet-700 to-purple-500 bg-clip-text text-transparent">Reports</h1>
          <p className="text-muted-foreground mt-1">Generate and view academic reports and analytics</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2">
            <Label className="text-sm">From:</Label>
            <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="w-36" />
            <Label className="text-sm">To:</Label>
            <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="w-36" />
          </div>
          <Button variant="outline" className="gap-2"><RefreshCw className="h-4 w-4" /> Refresh</Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="generate">Generate</TabsTrigger>
          <TabsTrigger value="custom">Custom Builder</TabsTrigger>
        </TabsList>

        {/* Overview */}
        <TabsContent value="overview" className="mt-4 space-y-6">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <Card className="border-violet-200 dark:border-violet-800/50">
              <CardHeader><CardTitle className="text-lg">Attendance Trend</CardTitle><CardDescription>Monthly attendance rate across all classes</CardDescription></CardHeader>
              <CardContent>
                <ChartContainer config={attendanceConfig} className="h-[300px] w-full">
                  <LineChart data={attendanceTrendData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" /><XAxis dataKey="month" className="text-xs" /><YAxis domain={[0, 100]} className="text-xs" />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Line type="monotone" dataKey="rate" stroke="hsl(262, 83%, 58%)" strokeWidth={2.5} dot={{ r: 4 }} />
                  </LineChart>
                </ChartContainer>
              </CardContent>
            </Card>

            <Card className="border-violet-200 dark:border-violet-800/50">
              <CardHeader><CardTitle className="text-lg">Evasion Risk Distribution</CardTitle><CardDescription>AI-powered risk assessment of all students</CardDescription></CardHeader>
              <CardContent>
                <ChartContainer config={evasionConfig} className="h-[300px] w-full">
                  <PieChart>
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Pie data={evasionRiskData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={3} dataKey="value" label={({ name, value }) => `${name}: ${value}%`}>
                      {evasionRiskData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                    </Pie>
                  </PieChart>
                </ChartContainer>
              </CardContent>
            </Card>

            <Card className="border-violet-200 dark:border-violet-800/50">
              <CardHeader><CardTitle className="text-lg">Room Utilization</CardTitle><CardDescription>Current utilization by room</CardDescription></CardHeader>
              <CardContent>
                <ChartContainer config={roomConfig} className="h-[300px] w-full">
                  <BarChart data={roomUtilData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" /><XAxis dataKey="name" className="text-xs" /><YAxis domain={[0, 100]} className="text-xs" />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="utilization" fill="hsl(262, 83%, 58%)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ChartContainer>
              </CardContent>
            </Card>

            <Card className="border-violet-200 dark:border-violet-800/50">
              <CardHeader><CardTitle className="text-lg">Teacher Workload</CardTitle><CardDescription>Hours assigned vs max hours per week</CardDescription></CardHeader>
              <CardContent>
                <ChartContainer config={workConfig} className="h-[300px] w-full">
                  <BarChart data={teacherWorkloadData} layout="vertical" margin={{ top: 5, right: 20, left: 40, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" /><XAxis type="number" domain={[0, 20]} className="text-xs" /><YAxis dataKey="name" type="category" className="text-xs" width={70} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="hours" fill="hsl(262, 83%, 58%)" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ChartContainer>
              </CardContent>
            </Card>

            <Card className="border-violet-200 dark:border-violet-800/50 lg:col-span-2">
              <CardHeader><CardTitle className="text-lg">Student Grade Distribution</CardTitle><CardDescription>GPA ranges across all active students</CardDescription></CardHeader>
              <CardContent>
                <ChartContainer config={gradeConfig} className="h-[300px] w-full">
                  <BarChart data={studentGradeData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" /><XAxis dataKey="range" className="text-xs" /><YAxis className="text-xs" />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="count" fill="hsl(262, 83%, 58%)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Generate */}
        <TabsContent value="generate" className="mt-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {REPORT_TYPES.map((report) => (
              <Card key={report.id} className="border-violet-200 dark:border-violet-800/50 hover:shadow-md transition-shadow cursor-pointer" onClick={() => { setSelectedReport(report.id); setGenerateOpen(true) }}>
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-violet-100 dark:bg-violet-900/50 shrink-0">
                      <report.icon className="h-6 w-6 text-violet-600 dark:text-violet-400" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-violet-900 dark:text-violet-100">{report.label}</h3>
                      <p className="text-sm text-muted-foreground mt-1">{report.desc}</p>
                      <div className="flex gap-2 mt-3">
                        {FORMAT_OPTIONS.map((fmt) => (
                          <Badge key={fmt} variant="outline" className="text-xs">{fmt}</Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Custom Builder */}
        <TabsContent value="custom" className="mt-4">
          <Card className="border-violet-200 dark:border-violet-800/50 max-w-2xl">
            <CardHeader><CardTitle>Custom Report Builder</CardTitle><CardDescription>Configure your report parameters and generate</CardDescription></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Report Type</Label><Select value={customFilters.type} onValueChange={(v) => setCustomFilters({ ...customFilters, type: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{REPORT_TYPES.map((r) => <SelectItem key={r.id} value={r.id}>{r.label}</SelectItem>)}</SelectContent></Select></div>
                <div className="space-y-2"><Label>Export Format</Label><Select value={exportFormat} onValueChange={setExportFormat}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{FORMAT_OPTIONS.map((f) => <SelectItem key={f} value={f}>{f}</SelectItem>)}</SelectContent></Select></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Start Date</Label><Input type="date" value={customFilters.dateFrom} onChange={(e) => setCustomFilters({ ...customFilters, dateFrom: e.target.value })} /></div>
                <div className="space-y-2"><Label>End Date</Label><Input type="date" value={customFilters.dateTo} onChange={(e) => setCustomFilters({ ...customFilters, dateTo: e.target.value })} /></div>
              </div>
              <div className="space-y-2"><Label>Class IDs (comma-separated, optional)</Label><Input placeholder="e.g. c1, c2, c3" value={customFilters.classIds} onChange={(e) => setCustomFilters({ ...customFilters, classIds: e.target.value })} /></div>
              <div className="space-y-2"><Label>Teacher IDs (comma-separated, optional)</Label><Input placeholder="e.g. t1, t2" value={customFilters.teacherIds} onChange={(e) => setCustomFilters({ ...customFilters, teacherIds: e.target.value })} /></div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2"><input type="checkbox" checked={customFilters.includeCharts} onChange={(e) => setCustomFilters({ ...customFilters, includeCharts: e.target.checked })} className="rounded border-violet-300" /><Label>Include charts and graphs</Label></div>
                <Button onClick={handleGenerate} disabled={isGenerating} className="gap-2 bg-violet-600 hover:bg-violet-700">
                  {isGenerating ? <><Loader2 className="h-4 w-4 animate-spin" />Generating...</> : <><Sparkles className="h-4 w-4" />Generate Report</>}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Generate Report Dialog */}
      <Dialog open={generateOpen} onOpenChange={setGenerateOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle className="text-violet-700">Generate Report</DialogTitle><DialogDescription>Configure and download your report.</DialogDescription></DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Report Type</Label>
              <p className="text-sm font-medium">{REPORT_TYPES.find((r) => r.id === selectedReport)?.label}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Start Date</Label><Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} /></div>
              <div className="space-y-2"><Label>End Date</Label><Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} /></div>
            </div>
            <div className="space-y-2">
              <Label>Format</Label>
              <Select value={exportFormat} onValueChange={setExportFormat}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{FORMAT_OPTIONS.map((f) => <SelectItem key={f} value={f}>{f}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setGenerateOpen(false)}>Cancel</Button>
            <Button onClick={handleGenerate} disabled={isGenerating} className="gap-2 bg-violet-600 hover:bg-violet-700">
              {isGenerating ? <><Loader2 className="h-4 w-4 animate-spin" />Generating...</> : <><Download className="h-4 w-4" />Generate & Download</>}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
