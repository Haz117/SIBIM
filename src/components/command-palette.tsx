"use client";

import { useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import {
  MagnifyingGlass,
  SquaresFour,
  Package,
  FolderOpen,
  ArrowsLeftRight,
  ChartBar,
  Gear,
  Warning,
  Buildings,
} from "@phosphor-icons/react";
import { useData } from "@/lib/store";
import { useAuth } from "@/components/auth-provider";
import { isAreaAccessible } from "@/lib/access";
import { useUI } from "@/components/layout/ui-context";
import { cn } from "@/lib/utils";

const PAGES = [
  { href: "/dashboard", label: "Dashboard", icon: SquaresFour, desc: "Resumen general" },
  { href: "/organigrama", label: "Organigrama", icon: Buildings, desc: "Estructura municipal" },
  { href: "/productos", label: "Productos", icon: Package, desc: "Inventario de bienes" },
  { href: "/categorias", label: "Categorías", icon: FolderOpen, desc: "Categorías de bienes" },
  { href: "/movimientos", label: "Movimientos", icon: ArrowsLeftRight, desc: "Entradas y salidas" },
  { href: "/alertas", label: "Alertas", icon: Warning, desc: "Existencias bajas" },
  { href: "/reportes", label: "Reportes", icon: ChartBar, desc: "Informes y auditorías" },
  { href: "/configuracion", label: "Configuración", icon: Gear, desc: "Cuenta y preferencias" },
];

export function CommandPalette() {
  const { commandOpen, setCommandOpen } = useUI();
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(-1);
  const router = useRouter();
  const user = useAuth();
  const { products } = useData();

  const scopedProducts = user.role === "admin"
    ? products
    : products.filter((p) => isAreaAccessible(user, p.area));

  const filteredPages = useMemo(() => {
    if (!query) return PAGES;
    const q = query.toLowerCase();
    return PAGES.filter((p) => p.label.toLowerCase().includes(q) || p.desc.toLowerCase().includes(q));
  }, [query]);

  const filteredProducts = useMemo(() => {
    if (!query) return [];
    const q = query.toLowerCase();
    return scopedProducts
      .filter((p) => p.nombre.toLowerCase().includes(q) || p.codigo.toLowerCase().includes(q))
      .slice(0, 5);
  }, [query, scopedProducts]);

  // Reset selection whenever query changes — adjusted during render (not an effect).
  const [prevQuery, setPrevQuery] = useState(query);
  if (prevQuery !== query) {
    setPrevQuery(query);
    setSelected(-1);
  }

  const allItems = useMemo(() => [
    ...filteredPages.map((p) => ({ type: "page" as const, ...p })),
    ...filteredProducts.map((p) => ({ type: "product" as const, href: `/productos?view=${p.id}`, label: p.nombre, id: p.id, _product: p })),
  ], [filteredPages, filteredProducts]);

  function go(href: string) {
    router.push(href);
    setCommandOpen(false);
    setQuery("");
  }

  function handleOpenChange(open: boolean) {
    setCommandOpen(open);
    if (!open) setQuery("");
  }

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelected((s) => Math.min(s + 1, allItems.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelected((s) => Math.max(s - 1, 0));
    } else if (e.key === "Enter") {
      if (selected >= 0 && selected < allItems.length) {
        e.preventDefault();
        go(allItems[selected].href);
      }
    }
  }, [allItems, selected]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <Dialog open={commandOpen} onOpenChange={handleOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="top-[18%] -translate-y-0 max-w-lg sm:max-w-lg p-0 gap-0 overflow-hidden border-border"
        style={{ background: "var(--card)" }}
        onKeyDown={handleKeyDown}
      >
        {/* Search input */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
          <MagnifyingGlass className="w-4 h-4 text-muted-foreground flex-shrink-0" />
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar página o producto..."
            className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
          />
          <kbd className="text-[10px] text-muted-foreground border border-border rounded px-1.5 py-0.5 bg-muted">Esc</kbd>
        </div>

        {/* Results */}
        <div className="max-h-80 overflow-y-auto p-2">
          {filteredPages.length > 0 && (
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60 px-2 py-1.5">Páginas</p>
              {filteredPages.map(({ href, label, icon: Icon, desc }, pageIdx) => {
                const i = pageIdx;
                return (
                  <button
                    key={href}
                    type="button"
                    onClick={() => go(href)}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-accent text-left transition-colors group",
                      i === selected && "bg-accent"
                    )}
                  >
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-accent group-hover:bg-primary/15 flex-shrink-0 transition-colors">
                      <Icon className="w-4 h-4 text-primary" weight="duotone" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground">{label}</p>
                      <p className="text-xs text-muted-foreground">{desc}</p>
                    </div>
                    <kbd className="ml-auto text-[10px] text-muted-foreground border border-border rounded px-1.5 py-0.5 opacity-0 group-hover:opacity-100 transition-opacity">↵</kbd>
                  </button>
                );
              })}
            </div>
          )}

          {filteredProducts.length > 0 && (
            <div className="mt-1">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60 px-2 py-1.5">Productos</p>
              {filteredProducts.map((p, prodIdx) => {
                const i = filteredPages.length + prodIdx;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => go(`/productos?view=${p.id}`)}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-accent text-left transition-colors group",
                      i === selected && "bg-accent"
                    )}
                  >
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-muted flex-shrink-0">
                      <Package className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-foreground truncate">{p.nombre}</p>
                      <p className="text-xs text-muted-foreground font-mono">{p.codigo}</p>
                    </div>
                    <Badge
                      className={cn(
                        "text-xs border-0 flex-shrink-0",
                        p.estado === "agotado" ? "bg-red-500/20 text-red-400" :
                        p.estado === "bajo_stock" ? "bg-amber-500/20 text-amber-400" :
                        "bg-emerald-500/20 text-emerald-400"
                      )}
                    >
                      {p.stock_actual}
                    </Badge>
                  </button>
                );
              })}
            </div>
          )}

          {filteredPages.length === 0 && filteredProducts.length === 0 && (
            <div className="text-center py-8 text-sm text-muted-foreground">
              Sin resultados para <span className="text-foreground font-medium">&quot;{query}&quot;</span>
            </div>
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="border-t border-border px-4 py-2 flex items-center gap-4 text-[10px] text-muted-foreground bg-muted/40">
          <span><kbd className="border border-border rounded px-1 py-0.5 bg-background">↵</kbd> abrir</span>
          <span><kbd className="border border-border rounded px-1 py-0.5 bg-background">↑↓</kbd> navegar</span>
          <span><kbd className="border border-border rounded px-1 py-0.5 bg-background">Esc</kbd> cerrar</span>
          <span className="ml-auto opacity-60">Ctrl + K</span>
        </div>
      </DialogContent>
    </Dialog>
  );
}
