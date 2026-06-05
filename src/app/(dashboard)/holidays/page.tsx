'use client'

import { useState } from 'react'
import { PageHeader } from '@/components/shared/page-header'
import { StatsCard } from '@/components/shared/stats-card'
import { ConfirmDialog } from '@/components/shared/confirm-dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus, Calendar, MoreHorizontal, Pencil, Trash2, Download, Repeat, PartyPopper } from 'lucide-react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { formatDate } from '@/lib/utils/date'
import { toast } from 'sonner'
import { motion } from 'framer-motion'
import type { Holiday } from '@/lib/types'

const mockHolidays: Holiday[] = [
  { id: '1', organizationId: 'o1', name: 'Confraternização Universal', date: '2025-01-01', type: 'national', isRecurring: true, affectsClasses: true, createdAt: '2024-01-01', updatedAt: '2024-01-01' },
  { id: '2', organizationId: 'o1', name: 'Carnaval', date: '2025-03-04', type: 'national', isRecurring: false, affectsClasses: true, createdAt: '2024-01-01', updatedAt: '2024-01-01' },
  { id: '3', organizationId: 'o1', name: 'Sexta-feira Santa', date: '2025-04-18', type: 'national', isRecurring: false, affectsClasses: true, createdAt: '2024-01-01', updatedAt: '2024-01-01' },
  { id: '4', organizationId: 'o1', name: 'Tiradentes', date: '2025-04-21', type: 'national', isRecurring: true, affectsClasses: true, createdAt: '2024-01-01', updatedAt: '2024-01-01' },
  { id: '5', organizationId: 'o1', name: 'Dia do Trabalho', date: '2025-05-01', type: 'national', isRecurring: true, affectsClasses: true, createdAt: '2024-01-01', updatedAt: '2024-01-01' },
  { id: '6', organizationId: 'o1', name: 'Independência do Brasil', date: '2025-09-07', type: 'national', isRecurring: true, affectsClasses: true, createdAt: '2024-01-01', updatedAt: '2024-01-01' },
  { id: '7', organizationId: 'o1', name: 'Nossa Senhora Aparecida', date: '2025-10-12', type: 'national', isRecurring: true, affectsClasses: true, createdAt: '2024-01-01', updatedAt: '2024-01-01' },
  { id: '8', organizationId: 'o1', name: 'Aniversário da Instituição', date: '2025-04-15', type: 'institutional', isRecurring: true, affectsClasses: true, createdAt: '2024-01-01', updatedAt: '2024-01-01' },
  { id: '9', organizationId: 'o1', name: 'Proclamação da República', date: '2025-11-15', type: 'national', isRecurring: true, affectsClasses: true, createdAt: '2024-01-01', updatedAt: '2024-01-01' },
  { id: '10', organizationId: 'o1', name: 'Natal', date: '2025-12-25', type: 'national', isRecurring: true, affectsClasses: true, createdAt: '2024-01-01', updatedAt: '2024-01-01' },
]

const holidayTypeLabels: Record<string, string> = { national: 'Nacional', state: 'Estadual', municipal: 'Municipal', institutional: 'Institucional' }
const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']

export default function HolidaysPage() {
  const [holidays, setHolidays] = useState(mockHolidays)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [selectedHoliday, setSelectedHoliday] = useState<Holiday | null>(null)
  const [formData, setFormData] = useState({
    name: '', date: '', type: 'national' as Holiday['type'], isRecurring: true, affectsClasses: true,
  })

  const upcomingHolidays = holidays
    .filter((h) => new Date(h.date) >= new Date())
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 6)

  const handleSave = () => {
    toast.success(selectedHoliday ? 'Feriado atualizado!' : 'Feriado criado!')
    setDialogOpen(false)
  }

  const handleDelete = () => {
    setHolidays((prev) => prev.filter((h) => h.id !== selectedHoliday?.id))
    toast.success('Feriado excluído!')
    setDeleteOpen(false)
  }

  const handleImportBrazilian = () => {
    toast.success('Feriados nacionais brasileiros importados!')
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <PageHeader
        title="Feriados"
        description="Gerencie os feriados e pontos facultativos"
        breadcrumbs={[{ label: 'Dashboard', href: '/' }, { label: 'Feriados' }]}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleImportBrazilian}>
              <Download className="mr-2 h-4 w-4" /> Importar Feriados BR
            </Button>
            <Button onClick={() => { setSelectedHoliday(null); setFormData({ name: '', date: '', type: 'national', isRecurring: true, affectsClasses: true }); setDialogOpen(true) }}>
              <Plus className="mr-2 h-4 w-4" /> Novo Feriado
            </Button>
          </div>
        }
      />

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
        <StatsCard title="Total Feriados" value={holidays.length} icon={Calendar} iconColor="text-purple-600 bg-purple-50 dark:bg-purple-950/50" />
        <StatsCard title="Recorrentes" value={holidays.filter((h) => h.isRecurring).length} icon={Repeat} iconColor="text-blue-600 bg-blue-50 dark:bg-blue-950/50" />
        <StatsCard title="Próximos" value={upcomingHolidays.length} icon={PartyPopper} iconColor="text-amber-600 bg-amber-50 dark:bg-amber-950/50" />
      </div>

      {/* Calendar-like grid */}
      <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
        {/* Upcoming holidays */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Próximos Feriados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {upcomingHolidays.map((holiday) => (
                <div key={holiday.id} className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/30 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="flex flex-col items-center justify-center h-12 w-12 rounded-lg bg-primary/10 text-primary">
                      <span className="text-lg font-bold leading-none">{new Date(holiday.date).getDate()}</span>
                      <span className="text-[10px]">{monthNames[new Date(holiday.date).getMonth()]}</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium">{holiday.name}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <Badge variant="outline" className="text-[10px]">{holidayTypeLabels[holiday.type]}</Badge>
                        {holiday.isRecurring && <Badge variant="secondary" className="text-[10px]">Recorrente</Badge>}
                      </div>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => { setSelectedHoliday(holiday); setFormData({ name: holiday.name, date: holiday.date, type: holiday.type, isRecurring: holiday.isRecurring, affectsClasses: holiday.affectsClasses }); setDialogOpen(true) }}>
                        <Pencil className="mr-2 h-4 w-4" /> Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => { setSelectedHoliday(holiday); setDeleteOpen(true) }}>
                        <Trash2 className="mr-2 h-4 w-4" /> Excluir
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* All holidays by month */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Todos os Feriados ({holidays.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 max-h-[400px] overflow-y-auto custom-scrollbar">
              {[...new Set(holidays.map((h) => new Date(h.date).getMonth()))]
                .sort((a, b) => a - b)
                .map((month) => (
                  <div key={month}>
                    <p className="text-xs font-semibold uppercase text-muted-foreground mb-2">{monthNames[month]}</p>
                    <div className="space-y-1">
                      {holidays
                        .filter((h) => new Date(h.date).getMonth() === month)
                        .sort((a, b) => new Date(a.date).getDate() - new Date(b.date).getDate())
                        .map((holiday) => (
                          <div key={holiday.id} className="flex items-center gap-2 text-sm p-1.5 rounded hover:bg-muted/30">
                            <span className="text-muted-foreground w-6 text-right">{new Date(holiday.date).getDate()}</span>
                            <span className="flex-1">{holiday.name}</span>
                            {holiday.isRecurring && <Repeat className="h-3 w-3 text-muted-foreground" />}
                          </div>
                        ))}
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{selectedHoliday ? 'Editar Feriado' : 'Novo Feriado'}</DialogTitle>
            <DialogDescription>Configure o feriado ou ponto facultativo.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2"><Label>Nome</Label><Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="Nome do feriado" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2"><Label>Data</Label><Input type="date" value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} /></div>
              <div className="space-y-2"><Label>Tipo</Label>
                <Select value={formData.type} onValueChange={(v) => setFormData({ ...formData, type: v as typeof formData.type })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="national">Nacional</SelectItem><SelectItem value="state">Estadual</SelectItem>
                    <SelectItem value="municipal">Municipal</SelectItem><SelectItem value="institutional">Institucional</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <Checkbox checked={formData.isRecurring} onCheckedChange={(c) => setFormData({ ...formData, isRecurring: c === true })} />
                <Label className="text-sm">Repete anualmente</Label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox checked={formData.affectsClasses} onCheckedChange={(c) => setFormData({ ...formData, affectsClasses: c === true })} />
                <Label className="text-sm">Afeta aulas</Label>
              </div>
            </div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button><Button onClick={handleSave}>Salvar</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog open={deleteOpen} onOpenChange={setDeleteOpen} title="Excluir Feriado" description={`Excluir "${selectedHoliday?.name}"?`} confirmLabel="Excluir" variant="destructive" onConfirm={handleDelete} />
    </motion.div>
  )
}
