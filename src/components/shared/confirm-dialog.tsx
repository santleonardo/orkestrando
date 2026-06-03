'use client'

import React from 'react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { cn } from '@/lib/utils'

// -----------------------------------------------------------------------------
// Confirm Dialog Component
// -----------------------------------------------------------------------------

interface ConfirmDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: string
  confirmLabel?: string
  cancelLabel?: string
  onConfirm: () => void | Promise<void>
  variant?: 'default' | 'destructive'
  loading?: boolean
  children?: React.ReactNode
}

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  onConfirm,
  variant = 'default',
  loading = false,
  children,
}: ConfirmDialogProps) {
  const handleConfirm = async () => {
    await onConfirm()
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          {children ? (
            children
          ) : (
            <>
              <AlertDialogTitle className="text-left">{title}</AlertDialogTitle>
              {description && (
                <AlertDialogDescription className="text-left">
                  {description}
                </AlertDialogDescription>
              )}
            </>
          )}
        </AlertDialogHeader>
        <AlertDialogFooter className="gap-2 sm:gap-0">
          <AlertDialogCancel disabled={loading}>
            {cancelLabel}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault()
              handleConfirm()
            }}
            disabled={loading}
            className={cn(
              variant === 'destructive' &&
                'bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-600/20'
            )}
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                Processando...
              </span>
            ) : (
              confirmLabel
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

// -----------------------------------------------------------------------------
// Delete Confirmation Dialog (preset)
// -----------------------------------------------------------------------------

interface DeleteConfirmDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title?: string
  description?: string
  itemName?: string
  onConfirm: () => void | Promise<void>
  loading?: boolean
}

export function DeleteConfirmDialog({
  open,
  onOpenChange,
  title = 'Excluir item',
  description,
  itemName,
  onConfirm,
  loading = false,
}: DeleteConfirmDialogProps) {
  const defaultDescription = itemName
    ? `Tem certeza que deseja excluir "${itemName}"? Esta ação não pode ser desfeita.`
    : 'Tem certeza que deseja excluir este item? Esta ação não pode ser desfeita.'

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      description={description || defaultDescription}
      confirmLabel="Excluir"
      cancelLabel="Manter"
      onConfirm={onConfirm}
      variant="destructive"
      loading={loading}
    />
  )
}

// -----------------------------------------------------------------------------
// Discard Changes Dialog (preset)
// -----------------------------------------------------------------------------

interface DiscardChangesDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void | Promise<void>
  loading?: boolean
}

export function DiscardChangesDialog({
  open,
  onOpenChange,
  onConfirm,
  loading = false,
}: DiscardChangesDialogProps) {
  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Descartar alterações?"
      description="Você tem alterações não salvas que serão perdidas se continuar."
      confirmLabel="Descartar"
      cancelLabel="Cancelar"
      onConfirm={onConfirm}
      variant="destructive"
      loading={loading}
    />
  )
}
