'use client'

import { useEffect, useRef } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import type { LucideIcon } from 'lucide-react'

interface StatsCardProps {
  title: string
  value: number | string
  change?: number
  changeLabel?: string
  icon: LucideIcon
  iconColor?: string
  className?: string
}

export function StatsCard({
  title,
  value,
  change,
  changeLabel,
  icon: Icon,
  iconColor = 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/50',
  className,
}: StatsCardProps) {
  const displayValue = typeof value === 'number' ? value.toLocaleString('pt-BR') : value

  return (
    <Card className={cn('transition-all hover:shadow-md', className)}>
      <CardContent className="p-4 md:p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold tracking-tight">{displayValue}</p>
            {change !== undefined && (
              <div className="flex items-center gap-1">
                <span
                  className={cn(
                    'text-xs font-medium',
                    change >= 0 ? 'text-emerald-600' : 'text-red-500'
                  )}
                >
                  {change >= 0 ? '+' : ''}{change}%
                </span>
                {changeLabel && (
                  <span className="text-xs text-muted-foreground">{changeLabel}</span>
                )}
              </div>
            )}
          </div>
          <div className={cn('rounded-lg p-2.5', iconColor)}>
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
