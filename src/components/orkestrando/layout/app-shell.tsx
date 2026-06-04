'use client'

import { useNavStore } from '@/store/nav-store'
import { Sidebar } from './sidebar'
import { Header } from './header'
import { Dashboard } from '@/components/orkestrando/views/dashboard'
import { CoursesView } from '@/components/orkestrando/views/courses'
import { DisciplinesView } from '@/components/orkestrando/views/disciplines'
import { SemestersView } from '@/components/orkestrando/views/semesters'
import { RoomsView } from '@/components/orkestrando/views/rooms'
import { ClassesView } from '@/components/orkestrando/views/classes'
import { EnrollmentsView } from '@/components/orkestrando/views/enrollments'
import { CalendarView } from '@/components/orkestrando/views/calendar'
import { AvailabilityView } from '@/components/orkestrando/views/availability'
import { LessonsView } from '@/components/orkestrando/views/lessons'
import { AttendanceView } from '@/components/orkestrando/views/attendance'
import { MaterialsView } from '@/components/orkestrando/views/materials'
import { MessagesView } from '@/components/orkestrando/views/messages'
import { ReportsView } from '@/components/orkestrando/views/reports'
import { AuditView } from '@/components/orkestrando/views/audit'
import { AiAssistantView } from '@/components/orkestrando/views/ai-assistant'
import { StudentPortalView } from '@/components/orkestrando/views/student-portal'
import { cn } from '@/lib/utils'

const views: Record<string, React.ComponentType> = {
  dashboard: Dashboard,
  courses: CoursesView,
  disciplines: DisciplinesView,
  semesters: SemestersView,
  rooms: RoomsView,
  classes: ClassesView,
  enrollments: EnrollmentsView,
  calendar: CalendarView,
  availability: AvailabilityView,
  lessons: LessonsView,
  attendance: AttendanceView,
  materials: MaterialsView,
  messages: MessagesView,
  reports: ReportsView,
  audit: AuditView,
  'ai-assistant': AiAssistantView,
  'student-portal': StudentPortalView,
}

export function AppShell() {
  const { currentView, sidebarOpen } = useNavStore()
  const ViewComponent = views[currentView] || Dashboard

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar />
      <div
        className={cn(
          'transition-all duration-300',
          sidebarOpen ? 'lg:ml-64' : 'lg:ml-16'
        )}
      >
        <Header />
        <main className="p-4 sm:p-6">
          <ViewComponent />
        </main>
      </div>
    </div>
  )
}
