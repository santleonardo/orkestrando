'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FileText,
  Download,
  Search,
  Upload,
  Filter,
  FileSpreadsheet,
  Presentation,
  FileArchive,
  Music,
  Video,
  Image,
  File,
  FolderOpen,
  ChevronRight,
  X,
  Plus,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
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
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { ScrollArea } from '@/components/ui/scroll-area'
import { formatFileSize } from '@/lib/utils/format'

// ── Types ──
interface Material {
  id: string
  title: string
  description: string
  type: 'pdf' | 'docx' | 'xlsx' | 'pptx' | 'mp3' | 'mp4' | 'image' | 'zip' | 'other'
  uploadDate: string
  size: number
  subject: string
}

interface SubjectItem {
  id: string
  name: string
  code: string
  teacher: string
  materialCount: number
}

// ── Mock Data ──
const SUBJECTS: SubjectItem[] = [
  { id: '1', name: 'Teoria Musical', code: 'MUS101', teacher: 'Prof. Carlos Eduardo Silva', materialCount: 8 },
  { id: '2', name: 'Instrumento — Piano', code: 'MUS102', teacher: 'Prof. Ana Paula Souza', materialCount: 5 },
  { id: '3', name: 'Coral', code: 'MUS103', teacher: 'Prof. Roberto Lima', materialCount: 3 },
  { id: '4', name: 'História da Música', code: 'MUS104', teacher: 'Prof. Roberto Lima', materialCount: 6 },
  { id: '5', name: 'Composição', code: 'MUS105', teacher: 'Prof. João Pedro Oliveira', materialCount: 4 },
  { id: '6', name: 'Percepção Musical', code: 'MUS106', teacher: 'Prof. Maria Fernanda Costa', materialCount: 7 },
]

const MATERIALS: Material[] = [
  { id: '1', title: 'Apostila de Teoria Musical v3', description: 'Material completo do módulo 3 incluindo exercícios práticos de harmonia e análise.', type: 'pdf', uploadDate: '2025-01-15T10:30:00', size: 4521984, subject: 'Teoria Musical' },
  { id: '2', title: 'Exercícios — Módulo 2', description: 'Lista de exercícios sobre escalas maiores e menores.', type: 'pdf', uploadDate: '2025-01-13T14:00:00', size: 1208448, subject: 'Teoria Musical' },
  { id: '3', title: 'Partituras — Beethoven Sonatas', description: 'Coletânea de sonatas para piano de Ludwig van Beethoven.', type: 'pdf', uploadDate: '2025-01-10T09:00:00', size: 8912896, subject: 'Instrumento — Piano' },
  { id: '4', title: 'Gravação — Chopin Nocturnes', description: 'Referências em áudio dos Nocturnes de Chopin para estudo.', type: 'mp3', uploadDate: '2025-01-08T16:00:00', size: 31457280, subject: 'Instrumento — Piano' },
  { id: '5', title: 'Repertório Coral — Semestre 3', description: 'Partituras completas do repertório do semestre atual.', type: 'pdf', uploadDate: '2025-01-06T11:00:00', size: 6291456, subject: 'Coral' },
  { id: '6', title: 'Apostila de História da Música', description: 'Material abrangente sobre a história da música ocidental.', type: 'pdf', uploadDate: '2025-01-04T08:30:00', size: 7340032, subject: 'História da Música' },
  { id: '7', title: 'Exercícios de Composição II', description: 'Exercícios de contraponto e harmonia avançada.', type: 'docx', uploadDate: '2025-01-02T13:00:00', size: 524288, subject: 'Composição' },
  { id: '8', title: 'Planilha de Notas — Harmonia', description: 'Planilha de controle de notas das atividades práticas.', type: 'xlsx', uploadDate: '2024-12-28T10:00:00', size: 104857, subject: 'Composição' },
  { id: '9', title: 'Slides — Percepção Auditiva', description: 'Apresentação sobre técnicas de percepção auditiva.', type: 'pptx', uploadDate: '2024-12-20T15:00:00', size: 3670016, subject: 'Percepção Musical' },
  { id: '10', title: 'Exercícios de Ditado Musical', description: 'Arquivo de áudio com ditados musicais para prática.', type: 'mp3', uploadDate: '2024-12-18T09:00:00', size: 15728640, subject: 'Percepção Musical' },
  { id: '11', title: 'Vídeo Aula — Análise Formal', description: 'Gravação da aula sobre análise formal de peças musicais.', type: 'mp4', uploadDate: '2024-12-15T14:00:00', size: 209715200, subject: 'História da Música' },
  { id: '12', title: 'Partituras Coral — Bach', description: 'Cantatas de J.S. Bach para o coral.', type: 'zip', uploadDate: '2024-12-10T11:00:00', size: 15728640, subject: 'Coral' },
]

function getTypeIcon(type: string) {
  switch (type) {
    case 'pdf': return FileText
    case 'docx': return FileText
    case 'xlsx': return FileSpreadsheet
    case 'pptx': return Presentation
    case 'mp3': return Music
    case 'mp4': return Video
    case 'image': return Image
    case 'zip': return FileArchive
    default: return File
  }
}

function getTypeBgColor(type: string) {
  switch (type) {
    case 'pdf': return 'bg-red-50 text-red-500'
    case 'docx': return 'bg-blue-50 text-blue-500'
    case 'xlsx': return 'bg-green-50 text-green-500'
    case 'pptx': return 'bg-orange-50 text-orange-500'
    case 'mp3': return 'bg-purple-50 text-purple-500'
    case 'mp4': return 'bg-pink-50 text-pink-500'
    case 'image': return 'bg-cyan-50 text-cyan-500'
    case 'zip': return 'bg-amber-50 text-amber-500'
    default: return 'bg-gray-50 text-gray-500'
  }
}

function getTypeLabel(type: string) {
  const labels: Record<string, string> = {
    pdf: 'PDF', docx: 'Word', xlsx: 'Excel', pptx: 'PowerPoint',
    mp3: 'Áudio', mp4: 'Vídeo', image: 'Imagem', zip: 'ZIP', other: 'Outro'
  }
  return labels[type] || type
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr)
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })
}

export default function MaterialsPage() {
  const [selectedSubject, setSelectedSubject] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false)

  const filteredMaterials = MATERIALS.filter((m) => {
    const matchSubject = selectedSubject === 'all' || m.subject === selectedSubject
    const matchSearch = searchQuery === '' ||
      m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchType = typeFilter === 'all' || m.type === typeFilter
    return matchSubject && matchSearch && matchType
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Materiais Didáticos</h1>
          <p className="text-sm text-muted-foreground">Acesse materiais e recursos das suas disciplinas</p>
        </div>
        <Button size="sm" className="gap-2 bg-teal-600 hover:bg-teal-700" onClick={() => setUploadDialogOpen(true)}>
          <Upload className="h-4 w-4" />
          Enviar Trabalho
        </Button>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar — Subject List */}
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:w-72 shrink-0"
        >
          <Card className="h-fit">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <FolderOpen className="h-4 w-4" />
                Disciplinas
              </CardTitle>
            </CardHeader>
            <CardContent className="p-2">
              <ScrollArea className="max-h-[500px]">
                <button
                  onClick={() => setSelectedSubject('all')}
                  className={`w-full text-left px-3 py-2.5 rounded-lg text-sm transition-colors ${
                    selectedSubject === 'all'
                      ? 'bg-teal-50 text-teal-700 font-semibold dark:bg-teal-950 dark:text-teal-300'
                      : 'text-muted-foreground hover:bg-muted'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span>Todas as Disciplinas</span>
                    <Badge variant="secondary" className="text-[10px]">{MATERIALS.length}</Badge>
                  </div>
                </button>
                {SUBJECTS.map((subject) => (
                  <button
                    key={subject.id}
                    onClick={() => setSelectedSubject(subject.name)}
                    className={`w-full text-left px-3 py-2.5 rounded-lg text-sm transition-colors ${
                      selectedSubject === subject.name
                        ? 'bg-teal-50 text-teal-700 font-semibold dark:bg-teal-950 dark:text-teal-300'
                        : 'text-muted-foreground hover:bg-muted'
                    }`}
                  >
                    <div>
                      <p className="font-medium">{subject.name}</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">{subject.code} — {subject.teacher}</p>
                    </div>
                    <Badge variant="secondary" className="text-[10px] mt-1">{subject.materialCount}</Badge>
                  </button>
                ))}
              </ScrollArea>
            </CardContent>
          </Card>
        </motion.div>

        {/* Main Content — Materials List */}
        <motion.div
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="flex-1 min-w-0"
        >
          {/* Search and Filters */}
          <Card className="mb-4">
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar materiais..."
                    className="pl-9"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os tipos</SelectItem>
                    <SelectItem value="pdf">PDF</SelectItem>
                    <SelectItem value="docx">Word</SelectItem>
                    <SelectItem value="xlsx">Excel</SelectItem>
                    <SelectItem value="pptx">PowerPoint</SelectItem>
                    <SelectItem value="mp3">Áudio</SelectItem>
                    <SelectItem value="mp4">Vídeo</SelectItem>
                    <SelectItem value="zip">ZIP</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Materials List */}
          <AnimatePresence mode="popLayout">
            {filteredMaterials.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <Card>
                  <CardContent className="py-16 text-center">
                    <FileText className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
                    <p className="text-lg font-medium text-muted-foreground">Nenhum material encontrado</p>
                    <p className="text-sm text-muted-foreground mt-1">Tente ajustar os filtros ou a busca</p>
                  </CardContent>
                </Card>
              </motion.div>
            ) : (
              <div className="space-y-3">
                {filteredMaterials.map((material, i) => {
                  const IconComponent = getTypeIcon(material.type)
                  const iconBg = getTypeBgColor(material.type)
                  return (
                    <motion.div
                      key={material.id}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ delay: i * 0.03 }}
                    >
                      <Card className="hover:shadow-md transition-shadow">
                        <CardContent className="p-4">
                          <div className="flex items-start gap-4">
                            {/* Icon */}
                            <div className={`flex h-11 w-11 items-center justify-center rounded-xl shrink-0 ${iconBg}`}>
                              <IconComponent className="h-5 w-5" />
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2">
                                <div className="min-w-0">
                                  <h3 className="text-sm font-semibold truncate">{material.title}</h3>
                                  <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{material.description}</p>
                                </div>
                                <div className="flex items-center gap-2 shrink-0">
                                  <Badge variant="secondary" className="text-[10px]">
                                    {getTypeLabel(material.type)}
                                  </Badge>
                                  <Button variant="ghost" size="icon" className="h-8 w-8">
                                    <Download className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                              <div className="flex items-center gap-3 mt-2 text-[11px] text-muted-foreground">
                                <span>{material.subject}</span>
                                <span className="text-muted-foreground/40">•</span>
                                <span>{formatDate(material.uploadDate)}</span>
                                <span className="text-muted-foreground/40">•</span>
                                <span>{formatFileSize(material.size)}</span>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  )
                })}
              </div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Upload Assignment Dialog */}
      <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Enviar Trabalho</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Disciplina</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a disciplina" />
                </SelectTrigger>
                <SelectContent>
                  {SUBJECTS.map((s) => (
                    <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Título</Label>
              <Input placeholder="Nome do trabalho" />
            </div>
            <div className="space-y-2">
              <Label>Descrição (opcional)</Label>
              <Textarea placeholder="Descreva o conteúdo enviado..." rows={3} />
            </div>
            <div className="space-y-2">
              <Label>Arquivo</Label>
              <div className="border-2 border-dashed rounded-lg p-6 text-center hover:bg-muted/50 transition-colors cursor-pointer">
                <Upload className="h-8 w-8 text-muted-foreground/50 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Clique ou arraste o arquivo aqui</p>
                <p className="text-xs text-muted-foreground mt-1">PDF, DOCX, PPTX, ZIP — máx. 50MB</p>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setUploadDialogOpen(false)}>Cancelar</Button>
            <Button className="bg-teal-600 hover:bg-teal-700">Enviar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
