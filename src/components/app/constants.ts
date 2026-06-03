import {
  LayoutDashboard, GraduationCap, Users, BookOpen, School, Building2,
  ClipboardCheck, FolderOpen, BarChart3, MessageSquare, CalendarDays,
} from 'lucide-react'

export const WEEKDAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'] as const
export const WEEKDAY_SHORT: Record<string, string> = {
  Monday: 'Mon', Tuesday: 'Tue', Wednesday: 'Wed', Thursday: 'Thu', Friday: 'Fri', Saturday: 'Sat',
}
export const PIE_COLORS = ['#10b981', '#f59e0b', '#ef4444', '#6b7280']

export type MenuItem = { id: string; label: string; icon: React.ElementType }

export const COORDINATOR_MENU: MenuItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'teachers', label: 'Teachers', icon: GraduationCap },
  { id: 'students', label: 'Students', icon: Users },
  { id: 'subjects', label: 'Subjects', icon: BookOpen },
  { id: 'classes', label: 'Classes', icon: School },
  { id: 'rooms', label: 'Rooms', icon: Building2 },
  { id: 'attendance', label: 'Attendance', icon: ClipboardCheck },
  { id: 'materials', label: 'Materials', icon: FolderOpen },
  { id: 'reports', label: 'Reports', icon: BarChart3 },
  { id: 'messages', label: 'Messages', icon: MessageSquare },
]

export const PROFESSOR_MENU: MenuItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'my-classes', label: 'My Classes', icon: School },
  { id: 'attendance', label: 'Attendance', icon: ClipboardCheck },
  { id: 'materials', label: 'Materials', icon: FolderOpen },
  { id: 'messages', label: 'Messages', icon: MessageSquare },
]

export const STUDENT_MENU: MenuItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'my-subjects', label: 'My Subjects', icon: BookOpen },
  { id: 'my-schedule', label: 'My Schedule', icon: CalendarDays },
  { id: 'my-attendance', label: 'Attendance', icon: ClipboardCheck },
  { id: 'materials', label: 'Materials', icon: FolderOpen },
  { id: 'messages', label: 'Messages', icon: MessageSquare },
]

export function getMenuForRole(role: string): MenuItem[] {
  if (role === 'COORDINATOR') return COORDINATOR_MENU
  if (role === 'PROFESSOR') return PROFESSOR_MENU
  return STUDENT_MENU
}
