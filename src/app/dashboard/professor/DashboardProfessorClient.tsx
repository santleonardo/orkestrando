'use client'

import { useState } from 'react'
import { Header } from '@/components/shared/Header'
import { Sidebar } from '@/components/shared/Sidebar'
import { AuthGuard } from '@/components/shared/AuthGuard'
import { CalendarioProfessor } from '@/components/calendario/CalendarioProfessor'

interface DashboardProfessorClientProps {
  nomeUsuario: string
  avatarUrl?: string | null
}

export function DashboardProfessorClient({ nomeUsuario, avatarUrl }: DashboardProfessorClientProps) {
  const [sidebarAberta, setSidebarAberta] = useState(false)

  function toggleSidebar() {
    setSidebarAberta((prev) => !prev)
  }

  function closeSidebar() {
    setSidebarAberta(false)
  }

  return (
    <AuthGuard allowedRole="professor">
      <div className="flex flex-col h-screen bg-[#f8fafc]">
        <Header
          nomeUsuario={nomeUsuario}
          avatarUrl={avatarUrl}
          onToggleSidebar={toggleSidebar}
        />
        <div className="flex flex-1 overflow-hidden">
          <Sidebar
            isOpen={sidebarAberta}
            onClose={closeSidebar}
            rotaAtiva="/dashboard/professor"
          />
          <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:ml-60">
            <h1 className="text-2xl font-bold text-[#0f172a]">Meu Calendário</h1>
            <p className="text-muted-foreground mt-1 mb-6">Gerencie sua disponibilidade</p>
            <CalendarioProfessor />
          </main>
        </div>
      </div>
    </AuthGuard>
  )
}
