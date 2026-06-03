'use client'

import { useState, useEffect, useMemo } from 'react'
import {
  Plus, Search, Pencil, Trash2, Eye, MapPin, Users, Calendar, Building2,
  MoreHorizontal, Monitor, Projector, Snowflake, Volume2, ChevronDown,
  Layers, BarChart3, ToggleLeft, ToggleRight, Loader2,
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Progress } from '@/components/ui/progress'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

// ---------------------------------------------------------------------------
// Types & Mock Data
// ---------------------------------------------------------------------------

interface RoomItem {
  id: string
  name: string
  code: string
  capacity: number
  type: string
  building: string
  floor: number
  resources: string[]
  isActive: boolean
  utilization: number
}

interface RoomFormData {
  name: string
  code: string
  capacity: number
  type: string
  building: string
  floor: number
  resources: string[]
}

interface ScheduleSlot {
  time: string
  subject: string
  teacher: string
}

const RESOURCE_OPTIONS = [
  { id: 'projector', label: 'Projector', icon: Projector },
  { id: 'whiteboard', label: 'Whiteboard', icon: Monitor },
  { id: 'ac', label: 'Air Conditioning', icon: Snowflake },
  { id: 'audio', label: 'Audio System', icon: Volume2 },
  { id: 'computers', label: 'Computers', icon: Monitor },
]

const ROOM_TYPES = ['CLASSROOM', 'LAB', 'AUDITORIUM', 'STUDIO']

const mockRooms: RoomItem[] = [
  { id: '1', name: 'Computer Lab A', code: 'LAB-A', capacity: 40, type: 'LAB', building: 'Tech Building', floor: 2, resources: ['projector', 'computers', 'ac', 'whiteboard'], isActive: true, utilization: 92 },
  { id: '2', name: 'Computer Lab B', code: 'LAB-B', capacity: 35, type: 'LAB', building: 'Tech Building', floor: 2, resources: ['projector', 'computers', 'ac'], isActive: true, utilization: 78 },
  { id: '3', name: 'Room 101', code: 'R-101', capacity: 50, type: 'CLASSROOM', building: 'Main Building', floor: 1, resources: ['projector', 'whiteboard', 'ac', 'audio'], isActive: true, utilization: 85 },
  { id: '4', name: 'Room 102', code: 'R-102', capacity: 45, type: 'CLASSROOM', building: 'Main Building', floor: 1, resources: ['projector', 'whiteboard', 'ac'], isActive: true, utilization: 64 },
  { id: '5', name: 'Room 201', code: 'R-201', capacity: 60, type: 'CLASSROOM', building: 'Main Building', floor: 2, resources: ['projector', 'whiteboard', 'ac', 'audio'], isActive: true, utilization: 72 },
  { id: '6', name: 'Studio 1', code: 'ST-1', capacity: 30, type: 'STUDIO', building: 'Design Building', floor: 1, resources: ['projector', 'computers', 'ac', 'audio'], isActive: true, utilization: 71 },
  { id: '7', name: 'Main Auditorium', code: 'AUD-1', capacity: 200, type: 'AUDITORIUM', building: 'Main Building', floor: 0, resources: ['projector', 'ac', 'audio'], isActive: true, utilization: 45 },
  { id: '8', name: 'Room 301', code: 'R-301', capacity: 40, type: 'CLASSROOM', building: 'Main Building', floor: 3, resources: ['projector', 'whiteboard'], isActive: false, utilization: 0 },
]

const mockScheduleSlots: ScheduleSlot[] = [
  { time: '08:00 - 09:50', subject: 'Data Structures', teacher: 'Prof. Rodrigues' },
  { time: '10:00 - 11:50', subject: 'Calculus II', teacher: 'Prof. Mendes' },
  { time: '14:00 - 15:50', subject: 'UX Fundamentals', teacher: 'Prof. Ferreira' },
  { time: '16:00 - 17:50', subject: 'Web Development', teacher: 'Prof. Santos' },
]

const emptyFormData: RoomFormData = { name: '', code: '', capacity: 40, type: 'CLASSROOM', building: '', floor: 1, resources: [] }

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function RoomManagementPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [rooms, setRooms] = useState<RoomItem[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState<string>('all')
  const [filterBuilding, setFilterBuilding] = useState<string>('all')
  const [activeTab, setActiveTab] = useState('list')

  const [createOpen, setCreateOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [scheduleOpen, setScheduleOpen] = useState(false)

  const [formData, setFormData] = useState<RoomFormData>(emptyFormData)
  const [selectedRoom, setSelectedRoom] = useState<RoomItem | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => { setRooms(mockRooms); setIsLoading(false) }, 800)
    return () => clearTimeout(timer)
  }, [])

  const filteredRooms = useMemo(() => {
    let items = [...rooms]
    if (filterType !== 'all') items = items.filter((r) => r.type === filterType)
    if (filterBuilding !== 'all') items = items.filter((r) => r.building === filterBuilding)
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      items = items.filter((r) => r.name.toLowerCase().includes(q) || r.code.toLowerCase().includes(q))
    }
    return items
  }, [rooms, filterType, filterBuilding, searchQuery])

  const buildings = useMemo(() => [...new Set(rooms.map((r) => r.building))], [rooms])
  const avgUtilization = useMemo(() => {
    const active = rooms.filter((r) => r.isActive)
    return active.length ? Math.round(active.reduce((s, r) => s + r.utilization, 0) / active.length) : 0
  }, [rooms])

  const handleCreate = () => { setFormData(emptyFormData); setCreateOpen(true) }
  const handleEdit = (room: RoomItem) => {
    setSelectedRoom(room)
    setFormData({ name: room.name, code: room.code, capacity: room.capacity, type: room.type, building: room.building, floor: room.floor, resources: [...room.resources] })
    setEditOpen(true)
  }
  const handleDelete = (room: RoomItem) => { setSelectedRoom(room); setDeleteOpen(true) }
  const handleViewSchedule = (room: RoomItem) => { setSelectedRoom(room); setScheduleOpen(true) }

  const toggleResource = (resourceId: string) => {
    setFormData((prev) => ({
      ...prev,
      resources: prev.resources.includes(resourceId)
        ? prev.resources.filter((r) => r !== resourceId)
        : [...prev.resources, resourceId],
    }))
  }

  const handleSubmitCreate = async () => {
    setIsSubmitting(true)
    await new Promise((r) => setTimeout(r, 1200))
    setRooms((prev) => [...prev, { id: String(Date.now()), ...formData, isActive: true, utilization: 0 }])
    setIsSubmitting(false)
    setCreateOpen(false)
  }

  const handleSubmitEdit = async () => {
    setIsSubmitting(true)
    await new Promise((r) => setTimeout(r, 1200))
    setRooms((prev) => prev.map((r) => r.id === selectedRoom?.id ? { ...r, ...formData } : r))
    setIsSubmitting(false)
    setEditOpen(false)
  }

  const handleConfirmDelete = () => {
    setRooms((prev) => prev.filter((r) => r.id !== selectedRoom?.id))
    setDeleteOpen(false)
  }

  const handleToggleStatus = (roomId: string) => {
    setRooms((prev) => prev.map((r) => r.id === roomId ? { ...r, isActive: !r.isActive } : r))
  }

  const getUtilColor = (u: number) => u >= 80 ? 'text-green-600' : u >= 50 ? 'text-yellow-600' : 'text-red-600'
  const getTypeBadgeColor = (type: string) => {
    switch (type) {
      case 'LAB': return 'bg-blue-100 text-blue-700'
      case 'AUDITORIUM': return 'bg-purple-100 text-purple-700'
      case 'STUDIO': return 'bg-fuchsia-100 text-fuchsia-700'
      default: return 'bg-violet-100 text-violet-700'
    }
  }

  if (isLoading) {
    return <div className="flex-1 space-y-6 p-6"><Skeleton className="h-10 w-48" /><Skeleton className="h-40 w-full" /><Skeleton className="h-96 w-full" /></div>
  }

  return (
    <div className="flex-1 space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-violet-700 to-purple-500 bg-clip-text text-transparent">Room Management</h1>
          <p className="text-muted-foreground mt-1">Manage rooms, resources, and utilization</p>
        </div>
        <Button onClick={handleCreate} className="gap-2 bg-violet-600 hover:bg-violet-700"><Plus className="h-4 w-4" /> New Room</Button>
      </div>

      {/* Utilization Summary */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <Card className="border-violet-200 dark:border-violet-800/50">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-100 dark:bg-violet-900/50"><Layers className="h-5 w-5 text-violet-600" /></div>
            <div><p className="text-sm text-muted-foreground">Total Rooms</p><p className="text-2xl font-bold">{rooms.length}</p></div>
          </CardContent>
        </Card>
        <Card className="border-violet-200 dark:border-violet-800/50">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900/50"><ToggleRight className="h-5 w-5 text-green-600" /></div>
            <div><p className="text-sm text-muted-foreground">Active Rooms</p><p className="text-2xl font-bold">{rooms.filter((r) => r.isActive).length}</p></div>
          </CardContent>
        </Card>
        <Card className="border-violet-200 dark:border-violet-800/50">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-900/50"><BarChart3 className="h-5 w-5 text-purple-600" /></div>
            <div><p className="text-sm text-muted-foreground">Avg Utilization</p><p className={cn('text-2xl font-bold', getUtilColor(avgUtilization))}>{avgUtilization}%</p></div>
          </CardContent>
        </Card>
        <Card className="border-violet-200 dark:border-violet-800/50">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-fuchsia-100 dark:bg-fuchsia-900/50"><Users className="h-5 w-5 text-fuchsia-600" /></div>
            <div><p className="text-sm text-muted-foreground">Total Capacity</p><p className="text-2xl font-bold">{rooms.reduce((s, r) => s + r.capacity, 0)}</p></div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="list">Room List</TabsTrigger>
          <TabsTrigger value="metrics">Utilization Metrics</TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="mt-4 space-y-4">
          {/* Filters */}
          <Card className="border-violet-200 dark:border-violet-800/50">
            <CardContent className="p-4">
              <div className="flex flex-col gap-3 md:flex-row md:items-center">
                <div className="relative flex-1"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input placeholder="Buscar salas..." className="pl-9" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} /></div>
                <Select value={filterType} onValueChange={setFilterType}><SelectTrigger className="w-40"><SelectValue placeholder="Tipo" /></SelectTrigger><SelectContent><SelectItem value="all">Todos os tipos</SelectItem>{ROOM_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent></Select>
                <Select value={filterBuilding} onValueChange={setFilterBuilding}><SelectTrigger className="w-44"><SelectValue placeholder="Prédio" /></SelectTrigger><SelectContent><SelectItem value="all">Todos os prédios</SelectItem>{buildings.map((b) => <SelectItem key={b} value={b}>{b}</SelectItem>)}</SelectContent></Select>
              </div>
            </CardContent>
          </Card>

          {/* Room Table */}
          <Card className="border-violet-200 dark:border-violet-800/50">
            <CardContent className="p-0">
              <Table>
                <TableHeader><TableRow className="border-violet-100"><TableHead>Code</TableHead><TableHead>Name</TableHead><TableHead>Type</TableHead><TableHead>Capacity</TableHead><TableHead>Location</TableHead><TableHead>Resources</TableHead><TableHead>Utilization</TableHead><TableHead>Status</TableHead><TableHead className="w-12"></TableHead></TableRow></TableHeader>
                <TableBody>
                  {filteredRooms.map((room) => (
                    <TableRow key={room.id} className={cn('border-violet-100', !room.isActive && 'opacity-50')}>
                      <TableCell><Badge variant="outline" className="font-mono">{room.code}</Badge></TableCell>
                      <TableCell className="font-medium">{room.name}</TableCell>
                      <TableCell><Badge className={getTypeBadgeColor(room.type)}>{room.type}</Badge></TableCell>
                      <TableCell><div className="flex items-center gap-1.5"><Users className="h-3.5 w-3.5 text-muted-foreground" />{room.capacity}</div></TableCell>
                      <TableCell><div className="flex items-center gap-1.5"><Building2 className="h-3.5 w-3.5 text-muted-foreground" />{room.building} F{room.floor}</div></TableCell>
                      <TableCell>
                        <div className="flex gap-1 flex-wrap">
                          {room.resources.slice(0, 3).map((res) => <Badge key={res} variant="secondary" className="text-[10px] px-1.5 py-0">{res}</Badge>)}
                          {room.resources.length > 3 && <Badge variant="secondary" className="text-[10px] px-1.5 py-0">+{room.resources.length - 3}</Badge>}
                        </div>
                      </TableCell>
                      <TableCell><span className={cn('text-sm font-medium', getUtilColor(room.utilization))}>{room.isActive ? `${room.utilization}%` : '—'}</span></TableCell>
                      <TableCell>
                        <Switch checked={room.isActive} onCheckedChange={() => handleToggleStatus(room.id)} />
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleViewSchedule(room)} className="gap-2 cursor-pointer"><Eye className="h-4 w-4" /> View Schedule</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleEdit(room)} className="gap-2 cursor-pointer"><Pencil className="h-4 w-4" /> Edit</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDelete(room)} className="gap-2 cursor-pointer text-red-600 focus:text-red-600"><Trash2 className="h-4 w-4" /> Delete</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="metrics" className="mt-4">
          <Card className="border-violet-200 dark:border-violet-800/50">
            <CardHeader><CardTitle>Room Utilization Metrics</CardTitle><CardDescription>Current utilization percentage for all active rooms</CardDescription></CardHeader>
            <CardContent className="space-y-4">
              {rooms.filter((r) => r.isActive).map((room) => (
                <div key={room.id} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2"><MapPin className="h-4 w-4 text-muted-foreground" /><span className="font-medium">{room.name}</span><Badge variant="outline" className="text-xs">{room.code}</Badge></div>
                    <span className={cn('font-medium', getUtilColor(room.utilization))}>{room.utilization}%</span>
                  </div>
                  <Progress value={room.utilization} className="h-2" />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Create/Edit Dialog */}
      <Dialog open={createOpen || editOpen} onOpenChange={() => { setCreateOpen(false); setEditOpen(false) }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-violet-700">{createOpen ? 'Create New Room' : 'Edit Room'}</DialogTitle>
            <DialogDescription>{createOpen ? 'Add a new room to your institution.' : `Editing ${selectedRoom?.name}`}</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Room Name</Label><Input placeholder="e.g. Room 101" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} /></div>
              <div className="space-y-2"><Label>Room Code</Label><Input placeholder="e.g. R-101" value={formData.code} onChange={(e) => setFormData({ ...formData, code: e.target.value })} /></div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2"><Label>Capacity</Label><Input type="number" min={1} value={formData.capacity} onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) || 0 })} /></div>
              <div className="space-y-2"><Label>Tipo</Label><Select value={formData.type} onValueChange={(v) => setFormData({ ...formData, type: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{ROOM_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent></Select></div>
              <div className="space-y-2"><Label>Floor</Label><Input type="number" min={0} value={formData.floor} onChange={(e) => setFormData({ ...formData, floor: parseInt(e.target.value) || 0 })} /></div>
            </div>
            <div className="space-y-2"><Label>Prédio</Label><Input placeholder="e.g. Main Building" value={formData.building} onChange={(e) => setFormData({ ...formData, building: e.target.value })} /></div>
            <div className="space-y-2">
              <Label>Resources</Label>
              <div className="flex flex-wrap gap-2">
                {RESOURCE_OPTIONS.map((res) => (
                  <Button key={res.id} type="button" variant={formData.resources.includes(res.id) ? 'default' : 'outline'} size="sm" onClick={() => toggleResource(res.id)} className={cn('gap-1.5', formData.resources.includes(res.id) ? 'bg-violet-600 hover:bg-violet-700' : '')}>
                    <res.icon className="h-3.5 w-3.5" /> {res.label}
                  </Button>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setCreateOpen(false); setEditOpen(false) }}>Cancel</Button>
            <Button onClick={createOpen ? handleSubmitCreate : handleSubmitEdit} disabled={isSubmitting} className="bg-violet-600 hover:bg-violet-700">
              {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {createOpen ? 'Create Room' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Room</AlertDialogTitle>
            <AlertDialogDescription>Are you sure you want to delete <strong>{selectedRoom?.name}</strong> ({selectedRoom?.code})? This action cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete} className="bg-red-600 hover:bg-red-700">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Schedule View */}
      <Dialog open={scheduleOpen} onOpenChange={setScheduleOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle className="text-violet-700">Room Schedule - {selectedRoom?.name} ({selectedRoom?.code})</DialogTitle><DialogDescription>Classes scheduled for today</DialogDescription></DialogHeader>
          <div className="space-y-3">
            {mockScheduleSlots.map((slot, i) => (
              <div key={i} className="flex items-center gap-4 p-3 rounded-lg border border-violet-100 bg-violet-50/50">
                <div className="flex items-center gap-2 text-sm font-medium text-violet-700 min-w-[120px]"><Calendar className="h-4 w-4" />{slot.time}</div>
                <div className="flex-1"><p className="text-sm font-medium">{slot.subject}</p><p className="text-xs text-muted-foreground">{slot.teacher}</p></div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
