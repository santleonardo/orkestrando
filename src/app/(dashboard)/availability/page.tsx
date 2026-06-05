'use client'

import { useState } from 'react'
import { PageHeader } from '@/components/shared/page-header'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Clock, Plus, Check, X, AlertCircle, Calendar, Block } from 'lucide-react'
import { WEEKDAYS_SHORT, AVAILABILITY_STATUS_LABELS } from '@/lib/constants'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { motion } from 'framer-motion'
import type { TeacherAvailability, TeacherBlock } from '@/lib/types'

const timeSlots = [
  '07:00', '07:50', '08:50', '09:40', '10:40', '11:30',
  '13:00', '13:50', '14:50', '15:40', '16:40', '17:30',
  '19:00', '19:50', '20:50', '21:40',
]

const days = [1, 2, 3, 4, 5] as const

const mockTeachers = [
  { id: 't1', name: 'Prof. Carlos Silva' },
  { id: 't2', name: 'Prof. Maria Santos' },
  { id: 't3', name: 'Prof. João Oliveira' },
]

type SlotStatus = 'available' | 'blocked' | 'pending'

const mockAvailability: Record<string, SlotStatus> = {
  '1-07:00': 'available', '1-07:50': 'available', '1-08:50': 'available', '1-09:40': 'blocked',
  '2-07:00': 'available', '2-07:50': 'pending', '2-08:50': 'available',
  '3-13:00': 'available', '3-13:50': 'available', '3-14:50': 'blocked',
  '4-19:00': 'available', '4-19:50': 'available', '4-20:50': 'available',
  '5-08:50': 'available', '5-09:40': 'available',
}

const mockBlocks: TeacherBlock[] = [
  { id: 'b1', teacherId: 't1', organizationId: 'o1', blockType: 'vacation', startDate: '2025-07-01', endDate: '2025-07-15', reason: 'Férias de julho', isApproved: true, createdAt: '2025-01-01', updatedAt: '2025-01-01' },
  { id: 'b2', teacherId: 't2', organizationId: 'o1', blockType: 'sick_leave', startDate: '2025-03-10', endDate: '2025-03-12', reason: 'Licença médica', isApproved: true, createdAt: '2025-01-01', updatedAt: '2025-01-01' },
  { id: 'b3', teacherId: 't3', organizationId: 'o1', blockType: 'conference', startDate: '2025-04-20', endDate: '2025-04-25', reason: 'Congresso de Tecnologia', isApproved: false, createdAt: '2025-01-01', updatedAt: '2025-01-01' },
]

const blockTypeLabels: Record<string, string> = { vacation: 'Férias', sick_leave: 'Licença Médica', personal: 'Pessoal', conference: 'Congresso', other: 'Outro' }

export default function AvailabilityPage() {
  const [selectedTeacher, setSelectedTeacher] = useState('t1')
  const [availability, setAvailability] = useState(mockAvailability)
  const [blocks] = useState(mockBlocks)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [dialogTab, setDialogTab] = useState<'availability' | 'block'>('availability')
  const [formData, setFormData] = useState({
    dayOfWeek: '1', startTime: '08:00', endTime: '09:40', notes: '',
    blockType: 'vacation', startDate: '', endDate: '', reason: '',
  })

  const toggleSlot = (day: number, time: string) => {
    const key = `${day}-${time}`
    setAvailability((prev) => {
      const current = prev[key]
      if (current === 'available') return { ...prev, [key]: 'blocked' }
      return { ...prev, [key]: 'available' }
    })
  }

  const handleSaveAvailability = () => {
    toast.success('Disponibilidade salva com sucesso!')
    setDialogOpen(false)
  }

  const handleSaveBlock = () => {
    toast.success('Bloqueio criado com sucesso!')
    setDialogOpen(false)
  }

  const getSlotColor = (status: SlotStatus | undefined) => {
    switch (status) {
      case 'available': return 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
      case 'blocked': return 'bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800'
      case 'pending': return 'bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800'
      default: return 'bg-muted/50 text-muted-foreground border-transparent'
    }
  }

  const pendingCount = Object.values(availability).filter((v) => v === 'pending').length

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <PageHeader
        title="Disponibilidade"
        description="Gerencie a disponibilidade e bloqueios dos professores"
        breadcrumbs={[{ label: 'Dashboard', href: '/' }, { label: 'Disponibilidade' }]}
        actions={
          <div className="flex gap-2">
            {pendingCount > 0 && (
              <Badge variant="outline" className="text-amber-600 border-amber-200 bg-amber-50 dark:bg-amber-950/50 dark:border-amber-800 h-9 px-3">
                <AlertCircle className="mr-1.5 h-3.5 w-3.5" /> {pendingCount} pendente(s)
              </Badge>
            )}
            <Button onClick={() => { setDialogTab('availability'); setDialogOpen(true) }}>
              <Plus className="mr-2 h-4 w-4" /> Adicionar Horário
            </Button>
            <Button variant="outline" onClick={() => { setDialogTab('block'); setDialogOpen(true) }}>
              <Calendar className="mr-2 h-4 w-4" /> Bloquear Período
            </Button>
          </div>
        }
      />

      {/* Teacher Selector */}
      <div className="flex items-center gap-3">
        <Label className="text-sm font-medium">Professor:</Label>
        <Select value={selectedTeacher} onValueChange={setSelectedTeacher}>
          <SelectTrigger className="w-[280px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            {mockTeachers.map((t) => (
              <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 text-sm">
        <div className="flex items-center gap-1.5">
          <div className="h-3 w-3 rounded bg-emerald-200 dark:bg-emerald-800" />
          <span className="text-muted-foreground">Disponível</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-3 w-3 rounded bg-red-200 dark:bg-red-800" />
          <span className="text-muted-foreground">Bloqueado</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-3 w-3 rounded bg-amber-200 dark:bg-amber-800" />
          <span className="text-muted-foreground">Pendente</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-3 w-3 rounded bg-muted" />
          <span className="text-muted-foreground">Indefinido</span>
        </div>
      </div>

      {/* Weekly Grid */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  <th className="p-3 text-left text-xs font-semibold uppercase text-muted-foreground w-20 border-b">Horário</th>
                  {days.map((day) => (
                    <th key={day} className="p-3 text-center text-xs font-semibold uppercase text-muted-foreground border-b">
                      {WEEKDAYS_SHORT[day as keyof typeof WEEKDAYS_SHORT]}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {timeSlots.map((time, idx) => (
                  <tr key={time}>
                    <td className="p-2 text-xs font-medium text-muted-foreground border-b border-r">
                      {time}
                    </td>
                    {days.map((day) => {
                      const key = `${day}-${time}`
                      const status = availability[key]
                      return (
                        <td key={key} className="p-1 border-b">
                          <button
                            onClick={() => toggleSlot(day, time)}
                            className={cn(
                              'w-full h-10 rounded-md border text-[10px] font-medium transition-all hover:opacity-80',
                              getSlotColor(status)
                            )}
                          >
                            {status === 'available' ? '✓' : status === 'blocked' ? '✗' : status === 'pending' ? '?' : ''}
                          </button>
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Block Periods */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Períodos Bloqueados</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {blocks.map((block) => (
              <div key={block.id} className="flex items-center justify-between p-3 rounded-lg border bg-muted/30">
                <div className="flex items-center gap-3">
                  <div className={cn('rounded-lg p-2', block.isApproved ? 'bg-red-100 dark:bg-red-900/30' : 'bg-amber-100 dark:bg-amber-900/30')}>
                    <Clock className={cn('h-4 w-4', block.isApproved ? 'text-red-600' : 'text-amber-600')} />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{blockTypeLabels[block.blockType]}</p>
                    <p className="text-xs text-muted-foreground">
                      {block.startDate} a {block.endDate} — {block.reason}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {!block.isApproved && (
                    <>
                      <Button size="sm" variant="outline" className="h-7 text-xs text-emerald-600" onClick={() => toast.success('Bloqueio aprovado!')}>
                        <Check className="mr-1 h-3 w-3" /> Aprovar
                      </Button>
                      <Button size="sm" variant="outline" className="h-7 text-xs text-red-500" onClick={() => toast.info('Bloqueio rejeitado!')}>
                        <X className="mr-1 h-3 w-3" /> Rejeitar
                      </Button>
                    </>
                  )}
                  {block.isApproved && (
                    <Badge variant="secondary" className="text-xs">Aprovado</Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{dialogTab === 'availability' ? 'Adicionar Horário' : 'Bloquear Período'}</DialogTitle>
            <DialogDescription>
              {dialogTab === 'availability' ? 'Defina um horário recorrente de disponibilidade.' : 'Crie um bloqueio para o professor.'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            {dialogTab === 'availability' ? (
              <>
                <div className="space-y-2"><Label>Dia da Semana</Label>
                  <Select value={formData.dayOfWeek} onValueChange={(v) => setFormData({ ...formData, dayOfWeek: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Segunda-feira</SelectItem><SelectItem value="2">Terça-feira</SelectItem>
                      <SelectItem value="3">Quarta-feira</SelectItem><SelectItem value="4">Quinta-feira</SelectItem>
                      <SelectItem value="5">Sexta-feira</SelectItem><SelectItem value="6">Sábado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2"><Label>Horário Início</Label><Input type="time" value={formData.startTime} onChange={(e) => setFormData({ ...formData, startTime: e.target.value })} /></div>
                  <div className="space-y-2"><Label>Horário Fim</Label><Input type="time" value={formData.endTime} onChange={(e) => setFormData({ ...formData, endTime: e.target.value })} /></div>
                </div>
                <div className="space-y-2"><Label>Observações</Label><Textarea value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} rows={2} /></div>
              </>
            ) : (
              <>
                <div className="space-y-2"><Label>Tipo de Bloqueio</Label>
                  <Select value={formData.blockType} onValueChange={(v) => setFormData({ ...formData, blockType: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="vacation">Férias</SelectItem><SelectItem value="sick_leave">Licença Médica</SelectItem>
                      <SelectItem value="personal">Pessoal</SelectItem><SelectItem value="conference">Congresso</SelectItem><SelectItem value="other">Outro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2"><Label>Data Início</Label><Input type="date" value={formData.startDate} onChange={(e) => setFormData({ ...formData, startDate: e.target.value })} /></div>
                  <div className="space-y-2"><Label>Data Fim</Label><Input type="date" value={formData.endDate} onChange={(e) => setFormData({ ...formData, endDate: e.target.value })} /></div>
                </div>
                <div className="space-y-2"><Label>Motivo</Label><Textarea value={formData.reason} onChange={(e) => setFormData({ ...formData, reason: e.target.value })} rows={2} /></div>
              </>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
            <Button onClick={dialogTab === 'availability' ? handleSaveAvailability : handleSaveBlock}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  )
}
