'use client'

import React from 'react'
import { AppLayout } from '@/components/layout/app-layout'
import { PageLoader } from '@/components/shared/loading'

// AuthProvider foi movido para src/app/layout.tsx (root layout).
// Mantê-lo aqui causaria duplo contexto, o que não quebra mas é desnecessário.

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <React.Suspense fallback={<PageLoader />}>
      <AppLayout>{children}</AppLayout>
    </React.Suspense>
  )
}
