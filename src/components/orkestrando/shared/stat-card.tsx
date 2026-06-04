'use client'

import { Card, CardContent } from '@/components/ui/card'
import { type LucideIcon } from 'lucide-react'
import { motion } from 'framer-motion'

interface StatCardProps {
  title: string
  value: string | number
  description?: string
  icon: LucideIcon
  trend?: {
    value: number
    label: string
  }
  color?: string
}

export function StatCard({ title, value, description, icon: Icon, trend, color = 'emerald' }: StatCardProps) {
  const colorClasses: Record<string, { bg: string; icon: string; trend: string }> = {
    emerald: { bg: 'bg-emerald-50', icon: 'text-emerald-600', trend: 'text-emerald-600' },
    blue: { bg: 'bg-sky-50', icon: 'text-sky-600', trend: 'text-sky-600' },
    amber: { bg: 'bg-amber-50', icon: 'text-amber-600', trend: 'text-amber-600' },
    rose: { bg: 'bg-rose-50', icon: 'text-rose-600', trend: 'text-rose-600' },
    purple: { bg: 'bg-violet-50', icon: 'text-violet-600', trend: 'text-violet-600' },
  }

  const c = colorClasses[color] || colorClasses.emerald

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="border-slate-200 shadow-sm hover:shadow-md transition-shadow">
        <CardContent className="p-4 sm:p-6">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium text-slate-500">{title}</p>
              <p className="text-2xl sm:text-3xl font-bold text-slate-900">{value}</p>
              {trend && (
                <p className={`text-xs font-medium ${c.trend}`}>
                  {trend.value > 0 ? '+' : ''}{trend.value}% {trend.label}
                </p>
              )}
              {description && (
                <p className="text-xs text-slate-400 mt-1">{description}</p>
              )}
            </div>
            <div className={`rounded-lg p-2.5 ${c.bg}`}>
              <Icon className={`h-5 w-5 ${c.icon}`} />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
