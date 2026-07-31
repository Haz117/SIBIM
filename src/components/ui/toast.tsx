"use client"

import { createContext, useContext, useState, useCallback } from "react"
import { CheckCircle, XCircle, Info, WarningOctagon, X } from "@phosphor-icons/react"

type ToastVariant = "success" | "error" | "info" | "warning"

interface ToastAction {
  label: string
  onClick: () => void
}

interface ToastItem {
  id: string
  message: string
  variant: ToastVariant
  action?: ToastAction
  exiting?: boolean
}

interface ToastCtx {
  toast: (message: string, variant?: ToastVariant, action?: ToastAction) => void
}

const Ctx = createContext<ToastCtx>({ toast: () => {} })
export const useToast = () => useContext(Ctx)

const CONFIG = {
  success: { icon: CheckCircle, color: "#10B981", bg: "rgba(16,185,129,0.12)", border: "rgba(16,185,129,0.3)" },
  error: { icon: XCircle, color: "#EF4444", bg: "rgba(239,68,68,0.12)", border: "rgba(239,68,68,0.3)" },
  info: { icon: Info, color: "#3B82F6", bg: "rgba(59,130,246,0.12)", border: "rgba(59,130,246,0.3)" },
  warning: { icon: WarningOctagon, color: "#F59E0B", bg: "rgba(245,158,11,0.12)", border: "rgba(245,158,11,0.3)" },
} as const

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([])

  function dismiss(id: string) {
    setToasts((p) => p.map((t) => t.id === id ? { ...t, exiting: true } : t))
    setTimeout(() => setToasts((p) => p.filter((t) => t.id !== id)), 320)
  }

  const toast = useCallback((message: string, variant: ToastVariant = "success", action?: ToastAction) => {
    const id = Math.random().toString(36).slice(2)
    setToasts((p) => [...p, { id, message, variant, action }])
    const ttl = action ? 6000 : 3800
    setTimeout(() => dismiss(id), ttl)
  }, [])

  return (
    <Ctx.Provider value={{ toast }}>
      {children}
      <div role="status" aria-live="polite" aria-atomic="false" className="fixed bottom-5 right-5 z-[300] flex flex-col gap-2 pointer-events-none">
        {toasts.map((t) => {
          const { icon: Icon, color, bg, border } = CONFIG[t.variant]
          return (
            <div
              key={t.id}
              className={`pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-2xl shadow-2xl border ${
                t.exiting
                  ? "animate-out fade-out slide-out-to-right-4 duration-300 fill-mode-forwards"
                  : "animate-in slide-in-from-bottom-3 fade-in"
              }`}
              style={{ background: "var(--card)", borderColor: border, minWidth: 280, maxWidth: 420 }}
            >
              <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: bg }}>
                <Icon className="w-4 h-4" weight="fill" style={{ color }} />
              </div>
              <p className="text-sm text-foreground flex-1 leading-snug">{t.message}</p>
              {t.action && (
                <button
                  onClick={() => { t.action!.onClick(); dismiss(t.id); }}
                  className="text-xs font-semibold shrink-0 px-2.5 py-1 rounded-lg border transition-all hover:opacity-80 active:scale-95"
                  style={{ color, borderColor: border, background: bg }}
                >
                  {t.action.label}
                </button>
              )}
              <button
                onClick={() => dismiss(t.id)}
                className="text-muted-foreground/40 hover:text-muted-foreground transition-colors flex-shrink-0"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )
        })}
      </div>
    </Ctx.Provider>
  )
}
