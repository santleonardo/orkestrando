'use client'

import React, { useState, useEffect } from 'react'
import { useStore } from '@/lib/store'
import { useToast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { EmptyState } from './helpers'
import { Search, Plus, ChevronDown, Pencil, Trash2 } from 'lucide-react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { ScrollArea } from '@/components/ui/scroll-area'

export type FieldType = 'text' | 'number' | 'select' | 'checkbox' | 'time'

export interface FormField {
  key: string
  label: string
  type: FieldType
  placeholder?: string
  options?: { label: string; value: string }[]
  colSpan?: number // grid cols (1 or 2)
}

export interface ColumnDef {
  key: string
  label: string
  render?: (val: any, row: any) => React.ReactNode
}

export interface CrudViewConfig {
  title: string
  emptyIcon: React.ElementType
  emptyTitle: string
  emptyDesc: string
  searchPlaceholder?: string
  /** store keys for data, fetcher, creator, updater, deleter */
  dataKey: string
  fetchKey: string
  createKey: string
  updateKey: string
  deleteKey: string
  /** filter data after fetching (e.g. role === 'PROFESSOR') */
  dataFilter?: (items: any[], store: ReturnType<typeof useStore.getState>) => any[]
  /** extra fetches on mount */
  extraFetchKeys?: string[]
  columns: ColumnDef[]
  formFields: FormField[]
  /** transform form before sending (e.g. parse numbers) */
  transformForm?: (form: Record<string, any>) => Record<string, any>
  /** extra data merged when creating */
  createExtra?: (form: Record<string, any>) => Record<string, any>
}

export function CrudView({ config }: { config: CrudViewConfig }) {
  const store = useStore()
  const { toast } = useToast()
  const [search, setSearch] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [editing, setEditing] = useState<any>(null)

  // Build initial form from fields
  const buildInitialForm = () => {
    const form: Record<string, any> = {}
    for (const f of config.formFields) {
      if (f.type === 'checkbox') form[f.key] = false
      else if (f.options) form[f.key] = f.options[0]?.value || ''
      else form[f.key] = ''
    }
    return form
  }

  const [form, setForm] = useState(buildInitialForm)

  // Fetch data on mount
  useEffect(() => {
    const s = store as any
    const keys = [config.fetchKey, ...(config.extraFetchKeys || [])]
    Promise.all(keys.filter(k => s[k]).map(k => s[k]()))
  }, [])

  // Get data
  const rawData = (store as any)[config.dataKey] || []
  const data = config.dataFilter ? config.dataFilter(rawData, store) : rawData

  // Filter by search
  const filtered = data.filter((row: any) =>
    config.columns.some(col => {
      const val = row[col.key]
      return val && String(val).toLowerCase().includes(search.toLowerCase())
    })
  )

  const openCreate = () => { setEditing(null); setForm(buildInitialForm()); setDialogOpen(true) }
  const openEdit = (row: any) => {
    setEditing(row)
    const newForm = buildInitialForm()
    for (const f of config.formFields) {
      newForm[f.key] = row[f.key] !== null && row[f.key] !== undefined
        ? (f.type === 'checkbox' ? row[f.key] : String(row[f.key]))
        : (f.type === 'checkbox' ? false : '')
    }
    setForm(newForm)
    setDialogOpen(true)
  }

  const handleSave = async () => {
    try {
      const s = store as any
      const payload = config.transformForm ? config.transformForm(form) : form
      if (editing) {
        await s[config.updateKey](editing.id, payload)
        toast({ title: 'Updated' })
      } else {
        const extra = config.createExtra ? config.createExtra(form) : {}
        await s[config.createKey]({ ...payload, ...extra })
        toast({ title: 'Created' })
      }
      setDialogOpen(false)
    } catch (err: any) {
      toast({ title: 'Error', description: err.error || err.message || 'Operation failed', variant: 'destructive' })
    }
  }

  const handleDelete = async () => {
    try {
      await (store as any)[config.deleteKey](editing.id)
      toast({ title: 'Deleted' })
      setDeleteOpen(false)
    } catch {
      toast({ title: 'Error', variant: 'destructive' })
    }
  }

  const updateField = (key: string, value: any) => setForm(prev => ({ ...prev, [key]: value }))

  return (
    <>
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold">{config.title}</h2>
            <p className="text-sm text-muted-foreground">{data.length} total records</p>
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder={config.searchPlaceholder || 'Search...'} value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
            </div>
            <Button onClick={openCreate} className="bg-emerald-600 hover:bg-emerald-700 whitespace-nowrap">
              <Plus className="h-4 w-4 mr-2" /> Add
            </Button>
          </div>
        </div>

        {filtered.length === 0 ? (
          <Card className="shadow-sm"><div className="p-6"><EmptyState icon={config.emptyIcon} title={config.emptyTitle} description={config.emptyDesc} /></div></Card>
        ) : (
          <Card className="shadow-sm overflow-hidden">
            <ScrollArea className="max-h-[500px]">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    {config.columns.map(col => <TableHead key={col.key}>{col.label}</TableHead>)}
                    <TableHead className="w-12">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((row: any) => (
                    <TableRow key={row.id} className="hover:bg-muted/30">
                      {config.columns.map(col => (
                        <TableCell key={col.key}>
                          {col.render ? col.render(row[col.key], row) : <span className="text-sm">{row[col.key]}</span>}
                        </TableCell>
                      ))}
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8"><ChevronDown className="h-4 w-4" /></Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => openEdit(row)}><Pencil className="h-4 w-4 mr-2" /> Edit</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-red-600" onClick={() => { setEditing(row); setDeleteOpen(true) }}><Trash2 className="h-4 w-4 mr-2" /> Delete</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          </Card>
        )}
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? `Edit ${config.title.slice(0, -1)}` : `Add ${config.title.slice(0, -1)}`}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {config.formFields.map(field => (
              <div key={field.key} className={field.colSpan === 2 ? 'col-span-2' : ''}>
                {field.type === 'checkbox' ? (
                  <Label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={!!form[field.key]} onChange={e => updateField(field.key, e.target.checked)} className="rounded" />
                    {field.label}
                  </Label>
                ) : (
                  <div className="space-y-2">
                    <Label>{field.label}</Label>
                    {field.type === 'select' ? (
                      <Select value={form[field.key]} onValueChange={v => updateField(field.key, v)}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {field.options?.map(opt => <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    ) : (
                      <Input
                        type={field.type}
                        placeholder={field.placeholder}
                        value={form[field.key]}
                        onChange={e => updateField(field.key, e.target.value)}
                      />
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={handleSave}>{editing ? 'Update' : 'Create'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {config.title.slice(0, -1)}</AlertDialogTitle>
            <AlertDialogDescription>Are you sure? This action cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction className="bg-red-600 hover:bg-red-700" onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
