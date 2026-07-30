"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Topbar } from "@/components/layout/Topbar";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { MagnifyingGlass, CaretDown, Crown, ShieldCheck, Buildings, ArrowRight, Star, X, type Icon } from "@phosphor-icons/react";
import { getAreaIcon } from "@/lib/areas-icons";
import { cn } from "@/lib/utils";
import { useData } from "@/lib/store";
import { CategoryIcon } from "@/lib/icon-map";
import { useAuth } from "@/components/auth-provider";
import { initials } from "@/lib/format";
import areasData from "../../../../config/areas.js";
import type { AreasConfig } from "@/lib/areas.types";

const data = areasData as unknown as AreasConfig;

function matches(text: string, query: string) {
  return text.toLowerCase().includes(query.toLowerCase());
}

function TitularAvatar({ name, className }: { name: string; className?: string }) {
  return (
    <div
      className={cn(
        "flex items-center justify-center rounded-full text-xs font-bold flex-shrink-0 bg-accent text-primary ring-1 ring-primary/15",
        className
      )}
    >
      {initials(name)}
    </div>
  );
}

/** Expandable row for a single área/dirección: shows the count of bienes assigned and, on click, the list. */
function AreaRow({ name, icon: AreaIcon, expanded, onToggle, dense, isOwn }: {
  name: string;
  icon: Icon;
  expanded: boolean;
  onToggle: () => void;
  dense?: boolean;
  isOwn?: boolean;
}) {
  const { products } = useData();
  const items = useMemo(() => products.filter((p) => p.area === name), [products, name]);

  return (
    <div className={cn(
      "rounded-xl",
      !dense && "border border-border bg-muted/60 hover:border-primary/30 hover:bg-muted transition-colors",
      isOwn && "ring-2 ring-primary/50"
    )}>
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={expanded}
        className={cn(
          "w-full flex items-center gap-2.5 text-left transition-colors",
          dense ? "py-1.5 pl-1 pr-2 rounded-lg hover:bg-muted/60" : "px-3 py-2.5"
        )}
      >
        <AreaIcon className={cn("flex-shrink-0", dense ? "w-3.5 h-3.5 text-muted-foreground" : "w-4 h-4 text-primary")} weight="duotone" />
        <span className={cn("flex-1 min-w-0 text-foreground leading-tight truncate", dense ? "text-xs" : "text-xs font-medium")}>{name}</span>
        {isOwn && (
          <Badge className="h-5 px-1.5 text-[10px] gap-1 border-0 flex-shrink-0 text-primary-foreground" style={{ background: "var(--primary)" }}>
            <Star className="w-2.5 h-2.5" weight="fill" /> Tu área
          </Badge>
        )}
        {items.length > 0 && (
          <Badge variant="secondary" className="h-5 px-1.5 text-[10px] bg-primary/10 text-primary border-0 flex-shrink-0">
            {items.length} {items.length === 1 ? "bien" : "bienes"}
          </Badge>
        )}
        <CaretDown className={cn("w-3 h-3 text-muted-foreground transition-transform flex-shrink-0", expanded && "rotate-180")} />
      </button>

      {expanded && (
        <div className={cn("space-y-1 animate-in fade-in slide-in-from-top-2 duration-200 ease-out", dense ? "pl-6 pr-2 pb-2 pt-0.5" : "px-3 pb-3")}>
          {items.length === 0 ? (
            <p className="text-[11px] text-muted-foreground italic py-1">Sin bienes asignados</p>
          ) : (
            <>
              {items.map((p) => (
                <div key={p.id} className="flex items-center gap-2 py-1 rounded-lg px-1.5 hover:bg-accent/50 transition-colors">
                  <CategoryIcon name={p.categoria?.icono} className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                  <span className="text-[11px] text-foreground truncate flex-1">{p.nombre}</span>
                  <span className="text-[10px] font-mono text-muted-foreground flex-shrink-0">{p.codigo}</span>
                </div>
              ))}
              <Link
                href={`/productos?area=${encodeURIComponent(name)}`}
                className="inline-flex items-center gap-1 text-[11px] font-medium text-primary hover:underline pt-1.5 pl-1.5"
              >
                Ver en Productos <ArrowRight className="w-3 h-3" />
              </Link>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default function OrganigramaPage() {
  const user = useAuth();
  const [search, setSearch] = useState("");
  // Auto-expand the logged-in user's own area/secretaría from the start (lazy initial
  // state, not an effect — user.area is stable for the session, no re-sync needed).
  const [expanded, setExpanded] = useState<Record<string, boolean>>(() => {
    if (!user.area) return {};
    const ownSecretaria = data.secretarias.find((s) => s.nombre === user.area || s.direcciones.includes(user.area as string));
    return ownSecretaria ? { [ownSecretaria.nombre]: true } : {};
  });
  const [expandedAreas, setExpandedAreas] = useState<Record<string, boolean>>(() =>
    user.area ? { [user.area]: true } : {}
  );

  const q = search.trim();

  const secretariasFiltradas = useMemo(() => {
    if (!q) return data.secretarias;
    return data.secretarias.filter((s) =>
      matches(s.nombre, q) || matches(s.titular, q) || s.direcciones.some((d) => matches(d, q))
    );
  }, [q]);

  const despachoVisible = !q || matches(data.despacho.nombre, q) || matches(data.despacho.titular, q) ||
    data.despacho.adscritas.some((d) => matches(d, q));

  const contraloriaVisible = !q || data.autonomos.some((a) =>
    matches(a.nombre, q) || matches(a.titular, q) || a.direcciones.some((d) => matches(d, q))
  );

  const otrasVisibles = q ? data.otras_areas.filter((a) => matches(a, q)) : data.otras_areas;

  const noResults = !!q && !despachoVisible && secretariasFiltradas.length === 0 && !contraloriaVisible && otrasVisibles.length === 0;

  function toggle(key: string) {
    setExpanded((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  function toggleArea(key: string) {
    setExpandedAreas((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  return (
    <div className="min-h-screen bg-background">
      <Topbar title="Organigrama" subtitle="Presidencia Municipal, Secretarías y bienes asignados por área" />

      <div className="p-6 space-y-6">

        {/* Search */}
        <div className="relative max-w-md">
          <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar secretaría, dirección o titular..."
            className="pl-9 pr-9 h-9 text-sm bg-muted border-border text-foreground placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:border-primary/50"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              aria-label="Limpiar búsqueda"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Empty state when search yields no results */}
        {noResults && (
          <div className="flex flex-col items-center justify-center py-20 gap-3 animate-in fade-in duration-200">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-muted">
              <MagnifyingGlass className="w-7 h-7 text-muted-foreground/50" weight="duotone" />
            </div>
            <p className="text-sm font-medium text-foreground">Sin resultados para "{q}"</p>
            <p className="text-xs text-muted-foreground">Intenta con el nombre de la secretaría, dirección o titular</p>
            <button
              type="button"
              onClick={() => setSearch("")}
              className="inline-flex items-center gap-1.5 mt-1 text-xs font-medium text-primary hover:underline"
            >
              <X className="w-3 h-3" /> Limpiar búsqueda
            </button>
          </div>
        )}

        {/* Despacho de la Presidencia */}
        {despachoVisible && (
          <Card className="border-primary/30 bg-card overflow-hidden relative animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="absolute inset-0 opacity-[0.06] pointer-events-none"
              style={{ background: "radial-gradient(ellipse at top left, var(--primary), transparent 60%)" }} />
            <div className="absolute inset-x-0 top-0 h-1" style={{ background: "var(--primary)" }} />
            <CardContent className="p-6 relative">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 text-primary-foreground shadow-md"
                  style={{ background: "var(--primary)" }}>
                  <Crown className="w-7 h-7" weight="duotone" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Titular del Ayuntamiento</p>
                  <h2 className="text-xl font-bold text-foreground">{data.despacho.nombre}</h2>
                  <div className="flex items-center gap-2 mt-1.5">
                    <TitularAvatar name={data.despacho.titular} className="w-6 h-6 text-[10px]" />
                    <p className="text-sm text-muted-foreground">{data.despacho.titular}</p>
                  </div>
                </div>
              </div>

              <div className="h-px bg-border my-4" />

              <p className="text-xs font-medium text-muted-foreground mb-3">Áreas adscritas al Despacho</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-2.5">
                {data.despacho.adscritas
                  .filter((a) => !q || matches(a, q))
                  .map((area) => (
                    <AreaRow
                      key={area}
                      name={area}
                      icon={getAreaIcon(area)}
                      expanded={!!expandedAreas[area]}
                      onToggle={() => toggleArea(area)}
                      isOwn={area === user.area}
                    />
                  ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Connector */}
        {despachoVisible && secretariasFiltradas.length > 0 && (
          <div className="flex justify-center -my-2" aria-hidden="true">
            <div className="w-px h-6 bg-border" />
          </div>
        )}

        {/* Secretarías */}
        <div>
          <h2 className="text-sm font-semibold text-muted-foreground mb-3">
            Secretarías ({secretariasFiltradas.length})
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {secretariasFiltradas.map((sec, i) => {
              const isOpen = !!expanded[sec.nombre] || !!q;
              return (
                <Card key={sec.nombre}
                  className={cn(
                    "border-border bg-card hover:shadow-md transition-shadow animate-in fade-in slide-in-from-bottom-1",
                    sec.nombre === user.area && "ring-2 ring-primary/50"
                  )}
                  style={{ animationDelay: `${Math.min(i, 8) * 40}ms`, animationFillMode: "backwards" }}>
                  <button
                    type="button"
                    onClick={() => toggle(sec.nombre)}
                    aria-expanded={isOpen}
                    className="w-full text-left p-4 flex items-start justify-between gap-3 hover:bg-accent/40 transition-colors rounded-t-xl"
                  >
                    <div className="flex items-start gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 bg-accent text-primary">
                        <Buildings className="w-5 h-5" weight="duotone" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-sm font-semibold text-foreground leading-snug">{sec.nombre}</h3>
                          {sec.nombre === user.area && (
                            <Badge className="h-5 px-1.5 text-[10px] gap-1 border-0 text-primary-foreground" style={{ background: "var(--primary)" }}>
                              <Star className="w-2.5 h-2.5" weight="fill" /> Tu área
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-1.5 mt-1">
                          <TitularAvatar name={sec.titular} className="w-5 h-5 text-[9px]" />
                          <p className="text-xs text-muted-foreground">{sec.titular}</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Badge variant="secondary" className="text-xs bg-muted text-muted-foreground border-0">
                        {sec.direcciones.length}
                      </Badge>
                      <CaretDown className={cn("w-4 h-4 text-muted-foreground transition-transform duration-200", isOpen && "rotate-180")} />
                    </div>
                  </button>

                  {isOpen && (
                    <CardContent className="pt-0 pb-4 px-4 animate-in fade-in slide-in-from-top-2 duration-300 ease-out">
                      <div className="h-px bg-border mb-3" />
                      {sec.direcciones.length === 0 ? (
                        <p className="text-xs text-muted-foreground italic">Sin direcciones registradas</p>
                      ) : (
                        <div className="space-y-1">
                          {sec.direcciones
                            .filter((d) => !q || matches(d, q) || matches(sec.nombre, q) || matches(sec.titular, q))
                            .map((dir) => (
                              <AreaRow
                                key={dir}
                                name={dir}
                                icon={getAreaIcon(dir)}
                                expanded={!!expandedAreas[dir]}
                                onToggle={() => toggleArea(dir)}
                                isOwn={dir === user.area}
                                dense
                              />
                            ))}
                        </div>
                      )}
                    </CardContent>
                  )}
                </Card>
              );
            })}
          </div>
        </div>

        {/* Contraloría (autónoma) */}
        {contraloriaVisible && data.autonomos.map((a) => (
          <Card key={a.nombre} className="border-amber-500/25 bg-card hover:shadow-md transition-shadow">
            <CardContent className="p-4 flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 bg-amber-500/15 text-amber-500">
                <ShieldCheck className="w-5 h-5" weight="duotone" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-sm font-semibold text-foreground">{a.nombre}</h3>
                  {a.nota && <Badge className="text-xs bg-amber-500/15 text-amber-500 border-0">{a.nota}</Badge>}
                </div>
                <div className="flex items-center gap-1.5 mt-1">
                  <TitularAvatar name={a.titular} className="w-5 h-5 text-[9px] bg-amber-500/15 text-amber-600 ring-amber-500/20" />
                  <p className="text-xs text-muted-foreground">{a.titular}</p>
                </div>
                <div className="space-y-1 mt-3">
                  {a.direcciones.map((d) => (
                    <AreaRow
                      key={d}
                      name={d}
                      icon={getAreaIcon(d)}
                      expanded={!!expandedAreas[d]}
                      onToggle={() => toggleArea(d)}
                      dense
                    />
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {/* Otras áreas / organismos */}
        {otrasVisibles.length > 0 && (
          <div>
            <h2 className="text-sm font-semibold text-muted-foreground mb-3">Otras áreas / organismos</h2>
            <div className="flex flex-wrap gap-2">
              {otrasVisibles.map((a) => (
                <span key={a} className="text-xs px-3 py-1.5 rounded-full bg-muted text-foreground border border-border hover:border-primary/30 hover:bg-accent transition-colors">{a}</span>
              ))}
            </div>
          </div>
        )}

        <p className="text-xs text-muted-foreground/70 pt-2">
          Fuente: config/areas.js — vigencia {data.fecha}
        </p>
      </div>
    </div>
  );
}
