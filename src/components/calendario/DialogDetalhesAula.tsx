'use client'

import { Info } from 'lucide-react'

import type { Aula } from '@/lib/types'
import { formatarDataHora } from '@/lib/utils'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface DialogDetalhesAulaProps {
  aberto: boolean
  onFechar: () => void
  aula: Aula | null
}

function getStatusBadge(aula: Aula) {
  switch (aula.status) {
    case 'agendada':
      return (
        <Badge className="bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-100">
          Agendada
        </Badge>
      )
    case 'realizada':
      return (
        <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 hover:bg-emerald-100">
          Realizada
        </Badge>
      )
    case 'cancelada':
      return (
        <Badge className="bg-red-100 text-red-800 border-red-200 hover:bg-red-100">
          Cancelada
        </Badge>
      )
    default:
      return null
  }
}

export function DialogDetalhesAula({
  aberto,
  onFechar,
  aula,
}: DialogDetalhesAulaProps) {
  if (!aula) return null

  return (
    <Dialog open={aberto} onOpenChange={(open) => !open && onFechar()}>
      <DialogContent
        className="
          max-w-md w-full max-h-[90vh] overflow-y-auto
          rounded-t-2xl rounded-b-none
          fixed bottom-0 left-[50%] translate-x-[-50%] translate-y-0 top-auto
          sm:top-[50%] sm:bottom-auto sm:translate-x-[-50%] sm:translate-y-[-50%] sm:rounded-2xl
          data-[state=open]:animate-in data-[state=closed]:animate-out
          data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom
          sm:data-[state=open]:zoom-in-95 sm:data-[state=closed]:zoom-out-95
          sm:data-[state=open]:slide-in-from-bottom-0 sm:data-[state=closed]:slide-out-to-bottom-0
        "
      >
        <DialogHeader>
          <div className="mb-1">{getStatusBadge(aula)}</div>
          <DialogTitle className="text-xl font-semibold">
            {aula.titulo}
          </DialogTitle>
          <DialogDescription className="sr-only">
            Detalhes da aula {aula.titulo}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-1">
          {/* Matéria */}
          {aula.materia?.nome && (
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">
                Matéria
              </p>
              <p className="text-sm">{aula.materia.nome}</p>
            </div>
          )}

          {/* Turma */}
          {aula.materia?.turma?.nome && (
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">
                Turma
              </p>
              <p className="text-sm">{aula.materia.turma.nome}</p>
            </div>
          )}

          {/* Data e hora */}
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">
              Data e hora
            </p>
            <p className="text-sm">
              {formatarDataHora(aula.data_hora_inicio)} —{' '}
              {formatarDataHora(aula.data_hora_fim)}
            </p>
          </div>

          {/* Descrição */}
          {aula.descricao && (
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">
                Descrição
              </p>
              <p className="text-sm whitespace-pre-wrap">{aula.descricao}</p>
            </div>
          )}
        </div>

        {/* Notice */}
        <div className="flex items-start gap-2 rounded-lg bg-muted/50 p-3">
          <Info className="size-4 shrink-0 text-muted-foreground mt-0.5" />
          <p className="text-xs text-muted-foreground">
            Aulas são gerenciadas pelo coordenador
          </p>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            className="w-full sm:w-auto"
            onClick={onFechar}
          >
            Fechar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
