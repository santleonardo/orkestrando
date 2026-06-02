'use client'

import { useState, useEffect, useRef } from 'react'
import {
  Send, Search, Plus, Megaphone, Users, MessageSquare, Bell,
  Paperclip, Check, CheckCheck, MoreVertical, ArrowLeft, Smile,
  Image, FileText, X, UserPlus, Loader2,
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

// ---------------------------------------------------------------------------
// Types & Mock Data
// ---------------------------------------------------------------------------

interface ConversationItem {
  id: string
  type: 'DIRECT' | 'GROUP' | 'ANNOUNCEMENT'
  title: string
  participants: { id: string; name: string; avatar?: string }[]
  lastMessage: string
  lastMessageAt: string
  lastMessageBy: string
  unreadCount: number
  isOnline: boolean
}

interface MessageItem {
  id: string
  conversationId: string
  senderId: string
  senderName: string
  content: string
  createdAt: string
  isOwn: boolean
  isRead: boolean
  type: 'text' | 'announcement'
}

const mockConversations: ConversationItem[] = [
  { id: '1', type: 'DIRECT', title: 'Prof. Rodrigues', participants: [{ id: 'p1', name: 'Prof. Rodrigues' }], lastMessage: 'Can we discuss the schedule changes?', lastMessageAt: '10:30', lastMessageBy: 'Prof. Rodrigues', unreadCount: 2, isOnline: true },
  { id: '2', type: 'GROUP', title: 'CS Department', participants: [{ id: 'p1', name: 'Prof. Rodrigues' }, { id: 'p6', name: 'Prof. Lima' }, { id: 'p7', name: 'Prof. Santos' }], lastMessage: 'Meeting scheduled for Friday at 3pm', lastMessageAt: '09:15', lastMessageBy: 'Prof. Lima', unreadCount: 0, isOnline: false },
  { id: '3', type: 'ANNOUNCEMENT', title: 'All Students - CS201', participants: [{ id: 's1', name: '35 students' }], lastMessage: 'Midterm exam rescheduled to March 15', lastMessageAt: 'Yesterday', lastMessageBy: 'You', unreadCount: 0, isOnline: false },
  { id: '4', type: 'DIRECT', title: 'Prof. Mendes', participants: [{ id: 'p2', name: 'Prof. Mendes' }], lastMessage: 'Availability submitted for review', lastMessageAt: 'Yesterday', lastMessageBy: 'Prof. Mendes', unreadCount: 1, isOnline: false },
  { id: '5', type: 'GROUP', title: 'Design Department', participants: [{ id: 'p3', name: 'Prof. Ferreira' }, { id: 'p8', name: 'Prof. Oliveira' }], lastMessage: 'New materials uploaded for UX class', lastMessageAt: '2 days ago', lastMessageBy: 'Prof. Ferreira', unreadCount: 0, isOnline: true },
  { id: '6', type: 'ANNOUNCEMENT', title: 'All Students - General', participants: [{ id: 's_all', name: '1247 students' }], lastMessage: 'Semester 2024.1 enrollment deadline extended', lastMessageAt: '3 days ago', lastMessageBy: 'You', unreadCount: 0, isOnline: false },
]

const mockMessages: Record<string, MessageItem[]> = {
  '1': [
    { id: 'm1', conversationId: '1', senderId: 'p1', senderName: 'Prof. Rodrigues', content: 'Good morning! I wanted to talk about the schedule changes for next week.', createdAt: '10:25', isOwn: false, isRead: true, type: 'text' },
    { id: 'm2', conversationId: '1', senderId: 'p1', senderName: 'Prof. Rodrigues', content: 'The Data Structures class conflicts with the Algorithms class on Tuesday.', createdAt: '10:28', isOwn: false, isRead: true, type: 'text' },
    { id: 'm3', conversationId: '1', senderId: 'p1', senderName: 'Prof. Rodrigues', content: 'Can we discuss the schedule changes?', createdAt: '10:30', isOwn: false, isRead: false, type: 'text' },
  ],
  '2': [
    { id: 'm4', conversationId: '2', senderId: 'p6', senderName: 'Prof. Lima', content: 'Hi everyone, the CS department meeting is confirmed.', createdAt: '09:10', isOwn: false, isRead: true, type: 'text' },
    { id: 'm5', conversationId: '2', senderId: 'p6', senderName: 'Prof. Lima', content: 'Meeting scheduled for Friday at 3pm', createdAt: '09:15', isOwn: false, isRead: true, type: 'text' },
  ],
  '3': [
    { id: 'm6', conversationId: '3', senderId: 'me', senderName: 'You', content: '📢 Attention all CS201 students:', createdAt: 'Yesterday 14:00', isOwn: true, isRead: true, type: 'announcement' },
    { id: 'm7', conversationId: '3', senderId: 'me', senderName: 'You', content: 'The midterm exam has been rescheduled to March 15, 2024. Please make sure to prepare accordingly. The exam will cover chapters 1-8.', createdAt: 'Yesterday 14:01', isOwn: true, isRead: true, type: 'text' },
  ],
}

export default function CoordinatorMessagesPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('all')
  const [selectedConversation, setSelectedConversation] = useState<string | null>('1')
  const [searchQuery, setSearchQuery] = useState('')
  const [messageInput, setMessageInput] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [announcementOpen, setAnnouncementOpen] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const [announcementForm, setAnnouncementForm] = useState({
    target: 'all',
    title: '',
    content: '',
  })

  const [allMessages, setAllMessages] = useState<Record<string, MessageItem[]>>(mockMessages)

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 800)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [selectedConversation, allMessages])

  const filteredConversations = useMemo(() => {
    let items = [...mockConversations]
    if (activeTab === 'direct') items = items.filter((c) => c.type === 'DIRECT')
    if (activeTab === 'group') items = items.filter((c) => c.type === 'GROUP')
    if (activeTab === 'announcements') items = items.filter((c) => c.type === 'ANNOUNCEMENT')
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      items = items.filter((c) => c.title.toLowerCase().includes(q) || c.lastMessage.toLowerCase().includes(q))
    }
    return items
  }, [activeTab, searchQuery])

  const currentMessages = selectedConversation ? allMessages[selectedConversation] || [] : []
  const currentConversation = mockConversations.find((c) => c.id === selectedConversation)

  const handleSendMessage = async () => {
    if (!messageInput.trim() || !selectedConversation) return
    setIsSending(true)
    const newMsg: MessageItem = {
      id: `m${Date.now()}`,
      conversationId: selectedConversation,
      senderId: 'me',
      senderName: 'You',
      content: messageInput,
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isOwn: true,
      isRead: true,
      type: 'text',
    }
    setAllMessages((prev) => ({ ...prev, [selectedConversation]: [...(prev[selectedConversation] || []), newMsg] }))
    setMessageInput('')
    setIsSending(false)
  }

  const handleCreateAnnouncement = async () => {
    setIsSending(true)
    await new Promise((r) => setTimeout(r, 1500))
    const newConv: ConversationItem = {
      id: String(Date.now()),
      type: 'ANNOUNCEMENT',
      title: announcementForm.title,
      participants: [{ id: 'new', name: announcementForm.target === 'all' ? 'All students' : 'Selected class' }],
      lastMessage: announcementForm.content,
      lastMessageAt: 'Just now',
      lastMessageBy: 'You',
      unreadCount: 0,
      isOnline: false,
    }
    mockConversations.unshift(newConv)
    setAllMessages((prev) => ({
      ...prev,
      [newConv.id]: [
        { id: `m${Date.now()}`, conversationId: newConv.id, senderId: 'me', senderName: 'You', content: announcementForm.content, createdAt: 'Just now', isOwn: true, isRead: true, type: 'announcement' },
      ],
    }))
    setSelectedConversation(newConv.id)
    setIsSending(false)
    setAnnouncementOpen(false)
    setAnnouncementForm({ target: 'all', title: '', content: '' })
  }

  const getInitials = (name: string) => name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'DIRECT': return 'bg-blue-100 text-blue-700'
      case 'GROUP': return 'bg-violet-100 text-violet-700'
      case 'ANNOUNCEMENT': return 'bg-purple-100 text-purple-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  if (isLoading) return <div className="flex-1 space-y-6 p-6"><Skeleton className="h-10 w-48" /><Skeleton className="h-[600px] w-full" /></div>

  return (
    <div className="flex-1 space-y-6 p-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-violet-700 to-purple-500 bg-clip-text text-transparent">Messages</h1>
          <p className="text-muted-foreground mt-1">Direct messages, groups, and announcements</p>
        </div>
        <Button onClick={() => setAnnouncementOpen(true)} className="gap-2 bg-violet-600 hover:bg-violet-700">
          <Megaphone className="h-4 w-4" /> New Announcement
        </Button>
      </div>

      <Card className="border-violet-200 dark:border-violet-800/50 overflow-hidden">
        <div className="flex h-[calc(100vh-280px)] min-h-[500px]">
          {/* Sidebar */}
          <div className="w-80 border-r border-violet-100 flex flex-col shrink-0">
            <div className="p-3 border-b">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search conversations..." className="pl-9 h-9" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
              </div>
            </div>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="px-3 pt-2">
              <TabsList className="w-full h-8">
                <TabsTrigger value="all" className="text-xs flex-1">All</TabsTrigger>
                <TabsTrigger value="direct" className="text-xs flex-1">Direct</TabsTrigger>
                <TabsTrigger value="group" className="text-xs flex-1">Groups</TabsTrigger>
                <TabsTrigger value="announcements" className="text-xs flex-1">📢</TabsTrigger>
              </TabsList>
            </Tabs>
            <ScrollArea className="flex-1">
              <div className="p-2 space-y-1">
                {filteredConversations.map((conv) => (
                  <div
                    key={conv.id}
                    className={cn(
                      'flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-colors',
                      selectedConversation === conv.id ? 'bg-violet-100 dark:bg-violet-950/30' : 'hover:bg-muted/50'
                    )}
                    onClick={() => setSelectedConversation(conv.id)}
                  >
                    <div className="relative">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className={cn('text-xs font-medium', conv.type === 'ANNOUNCEMENT' ? 'bg-purple-100 text-purple-700' : 'bg-violet-100 text-violet-700')}>
                          {conv.type === 'ANNOUNCEMENT' ? '📢' : getInitials(conv.title)}
                        </AvatarFallback>
                      </Avatar>
                      {conv.isOnline && <div className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-white dark:border-background" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium truncate">{conv.title}</p>
                        <span className="text-[10px] text-muted-foreground shrink-0 ml-2">{conv.lastMessageAt}</span>
                      </div>
                      <div className="flex items-center gap-1 mt-0.5">
                        <Badge className={cn('text-[9px] px-1 py-0', getTypeBadge(conv.type))}>{conv.type}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground truncate mt-1">{conv.lastMessage}</p>
                    </div>
                    {conv.unreadCount > 0 && (
                      <div className="flex h-5 w-5 items-center justify-center rounded-full bg-violet-600 text-white text-[10px] font-bold shrink-0">
                        {conv.unreadCount}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>

          {/* Message Thread */}
          <div className="flex-1 flex flex-col">
            {currentConversation ? (
              <>
                <div className="p-4 border-b flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-9 w-9">
                      <AvatarFallback className={cn('text-xs font-medium', currentConversation.type === 'ANNOUNCEMENT' ? 'bg-purple-100 text-purple-700' : 'bg-violet-100 text-violet-700')}>
                        {currentConversation.type === 'ANNOUNCEMENT' ? '📢' : getInitials(currentConversation.title)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{currentConversation.title}</p>
                      <div className="flex items-center gap-2">
                        <Badge className={cn('text-[9px] px-1 py-0', getTypeBadge(currentConversation.type))}>{currentConversation.type}</Badge>
                        <span className="text-xs text-muted-foreground">{currentConversation.participants.length} participants</span>
                      </div>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8"><MoreVertical className="h-4 w-4" /></Button></DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem className="cursor-pointer"><Users className="h-4 w-4 mr-2" />Manage Participants</DropdownMenuItem>
                      <DropdownMenuItem className="cursor-pointer"><UserPlus className="h-4 w-4 mr-2" />Add Member</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <ScrollArea className="flex-1 p-4">
                  <div className="space-y-4">
                    {currentMessages.map((msg) => (
                      <div key={msg.id} className={cn('flex gap-3', msg.isOwn && 'flex-row-reverse')}>
                        <Avatar className="h-8 w-8 shrink-0">
                          <AvatarFallback className={cn('text-[10px] font-medium', msg.isOwn ? 'bg-violet-200 text-violet-800' : 'bg-violet-100 text-violet-700')}>
                            {getInitials(msg.senderName)}
                          </AvatarFallback>
                        </Avatar>
                        <div className={cn('max-w-[70%] space-y-1', msg.isOwn && 'flex flex-col items-end')}>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-medium">{msg.senderName}</span>
                            <span className="text-[10px] text-muted-foreground">{msg.createdAt}</span>
                            {msg.isOwn && <CheckCheck className="h-3 w-3 text-violet-500" />}
                          </div>
                          <div className={cn('rounded-lg p-3 text-sm', msg.isOwn ? 'bg-violet-600 text-white' : 'bg-muted')}>
                            {msg.type === 'announcement' && <div className="flex items-center gap-1 mb-1"><Megaphone className="h-3 w-3" /><span className="text-xs font-medium opacity-80">Announcement</span></div>}
                            {msg.content}
                          </div>
                        </div>
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>
                </ScrollArea>

                <div className="p-4 border-t">
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" className="h-9 w-9 shrink-0"><Paperclip className="h-4 w-4" /></Button>
                    <Input
                      placeholder="Type a message..."
                      className="flex-1"
                      value={messageInput}
                      onChange={(e) => setMessageInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
                    />
                    <Button variant="ghost" size="icon" className="h-9 w-9 shrink-0"><Smile className="h-4 w-4" /></Button>
                    <Button onClick={handleSendMessage} disabled={isSending || !messageInput.trim()} size="icon" className="h-9 w-9 bg-violet-600 hover:bg-violet-700 shrink-0">
                      {isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-muted-foreground">
                <div className="text-center space-y-2">
                  <MessageSquare className="h-12 w-12 mx-auto opacity-30" />
                  <p>Select a conversation to start messaging</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* New Announcement Dialog */}
      <Dialog open={announcementOpen} onOpenChange={setAnnouncementOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle className="text-violet-700">Create Announcement</DialogTitle><DialogDescription>Send an announcement to students, a class, or specific users.</DialogDescription></DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>Send To</Label>
              <Select value={announcementForm.target} onValueChange={(v) => setAnnouncementForm({ ...announcementForm, target: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Students</SelectItem>
                  <SelectItem value="class">Specific Class</SelectItem>
                  <SelectItem value="course">Specific Course</SelectItem>
                  <SelectItem value="users">Specific Users</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {announcementForm.target === 'class' && (
              <div className="space-y-2"><Label>Class</Label><Select><SelectTrigger><SelectValue placeholder="Select class" /></SelectTrigger><SelectContent><SelectItem value="cs201-a">Data Structures - A</SelectItem><SelectItem value="ma102-a">Calculus II - A</SelectItem></SelectContent></Select></div>
            )}
            <div className="space-y-2"><Label>Title</Label><Input placeholder="Announcement title..." value={announcementForm.title} onChange={(e) => setAnnouncementForm({ ...announcementForm, title: e.target.value })} /></div>
            <div className="space-y-2"><Label>Content</Label><Textarea placeholder="Write your announcement..." rows={5} value={announcementForm.content} onChange={(e) => setAnnouncementForm({ ...announcementForm, content: e.target.value })} /></div>
            <div className="flex items-center gap-4">
              <Button variant="outline" size="sm" className="gap-2"><Paperclip className="h-4 w-4" /> Attach File</Button>
              <Button variant="outline" size="sm" className="gap-2"><Image className="h-4 w-4" /> Add Image</Button>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAnnouncementOpen(false)}>Cancel</Button>
            <Button onClick={handleCreateAnnouncement} disabled={isSubmitting || !announcementForm.title || !announcementForm.content} className="bg-violet-600 hover:bg-violet-700 gap-2">
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Megaphone className="h-4 w-4" />}
              Send Announcement
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
