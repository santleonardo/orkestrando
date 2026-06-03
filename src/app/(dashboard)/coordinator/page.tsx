'use client'

import { useState, useEffect } from 'react'
import {
  Users,
  GraduationCap,
  BookOpen,
  CalendarDays,
  BarChart3,
  AlertTriangle,
  Clock,
  TrendingUp,
  TrendingDown,
  Bell,
  ChevronRight,
  Activity,
  DoorOpen,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  Download,
  Filter,
  Search,
  CheckCircle2,
  XCircle,
  MessageSquare,
  ClipboardCheck,
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Progress } from '@/components/ui/progress'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart'
import {
  Bar,
  BarChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Line,
  LineChart,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
} from 'recharts'
import Link from 'next/link'
import { cn } from '@/lib/utils'

// ---------------------------------------------------------------------------
// Mock data
// ---------------------------------------------------------------------------

const kpiData = {
  totalStudents: { value: 1247, change: 5.2, trend: 'up' as const },
  totalProfessors: { value: 84, change: 2.1, trend: 'up' as const },
  activeClasses: { value: 156, change: -1.3, trend: 'down' as const },
  roomUtilization: { value: 78, change: 3.4, trend: 'up' as const },
}

const attendanceChartData = [
  { month: 'Jan', present: 92, absent: 8 },
  { month: 'Feb', present: 88, absent: 12 },
  { month: 'Mar', present: 91, absent: 9 },
  { month: 'Apr', present: 85, absent: 15 },
  { month: 'May', present: 89, absent: 11 },
  { month: 'Jun', present: 93, absent: 7 },
  { month: 'Jul', present: 90, absent: 10 },
  { month: 'Aug', present: 87, absent: 13 },
  { month: 'Sep', present: 94, absent: 6 },
  { month: 'Oct', present: 91, absent: 9 },
  { month: 'Nov', present: 88, absent: 12 },
  { month: 'Dec', present: 85, absent: 15 },
]

const roomUtilData = [
  { name: 'Lab A', utilization: 92 },
  { name: 'Lab B', utilization: 78 },
  { name: 'Room 101', utilization: 85 },
  { name: 'Room 102', utilization: 64 },
  { name: 'Auditorium', utilization: 45 },
  { name: 'Studio 1', utilization: 71 },
]

const recentEnrollments = [
  { id: '1', student: 'Ana Silva', course: 'Computer Science', class: 'Data Structures', date: '2024-01-15', status: 'ACTIVE' },
  { id: '2', student: 'Carlos Oliveira', course: 'Engineering', class: 'Calculus II', date: '2024-01-14', status: 'ACTIVE' },
  { id: '3', student: 'Maria Santos', course: 'Design', class: 'UX Fundamentals', date: '2024-01-14', status: 'ACTIVE' },
  { id: '4', student: 'João Lima', course: 'Computer Science', class: 'Algorithms', date: '2024-01-13', status: 'ACTIVE' },
  { id: '5', student: 'Beatriz Costa', course: 'Medicine', class: 'Anatomy I', date: '2024-01-13', status: 'DROPPED' },
]

const upcomingSessions = [
  { id: '1', subject: 'Data Structures', teacher: 'Prof. Rodrigues', room: 'Lab A', time: '08:00 - 09:50', date: 'Today' },
  { id: '2', subject: 'Calculus II', teacher: 'Prof. Mendes', room: 'Room 101', time: '10:00 - 11:50', date: 'Today' },
  { id: '3', subject: 'UX Fundamentals', teacher: 'Prof. Ferreira', room: 'Studio 1', time: '14:00 - 15:50', date: 'Today' },
  { id: '4', subject: 'Algorithms', teacher: 'Prof. Rodrigues', room: 'Lab B', time: '08:00 - 09:50', date: 'Tomorrow' },
  { id: '5', subject: 'Physics I', teacher: 'Prof. Almeida', room: 'Room 102', time: '10:00 - 11:50', date: 'Tomorrow' },
]

const alerts = [
  { id: '1', type: 'warning' as const, title: 'Schedule Conflict', description: 'Room 101 double-booked on Monday 10:00 - Calculus II and Physics I', time: '2 hours ago' },
  { id: '2', type: 'error' as const, title: 'Low Attendance Alert', description: 'UX Fundamentals attendance dropped below 70% threshold', time: '5 hours ago' },
  { id: '3', type: 'warning' as const, title: 'Evasion Risk', description: '3 students in Computer Science flagged with high evasion risk', time: '1 day ago' },
  { id: '4', type: 'info' as const, title: 'Teacher Availability', description: 'Prof. Mendes submitted availability for next semester', time: '1 day ago' },
  { id: '5', type: 'success' as const, title: 'Report Generated', description: 'Monthly attendance report for January is ready', time: '2 days ago' },
]

// ---------------------------------------------------------------------------
// Chart configs
// ---------------------------------------------------------------------------

const attendanceChartConfig = {
  present: { label: 'Present', color: 'hsl(262, 83%, 58%)' },
  absent: { label: 'Absent', color: 'hsl(262, 83%, 88%)' },
} satisfies ChartConfig

const roomUtilChartConfig = {
  utilization: { label: 'Utilization %', color: 'hsl(262, 83%, 58%)' },
} satisfies ChartConfig

const PIE_COLORS = ['hsl(262, 83%, 58%)', 'hsl(262, 83%, 78%)', 'hsl(262, 83%, 88%)', 'hsl(262, 60%, 68%)']

const distributionData = [
  { name: 'Computer Science', value: 340 },
  { name: 'Engineering', value: 280 },
  { name: 'Medicine', value: 220 },
  { name: 'Design', value: 150 },
]

const distributionConfig = {
  'Computer Science': { label: 'CS', color: PIE_COLORS[0] },
  'Engineering': { label: 'Eng', color: PIE_COLORS[1] },
  Medicine: { label: 'Med', color: PIE_COLORS[2] },
  Design: { label: 'Des', color: PIE_COLORS[3] },
} satisfies ChartConfig

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function CoordinatorDashboardPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1200)
    return () => clearTimeout(timer)
  }, [])

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const getAlertColor = (type: string) => {
    switch (type) {
      case 'error': return 'border-red-300 bg-red-50 dark:bg-red-950/20'
      case 'warning': return 'border-yellow-300 bg-yellow-50 dark:bg-yellow-950/20'
      case 'success': return 'border-green-300 bg-green-50 dark:bg-green-950/20'
      default: return 'border-violet-300 bg-violet-50 dark:bg-violet-950/20'
    }
  }

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'error': return <XCircle className="h-5 w-5 text-red-500" />
      case 'warning': return <AlertTriangle className="h-5 w-5 text-yellow-500" />
      case 'success': return <CheckCircle2 className="h-5 w-5 text-green-500" />
      default: return <Bell className="h-5 w-5 text-violet-500" />
    }
  }

  if (isLoading) {
    return (
      <div className="flex-1 space-y-6 p-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 w-24 rounded bg-muted mb-4" />
                <div className="h-8 w-16 rounded bg-muted mb-2" />
                <div className="h-3 w-32 rounded bg-muted" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-violet-700 to-purple-500 bg-clip-text text-transparent">
            Coordinator Dashboard
          </h1>
          <p className="text-muted-foreground mt-1">
            Overview of your academic institution management
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar..."
              className="pl-9 w-64"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button variant="outline" size="icon">
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button size="icon" className="bg-violet-600 hover:bg-violet-700">
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-violet-200 dark:border-violet-800/50 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-100 dark:bg-violet-900/50">
                  <Users className="h-5 w-5 text-violet-600 dark:text-violet-400" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Students</p>
                  <p className="text-2xl font-bold">{kpiData.totalStudents.value.toLocaleString()}</p>
                </div>
              </div>
              <Badge
                variant="secondary"
                className={cn(
                  'gap-1 text-xs',
                  kpiData.totalStudents.trend === 'up' ? 'text-green-600 bg-green-100 dark:bg-green-950/30' : 'text-red-600 bg-red-100 dark:bg-red-950/30'
                )}
              >
                {kpiData.totalStudents.trend === 'up' ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                {kpiData.totalStudents.change}%
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="border-violet-200 dark:border-violet-800/50 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-900/50">
                  <GraduationCap className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Professors</p>
                  <p className="text-2xl font-bold">{kpiData.totalProfessors.value}</p>
                </div>
              </div>
              <Badge variant="secondary" className="gap-1 text-xs text-green-600 bg-green-100 dark:bg-green-950/30">
                <ArrowUpRight className="h-3 w-3" />
                {kpiData.totalProfessors.change}%
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="border-violet-200 dark:border-violet-800/50 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-100 dark:bg-indigo-900/50">
                  <CalendarDays className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Active Classes</p>
                  <p className="text-2xl font-bold">{kpiData.activeClasses.value}</p>
                </div>
              </div>
              <Badge variant="secondary" className="gap-1 text-xs text-red-600 bg-red-100 dark:bg-red-950/30">
                <ArrowDownRight className="h-3 w-3" />
                {Math.abs(kpiData.activeClasses.change)}%
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="border-violet-200 dark:border-violet-800/50 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-fuchsia-100 dark:bg-fuchsia-900/50">
                  <DoorOpen className="h-5 w-5 text-fuchsia-600 dark:text-fuchsia-400" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Room Utilization</p>
                  <p className="text-2xl font-bold">{kpiData.roomUtilization.value}%</p>
                </div>
              </div>
              <Badge variant="secondary" className="gap-1 text-xs text-green-600 bg-green-100 dark:bg-green-950/30">
                <ArrowUpRight className="h-3 w-3" />
                {kpiData.roomUtilization.change}%
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Attendance Overview */}
        <Card className="lg:col-span-2 border-violet-200 dark:border-violet-800/50">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">Attendance Overview</CardTitle>
                <CardDescription>Monthly attendance rates across all classes</CardDescription>
              </div>
              <Tabs defaultValue="monthly">
                <TabsList className="h-8">
                  <TabsTrigger value="monthly" className="text-xs">Monthly</TabsTrigger>
                  <TabsTrigger value="weekly" className="text-xs">Weekly</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </CardHeader>
          <CardContent>
            <ChartContainer config={attendanceChartConfig} className="h-[300px] w-full">
              <LineChart data={attendanceChartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="month" className="text-xs" />
                <YAxis className="text-xs" domain={[0, 100]} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line
                  type="monotone"
                  dataKey="present"
                  stroke="hsl(262, 83%, 58%)"
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: 'hsl(262, 83%, 58%)' }}
                  activeDot={{ r: 6, fill: 'hsl(262, 83%, 58%)' }}
                />
                <Line
                  type="monotone"
                  dataKey="absent"
                  stroke="hsl(262, 83%, 88%)"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={{ r: 3, fill: 'hsl(262, 83%, 88%)' }}
                />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Student Distribution */}
        <Card className="border-violet-200 dark:border-violet-800/50">
          <CardHeader>
            <CardTitle className="text-lg">Student Distribution</CardTitle>
            <CardDescription>By course program</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-center">
            <ChartContainer config={distributionConfig} className="h-[250px] w-full">
              <PieChart>
                <ChartTooltip content={<ChartTooltipContent />} />
                <Pie
                  data={distributionData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={95}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {distributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
              </PieChart>
            </ChartContainer>
          </CardContent>
          <CardContent className="px-6 pb-4">
            <div className="space-y-2">
              {distributionData.map((item, index) => (
                <div key={item.name} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full" style={{ backgroundColor: PIE_COLORS[index] }} />
                    <span className="text-muted-foreground">{item.name}</span>
                  </div>
                  <span className="font-medium">{item.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Room Utilization Chart */}
      <Card className="border-violet-200 dark:border-violet-800/50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">Room Utilization</CardTitle>
              <CardDescription>Current utilization percentage by room</CardDescription>
            </div>
            <Link href="/coordinator/rooms">
              <Button variant="ghost" size="sm" className="gap-1 text-violet-600">
                View All <ChevronRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          <ChartContainer config={roomUtilChartConfig} className="h-[250px] w-full">
            <BarChart data={roomUtilData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="name" className="text-xs" />
              <YAxis className="text-xs" domain={[0, 100]} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="utilization" fill="hsl(262, 83%, 58%)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Bottom Row: Enrollments, Sessions, Alerts */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Recent Enrollments */}
        <Card className="border-violet-200 dark:border-violet-800/50">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Recent Enrollments</CardTitle>
              <Link href="/coordinator/enrollments">
                <Button variant="ghost" size="sm" className="gap-1 text-violet-600">
                  View All <ChevronRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentEnrollments.map((enrollment) => (
                <div key={enrollment.id} className="flex items-center gap-3">
                  <Avatar className="h-9 w-9">
                    <AvatarFallback className="bg-violet-100 text-violet-700 text-xs font-medium">
                      {getInitials(enrollment.student)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{enrollment.student}</p>
                    <p className="text-xs text-muted-foreground truncate">{enrollment.class} &middot; {enrollment.date}</p>
                  </div>
                  <Badge
                    variant={enrollment.status === 'ACTIVE' ? 'default' : 'secondary'}
                    className={
                      enrollment.status === 'ACTIVE'
                        ? 'bg-green-100 text-green-700 dark:bg-green-950/30'
                        : 'bg-red-100 text-red-700 dark:bg-red-950/30'
                    }
                  >
                    {enrollment.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Sessions */}
        <Card className="border-violet-200 dark:border-violet-800/50">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Upcoming Sessions</CardTitle>
              <Link href="/coordinator/schedules">
                <Button variant="ghost" size="sm" className="gap-1 text-violet-600">
                  View All <ChevronRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {upcomingSessions.map((session) => (
                <div key={session.id} className="flex items-start gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-100 dark:bg-violet-900/50 shrink-0 mt-0.5">
                    <Clock className="h-4 w-4 text-violet-600 dark:text-violet-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{session.subject}</p>
                    <p className="text-xs text-muted-foreground">
                      {session.teacher} &middot; {session.room}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-xs">{session.date}</Badge>
                      <span className="text-xs text-muted-foreground">{session.time}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Alerts */}
        <Card className="border-violet-200 dark:border-violet-800/50">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Alerts</CardTitle>
              <Badge variant="destructive" className="text-xs">{alerts.filter(a => a.type === 'error' || a.type === 'warning').length} Active</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {alerts.map((alert) => (
                <div
                  key={alert.id}
                  className={cn('flex items-start gap-3 p-3 rounded-lg border', getAlertColor(alert.type))}
                >
                  <div className="shrink-0 mt-0.5">{getAlertIcon(alert.type)}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{alert.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{alert.description}</p>
                    <p className="text-xs text-muted-foreground mt-1">{alert.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="border-violet-200 dark:border-violet-800/50">
        <CardHeader>
          <CardTitle className="text-lg">Quick Actions</CardTitle>
          <CardDescription>Frequently used coordinator actions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-6">
            <Link href="/coordinator/classes">
              <Button variant="outline" className="w-full h-auto flex-col gap-2 py-4 hover:bg-violet-50 hover:border-violet-300 dark:hover:bg-violet-950/30">
                <CalendarDays className="h-5 w-5 text-violet-600" />
                <span className="text-xs">New Class</span>
              </Button>
            </Link>
            <Link href="/coordinator/schedules">
              <Button variant="outline" className="w-full h-auto flex-col gap-2 py-4 hover:bg-violet-50 hover:border-violet-300 dark:hover:bg-violet-950/30">
                <ClipboardCheck className="h-5 w-5 text-violet-600" />
                <span className="text-xs">Schedule</span>
              </Button>
            </Link>
            <Link href="/coordinator/teachers">
              <Button variant="outline" className="w-full h-auto flex-col gap-2 py-4 hover:bg-violet-50 hover:border-violet-300 dark:hover:bg-violet-950/30">
                <GraduationCap className="h-5 w-5 text-violet-600" />
                <span className="text-xs">Teachers</span>
              </Button>
            </Link>
            <Link href="/coordinator/students">
              <Button variant="outline" className="w-full h-auto flex-col gap-2 py-4 hover:bg-violet-50 hover:border-violet-300 dark:hover:bg-violet-950/30">
                <BookOpen className="h-5 w-5 text-violet-600" />
                <span className="text-xs">Students</span>
              </Button>
            </Link>
            <Link href="/coordinator/reports">
              <Button variant="outline" className="w-full h-auto flex-col gap-2 py-4 hover:bg-violet-50 hover:border-violet-300 dark:hover:bg-violet-950/30">
                <BarChart3 className="h-5 w-5 text-violet-600" />
                <span className="text-xs">Reports</span>
              </Button>
            </Link>
            <Link href="/coordinator/messages">
              <Button variant="outline" className="w-full h-auto flex-col gap-2 py-4 hover:bg-violet-50 hover:border-violet-300 dark:hover:bg-violet-950/30">
                <MessageSquare className="h-5 w-5 text-violet-600" />
                <span className="text-xs">Messages</span>
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
