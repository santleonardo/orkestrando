'use client'

import { useEffect } from 'react'
import { useAuthStore } from '@/store/auth-store'
import { LoginPage } from '@/components/orkestrando/login-page'
import { AppShell } from '@/components/orkestrando/layout/app-shell'
import { LoadingSpinner } from '@/components/orkestrando/shared/loading-spinner'

export default function Home() {
  const { user, isAuthenticated, isLoading, setUser } = useAuthStore()

  // Check if session persisted from localStorage on mount
  useEffect(() => {
    if (isAuthenticated && user) return
  }, [])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <LoadingSpinner text="Carregando ORKESTRANDO..." />
      </div>
    )
  }

  if (!isAuthenticated) {
    return <LoginPage />
  }

  return <AppShell />
}
