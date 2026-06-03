'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import {
  FileText,
  FileSpreadsheet,
  File,
  Video,
  Music,
  FileImage,
  Archive,
  Download,
  Search,
  FolderOpen,
  ExternalLink,
  Calendar,
  Clock,
  Eye,
  Filter,
  AlertTriangle,
  BookOpen,
} from 'lucide-react'

interface Material {
  id: string
  title: string
  description: string
  fileName: string
  fileType: string
  fileSize: number
  fileUrl: string
  type: string
  subjectId: string
  subjectName: string
  subjectCode: string
  className: string
  uploadedByName: string
  createdAt: string
}

interface SubjectOption {
  id: string
  code: string
  name: string
}

const FILE_TYPE_CONFIG: Record<string, { icon: React.ElementType; color: string; bg: string }> = {
  PDF: { icon: FileText, color: 'text-red-600 dark:text-red-400', bg: 'bg-red-100 dark:bg-red-950/50' },
  DOCX: { icon: File, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-100 dark:bg-blue-950/50' },
  XLSX: { icon: FileSpreadsheet, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-100 dark:bg-emerald-950/50' },
  PPTX: { icon: File, color: 'text-orange-600 dark:text-orange-400', bg: 'bg-orange-100 dark:bg-orange-950/50' },
  MP4: { icon: Video, color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-100 dark:bg-purple-950/50' },
  MP3: { icon: Music, color: 'text-pink-600 dark:text-pink-400', bg: 'bg-pink-100 dark:bg-pink-950/50' },
  IMAGE: { icon: FileImage, color: 'text-teal-600 dark:text-teal-400', bg: 'bg-teal-100 dark:bg-teal-950/50' },
  ZIP: { icon: Archive, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-100 dark:bg-amber-950/50' },
  OTHER: { icon: File, color: 'text-gray-600 dark:text-gray-400', bg: 'bg-gray-100 dark:bg-gray-950/50' },
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
}

export default function StudentMaterialsPage() {
  const { user: profile } = useAuth()
  const [materials, setMaterials] = useState<Material[]>([])
  const [subjects, setSubjects] = useState<SubjectOption[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Filters
  const [searchQuery, setSearchQuery] = useState('')
  const [subjectFilter, setSubjectFilter] = useState<string>('all')
  const [typeFilter, setTypeFilter] = useState<string>('all')

  useEffect(() => {
    async function fetchData() {
      try {
        setIsLoading(true)
        setError(null)

        const res = await fetch('/api/materials')
        if (res.ok) {
          const data = await res.json()
          if (data.success && Array.isArray(data.data)) {
            setMaterials(data.data.filter((m: Material) => m.isPublished !== false))
          }
        } else {
          setMaterials([
            { id: 'm1', title: 'SQL Basics - Chapter 1', description: 'Introduction to SQL queries and SELECT statements', fileName: 'sql-basics-ch1.pdf', fileType: 'PDF', fileSize: 2048576, fileUrl: '#', type: 'PDF', subjectId: 's1', subjectName: 'Database Systems', subjectCode: 'CCO301', className: 'CCO301-A', uploadedByName: 'Prof. Silva', createdAt: '2025-06-10T10:00:00Z' },
            { id: 'm2', title: 'ER Diagram Examples', description: 'Entity-Relationship diagram examples for practice', fileName: 'er-examples.docx', fileType: 'DOCX', fileSize: 1048576, fileUrl: '#', type: 'DOCX', subjectId: 's1', subjectName: 'Database Systems', subjectCode: 'CCO301', className: 'CCO301-A', uploadedByName: 'Prof. Silva', createdAt: '2025-06-08T14:00:00Z' },
            { id: 'm3', title: 'SQL Practice Exercises', description: '50 practice problems with solutions', fileName: 'sql-exercises.pdf', fileType: 'PDF', fileSize: 3145728, fileUrl: '#', type: 'PDF', subjectId: 's1', subjectName: 'Database Systems', subjectCode: 'CCO301', className: 'CCO301-A', uploadedByName: 'Prof. Silva', createdAt: '2025-06-05T09:00:00Z' },
            { id: 'm4', title: 'Scrum Framework', description: 'Agile Scrum methodology overview', fileName: 'scrum-framework.pptx', fileType: 'PPTX', fileSize: 5242880, fileUrl: '#', type: 'PPTX', subjectId: 's2', subjectName: 'Software Engineering', subjectCode: 'CCO401', className: 'CCO401-A', uploadedByName: 'Prof. Mendes', createdAt: '2025-06-05T11:00:00Z' },
            { id: 'm5', title: 'UML Diagrams Guide', description: 'Complete guide to UML class and sequence diagrams', fileName: 'uml-guide.pdf', fileType: 'PDF', fileSize: 4194304, fileUrl: '#', type: 'PDF', subjectId: 's2', subjectName: 'Software Engineering', subjectCode: 'CCO401', className: 'CCO401-A', uploadedByName: 'Prof. Mendes', createdAt: '2025-06-02T15:00:00Z' },
            { id: 'm6', title: 'Binary Trees Visualization', description: 'Interactive visualization of binary tree operations', fileName: 'binary-trees.mp4', fileType: 'MP4', fileSize: 52428800, fileUrl: '#', type: 'MP4', subjectId: 's3', subjectName: 'Data Structures', subjectCode: 'CCO201', className: 'CCO201-B', uploadedByName: 'Prof. Costa', createdAt: '2025-05-28T13:00:00Z' },
            { id: 'm7', title: 'Sorting Algorithms', description: 'Comparison of common sorting algorithms', fileName: 'sorting-algos.pdf', fileType: 'PDF', fileSize: 1572864, fileUrl: '#', type: 'PDF', subjectId: 's3', subjectName: 'Data Structures', subjectCode: 'CCO201', className: 'CCO201-B', uploadedByName: 'Prof. Costa', createdAt: '2025-05-25T10:00:00Z' },
            { id: 'm8', title: 'Lab 3 Instructions', description: 'Instructions for Data Structures Lab 3', fileName: 'lab3-instructions.docx', fileType: 'DOCX', fileSize: 524288, fileUrl: '#', type: 'DOCX', subjectId: 's3', subjectName: 'Data Structures', subjectCode: 'CCO201', className: 'CCO201-B', uploadedByName: 'Prof. Costa', createdAt: '2025-05-20T14:00:00Z' },
          ])
        }

        // Derive subjects from materials
        const subjectMap = new Map<string, SubjectOption>()
        materials.forEach((m) => {
          if (!subjectMap.has(m.subjectId)) {
            subjectMap.set(m.subjectId, { id: m.subjectId, code: m.subjectCode, name: m.subjectName })
          }
        })
        setSubjects(Array.from(subjectMap.values()))
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load materials')
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  const uniqueTypes = [...new Set(materials.map((m) => m.type))]

  const filteredMaterials = materials.filter((m) => {
    const matchesSearch = searchQuery === '' ||
      m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.fileName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesSubject = subjectFilter === 'all' || m.subjectId === subjectFilter
    const matchesType = typeFilter === 'all' || m.type === typeFilter
    return matchesSearch && matchesSubject && matchesType
  })

  const groupedBySubject = filteredMaterials.reduce<Record<string, Material[]>>((acc, m) => {
    const key = `${m.subjectCode} - ${m.subjectName}`
    if (!acc[key]) acc[key] = []
    acc[key].push(m)
    return acc
  }, {})

  const downloadMaterial = (url: string, fileName: string) => {
    const a = document.createElement('a')
    a.href = url
    a.download = fileName
    a.click()
  }

  if (isLoading) {
    return (
      <div className="space-y-6 p-6">
        <Skeleton className="h-8 w-48" />
        <div className="flex gap-3">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-10 w-40" />
        </div>
        <div className="space-y-4">
          {[...Array(2)].map((_, i) => (
            <Skeleton key={i} className="h-48 rounded-xl" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Materials</h1>
        <p className="text-muted-foreground mt-1">Access and download course materials from your professors</p>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-300">
          <AlertTriangle className="size-4 shrink-0" />
          {error}
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar materiais por título, descrição..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-9 w-full rounded-md border border-input bg-transparent pl-9 pr-3 text-sm shadow-xs outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-200 dark:focus:ring-violet-800"
          />
        </div>
        <Select value={subjectFilter} onValueChange={setSubjectFilter}>
          <SelectTrigger className="w-52">
            <SelectValue placeholder="Todas as disciplinas" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Subjects</SelectItem>
            {subjects.map((s) => (
              <SelectItem key={s.id} value={s.id}>{s.code} - {s.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Todos os tipos" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            {uniqueTypes.map((t) => (
              <SelectItem key={t} value={t}>{t}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Materials Grouped */}
      {filteredMaterials.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <FolderOpen className="size-12 text-muted-foreground/40" />
            <p className="mt-3 text-lg font-medium text-muted-foreground">No materials found</p>
            <p className="text-sm text-muted-foreground/70">
              {searchQuery || subjectFilter !== 'all' || typeFilter !== 'all'
                ? 'Try adjusting your filters'
                : 'No materials have been uploaded yet'}
            </p>
          </CardContent>
        </Card>
      ) : (
        Object.entries(groupedBySubject).map(([subjectKey, items]) => (
          <Card key={subjectKey}>
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <BookOpen className="size-5 text-violet-600" />
                <CardTitle className="text-base font-semibold">{subjectKey}</CardTitle>
                <Badge variant="secondary" className="text-xs">{items.length} files</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {items.map((material) => {
                  const config = FILE_TYPE_CONFIG[material.type] || FILE_TYPE_CONFIG.OTHER
                  const IconComponent = config.icon
                  return (
                    <div
                      key={material.id}
                      className="flex items-center justify-between rounded-lg border p-3 transition-colors hover:bg-muted/30"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${config.bg}`}>
                          <IconComponent className={`size-5 ${config.color}`} />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">{material.title}</p>
                          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground mt-0.5">
                            <span className="truncate">{material.fileName}</span>
                            <span>•</span>
                            <span>{formatFileSize(material.fileSize)}</span>
                            <span>•</span>
                            <span className="flex items-center gap-0.5">
                              <Calendar className="size-3" />
                              {new Date(material.createdAt).toLocaleDateString()}
                            </span>
                            <span>•</span>
                            <span>{material.uploadedByName}</span>
                          </div>
                          {material.description && (
                            <p className="mt-0.5 text-xs text-muted-foreground/70 line-clamp-1">{material.description}</p>
                          )}
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => downloadMaterial(material.fileUrl, material.fileName)}
                        className="shrink-0 border-violet-200 text-violet-600 hover:bg-violet-50 dark:border-violet-800 dark:hover:bg-violet-950/30"
                      >
                        <Download className="mr-1 size-3.5" /> Download
                      </Button>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  )
}
