'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FileText,
  Upload,
  Download,
  Search,
  Filter,
  Eye,
  Trash2,
  FileSpreadsheet,
  FileImage,
  FileVideo,
  FileAudio,
  FileArchive,
  FileType,
  ChevronRight,
  FolderOpen,
  Clock,
  HardDrive,
  Plus,
  MoreVertical,
  RefreshCw,
  X,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Progress } from '@/components/ui/progress'
import { formatFileSize, formatRelativeTime } from '@/lib/utils/format'
import { MATERIAL_TYPE_LABELS } from '@/lib/constants'
import type { MaterialType } from '@/lib/types'

const FILE_ICONS: Record<MaterialType, React.ElementType> = {
  pdf: FileText,
  docx: FileType,
  xlsx: FileSpreadsheet,
  pptx: FileText,
  mp3: FileAudio,
  mp4: FileVideo,
  image: FileImage,
  zip: FileArchive,
  other: FileType,
}

const FILE_COLORS: Record<MaterialType, string> = {
  pdf: 'text-red-500 bg-red-50',
  docx: 'text-blue-500 bg-blue-50',
  xlsx: 'text-emerald-500 bg-emerald-50',
  pptx: 'text-orange-500 bg-orange-50',
  mp3: 'text-purple-500 bg-purple-50',
  mp4: 'text-pink-500 bg-pink-50',
  image: 'text-teal-500 bg-teal-50',
  zip: 'text-amber-500 bg-amber-50',
  other: 'text-slate-500 bg-slate-50',
}

interface MockMaterial {
  id: string
  title: string
  description: string
  materialType: MaterialType
  fileName: string
  fileSize: number
  version: number
  downloadCount: number
  uploadedByName: string
  uploadedAt: string
  className: string
  subjectName: string
  lesson?: string
  tags: string[]
}

const MOCK_CLASSES = [
  { id: '1', name: 'Música - Turma 2025/1' },
  { id: '2', name: 'Teatro - Turma 2025/1' },
  { id: '3', name: 'Dança - Turma 2025/2' },
  { id: '4', name: 'Artes Visuais - Turma 2025/1' },
]

const MOCK_MATERIALS: MockMaterial[] = [
  {
    id: '1', title: 'Apostila de Teoria Musical', description: 'Material completo de teoria musical para o 1º semestre',
    materialType: 'pdf', fileName: 'teoria-musical-v3.pdf', fileSize: 15728640, version: 3,
    downloadCount: 45, uploadedByName: 'Prof. Carlos Silva', uploadedAt: '2025-01-15T10:30:00',
    className: 'Música - Turma 2025/1', subjectName: 'Teoria Musical', lesson: 'Aula 1-10',
    tags: ['teoria', 'fundamentos'],
  },
  {
    id: '2', title: 'Exercícios Práticos - Módulo 2', description: 'Lista de exercícios para prática em sala',
    materialType: 'pdf', fileName: 'exercicios-modulo2.pdf', fileSize: 2097152, version: 1,
    downloadCount: 32, uploadedByName: 'Prof. Carlos Silva', uploadedAt: '2025-01-20T14:00:00',
    className: 'Música - Turma 2025/1', subjectName: 'Teoria Musical', lesson: 'Aula 5',
    tags: ['exercícios'],
  },
  {
    id: '3', title: 'Partituras - Beethoven', description: 'Coleção de partituras para estudo',
    materialType: 'pdf', fileName: 'partituras-beethoven.zip', fileSize: 52428800, version: 2,
    downloadCount: 28, uploadedByName: 'Prof. Ana Beatriz', uploadedAt: '2025-01-18T09:00:00',
    className: 'Música - Turma 2025/1', subjectName: 'Instrumento', lesson: 'Aula 3',
    tags: ['partituras', 'clássico'],
  },
  {
    id: '4', title: 'Apresentação - História do Teatro', description: 'Slides sobre a evolução do teatro ocidental',
    materialType: 'pptx', fileName: 'historia-teatro.pptx', fileSize: 8388608, version: 1,
    downloadCount: 19, uploadedByName: 'Prof. Roberto Lima', uploadedAt: '2025-01-22T11:00:00',
    className: 'Teatro - Turma 2025/1', subjectName: 'História do Teatro', lesson: 'Aula 1-5',
    tags: ['apresentação', 'história'],
  },
  {
    id: '5', title: 'Gravação de Aula - Improvisação', description: 'Áudio da aula de improvisação teatral',
    materialType: 'mp3', fileName: 'improvisacao-aula3.mp3', fileSize: 31457280, version: 1,
    downloadCount: 12, uploadedByName: 'Prof. Roberto Lima', uploadedAt: '2025-01-25T16:00:00',
    className: 'Teatro - Turma 2025/1', subjectName: 'Interpretação', lesson: 'Aula 3',
    tags: ['áudio', 'improvisação'],
  },
  {
    id: '6', title: 'Planilha de Notas - Dança', description: 'Planilha de controle de notas e frequência',
    materialType: 'xlsx', fileName: 'notas-danca-2025.xlsx', fileSize: 524288, version: 4,
    downloadCount: 8, uploadedByName: 'Prof. Juliana Costa', uploadedAt: '2025-01-28T08:00:00',
    className: 'Dança - Turma 2025/2', subjectName: 'Ballet Clássico', lesson: undefined,
    tags: ['notas', 'frequência'],
  },
  {
    id: '7', title: 'Vídeo - Técnica de Dança Contemporânea', description: 'Demonstração de técnicas básicas',
    materialType: 'mp4', fileName: 'tecnica-contemporanea.mp4', fileSize: 157286400, version: 1,
    downloadCount: 22, uploadedByName: 'Prof. Juliana Costa', uploadedAt: '2025-01-30T13:00:00',
    className: 'Dança - Turma 2025/2', subjectName: 'Dança Contemporânea', lesson: 'Aula 2',
    tags: ['vídeo', 'técnica'],
  },
  {
    id: '8', title: 'Referências Visuais - Pintura', description: 'Catálogo de obras para estudo',
    materialType: 'image', fileName: 'referencias-pintura.zip', fileSize: 73400320, version: 1,
    downloadCount: 15, uploadedByName: 'Prof. Ana Beatriz', uploadedAt: '2025-02-01T10:00:00',
    className: 'Artes Visuais - Turma 2025/1', subjectName: 'Pintura', lesson: 'Aula 1',
    tags: ['imagens', 'referência'],
  },
]

const MOCK_VERSIONS: Record<string, Array<{ version: number; uploadedBy: string; uploadedAt: string; changelog: string }>> = {
  '1': [
    { version: 3, uploadedBy: 'Prof. Carlos Silva', uploadedAt: '2025-01-15T10:30:00', changelog: 'Adicionados novos capítulos sobre harmonia' },
    { version: 2, uploadedBy: 'Prof. Carlos Silva', uploadedAt: '2024-12-10T09:00:00', changelog: 'Correções e revisão geral' },
    { version: 1, uploadedBy: 'Prof. Carlos Silva', uploadedAt: '2024-10-01T14:00:00', changelog: 'Versão inicial' },
  ],
  '6': [
    { version: 4, uploadedBy: 'Prof. Juliana Costa', uploadedAt: '2025-01-28T08:00:00', changelog: 'Atualização de notas do 1º bimestre' },
    { version: 3, uploadedBy: 'Prof. Juliana Costa', uploadedAt: '2025-01-15T08:00:00', changelog: 'Correção de fórmulas' },
    { version: 2, uploadedBy: 'Prof. Juliana Costa', uploadedAt: '2025-01-01T08:00:00', changelog: 'Novas colunas de frequência' },
    { version: 1, uploadedBy: 'Prof. Juliana Costa', uploadedAt: '2024-11-01T08:00:00', changelog: 'Versão inicial' },
  ],
}

export default function MaterialsPage() {
  const [selectedClass, setSelectedClass] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedMaterial, setSelectedMaterial] = useState<MockMaterial | null>(null)
  const [showVersionHistory, setShowVersionHistory] = useState(false)
  const [isDragging, setIsDragging] = useState(false)

  const filteredMaterials = MOCK_MATERIALS.filter((m) => {
    if (selectedClass !== 'all' && m.className !== MOCK_CLASSES.find(c => c.id === selectedClass)?.name) return false
    if (searchQuery && !m.title.toLowerCase().includes(searchQuery.toLowerCase()) && !m.description.toLowerCase().includes(searchQuery.toLowerCase())) return false
    return true
  })

  const totalSize = MOCK_MATERIALS.reduce((acc, m) => acc + m.fileSize, 0)
  const totalDownloads = MOCK_MATERIALS.reduce((acc, m) => acc + m.downloadCount, 0)

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Materiais</h1>
          <p className="text-muted-foreground">Gerencie materiais didáticos e recursos</p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="gap-2 bg-emerald-600 hover:bg-emerald-700">
              <Plus className="h-4 w-4" />
              Novo Material
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Upload de Material</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer ${
                  isDragging ? 'border-emerald-500 bg-emerald-50' : 'border-muted-foreground/25 hover:border-emerald-500/50'
                }`}
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={(e) => { e.preventDefault(); setIsDragging(false) }}
              >
                <Upload className={`h-10 w-10 mx-auto mb-3 ${isDragging ? 'text-emerald-500' : 'text-muted-foreground/40'}`} />
                <p className="text-sm font-medium">Arraste arquivos aqui ou clique para selecionar</p>
                <p className="text-xs text-muted-foreground mt-1">PDF, DOCX, XLSX, PPTX, MP3, MP4, imagens (máx. 50MB)</p>
              </div>
              <Input placeholder="Nome do material" />
              <Input placeholder="Descrição (opcional)" />
              <Select>
                <SelectTrigger><SelectValue placeholder="Selecionar turma" /></SelectTrigger>
                <SelectContent>
                  {MOCK_CLASSES.map(c => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button className="w-full bg-emerald-600 hover:bg-emerald-700">
                <Upload className="h-4 w-4 mr-2" />
                Enviar Arquivo
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-4">
        {[
          { label: 'Total de Materiais', value: MOCK_MATERIALS.length, icon: FolderOpen, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Tamanho Total', value: formatFileSize(totalSize), icon: HardDrive, color: 'text-violet-600', bg: 'bg-violet-50' },
          { label: 'Downloads', value: totalDownloads, icon: Download, color: 'text-amber-600', bg: 'bg-amber-50' },
          { label: 'Turmas Ativas', value: MOCK_CLASSES.length, icon: ChevronRight, color: 'text-rose-600', bg: 'bg-rose-50' },
        ].map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${stat.bg}`}>
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-xl font-bold">{stat.value}</p>
                  <p className="text-[11px] text-muted-foreground">{stat.label}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[200px] max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar materiais..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 h-9"
              />
            </div>
            <Select value={selectedClass} onValueChange={setSelectedClass}>
              <SelectTrigger className="h-9 w-52">
                <SelectValue placeholder="Turma" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas Turmas</SelectItem>
                {MOCK_CLASSES.map(c => (
                  <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Materials List */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Materiais ({filteredMaterials.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="max-h-[600px]">
            <div className="divide-y">
              <AnimatePresence>
                {filteredMaterials.map((material, i) => {
                  const FileIcon = FILE_ICONS[material.materialType] || FileType
                  const fileColor = FILE_COLORS[material.materialType] || FILE_COLORS.other
                  return (
                    <motion.div
                      key={material.id}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.03 }}
                      className="flex items-center gap-4 p-4 hover:bg-muted/30 transition-colors cursor-pointer"
                      onClick={() => setSelectedMaterial(material)}
                    >
                      <div className={`flex h-11 w-11 items-center justify-center rounded-lg shrink-0 ${fileColor}`}>
                        <FileIcon className="h-5 w-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-medium truncate">{material.title}</h3>
                          <Badge variant="outline" className="text-[10px] shrink-0">
                            v{material.version}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground truncate mt-0.5">
                          {material.className} • {material.subjectName}
                          {material.lesson && ` • ${material.lesson}`}
                        </p>
                        <div className="flex items-center gap-3 mt-1 text-[10px] text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatRelativeTime(material.uploadedAt)}
                          </span>
                          <span>{formatFileSize(material.fileSize)}</span>
                          <span className="flex items-center gap-1">
                            <Download className="h-3 w-3" />
                            {material.downloadCount}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => { e.stopPropagation() }}>
                          <Download className="h-4 w-4" />
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => e.stopPropagation()}>
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Eye className="h-4 w-4 mr-2" />
                              Visualizar
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <RefreshCw className="h-4 w-4 mr-2" />
                              Histórico de Versões
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Download className="h-4 w-4 mr-2" />
                              Download
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive">
                              <Trash2 className="h-4 w-4 mr-2" />
                              Excluir
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </motion.div>
                  )
                })}
              </AnimatePresence>
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Material Detail Dialog */}
      <Dialog open={!!selectedMaterial && !showVersionHistory} onOpenChange={() => setSelectedMaterial(null)}>
        <DialogContent className="sm:max-w-lg">
          {selectedMaterial && (
            <>
              <DialogHeader>
                <DialogTitle>{selectedMaterial.title}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-muted-foreground text-xs">Tipo</p>
                    <p className="font-medium">{MATERIAL_TYPE_LABELS[selectedMaterial.materialType]}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs">Tamanho</p>
                    <p className="font-medium">{formatFileSize(selectedMaterial.fileSize)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs">Versão</p>
                    <p className="font-medium">v{selectedMaterial.version}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs">Downloads</p>
                    <p className="font-medium">{selectedMaterial.downloadCount}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs">Turma</p>
                    <p className="font-medium">{selectedMaterial.className}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs">Disciplina</p>
                    <p className="font-medium">{selectedMaterial.subjectName}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs">Enviado por</p>
                    <p className="font-medium">{selectedMaterial.uploadedByName}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs">Data de Envio</p>
                    <p className="font-medium">{formatRelativeTime(selectedMaterial.uploadedAt)}</p>
                  </div>
                </div>
                {selectedMaterial.description && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Descrição</p>
                    <p className="text-sm">{selectedMaterial.description}</p>
                  </div>
                )}
                {selectedMaterial.tags.length > 0 && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-1.5">Tags</p>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedMaterial.tags.map(tag => (
                        <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
                      ))}
                    </div>
                  </div>
                )}
                {MOCK_VERSIONS[selectedMaterial.id] && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-1.5">Histórico de Versões</p>
                    <div className="space-y-2">
                      {MOCK_VERSIONS[selectedMaterial.id].map(v => (
                        <div key={v.version} className="flex items-center gap-2 text-xs p-2 rounded bg-muted/50">
                          <Badge variant="outline" className="text-[10px]">v{v.version}</Badge>
                          <div className="flex-1 min-w-0">
                            <p className="truncate">{v.changelog}</p>
                            <p className="text-muted-foreground">{v.uploadedBy} • {formatRelativeTime(v.uploadedAt)}</p>
                          </div>
                          <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0">
                            <Download className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                <div className="flex gap-2">
                  <Button className="flex-1 gap-2 bg-emerald-600 hover:bg-emerald-700">
                    <Download className="h-4 w-4" />
                    Download
                  </Button>
                  <Button variant="outline" className="flex-1 gap-2">
                    <Eye className="h-4 w-4" />
                    Visualizar
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
