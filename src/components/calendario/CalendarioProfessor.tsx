'use client'

import { useMemo, useCallback } from 'react'
import { ChevronLeft, ChevronRight, CalendarDays } from 'lucide-react'
import { getDay } from 'date-fns'

import {
  cn,
  getDiasDoMes,
  getDiasDaSemana,
  getDiasDoSemestre,
  formatarChaveData,
  DiaCalendario,
} from '@/lib/utils'
import type { CalendarioEvento, Disponibilidade, Aula } from '@/lib/types'

import { useCalendarioProfessor } from './useCalendarioProfessor'
import { CalendarioGrid } from './CalendarioGrid'
import { CalendarioSemana } from './CalendarioSemana'
import { CalendarioSemestre } from './CalendarioSemestre'
import { DialogDisponibilidade } from './DialogDisponibilidade'
import { DialogDetalhesAula } from './DialogDetalhesAula'

import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'

const SEMESTRE_ATUAL = '2025.2'
const ANO_ATUAL = 2025

type Visualizacao = 'semana' | 'mes' | 'semestre'

export function CalendarioProfessor() {
  const {
    visualizacao,
    setVisualizacao,
    dataBase,
    carregando,
    erro,
    dialogAberto,
    dialogAulaAberto,
    diaSelecionado,
    disponibilidadeSelecionada,
    aulaSelecionada,
    tituloPeriodo,
    diasCalendario,
    eventosMap,
    disponibilidades,
    avancar,
    voltar,
    irParaHoje,
    abrirDialogNovo,
    abrirDialogEdicao,
    abrirDialogAula,
    fecharDialog,
    fecharDialogAula,
    salvarDisponibilidade,
    excluirDisponibilidade,
    carregarDados,
  } = useCalendarioProfessor()

  // Compute comprehensive eventos map including recurring disponibilidades
  // for every day in the current view. This avoids child components needing
  // to separately resolve recurring items from the disponibilidades array.
  const eventosCompleto = useMemo(() => {
    const map = new Map<string, CalendarioEvento[]>()

    // Copy all entries from the hook's map (non-recurring disponibilidades + aulas)
    for (const [key, eventos] of eventosMap) {
      map.set(key, [...eventos])
    }

    // Determine which days to process based on current visualization
    const diasParaProcessar: Date[] = []

    if (visualizacao === 'mes') {
      const dias = getDiasDoMes(dataBase)
      diasParaProcessar.push(...dias.map((d) => d.data))
    } else if (visualizacao === 'semana') {
      const dias = getDiasDaSemana(dataBase)
      diasParaProcessar.push(...dias.map((d) => d.data))
    } else {
      const meses = getDiasDoSemestre(SEMESTRE_ATUAL, ANO_ATUAL)
      for (const mes of meses) {
        diasParaProcessar.push(...mes.dias.map((d) => d.data))
      }
    }

    // Add recurring disponibilidades for each day matching their dia_semana
    for (const dia of diasParaProcessar) {
      const diaSemana = getDay(dia) // 0=Sun, 6=Sat
      for (const disp of disponibilidades) {
        if (disp.recorrente && disp.dia_semana === diaSemana) {
          const key = formatarChaveData(dia)
          if (!map.has(key)) map.set(key, [])
          map.get(key)!.push({ tipo: 'disponibilidade', dados: disp })
        }
      }
    }

    return map
  }, [eventosMap, visualizacao, dataBase, disponibilidades])

  // Handle click on a day — opens new availability dialog
  const handleDiaClick = useCallback(
    (dia: Date) => {
      abrirDialogNovo(dia)
    },
    [abrirDialogNovo]
  )

  // Handle click on an event — routes to correct dialog based on type
  const handleEventoClick = useCallback(
    (evento: CalendarioEvento) => {
      if (evento.tipo === 'disponibilidade') {
        abrirDialogEdicao(evento.dados as Disponibilidade)
      } else {
        abrirDialogAula(evento.dados as Aula)
      }
    },
    [abrirDialogEdicao, abrirDialogAula]
  )

  // Compute semana dates for CalendarioSemana (first 7 days from getDiasDaSemana)
  const semanaDates = useMemo(() => {
    const dias = getDiasDaSemana(dataBase)
    return dias.slice(0, 7).map((d) => d.data)
  }, [dataBase])

  // Compute mesesDoSemestre for CalendarioSemestre
  const mesesDoSemestre = useMemo(
    () => getDiasDoSemestre(SEMESTRE_ATUAL, ANO_ATUAL),
    []
  )

  // Visualization toggle options
  const opcoesVisualizacao: { valor: Visualizacao; label: string }[] = [
    { valor: 'semana', label: 'Semana' },
    { valor: 'mes', label: 'Mês' },
    { valor: 'semestre', label: 'Semestre' },
  ]

  // ─── Loading State ───────────────────────────────────────────────
  if (carregando) {
    return (
      <div className="flex flex-col h-full">
        {/* Control bar skeleton */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 border-b border-border">
          <Skeleton className="h-9 w-56 rounded-full" />
          <div className="flex items-center gap-2">
            <Skeleton className="h-11 w-11 rounded-md" />
            <Skeleton className="h-9 w-40 rounded-md" />
            <Skeleton className="h-11 w-11 rounded-md" />
            <Skeleton className="h-9 w-16 rounded-md" />
          </div>
        </div>
        {/* Grid skeleton — 5 rows of 7 cells */}
        <div className="flex-1 p-4">
          <div className="grid grid-cols-7 gap-px">
            {Array.from({ length: 35 }).map((_, i) => (
              <Skeleton
                key={i}
                className="h-20 sm:h-24 rounded-sm animate-pulse"
              />
            ))}
          </div>
        </div>
      </div>
    )
  }

  // ─── Error State ─────────────────────────────────────────────────
  if (erro) {
    return (
      <div className="flex flex-col h-full items-center justify-center p-6">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 max-w-md w-full text-center">
          <CalendarDays className="mx-auto h-10 w-10 text-red-400 mb-3" />
          <p className="text-red-800 font-medium mb-2">
            Erro ao carregar calendário
          </p>
          <p className="text-red-600 text-sm mb-4">{erro}</p>
          <Button
            variant="outline"
            className="border-red-300 text-red-700 hover:bg-red-50"
            onClick={carregarDados}
          >
            Tentar novamente
          </Button>
        </div>
      </div>
    )
  }

  // ─── Main Render ─────────────────────────────────────────────────
  return (
    <div className="flex flex-col h-full">
      {/* ── Control Bar ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 border-b border-border">
        {/* Segmented visualization toggle */}
        <div className="inline-flex rounded-full bg-muted p-1 self-start">
          {opcoesVisualizacao.map((opcao) => (
            <button
              key={opcao.valor}
              className={cn(
                'rounded-full px-3 py-1.5 text-sm font-medium transition-colors',
                visualizacao === opcao.valor
                  ? 'bg-[#1e3a5f] text-white'
                  : 'text-muted-foreground'
              )}
              onClick={() => setVisualizacao(opcao.valor)}
            >
              {opcao.label}
            </button>
          ))}
        </div>

        {/* Navigation: ← | period title | → | Hoje */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            className="min-h-[44px] min-w-[44px]"
            onClick={voltar}
            aria-label="Período anterior"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <div className="flex-1 text-center min-w-[140px]">
            <span className="text-sm sm:text-base font-semibold capitalize">
              {tituloPeriodo}
            </span>
          </div>

          <Button
            variant="outline"
            size="icon"
            className="min-h-[44px] min-w-[44px]"
            onClick={avancar}
            aria-label="Próximo período"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>

          <Button
            variant="outline"
            size="sm"
            className="min-h-[44px]"
            onClick={irParaHoje}
          >
            Hoje
          </Button>
        </div>
      </div>

      {/* ── Grid Area ── */}
      <div className="flex-1 overflow-auto p-4">
        {visualizacao === 'mes' && (
          <CalendarioGrid
            dias={diasCalendario as DiaCalendario[]}
            dataBase={dataBase}
            eventos={eventosCompleto}
            disponibilidades={[]}
            onClickDia={handleDiaClick}
            onClickEvento={handleEventoClick}
          />
        )}

        {visualizacao === 'semana' && (
          <CalendarioSemana
            semana={semanaDates}
            eventos={eventosCompleto}
            disponibilidades={[]}
            onClickDia={handleDiaClick}
            onClickEvento={handleEventoClick}
          />
        )}

        {visualizacao === 'semestre' && (
          <CalendarioSemestre
            mesesDoSemestre={mesesDoSemestre}
            eventos={eventosCompleto}
            disponibilidades={[]}
            onClickDia={handleDiaClick}
          />
        )}
      </div>

      {/* ── Dialogs ── */}
      <DialogDisponibilidade
        aberto={dialogAberto}
        onFechar={fecharDialog}
        diaSelecionado={diaSelecionado}
        disponibilidadeSelecionada={disponibilidadeSelecionada}
        onSalvar={salvarDisponibilidade}
        onExcluir={excluirDisponibilidade}
      />

      <DialogDetalhesAula
        aberto={dialogAulaAberto}
        onFechar={fecharDialogAula}
        aula={aulaSelecionada}
      />
    </div>
  )
}
