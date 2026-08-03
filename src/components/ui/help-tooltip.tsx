"use client"

import { Question } from "@phosphor-icons/react"
import { cn } from "@/lib/utils"

interface HelpTooltipProps {
  text: string
  className?: string
}

export function HelpTooltip({ text, className }: HelpTooltipProps) {
  return (
    <span className={cn("relative inline-flex group/tip align-middle", className)}>
      <button
        type="button"
        tabIndex={0}
        aria-label="Más información"
        className="w-3.5 h-3.5 flex items-center justify-center text-muted-foreground/50 hover:text-primary transition-colors"
      >
        <Question className="w-3.5 h-3.5" weight="bold" />
      </button>
      <span
        role="tooltip"
        className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 rounded-xl bg-popover border border-border text-popover-foreground text-xs px-3 py-2 shadow-xl opacity-0 group-hover/tip:opacity-100 transition-opacity duration-150 z-[200] text-center leading-relaxed"
      >
        {text}
        <span className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-border" />
      </span>
    </span>
  )
}
