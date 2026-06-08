'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { toast } from 'sonner'
import type { Disponibilidade, Aula, CalendarioEvento, DisponibilidadeFormValues } from '@/lib/types'
import {
  getDiasDoMes,
  getDiasDaSemana,
  getDiasDoSemestre,
  formatarChaveData,
  getTituloPeriodo,
  avancarPeriodo,
  voltarPeriodo,
} from '@/lib/utils'
import { format, getDay, parseISO } from 'date-fns'

const SEMESTRE_ATUAL = '2025.2'
const ANO_ATUAL = 2025

export function useCalendarioProfessor() {
  const [visualizacao, setVisualizacao] = useState<'semana' | 'mes' | 'semestre'>('mes')
  const [dataBase, setDataBase] = useState<Date>(new Date())
  const [disponibilidades, setDisponibilidades] = useState<Disponibilidade[]>([])
  const [aulas, setAulas] = useState<Aula[]>([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState<string | null>(null)
  const [dialogAberto, setDialogAberto] = useState(false)
  const [diaSelecionado, setDiaSelecionado] = useState<Date | null>(null)
  const [disponibilidadeSelecionada, setDisponibilidadeSelecionada] = useState<Disponibilidade | null>(null)
  const [dialogAulaAberto, setDialogAulaAberto] = useState(false)
  const [aulaSelecionada, setAulaSelecionada] = useState<Aula | null>(null)

  const carregarDados = useCallback(async () => {
    setCarregando(true)
    setErro(null)
    try {
      // Load disponibilidades
      const resDisp = await fetch('/api/usuarios/me')
      if (!resDisp.ok) throw new Error('Não autenticado')
      const userData = await resDisp.json()
      const profileId = userData.data.id

      const [resDisponibilidades, resAulas] = await Promise.all([
        fetch(`/api/calendario/disponibilidades?professor_id=${profileId}&semestre=${SEMESTRE_ATUAL}&ano=${ANO_ATUAL}`),
        fetch(`/api/calendario/aulas?professor_id=${profileId}`),
      ])

      if (!resDisponibilidades.ok || !resAulas.ok) throw new Error('Erro ao carregar dados')

      const dataDisp = await resDisponibilidades.json()
      const dataAulas = await resAulas.json()

      setDisponibilidades(dataDisp.data ?? [])
      setAulas(dataAulas.data ?? [])
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Erro desconhecido')
    } finally {
      setCarregando(false)
    }
  }, [])

  useEffect(() => {
    carregarDados()
  }, [carregarDados])

  const avancar = useCallback(() => {
    setDataBase((prev) => avancarPeriodo(visualizacao, prev))
  }, [visualizacao])

  const voltar = useCallback(() => {
    setDataBase((prev) => voltarPeriodo(visualizacao, prev))
  }, [visualizacao])

  const irParaHoje = useCallback(() => {
    setDataBase(new Date())
  }, [])

  const abrirDialogNovo = useCallback((dia: Date) => {
    setDiaSelecionado(dia)
    setDisponibilidadeSelecionada(null)
    setDialogAberto(true)
  }, [])

  const abrirDialogEdicao = useCallback((d: Disponibilidade) => {
    setDisponibilidadeSelecionada(d)
    setDiaSelecionado(null)
    setDialogAberto(true)
  }, [])

  const abrirDialogAula = useCallback((a: Aula) => {
    setAulaSelecionada(a)
    setDialogAulaAberto(true)
  }, [])

  const fecharDialog = useCallback(() => {
    setDialogAberto(false)
    setDiaSelecionado(null)
    setDisponibilidadeSelecionada(null)
  }, [])

  const fecharDialogAula = useCallback(() => {
    setDialogAulaAberto(false)
    setAulaSelecionada(null)
  }, [])

  const salvarDisponibilidade = useCallback(async (values: DisponibilidadeFormValues) => {
    try {
      const res = await fetch('/api/calendario/disponibilidades', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error ?? 'Erro ao salvar')
      }
      toast.success('Disponibilidade salva com sucesso!')
      fecharDialog()
      carregarDados()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao salvar disponibilidade')
    }
  }, [fecharDialog, carregarDados])

  const excluirDisponibilidade = useCallback(async (id: string) => {
    try {
      const res = await fetch(`/api/calendario/disponibilidades/${id}`, { method: 'DELETE' })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error ?? 'Erro ao excluir')
      }
      toast.success('Disponibilidade excluída!')
      fecharDialog()
      carregarDados()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao excluir disponibilidade')
    }
  }, [fecharDialog, carregarDados])

  // Build a Map<string, CalendarioEvento[]> keyed by "yyyy-MM-dd"
  const eventosMap = useMemo(() => {
    const map = new Map<string, CalendarioEvento[]>()

    // Add disponibilidades
    for (const disp of disponibilidades) {
      if (disp.recorrente) {
        // For recurring, add to every matching day of week in the semester
        // We'll compute this lazily via getEventosParaDia
      } else if (disp.data_especifica) {
        const key = disp.data_especifica
        if (!map.has(key)) map.set(key, [])
        map.get(key)!.push({ tipo: 'disponibilidade', dados: disp })
      }
    }

    // Add aulas
    for (const aula of aulas) {
      const dataAula = parseISO(aula.data_hora_inicio)
      const key = formatarChaveData(dataAula)
      if (!map.has(key)) map.set(key, [])
      map.get(key)!.push({ tipo: 'aula', dados: aula })
    }

    return map
  }, [disponibilidades, aulas])

  const getEventosParaDia = useCallback((dia: Date): CalendarioEvento[] => {
    const eventos: CalendarioEvento[] = []
    const key = formatarChaveData(dia)
    const diaSemana = getDay(dia) // 0=Sun, 6=Sat

    // From the map (non-recurring disponibilidade + aulas)
    const fromMap = eventosMap.get(key) ?? []
    eventos.push(...fromMap)

    // Add recurring disponibilidades for this day of week
    for (const disp of disponibilidades) {
      if (disp.recorrente && disp.dia_semana === diaSemana) {
        eventos.push({ tipo: 'disponibilidade', dados: disp })
      }
    }

    return eventos
  }, [eventosMap, disponibilidades])

  const tituloPeriodo = useMemo(
    () => getTituloPeriodo(visualizacao, dataBase, SEMESTRE_ATUAL),
    [visualizacao, dataBase]
  )

  // Compute the days based on visualization
  const diasCalendario = useMemo(() => {
    switch (visualizacao) {
      case 'mes':
        return getDiasDoMes(dataBase)
      case 'semana':
        return getDiasDaSemana(dataBase)
      case 'semestre':
        return getDiasDoSemestre(SEMESTRE_ATUAL, ANO_ATUAL)
      default:
        return getDiasDoMes(dataBase)
    }
  }, [visualizacao, dataBase])

  return {
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
    getEventosParaDia,
    carregarDados,
  }
}
