"use client"

import { useBeforeUnload } from "@/hooks/use-before-unload"

/** Activate browser's native "leave page?" dialog whenever the dashboard is open. */
export function ExitGuard() {
  useBeforeUnload(true)
  return null
}
