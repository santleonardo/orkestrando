'use client'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { format, getDay } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Loader2 } from 'lucide-react'

import type { Disponibilidade, DisponibilidadeFormValues } from '@/lib/types'
import {
  diaSemanaLabel,
  gerarSlotsInicio,
  gerarSlotsFim,
  formatarChaveData,
} from '@/lib/utils'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'

const SEMESTRE_ATUAL = '2025.2'
const ANO_ATUAL = 2025

const schemaDisponibilidade = z
  .object({
    hora_inicio: z.string().min(1, 'Selecione a hora de início'),
    hora_fim: z.string().min(1, 'Selecione a hora de fim'),
    recorrente: z.boolean(),
    data_especifica: z.string().optional(),
    dia_semana: z.number(),
    semestre: z.string(),
    ano: z.number(),
  })
  .refine((data) => data.hora_fim > data.hora_inicio, {
    message: 'A hora de fim deve ser posterior à hora de início',
    path: ['hora_fim'],
  })

type FormValues = z.infer<typeof schemaDisponibilidade>

interface DialogDisponibilidadeProps {
  aberto: boolean
  onFechar: () => void
  diaSelecionado: Date | null
  disponibilidadeSelecionada: Disponibilidade | null
  onSalvar: (values: DisponibilidadeFormValues) => Promise<void>
  onExcluir: (id: string) => Promise<void>
}

export function DialogDisponibilidade({
  aberto,
  onFechar,
  diaSelecionado,
  disponibilidadeSelecionada,
  onSalvar,
  onExcluir,
}: DialogDisponibilidadeProps) {
  const isEditing = disponibilidadeSelecionada !== null
  const [excluindo, setExcluindo] = useState(false)

  const diaReferencia =
    diaSelecionado ??
    (disponibilidadeSelecionada?.data_especifica
      ? new Date(disponibilidadeSelecionada.data_especifica + 'T12:00:00')
      : new Date())

  const form = useForm<FormValues>({
    resolver: zodResolver(schemaDisponibilidade),
    defaultValues: {
      hora_inicio: '08:00',
      hora_fim: '12:00',
      recorrente: true,
      data_especifica: undefined,
      dia_semana: diaReferencia ? getDay(diaReferencia) : 1,
      semestre: SEMESTRE_ATUAL,
      ano: ANO_ATUAL,
    },
  })

  const {
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = form

  const watchHoraInicio = watch('hora_inicio')
  const watchRecorrente = watch('recorrente')
  const watchDiaSemana = watch('dia_semana')

  const slotsFim = gerarSlotsFim(watchHoraInicio || '08:00')

  // Pre-fill form when editing or when dialog opens with a new day
  useEffect(() => {
    if (!aberto) return

    if (isEditing && disponibilidadeSelecionada) {
      const disp = disponibilidadeSelecionada
      reset({
        hora_inicio: disp.hora_inicio,
        hora_fim: disp.hora_fim,
        recorrente: disp.recorrente,
        data_especifica: disp.data_especifica ?? undefined,
        dia_semana: disp.dia_semana,
        semestre: disp.semestre,
        ano: disp.ano,
      })
    } else if (diaSelecionado) {
      reset({
        hora_inicio: '08:00',
        hora_fim: '12:00',
        recorrente: true,
        data_especifica: undefined,
        dia_semana: getDay(diaSelecionado),
        semestre: SEMESTRE_ATUAL,
        ano: ANO_ATUAL,
      })
    }
  }, [aberto, isEditing, disponibilidadeSelecionada, diaSelecionado, reset])

  // Update data_especifica when recorrente changes
  useEffect(() => {
    if (!watchRecorrente && diaSelecionado) {
      setValue('data_especifica', formatarChaveData(diaSelecionado))
    } else if (!watchRecorrente && disponibilidadeSelecionada?.data_especifica) {
      setValue('data_especifica', disponibilidadeSelecionada.data_especifica)
    } else {
      setValue('data_especifica', undefined)
    }
  }, [watchRecorrente, diaSelecionado, disponibilidadeSelecionada, setValue])

  // Reset hora_fim if it's not valid after hora_inicio changes
  useEffect(() => {
    if (watchHoraInicio) {
      const slots = gerarSlotsFim(watchHoraInicio)
      const currentFim = watch('hora_fim')
      if (currentFim && !slots.includes(currentFim)) {
        setValue('hora_fim', slots[0] ?? '12:00')
      }
    }
  }, [watchHoraInicio, setValue, watch])

  const onSubmit = async (values: FormValues) => {
    const formValues: DisponibilidadeFormValues = {
      dia_semana: values.dia_semana,
      hora_inicio: values.hora_inicio,
      hora_fim: values.hora_fim,
      recorrente: values.recorrente,
      data_especifica: values.recorrente ? undefined : values.data_especifica,
      semestre: values.semestre,
      ano: values.ano,
    }
    await onSalvar(formValues)
  }

  const handleExcluirClick = async () => {
    if (!disponibilidadeSelecionada) return
    setExcluindo(true)
    try {
      await onExcluir(disponibilidadeSelecionada.id)
    } finally {
      setExcluindo(false)
    }
  }

  // Format the title date
  const tituloData = diaSelecionado
    ? format(diaSelecionado, "EEEE, dd 'de' MMMM", { locale: ptBR })
    : disponibilidadeSelecionada?.data_especifica
      ? format(
          new Date(disponibilidadeSelecionada.data_especifica + 'T12:00:00'),
          "EEEE, dd 'de' MMMM",
          { locale: ptBR }
        )
      : ''

  // Capitalize first letter
  const tituloFormatado = tituloData
    ? tituloData.charAt(0).toUpperCase() + tituloData.slice(1)
    : ''

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
          <DialogTitle className="text-lg font-semibold">
            Disponibilidade
          </DialogTitle>
          {tituloFormatado && (
            <DialogDescription className="text-base font-medium text-foreground">
              {tituloFormatado}
            </DialogDescription>
          )}
          <DialogDescription>
            Defina o horário em que estará disponível neste dia
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Hora Início */}
          <div className="space-y-2">
            <Label htmlFor="hora_inicio">Hora de início</Label>
            <Select
              value={watch('hora_inicio')}
              onValueChange={(value) =>
                setValue('hora_inicio', value, { shouldValidate: true })
              }
            >
              <SelectTrigger id="hora_inicio" className="w-full h-11">
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                {gerarSlotsInicio().map((slot) => (
                  <SelectItem key={slot} value={slot}>
                    {slot}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.hora_inicio && (
              <p className="text-sm text-destructive">
                {errors.hora_inicio.message}
              </p>
            )}
          </div>

          {/* Hora Fim */}
          <div className="space-y-2">
            <Label htmlFor="hora_fim">Hora de fim</Label>
            <Select
              value={watch('hora_fim')}
              onValueChange={(value) =>
                setValue('hora_fim', value, { shouldValidate: true })
              }
            >
              <SelectTrigger id="hora_fim" className="w-full h-11">
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                {slotsFim.map((slot) => (
                  <SelectItem key={slot} value={slot}>
                    {slot}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.hora_fim && (
              <p className="text-sm text-destructive">
                {errors.hora_fim.message}
              </p>
            )}
          </div>

          {/* Recorrente Switch */}
          <div className="flex items-center justify-between gap-3 rounded-lg border p-3">
            <Label htmlFor="recorrente" className="cursor-pointer">
              Repetir todo o semestre 2025.2
            </Label>
            <Switch
              id="recorrente"
              checked={watchRecorrente}
              onCheckedChange={(checked) =>
                setValue('recorrente', checked, { shouldValidate: true })
              }
            />
          </div>

          {/* Recorrente notice */}
          {!watchRecorrente ? (
            <p className="text-xs text-muted-foreground">
              Válido apenas para este dia
            </p>
          ) : (
            <p className="text-xs text-muted-foreground">
              Será aplicado a todas as {diaSemanaLabel(watchDiaSemana)}s do
              semestre
            </p>
          )}

          {/* Hidden fields */}
          <input type="hidden" {...form.register('dia_semana')} />
          <input type="hidden" {...form.register('semestre')} />
          <input type="hidden" {...form.register('ano')} />

          {/* Footer */}
          <DialogFooter className="pt-2">
            {isEditing && (
              <Button
                type="button"
                variant="destructive"
                className="w-full sm:w-auto"
                onClick={handleExcluirClick}
                disabled={excluindo || isSubmitting}
              >
                {excluindo && <Loader2 className="animate-spin" />}
                Excluir
              </Button>
            )}
            {!isEditing && <div className="hidden sm:block flex-1" />}
            {isEditing && <div className="flex-1" />}
            <Button
              type="button"
              variant="outline"
              className="w-full sm:w-auto"
              onClick={onFechar}
              disabled={isSubmitting || excluindo}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="w-full sm:w-auto"
              disabled={isSubmitting || excluindo}
            >
              {isSubmitting && <Loader2 className="animate-spin" />}
              Salvar disponibilidade
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
