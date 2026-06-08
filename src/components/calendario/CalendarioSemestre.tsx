'use client'

import { formatarChaveData, cn, diaSemanaAbrev } from '@/lib/utils'
import type { CalendarioEvento, Disponibilidade, Aula } from '@/lib/types'
import type { MesSemestre } from '@/lib/utils'
import { format, getDay } from 'date-fns'

interface CalendarioSemestreProps {
  mesesDoSemestre: MesSemestre[]
  eventos: Map<string, CalendarioEvento[]>
  disponibilidades: Disponibilidade[]
  onClickDia: (dia: Date) => void
}

const CABECALHOS = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S']

/**
 * Determines if a day has events and what types.
 * Returns 'disponibilidade' | 'aula' | 'ambos' | null
 */
function getTipoEventoDia(
  dia: Date,
  eventos: Map<string, CalendarioEvento[]>,
  disponibilidades: Disponibilidade[]
): { temDisponibilidade: boolean; temAula: boolean } {
  const key = formatarChaveData(dia)
  const diaSemana = getDay(dia)
  const fromMap = eventos.get(key) ?? []

  let temDisponibilidade = fromMap.some((e) => e.tipo === 'disponibilidade')
  let temAula = fromMap.some((e) => e.tipo === 'aula')

  // Check recurring disponibilidades
  if (!temDisponibilidade) {
    for (const disp of disponibilidades) {
      if (disp.recorrente && disp.dia_semana === diaSemana) {
        temDisponibilidade = true
        break
      }
    }
  }

  return { temDisponibilidade, temAula }
}

function MiniMes({
  mes,
  eventos,
  disponibilidades,
  onClickDia,
}: {
  mes: MesSemestre
  eventos: Map<string, CalendarioEvento[]>
  disponibilidades: Disponibilidade[]
  onClickDia: (dia: Date) => void
}) {
  // Organize days into weeks (rows of 7)
  const semanas: (Date | null)[][] = []
  let semanaAtual: (Date | null)[] = []

  // Pad start of first week
  const primeiroDia = mes.dias[0]?.data
  if (primeiroDia) {
    const diaSemanaInicio = getDay(primeiroDia) // 0=Sun
    for (let i = 0; i < diaSemanaInicio; i++) {
      semanaAtual.push(null)
    }
  }

  for (const diaCal of mes.dias) {
    semanaAtual.push(diaCal.data)
    if (semanaAtual.length === 7) {
      semanas.push(semanaAtual)
      semanaAtual = []
    }
  }

  // Pad end of last week
  if (semanaAtual.length > 0) {
    while (semanaAtual.length < 7) {
      semanaAtual.push(null)
    }
    semanas.push(semanaAtual)
  }

  return (
    <div className="bg-card rounded-xl border border-border p-3 sm:p-4">
      {/* Month name header */}
      <div className="text-sm font-semibold text-foreground capitalize mb-2 text-center">
        {mes.nome}
      </div>

      {/* Day-of-week headers */}
      <div className="grid grid-cols-7 gap-0 mb-1">
        {CABECALHOS.map((cab, i) => (
          <div
            key={i}
            className="text-center text-[10px] font-medium text-muted-foreground h-6 flex items-center justify-center"
          >
            {cab}
          </div>
        ))}
      </div>

      {/* Day cells */}
      <div className="space-y-0">
        {semanas.map((semana, sIdx) => (
          <div key={sIdx} className="grid grid-cols-7 gap-0">
            {semana.map((dia, dIdx) => {
              if (!dia) {
                return <div key={dIdx} className="w-[32px] h-[32px] mx-auto" />
              }

              const { temDisponibilidade, temAula } = getTipoEventoDia(
                dia,
                eventos,
                disponibilidades
              )
              const diaCal = mes.dias.find(
                (d) => formatarChaveData(d.data) === formatarChaveData(dia)
              )
              const ehHoje = diaCal?.ehHoje ?? false
              const ehMesAtual = diaCal?.ehMesAtual ?? false

              return (
                <div
                  key={dIdx}
                  className={cn(
                    'w-[32px] h-[32px] mx-auto flex flex-col items-center justify-center cursor-pointer rounded-md transition-colors',
                    !ehMesAtual && 'opacity-30',
                    ehHoje
                      ? 'bg-[#1e3a5f] text-white'
                      : 'active:bg-slate-100 hover:bg-slate-50'
                  )}
                  onClick={() => onClickDia(dia)}
                >
                  <span
                    className={cn(
                      'text-[11px] leading-none',
                      ehHoje ? 'font-bold text-white' : 'font-medium text-foreground'
                    )}
                  >
                    {format(dia, 'd')}
                  </span>
                  {/* Dot indicator */}
                  {(temDisponibilidade || temAula) && (
                    <div className="flex gap-0.5 mt-0.5">
                      {temDisponibilidade && (
                        <div className="w-1.5 h-1.5 rounded-full bg-[#1e3a5f]" />
                      )}
                      {temAula && (
                        <div className="w-1.5 h-1.5 rounded-full bg-[#166534]" />
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
}

export function CalendarioSemestre({
  mesesDoSemestre,
  eventos,
  disponibilidades,
  onClickDia,
}: CalendarioSemestreProps) {
  return (
    <div className="w-full">
      {/* Mini-calendar grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {mesesDoSemestre.map((mes, idx) => (
          <MiniMes
            key={idx}
            mes={mes}
            eventos={eventos}
            disponibilidades={disponibilidades}
            onClickDia={onClickDia}
          />
        ))}
      </div>

      {/* Legend footer */}
      <div className="flex items-center justify-center gap-6 mt-4 py-3 border-t border-border">
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-[#1e3a5f]" />
          <span className="text-xs text-muted-foreground">Disponibilidade</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-[#166534]" />
          <span className="text-xs text-muted-foreground">Aula agendada</span>
        </div>
      </div>
    </div>
  )
}
