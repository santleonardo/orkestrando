'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/hooks/use-auth'
import { Sidebar } from '@/components/layout/sidebar'
import { Header } from '@/components/layout/header'
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Menu } from 'lucide-react'
import { cn } from '@/lib/utils'

function MobileSidebar({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const pathname = usePathname()
  const { profile, role } = useAuth()
  const permissions = usePermissions(role)

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="w-[280px] p-0">
        <SheetTitle className="sr-only">Menu de navegação</SheetTitle>
        <div className="flex flex-col h-full">
          <div className="flex items-center h-14 px-4 border-b">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-sm">
              O
            </div>
            <span className="ml-2.5 text-lg font-bold tracking-tight">ORKESTRANDO</span>
          </div>
          <div className="flex-1 overflow-y-auto p-3">
            <SidebarInner pathname={pathname} permissions={permissions} profile={profile} role={role} />
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}

import { usePathname } from 'next/navigation'
import { usePermissions } from '@/lib/hooks/use-permissions'
import { ROLE_LABELS } from '@/lib/constants'
import { getInitials } from '@/lib/utils/format'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import Link from 'next/link'
import {
  LayoutDashboard, Users, GraduationCap, BookOpen, DoorOpen, Calendar,
  CalendarRange, Clock, FolderOpen, MessageSquare, UserCheck, BarChart3,
  Settings, Library,
} from 'lucide-react'
import type { PermissionHook } from '@/lib/hooks/use-permissions'
import type { Profile, UserRole } from '@/lib/types'

const navGroups = [
  {
    label: 'Início',
    items: [{ label: 'Dashboard', href: '/', icon: LayoutDashboard }],
  },
  {
    label: 'Acadêmico',
    items: [
      { label: 'Professores', href: '/teachers', icon: Users, permission: 'teachers.read' },
      { label: 'Alunos', href: '/students', icon: GraduationCap, permission: 'students.read' },
      { label: 'Turmas', href: '/classes', icon: DoorOpen, permission: 'classes.read' },
      { label: 'Salas', href: '/rooms', icon: DoorOpen, permission: 'rooms.read' },
      { label: 'Cursos', href: '/courses', icon: BookOpen, permission: 'courses.read' },
    ],
  },
  {
    label: 'Ensino',
    items: [
      { label: 'Disciplinas', href: '/subjects', icon: Library, permission: 'subjects.read' },
      { label: 'Semestres', href: '/semesters', icon: CalendarRange, permission: 'semesters.read' },
      { label: 'Feriados', href: '/holidays', icon: Calendar, permission: 'holidays.read' },
    ],
  },
  {
    label: 'Operacional',
    items: [
      { label: 'Agenda', href: '/schedule', icon: Calendar, permission: 'schedule.read' },
      { label: 'Disponibilidade', href: '/availability', icon: Clock, permission: 'availability.read' },
      { label: 'Materiais', href: '/materials', icon: FolderOpen, permission: 'materials.read' },
      { label: 'Mensagens', href: '/messages', icon: MessageSquare, permission: 'messages.read' },
      { label: 'Presença', href: '/attendance', icon: UserCheck, permission: 'attendance.read' },
    ],
  },
  {
    label: 'Administração',
    items: [
      { label: 'Relatórios', href: '/reports', icon: BarChart3, permission: 'reports.read' },
      { label: 'Configurações', href: '/settings', icon: Settings },
    ],
  },
]

function SidebarInner({ pathname, permissions, profile, role }: {
  pathname: string
  permissions: PermissionHook
  profile: Profile | null
  role: UserRole | null
}) {
  return (
    <nav className="space-y-6">
      {navGroups.map((group) => {
        const visibleItems = group.items.filter(
          (item) => !item.permission || permissions.can(item.permission.split('.')[1], item.permission.split('.')[0])
        )
        if (visibleItems.length === 0) return null

        return (
          <div key={group.label}>
            <p className="px-3 mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70">
              {group.label}
            </p>
            <div className="space-y-1">
              {visibleItems.map((item) => {
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200',
                      isActive
                        ? 'bg-primary/10 text-primary font-semibold'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    )}
                  >
                    <item.icon className={cn('h-5 w-5 shrink-0', isActive && 'text-primary')} />
                    <span>{item.label}</span>
                  </Link>
                )
              })}
            </div>
          </div>
        )
      })}
    </nav>
  )
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const { loading, profile, role } = useAuth()
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    if (!loading && !profile) {
      router.push('/login')
    }
  }, [loading, profile, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground">Carregando...</p>
        </div>
      </div>
    )
  }

  if (!profile) return null

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex flex-1 overflow-hidden">
        {/* Desktop Sidebar */}
        <Sidebar
          collapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        />

        {/* Main area */}
        <div className="flex flex-col flex-1 overflow-hidden">
          <Header onMenuToggle={() => setMobileOpen(true)} />

          <main className="flex-1 overflow-y-auto p-4 md:p-6 custom-scrollbar">
            {children}
          </main>
        </div>
      </div>

      {/* Mobile sidebar */}
      <div className="md:hidden">
        <MobileSidebar open={mobileOpen} onOpenChange={setMobileOpen} />
      </div>
    </div>
  )
}
