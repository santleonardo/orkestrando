'use client'

import { useState, useMemo } from 'react'
import { PageHeader } from '@/components/shared/page-header'
import { DataTable, SortableHeader } from '@/components/shared/data-table'
import { StatsCard } from '@/components/shared/stats-card'
import { ConfirmDialog } from '@/components/shared/confirm-dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Plus, DoorOpen, DoorOpenIcon, MoreHorizontal, Eye, Pencil, Trash2, Monitor, Snowflake, Presentation, Wifi } from 'lucide-react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { toast } from 'sonner'
import { motion } from 'framer-motion'
import type { ColumnDef } from '@tanstack/react-table'
import type { Room } from '@/lib/types'

const mockRooms: Room[] = [
  { id: '1', organizationId: 'o1', name: 'Sala 201', code: 'S201', capacity: 35, roomType: 'classroom', building: 'Bloco A', floor: 2, hasProjector: true, hasWhiteboard: true, hasAudioSystem: false, hasComputers: false, wifiAvailable: true, airConditioned: true, isActive: true, createdAt: '2024-01-01', updatedAt: '2024-01-01' },
  { id: '2', organizationId: 'o1', name: 'Laboratório 01', code: 'LAB01', capacity: 25, roomType: 'lab', building: 'Bloco B', floor: 1, hasProjector: true, hasWhiteboard: true, hasAudioSystem: true, hasComputers: true, wifiAvailable: true, airConditioned: true, isActive: true, createdAt: '2024-01-01', updatedAt: '2024-01-01' },
  { id: '3', organizationId: 'o1', name: 'Laboratório 03', code: 'LAB03', capacity: 20, roomType: 'lab', building: 'Bloco B', floor: 1, hasProjector: true, hasWhiteboard: true, hasAudioSystem: false, hasComputers: true, wifiAvailable: true, airConditioned: true, isActive: true, createdAt: '2024-01-01', updatedAt: '2024-01-01' },
  { id: '4', organizationId: 'o1', name: 'Auditório Principal', code: 'AUD01', capacity: 150, roomType: 'auditorium', building: 'Bloco Central', floor: 0, hasProjector: true, hasWhiteboard: false, hasAudioSystem: true, hasComputers: false, wifiAvailable: true, airConditioned: true, isActive: true, createdAt: '2024-01-01', updatedAt: '2024-01-01' },
  { id: '5', organizationId: 'o1', name: 'Sala 105', code: 'S105', capacity: 30, roomType: 'classroom', building: 'Bloco A', floor: 1, hasProjector: false, hasWhiteboard: true, hasAudioSystem: false, hasComputers: false, wifiAvailable: true, airConditioned: false, isActive: true, createdAt: '2024-01-01', updatedAt: '2024-01-01' },
]

const roomTypeLabels: Record<string, string> = { classroom: 'Sala de Aula', lab: 'Laboratório', auditorium: 'Auditório', gym: 'Ginásio', library: 'Biblioteca', other: 'Outro' }

const resourceTags: { label: string; key: keyof Room }[] = [
  { label: 'Projetor', key: 'hasProjector' },
  { label: 'Ar-condicionado', key: 'airConditioned' },
  { label: 'Quadro branco', key: 'hasWhiteboard' },
  { label: 'Computadores', key: 'hasComputers' },
  { label: 'Wi-Fi', key: 'wifiAvailable' },
  { label: 'Som', key: 'hasAudioSystem' },
]

export default function RoomsPage() {
  const [rooms, setRooms] = useState(mockRooms)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null)
  const [formData, setFormData] = useState({
    name: '', code: '', capacity: '30', roomType: 'classroom', building: '', floor: '1',
    hasProjector: false, hasWhiteboard: true, hasAudioSystem: false, hasComputers: false, wifiAvailable: true, airConditioned: false,
  })

  const columns: ColumnDef<Room>[] = [
    {
      accessorKey: 'name',
      header: ({ column }) => <SortableHeader column={column}>Nome</SortableHeader>,
      cell: ({ row }) => (
        <div>
          <p className="font-medium text-sm">{row.original.name}</p>
          <p className="text-xs text-muted-foreground">{row.original.code} • {row.original.building || '—'}</p>
        </div>
      ),
    },
    {
      accessorKey: 'capacity',
      header: ({ column }) => <SortableHeader column={column}>Capacidade</SortableHeader>,
      cell: ({ row }) => <span className="text-sm">{row.original.capacity} lugares</span>,
    },
    {
      accessorKey: 'resources',
      header: 'Recursos',
      cell: ({ row }) => (
        <div className="flex flex-wrap gap-1">
          {resourceTags.filter((r) => row.original[r.key]).map((r) => (
            <Badge key={r.key} variant="outline" className="text-[10px]">{r.label}</Badge>
          ))}
        </div>
      ),
    },
    {
      accessorKey: 'roomType',
      header: 'Tipo',
      cell: ({ row }) => <Badge variant="secondary" className="text-xs">{roomTypeLabels[row.original.roomType]}</Badge>,
    },
    {
      accessorKey: 'isActive',
      header: 'Status',
      cell: ({ row }) => (
        <Badge variant={row.original.isActive ? 'default' : 'secondary'} className={row.original.isActive ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300' : ''}>
          {row.original.isActive ? 'Disponível' : 'Manutenção'}
        </Badge>
      ),
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => { setSelectedRoom(row.original); openEditDialog(row.original) }}><Pencil className="mr-2 h-4 w-4" /> Editar</DropdownMenuItem>
            <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => { setSelectedRoom(row.original); setDeleteOpen(true) }}><Trash2 className="mr-2 h-4 w-4" /> Excluir</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ]

  const openEditDialog = (room: Room) => {
    setFormData({
      name: room.name, code: room.code, capacity: String(room.capacity), roomType: room.roomType,
      building: room.building || '', floor: String(room.floor || 0),
      hasProjector: room.hasProjector, hasWhiteboard: room.hasWhiteboard, hasAudioSystem: room.hasAudioSystem,
      hasComputers: room.hasComputers, wifiAvailable: room.wifiAvailable, airConditioned: room.airConditioned,
    })
    setDialogOpen(true)
  }

  const handleSave = () => { toast.success(selectedRoom ? 'Sala atualizada!' : 'Sala criada!'); setDialogOpen(false) }
  const handleDelete = () => { setRooms((prev) => prev.filter((r) => r.id !== selectedRoom?.id)); toast.success('Sala excluída!'); setDeleteOpen(false) }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <PageHeader title="Salas" description="Gerencie as salas e laboratórios" breadcrumbs={[{ label: 'Dashboard', href: '/' }, { label: 'Salas' }]}
        actions={<Button onClick={() => { setSelectedRoom(null); setFormData({ name: '', code: '', capacity: '30', roomType: 'classroom', building: '', floor: '1', hasProjector: false, hasWhiteboard: true, hasAudioSystem: false, hasComputers: false, wifiAvailable: true, airConditioned: false }); setDialogOpen(true) }}><Plus className="mr-2 h-4 w-4" /> Nova Sala</Button>}
      />
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
        <StatsCard title="Total Salas" value={rooms.length} icon={DoorOpen} iconColor="text-purple-600 bg-purple-50 dark:bg-purple-950/50" />
        <StatsCard title="Disponíveis" value={rooms.filter((r) => r.isActive).length} icon={DoorOpenIcon} iconColor="text-emerald-600 bg-emerald-50 dark:bg-emerald-950/50" />
        <StatsCard title="Capacidade Total" value={rooms.reduce((a, r) => a + r.capacity, 0)} icon={Monitor} iconColor="text-blue-600 bg-blue-50 dark:bg-blue-950/50" />
      </div>
      <DataTable columns={columns} data={rooms} searchKey="name" searchPlaceholder="Buscar sala..." emptyIcon={DoorOpen} emptyTitle="Nenhuma sala encontrada" />

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedRoom ? 'Editar Sala' : 'Nova Sala'}</DialogTitle>
            <DialogDescription>Preencha os dados da sala.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2"><Label>Nome</Label><Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="Sala 201" /></div>
              <div className="space-y-2"><Label>Código</Label><Input value={formData.code} onChange={(e) => setFormData({ ...formData, code: e.target.value })} placeholder="S201" /></div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-2"><Label>Capacidade</Label><Input type="number" value={formData.capacity} onChange={(e) => setFormData({ ...formData, capacity: e.target.value })} /></div>
              <div className="space-y-2"><Label>Tipo</Label>
                <Select value={formData.roomType} onValueChange={(v) => setFormData({ ...formData, roomType: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="classroom">Sala de Aula</SelectItem><SelectItem value="lab">Laboratório</SelectItem><SelectItem value="auditorium">Auditório</SelectItem><SelectItem value="other">Outro</SelectItem></SelectContent>
                </Select>
              </div>
              <div className="space-y-2"><Label>Andar</Label><Input type="number" value={formData.floor} onChange={(e) => setFormData({ ...formData, floor: e.target.value })} /></div>
            </div>
            <div className="space-y-2"><Label>Prédio</Label><Input value={formData.building} onChange={(e) => setFormData({ ...formData, building: e.target.value })} placeholder="Bloco A" /></div>
            <div className="space-y-3">
              <Label>Recursos</Label>
              <div className="grid grid-cols-2 gap-2">
                {resourceTags.map((r) => (
                  <div key={r.key} className="flex items-center gap-2">
                    <Checkbox checked={formData[r.key as keyof typeof formData] as boolean} onCheckedChange={(checked) => setFormData({ ...formData, [r.key]: checked === true })} />
                    <Label className="text-sm">{r.label}</Label>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button><Button onClick={handleSave}>Salvar</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog open={deleteOpen} onOpenChange={setDeleteOpen} title="Excluir Sala" description={`Excluir "${selectedRoom?.name}"?`} confirmLabel="Excluir" variant="destructive" onConfirm={handleDelete} />
    </motion.div>
  )
}
