"use client"
import { useEffect } from "react"

interface Shortcut {
  key: string
  meta?: boolean
  ctrl?: boolean
  shift?: boolean
  onTrigger: () => void
  /** Prevent when focus is inside an input/textarea/select */
  ignoreInputs?: boolean
}

export function useKeyboardShortcuts(shortcuts: Shortcut[]) {
  useEffect(() => {
    function handler(e: KeyboardEvent) {
      const target = e.target as HTMLElement
      for (const s of shortcuts) {
        if (s.key.toLowerCase() !== e.key.toLowerCase()) continue
        if (s.ctrl !== undefined && s.ctrl !== e.ctrlKey) continue
        if (s.meta !== undefined && s.meta !== e.metaKey) continue
        if (s.shift !== undefined && s.shift !== e.shiftKey) continue
        if (s.ignoreInputs !== false) {
          const tag = target.tagName.toLowerCase()
          if (tag === "input" || tag === "textarea" || tag === "select" || target.isContentEditable) continue
        }
        e.preventDefault()
        s.onTrigger()
        break
      }
    }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [shortcuts])
}
