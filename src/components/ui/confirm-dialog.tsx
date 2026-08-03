"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Trash, WarningOctagon } from "@phosphor-icons/react"

interface ConfirmDialogProps {
  open: boolean
  title: string
  description: string
  confirmLabel?: string
  onConfirm: () => void
  onCancel: () => void
  destructive?: boolean
}

export function ConfirmDialog({
  open, title, description,
  confirmLabel = "Confirmar",
  onConfirm, onCancel,
  destructive = false,
}: ConfirmDialogProps) {
  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onCancel() }}>
      <DialogContent className="max-w-sm border-border" style={{ background: "var(--card)" }}>
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${destructive ? "bg-rose-500/10" : "bg-amber-500/10"}`}>
              {destructive
                ? <Trash className="w-5 h-5 text-rose-500" weight="duotone" />
                : <WarningOctagon className="w-5 h-5 text-amber-500" weight="duotone" />}
            </div>
            <DialogTitle className="text-foreground text-base">{title}</DialogTitle>
          </div>
        </DialogHeader>
        <p className="text-sm text-muted-foreground mt-1 mb-5 pl-12">{description}</p>
        <div className="flex gap-3">
          <Button variant="outline" onClick={onCancel} className="flex-1 border-border text-muted-foreground hover:bg-accent">
            Cancelar
          </Button>
          <Button
            onClick={onConfirm}
            className="flex-1 text-white"
            style={{ background: destructive ? "#F43F5E" : "var(--primary)" }}
          >
            {confirmLabel}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
