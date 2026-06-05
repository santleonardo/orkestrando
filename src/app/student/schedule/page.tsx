'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import {
  CalendarDays,
  Printer,
  ChevronLeft,
  ChevronRight,
  Clock,
  MapPin,
  User,
  FileText,
  X,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'

// ── Types ──
interface ScheduleBlock {
  id: string
  subject: string
  teacher: string
  room: string
  startTime: string
  endTime: string
  dayIndex: number // 0=Seg, 1=Ter, etc.
  color: string
  textColor: string
  bgColor: string
  materials?: string
}

// ── Mock Data ──
const SUBJECT_COLORS: Record<string, { color: string; textColor: string; bgColor: string }> = {
  'Teoria Musical': { color: 'border-emerald-500', textColor: 'text-emerald-700', bgColor: 'bg-emerald-50' },
  'Instrumento — Piano': { color: 'border-violet-500', textColor: 'text-violet-700', bgColor: 'bg-violet-50' },
  'Coral': { color: 'border-amber-500', textColor: 'text-amber-700', bgColor: 'bg-amber-50' },
  'História da Música': { color: 'border-rose-500', textColor: 'text-rose-700', bgColor: 'bg-rose-50' },
  'Composição': { color: 'border-cyan-500', textColor: 'text-cyan-700', bgColor: 'bg-cyan-50' },
  'Percepção Musical': { color: 'border-orange-500', textColor: 'text-orange-700', bgColor: 'bg-orange-50' },
}

const SCHEDULE_BLOCKS: ScheduleBlock[] = [
  // Segunda (0)
  { id: '1', subject: 'Teoria Musical', teacher: 'Prof. Carlos Eduardo Silva', room: 'Sala 101', startTime: '07:00', endTime: '08:50', dayIndex: 0, ...SUBJECT_COLORS['Teoria Musical'], materials: 'Apostila de Teoria Musical v3' },
  { id: '2', subject: 'Teoria Musical', teacher: 'Prof. Carlos Eduardo Silva', room: 'Sala 101', startTime: '09:00', endTime: '09:50', dayIndex: 0, ...SUBJECT_COLORS['Teoria Musical'] },
  { id: '3', subject: 'Percepção Musical', teacher: 'Prof. Maria Fernanda Costa', room: 'Lab Áudio 01', startTime: '10:00', endTime: '11:50', dayIndex: 0, ...SUBJECT_COLORS['Percepção Musical'] },
  // Terça (1)
  { id: '4', subject: 'Instrumento — Piano', teacher: 'Prof. Ana Paula Souza', room: 'Lab Música', startTime: '07:00', endTime: '08:50', dayIndex: 1, ...SUBJECT_COLORS['Instrumento — Piano'], materials: 'Partituras — Módulo 4' },
  { id: '5', subject: 'História da Música', teacher: 'Prof. Roberto Lima', room: 'Sala 203', startTime: '09:00', endTime: '10:50', dayIndex: 1, ...SUBJECT_COLORS['História da Música'] },
  // Quarta (2)
  { id: '6', subject: 'Teoria Musical', teacher: 'Prof. Carlos Eduardo Silva', room: 'Sala 101', startTime: '07:00', endTime: '07:50', dayIndex: 2, ...SUBJECT_COLORS['Teoria Musical'] },
  { id: '7', subject: 'Composição', teacher: 'Prof. João Pedro Oliveira', room: 'Sala 305', startTime: '08:00', endTime: '09:50', dayIndex: 2, ...SUBJECT_COLORS['Composição'], materials: 'Exercícios de Composição II' },
  { id: '8', subject: 'Coral', teacher: 'Prof. Roberto Lima', room: 'Auditório', startTime: '13:00', endTime: '14:50', dayIndex: 2, ...SUBJECT_COLORS['Coral'] },
  // Quinta (3)
  { id: '9', subject: 'Instrumento — Piano', teacher: 'Prof. Ana Paula Souza', room: 'Lab Música', startTime: '07:00', endTime: '08:50', dayIndex: 3, ...SUBJECT_COLORS['Instrumento — Piano'] },
  { id: '10', subject: 'Percepção Musical', teacher: 'Prof. Maria Fernanda Costa', room: 'Lab Áudio 01', startTime: '10:00', endTime: '11:50', dayIndex: 3, ...SUBJECT_COLORS['Percepção Musical'] },
  // Sexta (4)
  { id: '11', subject: 'Composição', teacher: 'Prof. João Pedro Oliveira', room: 'Sala 305', startTime: '07:00', endTime: '07:50', dayIndex: 4, ...SUBJECT_COLORS['Composição'] },
  { id: '12', subject: 'História da Música', teacher: 'Prof. Roberto Lima', room: 'Sala 203', startTime: '09:00', endTime: '09:50', dayIndex: 4, ...SUBJECT_COLORS['História da Música'] },
  { id: '13', subject: 'Coral', teacher: 'Prof. Roberto Lima', room: 'Auditório', startTime: '13:00', endTime: '14:50', dayIndex: 4, ...SUBJECT_COLORS['Coral'], materials: 'Repertório Coral — Semestre 3' },
]

const DAYS = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado']
const TIME_SLOTS = [
  '07:00', '07:50', '08:00', '08:50', '09:00', '09:50',
  '10:00', '10:50', '11:00', '11:50',
  '13:00', '13:50', '14:00', '14:50',
  '15:00', '15:50', '16:00', '16:50',
]

function getDayOfWeek(): number {
  const d = new Date().getDay()
  if (d === 0) return 6 // Sunday maps to Saturday column? No, we don't show Sunday
  return d - 1 // Monday=0, Tuesday=1, etc.
}

export default function SchedulePage() {
  const [selectedBlock, setSelectedBlock] = useState<ScheduleBlock | null>(null)
  const [semester, setSemester] = useState('2025-1')
  const currentDay = getDayOfWeek()

  const getBlocksForSlot = (dayIndex: number, time: string) => {
    return SCHEDULE_BLOCKS.filter(
      (b) => b.dayIndex === dayIndex && b.startTime <= time && b.endTime > time
    )
  }

  const getBlockSpan = (block: ScheduleBlock): number => {
    const startIdx = TIME_SLOTS.indexOf(block.startTime)
    const endIdx = TIME_SLOTS.indexOf(block.endTime)
    if (startIdx === -1 || endIdx === -1) return 1
    return Math.max(1, endIdx - startIdx)
  }

  const printSchedule = () => {
    window.print()
  }

  return (
    <div className="space-y-6 print:space-y-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 print:hidden">
        <div>
          <h1 className="text-2xl font-bold">Agenda Semanal</h1>
          <p className="text-sm text-muted-foreground">Gerencie seus horários de aula</p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={semester} onValueChange={setSemester}>
            <SelectTrigger className="w-[160px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="2025-1">2025/1 — Atual</SelectItem>
              <SelectItem value="2024-2">2024/2</SelectItem>
              <SelectItem value="2024-1">2024/1</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" className="gap-2" onClick={printSchedule}>
            <Printer className="h-4 w-4" />
            Imprimir
          </Button>
        </div>
      </div>

      {/* Legend */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className="print:shadow-none print:border-0">
          <CardContent className="p-4">
            <div className="flex flex-wrap gap-3">
              {Object.entries(SUBJECT_COLORS).map(([name, colors]) => (
                <div key={name} className="flex items-center gap-2">
                  <div className={`h-3 w-3 rounded-full ${colors.bgColor} border-2 ${colors.color}`} />
                  <span className="text-xs text-muted-foreground">{name}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Schedule Grid */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="print:shadow-none print:border-0">
          <CardContent className="p-0 print:p-0">
            <ScrollArea className="w-full">
              <div className="min-w-[800px]">
                {/* Day headers */}
                <div className="grid grid-cols-[60px_repeat(6,1fr)] border-b bg-muted/30 sticky top-0 z-10">
                  <div className="p-3 text-xs font-medium text-muted-foreground border-r" />
                  {DAYS.map((day, idx) => (
                    <div
                      key={day}
                      className={`p-3 text-center text-sm font-medium border-r last:border-r-0 ${
                        idx === currentDay ? 'bg-teal-50 text-teal-700 dark:bg-teal-950 dark:text-teal-300' : 'text-muted-foreground'
                      }`}
                    >
                      {day}
                    </div>
                  ))}
                </div>

                {/* Time slots */}
                {TIME_SLOTS.map((time) => (
                  <div key={time} className="grid grid-cols-[60px_repeat(6,1fr)] border-b last:border-b-0">
                    {/* Time label */}
                    <div className="p-2 text-[10px] text-muted-foreground border-r text-center font-mono">
                      {time}
                    </div>

                    {/* Day cells */}
                    {[0, 1, 2, 3, 4, 5].map((dayIdx) => {
                      const blocks = getBlocksForSlot(dayIdx, time)
                      const block = blocks[0]

                      // Check if this block starts at this time (to avoid duplicating blocks)
                      if (block && block.startTime !== time) {
                        return <div key={dayIdx} className="border-r last:border-r-0 min-h-[44px]" />
                      }

                      if (block) {
                        const span = getBlockSpan(block)
                        return (
                          <div
                            key={dayIdx}
                            className={`border-r last:border-r-0 cursor-pointer transition-all hover:brightness-95 ${block.bgColor}`}
                            style={{ gridRow: `span ${span}` }}
                            onClick={() => setSelectedBlock(block)}
                          >
                            <div className="p-2 h-full flex flex-col justify-start">
                              <p className={`text-xs font-semibold truncate ${block.textColor}`}>{block.subject}</p>
                              <p className="text-[10px] text-muted-foreground mt-0.5">{block.startTime} - {block.endTime}</p>
                              <p className="text-[10px] text-muted-foreground">{block.room}</p>
                            </div>
                          </div>
                        )
                      }

                      return (
                        <div
                          key={dayIdx}
                          className={`border-r last:border-r-0 min-h-[44px] ${
                            dayIdx === currentDay ? 'bg-teal-50/50 dark:bg-teal-950/30' : ''
                          }`}
                        />
                      )
                    })}
                  </div>
                ))}
              </div>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
          </CardContent>
        </Card>
      </motion.div>

      {/* Class Detail Dialog */}
      <Dialog open={!!selectedBlock} onOpenChange={() => setSelectedBlock(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div className={`h-3 w-3 rounded-full ${selectedBlock?.bgColor} border-2 ${selectedBlock?.color}`} />
              {selectedBlock?.subject}
            </DialogTitle>
          </DialogHeader>
          {selectedBlock && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted shrink-0">
                    <User className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Professor</p>
                    <p className="text-sm font-medium">{selectedBlock.teacher}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted shrink-0">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Sala</p>
                    <p className="text-sm font-medium">{selectedBlock.room}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted shrink-0">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Horário</p>
                    <p className="text-sm font-medium">{selectedBlock.startTime} — {selectedBlock.endTime}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted shrink-0">
                    <CalendarDays className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Dia</p>
                    <p className="text-sm font-medium">{DAYS[selectedBlock.dayIndex]}</p>
                  </div>
                </div>
              </div>

              {selectedBlock.materials && (
                <div className="p-3 rounded-lg bg-muted/50 border">
                  <div className="flex items-center gap-2 mb-1">
                    <FileText className="h-4 w-4 text-teal-600" />
                    <span className="text-xs font-semibold">Material da Aula</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{selectedBlock.materials}</p>
                  <Button variant="link" size="sm" className="h-auto p-0 text-teal-600 text-xs mt-1">
                    Ver material →
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
