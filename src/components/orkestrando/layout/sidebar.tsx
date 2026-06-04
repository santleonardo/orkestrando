'use client'

import { useAuthStore } from '@/store/auth-store'
import { useNavStore, type ViewId } from '@/store/nav-store'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import {
  LayoutDashboard,
  BookOpen,
  GraduationCap,
  Calendar,
  DoorOpen,
  Users,
  UserCheck,
  CalendarDays,
  Clock,
  Music,
  ClipboardCheck,
  FileText,
  MessageSquare,
  BarChart3,
  Shield,
  Brain,
  School,
  Settings,
  LogOut,
  X,
  ChevronLeft,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface NavItem {
  id: ViewId
  label: string
  icon: React.ElementType
  roles: string[]
  section?: string
}

const navItems: NavItem[] = [
  { id: 'dashboard', label: 'Painel', icon: LayoutDashboard, roles: ['ADMIN', 'COORDINATOR', 'TEACHER', 'STUDENT'] },
  { id: 'courses', label: 'Cursos', icon: BookOpen, roles: ['ADMIN', 'COORDINATOR'], section: 'Acadêmico' },
  { id: 'disciplines', label: 'Disciplinas', icon: GraduationCap, roles: ['ADMIN', 'COORDINATOR'] },
  { id: 'semesters', label: 'Semestres', icon: CalendarDays, roles: ['ADMIN', 'COORDINATOR'] },
  { id: 'rooms', label: 'Salas', icon: DoorOpen, roles: ['ADMIN', 'COORDINATOR'] },
  { id: 'classes', label: 'Turmas', icon: School, roles: ['ADMIN', 'COORDINATOR'] },
  { id: 'enrollments', label: 'Matrículas', icon: UserCheck, roles: ['ADMIN', 'COORDINATOR'] },
  { id: 'calendar', label: 'Calendário', icon: Calendar, roles: ['ADMIN', 'COORDINATOR'], section: 'Operacional' },
  { id: 'availability', label: 'Disponibilidade', icon: Clock, roles: ['ADMIN', 'COORDINATOR', 'TEACHER'] },
  { id: 'lessons', label: 'Aulas', icon: Music, roles: ['ADMIN', 'COORDINATOR', 'TEACHER', 'STUDENT'] },
  { id: 'attendance', label: 'Frequência', icon: ClipboardCheck, roles: ['ADMIN', 'COORDINATOR', 'TEACHER'] },
  { id: 'materials', label: 'Materiais', icon: FileText, roles: ['ADMIN', 'COORDINATOR', 'TEACHER', 'STUDENT'] },
  { id: 'messages', label: 'Mensagens', icon: MessageSquare, roles: ['ADMIN', 'COORDINATOR', 'TEACHER', 'STUDENT'], section: 'Comunicação' },
  { id: 'reports', label: 'Relatórios', icon: BarChart3, roles: ['ADMIN', 'COORDINATOR'], section: 'Administração' },
  { id: 'audit', label: 'Auditoria', icon: Shield, roles: ['ADMIN'] },
  { id: 'ai-assistant', label: 'Assistente IA', icon: Brain, roles: ['ADMIN', 'COORDINATOR', 'TEACHER'] },
  { id: 'student-portal', label: 'Portal do Aluno', icon: School, roles: ['STUDENT'] },
]

export function Sidebar() {
  const { user, logout } = useAuthStore()
  const { currentView, sidebarOpen, setCurrentView, setSidebarOpen, toggleSidebar } = useNavStore()

  const userRole = user?.role || 'STUDENT'
  const filteredItems = navItems.filter((item) => item.roles.includes(userRole))

  const renderedSections = new Set<string>()

  return (
    <>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={cn(
          'fixed left-0 top-0 z-50 h-screen bg-slate-900 text-white flex flex-col transition-all duration-300',
          sidebarOpen ? 'w-64' : 'w-0 lg:w-16',
          'max-lg:w-0 max-lg:overflow-hidden',
          sidebarOpen && 'max-lg:w-64'
        )}
      >
        {/* Logo */}
        <div className="flex items-center justify-between p-4 h-16 border-b border-slate-700/50">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600">
              <Music className="h-4 w-4 text-white" />
            </div>
            {sidebarOpen && (
              <span className="font-bold text-lg tracking-tight">ORKESTRANDO</span>
            )}
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="hidden lg:flex h-7 w-7 text-slate-400 hover:text-white hover:bg-slate-800"
              onClick={toggleSidebar}
            >
              <ChevronLeft className={cn('h-4 w-4 transition-transform', !sidebarOpen && 'rotate-180')} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden h-7 w-7 text-slate-400 hover:text-white hover:bg-slate-800"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Navigation */}
        <ScrollArea className="flex-1 py-2">
          {filteredItems.map((item) => {
            const showSection = item.section && !renderedSections.has(item.section)
            if (item.section) renderedSections.add(item.section)

            return (
              <div key={item.id}>
                {showSection && sidebarOpen && (
                  <div className="px-4 pt-4 pb-2">
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      {item.section}
                    </span>
                  </div>
                )}
                <button
                  onClick={() => setCurrentView(item.id)}
                  className={cn(
                    'w-full flex items-center gap-3 px-3 mx-2 py-2 rounded-lg text-sm font-medium transition-all duration-200',
                    currentView === item.id
                      ? 'bg-emerald-600/20 text-emerald-400 border-l-2 border-emerald-400'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white border-l-2 border-transparent'
                  )}
                  title={!sidebarOpen ? item.label : undefined}
                >
                  <item.icon className="h-4 w-4 flex-shrink-0" />
                  {sidebarOpen && <span>{item.label}</span>}
                </button>
              </div>
            )
          })}
        </ScrollArea>

        {/* User info */}
        <div className="border-t border-slate-700/50 p-3">
          {user && (
            <div className={cn('flex items-center gap-3', !sidebarOpen && 'justify-center')}>
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-emerald-600 text-white text-xs font-bold">
                  {user.name?.charAt(0)?.toUpperCase()}
                </AvatarFallback>
              </Avatar>
              {sidebarOpen && (
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{user.name}</p>
                  <p className="text-xs text-slate-400 truncate">
                    {userRole === 'ADMIN' ? 'Administrador' : userRole === 'COORDINATOR' ? 'Coordenador' : userRole === 'TEACHER' ? 'Professor' : 'Aluno'}
                  </p>
                </div>
              )}
              {sidebarOpen && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-slate-400 hover:text-red-400 hover:bg-slate-800"
                  onClick={logout}
                  title="Sair"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              )}
            </div>
          )}
        </div>
      </aside>
    </>
  )
}
