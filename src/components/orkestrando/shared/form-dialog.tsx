'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Loader2 } from 'lucide-react'

export interface FormField {
  type: 'text' | 'email' | 'password' | 'number' | 'textarea' | 'select' | 'date' | 'time'
  name: string
  label: string
  placeholder?: string
  required?: boolean
  options?: { label: string; value: string }[]
  defaultValue?: string | number
  min?: number
  max?: number
}

interface FormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: string
  fields: FormField[]
  onSubmit: (values: Record<string, string | number>) => Promise<void>
  isLoading?: boolean
  submitLabel?: string
  defaultValues?: Record<string, string | number>
}

export function FormDialog({
  open,
  onOpenChange,
  title,
  description,
  fields,
  onSubmit,
  isLoading,
  submitLabel = 'Salvar',
  defaultValues,
}: FormDialogProps) {
  const [values, setValues] = useState<Record<string, string | number>>(defaultValues || {})

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await onSubmit(values)
    if (!isLoading) {
      setValues(defaultValues || {})
      onOpenChange(false)
    }
  }

  const updateValue = (name: string, value: string | number) => {
    setValues((prev) => ({ ...prev, [name]: value }))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-slate-900">{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {fields.map((field) => (
            <div key={field.name} className="space-y-2">
              <Label htmlFor={field.name} className="text-slate-700">
                {field.label} {field.required && <span className="text-red-500">*</span>}
              </Label>
              {field.type === 'select' ? (
                <Select
                  value={String(values[field.name] || '')}
                  onValueChange={(v) => updateValue(field.name, v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={field.placeholder || `Selecione ${field.label.toLowerCase()}`} />
                  </SelectTrigger>
                  <SelectContent>
                    {field.options?.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : field.type === 'textarea' ? (
                <Textarea
                  id={field.name}
                  placeholder={field.placeholder}
                  value={String(values[field.name] || '')}
                  onChange={(e) => updateValue(field.name, e.target.value)}
                  rows={3}
                />
              ) : (
                <Input
                  id={field.name}
                  type={field.type}
                  placeholder={field.placeholder}
                  value={String(values[field.name] || '')}
                  onChange={(e) =>
                    updateValue(field.name, field.type === 'number' ? Number(e.target.value) : e.target.value)
                  }
                  min={field.min}
                  max={field.max}
                />
              )}
            </div>
          ))}
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setValues(defaultValues || {})
                onOpenChange(false)
              }}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
              disabled={isLoading}
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {submitLabel}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
