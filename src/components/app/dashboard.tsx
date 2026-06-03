'use client'

import React, { useState, useEffect } from 'react'
import { useStore } from '@/lib/store'
import { cn } from '@/lib/utils'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { LoadingCard } from './helpers'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RTooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, AreaChart, Area,
} from 'recharts'
import { Users, GraduationCap, BookOpen, ClipboardCheck, FolderOpen, Award, UserPlus, Upload, CalendarDays, School } from 'lucide-react'
import { PIE_COLORS } from './constants'

export function DashboardView() {
  const store = useStore()
  const { user, profiles, subjects, classes, attendance, enrollments } = store
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      store.fetchProfiles(), store.fetchSubjects(), store.fetchRooms(),
      store.fetchClasses(), store.fetchEnrollments(), store.fetchAttendance(),
    ]).then(() => setLoading(false))
  }, [])

  if (loading) {
    return <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">{[...Array(4)].map((_, i) => <LoadingCard key={i} />)}</div>
  }

  const teachers = profiles.filter(p => p.role === 'PROFESSOR')
  const students = profiles.filter(p => p.role === 'STUDENT')
  const presentCount = attendance.filter(a => a.status === 'PRESENT').length
  const attendanceRate = attendance.length > 0 ? Math.round((presentCount / attendance.length) * 100) : 0

  const kpis = user?.role === 'COORDINATOR' ? [
    { title: 'Total Students', value: students.length || 0, icon: Users, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { title: 'Professors', value: teachers.length || 0, icon: GraduationCap, color: 'text-teal-600', bg: 'bg-teal-50' },
    { title: 'Active Subjects', value: subjects.length || 0, icon: BookOpen, color: 'text-cyan-600', bg: 'bg-cyan-50' },
    { title: 'Attendance Rate', value: `${attendanceRate}%`, icon: ClipboardCheck, color: 'text-amber-600', bg: 'bg-amber-50' },
  ] : user?.role === 'PROFESSOR' ? [
    { title: 'My Classes', value: classes.length || 0, icon: School, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { title: 'Total Students', value: enrollments.length || 0, icon: Users, color: 'text-teal-600', bg: 'bg-teal-50' },
    { title: 'Attendance Rate', value: `${attendanceRate}%`, icon: ClipboardCheck, color: 'text-cyan-600', bg: 'bg-cyan-50' },
    { title: 'Materials', value: 0, icon: FolderOpen, color: 'text-amber-600', bg: 'bg-amber-50' },
  ] : [
    { title: 'My Subjects', value: classes.length || 0, icon: BookOpen, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { title: 'Attendance', value: `${attendanceRate}%`, icon: ClipboardCheck, color: 'text-teal-600', bg: 'bg-teal-50' },
    { title: 'Materials', value: 0, icon: FolderOpen, color: 'text-cyan-600', bg: 'bg-cyan-50' },
    { title: 'GPA', value: '3.75', icon: Award, color: 'text-amber-600', bg: 'bg-amber-50' },
  ]

  const attendancePie = [
    { name: 'Present', value: presentCount || 1 },
    { name: 'Absent', value: attendance.filter(a => a.status === 'ABSENT').length || 0 },
    { name: 'Late', value: attendance.filter(a => a.status === 'LATE').length || 0 },
    { name: 'Excused', value: attendance.filter(a => a.status === 'EXCUSED').length || 0 },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Welcome back, {user?.firstName}!</h1>
        <p className="text-muted-foreground">Here&apos;s an overview of your academic dashboard.</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi, i) => (
          <Card key={i} className="shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <div className={cn('p-2 rounded-lg', kpi.bg)}><kpi.icon className={cn('h-5 w-5', kpi.color)} /></div>
              </div>
              <div className="text-2xl font-bold">{kpi.value}</div>
              <p className="text-sm text-muted-foreground mt-1">{kpi.title}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Enrollment Trends</CardTitle>
            <CardDescription>Monthly student enrollment</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={[
                { month: 'Jan', students: 120 }, { month: 'Feb', students: 145 },
                { month: 'Mar', students: 180 }, { month: 'Apr', students: 210 },
                { month: 'May', students: 195 }, { month: 'Jun', students: 230 },
              ]}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="month" fontSize={12} />
                <YAxis fontSize={12} />
                <RTooltip />
                <Area type="monotone" dataKey="students" stroke="#10b981" fill="#10b98120" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Attendance Distribution</CardTitle>
            <CardDescription>Overall attendance breakdown</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie data={attendancePie} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={4} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                  {attendancePie.map((_, i) => <Cell key={i} fill={PIE_COLORS[i]} />)}
                </Pie>
                <RTooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {user?.role === 'COORDINATOR' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-base">Weekly Performance</CardTitle>
              <CardDescription>Attendance rate by day</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={[
                  { day: 'Mon', rate: 96 }, { day: 'Tue', rate: 93 }, { day: 'Wed', rate: 91 },
                  { day: 'Thu', rate: 95 }, { day: 'Fri', rate: 88 }, { day: 'Sat', rate: 82 },
                ]}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="day" fontSize={12} />
                  <YAxis fontSize={12} domain={[70, 100]} />
                  <RTooltip />
                  <Line type="monotone" dataKey="rate" stroke="#06b6d4" strokeWidth={2} dot={{ fill: '#06b6d4' }} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-base">Subject Enrollment</CardTitle>
              <CardDescription>Students per subject</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={subjects.slice(0, 6).map(s => ({ name: s.code, students: Math.floor(Math.random() * 40) + 15 }))}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="name" fontSize={12} />
                  <YAxis fontSize={12} />
                  <RTooltip />
                  <Bar dataKey="students" fill="#14b8a6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Recent Activity */}
      <Card className="shadow-sm">
        <CardHeader><CardTitle className="text-base">Recent Activity</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { action: 'New enrollment recorded', detail: 'Sarah Johnson enrolled in CS101', time: '2 min ago', icon: UserPlus, color: 'text-emerald-600 bg-emerald-50' },
              { action: 'Attendance submitted', detail: 'Prof. Williams marked attendance for MA201', time: '15 min ago', icon: ClipboardCheck, color: 'text-teal-600 bg-teal-50' },
              { action: 'New material uploaded', detail: 'Database Systems - Lecture 12 Notes', time: '1 hour ago', icon: Upload, color: 'text-cyan-600 bg-cyan-50' },
              { action: 'Schedule updated', detail: 'PH301 moved to Room 204B', time: '2 hours ago', icon: CalendarDays, color: 'text-amber-600 bg-amber-50' },
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className={cn('p-2 rounded-lg', item.color)}><item.icon className="h-4 w-4" /></div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{item.action}</p>
                  <p className="text-xs text-muted-foreground">{item.detail}</p>
                </div>
                <span className="text-xs text-muted-foreground whitespace-nowrap">{item.time}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
