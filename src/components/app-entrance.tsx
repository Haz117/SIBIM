"use client";

import { useEffect, useState } from "react";
import { Logo } from "@/components/logo";

export function AppEntrance() {
  const [visible, setVisible] = useState(true);
  const [fadingOut, setFadingOut] = useState(false);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const holdMs = prefersReducedMotion ? 0 : 950;
    const fadeMs = prefersReducedMotion ? 0 : 350;
    // Safety timeout — never block longer than 3s regardless of state
    const maxMs = 3000;

    const startFade = setTimeout(() => setFadingOut(true), Math.min(holdMs, maxMs));
    const remove = setTimeout(() => setVisible(false), Math.min(holdMs + fadeMs, maxMs + fadeMs));

    return () => {
      clearTimeout(startFade);
      clearTimeout(remove);
    };
  }, []);

  if (!visible) return null;

  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 z-[100] flex items-center justify-center bg-background"
      style={{
        opacity: fadingOut ? 0 : 1,
        pointerEvents: fadingOut ? "none" : "auto",
        transition: "opacity 350ms cubic-bezier(0.4, 0, 0.2, 1)",
      }}
    >
      {/* Ambient blobs */}
      <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full opacity-20 blur-3xl animate-ambient-a"
        style={{ background: "var(--primary)" }} />
      <div className="absolute -bottom-32 -right-16 w-96 h-96 rounded-full opacity-10 blur-3xl animate-ambient-b"
        style={{ background: "var(--accent)" }} />

      <div className="flex flex-col items-center relative animate-in fade-in zoom-in-75 duration-500">
        <Logo size={60} className="drop-shadow-lg animate-logo-pulse" />

        <p
          className="mt-4 text-sm font-bold tracking-widest uppercase text-foreground animate-in fade-in slide-in-from-bottom-2 duration-500"
          style={{ animationDelay: "150ms", animationFillMode: "backwards" }}
        >
          SIBIM
        </p>
        <p
          className="mt-1 text-xs text-muted-foreground animate-in fade-in duration-500"
          style={{ animationDelay: "250ms", animationFillMode: "backwards" }}
        >
          Sistema Integral de Bienes Municipales
        </p>

        {/* Progress bar — fills linearly across the hold duration */}
        <div
          className="mt-5 w-28 h-0.5 rounded-full overflow-hidden animate-in fade-in duration-500"
          style={{
            background: "var(--border)",
            animationDelay: "300ms",
            animationFillMode: "backwards",
          }}
        >
          <div
            className="h-full rounded-full"
            style={{
              background: "var(--primary)",
              animation: "fill-progress 900ms ease-out forwards",
              animationDelay: "300ms",
            }}
          />
        </div>
      </div>
    </div>
  );
}
