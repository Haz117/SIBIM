"use client"

import { useEffect } from "react"

/**
 * Shows a browser "leave page?" confirmation when the user tries to close
 * the tab, navigate away, or refresh while `enabled` is true.
 */
export function useBeforeUnload(enabled = true) {
  useEffect(() => {
    if (!enabled) return
    function handler(e: BeforeUnloadEvent) {
      e.preventDefault()
    }
    window.addEventListener("beforeunload", handler)
    return () => window.removeEventListener("beforeunload", handler)
  }, [enabled])
}
