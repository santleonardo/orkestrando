'use client'

import React, { useState, useMemo } from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  ChevronLeft,
  ChevronRight,
  Search,
  X,
} from 'lucide-react'

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

export interface Column<T> {
  key: string
  label: string
  sortable?: boolean
  filterable?: boolean
  width?: string
  align?: 'left' | 'center' | 'right'
  render?: (value: unknown, row: T, rowIndex: number) => React.ReactNode
  headerRender?: (column: Column<T>) => React.ReactNode
}

export interface DataTableAction<T> {
  label: string
  icon?: React.ReactNode
  onClick: (row: T) => void
  variant?: 'default' | 'destructive' | 'outline' | 'ghost' | 'secondary'
  show?: (row: T) => boolean
}

interface DataTableProps<T> {
  columns: Column<T>[]
  data: T[]
  keyExtractor: (row: T) => string
  searchable?: boolean
  searchPlaceholder?: string
  searchFields?: string[]
  pagination?: {
    pageSize?: number
    pageSizes?: number[]
    showTotal?: boolean
  }
  selection?: boolean
  onSelectionChange?: (selectedRows: T[]) => void
  actions?: DataTableAction<T>[]
  emptyMessage?: string
  emptyDescription?: string
  emptyAction?: {
    label: string
    onClick: () => void
  }
  className?: string
  headerClassName?: string
  stickyHeader?: boolean
  compact?: boolean
  isLoading?: boolean
  onRowClick?: (row: T) => void
  defaultSortKey?: string
  defaultSortOrder?: 'asc' | 'desc'
}

type SortDirection = 'asc' | 'desc' | null

// -----------------------------------------------------------------------------
// DataTable Component
// -----------------------------------------------------------------------------

export function DataTable<T extends Record<string, unknown>>({
  columns,
  data,
  keyExtractor,
  searchable = true,
  searchPlaceholder = 'Buscar...',
  searchFields,
  pagination: paginationConfig,
  selection = false,
  onSelectionChange,
  actions,
  emptyMessage = 'Nenhum dado encontrado.',
  emptyDescription,
  emptyAction,
  className,
  headerClassName,
  stickyHeader = false,
  compact = false,
  isLoading = false,
  onRowClick,
  defaultSortKey,
  defaultSortOrder = 'asc',
}: DataTableProps<T>) {
  // State
  const [searchQuery, setSearchQuery] = useState('')
  const [sortKey, setSortKey] = useState<string | null>(defaultSortKey || null)
  const [sortDirection, setSortDirection] = useState<SortDirection>(
    defaultSortKey ? defaultSortOrder : null
  )
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(
    paginationConfig?.pageSize || 10
  )
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set())

  // Filtering
  const filteredData = useMemo(() => {
    if (!searchQuery.trim() || !searchable) return data

    const query = searchQuery.toLowerCase().trim()
    const fields = searchFields || columns.map((col) => col.key)

    return data.filter((row) =>
      fields.some((field) => {
        const value = row[field]
        if (value === null || value === undefined) return false
        return String(value).toLowerCase().includes(query)
      })
    )
  }, [data, searchQuery, searchable, searchFields, columns])

  // Sorting
  const sortedData = useMemo(() => {
    if (!sortKey || !sortDirection) return filteredData

    return [...filteredData].sort((a, b) => {
      const aVal = a[sortKey]
      const bVal = b[sortKey]

      if (aVal === null || aVal === undefined) return 1
      if (bVal === null || bVal === undefined) return -1

      let comparison = 0
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        comparison = aVal.localeCompare(bVal)
      } else if (typeof aVal === 'number' && typeof bVal === 'number') {
        comparison = aVal - bVal
      } else {
        comparison = String(aVal).localeCompare(String(bVal))
      }

      return sortDirection === 'asc' ? comparison : -comparison
    })
  }, [filteredData, sortKey, sortDirection])

  // Pagination
  const totalPages = Math.max(1, Math.ceil(sortedData.length / pageSize))
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return sortedData.slice(start, start + pageSize)
  }, [sortedData, currentPage, pageSize])

  // Selection
  const allSelected =
    paginatedData.length > 0 &&
    paginatedData.every((row) => selectedRows.has(keyExtractor(row)))
  const someSelected =
    paginatedData.some((row) => selectedRows.has(keyExtractor(row))) && !allSelected

  const toggleAll = () => {
    if (allSelected) {
      setSelectedRows(new Set())
    } else {
      const newSet = new Set(selectedRows)
      paginatedData.forEach((row) => newSet.add(keyExtractor(row)))
      setSelectedRows(newSet)
    }
  }

  const toggleRow = (key: string) => {
    const newSet = new Set(selectedRows)
    if (newSet.has(key)) {
      newSet.delete(key)
    } else {
      newSet.add(key)
    }
    setSelectedRows(newSet)
  }

  // Notify parent of selection changes
  React.useEffect(() => {
    if (onSelectionChange) {
      const selected = data.filter((row) => selectedRows.has(keyExtractor(row)))
      onSelectionChange(selected)
    }
  }, [selectedRows, data, keyExtractor, onSelectionChange])

  // Sort handler
  const handleSort = (key: string) => {
    if (sortKey === key) {
      if (sortDirection === 'asc') {
        setSortDirection('desc')
      } else if (sortDirection === 'desc') {
        setSortKey(null)
        setSortDirection(null)
      }
    } else {
      setSortKey(key)
      setSortDirection('asc')
    }
    setCurrentPage(1)
  }

  // Reset page when search changes
  React.useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, pageSize])

  const SortIcon = ({ columnKey }: { columnKey: string }) => {
    if (sortKey !== columnKey) {
      return <ChevronsUpDown className="h-3.5 w-3.5 text-gray-400" />
    }
    if (sortDirection === 'asc') {
      return <ChevronUp className="h-3.5 w-3.5 text-violet-600" />
    }
    return <ChevronDown className="h-3.5 w-3.5 text-violet-600" />
  }

  // Loading state
  if (isLoading) {
    return (
      <div className={cn('rounded-xl border bg-white', className)}>
        <div className="flex items-center justify-between p-4">
          <div className="h-10 w-64 animate-pulse rounded-md bg-gray-200" />
          <div className="flex gap-2">
            <div className="h-9 w-20 animate-pulse rounded-md bg-gray-200" />
          </div>
        </div>
        <div className="border-t">
          <div className="space-y-0">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center border-b px-4 py-3 last:border-0">
                <div className="flex flex-1 gap-4">
                  {columns.slice(0, 3).map((_, j) => (
                    <div
                      key={j}
                      className="h-4 animate-pulse rounded bg-gray-200"
                      style={{ width: `${Math.random() * 40 + 10}%` }}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={cn('space-y-4', className)}>
      {/* Header / Toolbar */}
      {(searchable || selection || actions) && (
        <div className={cn('flex flex-wrap items-center gap-3', headerClassName)}>
          {/* Search */}
          {searchable && (
            <div className="relative flex-1 sm:max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                type="search"
                placeholder={searchPlaceholder}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={cn(
                  'h-9 border-gray-200 bg-gray-50 pl-9 pr-8 text-sm placeholder:text-gray-400 focus-visible:border-violet-400 focus-visible:ring-violet-200',
                  compact && 'h-8 text-xs'
                )}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          )}

          {/* Right side actions */}
          <div className="flex items-center gap-2">
            {/* Selection info */}
            {selection && selectedRows.size > 0 && (
              <Badge variant="secondary" className="bg-violet-100 text-violet-700">
                {selectedRows.size} selecionado{selectedRows.size > 1 ? 's' : ''}
              </Badge>
            )}

            {/* Page size selector */}
            {paginationConfig && (
              <Select
                value={String(pageSize)}
                onValueChange={(v) => setPageSize(Number(v))}
              >
                <SelectTrigger className="h-9 w-[120px] border-gray-200 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(paginationConfig.pageSizes || [5, 10, 20, 50]).map((size) => (
                    <SelectItem key={size} value={String(size)} className="text-xs">
                      {size} itens
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        </div>
      )}

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        <Table>
          <TableHeader>
            <TableRow className="border-gray-100 bg-gray-50/80 hover:bg-gray-50/80">
              {/* Selection checkbox */}
              {selection && (
                <TableHead className="w-12">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    ref={(el) => {
                      if (el) el.indeterminate = someSelected
                    }}
                    onChange={toggleAll}
                    className="h-4 w-4 rounded border-gray-300 text-violet-600 focus:ring-violet-500"
                  />
                </TableHead>
              )}

              {/* Column headers */}
              {columns.map((column) => (
                <TableHead
                  key={column.key}
                  className={cn(
                    'text-xs font-semibold uppercase tracking-wider text-gray-500',
                    column.align === 'center' && 'text-center',
                    column.align === 'right' && 'text-right',
                    column.sortable && 'cursor-pointer select-none hover:text-gray-700',
                    stickyHeader && 'sticky top-0 bg-gray-50',
                    column.width
                  )}
                  onClick={() => column.sortable && handleSort(column.key)}
                >
                  <div
                    className={cn(
                      'flex items-center gap-1.5',
                      column.align === 'center' && 'justify-center',
                      column.align === 'right' && 'justify-end'
                    )}
                  >
                    {column.headerRender ? (
                      column.headerRender(column)
                    ) : (
                      <span>{column.label}</span>
                    )}
                    {column.sortable && <SortIcon columnKey={column.key} />}
                  </div>
                </TableHead>
              ))}

              {/* Actions column */}
              {actions && actions.length > 0 && (
                <TableHead className="w-[120px] text-center text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Ações
                </TableHead>
              )}
            </TableRow>
          </TableHeader>

          <TableBody>
            {paginatedData.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={
                    columns.length +
                    (selection ? 1 : 0) +
                    (actions && actions.length > 0 ? 1 : 0)
                  }
                  className="py-12"
                >
                  <div className="flex flex-col items-center text-center">
                    <SearchXIcon className="mb-3 h-10 w-10 text-gray-300" />
                    <p className="text-sm font-medium text-gray-500">
                      {emptyMessage}
                    </p>
                    {emptyDescription && (
                      <p className="mt-1 text-xs text-gray-400">
                        {emptyDescription}
                      </p>
                    )}
                    {emptyAction && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={emptyAction.onClick}
                        className="mt-4 border-violet-200 text-violet-600 hover:bg-violet-50"
                      >
                        {emptyAction.label}
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              paginatedData.map((row, rowIndex) => {
                const rowKey = keyExtractor(row)
                const isSelected = selectedRows.has(rowKey)

                return (
                  <TableRow
                    key={rowKey}
                    className={cn(
                      'border-gray-100 transition-colors',
                      isSelected && 'bg-violet-50/50',
                      onRowClick && 'cursor-pointer hover:bg-violet-50/30'
                    )}
                    onClick={() => onRowClick?.(row)}
                  >
                    {/* Selection checkbox */}
                    {selection && (
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleRow(rowKey)}
                          className="h-4 w-4 rounded border-gray-300 text-violet-600 focus:ring-violet-500"
                        />
                      </TableCell>
                    )}

                    {/* Data cells */}
                    {columns.map((column) => (
                      <TableCell
                        key={column.key}
                        className={cn(
                          compact && 'py-2 text-xs',
                          column.align === 'center' && 'text-center',
                          column.align === 'right' && 'text-right'
                        )}
                      >
                        {column.render
                          ? column.render(row[column.key], row, rowIndex)
                          : (row[column.key] as React.ReactNode) ?? '-'}
                      </TableCell>
                    ))}

                    {/* Actions */}
                    {actions && actions.length > 0 && (
                      <TableCell
                        className="text-center"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center justify-center gap-1">
                          {actions
                            .filter(
                              (action) => !action.show || action.show(row)
                            )
                            .map((action, actionIndex) => (
                              <Button
                                key={actionIndex}
                                variant={action.variant || 'ghost'}
                                size={compact ? 'sm' : 'icon'}
                                onClick={() => action.onClick(row)}
                                className={cn(
                                  'h-7 w-7 text-gray-400 hover:text-gray-600',
                                  action.variant === 'destructive' &&
                                    'text-red-400 hover:text-red-600 hover:bg-red-50'
                                )}
                                title={action.label}
                              >
                                {action.icon}
                                {!compact && (
                                  <span className="sr-only">{action.label}</span>
                                )}
                              </Button>
                            ))}
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>

        {/* Pagination footer */}
        {paginationConfig && totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-gray-100 px-4 py-3">
            <div className="text-xs text-gray-500">
              {paginationConfig.showTotal !== false && (
                <span>
                  Exibindo{' '}
                  <span className="font-medium text-gray-700">
                    {(currentPage - 1) * pageSize + 1}
                  </span>{' '}
                  a{' '}
                  <span className="font-medium text-gray-700">
                    {Math.min(currentPage * pageSize, sortedData.length)}
                  </span>{' '}
                  de{' '}
                  <span className="font-medium text-gray-700">
                    {sortedData.length}
                  </span>{' '}
                  resultado{sortedData.length !== 1 ? 's' : ''}
                </span>
              )}
            </div>

            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
                <span className="sr-only">Página anterior</span>
              </Button>

              {/* Page numbers */}
              {getPageNumbers(currentPage, totalPages).map((page, i) => {
                if (page === '...') {
                  return (
                    <span
                      key={`ellipsis-${i}`}
                      className="flex h-8 w-8 items-center justify-center text-xs text-gray-400"
                    >
                      ...
                    </span>
                  )
                }
                return (
                  <Button
                    key={page}
                    variant={currentPage === page ? 'default' : 'outline'}
                    size="icon"
                    className={cn(
                      'h-8 w-8 text-xs',
                      currentPage === page &&
                        'bg-violet-600 text-white hover:bg-violet-700'
                    )}
                    onClick={() => setCurrentPage(page as number)}
                  >
                    {page}
                  </Button>
                )
              })}

              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="h-4 w-4" />
                <span className="sr-only">Próxima página</span>
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// -----------------------------------------------------------------------------
// Helpers
// -----------------------------------------------------------------------------

function getPageNumbers(
  currentPage: number,
  totalPages: number
): (number | '...')[] {
  const pages: (number | '...')[] = []

  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i)
    }
    return pages
  }

  pages.push(1)

  if (currentPage > 3) {
    pages.push('...')
  }

  const start = Math.max(2, currentPage - 1)
  const end = Math.min(totalPages - 1, currentPage + 1)

  for (let i = start; i <= end; i++) {
    pages.push(i)
  }

  if (currentPage < totalPages - 2) {
    pages.push('...')
  }

  pages.push(totalPages)

  return pages
}

function SearchXIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
      <path d="M11 8v6" />
      <path d="M8 11h6" />
    </svg>
  )
}
