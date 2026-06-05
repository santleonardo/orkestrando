'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { useAuth } from '@/lib/hooks/use-auth'
import { usePermissions } from '@/lib/hooks/use-permissions'
import { ROLE_LABELS } from '@/lib/constants'
import { getInitials } from '@/lib/utils/format'
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  BookOpen,
  DoorOpen,
  Calendar,
  CalendarRange,
  Clock,
  FolderOpen,
  MessageSquare,
  UserCheck,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  Library,
  type LucideIcon,
} from 'lucide-react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

interface NavItem {
  label: string
  href: string
  icon: LucideIcon
  permission?: string
}

interface NavGroup {
  label: string
  items: NavItem[]
}

const navigation: NavGroup[] = [
  {
    label: 'Início',
    items: [
      { label: 'Dashboard', href: '/', icon: LayoutDashboard },
    ],
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

function NavItemComponent({ item, pathname, collapsed }: { item: NavItem; pathname: string; collapsed: boolean }) {
  const isActive = pathname === item.href

  const linkContent = (
    <Link
      href={item.href}
      className={cn(
        'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200',
        isActive
          ? 'bg-primary/10 text-primary font-semibold'
          : 'text-muted-foreground hover:bg-muted hover:text-foreground',
        collapsed && 'justify-center px-2'
      )}
    >
      <item.icon className={cn('h-5 w-5 shrink-0', isActive && 'text-primary')} />
      {!collapsed && <span>{item.label}</span>}
    </Link>
  )

  if (collapsed) {
    return (
      <TooltipProvider delayDuration={0}>
        <Tooltip>
          <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
          <TooltipContent side="right" className="font-medium">
            {item.label}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
  }

  return linkContent
}

export function Sidebar({ collapsed, onToggle }: { collapsed: boolean; onToggle: () => void }) {
  const pathname = usePathname()
  const { profile, role } = useAuth()
  const permissions = usePermissions(role)

  return (
    <aside
      className={cn(
        'hidden md:flex flex-col border-r bg-sidebar transition-all duration-300 h-full',
        collapsed ? 'w-[68px]' : 'w-[260px]'
      )}
    >
      {/* Logo */}
      <div className="flex items-center h-14 px-4 border-b">
        {!collapsed ? (
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-sm">
              O
            </div>
            <span className="text-lg font-bold tracking-tight text-foreground">
              ORKESTRANDO
            </span>
          </Link>
        ) : (
          <Link href="/" className="flex items-center justify-center w-full">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-sm">
              O
            </div>
          </Link>
        )}
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 px-3 py-3 custom-scrollbar">
        <nav className="space-y-6">
          {navigation.map((group) => {
            const visibleItems = group.items.filter(
              (item) => !item.permission || permissions.can(item.permission.split('.')[1], item.permission.split('.')[0])
            )
            if (visibleItems.length === 0) return null

            return (
              <div key={group.label}>
                {!collapsed && (
                  <p className="px-3 mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70">
                    {group.label}
                  </p>
                )}
                <div className="space-y-1">
                  {visibleItems.map((item) => (
                    <NavItemComponent
                      key={item.href}
                      item={item}
                      pathname={pathname}
                      collapsed={collapsed}
                    />
                  ))}
                </div>
              </div>
            )
          })}
        </nav>
      </ScrollArea>

      {/* Bottom section */}
      <div className="border-t p-3 space-y-2">
        <Button
          variant="ghost"
          size="icon"
          className="w-full h-8"
          onClick={onToggle}
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <>
              <ChevronLeft className="h-4 w-4" />
              <span className="ml-2 text-xs">Recolher</span>
            </>
          )}
        </Button>

        {!collapsed && profile && (
          <>
            <Separator />
            <div className="flex items-center gap-3 rounded-lg px-2 py-1.5 bg-muted/50">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="text-xs bg-primary/10 text-primary font-medium">
                  {getInitials(profile.fullName)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{profile.fullName}</p>
                <p className="text-xs text-muted-foreground truncate">
                  {role ? ROLE_LABELS[role] : ''}
                </p>
              </div>
            </div>
          </>
        )}
      </div>
    </aside>
  )
}
