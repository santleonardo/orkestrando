'use client'

import React from 'react'
import { useStore } from '@/lib/store'
import { cn } from '@/lib/utils'
import { getInitials } from './helpers'
import { getMenuForRole } from './constants'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Sheet, SheetContent } from '@/components/ui/sheet'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { GraduationCap, Settings, LogOut, Menu, Bell } from 'lucide-react'

/* ─── Sidebar ─── */

function SidebarNav({ onNavigate }: { onNavigate: () => void }) {
  const { user, activeView, setActiveView, logout, notifications } = useStore()
  const menu = getMenuForRole(user?.role || 'STUDENT')
  const unreadCount = notifications.filter(n => !n.isRead).length

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 px-6 py-5 border-b">
        <GraduationCap className="h-7 w-7 text-emerald-600" />
        <span className="text-lg font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">Orkestrando</span>
      </div>

      <div className="px-4 py-3">
        <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-muted/50">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-emerald-100 text-emerald-700 text-xs font-bold">{getInitials(user?.displayName || 'U')}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{user?.displayName}</p>
            <p className="text-xs text-muted-foreground capitalize">{user?.role?.toLowerCase()}</p>
          </div>
        </div>
      </div>

      <ScrollArea className="flex-1 px-3">
        <nav className="space-y-1 pb-4">
          {menu.map(item => (
            <button
              key={item.id}
              onClick={() => { setActiveView(item.id); onNavigate() }}
              className={cn(
                'w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                activeView === item.id
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
              {item.id === 'messages' && unreadCount > 0 && (
                <span className="ml-auto bg-emerald-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">{unreadCount}</span>
              )}
            </button>
          ))}
        </nav>
      </ScrollArea>

      <div className="border-t p-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="w-full justify-start gap-3 text-muted-foreground">
              <Settings className="h-4 w-4" /> Configurações
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuItem onClick={() => { logout(); onNavigate() }}>
              <LogOut className="h-4 w-4 mr-2" /> Sair
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}

export function AppSidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <>
      <aside className="hidden lg:flex flex-col w-64 border-r bg-card h-screen sticky top-0">
        <SidebarNav onNavigate={() => {}} />
      </aside>
      <Sheet open={open} onOpenChange={onClose}>
        <SheetContent side="left" className="w-72 p-0">
          <SidebarNav onNavigate={onClose} />
        </SheetContent>
      </Sheet>
    </>
  )
}

/* ─── Header ─── */

export function AppHeader({ onMenuClick }: { onMenuClick: () => void }) {
  const { user, notifications, activeView } = useStore()
  const unread = notifications.filter(n => !n.isRead).length
  const viewLabel = activeView.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())

  return (
    <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b h-16 flex items-center justify-between px-4 lg:px-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" className="lg:hidden" onClick={onMenuClick}>
          <Menu className="h-5 w-5" />
        </Button>
        <h2 className="text-lg font-semibold">{viewLabel}</h2>
      </div>
      <div className="flex items-center gap-2">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-4 w-4" />
                {unread > 0 && <span className="absolute -top-0.5 -right-0.5 bg-emerald-600 text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center">{unread}</span>}
              </Button>
            </TooltipTrigger>
            <TooltipContent><p>Notificações</p></TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <Avatar className="h-8 w-8">
          <AvatarFallback className="bg-emerald-100 text-emerald-700 text-xs font-bold">{getInitials(user?.displayName || 'U')}</AvatarFallback>
        </Avatar>
      </div>
    </header>
  )
}

/* ─── App Shell ─── */

export function AppShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = React.useState(false)

  React.useEffect(() => {
    useStore.getState().fetchNotifications()
  }, [])

  return (
    <div className="flex min-h-screen bg-background">
      <AppSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col min-w-0">
        <AppHeader onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 p-4 lg:p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
