'use client'

import { useState, useRef, useEffect } from 'react'
import { useMutation } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Brain, Send, Loader2, Bot, User, Lightbulb } from 'lucide-react'
import { toast } from 'sonner'
import { format } from 'date-fns'
import ReactMarkdown from 'react-markdown'

interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  type?: string
  createdAt: Date
}

const suggestionTypes = [
  { value: 'schedule_suggestion', label: 'Agendamento', description: 'Sugestões de horários', icon: '📅' },
  { value: 'conflict_detection', label: 'Conflitos', description: 'Detectar conflitos', icon: '⚠️' },
  { value: 'dropout_prediction', label: 'Evasão', description: 'Previsão de evasão', icon: '📊' },
  { value: 'academic_assistant', label: 'Assistente', description: 'Perguntas gerais', icon: '🎓' },
  { value: 'auto_report', label: 'Relatório', description: 'Gerar relatório', icon: '📋' },
]

const samplePrompts: Record<string, string> = {
  schedule_suggestion: 'Sugira uma distribuição de horários otimizada para as disciplinas do semestre atual, considerando a disponibilidade dos professores e a capacidade das salas.',
  conflict_detection: 'Analise o cronograma atual e identifique possíveis conflitos de horários entre professores, salas e turmas.',
  dropout_prediction: 'Analise os dados de frequência e notas dos alunos para identificar aqueles com maior risco de evasão no semestre atual.',
  academic_assistant: 'Quais são as disciplinas com maior taxa de reprovação e quais medidas podem ser tomadas para melhorar?',
  auto_report: 'Gere um resumo acadêmico do semestre atual, incluindo estatísticas de frequência, notas e ocupação das salas.',
}

export function AiAssistantView() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [selectedType, setSelectedType] = useState('academic_assistant')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const aiMutation = useMutation({
    mutationFn: async ({ type, prompt }: { type: string; prompt: string }) => {
      setIsLoading(true)
      return api.post('/api/ai', { type, prompt })
    },
    onSuccess: (data) => {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          role: 'assistant',
          content: data.data?.response || data.response || 'Sem resposta',
          type: selectedType,
          createdAt: new Date(),
        },
      ])
      setIsLoading(false)
    },
    onError: () => {
      toast.error('Erro ao gerar resposta')
      setIsLoading(false)
    },
  })

  const handleSend = (customPrompt?: string) => {
    const prompt = customPrompt || input.trim()
    if (!prompt) return

    setMessages((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        role: 'user',
        content: prompt,
        type: selectedType,
        createdAt: new Date(),
      },
    ])

    aiMutation.mutate({ type: selectedType, prompt })
    setInput('')
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold text-slate-900">Assistente IA</h2>
        <p className="text-sm text-slate-500">Obtenha insights inteligentes sobre sua gestão acadêmica</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Suggestion Types */}
        <div className="lg:col-span-1 space-y-3">
          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-slate-900 flex items-center gap-2">
                <Lightbulb className="h-4 w-4 text-amber-500" />
                Tipos de Análise
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {suggestionTypes.map((t) => (
                <button
                  key={t.value}
                  onClick={() => setSelectedType(t.value)}
                  className={`w-full text-left p-3 rounded-lg border transition-colors ${
                    selectedType === t.value
                      ? 'border-emerald-500 bg-emerald-50'
                      : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{t.icon}</span>
                    <div>
                      <p className="text-sm font-medium text-slate-900">{t.label}</p>
                      <p className="text-xs text-slate-500">{t.description}</p>
                    </div>
                  </div>
                </button>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Chat Area */}
        <Card className="lg:col-span-3 border-slate-200 shadow-sm overflow-hidden" style={{ height: 'calc(100vh - 220px)', minHeight: '500px' }}>
          <CardHeader className="pb-2 border-b border-slate-200">
            <CardTitle className="text-sm text-slate-900 flex items-center gap-2">
              <Brain className="h-4 w-4 text-emerald-600" />
              ORKESTRANDO AI
              <Badge className="bg-emerald-100 text-emerald-700 ml-auto">
                {suggestionTypes.find((t) => t.value === selectedType)?.label}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 flex flex-col" style={{ height: 'calc(100% - 52px)' }}>
            <ScrollArea className="flex-1 p-4">
              {messages.length === 0 ? (
                <div className="text-center py-12">
                  <Brain className="h-16 w-16 mx-auto mb-4 text-emerald-200" />
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">Como posso ajudar?</h3>
                  <p className="text-sm text-slate-500 mb-6">Selecione um tipo de análise ou digite sua pergunta</p>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {suggestionTypes.map((t) => (
                      <Button
                        key={t.value}
                        variant="outline"
                        size="sm"
                        onClick={() => handleSend(samplePrompts[t.value])}
                        className="text-xs"
                      >
                        {t.icon} {t.label}
                      </Button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {messages.map((msg) => (
                    <div key={msg.id} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                      <div className={`rounded-full p-2 flex-shrink-0 ${msg.role === 'user' ? 'bg-slate-200' : 'bg-emerald-100'}`}>
                        {msg.role === 'user' ? <User className="h-4 w-4 text-slate-600" /> : <Bot className="h-4 w-4 text-emerald-600" />}
                      </div>
                      <div className={`max-w-[80%] ${msg.role === 'user' ? 'text-right' : ''}`}>
                        <div className={`rounded-2xl px-4 py-3 inline-block text-left ${msg.role === 'user' ? 'bg-slate-100 text-slate-900' : 'bg-emerald-50 text-slate-900'}`}>
                          <div className="prose prose-sm max-w-none">
                            <ReactMarkdown>{msg.content}</ReactMarkdown>
                          </div>
                        </div>
                        <p className="text-xs text-slate-400 mt-1">{format(msg.createdAt, 'HH:mm')}</p>
                      </div>
                    </div>
                  ))}
                  {isLoading && (
                    <div className="flex gap-3">
                      <div className="rounded-full p-2 bg-emerald-100">
                        <Bot className="h-4 w-4 text-emerald-600" />
                      </div>
                      <div className="bg-emerald-50 rounded-2xl px-4 py-3">
                        <div className="flex items-center gap-2 text-sm text-slate-500">
                          <Loader2 className="h-4 w-4 animate-spin text-emerald-600" />
                          Pensando...
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </ScrollArea>

            {/* Input */}
            <div className="p-4 border-t border-slate-200">
              <div className="flex gap-2">
                <Textarea
                  placeholder="Digite sua pergunta ou instrução..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault()
                      handleSend()
                    }
                  }}
                  className="flex-1 min-h-[44px] max-h-32 resize-none"
                  rows={1}
                />
                <Button
                  onClick={() => handleSend()}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white"
                  disabled={!input.trim() || isLoading}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
