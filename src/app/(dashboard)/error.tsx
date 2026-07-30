"use client";

import { useEffect } from "react";
import { ArrowClockwise, House, WarningOctagon } from "@phosphor-icons/react";
import { Logo } from "@/components/logo";
import Link from "next/link";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[SIBIM] Dashboard error:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6 gap-6">
      <div className="flex flex-col items-center gap-4 text-center max-w-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="relative">
          <Logo size={48} className="drop-shadow-lg" />
          <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-destructive flex items-center justify-center ring-2 ring-background">
            <WarningOctagon className="w-3 h-3 text-white" weight="fill" />
          </div>
        </div>

        <div className="space-y-1.5">
          <h1 className="text-xl font-bold text-foreground">Algo salió mal</h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Ocurrió un error inesperado al cargar esta sección.
            {error.digest && (
              <span className="block mt-1 font-mono text-[11px] text-muted-foreground/60">
                #{error.digest}
              </span>
            )}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-2.5 w-full mt-1">
          <button
            type="button"
            onClick={reset}
            className="flex-1 inline-flex items-center justify-center gap-2 h-10 px-4 rounded-xl text-sm font-semibold text-primary-foreground transition-all active:scale-[0.98]"
            style={{ background: "var(--primary)" }}
          >
            <ArrowClockwise className="w-4 h-4" />
            Reintentar
          </button>
          <Link
            href="/dashboard"
            className="flex-1 inline-flex items-center justify-center gap-2 h-10 px-4 rounded-xl text-sm font-semibold text-foreground border border-border hover:bg-accent transition-all active:scale-[0.98]"
          >
            <House className="w-4 h-4" />
            Ir al Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
