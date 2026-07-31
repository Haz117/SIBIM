"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  SquaresFour,
  Package,
  FolderOpen,
  ArrowsLeftRight,
  ChartBar,
  Gear,
  Warning,
  SignOut,
  Buildings,
  Crown,
  ShieldCheck,
  Briefcase,
} from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { useData } from "@/lib/store";
import { Logo } from "@/components/logo";
import { useAuth } from "@/components/auth-provider";
import { isAreaAccessible } from "@/lib/access";
import { useUI } from "@/components/layout/ui-context";
import { logout } from "@/lib/auth-actions";
import { initials } from "@/lib/format";

function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const user = useAuth();
  const { products, profileName, avatarUrl } = useData();

  const scopedProducts = user.role === "admin" ? products : products.filter((p) => isAreaAccessible(user, p.area));
  const bienesEnAlerta = scopedProducts.filter((p) => p.estado === "bajo_stock" || p.estado === "agotado").length;
  const totalBienes = scopedProducts.length;

  const navGroups = [
    {
      label: "Institucional",
      items: [
        { href: "/dashboard", label: "Dashboard", icon: SquaresFour },
        { href: "/organigrama", label: "Organigrama", icon: Buildings },
      ],
    },
    {
      label: "Inventario",
      items: [
        { href: "/productos", label: "Productos", icon: Package, badge: totalBienes > 0 ? String(totalBienes) : undefined },
        { href: "/categorias", label: "Categorías", icon: FolderOpen },
        { href: "/movimientos", label: "Movimientos", icon: ArrowsLeftRight },
        { href: "/alertas", label: "Alertas", icon: Warning, badge: bienesEnAlerta > 0 ? String(bienesEnAlerta) : undefined, badgeColor: "destructive" as const },
        { href: "/reportes", label: "Reportes", icon: ChartBar },
      ],
    },
    {
      label: "Sistema",
      items: [
        { href: "/configuracion", label: "Configuración", icon: Gear },
      ],
    },
  ];

  return (
    <div className="flex flex-col h-full">
      {/* Institutional branding */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-sidebar-border flex-shrink-0">
        <Logo size={36} />
        <div className="min-w-0">
          <p className="font-bold text-sm text-sidebar-foreground truncate">SIBIM</p>
          <p className="text-xs text-muted-foreground truncate">H. Ayuntamiento</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto">
        {navGroups.map((group, i) => (
          <div key={group.label} className={cn("space-y-1", i > 0 && "mt-5")}>
            <p className="px-3 mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-sidebar-foreground/35">
              {group.label}
            </p>
            {group.items.map(({ href, label, icon: Icon, badge, badgeColor }) => {
              const isActive = pathname === href || pathname.startsWith(href + "/");
              return (
                <Link key={href} href={href}
                  onClick={onNavigate}
                  className={cn(
                    "relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group",
                    isActive
                      ? "text-primary-foreground shadow-sm"
                      : "text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent hover:translate-x-0.5"
                  )}
                  style={isActive ? { background: "var(--primary)" } : {}}>
                  {isActive && (
                    <span className="absolute -left-3 top-1/2 -translate-y-1/2 h-5 w-1 rounded-r-full"
                      style={{ background: "var(--primary)" }} />
                  )}
                  <Icon className={cn("w-4.5 h-4.5 flex-shrink-0", isActive ? "text-primary-foreground" : "text-sidebar-foreground/50 group-hover:text-sidebar-foreground/80")}
                    weight={isActive ? "fill" : "regular"} />
                  <span className="flex-1">{label}</span>
                  {badge && (
                    <Badge
                      variant={badgeColor === "destructive" ? "destructive" : "secondary"}
                      className={cn("h-5 px-1.5 text-xs", !badgeColor && "bg-sidebar-accent text-sidebar-foreground border-0")}>
                      {badge}
                    </Badge>
                  )}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* User section */}
      <div className="p-3 border-t border-sidebar-border flex-shrink-0">
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-sidebar-accent transition-all group">
          <div className="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center text-primary-foreground text-xs font-bold flex-shrink-0"
            style={{ background: avatarUrl ? "transparent" : "var(--primary)" }}>
            {avatarUrl
              ? <img src={avatarUrl} alt="" className="w-full h-full object-cover" />
              : initials(profileName ?? user.nombre)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-sidebar-foreground truncate">{profileName ?? user.nombre}</p>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              {user.role === "admin" && <Crown className="w-3 h-3 text-primary flex-shrink-0" weight="fill" />}
              {user.role === "secretario" && <ShieldCheck className="w-3 h-3 text-primary flex-shrink-0" weight="fill" />}
              {user.role === "direccion" && <Briefcase className="w-3 h-3 flex-shrink-0" />}
              <span className="truncate">{user.area ?? "Superusuario"}</span>
            </div>
          </div>
          <form action={logout}>
            <button type="submit" aria-label="Cerrar sesión"
              className="text-sidebar-foreground/30 group-hover:text-sidebar-foreground/60 hover:text-red-400! flex-shrink-0 transition-colors">
              <SignOut className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export function Sidebar() {
  const { sidebarOpen, setSidebarOpen } = useUI();

  return (
    <>
      {/* Desktop fixed sidebar */}
      <aside className="hidden lg:flex fixed left-0 top-0 h-full w-64 flex-col z-50 bg-sidebar border-r border-sidebar-border">
        <SidebarNav />
      </aside>

      {/* Mobile drawer */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent side="left" showCloseButton={false}
          className="p-0 bg-sidebar border-sidebar-border"
          style={{ width: "16rem" }}>
          <SidebarNav onNavigate={() => setSidebarOpen(false)} />
        </SheetContent>
      </Sheet>
    </>
  );
}
