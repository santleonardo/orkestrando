'use client'

import { useState } from 'react'
import { PageHeader } from '@/components/shared/page-header'
import { StatsCard } from '@/components/shared/stats-card'
import { ConfirmDialog } from '@/components/shared/confirm-dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Card, CardContent } from '@/components/ui/card'
import { Plus, CalendarRange, Calendar, Clock, MoreHorizontal, Pencil, Trash2, DoorOpen, ChevronRight } from 'lucide-react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { toast } from 'sonner'
import { motion } from 'framer-motion'
import type { Semester } from '@/lib/types'

const mockSemesters: Semester[] = [
  { id: '1', organizationId: 'o1', name: '2025/1', year: 2025, term: 1, startDate: '2025-02-03', endDate: '2025-06-30', currentWeek: 8, totalWeeks: 20, isActive: true, holidays: [], createdAt: '2025-01-01', updatedAt: '2025-01-01' },
  { id: '2', organizationId: 'o1', name: '2024/2', year: 2024, term: 2, startDate: '2024-08-05', endDate: '2024-12-20', currentWeek: 20, totalWeeks: 20, isActive: false, holidays: [], createdAt: '2024-07-01', updatedAt: '2024-12-20' },
  { id: '3', organizationId: 'o1', name: '2024/1', year: 2024, term: 1, startDate: '2024-02-05', endDate: '2024-06-28', currentWeek: 20, totalWeeks: 20, isActive: false, holidays: [], createdAt: '2024-01-01', updatedAt: '2024-06-28' },
]

export default function SemestersPage() {
  const [semesters, setSemesters] = useState(mockSemesters)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [selectedSemester, setSelectedSemester] = useState<Semester | null>(null)
  const [formData, setFormData] = useState({
    name: '', year: '2025', term: '1', startDate: '', endDate: '', totalWeeks: '20',
  })

  const handleSave = () => {
    toast.success(selectedSemester ? 'Semestre atualizado!' : 'Semestre criado!')
    setDialogOpen(false)
  }

  const handleDelete = () => {
    setSemesters((prev) => prev.filter((s) => s.id !== selectedSemester?.id))
    toast.success('Semestre excluído!')
    setDeleteOpen(false)
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <PageHeader
        title="Semestres"
        description="Gerencie os semestres letivos"
        breadcrumbs={[{ label: 'Dashboard', href: '/' }, { label: 'Semestres' }]}
        actions={
          <Button onClick={() => { setSelectedSemester(null); setFormData({ name: '', year: '2025', term: '1', startDate: '', endDate: '', totalWeeks: '20' }); setDialogOpen(true) }}>
            <Plus className="mr-2 h-4 w-4" /> Novo Semestre
          </Button>
        }
      />

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
        <StatsCard title="Total Semestres" value={semesters.length} icon={CalendarRange} iconColor="text-purple-600 bg-purple-50 dark:bg-purple-950/50" />
        <StatsCard title="Semestre Ativo" value={semesters.filter((s) => s.isActive).length} icon={Calendar} iconColor="text-emerald-600 bg-emerald-50 dark:bg-emerald-950/50" />
        <StatsCard title="Semanas no Ativo" value={semesters.find((s) => s.isActive)?.totalWeeks || 0} icon={Clock} iconColor="text-blue-600 bg-blue-50 dark:bg-blue-950/50" />
      </div>

      <div className="grid gap-4">
        {semesters.map((semester) => (
          <Card key={semester.id} className={semester.isActive ? 'border-primary/30 bg-primary/[0.02]' : ''}>
            <CardContent className="p-4 md:p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4 flex-1">
                  <div className={`rounded-lg p-2.5 shrink-0 ${semester.isActive ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
                    <CalendarRange className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-base font-semibold">{semester.name}</h3>
                      {semester.isActive && (
                        <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300 text-[10px]">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 mr-1 animate-pulse" />
                          Ativo
                        </Badge>
                      )}
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-2 text-sm">
                      <div>
                        <p className="text-xs text-muted-foreground">Período</p>
                        <p className="font-medium">{semester.startDate} a {semester.endDate}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Duração</p>
                        <p className="font-medium">{semester.totalWeeks} semanas</p>
                      </div>
                      {semester.isActive && (
                        <div>
                          <p className="text-xs text-muted-foreground">Semana Atual</p>
                          <p className="font-medium">{semester.currentWeek}/{semester.totalWeeks}</p>
                          <div className="h-1.5 rounded-full bg-muted overflow-hidden mt-1">
                            <div className="h-full rounded-full bg-primary" style={{ width: `${((semester.currentWeek ?? 0) / semester.totalWeeks) * 100}%` }} />
                          </div>
                        </div>
                      )}
                      <div>
                        <p className="text-xs text-muted-foreground">Turmas</p>
                        <p className="font-medium">{Math.floor(Math.random() * 15 + 5)} ativas</p>
                      </div>
                    </div>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0"><MoreHorizontal className="h-4 w-4" /></Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => { setSelectedSemester(semester); setFormData({ name: semester.name, year: String(semester.year), term: String(semester.term), startDate: semester.startDate, endDate: semester.endDate, totalWeeks: String(semester.totalWeeks) }); setDialogOpen(true) }}>
                      <Pencil className="mr-2 h-4 w-4" /> Editar
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => { setSelectedSemester(semester); setDeleteOpen(true) }}>
                      <Trash2 className="mr-2 h-4 w-4" /> Excluir
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{selectedSemester ? 'Editar Semestre' : 'Novo Semestre'}</DialogTitle>
            <DialogDescription>Configure o período letivo.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-2"><Label>Nome</Label><Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="2025/1" /></div>
              <div className="space-y-2"><Label>Ano</Label><Input type="number" value={formData.year} onChange={(e) => setFormData({ ...formData, year: e.target.value })} /></div>
              <div className="space-y-2"><Label>Período</Label>
                <Select value={formData.term} onValueChange={(v) => setFormData({ ...formData, term: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="1">1º Semestre</SelectItem><SelectItem value="2">2º Semestre</SelectItem></SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2"><Label>Data Início</Label><Input type="date" value={formData.startDate} onChange={(e) => setFormData({ ...formData, startDate: e.target.value })} /></div>
              <div className="space-y-2"><Label>Data Fim</Label><Input type="date" value={formData.endDate} onChange={(e) => setFormData({ ...formData, endDate: e.target.value })} /></div>
            </div>
            <div className="space-y-2"><Label>Total de Semanas</Label><Input type="number" value={formData.totalWeeks} onChange={(e) => setFormData({ ...formData, totalWeeks: e.target.value })} /></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button><Button onClick={handleSave}>Salvar</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog open={deleteOpen} onOpenChange={setDeleteOpen} title="Excluir Semestre" description={`Excluir "${selectedSemester?.name}"?`} confirmLabel="Excluir" variant="destructive" onConfirm={handleDelete} />
    </motion.div>
  )
}
