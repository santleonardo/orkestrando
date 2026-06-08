'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Skeleton } from '@/components/ui/skeleton'

interface AuthGuardProps {
  allowedRole: string
  children: React.ReactNode
}

const roleDashboardMap: Record<string, string> = {
  professor: '/dashboard/professor',
  coordenador: '/dashboard/coordenador',
  aluno: '/dashboard/aluno',
}

function LoadingSkeleton() {
  return (
    <div className="flex min-h-screen bg-white">
      {/* Sidebar skeleton — hidden on mobile */}
      <div className="hidden lg:block w-60 bg-slate-100 animate-pulse shrink-0" />

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        {/* Top bar skeleton */}
        <div className="h-14 bg-slate-200 animate-pulse" />

        {/* Content area */}
        <div className="flex-1 p-6 space-y-4">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-72" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
            <Skeleton className="h-32 rounded-lg" />
            <Skeleton className="h-32 rounded-lg" />
            <Skeleton className="h-32 rounded-lg" />
          </div>
          <Skeleton className="h-64 rounded-lg" />
        </div>
      </div>
    </div>
  )
}

export function AuthGuard({ allowedRole, children }: AuthGuardProps) {
  const router = useRouter()
  const [isChecking, setIsChecking] = useState(true)

  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch('/api/usuarios/me')

        if (!res.ok) {
          // Not authenticated
          router.replace('/login')
          return
        }

        const data = await res.json()

        // If role doesn't match, redirect to correct dashboard
        const role = data.data?.role
        if (role && role !== allowedRole) {
          const correctDashboard = roleDashboardMap[role] || '/login'
          router.replace(correctDashboard)
          return
        }

        setIsChecking(false)
      } catch {
        router.replace('/login')
      }
    }

    checkAuth()
  }, [allowedRole, router])

  if (isChecking) {
    return <LoadingSkeleton />
  }

  return <>{children}</>
}
