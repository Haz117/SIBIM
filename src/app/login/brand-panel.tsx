import { Buildings, ChartLineUp, ShieldCheck } from "@phosphor-icons/react";
import { Logo } from "@/components/logo";
import { AUTH_USERS } from "@/lib/auth-users";
import { mockCategories } from "@/lib/mock-data";
import { AREAS_DATA } from "@/lib/areas-list";

const stats = [
  { icon: Buildings, label: "Secretarías", value: AREAS_DATA.secretarias.length },
  { icon: ChartLineUp, label: "Categorías de bienes", value: mockCategories.length },
  { icon: ShieldCheck, label: "Usuarios con acceso", value: AUTH_USERS.length },
];

export function BrandPanel() {
  return (
    <div className="relative hidden lg:flex flex-col justify-between h-full overflow-hidden p-10 text-white"
      style={{ background: "linear-gradient(155deg, var(--primary), var(--accent))" }}>

      {/* Decorative repeating building-glyph pattern */}
      <svg className="absolute inset-0 w-full h-full opacity-[0.08]" aria-hidden="true">
        <defs>
          <pattern id="building-pattern" x="0" y="0" width="72" height="72" patternUnits="userSpaceOnUse">
            <path d="M16 34 L36 20 L56 34 Z" fill="white" />
            <rect x="20" y="34" width="32" height="22" fill="white" />
            <rect x="26" y="38" width="3" height="14" fill="var(--primary)" />
            <rect x="34.5" y="38" width="3" height="14" fill="var(--primary)" />
            <rect x="43" y="38" width="3" height="14" fill="var(--primary)" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#building-pattern)" />
      </svg>

      <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full bg-white/10 blur-3xl animate-ambient-a" />
      <div className="absolute -bottom-24 -left-16 w-72 h-72 rounded-full bg-white/10 blur-3xl animate-ambient-b" />

      <div className="relative flex items-center gap-3">
        <Logo size={40} />
        <span className="font-bold text-lg tracking-tight">SIBIM</span>
      </div>

      <div className="relative max-w-sm">
        <h2 className="text-3xl font-bold leading-tight">
          Control patrimonial claro, por cada secretaría y dirección.
        </h2>
        <p className="mt-3 text-sm text-white/80 leading-relaxed">
          Un inventario municipal donde cada área ve y gestiona únicamente sus propios bienes,
          y la Presidencia tiene visibilidad completa en un solo lugar.
        </p>
      </div>

      <div className="relative grid grid-cols-3 gap-3">
        {stats.map(({ icon: Icon, label, value }) => (
          <div key={label} className="rounded-xl bg-white/10 backdrop-blur-sm border border-white/15 px-3 py-3">
            <Icon className="w-4 h-4 text-white/70 mb-2" weight="duotone" />
            <p className="text-xl font-bold leading-none">{value}</p>
            <p className="text-[11px] text-white/70 mt-1 leading-tight">{label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
