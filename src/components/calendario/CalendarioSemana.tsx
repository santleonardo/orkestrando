'use client'

import {
  gerarSlotsHorario,
  horaParaMinutos,
  formatarChaveData,
  cn,
  diaSemanaAbrev,
} from '@/lib/utils'
import type { CalendarioEvento, Disponibilidade, Aula } from '@/lib/types'
import { format, getDay, isToday } from 'date-fns'

interface CalendarioSemanaProps {
  semana: Date[]
  eventos: Map<string, CalendarioEvento[]>
  disponibilidades: Disponibilidade[]
  onClickDia: (dia: Date) => void
  onClickEvento: (evento: CalendarioEvento) => void
}

const SLOT_HEIGHT = 48 // px per 30-min slot
const START_HOUR = 7 // 07:00
const SLOTS = gerarSlotsHorario()

/**
 * Gets all events for a specific day, including recurring disponibilidades
 * that match the day of the week.
 */
function getEventosCompletosParaDia(
  dia: Date,
  eventos: Map<string, CalendarioEvento[]>,
  disponibilidades: Disponibilidade[]
): CalendarioEvento[] {
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

/** Returns the start time string for an event (HH:mm) */
function getHoraInicio(evento: CalendarioEvento): string {
  if (evento.tipo === 'disponibilidade') {
    return evento.dados.hora_inicio
  }
  // aula: data_hora_inicio is ISO string, extract time
  const date = new Date(evento.dados.data_hora_inicio)
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
}

/** Returns the end time string for an event (HH:mm) */
function getHoraFim(evento: CalendarioEvento): string {
  if (evento.tipo === 'disponibilidade') {
    return evento.dados.hora_fim
  }
  // aula: data_hora_fim is ISO string, extract time
  const date = new Date(evento.dados.data_hora_fim)
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
}

/** Get event label */
function getEventoLabel(evento: CalendarioEvento): string {
  if (evento.tipo === 'disponibilidade') {
    const d = evento.dados as Disponibilidade
    return `${d.hora_inicio} - ${d.hora_fim}`
  }
  return (evento.dados as Aula).titulo
}

/** Get event color classes */
function getEventoCores(evento: CalendarioEvento): string {
  if (evento.tipo === 'disponibilidade') {
    return 'bg-[#1e3a5f]/20 text-[#1e3a5f] border-[#1e3a5f]/30'
  }
  const aula = evento.dados as Aula
  switch (aula.status) {
    case 'agendada':
      return 'bg-emerald-100/80 text-emerald-800 border-emerald-300'
    case 'cancelada':
      return 'bg-red-100/80 text-red-800 border-red-300'
    case 'realizada':
      return 'bg-slate-100/80 text-slate-600 border-slate-300'
    default:
      return 'bg-slate-100/80 text-slate-600 border-slate-300'
  }
}

export function CalendarioSemana({
  semana,
  eventos,
  disponibilidades,
  onClickDia,
  onClickEvento,
}: CalendarioSemanaProps) {
  const startOffset = START_HOUR * 60 // minutes offset from midnight for start of grid

  return (
    <div className="w-full">
      {/* Day headers — sticky */}
      <div className="flex border-b border-border">
        {/* Time gutter header */}
        <div className="w-16 sm:w-20 shrink-0" />

        {/* Day column headers */}
        <div className="flex flex-1 min-w-0 overflow-x-auto">
          <div className="flex flex-1 min-w-[700px] md:min-w-0">
            {semana.map((dia, idx) => {
              const hoje = isToday(dia)
              return (
                <div
                  key={idx}
                  className={cn(
                    'flex-1 text-center py-2 text-xs sm:text-sm font-medium border-l border-border',
                    hoje ? 'bg-[#1e3a5f] text-white' : 'text-muted-foreground bg-card'
                  )}
                >
                  <div className="text-[10px] sm:text-xs uppercase tracking-wide">
                    {diaSemanaAbrev(getDay(dia))}
                  </div>
                  <div className={cn('text-sm sm:text-base font-semibold', hoje && 'text-white')}>
                    {format(dia, 'd')}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Scrollable time grid */}
      <div className="flex overflow-y-auto max-h-[70vh]">
        {/* Time labels column */}
        <div className="w-16 sm:w-20 shrink-0">
          {SLOTS.map((slot, idx) => (
            <div
              key={idx}
              className="text-right pr-2 text-[10px] sm:text-xs text-muted-foreground border-b border-dashed border-border/50"
              style={{ height: SLOT_HEIGHT }}
            >
              {slot}
            </div>
          ))}
        </div>

        {/* Day columns with events */}
        <div className="flex flex-1 min-w-0 overflow-x-auto">
          <div className="flex flex-1 min-w-[700px] md:min-w-0 relative">
            {semana.map((dia, idx) => {
              const hoje = isToday(dia)
              const eventosDoDia = getEventosCompletosParaDia(dia, eventos, disponibilidades)

              return (
                <div
                  key={idx}
                  className={cn(
                    'flex-1 relative border-l border-border cursor-pointer',
                    hoje && 'bg-[#1e3a5f]/[0.03]'
                  )}
                  onClick={() => onClickDia(dia)}
                >
                  {/* Slot grid lines */}
                  {SLOTS.map((_, sIdx) => (
                    <div
                      key={sIdx}
                      className="border-b border-dashed border-border/50 w-full"
                      style={{ height: SLOT_HEIGHT }}
                    />
                  ))}

                  {/* Events positioned absolutely */}
                  {eventosDoDia.map((evento, eIdx) => {
                    const horaInicio = getHoraInicio(evento)
                    const horaFim = getHoraFim(evento)
                    const inicioMin = horaParaMinutos(horaInicio)
                    const fimMin = horaParaMinutos(horaFim)

                    // Clamp to visible range
                    const clampedStart = Math.max(inicioMin, startOffset)
                    const clampedEnd = Math.min(fimMin, 22 * 60)

                    if (clampedStart >= clampedEnd) return null

                    const topPx = ((clampedStart - startOffset) / 30) * SLOT_HEIGHT
                    const heightPx = ((clampedEnd - clampedStart) / 30) * SLOT_HEIGHT

                    return (
                      <div
                        key={eIdx}
                        className={cn(
                          'absolute left-0.5 right-0.5 rounded-md px-1 py-0.5 border text-[10px] sm:text-xs font-medium overflow-hidden cursor-pointer transition-opacity hover:opacity-90 active:opacity-80',
                          getEventoCores(evento)
                        )}
                        style={{
                          top: topPx,
                          height: Math.max(heightPx, 20), // min height for visibility
                        }}
                        onClick={(e) => {
                          e.stopPropagation()
                          onClickEvento(evento)
                        }}
                      >
                        <div className="truncate leading-tight">
                          {getEventoLabel(evento)}
                        </div>
                        {heightPx > 36 && (
                          <div className="truncate text-[9px] sm:text-[10px] opacity-70 leading-tight">
                            {evento.tipo === 'aula'
                              ? (evento.dados as Aula).materia?.nome ?? ''
                              : 'Disponibilidade'}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
