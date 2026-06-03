'use client'

import { useState, useEffect, useRef } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import {
  Search,
  Send,
  Paperclip,
  Smile,
  Phone,
  Video,
  MoreVertical,
  ArrowLeft,
  Users,
  Check,
  CheckCheck,
  MessageSquarePlus,
  Circle,
  FileUp,
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface Conversation {
  id: string
  type: string
  title: string
  avatar: string
  lastMessageAt: string
  lastMessagePreview: string
  unreadCount: number
  participants: Participant[]
  isOnline: boolean
}

interface Participant {
  id: string
  name: string
  avatar: string
  role: string
}

interface Message {
  id: string
  conversationId: string
  senderId: string
  senderName: string
  senderAvatar: string
  content: string
  status: string
  createdAt: string
  isOwn: boolean
  type: string
  attachments?: MessageAttachment[]
}

interface MessageAttachment {
  id: string
  fileName: string
  fileUrl: string
  fileSize: number
  mimeType: string
}

export default function StudentMessagesPage() {
  const { profile } = useAuth()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [isMobileDetail, setIsMobileDetail] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    async function fetchData() {
      try {
        setIsLoading(true)

        const convRes = await fetch('/api/conversations')

        if (convRes.status === 'fulfilled' && convRes.ok) {
          const data = await convRes.json()
          if (data.success && Array.isArray(data.data)) {
            setConversations(data.data)
          }
        } else {
          setConversations([
            { id: 'conv1', type: 'DIRECT', title: 'Prof. Silva', avatar: '', lastMessageAt: new Date().toISOString(), lastMessagePreview: 'Your assignment has been graded. Score: 8.5/10', unreadCount: 1, participants: [{ id: 't1', name: 'Prof. Silva', avatar: '', role: 'PROFESSOR' }], isOnline: true },
            { id: 'conv2', type: 'GROUP', title: 'Database Systems - Turma A', avatar: '', lastMessageAt: new Date(Date.now() - 1800000).toISOString(), lastMessagePreview: 'Reminder: Lab report due Friday', unreadCount: 3, participants: [{ id: 't1', name: 'Prof. Silva', avatar: '', role: 'PROFESSOR' }, { id: 'p2', name: 'Bruno Costa', avatar: '', role: 'STUDENT' }], isOnline: false },
            { id: 'conv3', type: 'DIRECT', title: 'Prof. Mendes', avatar: '', lastMessageAt: new Date(Date.now() - 7200000).toISOString(), lastMessagePreview: 'Great work on the project presentation!', unreadCount: 0, participants: [{ id: 't2', name: 'Prof. Mendes', avatar: '', role: 'PROFESSOR' }], isOnline: false },
            { id: 'conv4', type: 'GROUP', title: 'Software Engineering - Turma A', avatar: '', lastMessageAt: new Date(Date.now() - 86400000).toISOString(), lastMessagePreview: 'Project groups have been assigned', unreadCount: 0, participants: [{ id: 't2', name: 'Prof. Mendes', avatar: '', role: 'PROFESSOR' }, { id: 'p4', name: 'Daniel Ferreira', avatar: '', role: 'STUDENT' }], isOnline: false },
            { id: 'conv5', type: 'DIRECT', title: 'Carla Mendes', avatar: '', lastMessageAt: new Date(Date.now() - 172800000).toISOString(), lastMessagePreview: 'Can we study together for the exam?', unreadCount: 0, participants: [{ id: 'p3', name: 'Carla Mendes', avatar: '', role: 'STUDENT' }], isOnline: true },
          ])
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load messages')
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  const selectConversation = async (conv: Conversation) => {
    setSelectedConversation(conv)
    setIsMobileDetail(true)

    try {
      await fetch(`/api/messages/${conv.id}/read`, { method: 'POST' })
      setConversations((prev) =>
        prev.map((c) => c.id === conv.id ? { ...c, unreadCount: 0 } : c)
      )
    } catch {}

    try {
      const res = await fetch(`/api/messages?conversationId=${conv.id}`)
      if (res.ok) {
        const data = await res.json()
        if (data.success && Array.isArray(data.data)) {
          setMessages(data.data)
          return
        }
      }
    } catch {}

    setMessages([
      { id: 'msg1', conversationId: conv.id, senderId: conv.participants[0]?.id || '', senderName: conv.participants[0]?.name || 'Participant', senderAvatar: '', content: 'Hi! I have a question about the last class.', status: 'READ', createdAt: new Date(Date.now() - 3600000).toISOString(), isOwn: false, type: 'TEXT' },
      { id: 'msg2', conversationId: conv.id, senderId: profile?.id || 'me', senderName: 'You', senderAvatar: '', content: 'Sure, what would you like to know?', status: 'READ', createdAt: new Date(Date.now() - 3500000).toISOString(), isOwn: true, type: 'TEXT' },
      { id: 'msg3', conversationId: conv.id, senderId: conv.participants[0]?.id || '', senderName: conv.participants[0]?.name || 'Participant', senderAvatar: '', content: 'About the JOIN operations - when should we use LEFT JOIN vs INNER JOIN?', status: 'READ', createdAt: new Date(Date.now() - 3400000).toISOString(), isOwn: false, type: 'TEXT' },
      { id: 'msg4', conversationId: conv.id, senderId: profile?.id || 'me', senderName: 'You', senderAvatar: '', content: 'INNER JOIN returns only matching rows from both tables. LEFT JOIN returns all rows from the left table and matching rows from the right table (NULL for non-matching). Use LEFT JOIN when you want to preserve all records from the primary table.', status: 'READ', createdAt: new Date(Date.now() - 3300000).toISOString(), isOwn: true, type: 'TEXT' },
    ])
  }

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return
    const msgContent = newMessage.trim()
    setNewMessage('')

    const optimisticMsg: Message = {
      id: `msg-${Date.now()}`,
      conversationId: selectedConversation.id,
      senderId: profile?.id || 'me',
      senderName: 'You',
      senderAvatar: '',
      content: msgContent,
      status: 'SENT',
      createdAt: new Date().toISOString(),
      isOwn: true,
      type: 'TEXT',
    }

    setMessages((prev) => [...prev, optimisticMsg])
    setConversations((prev) =>
      prev.map((c) =>
        c.id === selectedConversation.id
          ? { ...c, lastMessagePreview: msgContent, lastMessageAt: new Date().toISOString() }
          : c
      )
    )

    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ conversationId: selectedConversation.id, content: msgContent, type: 'TEXT' }),
      })
      if (res.ok) {
        setMessages((prev) =>
          prev.map((m) => m.id === optimisticMsg.id ? { ...m, status: 'DELIVERED' } : m)
        )
      }
    } catch {}
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const filteredConversations = conversations.filter((c) =>
    c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.lastMessagePreview.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    if (diff < 86400000 && date.getDate() === now.getDate()) {
      return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
    }
    if (diff < 604800000) return date.toLocaleDateString('en-US', { weekday: 'short' })
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  const getInitials = (name: string) => name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-4rem)] gap-0">
        <div className="w-80 border-r p-4 space-y-3">
          <Skeleton className="h-10 w-full" />
          {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}
        </div>
        <div className="flex-1 p-6">
          <Skeleton className="h-12 w-3/4" />
          <div className="mt-8 space-y-4">
            {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-12 w-2/3" />)}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-[calc(100vh-4rem)] overflow-hidden rounded-xl border bg-background">
      {/* Conversations List */}
      <div className={`${isMobileDetail ? 'hidden md:flex' : 'flex'} w-80 flex-col border-r`}>
        <div className="p-3 space-y-3">
          <div className="flex items-center justify-between">
            <h1 className="text-lg font-semibold text-foreground">Messages</h1>
            <Button variant="ghost" size="icon" className="size-8">
              <MessageSquarePlus className="size-4" />
            </Button>
          </div>
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar conversas..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-9 pl-8 text-sm"
            />
          </div>
        </div>
        <Separator />
        <ScrollArea className="flex-1">
          <div className="p-1">
            {filteredConversations.map((conv) => (
              <button
                key={conv.id}
                onClick={() => selectConversation(conv)}
                className={`w-full flex items-center gap-3 rounded-lg p-3 text-left transition-colors hover:bg-muted/60 ${
                  selectedConversation?.id === conv.id ? 'bg-violet-50 dark:bg-violet-950/30' : ''
                }`}
              >
                <div className="relative">
                  <Avatar className="size-10">
                    <AvatarImage src={conv.avatar} />
                    <AvatarFallback className={`text-xs ${conv.type === 'GROUP' ? 'bg-blue-100 text-blue-600 dark:bg-blue-950 dark:text-blue-300' : 'bg-violet-100 text-violet-600 dark:bg-violet-950 dark:text-violet-300'}`}>
                      {conv.type === 'GROUP' ? <Users className="size-4" /> : getInitials(conv.title)}
                    </AvatarFallback>
                  </Avatar>
                  {conv.isOnline && conv.type === 'DIRECT' && (
                    <div className="absolute -bottom-0.5 -right-0.5 size-3 rounded-full border-2 border-background bg-emerald-500" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-foreground truncate">{conv.title}</p>
                    <span className="text-[11px] text-muted-foreground shrink-0 ml-1">{formatTime(conv.lastMessageAt)}</span>
                  </div>
                  <div className="flex items-center justify-between mt-0.5">
                    <p className="text-xs text-muted-foreground truncate pr-2">{conv.lastMessagePreview}</p>
                    {conv.unreadCount > 0 && (
                      <span className="flex size-5 items-center justify-center rounded-full bg-violet-600 text-[10px] font-bold text-white shrink-0">
                        {conv.unreadCount}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Message Thread */}
      <div className={`${!isMobileDetail ? 'hidden md:flex' : 'flex'} flex-1 flex-col`}>
        {selectedConversation ? (
          <>
            <div className="flex items-center justify-between border-b px-4 py-3">
              <div className="flex items-center gap-3">
                <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setIsMobileDetail(false)}>
                  <ArrowLeft className="size-4" />
                </Button>
                <Avatar className="size-9">
                  <AvatarImage src={selectedConversation.avatar} />
                  <AvatarFallback className={`text-xs ${selectedConversation.type === 'GROUP' ? 'bg-blue-100 text-blue-600 dark:bg-blue-950 dark:text-blue-300' : 'bg-violet-100 text-violet-600 dark:bg-violet-950 dark:text-violet-300'}`}>
                    {selectedConversation.type === 'GROUP' ? <Users className="size-4" /> : getInitials(selectedConversation.title)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-semibold text-foreground">{selectedConversation.title}</p>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    {selectedConversation.type === 'GROUP' ? (
                      <><Users className="size-3" /> {selectedConversation.participants.length} members</>
                    ) : selectedConversation.isOnline ? (
                      <><Circle className="size-2 fill-emerald-500 text-emerald-500" /> Online</>
                    ) : 'Offline'}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon" className="size-8"><Phone className="size-4" /></Button>
                <Button variant="ghost" size="icon" className="size-8"><Video className="size-4" /></Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="size-8"><MoreVertical className="size-4" /></Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem><Users className="mr-2 size-3.5" /> View Members</DropdownMenuItem>
                    <DropdownMenuItem><Search className="mr-2 size-3.5" /> Search in Chat</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            <ScrollArea className="flex-1 p-4">
              <div className="mx-auto max-w-2xl space-y-3">
                {messages.map((msg) => (
                  <div key={msg.id} className={`flex ${msg.isOwn ? 'justify-end' : 'justify-start'}`}>
                    <div className={`flex gap-2 max-w-[75%] ${msg.isOwn ? 'flex-row-reverse' : ''}`}>
                      {!msg.isOwn && (
                        <Avatar className="mt-auto size-7 shrink-0">
                          <AvatarFallback className="bg-violet-100 text-violet-600 text-[10px] dark:bg-violet-950 dark:text-violet-300">
                            {getInitials(msg.senderName)}
                          </AvatarFallback>
                        </Avatar>
                      )}
                      <div>
                        <div className={`rounded-2xl px-3.5 py-2.5 ${
                          msg.isOwn ? 'rounded-br-md bg-violet-600 text-white' : 'rounded-bl-md bg-muted'
                        }`}>
                          {selectedConversation.type === 'GROUP' && !msg.isOwn && (
                            <p className={`text-[11px] font-medium mb-0.5 ${msg.isOwn ? 'text-violet-200' : 'text-violet-600 dark:text-violet-400'}`}>
                              {msg.senderName}
                            </p>
                          )}
                          <p className="text-sm leading-relaxed">{msg.content}</p>
                        </div>
                        <div className={`flex items-center gap-1 mt-0.5 ${msg.isOwn ? 'justify-end' : ''}`}>
                          <span className="text-[10px] text-muted-foreground">
                            {new Date(msg.createdAt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                          </span>
                          {msg.isOwn && (msg.status === 'READ' ? <CheckCheck className="size-3 text-violet-400" /> : <Check className="size-3 text-muted-foreground" />)}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            <div className="border-t p-3">
              <div className="mx-auto max-w-2xl">
                <div className="flex items-end gap-2 rounded-xl border bg-muted/30 p-2">
                  <Button variant="ghost" size="icon" className="size-8 shrink-0"><Paperclip className="size-4" /></Button>
                  <textarea
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Digite uma mensagem..."
                    rows={1}
                    className="flex-1 resize-none bg-transparent text-sm outline-none placeholder:text-muted-foreground min-h-[32px] max-h-24"
                  />
                  <div className="flex items-center gap-0.5 shrink-0">
                    <Button variant="ghost" size="icon" className="size-8"><Smile className="size-4" /></Button>
                    <Button
                      size="icon"
                      className="size-8 bg-violet-600 text-white hover:bg-violet-700 disabled:opacity-50"
                      disabled={!newMessage.trim()}
                      onClick={sendMessage}
                    >
                      <Send className="size-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-violet-100 dark:bg-violet-950">
              <MessageSquarePlus className="size-8 text-violet-600 dark:text-violet-300" />
            </div>
            <p className="mt-4 text-lg font-medium text-foreground">Select a conversation</p>
            <p className="text-sm text-muted-foreground">Choose from your existing conversations or start a new one</p>
          </div>
        )}
      </div>
    </div>
  )
}
