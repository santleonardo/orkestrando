// src/lib/utils.ts
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import {
  format,
  parseISO,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  startOfWeek,
  endOfWeek,
  getDay,
  isToday,
  isSameMonth,
  addWeeks,
  addMonths,
  addYears,
} from "date-fns"
import { ptBR } from "date-fns/locale"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatarData(data: string | Date): string {
  const d = typeof data === "string" ? parseISO(data) : data
  return format(d, "dd/MM/yyyy", { locale: ptBR })
}

export function formatarHora(hora: string): string {
  return hora.substring(0, 5)
}

export function formatarDataHora(dataHora: string): string {
  const d = parseISO(dataHora)
  return `${format(d, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}`
}

export function obterIniciais(nome: string): string {
  return nome
    .split(" ")
    .filter((p) => p.length > 0)
    .map((p) => p[0].toUpperCase())
    .slice(0, 2)
    .join("")
}

const DIAS_SEMANA = [
  "Domingo",
  "Segunda-feira",
  "Terça-feira",
  "Quarta-feira",
  "Quinta-feira",
  "Sexta-feira",
  "Sábado",
]

const DIAS_SEMANA_ABREV = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"]

export function diaSemanaLabel(dia: number): string {
  return DIAS_SEMANA[dia] ?? ""
}

export function diaSemanaAbrev(dia: number): string {
  return DIAS_SEMANA_ABREV[dia] ?? ""
}

export function gerarSlotsHorario(): string[] {
  const slots: string[] = []
  for (let h = 7; h <= 21; h++) {
    slots.push(`${String(h).padStart(2, "0")}:00`)
    slots.push(`${String(h).padStart(2, "0")}:30`)
  }
  slots.push("22:00")
  return slots
}

export function gerarSlotsInicio(): string[] {
  const slots: string[] = []
  for (let h = 7; h <= 21; h++) {
    slots.push(`${String(h).padStart(2, "0")}:00`)
    slots.push(`${String(h).padStart(2, "0")}:30`)
  }
  return slots
}

export function gerarSlotsFim(horaInicio: string): string[] {
  const slots: string[] = []
  const [hI, mI] = horaInicio.split(":").map(Number)
  const inicioMin = hI * 60 + mI + 30
  for (let h = 7; h <= 22; h++) {
    for (const m of [0, 30]) {
      const totalMin = h * 60 + m
      if (totalMin > inicioMin) {
        slots.push(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`)
      }
    }
  }
  return slots
}

export interface DiaCalendario {
  data: Date
  ehHoje: boolean
  ehMesAtual: boolean
}

export function getDiasDoMes(dataBase: Date): DiaCalendario[] {
  const inicio = startOfWeek(startOfMonth(dataBase), { weekStartsOn: 0 })
  const fim = endOfWeek(endOfMonth(dataBase), { weekStartsOn: 0 })
  const dias = eachDayOfInterval({ start: inicio, end: fim })
  const mesAtual = dataBase.getMonth()

  return dias.map((data) => ({
    data,
    ehHoje: isToday(data),
    ehMesAtual: isSameMonth(data, dataBase),
  }))
}

export function getDiasDaSemana(dataBase: Date): DiaCalendario[] {
  const inicio = startOfWeek(dataBase, { weekStartsOn: 0 })
  const fim = endOfWeek(dataBase, { weekStartsOn: 0 })
  const dias = eachDayOfInterval({ start: inicio, end: fim })

  return dias.map((data) => ({
    data,
    ehHoje: isToday(data),
    ehMesAtual: isSameMonth(data, dataBase),
  }))
}

export interface MesSemestre {
  mes: number
  ano: number
  nome: string
  dias: DiaCalendario[]
}

export function getDiasDoSemestre(semestre: string, ano: number): MesSemestre[] {
  // Semestre 2025.2: agosto a dezembro de 2025
  let mesesInicio: number[]
  if (semestre.endsWith(".1")) {
    mesesInicio = [0, 1, 2, 3, 4, 5] // jan-jun
  } else {
    mesesInicio = [7, 8, 9, 10, 11] // ago-dez
  }

  const meses: MesSemestre[] = mesesInicio.map((m) => {
    const dataRef = new Date(ano, m, 1)
    const inicio = startOfWeek(startOfMonth(dataRef), { weekStartsOn: 0 })
    const fim = endOfWeek(endOfMonth(dataRef), { weekStartsOn: 0 })
    const dias = eachDayOfInterval({ start: inicio, end: fim })

    return {
      mes: m,
      ano,
      nome: format(dataRef, "MMMM", { locale: ptBR }),
      dias: dias.map((data) => ({
        data,
        ehHoje: isToday(data),
        ehMesAtual: isSameMonth(data, dataRef),
      })),
    }
  })

  return meses
}

export function formatarChaveData(data: Date): string {
  return format(data, "yyyy-MM-dd")
}

export function getTituloPeriodo(
  visualizacao: "semana" | "mes" | "semestre",
  dataBase: Date,
  semestre: string
): string {
  switch (visualizacao) {
    case "semana": {
      const inicio = startOfWeek(dataBase, { weekStartsOn: 0 })
      const fim = endOfWeek(dataBase, { weekStartsOn: 0 })
      return `Semana de ${format(inicio, "dd")} a ${format(fim, "dd 'de' MMM", { locale: ptBR })}`
    }
    case "mes":
      return format(dataBase, "MMMM yyyy", { locale: ptBR })
    case "semestre":
      return semestre
    default:
      return ""
  }
}

export function avancarPeriodo(
  visualizacao: "semana" | "mes" | "semestre",
  dataBase: Date
): Date {
  switch (visualizacao) {
    case "semana":
      return addWeeks(dataBase, 1)
    case "mes":
      return addMonths(dataBase, 1)
    case "semestre":
      return addMonths(dataBase, 6)
  }
}

export function voltarPeriodo(
  visualizacao: "semana" | "mes" | "semestre",
  dataBase: Date
): Date {
  switch (visualizacao) {
    case "semana":
      return addWeeks(dataBase, -1)
    case "mes":
      return addMonths(dataBase, -1)
    case "semestre":
      return addMonths(dataBase, -6)
  }
}

export function compararHoras(h1: string, h2: string): number {
  return h1.localeCompare(h2)
}

export function horaParaMinutos(hora: string): number {
  const [h, m] = hora.split(":").map(Number)
  return h * 60 + m
}
