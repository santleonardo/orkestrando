'use client'

import React from 'react'
import { AuthProvider } from '@/hooks/use-auth'
import { AppLayout } from '@/components/layout/app-layout'
import { PageLoader } from '@/components/shared/loading'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AuthProvider>
      <React.Suspense fallback={<PageLoader />}>
        <AppLayout>{children}</AppLayout>
      </React.Suspense>
    </AuthProvider>
  )
}
