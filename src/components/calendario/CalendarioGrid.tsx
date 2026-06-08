'use client'

import { DiaCalendario, formatarChaveData, cn } from '@/lib/utils'
import type { CalendarioEvento, Disponibilidade, Aula } from '@/lib/types'
import { format, getDay } from 'date-fns'

interface CalendarioGridProps {
  dias: DiaCalendario[]
  dataBase: Date
  eventos: Map<string, CalendarioEvento[]>
  disponibilidades: Disponibilidade[]
  onClickDia: (dia: Date) => void
  onClickEvento: (evento: CalendarioEvento) => void
}

export function CalendarioGrid({
  dias,
  dataBase,
  eventos,
  disponibilidades,
  onClickDia,
  onClickEvento,
}: CalendarioGridProps) {
  const cabecalhos = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

  /**
   * Gets all events for a specific day, including recurring disponibilidades
   * that match the day of the week but aren't in the map (since the map
   * only stores non-recurring items and aulas).
   */
  const getEventosCompletosParaDia = (dia: Date): CalendarioEvento[] => {
    const key = formatarChaveData(dia)
    const diaSemana = getDay(dia) // 0=Sun, 6=Sat
    const eventosDoDia = eventos.get(key) ? [...eventos.get(key)!] : []

    // Add recurring disponibilidades for this day of week
    for (const disp of disponibilidades) {
      if (disp.recorrente && disp.dia_semana === diaSemana) {
        eventosDoDia.push({ tipo: 'disponibilidade', dados: disp })
      }
    }

    return eventosDoDia
  }

  return (
    <div className="w-full">
      {/* Header row */}
      <div className="grid grid-cols-7 mb-1">
        {cabecalhos.map((dia) => (
          <div key={dia} className="text-center text-xs font-medium text-muted-foreground py-2">
            {dia}
          </div>
        ))}
      </div>

      {/* Day cells */}
      <div className="grid grid-cols-7 gap-px bg-border rounded-xl overflow-hidden">
        {dias.map((diaCal, idx) => {
          const eventosDoDia = getEventosCompletosParaDia(diaCal.data)

          const eventosVisiveis = eventosDoDia.slice(0, 3)
          const maisEventos = eventosDoDia.length > 3 ? eventosDoDia.length - 3 : 0

          return (
            <div
              key={idx}
              className={cn(
                'bg-card p-1 sm:p-2 cursor-pointer min-h-[64px] sm:min-h-[80px] active:bg-slate-50 transition-colors',
                !diaCal.ehMesAtual && 'opacity-40',
              )}
              onClick={() => onClickDia(diaCal.data)}
            >
              <div className="flex justify-end">
                <span
                  className={cn(
                    'text-xs sm:text-sm font-medium w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center rounded-full',
                    diaCal.ehHoje && 'bg-[#1e3a5f] text-white',
                  )}
                >
                  {format(diaCal.data, 'd')}
                </span>
              </div>

              <div className="mt-0.5 space-y-0.5">
                {eventosVisiveis.map((evento, eIdx) => (
                  <div
                    key={eIdx}
                    className={cn(
                      'text-[10px] sm:text-xs truncate px-1 py-0.5 rounded',
                      evento.tipo === 'disponibilidade' && 'bg-[#1e3a5f]/15 text-[#1e3a5f]',
                      evento.tipo === 'aula' && (evento.dados as Aula).status === 'agendada' && 'bg-emerald-100 text-emerald-800',
                      evento.tipo === 'aula' && (evento.dados as Aula).status === 'cancelada' && 'bg-red-100 text-red-800',
                      evento.tipo === 'aula' && (evento.dados as Aula).status === 'realizada' && 'bg-slate-100 text-slate-600',
                    )}
                    onClick={(e) => {
                      e.stopPropagation()
                      onClickEvento(evento)
                    }}
                  >
                    {evento.tipo === 'disponibilidade'
                      ? `${(evento.dados as Disponibilidade).hora_inicio}-${(evento.dados as Disponibilidade).hora_fim}`
                      : (evento.dados as Aula).titulo}
                  </div>
                ))}
                {maisEventos > 0 && (
                  <div className="text-[10px] text-muted-foreground px-1">
                    +{maisEventos} mais
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
