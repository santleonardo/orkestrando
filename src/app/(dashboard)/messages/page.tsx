'use client'

import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Send,
  Search,
  Plus,
  Paperclip,
  Smile,
  Bold,
  Italic,
  List,
  Code,
  Image as ImageIcon,
  AtSign,
  Phone,
  Video,
  MoreVertical,
  Check,
  CheckCheck,
  Users,
  Megaphone,
  MessageSquare,
  Circle,
  ArrowLeft,
  Hash,
  Pin,
  Reply,
  Trash2,
  ChevronDown,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { formatRelativeTime } from '@/lib/utils/format'
import { getInitials } from '@/lib/utils/format'

interface Participant {
  id: string
  name: string
  avatar?: string
  online: boolean
  role: 'admin' | 'member'
}

interface MockMessage {
  id: string
  senderId: string
  senderName: string
  content: string
  timestamp: string
  status: 'sent' | 'read'
  messageType: 'text' | 'system'
  isPinned: boolean
  replyTo?: string
  reactions?: { emoji: string; count: number }[]
}

interface MockConversation {
  id: string
  type: 'direct' | 'group' | 'announcement'
  title: string
  participants: Participant[]
  lastMessage: string
  lastMessageAt: string
  lastSenderName: string
  unreadCount: number
  isOnline: boolean
  messages: MockMessage[]
}

const CURRENT_USER_ID = 'user-coord'

const CONVERSATIONS: MockConversation[] = [
  {
    id: '1', type: 'group', title: 'Música - Turma 2025/1',
    participants: [
      { id: 'p1', name: 'Prof. Carlos Silva', online: true, role: 'admin' },
      { id: 'p2', name: 'Ana Clara Mendes', online: true, role: 'member' },
      { id: 'p3', name: 'Bruno Oliveira', online: false, role: 'member' },
      { id: 'p4', name: 'Carolina Santos', online: true, role: 'member' },
      { id: 'p5', name: 'Daniel Ferreira', online: false, role: 'member' },
    ],
    lastMessage: 'Não esqueçam de trazer a partitura para amanhã!', lastMessageAt: '2025-01-15T10:30:00',
    lastSenderName: 'Prof. Carlos', unreadCount: 5, isOnline: true,
    messages: [
      { id: 'm1', senderId: 'p1', senderName: 'Prof. Carlos Silva', content: 'Bom dia a todos! A aula de hoje foi excelente.', timestamp: '2025-01-15T09:00:00', status: 'read', messageType: 'text', isPinned: false },
      { id: 'm2', senderId: 'p2', senderName: 'Ana Clara Mendes', content: 'Concordo! Gostei muito dos exercícios de harmonia.', timestamp: '2025-01-15T09:05:00', status: 'read', messageType: 'text', isPinned: false },
      { id: 'm3', senderId: 'p3', senderName: 'Bruno Oliveira', content: 'Eu também! Mas ainda preciso praticar mais os acordes diminutos.', timestamp: '2025-01-15T09:10:00', status: 'read', messageType: 'text', isPinned: false },
      { id: 'm4', senderId: 'p4', senderName: 'Carolina Santos', content: 'Bruno, posso te ajudar amanhã antes da aula se quiser!', timestamp: '2025-01-15T09:15:00', status: 'read', messageType: 'text', isPinned: false },
      { id: 'm5', senderId: 'p1', senderName: 'Prof. Carlos Silva', content: 'Não esqueçam de trazer a partitura para amanhã!', timestamp: '2025-01-15T10:30:00', status: 'read', messageType: 'text', isPinned: true },
      { id: 'm6', senderId: CURRENT_USER_ID, senderName: 'Maria Coelho', content: 'Vou verificar se todos receberam o material.', timestamp: '2025-01-15T10:35:00', status: 'read', messageType: 'text', isPinned: false },
    ],
  },
  {
    id: '2', type: 'group', title: 'Teatro - Turma 2025/1',
    participants: [
      { id: 'p6', name: 'Prof. Roberto Lima', online: true, role: 'admin' },
      { id: 'p7', name: 'Eduarda Nascimento', online: false, role: 'member' },
      { id: 'p8', name: 'Felipe Martins', online: true, role: 'member' },
    ],
    lastMessage: 'O ensaio geral será sexta às 14h', lastMessageAt: '2025-01-15T08:00:00',
    lastSenderName: 'Prof. Roberto', unreadCount: 2, isOnline: true,
    messages: [
      { id: 'm7', senderId: 'p6', senderName: 'Prof. Roberto Lima', content: 'Pessoal, o ensaio geral será sexta às 14h no auditório.', timestamp: '2025-01-15T08:00:00', status: 'read', messageType: 'text', isPinned: false },
      { id: 'm8', senderId: 'p7', senderName: 'Eduarda Nascimento', content: 'Entendido! Vou avisar os outros do grupo.', timestamp: '2025-01-15T08:10:00', status: 'read', messageType: 'text', isPinned: false },
    ],
  },
  {
    id: '3', type: 'direct', title: 'Prof. Carlos Silva',
    participants: [
      { id: 'p1', name: 'Prof. Carlos Silva', online: true, role: 'admin' },
    ],
    lastMessage: 'Preciso falar sobre o cronograma', lastMessageAt: '2025-01-14T16:00:00',
    lastSenderName: 'Prof. Carlos', unreadCount: 1, isOnline: true,
    messages: [
      { id: 'm9', senderId: 'p1', senderName: 'Prof. Carlos Silva', content: 'Oi Maria, tudo bem?', timestamp: '2025-01-14T15:50:00', status: 'read', messageType: 'text', isPinned: false },
      { id: 'm10', senderId: CURRENT_USER_ID, senderName: 'Maria Coelho', content: 'Oi Carlos! Tudo ótimo, e com você?', timestamp: '2025-01-14T15:55:00', status: 'read', messageType: 'text', isPinned: false },
      { id: 'm11', senderId: 'p1', senderName: 'Prof. Carlos Silva', content: 'Preciso falar sobre o cronograma da próxima semana. Podemos marcar uma reunião?', timestamp: '2025-01-14T16:00:00', status: 'read', messageType: 'text', isPinned: false },
    ],
  },
  {
    id: '4', type: 'announcement', title: 'Avisos Gerais',
    participants: [],
    lastMessage: 'Inscrições para o festival abertas até 30/01', lastMessageAt: '2025-01-13T12:00:00',
    lastSenderName: 'Coordenação', unreadCount: 0, isOnline: false,
    messages: [
      { id: 'm12', senderId: CURRENT_USER_ID, senderName: 'Coordenação', content: '📢 As inscrições para o Festival de Arte 2025 estão abertas até o dia 30 de janeiro. Interessados devem se inscrever na secretaria.', timestamp: '2025-01-13T12:00:00', status: 'read', messageType: 'text', isPinned: true },
    ],
  },
  {
    id: '5', type: 'direct', title: 'Ana Clara Mendes',
    participants: [
      { id: 'p2', name: 'Ana Clara Mendes', online: false, role: 'member' },
    ],
    lastMessage: 'Obrigada pela orientação!', lastMessageAt: '2025-01-12T11:00:00',
    lastSenderName: 'Ana Clara', unreadCount: 0, isOnline: false,
    messages: [
      { id: 'm13', senderId: 'p2', senderName: 'Ana Clara Mendes', content: 'Obrigada pela orientação sobre a matrícula!', timestamp: '2025-01-12T11:00:00', status: 'read', messageType: 'text', isPinned: false },
    ],
  },
]

function getTypeIcon(type: string) {
  switch (type) {
    case 'direct': return <MessageSquare className="h-3.5 w-3.5" />
    case 'group': return <Users className="h-3.5 w-3.5" />
    case 'announcement': return <Megaphone className="h-3.5 w-3.5" />
    default: return <MessageSquare className="h-3.5 w-3.5" />
  }
}

function getTypeLabel(type: string) {
  switch (type) {
    case 'direct': return 'Direto'
    case 'group': return 'Turma'
    case 'announcement': return 'Aviso'
    default: return ''
  }
}

export default function MessagesPage() {
  const [selectedConversation, setSelectedConversation] = useState<MockConversation>(CONVERSATIONS[0])
  const [searchQuery, setSearchQuery] = useState('')
  const [newMessage, setNewMessage] = useState('')
  const [messageFilter, setMessageFilter] = useState<string>('all')
  const [showMobileChat, setShowMobileChat] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const filteredConversations = CONVERSATIONS.filter(c => {
    if (messageFilter !== 'all' && c.type !== messageFilter) return false
    if (searchQuery && !c.title.toLowerCase().includes(searchQuery.toLowerCase())) return false
    return true
  })

  const handleSendMessage = () => {
    if (!newMessage.trim()) return
    const msg: MockMessage = {
      id: `m-new-${Date.now()}`,
      senderId: CURRENT_USER_ID,
      senderName: 'Maria Coelho',
      content: newMessage,
      timestamp: new Date().toISOString(),
      status: 'sent',
      messageType: 'text',
      isPinned: false,
    }
    selectedConversation.messages.push(msg)
    setNewMessage('')
  }

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [selectedConversation.messages.length])

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Mensagens</h1>
          <p className="text-muted-foreground">Comunicação interna da instituição</p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="gap-2 bg-emerald-600 hover:bg-emerald-700">
              <Plus className="h-4 w-4" />
              Nova Mensagem
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nova Conversa</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Select>
                <SelectTrigger><SelectValue placeholder="Tipo de conversa" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="direct">Mensagem Direta</SelectItem>
                  <SelectItem value="group">Grupo de Turma</SelectItem>
                  <SelectItem value="announcement">Aviso Geral</SelectItem>
                </SelectContent>
              </Select>
              <Input placeholder="Buscar participante ou turma..." />
              <Button className="w-full bg-emerald-600 hover:bg-emerald-700">Iniciar Conversa</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="overflow-hidden" style={{ height: 'calc(100vh - 220px)', minHeight: '500px' }}>
        <CardContent className="p-0 h-full flex">
          {/* Conversation List */}
          <div className={`${showMobileChat ? 'hidden' : 'flex'} w-full md:w-80 border-r flex-col h-full`}>
            <div className="p-3 space-y-3 border-b">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar conversas..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 h-9"
                />
              </div>
              <Select value={messageFilter} onValueChange={setMessageFilter}>
                <SelectTrigger className="h-8 w-full">
                  <SelectValue placeholder="Filtrar" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  <SelectItem value="direct">Diretas</SelectItem>
                  <SelectItem value="group">Turmas</SelectItem>
                  <SelectItem value="announcement">Avisos</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <ScrollArea className="flex-1">
              <div className="divide-y">
                {filteredConversations.map((conv, i) => (
                  <motion.button
                    key={conv.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.03 }}
                    className={`w-full flex items-start gap-3 p-3 text-left hover:bg-muted/50 transition-colors ${
                      selectedConversation.id === conv.id ? 'bg-emerald-50/50' : ''
                    }`}
                    onClick={() => {
                      setSelectedConversation(conv)
                      setShowMobileChat(true)
                    }}
                  >
                    <div className="relative shrink-0">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className={`text-xs ${
                          conv.type === 'announcement' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
                        }`}>
                          {conv.type === 'announcement' ? '📢' : getInitials(conv.title)}
                        </AvatarFallback>
                      </Avatar>
                      {conv.isOnline && conv.type !== 'announcement' && (
                        <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-emerald-500 border-2 border-background" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <span className="text-sm font-medium truncate">{conv.title}</span>
                          <Badge variant="secondary" className="text-[9px] px-1 h-4 shrink-0">
                            {getTypeIcon(conv.type)}
                            {getTypeLabel(conv.type)}
                          </Badge>
                        </div>
                        <span className="text-[10px] text-muted-foreground shrink-0">{formatRelativeTime(conv.lastMessageAt)}</span>
                      </div>
                      <div className="flex items-center gap-1 mt-0.5">
                        <p className="text-xs text-muted-foreground truncate flex-1">
                          {conv.lastSenderName}: {conv.lastMessage}
                        </p>
                        {conv.unreadCount > 0 && (
                          <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-emerald-600 text-[10px] text-white px-1.5">
                            {conv.unreadCount}
                          </span>
                        )}
                      </div>
                    </div>
                  </motion.button>
                ))}
              </div>
            </ScrollArea>
          </div>

          {/* Chat Area */}
          <div className={`${showMobileChat ? 'flex' : 'hidden'} md:flex flex-col flex-1 h-full`}>
            {selectedConversation ? (
              <>
                {/* Chat Header */}
                <div className="flex items-center gap-3 p-3 border-b">
                  <Button variant="ghost" size="icon" className="h-8 w-8 md:hidden" onClick={() => setShowMobileChat(false)}>
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                  <Avatar className="h-9 w-9">
                    <AvatarFallback className={`text-xs ${
                      selectedConversation.type === 'announcement' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
                    }`}>
                      {selectedConversation.type === 'announcement' ? '📢' : getInitials(selectedConversation.title)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold truncate">{selectedConversation.title}</h3>
                    <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                      {selectedConversation.type === 'group' && (
                        <><Users className="h-3 w-3" /> {selectedConversation.participants.length} participantes</>
                      )}
                      {selectedConversation.type === 'direct' && (
                        <>{selectedConversation.isOnline ? 'Online' : 'Offline'}</>
                      )}
                      {selectedConversation.type === 'announcement' && (
                        <><Megaphone className="h-3 w-3" /> Canal de avisos</>
                      )}
                    </p>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem><Users className="h-4 w-4 mr-2" />Participantes</DropdownMenuItem>
                      <DropdownMenuItem><Pin className="h-4 w-4 mr-2" />Fixar Mensagem</DropdownMenuItem>
                      <DropdownMenuItem><Trash2 className="h-4 w-4 mr-2" />Limpar Chat</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* Messages */}
                <ScrollArea className="flex-1 p-4">
                  <div className="space-y-3 max-w-2xl mx-auto">
                    {selectedConversation.messages.map((msg, i) => {
                      const isOwn = msg.senderId === CURRENT_USER_ID
                      return (
                        <motion.div
                          key={msg.id}
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.02 }}
                          className={`flex gap-2 ${isOwn ? 'flex-row-reverse' : ''}`}
                        >
                          {!isOwn && (
                            <Avatar className="h-8 w-8 shrink-0 mt-1">
                              <AvatarFallback className="text-[10px] bg-slate-100 text-slate-600">
                                {getInitials(msg.senderName)}
                              </AvatarFallback>
                            </Avatar>
                          )}
                          <div className={`max-w-[75%] ${isOwn ? 'items-end' : 'items-start'}`}>
                            {!isOwn && (
                              <p className="text-[10px] font-medium text-muted-foreground mb-0.5">{msg.senderName}</p>
                            )}
                            <div className={`rounded-xl px-3 py-2 ${
                              isOwn
                                ? 'bg-emerald-600 text-white rounded-tr-sm'
                                : 'bg-muted rounded-tl-sm'
                            }`}>
                              {msg.isPinned && (
                                <div className="flex items-center gap-1 mb-1 text-[10px] opacity-75">
                                  <Pin className="h-2.5 w-2.5" /> Fixada
                                </div>
                              )}
                              <p className="text-sm leading-relaxed">{msg.content}</p>
                            </div>
                            <div className={`flex items-center gap-1 mt-0.5 ${isOwn ? 'justify-end' : ''}`}>
                              <span className="text-[10px] text-muted-foreground">{formatRelativeTime(msg.timestamp)}</span>
                              {isOwn && (
                                msg.status === 'read' ? <CheckCheck className="h-3 w-3 text-emerald-500" /> : <Check className="h-3 w-3 text-muted-foreground" />
                              )}
                            </div>
                          </div>
                        </motion.div>
                      )
                    })}
                    <div ref={messagesEndRef} />
                  </div>
                </ScrollArea>

                {/* Message Input */}
                <div className="border-t p-3">
                  <div className="max-w-2xl mx-auto">
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                        <Paperclip className="h-4 w-4" />
                      </Button>
                      <div className="flex-1 relative">
                        <Input
                          placeholder="Escreva uma mensagem..."
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
                          className="pr-20 h-10"
                        />
                        <div className="absolute right-1.5 top-1/2 -translate-y-1/2 flex items-center gap-0.5">
                          <Button variant="ghost" size="icon" className="h-7 w-7">
                            <Bold className="h-3.5 w-3.5" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7">
                            <ImageIcon className="h-3.5 w-3.5" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7">
                            <Smile className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                      <Button
                        size="icon"
                        className="h-10 w-10 shrink-0 bg-emerald-600 hover:bg-emerald-700"
                        onClick={handleSendMessage}
                        disabled={!newMessage.trim()}
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <MessageSquare className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">Selecione uma conversa</p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
