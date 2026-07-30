"use client"

import { CaretLeft, CaretRight } from "@phosphor-icons/react"

interface PaginationProps {
  total: number
  page: number
  perPage: number
  onPageChange: (page: number) => void
  onPerPageChange: (perPage: number) => void
}

export function Pagination({ total, page, perPage, onPageChange, onPerPageChange }: PaginationProps) {
  const totalPages = Math.max(1, Math.ceil(total / perPage))
  const start = total === 0 ? 0 : (page - 1) * perPage + 1
  const end = Math.min(page * perPage, total)

  if (total === 0) return null

  return (
    <div className="flex items-center justify-between px-4 py-3 border-t border-border">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <span className="hidden sm:inline">Filas por página:</span>
        <select
          value={perPage}
          onChange={(e) => { onPerPageChange(Number(e.target.value)); onPageChange(1); }}
          className="bg-muted border border-border rounded-lg px-2 py-1 text-xs text-foreground cursor-pointer hover:bg-accent transition-colors"
        >
          {[10, 25, 50, 100].map((n) => <option key={n} value={n}>{n}</option>)}
        </select>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-xs text-muted-foreground">
          {start}–{end} <span className="hidden sm:inline">de</span> {total}
        </span>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onPageChange(page - 1)}
            disabled={page <= 1}
            className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-accent disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <CaretLeft className="w-3.5 h-3.5 text-muted-foreground" weight="bold" />
          </button>
          <span className="text-xs text-muted-foreground min-w-14 text-center">
            {page} / {totalPages}
          </span>
          <button
            type="button"
            onClick={() => onPageChange(page + 1)}
            disabled={page >= totalPages}
            className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-accent disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <CaretRight className="w-3.5 h-3.5 text-muted-foreground" weight="bold" />
          </button>
        </div>
      </div>
    </div>
  )
}
