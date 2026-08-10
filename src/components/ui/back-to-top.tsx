"use client"

import { useEffect, useState } from "react"
import { ArrowUp } from "@phosphor-icons/react"

export function BackToTop() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = document.querySelector("main")
    if (!el) return
    const onScroll = () => setVisible(el.scrollTop > 300)
    el.addEventListener("scroll", onScroll, { passive: true })
    return () => el.removeEventListener("scroll", onScroll)
  }, [])

  if (!visible) return null

  return (
    <button
      type="button"
      onClick={() => document.querySelector("main")?.scrollTo({ top: 0, behavior: "smooth" })}
      aria-label="Volver arriba"
      className="fixed bottom-20 right-5 z-50 w-10 h-10 rounded-full flex items-center justify-center shadow-lg border border-border text-muted-foreground hover:text-foreground hover:bg-accent transition-all animate-in fade-in zoom-in-75 duration-200"
      style={{ background: "var(--card)" }}
    >
      <ArrowUp className="w-4 h-4" />
    </button>
  )
}
