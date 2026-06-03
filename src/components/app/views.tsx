'use client'

import React, { useState, useEffect } from 'react'
import { useStore } from '@/lib/store'
import { useToast } from '@/hooks/use-toast'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { formatDate, getInitials, getAttendanceColor, EmptyState } from './helpers'
import {
  ClipboardCheck, FolderOpen, BarChart3, FileText, MessageSquare,
  CheckCircle2, XCircle, Clock, AlertCircle, Plus, ChevronDown, Trash2, Download, Upload, Send,
} from 'lucide-react'

/* ─── Attendance ─── */

export function AttendanceView() {
  const { user, classes, attendance, enrollments, fetchClasses, fetchAttendance, fetchEnrollments, recordAttendance } = useStore()
  const [selectedClass, setSelectedClass] = useState('')
  const [statuses, setStatuses] = useState<Record<string, string>>({})
  const { toast } = useToast()

  useEffect(() => { Promise.all([fetchClasses(), fetchAttendance(), fetchEnrollments()]) }, [])

  const classEnrollments = enrollments.filter(e => e.classId === selectedClass)
  const classAttendance = attendance.filter(a => classEnrollments.some(e => e.id === a.enrollmentId))
  const attendanceRate = classAttendance.length > 0
    ? Math.round((classAttendance.filter(a => a.status === 'PRESENT').length / classAttendance.length) * 100) : 0

  const handleRecord = async () => {
    if (!selectedClass) return
    try {
      const records = classEnrollments.map(e => ({
        enrollmentId: e.id, status: statuses[e.id] || 'PRESENT',
        recordedBy: user?.id || '', date: new Date().toISOString(),
      }))
      await recordAttendance(records)
      toast({ title: 'Attendance recorded', description: `${records.length} records saved.` })
      setStatuses({})
    } catch { toast({ title: 'Error', variant: 'destructive' }) }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold">Attendance</h2>
        <p className="text-sm text-muted-foreground">Record and view attendance for your classes</p>
      </div>

      {user?.role === 'COORDINATOR' && (
        <div className="space-y-2">
          <Label>Select Class</Label>
          <Select value={selectedClass} onValueChange={v => { setSelectedClass(v); setStatuses({}) }}>
            <SelectTrigger className="w-full sm:w-80"><SelectValue placeholder="Choose a class..." /></SelectTrigger>
            <SelectContent>
              {classes.map(c => <SelectItem key={c.id} value={c.id}>{c.code} - {c.subject?.name || ''} ({c.weekday})</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      )}

      {selectedClass && user?.role === 'COORDINATOR' && (
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base">Record Attendance</CardTitle>
              <CardDescription>Mark attendance for {classEnrollments.length} students</CardDescription>
            </div>
            <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={handleRecord}>
              <CheckCircle2 className="h-4 w-4 mr-2" /> Save
            </Button>
          </CardHeader>
          <CardContent>
            {classEnrollments.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">No students enrolled.</p>
            ) : (
              <Table>
                <TableHeader><TableRow><TableHead>Student</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
                <TableBody>
                  {classEnrollments.map(e => (
                    <TableRow key={e.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8"><AvatarFallback className="bg-amber-100 text-amber-700 text-xs">{getInitials(e.student?.displayName || 'S')}</AvatarFallback></Avatar>
                          <span className="text-sm font-medium">{e.student?.displayName}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Select value={statuses[e.id] || 'PRESENT'} onValueChange={v => setStatuses({ ...statuses, [e.id]: v })}>
                          <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="PRESENT"><span className="flex items-center gap-1"><CheckCircle2 className="h-3 w-3 text-emerald-600" /> Present</span></SelectItem>
                            <SelectItem value="ABSENT"><span className="flex items-center gap-1"><XCircle className="h-3 w-3 text-red-600" /> Absent</span></SelectItem>
                            <SelectItem value="LATE"><span className="flex items-center gap-1"><Clock className="h-3 w-3 text-amber-600" /> Late</span></SelectItem>
                            <SelectItem value="EXCUSED"><span className="flex items-center gap-1"><AlertCircle className="h-3 w-3 text-blue-600" /> Excused</span></SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      )}

      {/* History */}
      <Card className="shadow-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div><CardTitle className="text-base">Attendance Records</CardTitle><CardDescription>{attendance.length} total</CardDescription></div>
            {attendance.length > 0 && <Badge className="bg-emerald-100 text-emerald-700">{attendanceRate}%</Badge>}
          </div>
        </CardHeader>
        <CardContent>
          {attendance.length === 0 ? (
            <EmptyState icon={ClipboardCheck} title="No records" desc="Records will appear here once recorded." />
          ) : (
            <ScrollArea className="max-h-96">
              <Table>
                <TableHeader><TableRow><TableHead>Date</TableHead><TableHead>Student</TableHead><TableHead>Subject</TableHead><TableHead>Status</TableHead><TableHead>By</TableHead></TableRow></TableHeader>
                <TableBody>
                  {attendance.slice(0, 50).map(a => (
                    <TableRow key={a.id}>
                      <TableCell className="text-sm">{formatDate(a.date)}</TableCell>
                      <TableCell className="text-sm">{a.enrollment?.student?.displayName || '-'}</TableCell>
                      <TableCell className="text-sm">{a.enrollment?.class?.subject?.name || '-'}</TableCell>
                      <TableCell><Badge className={getAttendanceColor(a.status)} variant="outline">{a.status}</Badge></TableCell>
                      <TableCell className="text-sm text-muted-foreground">{a.recorder?.displayName || '-'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

/* ─── Materials ─── */

export function MaterialsView() {
  const { materials, classes, user, fetchMaterials, fetchClasses, createMaterial, deleteMaterial } = useStore()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [form, setForm] = useState({ title: '', type: 'PDF', classId: '', fileName: '', fileSize: '0', mimeType: 'application/pdf' })
  const { toast } = useToast()

  useEffect(() => { Promise.all([fetchMaterials(), fetchClasses()]) }, [])

  const handleCreate = async () => {
    try {
      await createMaterial({ ...form, uploadedBy: user?.id || '', fileSize: parseInt(form.fileSize) })
      toast({ title: 'Material uploaded' }); setDialogOpen(false)
    } catch { toast({ title: 'Error', variant: 'destructive' }) }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div><h2 className="text-xl font-bold">Materials</h2><p className="text-sm text-muted-foreground">{materials.length} total</p></div>
        {user?.role !== 'STUDENT' && (
          <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={() => setDialogOpen(true)}>
            <Upload className="h-4 w-4 mr-2" /> Upload
          </Button>
        )}
      </div>

      {materials.length === 0 ? (
        <Card className="shadow-sm"><CardContent><EmptyState icon={FolderOpen} title="No materials" desc="Upload your first material." /></CardContent></Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {materials.map(m => (
            <Card key={m.id} className="shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-emerald-50 mt-0.5"><FileText className="h-5 w-5 text-emerald-600" /></div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{m.title}</p>
                      <p className="text-xs text-muted-foreground">{m.class?.subject?.name || ''}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="outline" className="text-xs">{m.type}</Badge>
                        <span className="text-xs text-muted-foreground">{formatDate(m.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                  {user?.role !== 'STUDENT' && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8 shrink-0"><ChevronDown className="h-4 w-4" /></Button></DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem><Download className="h-4 w-4 mr-2" /> Download</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-red-600" onClick={() => { deleteMaterial(m.id); toast({ title: 'Deleted' }) }}><Trash2 className="h-4 w-4 mr-2" /> Delete</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Upload Material</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2"><Label>Title</Label><Input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Lecture notes" /></div>
            <div className="space-y-2"><Label>Class</Label>
              <Select value={form.classId} onValueChange={v => setForm({ ...form, classId: v })}>
                <SelectTrigger><SelectValue placeholder="Select class" /></SelectTrigger>
                <SelectContent>{classes.map(c => <SelectItem key={c.id} value={c.id}>{c.code} - {c.subject?.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-2"><Label>Type</Label>
              <Select value={form.type} onValueChange={v => setForm({ ...form, type: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {['PDF', 'DOCX', 'PPTX', 'VIDEO', 'IMAGE', 'LINK'].map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2"><Label>File Name</Label><Input value={form.fileName} onChange={e => setForm({ ...form, fileName: e.target.value })} placeholder="file.pdf" /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={handleCreate}>Upload</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

/* ─── Reports ─── */

export function ReportsView() {
  const { reports, fetchReports, createReport, user } = useStore()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [form, setForm] = useState({ type: 'ATTENDANCE', title: '' })
  const { toast } = useToast()

  useEffect(() => { fetchReports() }, [])

  const handleCreate = async () => {
    try {
      await createReport({ ...form, generatedBy: user?.id || '', status: 'COMPLETED' })
      toast({ title: 'Report generated' }); setDialogOpen(false)
    } catch { toast({ title: 'Error', variant: 'destructive' }) }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div><h2 className="text-xl font-bold">Reports</h2><p className="text-sm text-muted-foreground">{reports.length} total</p></div>
        <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={() => { setForm({ type: 'ATTENDANCE', title: '' }); setDialogOpen(true) }}>
          <Plus className="h-4 w-4 mr-2" /> Generate
        </Button>
      </div>

      {reports.length === 0 ? (
        <Card className="shadow-sm"><CardContent><EmptyState icon={BarChart3} title="No reports" desc="Generate your first report." /></CardContent></Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {reports.map(r => (
            <Card key={r.id} className="shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-emerald-50"><FileText className="h-5 w-5 text-emerald-600" /></div>
                    <div>
                      <p className="text-sm font-medium">{r.title}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline">{r.type}</Badge>
                        <Badge className={r.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'} variant="outline">{r.status}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">{formatDate(r.createdAt)}</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" className="h-8 w-8"><Download className="h-4 w-4" /></Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Generate Report</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2"><Label>Type</Label>
              <Select value={form.type} onValueChange={v => setForm({ ...form, type: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {['ATTENDANCE', 'GRADES', 'ENROLLMENT', 'SCHEDULE', 'GENERAL'].map(t => <SelectItem key={t} value={t}>{t.charAt(0) + t.slice(1).toLowerCase()} Report</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2"><Label>Title</Label><Input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Report title" /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={handleCreate}>Generate</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

/* ─── Messages ─── */

export function MessagesView() {
  const { user, conversations, messages, profiles, fetchConversations, fetchMessages, fetchProfiles, sendMessage, createConversation } = useStore()
  const [selectedConv, setSelectedConv] = useState<string | null>(null)
  const [newMsg, setNewMsg] = useState('')
  const [newConvOpen, setNewConvOpen] = useState(false)
  const [newConvProfile, setNewConvProfile] = useState('')
  const { toast } = useToast()

  useEffect(() => { Promise.all([fetchConversations(), fetchProfiles()]) }, [])
  useEffect(() => { if (selectedConv) fetchMessages(selectedConv) }, [selectedConv])

  const handleSend = async () => {
    if (!selectedConv || !newMsg.trim()) return
    try { await sendMessage(selectedConv, newMsg.trim()); setNewMsg('') }
    catch { toast({ title: 'Error', variant: 'destructive' }) }
  }

  const handleCreateConv = async () => {
    if (!newConvProfile) return
    try {
      await createConversation({ participantIds: [user?.id || '', newConvProfile] })
      toast({ title: 'Conversation created' }); setNewConvOpen(false); setNewConvProfile('')
    } catch { toast({ title: 'Error', variant: 'destructive' }) }
  }

  const otherProfiles = profiles.filter(p => p.id !== user?.id)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div><h2 className="text-xl font-bold">Messages</h2><p className="text-sm text-muted-foreground">{conversations.length} conversations</p></div>
        <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={() => setNewConvOpen(true)}><Plus className="h-4 w-4 mr-2" /> New</Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-[calc(100vh-14rem)]">
        <Card className="shadow-sm lg:col-span-1">
          <ScrollArea className="h-full max-h-[calc(100vh-16rem)]">
            {conversations.length === 0 ? (
              <div className="p-4 text-center"><MessageSquare className="h-8 w-8 mx-auto text-muted-foreground mb-2" /><p className="text-sm text-muted-foreground">No conversations yet</p></div>
            ) : (
              <div className="divide-y">
                {conversations.map(conv => {
                  const other = conv.participants?.find((p: any) => p.profileId !== user?.id)
                  const lastMsg = conv.messages?.[0]
                  return (
                    <button key={conv.id} onClick={() => setSelectedConv(conv.id)}
                      className={`w-full p-3 text-left transition-colors hover:bg-muted/50 ${selectedConv === conv.id ? 'bg-emerald-50' : ''}`}>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9"><AvatarFallback className="bg-teal-100 text-teal-700 text-xs">{getInitials(other?.profile?.displayName || 'U')}</AvatarFallback></Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{other?.profile?.displayName || 'Unknown'}</p>
                          <p className="text-xs text-muted-foreground truncate">{lastMsg?.content || 'No messages'}</p>
                        </div>
                        {lastMsg && <span className="text-[10px] text-muted-foreground">{new Date(lastMsg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>}
                      </div>
                    </button>
                  )
                })}
              </div>
            )}
          </ScrollArea>
        </Card>

        <Card className="shadow-sm lg:col-span-2 flex flex-col">
          {selectedConv ? (
            <>
              <div className="border-b p-4"><p className="font-medium text-sm">{conversations.find(c => c.id === selectedConv)?.participants?.find((p: any) => p.profileId !== user?.id)?.profile?.displayName || 'Chat'}</p></div>
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-3">
                  {messages.length === 0 && <p className="text-center text-sm text-muted-foreground py-8">No messages yet. Start chatting!</p>}
                  {messages.map(msg => {
                    const isMine = msg.senderId === user?.id
                    return (
                      <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[70%] rounded-lg px-3 py-2 text-sm ${isMine ? 'bg-emerald-600 text-white' : 'bg-muted'}`}>
                          <p>{msg.content}</p>
                          <p className={`text-[10px] mt-1 ${isMine ? 'text-emerald-200' : 'text-muted-foreground'}`}>
                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </ScrollArea>
              <div className="border-t p-3">
                <div className="flex items-center gap-2">
                  <Input placeholder="Type a message..." value={newMsg} onChange={e => setNewMsg(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSend()} className="flex-1" />
                  <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={handleSend} size="icon"><Send className="h-4 w-4" /></Button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center"><div className="text-center"><MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-3" /><p className="text-sm text-muted-foreground">Select a conversation</p></div></div>
          )}
        </Card>
      </div>

      <Dialog open={newConvOpen} onOpenChange={setNewConvOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>New Conversation</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2"><Label>Select Person</Label>
              <Select value={newConvProfile} onValueChange={setNewConvProfile}>
                <SelectTrigger><SelectValue placeholder="Choose..." /></SelectTrigger>
                <SelectContent>{otherProfiles.map(p => <SelectItem key={p.id} value={p.id}>{p.displayName} ({p.role})</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setNewConvOpen(false)}>Cancel</Button>
            <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={handleCreateConv}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
