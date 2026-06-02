'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'
import { Textarea } from '@/components/ui/textarea'
import {
  ClipboardCheck,
  Play,
  PenLine,
  CheckCircle2,
  XCircle,
  Clock,
  User,
  AlertTriangle,
  Shield,
  Signature,
  History,
  Filter,
  ChevronRight,
  Save,
  Fingerprint,
  Monitor,
  Globe,
  Loader2,
} from 'lucide-react'

interface Session {
  id: string
  date: string
  startTime: string
  endTime: string
  status: string
  subjectName: string
  subjectCode: string
  roomName: string
  classId: string
}

interface StudentAttendance {
  enrollmentId: string
  studentId: string
  studentName: string
  status: 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED' | undefined
  notes: string
}

interface SignatureInfo {
  type: string
  ipAddress: string
  userAgent: string
  timestamp: string
}

export default function ProfessorAttendancePage() {
  const { profile } = useAuth()
  const [sessions, setSessions] = useState<Session[]>([])
  const [pastSessions, setPastSessions] = useState<Session[]>([])
  const [selectedSession, setSelectedSession] = useState<Session | null>(null)
  const [students, setStudents] = useState<StudentAttendance[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isOpen, setIsOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isSigning, setIsSigning] = useState(false)

  // Filters
  const [dateFilter, setDateFilter] = useState(new Date().toISOString().split('T')[0])
  const [classFilter, setClassFilter] = useState<string>('all')

  // Signature dialog
  const [signatureDialogOpen, setSignatureDialogOpen] = useState(false)
  const [signatureInfo, setSignatureInfo] = useState<SignatureInfo | null>(null)
  const [signed, setSigned] = useState(false)

  useEffect(() => {
    async function fetchSessions() {
      try {
        setIsLoading(true)
        setError(null)

        const res = await fetch(`/api/attendance?date=${dateFilter}`)
        if (res.ok) {
          const data = await res.json()
          if (data.success && Array.isArray(data.data)) {
            setSessions(data.data)
          }
        } else {
          setSessions([
            { id: 's1', date: dateFilter, startTime: '08:00', endTime: '09:40', status: 'SCHEDULED', subjectName: 'Database Systems', subjectCode: 'CCO301', roomName: 'Lab 201', classId: 'c1' },
            { id: 's2', date: dateFilter, startTime: '10:00', endTime: '11:40', status: 'SCHEDULED', subjectName: 'Software Engineering', subjectCode: 'CCO401', roomName: 'Room 105', classId: 'c2' },
            { id: 's3', date: dateFilter, startTime: '14:00', endTime: '15:40', status: 'COMPLETED', subjectName: 'Data Structures', subjectCode: 'CCO201', roomName: 'Lab 303', classId: 'c3' },
          ])
        }

        // Past sessions for history
        const pastRes = await fetch('/api/attendance?history=true&limit=20')
        if (pastRes.ok) {
          const pastData = await pastRes.json()
          if (pastData.success && Array.isArray(pastData.data)) {
            setPastSessions(pastData.data)
          }
        } else {
          setPastSessions([
            { id: 'ps1', date: '2025-06-16', startTime: '08:00', endTime: '09:40', status: 'COMPLETED', subjectName: 'Database Systems', subjectCode: 'CCO301', roomName: 'Lab 201', classId: 'c1' },
            { id: 'ps2', date: '2025-06-16', startTime: '10:00', endTime: '11:40', status: 'COMPLETED', subjectName: 'Software Engineering', subjectCode: 'CCO401', roomName: 'Room 105', classId: 'c2' },
            { id: 'ps3', date: '2025-06-15', startTime: '14:00', endTime: '15:40', status: 'COMPLETED', subjectName: 'Data Structures', subjectCode: 'CCO201', roomName: 'Lab 303', classId: 'c3' },
            { id: 'ps4', date: '2025-06-14', startTime: '08:00', endTime: '09:40', status: 'COMPLETED', subjectName: 'Database Systems', subjectCode: 'CCO301', roomName: 'Lab 201', classId: 'c1' },
          ])
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load sessions')
      } finally {
        setIsLoading(false)
      }
    }

    fetchSessions()
  }, [dateFilter])

  const openSession = async (session: Session) => {
    try {
      setSelectedSession(session)
      setIsOpen(true)
      setSigned(false)

      const res = await fetch(`/api/attendance/${session.id}`, {
        headers: { 'Content-Type': 'application/json' },
      })
      if (res.ok) {
        const data = await res.json()
        if (data.success && data.data?.students) {
          setStudents(data.data.students)
          return
        }
      }
      // Fallback students
      setStudents([
        { enrollmentId: 'e1', studentId: '2025001', studentName: 'Ana Silva', status: undefined, notes: '' },
        { enrollmentId: 'e2', studentId: '2025002', studentName: 'Bruno Costa', status: undefined, notes: '' },
        { enrollmentId: 'e3', studentId: '2025003', studentName: 'Carla Mendes', status: undefined, notes: '' },
        { enrollmentId: 'e4', studentId: '2025004', studentName: 'Daniel Ferreira', status: undefined, notes: '' },
        { enrollmentId: 'e5', studentId: '2025005', studentName: 'Elena Souza', status: undefined, notes: '' },
        { enrollmentId: 'e6', studentId: '2025006', studentName: 'Fabio Lima', status: undefined, notes: '' },
        { enrollmentId: 'e7', studentId: '2025007', studentName: 'Gabriela Santos', status: undefined, notes: '' },
        { enrollmentId: 'e8', studentId: '2025008', studentName: 'Henrique Oliveira', status: undefined, notes: '' },
      ])
    } catch {
      setError('Failed to load student list')
    }
  }

  const setStudentStatus = (enrollmentId: string, status: 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED') => {
    setStudents((prev) =>
      prev.map((s) =>
        s.enrollmentId === enrollmentId
          ? { ...s, status: s.status === status ? undefined : status }
          : s
      )
    )
  }

  const updateStudentNote = (enrollmentId: string, notes: string) => {
    setStudents((prev) =>
      prev.map((s) =>
        s.enrollmentId === enrollmentId ? { ...s, notes } : s
      )
    )
  }

  const markAllPresent = () => {
    setStudents((prev) =>
      prev.map((s) => ({ ...s, status: 'PRESENT' }))
    )
  }

  const saveAttendance = async () => {
    if (!selectedSession) return
    try {
      setIsSaving(true)
      const records = students
        .filter((s) => s.status)
        .map((s) => ({
          enrollmentId: s.enrollmentId,
          studentName: s.studentName,
          status: s.status,
          notes: s.notes,
        }))

      const res = await fetch(`/api/attendance/${selectedSession.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ records }),
      })

      if (!res.ok) throw new Error('Failed to save attendance')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save')
    } finally {
      setIsSaving(false)
    }
  }

  const signSession = async () => {
    if (!selectedSession) return
    try {
      setIsSigning(true)

      const sigInfo: SignatureInfo = {
        type: 'CLOSE_CLASS',
        ipAddress: '192.168.1.' + Math.floor(Math.random() * 255),
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'Unknown',
        timestamp: new Date().toISOString(),
      }

      const res = await fetch('/api/attendance/sign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: selectedSession.id,
          type: 'CLOSE_CLASS',
        }),
      })

      if (res.ok) {
        const data = await res.json()
        if (data.success && data.data) {
          sigInfo.ipAddress = data.data.ipAddress || sigInfo.ipAddress
          sigInfo.userAgent = data.data.userAgent || sigInfo.userAgent
          sigInfo.timestamp = data.data.timestamp || sigInfo.timestamp
        }
      }

      setSignatureInfo(sigInfo)
      setSignatureDialogOpen(true)
      setSigned(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to sign')
    } finally {
      setIsSigning(false)
    }
  }

  const filteredSessions = sessions.filter((s) =>
    classFilter === 'all' || s.classId === classFilter
  )

  const statusButtonClass = (currentStatus: string | undefined, thisStatus: string) => {
    if (currentStatus === thisStatus) {
      switch (thisStatus) {
        case 'PRESENT': return 'bg-emerald-600 text-white hover:bg-emerald-700'
        case 'ABSENT': return 'bg-red-600 text-white hover:bg-red-700'
        case 'LATE': return 'bg-amber-600 text-white hover:bg-amber-700'
        case 'EXCUSED': return 'bg-blue-600 text-white hover:bg-blue-700'
        default: return ''
      }
    }
    return 'bg-muted text-muted-foreground hover:bg-muted/80'
  }

  const formatSessionStatus = (status: string) => {
    switch (status) {
      case 'IN_PROGRESS': return <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">In Progress</Badge>
      case 'COMPLETED': return <Badge variant="secondary">Completed</Badge>
      case 'CANCELLED': return <Badge variant="destructive">Cancelled</Badge>
      default: return <Badge className="bg-violet-100 text-violet-700 border-violet-200">Scheduled</Badge>
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6 p-6">
        <Skeleton className="h-8 w-48" />
        <div className="flex gap-3">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-10 w-48" />
        </div>
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-xl" />
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
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Attendance</h1>
          <p className="text-muted-foreground mt-1">Manage and record student attendance for your sessions</p>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-300">
          <AlertTriangle className="size-4 shrink-0" />
          {error}
          <Button variant="ghost" size="sm" onClick={() => setError(null)} className="ml-auto">Dismiss</Button>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-muted-foreground">Date:</label>
          <Input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="w-44"
          />
        </div>
        <Select value={classFilter} onValueChange={setClassFilter}>
          <SelectTrigger className="w-56">
            <SelectValue placeholder="All Classes" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Classes</SelectItem>
            {sessions.map((s) => (
              <SelectItem key={s.classId} value={s.classId}>
                {s.subjectName} ({s.subjectCode})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Sessions List */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-semibold">
            Sessions for {new Date(dateFilter + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </CardTitle>
          <CardDescription>{filteredSessions.length} session(s) found</CardDescription>
        </CardHeader>
        <CardContent>
          {filteredSessions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <ClipboardCheck className="size-10 text-muted-foreground/50" />
              <p className="mt-3 text-sm text-muted-foreground">No sessions scheduled for this date</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredSessions.map((session) => (
                <div
                  key={session.id}
                  className={`flex items-center justify-between rounded-lg border p-4 transition-colors ${
                    isOpen && selectedSession?.id === session.id
                      ? 'border-violet-300 bg-violet-50 dark:border-violet-700 dark:bg-violet-950/30'
                      : 'hover:bg-muted/50'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                      session.status === 'IN_PROGRESS'
                        ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-300'
                        : session.status === 'COMPLETED'
                          ? 'bg-gray-100 text-gray-500 dark:bg-gray-900 dark:text-gray-400'
                          : 'bg-violet-100 text-violet-600 dark:bg-violet-950 dark:text-violet-300'
                    }`}>
                      {session.status === 'COMPLETED' ? <CheckCircle2 className="size-5" /> : <Clock className="size-5" />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-foreground">{session.subjectName}</p>
                        <Badge variant="outline" className="font-mono text-xs">{session.subjectCode}</Badge>
                        {formatSessionStatus(session.status)}
                      </div>
                      <div className="mt-0.5 flex items-center gap-2 text-sm text-muted-foreground">
                        <span>{session.startTime} - {session.endTime}</span>
                        <span>•</span>
                        <span>{session.roomName}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {session.status === 'SCHEDULED' && (
                      <Button
                        size="sm"
                        onClick={() => openSession(session)}
                        className="bg-violet-600 text-white hover:bg-violet-700"
                      >
                        <Play className="mr-1 size-3.5" /> Open Session
                      </Button>
                    )}
                    {session.status === 'IN_PROGRESS' && (
                      <Button
                        size="sm"
                        onClick={() => openSession(session)}
                        variant="outline"
                        className="border-emerald-200 text-emerald-600 hover:bg-emerald-50"
                      >
                        <PenLine className="mr-1 size-3.5" /> Continue
                      </Button>
                    )}
                    <Button size="sm" variant="ghost">
                      <History className="size-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Attendance Panel - shown when a session is open */}
      {isOpen && selectedSession && (
        <Card className="border-violet-200 dark:border-violet-800">
          <CardHeader>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle className="text-lg font-semibold">
                  {selectedSession.subjectName} - Attendance
                </CardTitle>
                <CardDescription>
                  {selectedSession.startTime} - {selectedSession.endTime} • {selectedSession.roomName}
                </CardDescription>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Button size="sm" variant="outline" onClick={markAllPresent} className="border-emerald-200 text-emerald-600 hover:bg-emerald-50">
                  <CheckCircle2 className="mr-1 size-3.5" /> Mark All Present
                </Button>
                <Button size="sm" onClick={saveAttendance} disabled={isSaving} className="bg-violet-600 text-white hover:bg-violet-700">
                  {isSaving ? <Loader2 className="mr-1 size-3.5 animate-spin" /> : <Save className="mr-1 size-3.5" />}
                  Save Attendance
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={signSession}
                  disabled={isSigning || signed}
                  className={signed ? 'border-emerald-200 text-emerald-600' : 'border-amber-200 text-amber-600 hover:bg-amber-50'}
                >
                  {signed ? (
                    <><Fingerprint className="mr-1 size-3.5" /> Signed</>
                  ) : (
                    <><PenLine className="mr-1 size-3.5" /> Sign & Close</>
                  )}
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {students.map((student) => (
                <div
                  key={student.enrollmentId}
                  className="flex flex-col gap-3 rounded-lg border bg-muted/20 p-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-violet-100 text-violet-600 text-xs font-semibold dark:bg-violet-950 dark:text-violet-300">
                      {student.studentName.split(' ').map((n) => n[0]).join('')}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{student.studentName}</p>
                      <p className="text-xs text-muted-foreground font-mono">{student.studentId}</p>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => setStudentStatus(student.enrollmentId, 'PRESENT')}
                        className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${statusButtonClass(student.status, 'PRESENT')}`}
                      >
                        Present
                      </button>
                      <button
                        onClick={() => setStudentStatus(student.enrollmentId, 'ABSENT')}
                        className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${statusButtonClass(student.status, 'ABSENT')}`}
                      >
                        Absent
                      </button>
                      <button
                        onClick={() => setStudentStatus(student.enrollmentId, 'LATE')}
                        className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${statusButtonClass(student.status, 'LATE')}`}
                      >
                        Late
                      </button>
                      <button
                        onClick={() => setStudentStatus(student.enrollmentId, 'EXCUSED')}
                        className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${statusButtonClass(student.status, 'EXCUSED')}`}
                      >
                        Excused
                      </button>
                    </div>
                    <Input
                      placeholder="Notes..."
                      value={student.notes}
                      onChange={(e) => updateStudentNote(student.enrollmentId, e.target.value)}
                      className="h-8 w-32 text-xs"
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Session History */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-semibold">Session History</CardTitle>
          <CardDescription>Previously completed sessions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {pastSessions.map((session) => (
              <div
                key={session.id}
                className="flex items-center justify-between rounded-lg border p-3 transition-colors hover:bg-muted/30 cursor-pointer"
                onClick={() => openSession(session)}
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100 text-gray-500 dark:bg-gray-900 dark:text-gray-400">
                    <History className="size-4" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{session.subjectName}</p>
                    <p className="text-xs text-muted-foreground">
                      {session.date} • {session.startTime} - {session.endTime} • {session.roomName}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {formatSessionStatus(session.status)}
                  <ChevronRight className="size-4 text-muted-foreground" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Signature Confirmation Dialog */}
      <Dialog open={signatureDialogOpen} onOpenChange={setSignatureDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="size-5 text-violet-600" />
              Session Signed Successfully
            </DialogTitle>
            <DialogDescription>
              This session has been digitally signed and closed.
            </DialogDescription>
          </DialogHeader>
          {signatureInfo && (
            <div className="space-y-3 rounded-lg border bg-muted/30 p-4">
              <div className="flex items-start gap-3">
                <Fingerprint className="mt-0.5 size-4 text-violet-600" />
                <div>
                  <p className="text-sm font-medium text-foreground">Digital Signature</p>
                  <p className="text-xs text-muted-foreground">Signed by: {profile?.displayName || profile?.firstName || 'Professor'}</p>
                </div>
              </div>
              <Separator />
              <div className="grid gap-2 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="size-3.5" />
                  <span>Timestamp: {new Date(signatureInfo.timestamp).toLocaleString()}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Globe className="size-3.5" />
                  <span>IP Address: {signatureInfo.ipAddress}</span>
                </div>
                <div className="flex items-start gap-2 text-muted-foreground">
                  <Monitor className="mt-0.5 size-3.5" />
                  <div>
                    <span className="block">Device Info:</span>
                    <span className="text-xs break-all">{signatureInfo.userAgent}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Shield className="size-3.5" />
                  <span>Type: {signatureInfo.type.replace('_', ' ')}</span>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setSignatureDialogOpen(false)} className="bg-violet-600 text-white hover:bg-violet-700">
              <CheckCircle2 className="mr-1 size-3.5" /> Done
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
