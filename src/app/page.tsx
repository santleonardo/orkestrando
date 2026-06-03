'use client'

import { useStore } from '@/lib/store'
import { GraduationCap } from 'lucide-react'
import { LandingPage, LoginPage } from '@/components/app/auth-pages'
import { AppShell } from '@/components/app/ui-shell'
import { DashboardView } from '@/components/app/dashboard'
import { TeachersView, StudentsView, SubjectsView, RoomsView, ClassesView } from '@/components/app/crud-views'
import { AttendanceView, MaterialsView, ReportsView, MessagesView } from '@/components/app/views'
import { MySubjectsView, MyScheduleView, MyAttendanceView, MyClassesView } from '@/components/app/role-views'

function ViewRouter() {
  const { user, activeView } = useStore()
  const isCoordinator = user?.role === 'COORDINATOR'

  switch (activeView) {
    case 'dashboard': return <DashboardView />
    case 'teachers': return isCoordinator ? <TeachersView /> : <DashboardView />
    case 'students': return isCoordinator ? <StudentsView /> : <DashboardView />
    case 'subjects': return isCoordinator ? <SubjectsView /> : <DashboardView />
    case 'classes': return isCoordinator ? <ClassesView /> : <DashboardView />
    case 'rooms': return isCoordinator ? <RoomsView /> : <DashboardView />
    case 'attendance': return <AttendanceView />
    case 'materials': return <MaterialsView />
    case 'reports': return isCoordinator ? <ReportsView /> : <DashboardView />
    case 'messages': return <MessagesView />
    case 'my-classes': return <MyClassesView />
    case 'my-subjects': return <MySubjectsView />
    case 'my-schedule': return <MyScheduleView />
    case 'my-attendance': return <MyAttendanceView />
    default: return <DashboardView />
  }
}

export default function Home() {
  const { isAuthenticated, isLoading, activeView } = useStore()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <GraduationCap className="h-10 w-10 text-emerald-600 animate-pulse" />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    if (activeView === 'login') return <LoginPage />
    return <LandingPage />
  }

  return (
    <AppShell>
      <ViewRouter />
    </AppShell>
  )
}
