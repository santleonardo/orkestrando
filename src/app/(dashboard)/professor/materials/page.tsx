'use client'

import { useState, useEffect, useRef } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import {
  Upload,
  FileText,
  File,
  FileSpreadsheet,
  FileImage,
  Video,
  Music,
  Archive,
  Download,
  Trash2,
  Search,
  Filter,
  Eye,
  EyeOff,
  FolderOpen,
  Plus,
  CloudUpload,
  X,
  FileType2,
  Loader2,
  AlertTriangle,
  MoreVertical,
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface Material {
  id: string
  title: string
  description: string
  fileName: string
  fileType: string
  fileSize: number
  fileUrl: string
  mimeType: string
  type: string
  isPublished: boolean
  downloadCount: number
  classId: string
  className: string
  subjectName: string
  subjectCode: string
  sessionId: string
  version: number
  createdAt: string
  updatedAt: string
}

interface ClassOption {
  id: string
  name: string
  subjectName: string
  subjectCode: string
}

const FILE_TYPE_CONFIG: Record<string, { icon: React.ElementType; color: string; bg: string }> = {
  PDF: { icon: FileText, color: 'text-red-600 dark:text-red-400', bg: 'bg-red-100 dark:bg-red-950/50' },
  DOCX: { icon: FileType2, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-100 dark:bg-blue-950/50' },
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

export default function ProfessorMaterialsPage() {
  const { profile } = useAuth()
  const [materials, setMaterials] = useState<Material[]>([])
  const [classes, setClasses] = useState<ClassOption[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)

  // Filters
  const [searchQuery, setSearchQuery] = useState('')
  const [subjectFilter, setSubjectFilter] = useState<string>('all')
  const [typeFilter, setTypeFilter] = useState<string>('all')

  // Upload modal
  const [uploadModalOpen, setUploadModalOpen] = useState(false)
  const [uploadFiles, setUploadFiles] = useState<File[]>([])
  const [uploadTitle, setUploadTitle] = useState('')
  const [uploadDescription, setUploadDescription] = useState('')
  const [uploadClassId, setUploadClassId] = useState('')
  const [uploadPublish, setUploadPublish] = useState(true)
  const [dragOver, setDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    async function fetchData() {
      try {
        setIsLoading(true)
        setError(null)

        const [materialsRes, classesRes] = await Promise.allSettled([
          fetch('/api/materials'),
          fetch('/api/teachers/me/classes'),
        ])

        if (materialsRes.status === 'fulfilled' && materialsRes.value.ok) {
          const data = await materialsRes.value.json()
          if (data.success && Array.isArray(data.data)) {
            setMaterials(data.data)
          }
        } else {
          setMaterials([
            { id: 'm1', title: 'SQL Basics - Chapter 1', description: 'Introduction to SQL queries and SELECT statements', fileName: 'sql-basics-ch1.pdf', fileType: 'PDF', fileSize: 2048576, fileUrl: '#', mimeType: 'application/pdf', type: 'PDF', isPublished: true, downloadCount: 45, classId: 'c1', className: 'CCO301-A', subjectName: 'Database Systems', subjectCode: 'CCO301', sessionId: '', version: 1, createdAt: '2025-06-10T10:00:00Z', updatedAt: '2025-06-10T10:00:00Z' },
            { id: 'm2', title: 'ER Diagram Examples', description: 'Entity-Relationship diagram examples for practice', fileName: 'er-examples.docx', fileType: 'DOCX', fileSize: 1048576, fileUrl: '#', mimeType: 'application/docx', type: 'DOCX', isPublished: true, downloadCount: 32, classId: 'c1', className: 'CCO301-A', subjectName: 'Database Systems', subjectCode: 'CCO301', sessionId: '', version: 2, createdAt: '2025-06-08T14:00:00Z', updatedAt: '2025-06-12T09:00:00Z' },
            { id: 'm3', title: 'Scrum Framework', description: 'Agile Scrum methodology overview', fileName: 'scrum-framework.pptx', fileType: 'PPTX', fileSize: 5242880, fileUrl: '#', mimeType: 'application/pptx', type: 'PPTX', isPublished: true, downloadCount: 28, classId: 'c2', className: 'CCO401-A', subjectName: 'Software Engineering', subjectCode: 'CCO401', sessionId: '', version: 1, createdAt: '2025-06-05T11:00:00Z', updatedAt: '2025-06-05T11:00:00Z' },
            { id: 'm4', title: 'Grades Spreadsheet Template', description: 'Template for student grade tracking', fileName: 'grades-template.xlsx', fileType: 'XLSX', fileSize: 524288, fileUrl: '#', mimeType: 'application/xlsx', type: 'XLSX', isPublished: false, downloadCount: 0, classId: 'c2', className: 'CCO401-A', subjectName: 'Software Engineering', subjectCode: 'CCO401', sessionId: '', version: 1, createdAt: '2025-06-01T16:00:00Z', updatedAt: '2025-06-01T16:00:00Z' },
            { id: 'm5', title: 'Binary Trees Visualization', description: 'Interactive visualization of binary tree operations', fileName: 'binary-trees.mp4', fileType: 'MP4', fileSize: 52428800, fileUrl: '#', mimeType: 'video/mp4', type: 'MP4', isPublished: true, downloadCount: 56, classId: 'c3', className: 'CCO201-B', subjectName: 'Data Structures', subjectCode: 'CCO201', sessionId: '', version: 1, createdAt: '2025-05-28T13:00:00Z', updatedAt: '2025-05-28T13:00:00Z' },
          ])
        }

        if (classesRes.status === 'fulfilled' && classesRes.value.ok) {
          const data = await classesRes.value.json()
          if (data.success && Array.isArray(data.data)) {
            setClasses(data.data.map((c: { id: string; subjectName: string; subjectCode: string }) => ({
              id: c.id,
              name: `${c.subjectCode} - ${c.subjectName}`,
              subjectName: c.subjectName,
              subjectCode: c.subjectCode,
            })))
          }
        } else {
          setClasses([
            { id: 'c1', name: 'CCO301 - Database Systems', subjectName: 'Database Systems', subjectCode: 'CCO301' },
            { id: 'c2', name: 'CCO401 - Software Engineering', subjectName: 'Software Engineering', subjectCode: 'CCO401' },
            { id: 'c3', name: 'CCO201 - Data Structures', subjectName: 'Data Structures', subjectCode: 'CCO201' },
          ])
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load materials')
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  const uniqueSubjects = [...new Map(materials.map((m) => [m.subjectCode, { code: m.subjectCode, name: m.subjectName }])).values()]
  const uniqueTypes = [...new Set(materials.map((m) => m.type))]

  const filteredMaterials = materials.filter((m) => {
    const matchesSearch = searchQuery === '' ||
      m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.fileName.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesSubject = subjectFilter === 'all' || m.subjectCode === subjectFilter
    const matchesType = typeFilter === 'all' || m.type === typeFilter
    return matchesSearch && matchesSubject && matchesType
  })

  const groupedBySubject = filteredMaterials.reduce<Record<string, Material[]>>((acc, m) => {
    const key = `${m.subjectCode} - ${m.subjectName}`
    if (!acc[key]) acc[key] = []
    acc[key].push(m)
    return acc
  }, {})

  const togglePublish = async (materialId: string, currentValue: boolean) => {
    try {
      const res = await fetch(`/api/materials/${materialId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isPublished: !currentValue }),
      })
      if (res.ok) {
        setMaterials((prev) =>
          prev.map((m) => m.id === materialId ? { ...m, isPublished: !currentValue } : m)
        )
      }
    } catch {
      setError('Failed to update material')
    }
  }

  const deleteMaterial = async (materialId: string) => {
    try {
      const res = await fetch(`/api/materials/${materialId}`, { method: 'DELETE' })
      if (res.ok) {
        setMaterials((prev) => prev.filter((m) => m.id !== materialId))
      }
    } catch {
      setError('Failed to delete material')
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(true)
  }

  const handleDragLeave = () => setDragOver(false)

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const files = Array.from(e.dataTransfer.files)
    setUploadFiles((prev) => [...prev, ...files])
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setUploadFiles((prev) => [...prev, ...Array.from(e.target.files!)])
    }
  }

  const removeUploadFile = (index: number) => {
    setUploadFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const handleUpload = async () => {
    if (uploadFiles.length === 0 || !uploadClassId) return
    try {
      setIsUploading(true)
      for (const file of uploadFiles) {
        const formData = new FormData()
        formData.append('file', file)
        formData.append('title', uploadTitle || file.name)
        formData.append('description', uploadDescription)
        formData.append('classId', uploadClassId)
        formData.append('isPublished', String(uploadPublish))

        const res = await fetch('/api/materials', {
          method: 'POST',
          body: formData,
        })

        if (res.ok) {
          const data = await res.json()
          if (data.success && data.data) {
            setMaterials((prev) => [data.data, ...prev])
          }
        }
      }
      setUploadModalOpen(false)
      setUploadFiles([])
      setUploadTitle('')
      setUploadDescription('')
      setUploadClassId('')
      setUploadPublish(true)
    } catch {
      setError('Failed to upload file')
    } finally {
      setIsUploading(false)
    }
  }

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
          <Skeleton className="h-10 w-48" />
        </div>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-16 rounded-xl" />
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
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Materials</h1>
          <p className="text-muted-foreground mt-1">Upload and manage teaching materials for your classes</p>
        </div>
        <Button
          onClick={() => setUploadModalOpen(true)}
          className="bg-violet-600 text-white hover:bg-violet-700"
        >
          <Plus className="mr-1.5 size-4" /> Upload Material
        </Button>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-300">
          <AlertTriangle className="size-4 shrink-0" />
          {error}
          <Button variant="ghost" size="sm" onClick={() => setError(null)} className="ml-auto">Dismiss</Button>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search materials..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-9 w-full rounded-md border border-input bg-transparent pl-9 pr-3 text-sm shadow-xs outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-200 dark:focus:ring-violet-800"
          />
        </div>
        <Select value={subjectFilter} onValueChange={setSubjectFilter}>
          <SelectTrigger className="w-52">
            <SelectValue placeholder="All Subjects" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Subjects</SelectItem>
            {uniqueSubjects.map((s) => (
              <SelectItem key={s.code} value={s.code}>{s.code} - {s.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="All Types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            {uniqueTypes.map((t) => (
              <SelectItem key={t} value={t}>{t}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Materials grouped by subject */}
      {filteredMaterials.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <FolderOpen className="size-12 text-muted-foreground/40" />
            <p className="mt-3 text-lg font-medium text-muted-foreground">No materials found</p>
            <p className="text-sm text-muted-foreground/70">
              {searchQuery || subjectFilter !== 'all' || typeFilter !== 'all'
                ? 'Try adjusting your filters'
                : 'Upload your first material to get started'}
            </p>
            {!searchQuery && subjectFilter === 'all' && typeFilter === 'all' && (
              <Button
                variant="outline"
                className="mt-4 border-violet-200 text-violet-600 hover:bg-violet-50"
                onClick={() => setUploadModalOpen(true)}
              >
                <Upload className="mr-1.5 size-4" /> Upload Material
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        Object.entries(groupedBySubject).map(([subjectKey, items]) => (
          <Card key={subjectKey}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FolderOpen className="size-5 text-violet-600" />
                  <CardTitle className="text-base font-semibold">{subjectKey}</CardTitle>
                  <Badge variant="secondary" className="text-xs">{items.length} files</Badge>
                </div>
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
                      className={`flex items-center justify-between rounded-lg border p-3 transition-colors hover:bg-muted/30 ${
                        !material.isPublished ? 'opacity-70' : ''
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${config.bg}`}>
                          <IconComponent className={`size-5 ${config.color}`} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium text-foreground">{material.title}</p>
                            {material.version > 1 && (
                              <Badge variant="outline" className="text-[10px]">v{material.version}</Badge>
                            )}
                            {!material.isPublished && (
                              <Badge variant="secondary" className="text-[10px]">
                                <EyeOff className="mr-0.5 size-2.5" /> Draft
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span>{material.fileName}</span>
                            <span>•</span>
                            <span>{formatFileSize(material.fileSize)}</span>
                            <span>•</span>
                            <span>{material.downloadCount} downloads</span>
                            <span>•</span>
                            <span>{new Date(material.updatedAt).toLocaleDateString()}</span>
                          </div>
                          {material.description && (
                            <p className="mt-0.5 text-xs text-muted-foreground line-clamp-1">{material.description}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-8"
                          onClick={() => downloadMaterial(material.fileUrl, material.fileName)}
                        >
                          <Download className="size-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-8"
                          onClick={() => togglePublish(material.id, material.isPublished)}
                        >
                          {material.isPublished ? (
                            <EyeOff className="size-4 text-muted-foreground" />
                          ) : (
                            <Eye className="size-4 text-violet-600" />
                          )}
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="size-8">
                              <MoreVertical className="size-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => togglePublish(material.id, material.isPublished)}>
                              {material.isPublished ? <EyeOff className="mr-2 size-3.5" /> : <Eye className="mr-2 size-3.5" />}
                              {material.isPublished ? 'Unpublish' : 'Publish'}
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-red-600" onClick={() => deleteMaterial(material.id)}>
                              <Trash2 className="mr-2 size-3.5" /> Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        ))
      )}

      {/* Upload Modal */}
      {uploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setUploadModalOpen(false)}>
          <div className="bg-background rounded-lg border shadow-lg w-full max-w-lg mx-4" onClick={(e) => e.stopPropagation()}>
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Upload Material</h2>
                <Button variant="ghost" size="icon" onClick={() => setUploadModalOpen(false)}>
                  <X className="size-4" />
                </Button>
              </div>

              <div className="space-y-4">
                {/* Drag & Drop Area */}
                <div
                  className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer ${
                    dragOver ? 'border-violet-400 bg-violet-50 dark:bg-violet-950/30' : 'border-muted-foreground/25 hover:border-muted-foreground/50'
                  }`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <CloudUpload className={`mx-auto size-10 ${dragOver ? 'text-violet-500' : 'text-muted-foreground/50'}`} />
                  <p className="mt-3 text-sm text-muted-foreground">
                    Drag & drop files here, or <span className="text-violet-600 font-medium">browse</span>
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground/70">PDF, DOCX, XLSX, PPTX, MP4, MP3, Images, ZIP</p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    className="hidden"
                    onChange={handleFileSelect}
                    accept=".pdf,.docx,.doc,.xlsx,.xls,.pptx,.ppt,.mp4,.mp3,.wav,.png,.jpg,.jpeg,.gif,.zip,.rar"
                  />
                </div>

                {/* Selected Files */}
                {uploadFiles.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-foreground">Selected Files ({uploadFiles.length})</p>
                    {uploadFiles.map((file, index) => (
                      <div key={index} className="flex items-center justify-between rounded-lg bg-muted/50 p-2">
                        <div className="flex items-center gap-2 text-sm">
                          <File className="size-4 text-muted-foreground" />
                          <span className="truncate max-w-[200px]">{file.name}</span>
                          <span className="text-xs text-muted-foreground">{formatFileSize(file.size)}</span>
                        </div>
                        <Button variant="ghost" size="icon" className="size-6" onClick={() => removeUploadFile(index)}>
                          <X className="size-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}

                <Separator />

                {/* Details */}
                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-foreground">Title</label>
                    <Input
                      placeholder="Material title (auto-filled from filename)"
                      value={uploadTitle}
                      onChange={(e) => setUploadTitle(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-foreground">Description</label>
                    <Input
                      placeholder="Brief description of the material"
                      value={uploadDescription}
                      onChange={(e) => setUploadDescription(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-foreground">Class</label>
                    <Select value={uploadClassId} onValueChange={setUploadClassId}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select a class" />
                      </SelectTrigger>
                      <SelectContent>
                        {classes.map((c) => (
                          <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-foreground">Publish immediately</label>
                    <Switch checked={uploadPublish} onCheckedChange={setUploadPublish} />
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-2">
                <Button variant="outline" onClick={() => setUploadModalOpen(false)}>Cancel</Button>
                <Button
                  onClick={handleUpload}
                  disabled={isUploading || uploadFiles.length === 0 || !uploadClassId}
                  className="bg-violet-600 text-white hover:bg-violet-700"
                >
                  {isUploading ? <Loader2 className="mr-1.5 size-4 animate-spin" /> : <Upload className="mr-1.5 size-4" />}
                  {isUploading ? 'Uploading...' : 'Upload'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
