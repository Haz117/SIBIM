"use client"

import { useRef, useState, useCallback, useMemo, useEffect } from "react"
import { createPortal } from "react-dom"
import { CalendarBlank, X, CaretLeft, CaretRight } from "@phosphor-icons/react"
import { cn } from "@/lib/utils"

interface DateInputProps {
  value?: string
  onChange?: (e: { target: { value: string } }) => void
  className?: string
  placeholder?: string
  disabled?: boolean
}

const MESES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
]
const DIAS = ["L", "M", "X", "J", "V", "S", "D"]

function pad(n: number) {
  return String(n).padStart(2, "0")
}

function isValidDate(d: string, m: string, y: string) {
  const day = parseInt(d), month = parseInt(m), year = parseInt(y)
  const date = new Date(year, month - 1, day)
  return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day
}

function buildMonthGrid(year: number, month0: number) {
  const firstOfMonth = new Date(year, month0, 1)
  // Monday-first offset (getDay(): 0=Sun..6=Sat)
  const startOffset = (firstOfMonth.getDay() + 6) % 7
  const daysInMonth = new Date(year, month0 + 1, 0).getDate()
  const daysInPrevMonth = new Date(year, month0, 0).getDate()

  const cells: { day: number; month0: number; year: number; current: boolean }[] = []
  for (let i = startOffset - 1; i >= 0; i--) {
    cells.push({ day: daysInPrevMonth - i, month0: month0 === 0 ? 11 : month0 - 1, year: month0 === 0 ? year - 1 : year, current: false })
  }
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ day: d, month0, year, current: true })
  }
  while (cells.length % 7 !== 0 || cells.length < 42) {
    const last = cells[cells.length - 1]
    const nextDay = last.day + 1
    const overflowsMonth = new Date(last.year, last.month0 + 1, 0).getDate() < nextDay
    cells.push(
      overflowsMonth
        ? { day: 1, month0: last.month0 === 11 ? 0 : last.month0 + 1, year: last.month0 === 11 ? last.year + 1 : last.year, current: false }
        : { day: nextDay, month0: last.month0, year: last.year, current: false }
    )
    if (cells.length >= 42) break
  }
  return cells
}

export function DateInput({ value, onChange, className, disabled }: DateInputProps) {
  const [day, setDay] = useState("")
  const [month, setMonth] = useState("")
  const [year, setYear] = useState("")
  const [focused, setFocused] = useState(false)
  const [open, setOpen] = useState(false)

  const today = new Date()
  const [viewYear, setViewYear] = useState(today.getFullYear())
  const [viewMonth0, setViewMonth0] = useState(today.getMonth())

  const dayRef = useRef<HTMLInputElement>(null)
  const monthRef = useRef<HTMLInputElement>(null)
  const yearRef = useRef<HTMLInputElement>(null)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const popoverRef = useRef<HTMLDivElement>(null)
  const [coords, setCoords] = useState({ top: 0, left: 0, width: 256 })

  // Position the popover in viewport (fixed) coordinates and portal it to
  // document.body — a Dialog ancestor may set overflow-y for its own tall-content
  // scrolling, which (per the CSS spec) forces overflow-x to clip too, so an
  // in-flow popover positioned near a dialog edge would otherwise get cut off.
  useEffect(() => {
    if (!open) return
    function reposition() {
      const rect = wrapperRef.current?.getBoundingClientRect()
      if (!rect) return
      const width = 256
      const estHeight = 300
      let left = rect.left
      if (left + width > window.innerWidth - 8) left = window.innerWidth - width - 8
      if (left < 8) left = 8
      const top = rect.bottom + estHeight + 6 > window.innerHeight
        ? Math.max(8, rect.top - estHeight - 6)
        : rect.bottom + 6
      setCoords({ top, left, width })
    }
    reposition()
    window.addEventListener("scroll", reposition, true)
    window.addEventListener("resize", reposition)
    return () => {
      window.removeEventListener("scroll", reposition, true)
      window.removeEventListener("resize", reposition)
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    // Capture phase + stopPropagation: an ancestor Dialog also closes itself on
    // Escape via its own document-level listener. Without intercepting Escape
    // before it bubbles there, one press would close the calendar AND the dialog.
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") { e.stopPropagation(); setOpen(false) }
    }
    function handleClickOutside(e: MouseEvent) {
      const target = e.target as Node
      if (wrapperRef.current?.contains(target)) return
      if (popoverRef.current?.contains(target)) return
      setOpen(false)
    }
    document.addEventListener("keydown", handleKeyDown, true)
    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("keydown", handleKeyDown, true)
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [open])

  // Sync from external controlled value — adjusted during render (not an effect),
  // by tracking the previous prop value, per React's "adjusting state" pattern.
  const [prevValue, setPrevValue] = useState(value)
  if (value !== prevValue) {
    setPrevValue(value)
    if (value && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
      const [y, m, d] = value.split("-")
      setYear(y); setMonth(m); setDay(d)
    } else if (!value) {
      setDay(""); setMonth(""); setYear("")
    }
  }

  const emit = useCallback((d: string, m: string, y: string) => {
    if (d.length === 2 && m.length === 2 && y.length === 4 && isValidDate(d, m, y)) {
      onChange?.({ target: { value: `${y}-${m}-${d}` } })
    } else {
      onChange?.({ target: { value: "" } })
    }
  }, [onChange])

  function handleDay(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value.replace(/\D/g, "").slice(0, 2)
    setDay(raw)
    emit(raw, month, year)
    if (raw.length === 2) monthRef.current?.focus()
  }

  function handleMonth(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value.replace(/\D/g, "").slice(0, 2)
    setMonth(raw)
    emit(day, raw, year)
    if (raw.length === 2) yearRef.current?.focus()
  }

  function handleYear(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value.replace(/\D/g, "").slice(0, 4)
    setYear(raw)
    emit(day, month, raw)
  }

  function handleDayKey(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "ArrowRight" && dayRef.current?.selectionStart === day.length) {
      e.preventDefault(); monthRef.current?.focus()
    }
  }

  function handleMonthKey(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace" && month === "") { e.preventDefault(); dayRef.current?.focus() }
    if (e.key === "ArrowLeft" && monthRef.current?.selectionStart === 0) { e.preventDefault(); dayRef.current?.focus() }
    if (e.key === "ArrowRight" && monthRef.current?.selectionStart === month.length) { e.preventDefault(); yearRef.current?.focus() }
  }

  function handleYearKey(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace" && year === "") { e.preventDefault(); monthRef.current?.focus() }
    if (e.key === "ArrowLeft" && yearRef.current?.selectionStart === 0) { e.preventDefault(); monthRef.current?.focus() }
  }

  function clear() {
    setDay(""); setMonth(""); setYear("")
    onChange?.({ target: { value: "" } })
    dayRef.current?.focus()
  }

  function openCalendar() {
    if (disabled) return
    const y = year.length === 4 ? parseInt(year) : today.getFullYear()
    const m0 = month ? parseInt(month) - 1 : today.getMonth()
    setViewYear(y)
    setViewMonth0(m0)
    setOpen((v) => !v)
  }

  function pickDay(cell: { day: number; month0: number; year: number }) {
    const d = pad(cell.day), m = pad(cell.month0 + 1), y = String(cell.year)
    setDay(d); setMonth(m); setYear(y)
    onChange?.({ target: { value: `${y}-${m}-${d}` } })
    setOpen(false)
  }

  function goToday() {
    pickDay({ day: today.getDate(), month0: today.getMonth(), year: today.getFullYear() })
  }

  function prevMonth() {
    if (viewMonth0 === 0) { setViewMonth0(11); setViewYear((y) => y - 1) }
    else setViewMonth0((m) => m - 1)
  }

  function nextMonth() {
    if (viewMonth0 === 11) { setViewMonth0(0); setViewYear((y) => y + 1) }
    else setViewMonth0((m) => m + 1)
  }

  const cells = useMemo(() => buildMonthGrid(viewYear, viewMonth0), [viewYear, viewMonth0])
  const hasValue = !!(day || month || year)
  const selected = day && month && year ? `${year}-${month}-${day}` : null
  const isComplete = day.length === 2 && month.length === 2 && year.length === 4
  const invalid = isComplete && !isValidDate(day, month, year)

  return (
    <div ref={wrapperRef} className="relative">
      <div
        className={cn(
          "relative flex items-center gap-1 h-9 rounded-xl border bg-muted/60 px-3 transition-all",
          invalid
            ? "border-destructive ring-3 ring-destructive/20"
            : focused || open
              ? "border-primary/50 ring-3 ring-primary/20 shadow-sm"
              : "border-border",
          disabled && "opacity-50 pointer-events-none",
          className
        )}
      >
        {/* Calendar icon — opens custom picker */}
        <button
          type="button"
          tabIndex={-1}
          disabled={disabled}
          onClick={openCalendar}
          className={cn(
            "shrink-0 transition-colors",
            focused || open ? "text-primary" : "text-muted-foreground",
          )}
        >
          <CalendarBlank className="w-3.5 h-3.5" weight="duotone" />
        </button>

        {/* DD */}
        <input
          ref={dayRef}
          type="text"
          inputMode="numeric"
          maxLength={2}
          value={day}
          onChange={handleDay}
          onKeyDown={handleDayKey}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder="DD"
          disabled={disabled}
          className="w-5 bg-transparent text-sm text-foreground outline-none text-center placeholder:text-muted-foreground/40 tabular-nums caret-primary"
        />

        <span className="text-muted-foreground/30 text-sm select-none leading-none">/</span>

        {/* MM */}
        <input
          ref={monthRef}
          type="text"
          inputMode="numeric"
          maxLength={2}
          value={month}
          onChange={handleMonth}
          onKeyDown={handleMonthKey}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder="MM"
          disabled={disabled}
          className="w-5 bg-transparent text-sm text-foreground outline-none text-center placeholder:text-muted-foreground/40 tabular-nums caret-primary"
        />

        <span className="text-muted-foreground/30 text-sm select-none leading-none">/</span>

        {/* AAAA */}
        <input
          ref={yearRef}
          type="text"
          inputMode="numeric"
          maxLength={4}
          value={year}
          onChange={handleYear}
          onKeyDown={handleYearKey}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder="AAAA"
          disabled={disabled}
          className="w-9 bg-transparent text-sm text-foreground outline-none text-center placeholder:text-muted-foreground/40 tabular-nums caret-primary"
        />

        {/* Clear */}
        {hasValue && !disabled && (
          <button
            type="button"
            tabIndex={-1}
            onClick={clear}
            className="ml-auto shrink-0 text-muted-foreground/40 hover:text-muted-foreground transition-colors"
          >
            <X className="w-3 h-3" />
          </button>
        )}
      </div>

      {/* Custom calendar popover — portaled to body so it's never clipped by a
          scrollable Dialog ancestor or stuck behind other stacking contexts */}
      {open && createPortal(
        <div
          ref={popoverRef}
          style={{ top: coords.top, left: coords.left, width: coords.width }}
          className="fixed z-50 rounded-xl bg-popover text-popover-foreground shadow-lg ring-1 ring-foreground/10 p-3 animate-in fade-in-0 zoom-in-95 duration-100"
        >
          <div className="flex items-center justify-between mb-2">
            <button type="button" onClick={prevMonth}
              className="w-6 h-6 flex items-center justify-center rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground transition-colors">
              <CaretLeft className="w-3.5 h-3.5" weight="bold" />
            </button>
            <span className="text-xs font-semibold text-foreground select-none">
              {MESES[viewMonth0]} {viewYear}
            </span>
            <button type="button" onClick={nextMonth}
              className="w-6 h-6 flex items-center justify-center rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground transition-colors">
              <CaretRight className="w-3.5 h-3.5" weight="bold" />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-y-1 mb-1">
            {DIAS.map((d, i) => (
              <span key={i} className="text-[10px] font-semibold text-muted-foreground/60 text-center">{d}</span>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-y-1">
            {cells.map((cell, i) => {
              const cellValue = `${cell.year}-${pad(cell.month0 + 1)}-${pad(cell.day)}`
              const isSelected = selected === cellValue
              const isToday = !isSelected && cellValue === `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`
              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => pickDay(cell)}
                  className={cn(
                    "h-7 w-7 mx-auto flex items-center justify-center rounded-lg text-xs transition-colors tabular-nums",
                    !cell.current && "text-muted-foreground/30",
                    cell.current && !isSelected && "text-foreground hover:bg-accent",
                    isToday && "ring-1 ring-primary/40 font-semibold",
                    isSelected && "bg-primary text-primary-foreground font-semibold"
                  )}
                >
                  {cell.day}
                </button>
              )
            })}
          </div>

          <div className="flex items-center justify-between mt-2 pt-2 border-t border-border">
            <button type="button" onClick={goToday}
              className="text-[11px] font-medium text-primary hover:underline">
              Hoy
            </button>
            {hasValue && (
              <button type="button" onClick={() => { clear(); setOpen(false) }}
                className="text-[11px] font-medium text-muted-foreground hover:text-foreground">
                Limpiar
              </button>
            )}
          </div>
        </div>,
        document.body
      )}
    </div>
  )
}
