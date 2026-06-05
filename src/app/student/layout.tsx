'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  Home,
  CalendarDays,
  FileText,
  ClipboardCheck,
  GraduationCap,
  History,
  Bell,
  LogOut,
  Building2,
  Settings,
  Menu,
} from 'lucide-react'
import { SidebarProvider, Sidebar, SidebarContent, SidebarHeader, SidebarFooter, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarGroup, SidebarGroupLabel, SidebarGroupContent, SidebarInset, SidebarTrigger, SidebarRail, SidebarSeparator } from '@/components/ui/sidebar'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

const studentNavItems = [
  { title: 'Início', href: '/student', icon: Home },
  { title: 'Agenda', href: '/student/schedule', icon: CalendarDays },
  { title: 'Materiais', href: '/student/materials', icon: FileText },
  { title: 'Frequência', href: '/student/attendance', icon: ClipboardCheck },
  { title: 'Notas', href: '/student/grades', icon: GraduationCap },
  { title: 'Histórico', href: '/student/history', icon: History },
]

function isActivePath(pathname: string, href: string): boolean {
  if (href === '/student') return pathname === '/student'
  return pathname.startsWith(href)
}

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <SidebarProvider>
      <Sidebar collapsible="icon" className="border-r border-border/50">
        <SidebarHeader className="p-3">
          <Link href="/" className="flex items-center gap-2 px-1">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-600 text-white">
              <Building2 className="h-4 w-4" />
            </div>
            <div className="flex flex-col group-data-[collapsible=icon]:hidden">
              <span className="text-sm font-bold leading-tight text-foreground">ORKESTRANDO</span>
              <span className="text-[10px] text-muted-foreground">Portal do Aluno</span>
            </div>
          </Link>
        </SidebarHeader>
        <SidebarSeparator />
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Menu</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {studentNavItems.map((item) => (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton asChild isActive={isActivePath(pathname, item.href)} tooltip={item.title}>
                      <Link href={item.href}>
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter>
          <SidebarSeparator />
          <div className="p-2">
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Configurações">
                  <Link href="/settings">
                    <Settings className="h-4 w-4" />
                    <span>Configurações</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </div>
          <div className="p-2 group-data-[collapsible=icon]:p-0">
            <div className="flex items-center gap-3 rounded-lg p-2 group-data-[collapsible=icon]:justify-center">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-teal-100 text-teal-700 text-xs">
                  AC
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col group-data-[collapsible=icon]:hidden">
                <span className="text-sm font-medium leading-tight">Ana Clara Mendes</span>
                <span className="text-[10px] text-muted-foreground">Música — 3º Semestre</span>
              </div>
              <Button variant="ghost" size="icon" className="ml-auto h-7 w-7 group-data-[collapsible=icon]:hidden">
                <LogOut className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        </SidebarFooter>
        <SidebarRail />
      </Sidebar>
      <SidebarInset>
        <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4 lg:px-6">
          <SidebarTrigger />
          <div className="flex-1" />
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="relative h-9 w-9">
              <Bell className="h-4 w-4" />
              <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-teal-600 text-[9px] text-white flex items-center justify-center">
                2
              </span>
            </Button>
          </div>
        </header>
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="flex-1 p-4 lg:p-6"
        >
          {children}
        </motion.div>
      </SidebarInset>
    </SidebarProvider>
  )
}
