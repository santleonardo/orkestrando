'use client'

import Link from 'next/link'
import { CalendarDays, MessageSquare, FolderOpen, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Badge } from '@/components/ui/badge'

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
  rotaAtiva: string
}

interface NavItem {
  href: string
  icon: React.ElementType
  label: string
  disabled?: boolean
  badge?: string
}

const navItems: NavItem[] = [
  {
    href: '/dashboard/professor',
    icon: CalendarDays,
    label: 'Calendário',
  },
  {
    href: '#',
    icon: MessageSquare,
    label: 'Mensagens',
    disabled: true,
    badge: 'Em breve',
  },
  {
    href: '#',
    icon: FolderOpen,
    label: 'Arquivos',
    disabled: true,
    badge: 'Em breve',
  },
]

function NavLinks({ rotaAtiva }: { rotaAtiva: string }) {
  return (
    <nav className="flex flex-col gap-1 px-3">
      {navItems.map((item) => {
        const isActive = !item.disabled && rotaAtiva === item.href
        const Icon = item.icon

        if (item.disabled) {
          return (
            <div
              key={item.label}
              className="flex items-center gap-3 min-h-[44px] px-3 py-2 rounded-lg text-[#374151] opacity-50 cursor-not-allowed select-none"
            >
              <Icon className="w-5 h-5 shrink-0" />
              <span className="text-sm flex-1">{item.label}</span>
              {item.badge && (
                <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-5">
                  {item.badge}
                </Badge>
              )}
            </div>
          )
        }

        return (
          <Link
            key={item.label}
            href={item.href}
            className={`flex items-center gap-3 min-h-[44px] px-3 py-2 rounded-lg text-sm transition-colors ${
              isActive
                ? 'bg-[#1e3a5f] text-white font-medium'
                : 'text-[#374151] active:bg-gray-100'
            }`}
          >
            <Icon className="w-5 h-5 shrink-0" />
            <span className="flex-1">{item.label}</span>
          </Link>
        )
      })}
    </nav>
  )
}

function SidebarContent({ rotaAtiva, onClose }: { rotaAtiva: string; onClose: () => void }) {
  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 h-14 border-b border-gray-100">
        <span className="text-lg font-semibold text-[#1e3a5f]">Orkestrando</span>
        <button
          onClick={onClose}
          className="flex items-center justify-center w-11 h-11 rounded-lg active:opacity-80 lg:hidden"
          aria-label="Fechar menu"
        >
          <X className="w-5 h-5 text-gray-500" />
        </button>
      </div>

      {/* Navigation */}
      <div className="flex-1 py-4">
        <NavLinks rotaAtiva={rotaAtiva} />
      </div>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-gray-100">
        <p className="text-xs text-gray-400">v0.1.0 — MVP</p>
      </div>
    </div>
  )
}

export function Sidebar({ isOpen, onClose, rotaAtiva }: SidebarProps) {
  return (
    <>
      {/* Mobile: Sheet drawer from left */}
      <div className="lg:hidden">
        <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
          <SheetContent side="left" className="w-[280px] p-0 bg-white">
            <SheetHeader className="sr-only">
              <SheetTitle>Menu de navegação</SheetTitle>
            </SheetHeader>
            <SidebarContent rotaAtiva={rotaAtiva} onClose={onClose} />
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop: Fixed sidebar */}
      <AnimatePresence>
        <motion.aside
          initial={{ x: -240, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="hidden lg:block fixed left-0 top-14 bottom-0 w-60 bg-white border-r border-gray-100 z-30"
        >
          <SidebarContent rotaAtiva={rotaAtiva} onClose={onClose} />
        </motion.aside>
      </AnimatePresence>
    </>
  )
}
