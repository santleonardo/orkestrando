'use client'

import React from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

export function formatDate(d: string | Date) {
  return new Date(d).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })
}

export function getInitials(name: string) {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
}

export function getRoleColor(role: string) {
  switch (role) {
    case 'COORDINATOR': return 'bg-emerald-100 text-emerald-800'
    case 'PROFESSOR': return 'bg-teal-100 text-teal-800'
    case 'STUDENT': return 'bg-amber-100 text-amber-800'
    default: return 'bg-gray-100 text-gray-800'
  }
}

export function getAttendanceColor(status: string) {
  switch (status) {
    case 'PRESENT': return 'bg-emerald-100 text-emerald-700'
    case 'ABSENT': return 'bg-red-100 text-red-700'
    case 'LATE': return 'bg-amber-100 text-amber-700'
    case 'EXCUSED': return 'bg-blue-100 text-blue-700'
    default: return 'bg-gray-100 text-gray-700'
  }
}

export function getAttendanceLabel(status: string) {
  switch (status) {
    case 'PRESENT': return 'Presente'
    case 'ABSENT': return 'Ausente'
    case 'LATE': return 'Atrasado'
    case 'EXCUSED': return 'Justificado'
    default: return status
  }
}

export function EmptyState({ icon: Icon, title, description }: { icon: React.ElementType; title: string; description: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="rounded-full bg-muted p-4 mb-4"><Icon className="h-8 w-8 text-muted-foreground" /></div>
      <h3 className="text-lg font-semibold mb-1">{title}</h3>
      <p className="text-sm text-muted-foreground max-w-sm">{description}</p>
    </div>
  )
}

export function LoadingCard() {
  return (
    <Card className="shadow-sm">
      <CardHeader><Skeleton className="h-5 w-1/3" /><Skeleton className="h-4 w-1/2 mt-2" /></CardHeader>
      <CardContent><Skeleton className="h-24 w-full" /></CardContent>
    </Card>
  )
}

export function UserAvatar({ name, size = 'sm' }: { name: string; size?: 'sm' | 'md' }) {
  const colorMap: Record<string, string> = {
    'sm': 'h-8 w-8 text-xs',
    'md': 'h-9 w-9 text-xs',
  }
  return (
    <Avatar className={colorMap[size]}>
      <AvatarFallback className="bg-emerald-100 text-emerald-700 text-xs font-bold">{getInitials(name || 'U')}</AvatarFallback>
    </Avatar>
  )
}

export function StatusBadge({ active }: { active: boolean }) {
  return <Badge className={active ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'} variant="outline">{active ? 'Ativo' : 'Inativo'}</Badge>
}
