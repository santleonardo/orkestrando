'use client'

import { useState, useRef } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuthStore } from '@/store/auth-store'
import { api } from '@/lib/api'
import { DataTable, type Column } from '@/components/orkestrando/shared/data-table'
import { FormDialog, type FormField } from '@/components/orkestrando/shared/form-dialog'
import { ConfirmDialog } from '@/components/orkestrando/shared/confirm-dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Plus, Trash2, Download, Upload, FileText } from 'lucide-react'
import { toast } from 'sonner'
import { format, parseISO } from 'date-fns'

const typeLabels: Record<string, string> = {
  LESSON_MATERIAL: 'Material de Aula',
  ASSIGNMENT: 'Trabalho',
  EXERCISE: 'Exercício',
  REFERENCE: 'Referência',
  OTHER: 'Outro',
}

export function MaterialsView() {
  const queryClient = useQueryClient()
  const { user } = useAuthStore()
  const [createOpen, setCreateOpen] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [classFilter, setClassFilter] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploadingFile, setUploadingFile] = useState<File | null>(null)

  const { data: classes } = useQuery({ queryKey: ['materials-classes'], queryFn: () => api.get('/api/classes') })

  const { data, isLoading } = useQuery({
    queryKey: ['materials', classFilter],
    queryFn: () => api.get(`/api/materials${classFilter ? `?classId=${classFilter}` : ''}`),
  })

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('bucket', 'materials')
      const res = await fetch('/api/upload', { method: 'POST', body: formData })
      return res.json()
    },
  })

  const createMutation = useMutation({
    mutationFn: async (values: Record<string, unknown>) => {
      if (uploadingFile) {
        const uploadRes = await uploadMutation.mutateAsync(uploadingFile)
        if (uploadRes.error) throw new Error(uploadRes.error)
        const { data: fileData } = uploadRes
        return api.post('/api/materials', {
          ...values,
          fileName: fileData.fileName,
          fileSize: fileData.fileSize,
          fileUrl: fileData.fileUrl,
          mimeType: fileData.mimeType,
        })
      }
      return api.post('/api/materials', values)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['materials'] })
      toast.success('Material publicado!')
      setCreateOpen(false)
      setUploadingFile(null)
    },
    onError: () => toast.error('Erro ao publicar material'),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/api/materials/${id}`),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['materials'] }); toast.success('Material excluído!'); setDeleteId(null) },
    onError: () => toast.error('Erro ao excluir material'),
  })

  const fields: FormField[] = [
    { type: 'text', name: 'title', label: 'Título', placeholder: 'Nome do material', required: true },
    { type: 'textarea', name: 'description', label: 'Descrição' },
    {
      type: 'select', name: 'type', label: 'Tipo', required: true,
      options: Object.entries(typeLabels).map(([value, label]) => ({ label, value })),
    },
    { type: 'select', name: 'classId', label: 'Turma', required: true, options: (classes?.data || []).map((c: Record<string, unknown>) => ({ label: `${c.code} - ${c.name}` as string, value: c.id as string })) },
  ]

  const columns: Column[] = [
    { key: 'title', label: 'Título', render: (v, row) => (
      <div className="flex items-center gap-2">
        <FileText className="h-4 w-4 text-emerald-600 flex-shrink-0" />
        <div className="min-w-0">
          <p className="text-sm font-medium truncate">{v as string}</p>
          {row.description && <p className="text-xs text-slate-500 truncate">{row.description as string}</p>}
        </div>
      </div>
    )},
    { key: 'type', label: 'Tipo', render: (v) => <Badge variant="outline">{typeLabels[v as string] || v}</Badge> },
    { key: 'class', label: 'Turma', render: (v) => `${(v as Record<string, unknown>)?.code || ''} - ${(v as Record<string, unknown>)?.name || ''}` },
    { key: 'uploader', label: 'Publicado por', render: (v) => (v as Record<string, unknown>)?.name || '-' },
    { key: 'version', label: 'Versão' },
    {
      key: 'fileSize', label: 'Tamanho', render: (v) => {
        const bytes = v as number
        if (bytes < 1024) return `${bytes} B`
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
      },
    },
    {
      key: 'id', label: 'Ações', render: (v, row) => (
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-8 w-8 text-emerald-600" onClick={(e) => { e.stopPropagation(); window.open(row.fileUrl as string, '_blank') }}>
            <Download className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500" onClick={(e) => { e.stopPropagation(); setDeleteId(v as string) }}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Materiais</h2>
          <p className="text-sm text-slate-500">Gerencie materiais didáticos</p>
        </div>
        <Button onClick={() => setCreateOpen(true)} className="bg-emerald-600 hover:bg-emerald-700 text-white">
          <Plus className="h-4 w-4 mr-2" /> Publicar Material
        </Button>
      </div>

      <DataTable columns={columns} data={data?.data || []} isLoading={isLoading} searchPlaceholder="Buscar materiais..." />

      <FormDialog open={createOpen} onOpenChange={(open) => { setCreateOpen(open); if (!open) setUploadingFile(null) }} title="Publicar Material" description="Envie um novo material didático" fields={fields} onSubmit={(values) => createMutation.mutate(values)} isLoading={createMutation.isPending} submitLabel="Publicar">
        <div className="space-y-3">
          <div className="border-t pt-3">
            <label className="text-sm font-medium text-slate-700">Arquivo</label>
            <div className="mt-1 flex items-center gap-2">
              <input ref={fileInputRef} type="file" className="hidden" onChange={(e) => setUploadingFile(e.target.files?.[0] || null)} />
              <Button variant="outline" type="button" onClick={() => fileInputRef.current?.click()}>
                <Upload className="h-4 w-4 mr-2" /> {uploadingFile ? uploadingFile.name : 'Selecionar Arquivo'}
              </Button>
            </div>
          </div>
        </div>
      </FormDialog>

      <ConfirmDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)} title="Excluir Material" description="Tem certeza que deseja excluir este material?" confirmLabel="Excluir" onConfirm={() => deleteId && deleteMutation.mutate(deleteId)} />
    </div>
  )
}
