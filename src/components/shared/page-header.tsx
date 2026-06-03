'use client'

import React from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

// -----------------------------------------------------------------------------
// Page Header Component
// -----------------------------------------------------------------------------

interface PageHeaderProps {
  title: string
  description?: string
  actions?: React.ReactNode
  breadcrumbs?: Array<{
    label: string
    href?: string
  }>
  className?: string
  children?: React.ReactNode
}

export function PageHeader({
  title,
  description,
  actions,
  breadcrumbs,
  className,
  children,
}: PageHeaderProps) {
  return (
    <div className={cn('mb-6', className)}>
      {/* Breadcrumbs */}
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav className="mb-3 flex items-center gap-1.5 text-sm text-gray-500">
          {breadcrumbs.map((crumb, index) => (
            <React.Fragment key={index}>
              {index > 0 && (
                <span className="text-gray-300">/</span>
              )}
              {crumb.href ? (
                <a
                  href={crumb.href}
                  className="hover:text-violet-600 transition-colors"
                >
                  {crumb.label}
                </a>
              ) : (
                <span className="font-medium text-gray-700">{crumb.label}</span>
              )}
            </React.Fragment>
          ))}
        </nav>
      )}

      {/* Header content */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex-1">
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            {title}
          </h1>
          {description && (
            <p className="mt-1 text-sm text-gray-500">{description}</p>
          )}
          {children}
        </div>

        {actions && (
          <div className="flex shrink-0 items-center gap-2">{actions}</div>
        )}
      </div>
    </div>
  )
}

// -----------------------------------------------------------------------------
// Compact Page Header (for inner pages)
// -----------------------------------------------------------------------------

interface CompactPageHeaderProps {
  title: string
  description?: string
  actions?: React.ReactNode
  className?: string
}

export function CompactPageHeader({
  title,
  description,
  actions,
  className,
}: CompactPageHeaderProps) {
  return (
    <div className={cn('mb-4 flex items-center justify-between', className)}>
      <div>
        <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
        {description && (
          <p className="mt-0.5 text-sm text-gray-500">{description}</p>
        )}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  )
}

// -----------------------------------------------------------------------------
// Section Header (for sections within a page)
// -----------------------------------------------------------------------------

interface SectionHeaderProps {
  title: string
  description?: string
  action?: React.ReactNode
  className?: string
}

export function SectionHeader({
  title,
  description,
  action,
  className,
}: SectionHeaderProps) {
  return (
    <div className={cn('mb-4 flex items-center justify-between', className)}>
      <div>
        <h3 className="text-base font-semibold text-gray-800">{title}</h3>
        {description && (
          <p className="mt-0.5 text-sm text-gray-500">{description}</p>
        )}
      </div>
      {action}
    </div>
  )
}
