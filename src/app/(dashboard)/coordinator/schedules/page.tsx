'use client'

import { useState, useEffect, useMemo } from 'react'
import {
  CalendarDays,
  Search,
  Filter,
  Download,
  RefreshCw,
  Sparkles,
  Wand2,
  GripVertical,
  Clock,
  MapPin,
  User,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Check,
  X,
  Eye,
  Layers,
  Printer,
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

// ---------------------------------------------------------------------------
// Types & Constants
// ---------------------------------------------------------------------------

interface ScheduleItem {
  id: string
  subject: string
  code: string
  teacher: string
  room: string
  weekday: string
  startTime: string
  endTime: string
  hasConflict: boolean
  conflictType?: string
  status: string
}

const WEEKDAYS = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'] as const
const WEEKDAY_LABELS: Record<string, string> = {
  MONDAY: 'Monday',
  TUESDAY: 'Tuesday',
  WEDNESDAY: 'Wednesday',
  THURSDAY: 'Thursday',
  FRIDAY: 'Friday',
  SATURDAY: 'Saturday',
}

const TIME_SLOTS = [
  '07:00', '07:30', '08:00', '08:30', '09:00', '09:30',
  '10:00', '10:30', '11:00', '11:30', '12:00', '12:30',
  '13:00', '13:30', '14:00', '14:30', '15:00', '15:30',
  '16:00', '16:30', '17:00', '17:30', '18:00', '18:30',
  '19:00', '19:30', '20:00', '20:30', '21:00', '21:30',
]

const mockScheduleItems: ScheduleItem[] = [
  { id: '1', subject: 'Data Structures', code: 'CS201', teacher: 'Prof. Rodrigues', room: 'Lab A', weekday: 'MONDAY', startTime: '08:00', endTime: '09:50', hasConflict: false, status: 'ACTIVE' },
  { id: '2', subject: 'Calculus II', code: 'MA102', teacher: 'Prof. Mendes', room: 'Room 101', weekday: 'MONDAY', startTime: '10:00', endTime: '11:50', hasConflict: true, conflictType: 'ROOM_OVERLAP', status: 'ACTIVE' },
  { id: '3', subject: 'Physics I', code: 'PH101', teacher: 'Prof. Almeida', room: 'Room 101', weekday: 'MONDAY', startTime: '10:00', endTime: '11:50', hasConflict: true, conflictType: 'ROOM_OVERLAP', status: 'ACTIVE' },
  { id: '4', subject: 'UX Fundamentals', code: 'DS110', teacher: 'Prof. Ferreira', room: 'Studio 1', weekday: 'MONDAY', startTime: '14:00', endTime: '15:50', hasConflict: false, status: 'ACTIVE' },
  { id: '5', subject: 'Algorithms', code: 'CS301', teacher: 'Prof. Rodrigues', room: 'Lab B', weekday: 'TUESDAY', startTime: '08:00', endTime: '09:50', hasConflict: false, status: 'ACTIVE' },
  { id: '6', subject: 'Linear Algebra', code: 'MA201', teacher: 'Prof. Costa', room: 'Room 102', weekday: 'TUESDAY', startTime: '10:00', endTime: '11:50', hasConflict: false, status: 'ACTIVE' },
  { id: '7', subject: 'Web Development', code: 'CS202', teacher: 'Prof. Santos', room: 'Lab A', weekday: 'TUESDAY', startTime: '14:00', endTime: '15:50', hasConflict: false, status: 'ACTIVE' },
  { id: '8', subject: 'Database Systems', code: 'CS303', teacher: 'Prof. Lima', room: 'Lab A', weekday: 'WEDNESDAY', startTime: '08:00', endTime: '09:50', hasConflict: false, status: 'ACTIVE' },
  { id: '9', subject: 'Calculus II', code: 'MA102', teacher: 'Prof. Mendes', room: 'Room 101', weekday: 'WEDNESDAY', startTime: '10:00', endTime: '11:50', hasConflict: false, status: 'ACTIVE' },
  { id: '10', subject: 'Discrete Math', code: 'MA103', teacher: 'Prof. Costa', room: 'Room 102', weekday: 'WEDNESDAY', startTime: '14:00', endTime: '15:50', hasConflict: false, status: 'ACTIVE' },
  { id: '11', subject: 'Operating Systems', code: 'CS401', teacher: 'Prof. Lima', room: 'Lab B', weekday: 'THURSDAY', startTime: '08:00', endTime: '09:50', hasConflict: false, status: 'ACTIVE' },
  { id: '12', subject: 'UX Fundamentals', code: 'DS110', teacher: 'Prof. Ferreira', room: 'Studio 1', weekday: 'THURSDAY', startTime: '10:00', endTime: '11:50', hasConflict: false, status: 'ACTIVE' },
  { id: '13', subject: 'Physics I', code: 'PH101', teacher: 'Prof. Almeida', room: 'Room 101', weekday: 'FRIDAY', startTime: '08:00', endTime: '09:50', hasConflict: false, status: 'ACTIVE' },
  { id: '14', subject: 'Algorithms', code: 'CS301', teacher: 'Prof. Rodrigues', room: 'Lab B', weekday: 'FRIDAY', startTime: '10:00', endTime: '11:50', hasConflict: false, status: 'ACTIVE' },
  { id: '15', subject: 'Networks', code: 'CS302', teacher: 'Prof. Santos', room: 'Lab A', weekday: 'SATURDAY', startTime: '08:00', endTime: '11:50', hasConflict: false, status: 'ACTIVE' },
]

const mockTeachers = [
  { id: '1', name: 'Prof. Rodrigues' },
  { id: '2', name: 'Prof. Mendes' },
  { id: '3', name: 'Prof. Ferreira' },
  { id: '4', name: 'Prof. Almeida' },
  { id: '5', name: 'Prof. Costa' },
  { id: '6', name: 'Prof. Lima' },
  { id: '7', name: 'Prof. Santos' },
]

const mockRooms = [
  { id: '1', name: 'Lab A' },
  { id: '2', name: 'Lab B' },
  { id: '3', name: 'Room 101' },
  { id: '4', name: 'Room 102' },
  { id: '5', name: 'Studio 1' },
]

const mockAvailabilityRequests = [
  { id: '1', teacher: 'Prof. Rodrigues', semester: '2024.1', status: 'PENDING', submittedAt: '2024-01-10' },
  { id: '2', teacher: 'Prof. Mendes', semester: '2024.1', status: 'APPROVED', submittedAt: '2024-01-08' },
  { id: '3', teacher: 'Prof. Ferreira', semester: '2024.1', status: 'PENDING', submittedAt: '2024-01-12' },
]

// ---------------------------------------------------------------------------
// Helper
// ---------------------------------------------------------------------------

function getSlotFromTime(time: string): number {
  const [h, m] = time.split(':').map(Number)
  return h * 2 + (m >= 30 ? 1 : 0) - 14 // 07:00 is slot 0
}

function getConflictColor(conflictType?: string): string {
  if (!conflictType) return ''
  if (conflictType === 'ROOM_OVERLAP') return 'border-red-400 bg-red-50 dark:bg-red-950/30'
  if (conflictType === 'TEACHER_OVERLAP') return 'border-orange-400 bg-orange-50 dark:bg-orange-950/30'
  return 'border-yellow-400 bg-yellow-50 dark:bg-yellow-950/30'
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function ScheduleManagementPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('grid')
  const [searchQuery, setSearchQuery] = useState('')
  const [filterTeacher, setFilterTeacher] = useState<string>('all')
  const [filterRoom, setFilterRoom] = useState<string>('all')
  const [filterSemester, setFilterSemester] = useState<string>('2024.1')
  const [isGenerating, setIsGenerating] = useState(false)
  const [isDetecting, setIsDetecting] = useState(false)
  const [showConflicts, setShowConflicts] = useState(false)
  const [dragItem, setDragItem] = useState<string | null>(null)

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1000)
    return () => clearTimeout(timer)
  }, [])

  const filteredItems = useMemo(() => {
    let items = [...mockScheduleItems]
    if (filterTeacher !== 'all') {
      items = items.filter((i) => i.teacher === filterTeacher)
    }
    if (filterRoom !== 'all') {
      items = items.filter((i) => i.room === filterRoom)
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      items = items.filter(
        (i) =>
          i.subject.toLowerCase().includes(q) ||
          i.code.toLowerCase().includes(q) ||
          i.teacher.toLowerCase().includes(q) ||
          i.room.toLowerCase().includes(q)
      )
    }
    if (showConflicts) {
      items = items.filter((i) => i.hasConflict)
    }
    return items
  }, [filterTeacher, filterRoom, searchQuery, showConflicts])

  const conflictCount = mockScheduleItems.filter((i) => i.hasConflict).length

  const handleAutoGenerate = async () => {
    setIsGenerating(true)
    // Simulate AI schedule generation
    await new Promise((r) => setTimeout(r, 3000))
    setIsGenerating(false)
  }

  const handleDetectConflicts = async () => {
    setIsDetecting(true)
    await new Promise((r) => setTimeout(r, 2000))
    setShowConflicts(true)
    setIsDetecting(false)
  }

  const handleDragStart = (id: string) => {
    setDragItem(id)
  }

  const handleDragEnd = () => {
    setDragItem(null)
  }

  // Build grid map: weekday -> list of items
  const gridData = useMemo(() => {
    const map: Record<string, ScheduleItem[]> = {}
    WEEKDAYS.forEach((day) => {
      map[day] = filteredItems.filter((i) => i.weekday === day)
    })
    return map
  }, [filteredItems])

  if (isLoading) {
    return (
      <div className="flex-1 space-y-6 p-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    )
  }

  return (
    <div className="flex-1 space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-violet-700 to-purple-500 bg-clip-text text-transparent">
            Schedule Management
          </h1>
          <p className="text-muted-foreground mt-1">
            Master schedule view and conflict management
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon">
            <Printer className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon">
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Filters & Actions */}
      <Card className="border-violet-200 dark:border-violet-800/50">
        <CardContent className="p-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-col gap-3 md:flex-row md:items-center">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar disciplina, professor, sala..."
                  className="pl-9 w-72"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Select value={filterTeacher} onValueChange={setFilterTeacher}>
                <SelectTrigger className="w-44">
                  <SelectValue placeholder="Filtrar por professor" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Teachers</SelectItem>
                  {mockTeachers.map((t) => (
                    <SelectItem key={t.id} value={t.name}>{t.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={filterRoom} onValueChange={setFilterRoom}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Filtrar por sala" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Rooms</SelectItem>
                  {mockRooms.map((r) => (
                    <SelectItem key={r.id} value={r.name}>{r.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={filterSemester} onValueChange={setFilterSemester}>
                <SelectTrigger className="w-36">
                  <SelectValue placeholder="Semestre" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2024.1">2024.1</SelectItem>
                  <SelectItem value="2024.2">2024.2</SelectItem>
                  <SelectItem value="2023.2">2023.2</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant={showConflicts ? 'destructive' : 'outline'}
                size="sm"
                onClick={() => setShowConflicts(!showConflicts)}
                className="gap-1"
              >
                <AlertTriangle className="h-4 w-4" />
                Conflicts ({conflictCount})
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={handleDetectConflicts}
                disabled={isDetecting}
                className="gap-2 border-violet-300 text-violet-700 hover:bg-violet-50"
              >
                <Sparkles className="h-4 w-4" />
                {isDetecting ? 'Detecting...' : 'AI Detect Conflicts'}
              </Button>
              <Button
                onClick={handleAutoGenerate}
                disabled={isGenerating}
                className="gap-2 bg-violet-600 hover:bg-violet-700"
              >
                <Wand2 className="h-4 w-4" />
                {isGenerating ? 'Generating...' : 'Auto-Generate Schedule'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* View Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="grid" className="gap-2">
            <Layers className="h-4 w-4" />
            Weekly Grid
          </TabsTrigger>
          <TabsTrigger value="list" className="gap-2">
            <Eye className="h-4 w-4" />
            List View
          </TabsTrigger>
          <TabsTrigger value="availability" className="gap-2">
            <Check className="h-4 w-4" />
            Availability
          </TabsTrigger>
        </TabsList>

        {/* Weekly Grid View */}
        <TabsContent value="grid" className="space-y-4 mt-4">
          <div className="border rounded-lg overflow-x-auto border-violet-200 dark:border-violet-800/50">
            <div className="min-w-[1200px]">
              {/* Header Row */}
              <div className="grid grid-cols-[100px_repeat(6,1fr)] bg-violet-50 dark:bg-violet-950/30 border-b">
                <div className="p-3 text-sm font-medium text-muted-foreground border-r flex items-center">
                  <Clock className="h-4 w-4 mr-1" />
                  Time
                </div>
                {WEEKDAYS.map((day) => (
                  <div key={day} className="p-3 text-center text-sm font-semibold text-violet-700 border-r last:border-r-0">
                    {WEEKDAY_LABELS[day]}
                  </div>
                ))}
              </div>

              {/* Time Slot Rows */}
              <div className="divide-y">
                {TIME_SLOTS.filter((_, i) => i % 2 === 0).map((time) => {
                  const slotIndex = getSlotFromTime(time)
                  return (
                    <div key={time} className="grid grid-cols-[100px_repeat(6,1fr)] min-h-[60px]">
                      <div className="p-2 text-xs text-muted-foreground border-r flex items-center justify-center bg-muted/30">
                        {time}
                      </div>
                      {WEEKDAYS.map((day) => {
                        const items = gridData[day]?.filter(
                          (item) => {
                            const itemSlot = getSlotFromTime(item.startTime)
                            const endSlot = getSlotFromTime(item.endTime)
                            return itemSlot <= slotIndex && endSlot > slotIndex
                          }
                        )
                        const itemInSlot = items?.[0]
                        const isStartSlot = itemInSlot && getSlotFromTime(itemInSlot.startTime) === slotIndex

                        return (
                          <div
                            key={`${day}-${time}`}
                            className="border-r last:border-r-0 p-1 relative"
                          >
                            {itemInSlot && isStartSlot && (
                              <div
                                draggable
                                onDragStart={() => handleDragStart(itemInSlot.id)}
                                onDragEnd={handleDragEnd}
                                className={cn(
                                  'absolute inset-1 rounded-md border p-2 cursor-grab active:cursor-grabbing transition-all z-10',
                                  itemInSlot.hasConflict
                                    ? getConflictColor(itemInSlot.conflictType)
                                    : 'border-violet-300 bg-violet-50 dark:bg-violet-950/20 hover:shadow-md',
                                  dragItem === itemInSlot.id && 'opacity-50 scale-95'
                                )}
                                style={{
                                  top: '4px',
                                  bottom: '4px',
                                }}
                              >
                                <div className="flex items-start gap-1">
                                  <GripVertical className="h-3 w-3 text-muted-foreground shrink-0 mt-0.5" />
                                  <div className="flex-1 min-w-0">
                                    <p className="text-xs font-semibold truncate">{itemInSlot.subject}</p>
                                    <p className="text-[10px] text-muted-foreground truncate">{itemInSlot.code}</p>
                                    <div className="flex items-center gap-1 mt-1">
                                      <User className="h-3 w-3" />
                                      <span className="text-[10px] text-muted-foreground truncate">{itemInSlot.teacher}</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <MapPin className="h-3 w-3" />
                                      <span className="text-[10px] text-muted-foreground truncate">{itemInSlot.room}</span>
                                    </div>
                                    <p className="text-[10px] text-muted-foreground mt-0.5">
                                      {itemInSlot.startTime} - {itemInSlot.endTime}
                                    </p>
                                    {itemInSlot.hasConflict && (
                                      <Tooltip>
                                        <TooltipTrigger>
                                          <Badge variant="destructive" className="text-[8px] px-1 py-0 mt-1">
                                            {itemInSlot.conflictType}
                                          </Badge>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                          <p>Room overlap detected. Click to resolve.</p>
                                        </TooltipContent>
                                      </Tooltip>
                                    )}
                                  </div>
                                </div>
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
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 rounded border border-violet-300 bg-violet-50" />
              Normal
            </div>
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 rounded border border-red-400 bg-red-50" />
              Room Conflict
            </div>
            <div className="flex items-center gap-2">
              <GripVertical className="h-4 w-4" />
              Drag to reschedule
            </div>
          </div>
        </TabsContent>

        {/* List View */}
        <TabsContent value="list" className="mt-4">
          <Card className="border-violet-200 dark:border-violet-800/50">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="border-violet-100">
                    <TableHead>Subject</TableHead>
                    <TableHead>Code</TableHead>
                    <TableHead>Teacher</TableHead>
                    <TableHead>Room</TableHead>
                    <TableHead>Day</TableHead>
                    <TableHead>Time</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredItems.map((item) => (
                    <TableRow
                      key={item.id}
                      className={cn(
                        'border-violet-100',
                        item.hasConflict && 'bg-red-50/50 dark:bg-red-950/10'
                      )}
                    >
                      <TableCell className="font-medium">{item.subject}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{item.code}</Badge>
                      </TableCell>
                      <TableCell>{item.teacher}</TableCell>
                      <TableCell>{item.room}</TableCell>
                      <TableCell>{WEEKDAY_LABELS[item.weekday]}</TableCell>
                      <TableCell>{item.startTime} - {item.endTime}</TableCell>
                      <TableCell>
                        {item.hasConflict ? (
                          <Badge variant="destructive" className="gap-1">
                            <AlertTriangle className="h-3 w-3" />
                            {item.conflictType}
                          </Badge>
                        ) : (
                          <Badge variant="default" className="bg-green-100 text-green-700">OK</Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredItems.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                        No schedule items found matching your filters.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Availability Approval */}
        <TabsContent value="availability" className="mt-4 space-y-4">
          <Card className="border-violet-200 dark:border-violet-800/50">
            <CardHeader>
              <CardTitle>Teacher Availability Requests</CardTitle>
              <CardDescription>Review and approve teacher availability for upcoming semesters</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="border-violet-100">
                    <TableHead>Teacher</TableHead>
                    <TableHead>Semester</TableHead>
                    <TableHead>Submitted</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockAvailabilityRequests.map((req) => (
                    <TableRow key={req.id} className="border-violet-100">
                      <TableCell className="font-medium">{req.teacher}</TableCell>
                      <TableCell>{req.semester}</TableCell>
                      <TableCell>{req.submittedAt}</TableCell>
                      <TableCell>
                        <Badge
                          className={
                            req.status === 'PENDING'
                              ? 'bg-yellow-100 text-yellow-700'
                              : 'bg-green-100 text-green-700'
                          }
                        >
                          {req.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {req.status === 'PENDING' && (
                            <>
                              <Button size="sm" className="bg-violet-600 hover:bg-violet-700 gap-1 h-7 text-xs">
                                <Check className="h-3 w-3" /> Approve
                              </Button>
                              <Button size="sm" variant="outline" className="gap-1 h-7 text-xs border-red-300 text-red-600">
                                <X className="h-3 w-3" /> Reject
                              </Button>
                            </>
                          )}
                          {req.status === 'APPROVED' && (
                            <span className="text-xs text-muted-foreground">No actions needed</span>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
