'use client'

import { useState, useRef, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuthStore } from '@/store/auth-store'
import { api } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { FormDialog, type FormField } from '@/components/orkestrando/shared/form-dialog'
import { Card, CardContent } from '@/components/ui/card'
import { Plus, Send, MessageSquare, Search } from 'lucide-react'
import { toast } from 'sonner'
import { format, parseISO } from 'date-fns'

export function MessagesView() {
  const queryClient = useQueryClient()
  const { user } = useAuthStore()
  const [selectedConversation, setSelectedConversation] = useState<Record<string, unknown> | null>(null)
  const [newMessage, setNewMessage] = useState('')
  const [newConvOpen, setNewConvOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const { data: conversations, isLoading } = useQuery({
    queryKey: ['conversations'],
    queryFn: () => api.get('/api/messages'),
  })

  const { data: messages } = useQuery({
    queryKey: ['messages', selectedConversation?.id],
    queryFn: () => api.get(`/api/messages/${selectedConversation?.id}?limit=50`),
    enabled: !!selectedConversation,
  })

  const sendMessageMutation = useMutation({
    mutationFn: (content: string) => api.post(`/api/messages/${selectedConversation?.id}`, { content }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['messages'] }); queryClient.invalidateQueries({ queryKey: ['conversations'] }); setNewMessage('') },
    onError: () => toast.error('Erro ao enviar mensagem'),
  })

  const createConvMutation = useMutation({
    mutationFn: (values: Record<string, unknown>) => api.post('/api/messages', values),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['conversations'] }); toast.success('Conversa criada!'); setNewConvOpen(false) },
    onError: () => toast.error('Erro ao criar conversa'),
  })

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages?.data])

  const handleSend = () => {
    if (!newMessage.trim()) return
    sendMessageMutation.mutate(newMessage.trim())
  }

  const getOtherParticipant = (conv: Record<string, unknown>) => {
    const participants = conv.participants as Array<Record<string, unknown>>
    return participants?.find((p) => (p.user as Record<string, unknown>)?.id !== user?.id)
  }

  const other = selectedConversation ? getOtherParticipant(selectedConversation) : null
  const convMessages = (messages?.data || []) as Array<Record<string, unknown>>

  const newConvFields: FormField[] = [
    { type: 'text', name: 'participantIds', label: 'IDs dos Participantes', placeholder: 'IDs separados por vírgula', required: true },
    { type: 'text', name: 'title', label: 'Título (opcional)' },
  ]

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Mensagens</h2>
          <p className="text-sm text-slate-500">Converse com colegas e professores</p>
        </div>
        <Button onClick={() => setNewConvOpen(true)} className="bg-emerald-600 hover:bg-emerald-700 text-white">
          <Plus className="h-4 w-4 mr-2" /> Nova Conversa
        </Button>
      </div>

      <Card className="border-slate-200 shadow-sm overflow-hidden" style={{ height: 'calc(100vh - 220px)', minHeight: '500px' }}>
        <div className="flex h-full">
          {/* Conversations List */}
          <div className={`w-full sm:w-80 border-r border-slate-200 flex flex-col ${selectedConversation ? 'hidden sm:flex' : 'flex'}`}>
            <div className="p-3 border-b border-slate-200">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input placeholder="Buscar conversas..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9 h-9" />
              </div>
            </div>
            <ScrollArea className="flex-1">
              {(conversations?.data || []).map((conv: Record<string, unknown>) => {
                const otherP = getOtherParticipant(conv)
                const lastMsg = (conv.messages as Array<Record<string, unknown>>)?.[0]
                const isSelected = selectedConversation?.id === conv.id
                return (
                  <button
                    key={conv.id as string}
                    onClick={() => setSelectedConversation(conv)}
                    className={`w-full flex items-center gap-3 p-3 border-b border-slate-100 text-left transition-colors ${isSelected ? 'bg-emerald-50' : 'hover:bg-slate-50'}`}
                  >
                    <Avatar className="h-10 w-10 flex-shrink-0">
                      <AvatarFallback className="bg-emerald-100 text-emerald-700 text-sm">
                        {(otherP?.user as Record<string, unknown>)?.name?.charAt(0)?.toUpperCase() || '?'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-slate-900 truncate">
                          {(otherP?.user as Record<string, unknown>)?.name || conv.title || 'Conversa'}
                        </p>
                        {lastMsg && (
                          <span className="text-xs text-slate-400">
                            {format(parseISO(lastMsg.createdAt as string), 'HH:mm')}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 truncate">
                        {lastMsg ? (lastMsg.content as string).substring(0, 40) + '...' : 'Nenhuma mensagem'}
                      </p>
                    </div>
                  </button>
                )
              })}
            </ScrollArea>
          </div>

          {/* Messages Area */}
          <div className={`flex-1 flex flex-col ${selectedConversation ? 'flex' : 'hidden sm:flex'}`}>
            {selectedConversation ? (
              <>
                {/* Header */}
                <div className="p-3 border-b border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" className="h-8 w-8 sm:hidden" onClick={() => setSelectedConversation(null)}>
                      ←
                    </Button>
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-emerald-100 text-emerald-700 text-xs">
                        {(other?.user as Record<string, unknown>)?.name?.charAt(0)?.toUpperCase() || '?'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium text-slate-900">
                        {(other?.user as Record<string, unknown>)?.name || (selectedConversation.title as string) || 'Conversa'}
                      </p>
                      <p className="text-xs text-slate-500">
                        {selectedConversation.type === 'direct' ? 'Mensagem direta' : 'Grupo'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Messages */}
                <ScrollArea className="flex-1 p-4">
                  <div className="space-y-3">
                    {convMessages.length === 0 && (
                      <div className="text-center py-8 text-slate-400">
                        <MessageSquare className="h-10 w-10 mx-auto mb-2 opacity-30" />
                        <p className="text-sm">Nenhuma mensagem ainda. Diga olá!</p>
                      </div>
                    )}
                    {convMessages.map((msg: Record<string, unknown>) => {
                      const isOwn = (msg.sender as Record<string, unknown>)?.id === user?.id
                      return (
                        <div key={msg.id as string} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-[75%] ${isOwn ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-900'} rounded-2xl px-4 py-2`}>
                            {!isOwn && (
                              <p className="text-xs font-medium mb-0.5 opacity-80">
                                {(msg.sender as Record<string, unknown>)?.name}
                              </p>
                            )}
                            <p className="text-sm">{msg.content as string}</p>
                            <p className={`text-[10px] mt-1 ${isOwn ? 'text-emerald-200' : 'text-slate-400'}`}>
                              {format(parseISO(msg.createdAt as string), 'HH:mm')}
                            </p>
                          </div>
                        </div>
                      )
                    })}
                    <div ref={messagesEndRef} />
                  </div>
                </ScrollArea>

                {/* Input */}
                <div className="p-3 border-t border-slate-200">
                  <div className="flex items-center gap-2">
                    <Input
                      placeholder="Digite sua mensagem..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
                      className="flex-1"
                    />
                    <Button onClick={handleSend} className="bg-emerald-600 hover:bg-emerald-700 text-white" disabled={!newMessage.trim() || sendMessageMutation.isPending}>
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-slate-400">
                <div className="text-center">
                  <MessageSquare className="h-16 w-16 mx-auto mb-3 opacity-20" />
                  <p className="text-lg font-medium">Mensagens</p>
                  <p className="text-sm">Selecione uma conversa para começar</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </Card>

      <FormDialog open={newConvOpen} onOpenChange={setNewConvOpen} title="Nova Conversa" description="Inicie uma nova conversa" fields={newConvFields} onSubmit={(values) => createConvMutation.mutate({ participantIds: (values.participantIds as string).split(',').map(s => s.trim()), title: values.title })} isLoading={createConvMutation.isPending} submitLabel="Criar" />
    </div>
  )
}
