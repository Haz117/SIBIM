"use client";

import { Topbar } from "@/components/layout/Topbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle, XCircle, Clock, CheckCircle } from "lucide-react";
import { mockProducts } from "@/lib/mock-data";
import { CategoryIcon } from "@/lib/icon-map";
import { useAuth } from "@/components/auth-provider";

export default function AlertasPage() {
  const user = useAuth();
  const scopedProducts = user.role === "admin" ? mockProducts : mockProducts.filter((p) => p.area === user.area);
  const agotados = scopedProducts.filter((p) => p.estado === "agotado");
  const bajoStock = scopedProducts.filter((p) => p.estado === "bajo_stock");
  const porVencer = scopedProducts.filter((p) => {
    if (!p.fecha_vencimiento) return false;
    const dias = Math.ceil((new Date(p.fecha_vencimiento).getTime() - Date.now()) / 86400000);
    return dias <= 7 && dias >= 0;
  });

  const sections = [
    {
      title: "Bienes Agotados",
      items: agotados,
      icon: XCircle,
      color: "#EF4444",
      bg: "rgba(239,68,68,0.1)",
      border: "rgba(239,68,68,0.2)",
      badge: "destructive" as const,
      badgeText: "Agotado",
      action: "Reponer",
    },
    {
      title: "Existencias Bajas",
      items: bajoStock,
      icon: AlertTriangle,
      color: "#F59E0B",
      bg: "rgba(245,158,11,0.1)",
      border: "rgba(245,158,11,0.2)",
      badge: "secondary" as const,
      badgeText: "Bajo",
      action: "Solicitar",
    },
    {
      title: "Garantías por Vencer (7 días)",
      items: porVencer,
      icon: Clock,
      color: "#A78BFA",
      bg: "rgba(167,139,250,0.1)",
      border: "rgba(167,139,250,0.2)",
      badge: "secondary" as const,
      badgeText: "Urgente",
      action: "Revisar",
    },
  ];

  return (
    <div className="min-h-screen" style={{ background: "var(--background)" }}>
      <Topbar title="Alertas" subtitle={`${agotados.length + bajoStock.length + porVencer.length} alertas activas`} />

      <div className="p-6 space-y-6">

        {/* Summary */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Agotados", count: agotados.length, color: "#EF4444", bg: "rgba(239,68,68,0.15)", icon: XCircle },
            { label: "Existencias Bajas", count: bajoStock.length, color: "#F59E0B", bg: "rgba(245,158,11,0.15)", icon: AlertTriangle },
            { label: "Garantías por Vencer", count: porVencer.length, color: "#A78BFA", bg: "rgba(167,139,250,0.15)", icon: Clock },
          ].map(({ label, count, color, bg, icon: Icon }) => (
            <Card key={label} className="border-border hover:shadow-md transition-shadow" style={{ background: "var(--card)" }}>
              <CardContent className="p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: bg }}>
                  <Icon className="w-5 h-5" style={{ color }} />
                </div>
                <div>
                  <p className="text-2xl font-bold" style={{ color }}>{count}</p>
                  <p className="text-xs text-muted-foreground">{label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Alert sections */}
        {sections.map(({ title, items, icon: Icon, color, bg, border, badgeText, action }) => (
          <Card key={title} className="border-border hover:shadow-md transition-shadow" style={{ background: "var(--card)" }}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: bg }}>
                    <Icon className="w-3.5 h-3.5" style={{ color }} />
                  </div>
                  <CardTitle className="text-sm text-foreground">{title}</CardTitle>
                  <Badge className="text-xs border-0 ml-1"
                    style={{ background: bg, color }}>
                    {items.length}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              {items.length === 0 ? (
                <div className="text-center py-8 flex flex-col items-center gap-2">
                  <CheckCircle className="w-8 h-8 text-emerald-500/40" />
                  <p className="text-sm text-muted-foreground">Sin alertas en esta categoría</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {items.map((product) => {
                    const pct = product.stock_maximo > 0 ? (product.stock_actual / product.stock_maximo) * 100 : 0;
                    return (
                      <div key={product.id} className="flex items-center gap-4 p-3 rounded-xl border"
                        style={{ background: bg, borderColor: border }}>
                        <div className="w-9 h-9 rounded-lg flex items-center justify-center text-lg flex-shrink-0"
                          style={{ background: "color-mix(in srgb, var(--foreground) 15%, transparent)" }}>
                          <CategoryIcon name={product.categoria?.icono} className="w-4.5 h-4.5" style={{ color }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <p className="font-medium text-foreground text-sm">{product.nombre}</p>
                            <div className="flex items-center gap-2 flex-shrink-0 ml-4">
                              <span className="text-xs font-bold" style={{ color }}>
                                {product.stock_actual}/{product.stock_minimo} mín.
                              </span>
                              <Button size="sm" className="h-7 px-3 text-xs text-foreground" style={{ background: color }}>
                                {action}
                              </Button>
                            </div>
                          </div>
                          <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "color-mix(in srgb, var(--foreground) 15%, transparent)" }}>
                            <div className="h-full rounded-full transition-all" style={{
                              width: `${Math.min(pct, 100)}%`,
                              background: color,
                            }} />
                          </div>
                          <div className="flex justify-between mt-1">
                            <span className="text-xs text-muted-foreground">{product.proveedor}</span>
                            <span className="text-xs text-muted-foreground">{product.ubicacion}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
