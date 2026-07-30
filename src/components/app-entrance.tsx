"use client";

import { useEffect, useState } from "react";
import { Logo } from "@/components/logo";

/**
 * Branded splash shown once per full page load/reload (mounted in the root
 * layout, so it does NOT replay on client-side navigation between routes —
 * only on a real open/refresh of the app).
 */
export function AppEntrance() {
  const [visible, setVisible] = useState(true);
  const [fadingOut, setFadingOut] = useState(false);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const holdMs = prefersReducedMotion ? 0 : 900;
    const fadeMs = prefersReducedMotion ? 0 : 300;

    const startFade = setTimeout(() => setFadingOut(true), holdMs);
    const remove = setTimeout(() => setVisible(false), holdMs + fadeMs);

    return () => {
      clearTimeout(startFade);
      clearTimeout(remove);
    };
  }, []);

  if (!visible) return null;

  return (
    <div
      aria-hidden="true"
      className={`fixed inset-0 z-[100] flex items-center justify-center bg-background transition-opacity duration-300 ${
        fadingOut ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
    >
      <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full opacity-20 blur-3xl animate-ambient-a"
        style={{ background: "var(--primary)" }} />
      <div className="absolute -bottom-32 -right-16 w-96 h-96 rounded-full opacity-15 blur-3xl animate-ambient-b"
        style={{ background: "var(--accent)" }} />

      <div className="flex flex-col items-center relative animate-in fade-in zoom-in-75 duration-500">
        <Logo size={56} className="drop-shadow-lg animate-logo-pulse" />
        <p className="mt-4 text-sm font-bold tracking-wide text-foreground animate-in fade-in slide-in-from-bottom-1 duration-500"
          style={{ animationDelay: "150ms", animationFillMode: "backwards" }}>
          SIBIM
        </p>
        <div className="mt-3 w-24 h-0.5 rounded-full bg-muted overflow-hidden animate-in fade-in duration-500"
          style={{ animationDelay: "250ms", animationFillMode: "backwards" }}>
          <div className="h-full w-1/3 rounded-full animate-splash-progress" style={{ background: "var(--primary)" }} />
        </div>
      </div>
    </div>
  );
}
