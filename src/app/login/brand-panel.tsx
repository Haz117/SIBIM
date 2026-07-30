import { Buildings, ChartLineUp, ShieldCheck, CheckCircle } from "@phosphor-icons/react";
import { Logo } from "@/components/logo";
import { AUTH_USERS } from "@/lib/auth-users";
import { mockCategories } from "@/lib/mock-data";
import { AREAS_DATA } from "@/lib/areas-list";

const stats = [
  { icon: Buildings, label: "Secretarías", value: AREAS_DATA.secretarias.length },
  { icon: ChartLineUp, label: "Categorías de bienes", value: mockCategories.length },
  { icon: ShieldCheck, label: "Usuarios con acceso", value: AUTH_USERS.length },
];

const features = [
  "Inventario por área y secretaría",
  "Alertas de existencias bajas",
  "Trazabilidad de movimientos",
];

export function BrandPanel() {
  return (
    <div
      className="relative hidden lg:flex flex-col justify-between h-full overflow-hidden p-10 text-white"
      style={{ background: "linear-gradient(155deg, #4c1d95 0%, #6d28d9 45%, #7c3aed 100%)" }}
    >
      {/* Subtle dot-grid texture */}
      <svg className="absolute inset-0 w-full h-full opacity-[0.06]" aria-hidden="true">
        <defs>
          <pattern id="dot-grid" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
            <circle cx="1" cy="1" r="1" fill="white" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#dot-grid)" />
      </svg>

      {/* Ambient blobs */}
      <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full opacity-20 blur-3xl animate-ambient-a"
        style={{ background: "#a78bfa" }} />
      <div className="absolute -bottom-24 -left-16 w-80 h-80 rounded-full opacity-15 blur-3xl animate-ambient-b"
        style={{ background: "#c4b5fd" }} />

      {/* Logo */}
      <div className="relative flex items-center gap-3">
        <Logo size={40} />
        <div>
          <span className="font-bold text-lg tracking-tight leading-none block">SIBIM</span>
          <span className="text-[10px] text-white/60 tracking-wide uppercase">v2025</span>
        </div>
      </div>

      {/* Headline + features */}
      <div className="relative max-w-sm space-y-5">
        <div>
          <h2 className="text-3xl font-bold leading-tight">
            Control patrimonial claro, por cada secretaría.
          </h2>
          <p className="mt-3 text-sm text-white/75 leading-relaxed">
            Un inventario municipal donde cada área gestiona únicamente sus propios bienes
            y la Presidencia mantiene visibilidad completa en un solo lugar.
          </p>
        </div>
        <ul className="space-y-2">
          {features.map((f) => (
            <li key={f} className="flex items-center gap-2 text-sm text-white/90">
              <CheckCircle className="w-4 h-4 text-violet-300 flex-shrink-0" weight="fill" />
              {f}
            </li>
          ))}
        </ul>
      </div>

      {/* Stats */}
      <div className="relative grid grid-cols-3 gap-3">
        {stats.map(({ icon: Icon, label, value }) => (
          <div key={label} className="rounded-xl bg-white/10 backdrop-blur-sm border border-white/15 px-3 py-3 hover:bg-white/15 transition-colors">
            <Icon className="w-4 h-4 text-violet-300 mb-2" weight="duotone" />
            <p className="text-2xl font-bold leading-none">{value}</p>
            <p className="text-[11px] text-white/65 mt-1 leading-tight">{label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
