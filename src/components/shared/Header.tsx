'use client'

import { useRouter } from 'next/navigation'
import { Menu, LogOut } from 'lucide-react'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { obterIniciais } from '@/lib/utils'

interface HeaderProps {
  nomeUsuario: string
  avatarUrl?: string | null
  onToggleSidebar: () => void
}

export function Header({ nomeUsuario, avatarUrl, onToggleSidebar }: HeaderProps) {
  const router = useRouter()

  async function handleLogout() {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      toast.success('Até logo!')
      router.push('/login')
    } catch {
      toast.error('Erro ao sair')
    }
  }

  return (
    <motion.header
      initial={{ y: -56, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="h-14 bg-[#1e3a5f] text-white flex items-center justify-between px-4 sticky top-0 z-40"
    >
      {/* Left: Menu button */}
      <button
        onClick={onToggleSidebar}
        className="flex items-center justify-center w-11 h-11 rounded-lg active:opacity-80"
        aria-label="Abrir menu"
      >
        <Menu className="w-6 h-6" />
      </button>

      {/* Center: Logo */}
      <span className="text-lg font-semibold select-none">Orkestrando</span>

      {/* Right: Avatar + Logout */}
      <div className="flex items-center gap-3">
        <Avatar className="w-7 h-7">
          {avatarUrl && (
            <img src={avatarUrl} alt={nomeUsuario} className="aspect-square size-full rounded-full object-cover" />
          )}
          <AvatarFallback className="bg-white/20 text-white text-xs font-medium">
            {obterIniciais(nomeUsuario)}
          </AvatarFallback>
        </Avatar>

        <button
          onClick={handleLogout}
          className="flex items-center justify-center w-11 h-11 rounded-lg active:opacity-80"
          aria-label="Sair"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </div>
    </motion.header>
  )
}
