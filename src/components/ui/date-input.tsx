import * as React from "react"
import { CalendarBlank } from "@phosphor-icons/react"

import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"

function DateInput({ className, ...props }: React.ComponentProps<"input">) {
  return (
    <div className="relative">
      <CalendarBlank className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none z-10" />
      <Input
        type="date"
        data-slot="date-input"
        className={cn(
          "pl-8 bg-muted border-border text-foreground [color-scheme:light] dark:[color-scheme:dark]",
          "[&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:inset-0 [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-0",
          className
        )}
        {...props}
      />
    </div>
  )
}

export { DateInput }
