'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import {
  Calendar,
  Save,
  Download,
  Upload,
  Plus,
  Trash2,
  Ban,
  Clock,
  CheckCircle2,
  XCircle,
  Lock,
  AlertTriangle,
} from 'lucide-react'

const WEEKDAYS = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'] as const
const WEEKDAY_LABELS: Record<string, string> = {
  MONDAY: 'Mon',
  TUESDAY: 'Tue',
  WEDNESDAY: 'Wed',
  THURSDAY: 'Thu',
  FRIDAY: 'Fri',
  SATURDAY: 'Sat',
}
const WEEKDAY_FULL: Record<string, string> = {
  MONDAY: 'Monday',
  TUESDAY: 'Tuesday',
  WEDNESDAY: 'Wednesday',
  THURSDAY: 'Thursday',
  FRIDAY: 'Friday',
  SATURDAY: 'Saturday',
}

const TIME_SLOTS = []
for (let hour = 7; hour <= 22; hour++) {
  TIME_SLOTS.push(`${String(hour).padStart(2, '0')}:00`)
}

type SlotStatus = 'available' | 'unavailable' | 'blocked'

interface AvailabilitySlot {
  weekday: string
  startTime: string
  endTime: string
  isAvailable: boolean
}

interface BlockedDate {
  id: string
  startDate: string
  endDate: string
  reason: string
  description: string
  isApproved: boolean
}

interface Semester {
  id: string
  name: string
  code: string
  startDate: string
  endDate: string
  status: string
  isCurrent: boolean
}

export default function ProfessorAvailabilityPage() {
  const { profile } = useAuth()
  const [semesters, setSemesters] = useState<Semester[]>([])
  const [selectedSemester, setSelectedSemester] = useState<string>('')
  const [grid, setGrid] = useState<Record<string, SlotStatus>>({})
  const [blockedDates, setBlockedDates] = useState<BlockedDate[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)

  // Modal state
  const [modalOpen, setModalOpen] = useState(false)
  const [modalSlot, setModalSlot] = useState<{ weekday: string; time: string } | null>(null)
  const [modalStart, setModalStart] = useState('')
  const [modalEnd, setModalEnd] = useState('')

  // Block modal state
  const [blockModalOpen, setBlockModalOpen] = useState(false)
  const [blockStart, setBlockStart] = useState('')
  const [blockEnd, setBlockEnd] = useState('')
  const [blockReason, setBlockReason] = useState('')
  const [blockDescription, setBlockDescription] = useState('')

  const getSlotKey = (weekday: string, time: string) => `${weekday}-${time}`

  const initGrid = useCallback(() => {
    const newGrid: Record<string, SlotStatus> = {}
    for (const weekday of WEEKDAYS) {
      for (const time of TIME_SLOTS) {
        newGrid[getSlotKey(weekday, time)] = 'unavailable'
      }
    }
    return newGrid
  }, [])

  useEffect(() => {
    async function fetchData() {
      try {
        setIsLoading(true)
        setError(null)

        const [semestersRes, availabilityRes, blocksRes] = await Promise.allSettled([
          fetch('/api/schedules?include=semesters'),
          fetch('/api/availability'),
          fetch('/api/availability?blocks=true'),
        ])

        if (semestersRes.status === 'fulfilled' && semestersRes.value.ok) {
          const data = await semestersRes.value.json()
          const semList: Semester[] = data.success && Array.isArray(data.data) ? data.data : [
            { id: '1', name: '2025.1', code: '2025-1', startDate: '2025-02-01', endDate: '2025-06-30', status: 'ACTIVE', isCurrent: true },
            { id: '2', name: '2024.2', code: '2024-2', startDate: '2024-08-01', endDate: '2024-12-20', status: 'COMPLETED', isCurrent: false },
          ]
          setSemesters(semList)
          const current = semList.find((s: Semester) => s.isCurrent)
          setSelectedSemester(current?.id || semList[0]?.id || '')
        }

        const newGrid = initGrid()

        if (availabilityRes.status === 'fulfilled' && availabilityRes.value.ok) {
          const data = await availabilityRes.value.json()
          if (data.success && Array.isArray(data.data)) {
            data.data.forEach((slot: AvailabilitySlot) => {
              const startHour = parseInt(slot.startTime.split(':')[0], 10)
              const endHour = parseInt(slot.endTime.split(':')[0], 10)
              for (let h = startHour; h < endHour; h++) {
                const key = getSlotKey(slot.weekday, `${String(h).padStart(2, '0')}:00`)
                if (key in newGrid) {
                  newGrid[key] = slot.isAvailable ? 'available' : 'unavailable'
                }
              }
            })
          }
        } else {
          // Demo: set Mon-Thu 8-12, 14-18 as available
          const demoDays = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY']
          demoDays.forEach(d => {
            for (let h = 8; h < 12; h++) {
              newGrid[getSlotKey(d, `${String(h).padStart(2, '0')}:00`)] = 'available'
            }
            for (let h = 14; h < 18; h++) {
              newGrid[getSlotKey(d, `${String(h).padStart(2, '0')}:00`)] = 'available'
            }
          })
          // Friday morning
          for (let h = 8; h < 12; h++) {
            newGrid[getSlotKey('FRIDAY', `${String(h).padStart(2, '0')}:00`)] = 'available'
          }
        }

        if (blocksRes.status === 'fulfilled' && blocksRes.value.ok) {
          const data = await blocksRes.value.json()
          if (data.success && Array.isArray(data.data)) {
            setBlockedDates(data.data)
          }
        } else {
          setBlockedDates([
            { id: '1', startDate: '2025-03-15', endDate: '2025-03-22', reason: 'VACATION', description: 'Spring break', isApproved: true },
          ])
        }

        setGrid(newGrid)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load availability')
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [initGrid])

  const handleSlotClick = (weekday: string, time: string) => {
    setModalSlot({ weekday, time })
    setModalStart(time)
    const nextHour = parseInt(time.split(':')[0], 10) + 1
    setModalEnd(`${String(nextHour).padStart(2, '0')}:00`)
    setModalOpen(true)
  }

  const handleModalSave = () => {
    if (!modalSlot) return

    const startH = parseInt(modalStart.split(':')[0], 10)
    const endH = parseInt(modalEnd.split(':')[0], 10)
    if (endH <= startH) return

    setGrid((prev) => {
      const updated = { ...prev }
      const currentStatus = updated[getSlotKey(modalSlot.weekday, modalSlot.time)]
      const newStatus: SlotStatus = currentStatus === 'available' ? 'unavailable' : 'available'
      for (let h = startH; h < endH; h++) {
        const key = getSlotKey(modalSlot.weekday, `${String(h).padStart(2, '0')}:00`)
        if (key in updated) {
          updated[key] = newStatus
        }
      }
      return updated
    })
    setModalOpen(false)
  }

  const handleSave = async () => {
    try {
      setIsSaving(true)
      setSaveSuccess(false)

      const availabilityData: AvailabilitySlot[] = []
      for (const weekday of WEEKDAYS) {
        let rangeStart: string | null = null
        for (let i = 0; i < TIME_SLOTS.length; i++) {
          const key = getSlotKey(weekday, TIME_SLOTS[i])
          if (grid[key] === 'available') {
            if (!rangeStart) rangeStart = TIME_SLOTS[i]
          } else {
            if (rangeStart) {
              const endHour = parseInt(TIME_SLOTS[i].split(':')[0], 10)
              availabilityData.push({
                weekday,
                startTime: rangeStart,
                endTime: `${String(endHour).padStart(2, '0')}:00`,
                isAvailable: true,
              })
              rangeStart = null
            }
          }
        }
        if (rangeStart) {
          const endHour = parseInt(TIME_SLOTS[TIME_SLOTS.length - 1].split(':')[0], 10) + 1
          availabilityData.push({
            weekday,
            startTime: rangeStart,
            endTime: `${String(endHour).padStart(2, '0')}:00`,
            isAvailable: true,
          })
        }
      }

      const res = await fetch('/api/availability', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          semesterId: selectedSemester,
          availability: availabilityData,
        }),
      })

      if (!res.ok) throw new Error('Failed to save availability')
      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save')
    } finally {
      setIsSaving(false)
    }
  }

  const handleAddBlock = async () => {
    if (!blockStart || !blockEnd) return
    try {
      const res = await fetch('/api/availability', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          startDate: blockStart,
          endDate: blockEnd,
          reason: blockReason || 'OTHER',
          description: blockDescription,
        }),
      })
      if (res.ok) {
        const data = await res.json()
        if (data.success && data.data) {
          setBlockedDates((prev) => [...prev, data.data])
        }
      }
      setBlockModalOpen(false)
      setBlockStart('')
      setBlockEnd('')
      setBlockReason('')
      setBlockDescription('')
    } catch {
      setError('Failed to add block date')
    }
  }

  const handleRemoveBlock = async (id: string) => {
    try {
      const res = await fetch(`/api/availability/${id}`, { method: 'DELETE' })
      if (res.ok) {
        setBlockedDates((prev) => prev.filter((b) => b.id !== id))
      }
    } catch {
      setError('Failed to remove block')
    }
  }

  const handleExport = () => {
    const exportData = { semesterId: selectedSemester, grid, blockedDates }
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `availability-${selectedSemester}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleImport = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json'
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return
      const reader = new FileReader()
      reader.onload = (ev) => {
        try {
          const data = JSON.parse(ev.target?.result as string)
          if (data.grid) setGrid(data.grid)
          if (data.blockedDates) setBlockedDates(data.blockedDates)
        } catch {
          setError('Invalid file format')
        }
      }
      reader.readAsText(file)
    }
    input.click()
  }

  const getStatusColor = (status: SlotStatus) => {
    switch (status) {
      case 'available': return 'bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-200 dark:bg-emerald-950/50 dark:border-emerald-800 dark:text-emerald-300 dark:hover:bg-emerald-900/50'
      case 'blocked': return 'bg-red-100 text-red-700 border-red-200 hover:bg-red-200 dark:bg-red-950/50 dark:border-red-800 dark:text-red-300 dark:hover:bg-red-900/50'
      default: return 'bg-gray-100 text-gray-400 border-gray-200 hover:bg-gray-200 dark:bg-gray-900/50 dark:border-gray-800 dark:hover:bg-gray-800/50'
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6 p-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-10 w-64" />
        <div className="space-y-1">
          <Skeleton className="h-8 w-full" />
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Availability</h1>
          <p className="text-muted-foreground mt-1">Manage your weekly schedule and blocked dates</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Select value={selectedSemester} onValueChange={setSelectedSemester}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Select semester" />
            </SelectTrigger>
            <SelectContent>
              {semesters.map((s) => (
                <SelectItem key={s.id} value={s.id}>
                  {s.name} {s.isCurrent && '(Current)'}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" onClick={handleImport}>
            <Upload className="mr-1 size-3.5" /> Import
          </Button>
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="mr-1 size-3.5" /> Export
          </Button>
          <Button
            size="sm"
            onClick={handleSave}
            disabled={isSaving}
            className="bg-violet-600 text-white hover:bg-violet-700"
          >
            {isSaving ? (
              <>Saving...</>
            ) : saveSuccess ? (
              <><CheckCircle2 className="mr-1 size-3.5" /> Saved!</>
            ) : (
              <><Save className="mr-1 size-3.5" /> Save</>
            )}
          </Button>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-300">
          <AlertTriangle className="size-4 shrink-0" />
          {error}
          <Button variant="ghost" size="sm" onClick={() => setError(null)} className="ml-auto">Dismiss</Button>
        </div>
      )}

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-4 text-sm">
        <div className="flex items-center gap-1.5">
          <div className="size-3 rounded-sm bg-emerald-400" />
          <span className="text-muted-foreground">Available</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="size-3 rounded-sm bg-gray-300 dark:bg-gray-700" />
          <span className="text-muted-foreground">Unavailable</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="size-3 rounded-sm bg-red-400" />
          <span className="text-muted-foreground">Blocked</span>
        </div>
        <span className="text-xs text-muted-foreground">Click any cell to toggle availability</span>
      </div>

      {/* Schedule Grid */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <div className="min-w-[900px]">
              {/* Header Row */}
              <div className="sticky top-0 z-10 grid grid-cols-[80px_repeat(6,1fr)] border-b bg-background">
                <div className="border-r p-2 text-xs font-medium text-muted-foreground text-center">
                  <Clock className="mx-auto size-4" />
                </div>
                {WEEKDAYS.map((day) => (
                  <div
                    key={day}
                    className="border-r p-2 text-center text-sm font-semibold text-foreground last:border-r-0"
                  >
                    {WEEKDAY_FULL[day]}
                  </div>
                ))}
              </div>
              {/* Time Rows */}
              {TIME_SLOTS.map((time) => (
                <div
                  key={time}
                  className="grid grid-cols-[80px_repeat(6,1fr)] border-b last:border-b-0"
                >
                  <div className="flex items-center justify-center border-r p-1.5 text-xs text-muted-foreground font-mono">
                    {time}
                  </div>
                  {WEEKDAYS.map((day) => {
                    const key = getSlotKey(day, time)
                    const status = grid[key] || 'unavailable'
                    return (
                      <div
                        key={key}
                        onClick={() => handleSlotClick(day, time)}
                        className={`border-r cursor-pointer border-b transition-all last:border-r-0 ${
                          status === 'available'
                            ? 'bg-emerald-100 hover:bg-emerald-200 dark:bg-emerald-950/40 dark:hover:bg-emerald-900/40'
                            : status === 'blocked'
                              ? 'bg-red-100 hover:bg-red-200 dark:bg-red-950/40 dark:hover:bg-red-900/40'
                              : 'bg-gray-50 hover:bg-gray-100 dark:bg-gray-900/30 dark:hover:bg-gray-800/40'
                        }`}
                        style={{ minHeight: '44px' }}
                      >
                        <div className="flex h-full items-center justify-center">
                          {status === 'available' && (
                            <CheckCircle2 className="size-4 text-emerald-600 dark:text-emerald-400" />
                          )}
                          {status === 'blocked' && (
                            <Lock className="size-4 text-red-600 dark:text-red-400" />
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Blocked Dates */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div>
            <CardTitle className="text-lg font-semibold">Blocked Dates</CardTitle>
            <CardDescription>Vacations, meetings, and other unavailable dates</CardDescription>
          </div>
          <Button
            size="sm"
            variant="outline"
            className="border-violet-200 text-violet-600 hover:bg-violet-50 dark:border-violet-800 dark:hover:bg-violet-950/30"
            onClick={() => setBlockModalOpen(true)}
          >
            <Plus className="mr-1 size-3.5" /> Add Block
          </Button>
        </CardHeader>
        <CardContent>
          {blockedDates.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Ban className="size-8 text-muted-foreground/50" />
              <p className="mt-2 text-sm text-muted-foreground">No blocked dates</p>
              <p className="text-xs text-muted-foreground/70">Click &quot;Add Block&quot; to block dates</p>
            </div>
          ) : (
            <div className="space-y-3">
              {blockedDates.map((block) => (
                <div
                  key={block.id}
                  className="flex items-center justify-between rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-950/30"
                >
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-red-100 p-2 dark:bg-red-900/50">
                      <Ban className="size-4 text-red-600 dark:text-red-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {block.startDate} — {block.endDate}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        <Badge variant="outline" className="mr-2 text-xs">{block.reason}</Badge>
                        {block.description}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {block.isApproved && (
                      <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 text-xs">Approved</Badge>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveBlock(block.id)}
                      className="text-red-600 hover:bg-red-100 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-900/50"
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Slot Edit Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Availability</DialogTitle>
            <DialogDescription>
              Set the time range for {modalSlot ? WEEKDAY_FULL[modalSlot.weekday] : ''}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Start Time</Label>
                <Input
                  type="time"
                  value={modalStart}
                  onChange={(e) => setModalStart(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>End Time</Label>
                <Input
                  type="time"
                  value={modalEnd}
                  onChange={(e) => setModalEnd(e.target.value)}
                />
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Current status:{' '}
              <Badge variant={grid[modalSlot ? getSlotKey(modalSlot.weekday, modalSlot.time) : ''] === 'available' ? 'default' : 'outline'}>
                {grid[modalSlot ? getSlotKey(modalSlot.weekday, modalSlot.time) : ''] === 'available' ? 'Available' : 'Unavailable'}
              </Badge>
              {' '}— clicking save will toggle the status.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button onClick={handleModalSave} className="bg-violet-600 text-white hover:bg-violet-700">
              Apply
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Block Date Modal */}
      <Dialog open={blockModalOpen} onOpenChange={setBlockModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Block Dates</DialogTitle>
            <DialogDescription>Add dates when you will not be available</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Start Date</Label>
                <Input
                  type="date"
                  value={blockStart}
                  onChange={(e) => setBlockStart(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>End Date</Label>
                <Input
                  type="date"
                  value={blockEnd}
                  onChange={(e) => setBlockEnd(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Reason</Label>
              <Select value={blockReason} onValueChange={setBlockReason}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select reason" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="VACATION">Vacation</SelectItem>
                  <SelectItem value="MEETING">Meeting</SelectItem>
                  <SelectItem value="PERSONAL">Personal</SelectItem>
                  <SelectItem value="MEDICAL">Medical</SelectItem>
                  <SelectItem value="OTHER">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Description (optional)</Label>
              <Input
                placeholder="e.g., Annual conference attendance"
                value={blockDescription}
                onChange={(e) => setBlockDescription(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBlockModalOpen(false)}>Cancel</Button>
            <Button onClick={handleAddBlock} className="bg-violet-600 text-white hover:bg-violet-700">
              <Ban className="mr-1 size-3.5" /> Block Dates
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
