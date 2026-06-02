'use client'

import React from 'react'
import { cn } from '@/lib/utils'
import { Skeleton } from '@/components/ui/skeleton'

// -----------------------------------------------------------------------------
// PageLoader - Full page skeleton for initial load
// -----------------------------------------------------------------------------

export function PageLoader({ className }: { className?: string }) {
  return (
    <div className={cn('flex min-h-screen items-center justify-center', className)}>
      <div className="flex flex-col items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-100">
          <div className="h-6 w-6 animate-pulse rounded-md bg-violet-400" />
        </div>
        <div className="flex flex-col items-center gap-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-24" />
        </div>
        <div className="mt-2 flex items-center gap-1.5">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="h-2 w-2 animate-bounce rounded-full bg-violet-400"
              style={{ animationDelay: `${i * 150}ms` }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

// -----------------------------------------------------------------------------
// ContentLoader - Inline content skeleton
// -----------------------------------------------------------------------------

export function ContentLoader({ className }: { className?: string }) {
  return (
    <div className={cn('space-y-6 p-6', className)}>
      <div className="space-y-2">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-96" />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="rounded-xl border bg-white p-6"
          >
            <div className="flex items-center justify-between">
              <Skeleton className="h-10 w-10 rounded-lg" />
              <Skeleton className="h-4 w-16" />
            </div>
            <Skeleton className="mt-4 h-8 w-24" />
            <Skeleton className="mt-2 h-3 w-32" />
          </div>
        ))}
      </div>
      <div className="rounded-xl border bg-white p-6">
        <Skeleton className="h-4 w-48" />
        <div className="mt-4 space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4">
              <Skeleton className="h-4 w-4" />
              <Skeleton className="h-4 w-48" />
              <Skeleton className="ml-auto h-4 w-20" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// -----------------------------------------------------------------------------
// TableLoader - Table skeleton for data loading
// -----------------------------------------------------------------------------

export function TableLoader({
  rows = 5,
  cols = 5,
  className,
}: {
  rows?: number
  cols?: number
  className?: string
}) {
  return (
    <div className={cn('w-full space-y-3 rounded-xl border bg-white p-6', className)}>
      {/* Header actions */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-10 w-64" />
        <div className="flex gap-2">
          <Skeleton className="h-9 w-24" />
          <Skeleton className="h-9 w-9" />
        </div>
      </div>

      {/* Table header */}
      <div className="rounded-lg border">
        <div className="flex items-center border-b bg-gray-50/50 px-4 py-3">
          {Array.from({ length: cols }).map((_, i) => (
            <Skeleton
              key={i}
              className="h-4 flex-1"
              style={{ maxWidth: i === 0 ? '40%' : '20%' }}
            />
          ))}
        </div>

        {/* Table rows */}
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div
            key={rowIndex}
            className="flex items-center border-b px-4 py-4 last:border-0"
          >
            {Array.from({ length: cols }).map((_, colIndex) => (
              <Skeleton
                key={colIndex}
                className="h-4 flex-1"
                style={{
                  maxWidth: colIndex === 0 ? '40%' : '20%',
                  opacity: 1 - rowIndex * 0.1,
                }}
              />
            ))}
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-40" />
        <div className="flex gap-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-8 w-8 rounded" />
          ))}
        </div>
      </div>
    </div>
  )
}

// -----------------------------------------------------------------------------
// CardLoader - Card skeleton
// -----------------------------------------------------------------------------

export function CardLoader({
  lines = 3,
  className,
}: {
  lines?: number
  className?: string
}) {
  return (
    <div className={cn('rounded-xl border bg-white p-6', className)}>
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <Skeleton className="h-5 w-36" />
          <Skeleton className="h-3 w-24" />
        </div>
        <Skeleton className="h-9 w-9 rounded-lg" />
      </div>
      <div className="mt-4 space-y-2">
        <Skeleton className="h-8 w-20" />
        <Skeleton className="h-3 w-28" />
      </div>
      {lines > 3 && (
        <div className="mt-4 space-y-2">
          {Array.from({ length: lines - 3 }).map((_, i) => (
            <Skeleton key={i} className="h-3 w-full" style={{ maxWidth: `${100 - i * 10}%` }} />
          ))}
        </div>
      )}
    </div>
  )
}

// -----------------------------------------------------------------------------
// KPI Card Loader
// -----------------------------------------------------------------------------

export function KPICardLoader({ className }: { className?: string }) {
  return (
    <div className={cn('rounded-xl border bg-white p-6', className)}>
      <div className="flex items-center justify-between">
        <Skeleton className="h-10 w-10 rounded-lg" />
        <Skeleton className="h-5 w-12 rounded-full" />
      </div>
      <Skeleton className="mt-3 h-8 w-24" />
      <Skeleton className="mt-1 h-3 w-32" />
    </div>
  )
}

// -----------------------------------------------------------------------------
// Grid Loader
// -----------------------------------------------------------------------------

export function GridLoader({
  count = 6,
  cols = 3,
  className,
}: {
  count?: number
  cols?: number
  className?: string
}) {
  return (
    <div
      className={cn(
        'grid gap-4',
        cols === 2 && 'grid-cols-1 sm:grid-cols-2',
        cols === 3 && 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
        cols === 4 && 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
        className
      )}
    >
      {Array.from({ length: count }).map((_, i) => (
        <CardLoader key={i} />
      ))}
    </div>
  )
}
