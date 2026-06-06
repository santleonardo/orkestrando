import {
  LayoutDashboard, GraduationCap, Users, BookOpen, School, Building2,
  ClipboardCheck, FolderOpen, BarChart3, MessageSquare, CalendarDays,
} from 'lucide-react'

export const WEEKDAYS = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'] as const
export const WEEKDAY_SHORT: Record<string, string> = {
  Segunda: 'Seg', Terça: 'Ter', Quarta: 'Qua', Quinta: 'Qui', Sexta: 'Sex', Sábado: 'Sáb',
}
export const PIE_COLORS = ['#10b981', '#f59e0b', '#ef4444', '#6b7280']

export type MenuItem = { id: string; label: string; icon: React.ElementType }

export const COORDINATOR_MENU: MenuItem[] = [
  { id: 'dashboard', label: 'Painel', icon: LayoutDashboard },
  { id: 'teachers', label: 'Professores', icon: GraduationCap },
  { id: 'students', label: 'Alunos', icon: Users },
  { id: 'subjects', label: 'Disciplinas', icon: BookOpen },
  { id: 'classes', label: 'Turmas', icon: School },
  { id: 'rooms', label: 'Salas', icon: Building2 },
  { id: 'attendance', label: 'Frequências', icon: ClipboardCheck },
  { id: 'materials', label: 'Materiais', icon: FolderOpen },
  { id: 'reports', label: 'Relatórios', icon: BarChart3 },
  { id: 'messages', label: 'Mensagens', icon: MessageSquare },
]

export const PROFESSOR_MENU: MenuItem[] = [
  { id: 'dashboard', label: 'Painel', icon: LayoutDashboard },
  { id: 'my-classes', label: 'Minhas Turmas', icon: School },
  { id: 'attendance', label: 'Frequências', icon: ClipboardCheck },
  { id: 'materials', label: 'Materiais', icon: FolderOpen },
  { id: 'messages', label: 'Mensagens', icon: MessageSquare },
]

export const STUDENT_MENU: MenuItem[] = [
  { id: 'dashboard', label: 'Painel', icon: LayoutDashboard },
  { id: 'my-subjects', label: 'Minhas Disciplinas', icon: BookOpen },
  { id: 'my-schedule', label: 'Meu Horário', icon: CalendarDays },
  { id: 'my-attendance', label: 'Frequências', icon: ClipboardCheck },
  { id: 'materials', label: 'Materiais', icon: FolderOpen },
  { id: 'messages', label: 'Mensagens', icon: MessageSquare },
]

export function getMenuForRole(role: string): MenuItem[] {
  if (role === 'COORDINATOR') return COORDINATOR_MENU
  if (role === 'PROFESSOR') return PROFESSOR_MENU
  return STUDENT_MENU
}
