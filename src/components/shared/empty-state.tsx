'use client'

import React from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

// -----------------------------------------------------------------------------
// Empty State Component
// -----------------------------------------------------------------------------

interface EmptyStateProps {
  icon?: React.ReactNode
  title: string
  description?: string
  actionLabel?: string
  actionOnClick?: () => void
  secondaryActionLabel?: string
  secondaryActionOnClick?: () => void
  children?: React.ReactNode
  className?: string
  variant?: 'default' | 'compact'
}

export function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  actionOnClick,
  secondaryActionLabel,
  secondaryActionOnClick,
  children,
  className,
  variant = 'default',
}: EmptyStateProps) {
  if (variant === 'compact') {
    return (
      <div
        className={cn(
          'flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-300 bg-gray-50/50 px-6 py-10',
          className
        )}
      >
        {icon && (
          <div className="mb-3 text-gray-300">{icon}</div>
        )}
        <div className="text-center">
          <h3 className="text-sm font-medium text-gray-700">{title}</h3>
          {description && (
            <p className="mt-1 text-xs text-gray-500">{description}</p>
          )}
        </div>
        {children}
        {(actionLabel || secondaryActionLabel) && (
          <div className="mt-4 flex items-center gap-2">
            {secondaryActionLabel && secondaryActionOnClick && (
              <Button
                variant="outline"
                size="sm"
                onClick={secondaryActionOnClick}
                className="border-gray-200 text-gray-600 text-xs"
              >
                {secondaryActionLabel}
              </Button>
            )}
            {actionLabel && actionOnClick && (
              <Button
                size="sm"
                onClick={actionOnClick}
                className="bg-violet-600 text-white text-xs hover:bg-violet-700"
              >
                {actionLabel}
              </Button>
            )}
          </div>
        )}
      </div>
    )
  }

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center py-16 text-center',
        className
      )}
    >
      {icon && (
        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-violet-50 text-violet-400">
          {icon}
        </div>
      )}
      <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      {description && (
        <p className="mt-2 max-w-md text-sm leading-relaxed text-gray-500">
          {description}
        </p>
      )}
      {children}
      {(actionLabel || secondaryActionLabel) && (
        <div className="mt-8 flex items-center gap-3">
          {secondaryActionLabel && secondaryActionOnClick && (
            <Button
              variant="outline"
              onClick={secondaryActionOnClick}
              className="border-gray-200 text-gray-600"
            >
              {secondaryActionLabel}
            </Button>
          )}
          {actionLabel && actionOnClick && (
            <Button
              onClick={actionOnClick}
              className="bg-violet-600 text-white shadow-lg shadow-violet-600/25 hover:bg-violet-700"
            >
              {actionLabel}
            </Button>
          )}
        </div>
      )}
    </div>
  )
}

// -----------------------------------------------------------------------------
// Preset Empty States
// -----------------------------------------------------------------------------

import {
  BookOpen,
  Users,
  SearchX,
  Inbox,
  FileQuestion,
  GraduationCap,
  CalendarX,
} from 'lucide-react'

export function NoDataEmptyState({
  title = 'Nenhum dado encontrado',
  description = 'Não há dados disponíveis no momento.',
  actionLabel,
  actionOnClick,
  className,
}: {
  title?: string
  description?: string
  actionLabel?: string
  actionOnClick?: () => void
  className?: string
}) {
  return (
    <EmptyState
      icon={<Inbox className="h-10 w-10" />}
      title={title}
      description={description}
      actionLabel={actionLabel}
      actionOnClick={actionOnClick}
      className={className}
    />
  )
}

export function NoSearchResultsEmptyState({
  actionLabel,
  actionOnClick,
  className,
}: {
  actionLabel?: string
  actionOnClick?: () => void
  className?: string
}) {
  return (
    <EmptyState
      icon={<SearchX className="h-10 w-10" />}
      title="Nenhum resultado encontrado"
      description="Tente ajustar os filtros ou termos de busca."
      actionLabel={actionLabel}
      actionOnClick={actionOnClick}
      className={className}
    />
  )
}

export function NoStudentsEmptyState({
  actionLabel,
  actionOnClick,
  className,
}: {
  actionLabel?: string
  actionOnClick?: () => void
  className?: string
}) {
  return (
    <EmptyState
      icon={<BookOpen className="h-10 w-10" />}
      title="Nenhum aluno encontrado"
      description="Não há alunos cadastrados nesta turma ou período."
      actionLabel={actionLabel}
      actionOnClick={actionOnClick}
      className={className}
    />
  )
}

export function NoClassesEmptyState({
  actionLabel,
  actionOnClick,
  className,
}: {
  actionLabel?: string
  actionOnClick?: () => void
  className?: string
}) {
  return (
    <EmptyState
      icon={<CalendarX className="h-10 w-10" />}
      title="Nenhuma turma encontrada"
      description="Não há turmas disponíveis no momento."
      actionLabel={actionLabel}
      actionOnClick={actionOnClick}
      className={className}
    />
  )
}

export function NoMessagesEmptyState({
  actionLabel,
  actionOnClick,
  className,
}: {
  actionLabel?: string
  actionOnClick?: () => void
  className?: string
}) {
  return (
    <EmptyState
      icon={<FileQuestion className="h-10 w-10" />}
      title="Nenhuma mensagem"
      description="Você ainda não tem conversas. Inicie uma nova conversa!"
      actionLabel={actionLabel}
      actionOnClick={actionOnClick}
      className={className}
    />
  )
}
