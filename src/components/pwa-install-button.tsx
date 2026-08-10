"use client"

import { useEffect, useState } from "react"
import { DownloadSimple } from "@phosphor-icons/react"

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>
}

export function PWAInstallButton() {
  const [prompt, setPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [installing, setInstalling] = useState(false)

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault()
      setPrompt(e as BeforeInstallPromptEvent)
    }
    const installed = () => setPrompt(null)

    window.addEventListener("beforeinstallprompt", handler)
    window.addEventListener("appinstalled", installed)
    return () => {
      window.removeEventListener("beforeinstallprompt", handler)
      window.removeEventListener("appinstalled", installed)
    }
  }, [])

  if (!prompt) return null

  async function handleInstall() {
    if (!prompt || installing) return
    setInstalling(true)
    try {
      await prompt.prompt()
      const { outcome } = await prompt.userChoice
      if (outcome === "accepted") setPrompt(null)
    } finally {
      setInstalling(false)
    }
  }

  return (
    <button
      type="button"
      onClick={handleInstall}
      disabled={installing}
      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent hover:translate-x-0.5 disabled:opacity-50"
    >
      <DownloadSimple className="w-4.5 h-4.5 flex-shrink-0 text-sidebar-foreground/50" />
      <span className="flex-1 text-left">Instalar app</span>
    </button>
  )
}
