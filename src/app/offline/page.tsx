"use client"

export default function OfflinePage() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-6 p-8 text-center">
      <div
        className="w-20 h-20 rounded-2xl flex items-center justify-center"
        style={{ background: "linear-gradient(135deg, #7c3aed, #2e1065)" }}
      >
        <svg width="44" height="44" viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M22 6L6 16v20h12v-8h8v8h12V16L22 6z"
            fill="white"
            opacity="0.95"
          />
          <rect x="17" y="28" width="10" height="8" rx="1" fill="rgba(76,29,149,0.5)" />
          <rect x="9" y="19" width="7" height="7" rx="1" fill="rgba(76,29,149,0.4)" />
          <rect x="28" y="19" width="7" height="7" rx="1" fill="rgba(76,29,149,0.4)" />
        </svg>
      </div>

      <div className="space-y-2 max-w-sm">
        <h1 className="text-xl font-semibold text-foreground">Sin conexión</h1>
        <p className="text-sm text-muted-foreground leading-relaxed">
          No se puede conectar con el servidor. Verifica tu conexión a internet e intenta de nuevo.
        </p>
      </div>

      <button
        type="button"
        onClick={() => window.location.reload()}
        className="px-5 py-2 rounded-xl text-sm font-medium text-white transition-opacity hover:opacity-90"
        style={{ background: "var(--primary)" }}
      >
        Reintentar
      </button>

      <p className="text-xs text-muted-foreground">SIBIM — Sistema Integral de Bienes Municipales</p>
    </div>
  )
}
