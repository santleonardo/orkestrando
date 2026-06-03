'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/hooks/use-auth'
import { useIsMobile } from '@/hooks/use-mobile'
import { Role } from '@/types'
import { SIDEBAR_MENU_ITEMS, ROLE_LABELS } from '@/constants'
import { cn } from '@/lib/utils'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/components/ui/avatar'

import {
  LayoutDashboard,
  Calendar,
  Users,
  BookOpen,
  MessageSquare,
  Bell,
  Settings,
  FileText,
  ClipboardList,
  GraduationCap,
  BarChart3,
  Clock,
  LogOut,
  Menu,
  ChevronLeft,
  ChevronRight,
  X,
  Search,
  FolderOpen,
  PenTool,
  Award,
  AlertTriangle,
  Building2,
  Activity,
  FileSearch,
  Megaphone,
  CalendarDays,
  CalendarRange,
  DoorOpen,
  PartyPopper,
  ClipboardCheck,
  BookMarked,
  Library,
  UsersRound,
  CheckCircle,
} from 'lucide-react'

// -----------------------------------------------------------------------------
// Icon mapping
// -----------------------------------------------------------------------------

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  LayoutDashboard,
  Calendar,
  CalendarDays,
  CalendarRange,
  Users,
  UsersRound,
  BookOpen,
  BookMarked,
  Library,
  MessageSquare,
  Bell,
  Settings,
  FileText,
  FileSearch,
  ClipboardList,
  ClipboardCheck,
  GraduationCap,
  BarChart3,
  Clock,
  LogOut,
  Menu,
  ChevronLeft,
  ChevronRight,
  X,
  Search,
  FolderOpen,
  PenTool,
  Award,
  AlertTriangle,
  Building2,
  Activity,
  Megaphone,
  DoorOpen,
  PartyPopper,
  CheckCircle,
}

function MenuIcon({ iconName, className }: { iconName?: string; className?: string }) {
  if (!iconName) return null
  const IconComponent = ICON_MAP[iconName]
  if (!IconComponent) return null
  return <IconComponent className={className} />
}

// -----------------------------------------------------------------------------
// Sidebar Content
// -----------------------------------------------------------------------------

interface SidebarContentProps {
  collapsed: boolean
  onNavigate?: () => void
}

function SidebarContent({ collapsed, onNavigate }: SidebarContentProps) {
  const pathname = usePathname()
  const { user, logout, role } = useAuth()

  const menuItems = useMemo(() => {
    if (!role) return SIDEBAR_MENU_ITEMS.common
    const roleItems = SIDEBAR_MENU_ITEMS[role]
    if (!roleItems) return SIDEBAR_MENU_ITEMS.common
    return roleItems
  }, [role])

  const userInitials = useMemo(() => {
    if (!user) return '?'
    const first = user.firstName?.[0] || ''
    const last = user.lastName?.[0] || ''
    return (first + last).toUpperCase() || user.displayName?.[0]?.toUpperCase() || '?'
  }, [user])

  const handleLogout = async () => {
    await logout()
  }

  return (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div className={cn(
        'flex h-16 items-center border-b border-violet-100 px-4',
        collapsed ? 'justify-center' : 'gap-3'
      )}>
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-violet-600">
          <GraduationCap className="h-5 w-5 text-white" />
        </div>
        {!collapsed && (
          <div className="flex flex-col overflow-hidden">
            <span className="truncate text-sm font-bold text-violet-900">
              ORKESTRANDO
            </span>
            <span className="truncate text-[10px] text-violet-500">
              Gestão Acadêmica
            </span>
          </div>
        )}
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 px-3 py-4">
        <nav className="flex flex-col gap-1">
          {menuItems.map((item) => {
            if ('isDivider' in item && item.isDivider) {
              if (collapsed) {
                return (
                  <Separator key={item.id} className="my-2 bg-violet-100" />
                )
              }
              return (
                <div
                  key={item.id}
                  className="px-3 pt-4 pb-1"
                >
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-violet-400">
                    {item.label}
                  </span>
                </div>
              )
            }

            const href = 'href' in item ? item.href : undefined
            const isActive =
              href && pathname === href

            const linkContent = (
              <Link
                href={href || '#'}
                onClick={onNavigate}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200',
                  collapsed && 'justify-center px-2',
                  isActive
                    ? 'bg-violet-600 text-white shadow-sm'
                    : 'text-gray-600 hover:bg-violet-50 hover:text-violet-700'
                )}
              >
                <MenuIcon
                  iconName={'icon' in item ? item.icon : undefined}
                  className={cn(
                    'h-5 w-5 shrink-0',
                    isActive ? 'text-white' : 'text-gray-500'
                  )}
                />
                {!collapsed && (
                  <>
                    <span className="flex-1 truncate">{item.label}</span>
                    {'badge' in item && item.badge === 'unread' && (
                      <Badge
                        variant="secondary"
                        className="h-5 min-w-5 bg-violet-100 px-1.5 text-[10px] text-violet-700"
                      >
                        3
                      </Badge>
                    )}
                  </>
                )}
              </Link>
            )

            if (collapsed) {
              return (
                <Tooltip key={item.id} delayDuration={0}>
                  <TooltipTrigger asChild>
                    {linkContent}
                  </TooltipTrigger>
                  <TooltipContent side="right" className="font-medium">
                    {'label' in item ? item.label : ''}
                  </TooltipContent>
                </Tooltip>
              )
            }

            return <React.Fragment key={item.id}>{linkContent}</React.Fragment>
          })}
        </nav>
      </ScrollArea>

      {/* User Section */}
      <div className={cn(
        'border-t border-violet-100 p-3',
        collapsed && 'flex flex-col items-center'
      )}>
        <div className={cn(
          'flex items-center gap-3 rounded-lg p-2',
          collapsed ? 'justify-center' : 'hover:bg-violet-50'
        )}>
          <Avatar className="h-8 w-8 shrink-0 border-2 border-violet-200">
            <AvatarImage src={user?.avatar || undefined} alt={user?.displayName || ''} />
            <AvatarFallback className="bg-violet-100 text-xs font-semibold text-violet-700">
              {userInitials}
            </AvatarFallback>
          </Avatar>
          {!collapsed && (
            <div className="flex flex-1 flex-col overflow-hidden">
              <span className="truncate text-sm font-medium text-gray-900">
                {user?.displayName || 'Usuário'}
              </span>
              <span className="truncate text-xs text-gray-500">
                {role ? ROLE_LABELS[role] : ''}
              </span>
            </div>
          )}
        </div>

        {!collapsed && (
          <Button
            variant="ghost"
            size="sm"
            className="mt-1 w-full justify-start gap-2 text-gray-500 hover:text-red-600 hover:bg-red-50"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4" />
            <span className="text-xs">Sair</span>
          </Button>
        )}

        {collapsed && (
          <Tooltip delayDuration={0}>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="mt-1 h-8 w-8 text-gray-500 hover:text-red-600 hover:bg-red-50"
                onClick={handleLogout}
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">Sair</TooltipContent>
          </Tooltip>
        )}
      </div>
    </div>
  )
}

// -----------------------------------------------------------------------------
// Main App Layout
// -----------------------------------------------------------------------------

export function AppLayout({ children }: { children: React.ReactNode }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const pathname = usePathname()
  const router = useRouter()
  const isMobile = useIsMobile()
  const { user, role, logout } = useAuth()

  // Compute the base path for the current role
  const roleBasePath = useMemo(() => {
    switch (role) {
      case 'COORDINATOR': return '/coordinator'
      case 'PROFESSOR': return '/professor'
      case 'STUDENT': return '/student'
      case 'ASSISTANT': return '/assistant'
      case 'SUPER_ADMIN': return '/'
      default: return '/'
    }
  }, [role])

  // Close mobile sheet on route change
  const [prevPathname, setPrevPathname] = useState(pathname)
  if (prevPathname !== pathname) {
    setPrevPathname(pathname)
    setMobileOpen(false)
  }

  const userInitials = useMemo(() => {
    if (!user) return '?'
    const first = user.firstName?.[0] || ''
    const last = user.lastName?.[0] || ''
    return (first + last).toUpperCase() || user.displayName?.[0]?.toUpperCase() || '?'
  }, [user])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
      setSearchQuery('')
    }
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* Desktop Sidebar */}
      {!isMobile && (
        <aside
          className={cn(
            'flex h-full flex-col border-r border-violet-100 bg-white transition-all duration-300 ease-in-out',
            sidebarCollapsed ? 'w-[68px]' : 'w-[260px]'
          )}
        >
          <SidebarContent collapsed={sidebarCollapsed} />
        </aside>
      )}

      {/* Mobile Sidebar Sheet */}
      {isMobile && (
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetContent side="left" className="w-[280px] p-0">
            <SheetHeader className="sr-only">
              <SheetTitle>Menu de Navegação</SheetTitle>
            </SheetHeader>
            <SidebarContent
              collapsed={false}
              onNavigate={() => setMobileOpen(false)}
            />
          </SheetContent>
        </Sheet>
      )}

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header */}
        <header className="flex h-16 items-center justify-between border-b border-gray-200 bg-white px-4 lg:px-6">
          {/* Left side: Mobile menu + Collapse + Search */}
          <div className="flex items-center gap-3">
            {/* Mobile menu button */}
            {isMobile && (
              <Button
                variant="ghost"
                size="icon"
                className="text-gray-600"
                onClick={() => setMobileOpen(true)}
              >
                <Menu className="h-5 w-5" />
                <span className="sr-only">Abrir menu</span>
              </Button>
            )}

            {/* Collapse toggle (desktop only) */}
            {!isMobile && (
              <Button
                variant="ghost"
                size="icon"
                className="text-gray-400 hover:text-gray-600"
                onClick={() => setSidebarCollapsed((prev) => !prev)}
              >
                {sidebarCollapsed ? (
                  <ChevronRight className="h-4 w-4" />
                ) : (
                  <ChevronLeft className="h-4 w-4" />
                )}
                <span className="sr-only">
                  {sidebarCollapsed ? 'Expandir menu' : 'Recolher menu'}
                </span>
              </Button>
            )}

            {/* Search bar */}
            <form onSubmit={handleSearch} className="hidden md:block">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  type="search"
                  placeholder="Buscar disciplinas, alunos, professores..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-9 w-[280px] rounded-full border-gray-200 bg-gray-50 pl-9 pr-4 text-sm placeholder:text-gray-400 focus-visible:border-violet-400 focus-visible:ring-violet-200 lg:w-[360px]"
                />
              </div>
            </form>
          </div>

          {/* Right side: Notifications + User */}
          <div className="flex items-center gap-2">
            {/* Notifications */}
            <Tooltip delayDuration={0}>
              <TooltipTrigger asChild>
                <Link href={roleBasePath === '/' ? '/' : roleBasePath}>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="relative text-gray-500 hover:text-violet-600"
                  >
                    <Bell className="h-5 w-5" />
                    <span className="absolute right-1.5 top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-violet-600 text-[10px] font-bold text-white">
                      3
                    </span>
                    <span className="sr-only">Notificações</span>
                  </Button>
                </Link>
              </TooltipTrigger>
              <TooltipContent side="bottom">Notificações</TooltipContent>
            </Tooltip>

            {/* Messages */}
            <Tooltip delayDuration={0}>
              <TooltipTrigger asChild>
                <Link href={roleBasePath === '/' ? '/' : `${roleBasePath}/messages`}>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="relative text-gray-500 hover:text-violet-600"
                  >
                    <MessageSquare className="h-5 w-5" />
                    <span className="absolute right-1.5 top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-violet-600 text-[10px] font-bold text-white">
                      5
                    </span>
                    <span className="sr-only">Mensagens</span>
                  </Button>
                </Link>
              </TooltipTrigger>
              <TooltipContent side="bottom">Mensagens</TooltipContent>
            </Tooltip>

            <Separator orientation="vertical" className="mx-1 h-8 bg-gray-200" />

            {/* User dropdown area */}
            <div className="flex items-center gap-3">
              <Avatar className="h-8 w-8 cursor-pointer border-2 border-violet-200 transition-colors hover:border-violet-400">
                <AvatarImage src={user?.avatar || undefined} alt={user?.displayName || ''} />
                <AvatarFallback className="bg-violet-100 text-xs font-semibold text-violet-700">
                  {userInitials}
                </AvatarFallback>
              </Avatar>
              <div className="hidden flex-col lg:flex">
                <span className="text-sm font-medium text-gray-900">
                  {user?.displayName || 'Usuário'}
                </span>
                <span className="text-xs text-gray-500">
                  {role ? ROLE_LABELS[role] : ''}
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
