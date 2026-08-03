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
      className="relative hidden lg:flex flex-col justify-between h-full overflow-hidden p-10 border-r"
      style={{ background: "var(--sidebar)", borderColor: "var(--sidebar-border)" }}
    >
      {/* Subtle dot-grid texture */}
      <svg className="absolute inset-0 w-full h-full opacity-[0.04]" aria-hidden="true">
        <defs>
          <pattern id="dot-grid" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
            <circle cx="1" cy="1" r="1" fill="var(--sidebar-foreground)" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#dot-grid)" />
      </svg>

      {/* Ambient blobs — same treatment as AppEntrance, for visual consistency */}
      <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full opacity-20 blur-3xl animate-ambient-a pointer-events-none"
        style={{ background: "var(--primary)" }} />
      <div className="absolute -bottom-24 -left-16 w-80 h-80 rounded-full opacity-10 blur-3xl animate-ambient-b pointer-events-none"
        style={{ background: "var(--accent)" }} />

      {/* Logo */}
      <div className="relative flex items-center gap-3">
        <Logo size={40} />
        <div>
          <span className="font-bold text-lg tracking-tight leading-none block text-sidebar-foreground">SIBIM</span>
          <span className="text-[10px] text-sidebar-foreground/50 tracking-wide uppercase">v2025</span>
        </div>
      </div>

      {/* Headline + features */}
      <div className="relative max-w-sm space-y-5">
        <div>
          <h2 className="text-2xl font-bold leading-tight text-sidebar-foreground">
            Control patrimonial por secretaría y dirección
          </h2>
          <p className="mt-3 text-sm text-sidebar-foreground/60 leading-relaxed">
            Cada área gestiona únicamente sus propios bienes; la Presidencia conserva
            visibilidad completa del inventario municipal.
          </p>
        </div>
        <ul className="space-y-2">
          {features.map((f) => (
            <li key={f} className="flex items-center gap-2 text-sm text-sidebar-foreground/80">
              <CheckCircle className="w-4 h-4 text-primary flex-shrink-0" weight="fill" />
              {f}
            </li>
          ))}
        </ul>
      </div>

      {/* Stats */}
      <div className="relative grid grid-cols-3 gap-3">
        {stats.map(({ icon: Icon, label, value }) => (
          <div key={label} className="rounded-xl bg-card border border-sidebar-border px-3 py-3 hover:border-primary/30 transition-colors">
            <Icon className="w-4 h-4 text-primary mb-2" weight="duotone" />
            <p className="text-2xl font-bold leading-none text-sidebar-foreground">{value}</p>
            <p className="text-[11px] text-sidebar-foreground/50 mt-1 leading-tight">{label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
