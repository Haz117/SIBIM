"use client";

import Link from "next/link";
import { ArrowLeft, House } from "@phosphor-icons/react";
import { Logo } from "@/components/logo";

export default function NotFound() {
  return (
    <div
      className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden"
      style={{ background: "linear-gradient(155deg, #4c1d95 0%, #6d28d9 50%, #7c3aed 100%)" }}
    >
      {/* Dot-grid texture */}
      <svg className="absolute inset-0 w-full h-full opacity-[0.05]" aria-hidden="true">
        <defs>
          <pattern id="nf-dots" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
            <circle cx="1" cy="1" r="1" fill="white" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#nf-dots)" />
      </svg>

      {/* Ambient blobs */}
      <div
        className="absolute -top-24 -right-24 w-[500px] h-[500px] rounded-full opacity-20 blur-3xl animate-ambient-a pointer-events-none"
        style={{ background: "#a78bfa" }}
      />
      <div
        className="absolute -bottom-32 -left-20 w-[480px] h-[480px] rounded-full opacity-15 blur-3xl animate-ambient-b pointer-events-none"
        style={{ background: "#c4b5fd" }}
      />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center text-center px-6 gap-5">

        {/* Logo */}
        <div className="animate-in fade-in zoom-in-75 duration-500 fill-mode-backwards">
          <Logo size={52} className="drop-shadow-2xl" />
        </div>

        {/* 404 watermark */}
        <div
          className="select-none leading-none font-black text-white/10 animate-in fade-in duration-700 fill-mode-backwards"
          style={{
            fontSize: "clamp(100px, 25vw, 200px)",
            animationDelay: "80ms",
            lineHeight: 1,
          }}
        >
          404
        </div>

        {/* Message */}
        <div
          className="-mt-6 space-y-2 animate-in fade-in slide-in-from-bottom-4 duration-600 fill-mode-backwards"
          style={{ animationDelay: "180ms" }}
        >
          <h1 className="text-2xl sm:text-3xl font-bold text-white leading-tight">
            Página no encontrada
          </h1>
          <p className="text-sm text-white/65 max-w-xs leading-relaxed">
            La ruta que buscas no existe o ya no está disponible en el sistema.
          </p>
        </div>

        {/* Actions */}
        <div
          className="flex flex-col sm:flex-row gap-3 animate-in fade-in slide-in-from-bottom-4 duration-600 fill-mode-backwards"
          style={{ animationDelay: "300ms" }}
        >
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white border border-white/25 bg-white/15 hover:bg-white/25 transition-all duration-200 backdrop-blur-sm active:scale-95"
          >
            <House className="w-4 h-4" weight="duotone" />
            Ir al Dashboard
          </Link>
          <button
            type="button"
            onClick={() => window.history.back()}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white/70 hover:text-white border border-white/10 hover:border-white/25 hover:bg-white/10 transition-all duration-200 active:scale-95"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver atrás
          </button>
        </div>

        {/* Footer */}
        <p
          className="text-[11px] text-white/30 animate-in fade-in duration-700 fill-mode-backwards mt-2"
          style={{ animationDelay: "450ms" }}
        >
          H. Ayuntamiento Municipal · SIBIM · Sistema Integral de Bienes Municipales
        </p>
      </div>
    </div>
  );
}
