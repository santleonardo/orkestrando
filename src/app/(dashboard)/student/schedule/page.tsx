'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  GraduationCap,
  AlertTriangle,
  Filter,
} from 'lucide-react'

interface ScheduleEntry {
  id: string
  subjectId: string
  subjectName: string
  subjectCode: string
  teacherName: string
  roomName: string
  weekday: string
  startTime: string
  endTime: string
  color: string
}

interface Semester {
  id: string
  name: string
  isCurrent: boolean
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
const WEEKDAY_SHORT: Record<string, string> = {
  MONDAY: 'Mon',
  TUESDAY: 'Tue',
  WEDNESDAY: 'Wed',
  THURSDAY: 'Thu',
  FRIDAY: 'Fri',
  SATURDAY: 'Sat',
}

const TIME_SLOTS: string[] = []
for (let hour = 7; hour <= 22; hour++) {
  TIME_SLOTS.push(`${String(hour).padStart(2, '0')}:00`)
}

const SUBJECT_COLORS = [
  'bg-violet-100 border-violet-300 text-violet-800 dark:bg-violet-950/50 dark:border-violet-700 dark:text-violet-200',
  'bg-blue-100 border-blue-300 text-blue-800 dark:bg-blue-950/50 dark:border-blue-700 dark:text-blue-200',
  'bg-emerald-100 border-emerald-300 text-emerald-800 dark:bg-emerald-950/50 dark:border-emerald-700 dark:text-emerald-200',
  'bg-amber-100 border-amber-300 text-amber-800 dark:bg-amber-950/50 dark:border-amber-700 dark:text-amber-200',
  'bg-pink-100 border-pink-300 text-pink-800 dark:bg-pink-950/50 dark:border-pink-700 dark:text-pink-200',
  'bg-cyan-100 border-cyan-300 text-cyan-800 dark:bg-cyan-950/50 dark:border-cyan-700 dark:text-cyan-200',
  'bg-orange-100 border-orange-300 text-orange-800 dark:bg-orange-950/50 dark:border-orange-700 dark:text-orange-200',
  'bg-rose-100 border-rose-300 text-rose-800 dark:bg-rose-950/50 dark:border-rose-700 dark:text-rose-200',
]

export default function StudentSchedulePage() {
  const { user: profile } = useAuth()
  const [schedule, setSchedule] = useState<ScheduleEntry[]>([])
  const [semesters, setSemesters] = useState<Semester[]>([])
  const [selectedSemester, setSelectedSemester] = useState<string>('')
  const [selectedDay, setSelectedDay] = useState<string>('')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const today = new Date().getDay()
  const todayWeekday = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'][today]

  useEffect(() => {
    async function fetchData() {
      try {
        setIsLoading(true)
        setError(null)

        const [scheduleRes, semestersRes] = await Promise.allSettled([
          fetch('/api/students/me/schedule'),
          fetch('/api/schedules?include=semesters'),
        ])

        if (semestersRes.status === 'fulfilled' && semestersRes.value.ok) {
          const data = await semestersRes.value.json()
          const semList: Semester[] = data.success && Array.isArray(data.data) ? data.data : [
            { id: '1', name: '2025.1', isCurrent: true },
            { id: '2', name: '2024.2', isCurrent: false },
          ]
          setSemesters(semList)
          const current = semList.find((s) => s.isCurrent)
          setSelectedSemester(current?.id || semList[0]?.id || '')
        }

        if (scheduleRes.status === 'fulfilled' && scheduleRes.value.ok) {
          const data = await scheduleRes.value.json()
          if (data.success && Array.isArray(data.data)) {
            const colorMap: Record<string, string> = {}
            let colorIdx = 0
            const entries = data.data.map((s: ScheduleEntry) => {
              if (!colorMap[s.subjectCode]) {
                colorMap[s.subjectCode] = SUBJECT_COLORS[colorIdx % SUBJECT_COLORS.length]
                colorIdx++
              }
              return { ...s, color: colorMap[s.subjectCode] }
            })
            setSchedule(entries)
            return
          }
        }

        // Demo schedule data
        const demoColorMap: Record<string, string> = {
          CCO301: SUBJECT_COLORS[0],
          CCO401: SUBJECT_COLORS[1],
          CCO201: SUBJECT_COLORS[2],
          CCO501: SUBJECT_COLORS[3],
        }
        setSchedule([
          { id: '1', subjectId: 's1', subjectName: 'Database Systems', subjectCode: 'CCO301', teacherName: 'Prof. Silva', roomName: 'Lab 201', weekday: 'MONDAY', startTime: '08:00', endTime: '09:40', color: demoColorMap['CCO301'] },
          { id: '2', subjectId: 's2', subjectName: 'Software Engineering', subjectCode: 'CCO401', teacherName: 'Prof. Mendes', roomName: 'Room 105', weekday: 'MONDAY', startTime: '10:00', endTime: '11:40', color: demoColorMap['CCO401'] },
          { id: '3', subjectId: 's3', subjectName: 'Data Structures', subjectCode: 'CCO201', teacherName: 'Prof. Costa', roomName: 'Lab 303', weekday: 'TUESDAY', startTime: '08:00', endTime: '09:40', color: demoColorMap['CCO201'] },
          { id: '4', subjectId: 's4', subjectName: 'Computer Networks', subjectCode: 'CCO501', teacherName: 'Prof. Lima', roomName: 'Room 202', weekday: 'TUESDAY', startTime: '14:00', endTime: '15:40', color: demoColorMap['CCO501'] },
          { id: '5', subjectId: 's1', subjectName: 'Database Systems', subjectCode: 'CCO301', teacherName: 'Prof. Silva', roomName: 'Lab 201', weekday: 'WEDNESDAY', startTime: '08:00', endTime: '09:40', color: demoColorMap['CCO301'] },
          { id: '6', subjectId: 's2', subjectName: 'Software Engineering', subjectCode: 'CCO401', teacherName: 'Prof. Mendes', roomName: 'Room 105', weekday: 'WEDNESDAY', startTime: '10:00', endTime: '11:40', color: demoColorMap['CCO401'] },
          { id: '7', subjectId: 's3', subjectName: 'Data Structures', subjectCode: 'CCO201', teacherName: 'Prof. Costa', roomName: 'Lab 303', weekday: 'THURSDAY', startTime: '14:00', endTime: '15:40', color: demoColorMap['CCO201'] },
          { id: '8', subjectId: 's4', subjectName: 'Computer Networks', subjectCode: 'CCO501', teacherName: 'Prof. Lima', roomName: 'Room 202', weekday: 'FRIDAY', startTime: '08:00', endTime: '09:40', color: demoColorMap['CCO501'] },
          { id: '9', subjectId: 's1', subjectName: 'Database Systems', subjectCode: 'CCO301', teacherName: 'Prof. Silva', roomName: 'Lab 201', weekday: 'FRIDAY', startTime: '10:00', endTime: '11:40', color: demoColorMap['CCO301'] },
        ])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load schedule')
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  const filteredSchedule = selectedDay
    ? schedule.filter((s) => s.weekday === selectedDay)
    : schedule

  const getEntryForSlot = (weekday: string, time: string): ScheduleEntry | null => {
    return schedule.find((entry) => {
      if (entry.weekday !== weekday) return false
      const startH = parseInt(entry.startTime.split(':')[0], 10)
      const endH = parseInt(entry.endTime.split(':')[0], 10)
      const slotH = parseInt(time.split(':')[0], 10)
      return slotH >= startH && slotH < endH
    }) || null
  }

  const getSpanForEntry = (entry: ScheduleEntry): number => {
    const startH = parseInt(entry.startTime.split(':')[0], 10)
    const endH = parseInt(entry.endTime.split(':')[0], 10)
    return endH - startH
  }

  const getUniqueSubjects = () => {
    const map = new Map<string, { code: string; name: string; color: string }>()
    schedule.forEach((s) => {
      if (!map.has(s.subjectCode)) {
        map.set(s.subjectCode, { code: s.subjectCode, name: s.subjectName, color: s.color })
      }
    })
    return Array.from(map.values())
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
          <h1 className="text-2xl font-bold tracking-tight text-foreground">My Schedule</h1>
          <p className="text-muted-foreground mt-1">View your weekly class timetable</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={selectedDay || 'all'} onValueChange={(v) => setSelectedDay(v === 'all' ? '' : v)}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Todos os dias" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Days</SelectItem>
              {WEEKDAYS.map((day) => (
                <SelectItem key={day} value={day}>
                  {WEEKDAY_LABELS[day]} {day === todayWeekday ? '(Today)' : ''}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={selectedSemester} onValueChange={setSelectedSemester}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Semestre" />
            </SelectTrigger>
            <SelectContent>
              {semesters.map((s) => (
                <SelectItem key={s.id} value={s.id}>
                  {s.name} {s.isCurrent ? '(Current)' : ''}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-300">
          <AlertTriangle className="size-4 shrink-0" />
          {error}
        </div>
      )}

      {/* Subject Legend */}
      <div className="flex flex-wrap items-center gap-3">
        {getUniqueSubjects().map((subject) => (
          <div key={subject.code} className="flex items-center gap-1.5 text-sm">
            <div className={`size-3 rounded-sm border ${subject.color}`} />
            <span className="text-muted-foreground">{subject.code} - {subject.name}</span>
          </div>
        ))}
      </div>

      {/* Day Filter View */}
      {selectedDay && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-semibold">{WEEKDAY_LABELS[selectedDay]}&apos;s Classes</CardTitle>
            <CardDescription>{filteredSchedule.length} classes scheduled</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {filteredSchedule.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <GraduationCap className="size-10 text-muted-foreground/50" />
                  <p className="mt-3 text-sm text-muted-foreground">No classes on {WEEKDAY_LABELS[selectedDay]}</p>
                </div>
              ) : (
                filteredSchedule.map((entry) => (
                  <div key={entry.id} className={`rounded-lg border p-4 ${entry.color}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="text-center">
                          <p className="text-lg font-bold">{entry.startTime}</p>
                          <p className="text-xs opacity-70">{entry.endTime}</p>
                        </div>
                        <div className="h-10 w-px bg-current opacity-20" />
                        <div>
                          <p className="font-semibold">{entry.subjectName}</p>
                          <div className="flex flex-wrap items-center gap-2 text-sm opacity-80 mt-0.5">
                            <span className="flex items-center gap-1"><Users className="size-3.5" /> {entry.teacherName}</span>
                            <span>•</span>
                            <span className="flex items-center gap-1"><MapPin className="size-3.5" /> {entry.roomName}</span>
                          </div>
                        </div>
                      </div>
                      <Badge variant="outline" className="font-mono text-xs">{entry.subjectCode}</Badge>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Full Week Grid */}
      {!selectedDay && (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <div className="min-w-[900px]">
                {/* Header Row */}
                <div className="sticky top-0 z-10 grid grid-cols-[80px_repeat(6,1fr)] border-b bg-background">
                  <div className="border-r p-2 text-center text-xs font-medium text-muted-foreground">
                    <Clock className="mx-auto size-4" />
                  </div>
                  {WEEKDAYS.map((day) => (
                    <div
                      key={day}
                      className={`border-r p-2 text-center last:border-r-0 ${
                        day === todayWeekday
                          ? 'bg-violet-50 dark:bg-violet-950/30'
                          : ''
                      }`}
                    >
                      <p className={`text-sm font-semibold ${day === todayWeekday ? 'text-violet-600' : 'text-foreground'}`}>
                        {WEEKDAY_SHORT[day]}
                      </p>
                      {day === todayWeekday && (
                        <p className="text-[10px] text-violet-500 font-medium">Today</p>
                      )}
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
                      const entry = getEntryForSlot(day, time)
                      const startH = parseInt(time.split(':')[0], 10)
                      const entryStartH = entry ? parseInt(entry.startTime.split(':')[0], 10) : -1

                      // Only render if this is the start of the entry
                      if (entry && entryStartH === startH) {
                        const span = getSpanForEntry(entry)
                        return (
                          <div
                            key={`${day}-${time}`}
                            className={`border-r p-1.5 last:border-r-0 ${entry.color}`}
                            style={{
                              gridRow: `span ${span}`,
                              minHeight: `${span * 44}px`,
                            }}
                          >
                            <div className="flex h-full flex-col justify-between">
                              <div>
                                <p className="text-xs font-bold leading-tight">{entry.subjectCode}</p>
                                <p className="text-xs font-medium leading-tight truncate">{entry.subjectName}</p>
                              </div>
                              <div className="space-y-0.5 mt-1">
                                <p className="flex items-center gap-0.5 text-[10px] opacity-80">
                                  <Users className="size-2.5" /> {entry.teacherName}
                                </p>
                                <p className="flex items-center gap-0.5 text-[10px] opacity-80">
                                  <MapPin className="size-2.5" /> {entry.roomName}
                                </p>
                                <p className="text-[10px] opacity-70">{entry.startTime}-{entry.endTime}</p>
                              </div>
                            </div>
                          </div>
                        )
                      }

                      if (!entry) {
                        return (
                          <div
                            key={`${day}-${time}`}
                            className="border-r last:border-r-0 hover:bg-muted/30 transition-colors"
                            style={{ minHeight: '44px' }}
                          />
                        )
                      }

                      // Skip if it's not the start (entry spans multiple rows)
                      return null
                    })}
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
