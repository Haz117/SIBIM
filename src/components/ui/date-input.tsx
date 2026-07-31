"use client"

import { useRef, useState, useCallback } from "react"
import { CalendarBlank, X } from "@phosphor-icons/react"
import { cn } from "@/lib/utils"

interface DateInputProps {
  value?: string
  onChange?: (e: { target: { value: string } }) => void
  className?: string
  placeholder?: string
  disabled?: boolean
}

export function DateInput({ value, onChange, className, disabled }: DateInputProps) {
  const [day, setDay] = useState("")
  const [month, setMonth] = useState("")
  const [year, setYear] = useState("")
  const [focused, setFocused] = useState(false)

  const dayRef = useRef<HTMLInputElement>(null)
  const monthRef = useRef<HTMLInputElement>(null)
  const yearRef = useRef<HTMLInputElement>(null)
  const nativeRef = useRef<HTMLInputElement>(null)

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
    if (d.length === 2 && m.length === 2 && y.length === 4) {
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

  function handleNativePick(e: React.ChangeEvent<HTMLInputElement>) {
    const v = e.target.value
    if (v) {
      const [y, m, d] = v.split("-")
      setYear(y); setMonth(m); setDay(d)
      onChange?.({ target: { value: v } })
    }
  }

  function clear() {
    setDay(""); setMonth(""); setYear("")
    onChange?.({ target: { value: "" } })
    dayRef.current?.focus()
  }

  const hasValue = !!(day || month || year)

  return (
    <div
      className={cn(
        "relative flex items-center gap-1 h-9 rounded-xl border bg-muted/60 px-3 transition-all",
        focused
          ? "border-primary/50 ring-3 ring-primary/20 shadow-sm"
          : "border-border",
        disabled && "opacity-50 pointer-events-none",
        className
      )}
    >
      {/* Calendar icon — opens native picker */}
      <button
        type="button"
        tabIndex={-1}
        disabled={disabled}
        onClick={() => nativeRef.current?.showPicker?.()}
        className={cn(
          "shrink-0 transition-colors",
          focused ? "text-primary" : "text-muted-foreground",
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

      {/* Hidden native date input for showPicker() fallback */}
      <input
        ref={nativeRef}
        type="date"
        tabIndex={-1}
        value={year.length === 4 && month && day ? `${year}-${month}-${day}` : ""}
        onChange={handleNativePick}
        className="sr-only"
      />
    </div>
  )
}
