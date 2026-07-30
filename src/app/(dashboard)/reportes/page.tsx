"use client";

import { Topbar } from "@/components/layout/Topbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import {
  FileText, Download, FileSpreadsheet, Calendar,
  TrendingUp, Package, AlertTriangle, DollarSign, Building2,
} from "lucide-react";
import { mockCategories, mockProducts } from "@/lib/mock-data";

const stockPorCategoria = mockCategories.map((cat) => {
  const productos = mockProducts.filter((p) => p.categoria_id === cat.id);
  return {
    name: cat.nombre.split(" ")[0],
    stock: productos.reduce((s, p) => s + p.stock_actual, 0),
    valor: productos.reduce((s, p) => s + p.stock_actual * p.precio_venta, 0),
    color: cat.color,
  };
});

const REPORT_TYPES = [
  {
    id: "inventario_general",
    title: "Inventario General",
    desc: "Lista completa de bienes patrimoniales con existencias y valores actuales",
    icon: Package,
    color: "#7C3AED",
    bg: "rgba(124,58,237,0.15)",
    tag: "Auditoría",
  },
  {
    id: "bienes_por_area",
    title: "Bienes por Área",
    desc: "Distribución de bienes patrimoniales por secretaría y dirección responsable",
    icon: Building2,
    color: "#EC4899",
    bg: "rgba(236,72,153,0.15)",
    tag: "Patrimonial",
  },
  {
    id: "movimientos",
    title: "Reporte de Movimientos",
    desc: "Historial de entradas, salidas y ajustes por período",
    icon: TrendingUp,
    color: "#10B981",
    bg: "rgba(16,185,129,0.15)",
    tag: "Trazabilidad",
  },
  {
    id: "stock_bajo",
    title: "Alertas de Stock",
    desc: "Productos con stock bajo o agotados que requieren reabastecimiento",
    icon: AlertTriangle,
    color: "#F59E0B",
    bg: "rgba(245,158,11,0.15)",
    tag: "Operativo",
  },
  {
    id: "valoracion",
    title: "Valoración de Inventario",
    desc: "Valor económico del inventario por categoría y total",
    icon: DollarSign,
    color: "#3B82F6",
    bg: "rgba(59,130,246,0.15)",
    tag: "Financiero",
  },
  {
    id: "auditoria",
    title: "Reporte de Auditoría",
    desc: "Informe completo para auditorías del estado: movimientos, ajustes y responsables",
    icon: FileText,
    color: "#EF4444",
    bg: "rgba(239,68,68,0.15)",
    tag: "Estado",
  },
  {
    id: "vencimientos",
    title: "Garantías por Vencer",
    desc: "Bienes con garantía próxima a vencer en los próximos 30 días",
    icon: Calendar,
    color: "#A78BFA",
    bg: "rgba(167,139,250,0.15)",
    tag: "Control",
  },
];

export default function ReportesPage() {
  return (
    <div className="min-h-screen" style={{ background: "var(--background)" }}>
      <Topbar title="Reportes" subtitle="Generación de informes y auditorías" />

      <div className="p-6 space-y-6">

        {/* Filtros de período */}
        <Card className="border-border hover:shadow-md transition-shadow" style={{ background: "var(--card)" }}>
          <CardContent className="p-4">
            <div className="flex flex-wrap items-end gap-4">
              <div className="space-y-1">
                <Label className="text-muted-foreground text-xs">Fecha inicio</Label>
                <Input type="date" className="h-9 bg-muted border-border text-foreground w-40" />
              </div>
              <div className="space-y-1">
                <Label className="text-muted-foreground text-xs">Fecha fin</Label>
                <Input type="date" className="h-9 bg-muted border-border text-foreground w-40" />
              </div>
              <div className="flex gap-2 flex-wrap">
                {["Hoy", "Esta semana", "Este mes", "Este año"].map((p) => (
                  <Button key={p} variant="outline" size="sm"
                    className="h-9 text-xs border-border text-muted-foreground hover:bg-accent hover:text-foreground">
                    {p}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Chart */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
          <Card className="xl:col-span-2 border-border" style={{ background: "var(--card)" }}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold text-foreground">Stock por Categoría</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={stockPorCategoria} barSize={32}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="name" tick={{ fill: "var(--muted-foreground)", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "var(--muted-foreground)", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: "8px", color: "var(--popover-foreground)" }}
                    cursor={{ fill: "var(--muted)" }}
                  />
                  <Bar dataKey="stock" name="Stock actual" radius={[6, 6, 0, 0]}
                    fill="#7C3AED" fillOpacity={0.85} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="border-border hover:shadow-md transition-shadow" style={{ background: "var(--card)" }}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold text-foreground">Valor por Categoría</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {stockPorCategoria.map((cat) => (
                <div key={cat.name}>
                  <div className="flex justify-between mb-1">
                    <span className="text-xs text-muted-foreground">{cat.name}</span>
                    <span className="text-xs font-medium text-foreground">${cat.valor.toFixed(0)}</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-accent overflow-hidden">
                    <div className="h-full rounded-full" style={{
                      width: `${Math.min((cat.valor / 10000) * 100, 100)}%`,
                      background: cat.color,
                    }} />
                  </div>
                </div>
              ))}
              <div className="pt-2 border-t border-border flex justify-between">
                <span className="text-xs text-muted-foreground">Total inventario</span>
                <span className="text-sm font-bold text-foreground">
                  ${stockPorCategoria.reduce((s, c) => s + c.valor, 0).toFixed(2)}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Report types */}
        <div>
          <h2 className="text-sm font-semibold text-muted-foreground mb-3">Tipos de Reporte</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {REPORT_TYPES.map(({ id, title, desc, icon: Icon, color, bg, tag }, i) => (
              <Card key={id}
                className="border-border hover:border-primary/30 hover:shadow-md hover:-translate-y-0.5 transition-all group animate-in fade-in slide-in-from-bottom-1"
                style={{ background: "var(--card)", animationDelay: `${i * 40}ms`, animationFillMode: "backwards" }}>
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: bg }}>
                      <Icon className="w-5 h-5" style={{ color }} />
                    </div>
                    <Badge className="text-xs border-0" style={{ background: bg, color }}>
                      {tag}
                    </Badge>
                  </div>
                  <h3 className="font-semibold text-foreground text-sm mb-1">{title}</h3>
                  <p className="text-xs leading-relaxed mb-4" style={{ color: "var(--muted-foreground)" }}>{desc}</p>
                  <div className="flex gap-2">
                    <Button size="sm"
                      className="flex-1 h-8 text-xs gap-1.5 text-foreground"
                      style={{ background: "var(--primary)" }}>
                      <FileText className="w-3.5 h-3.5" /> PDF
                    </Button>
                    <Button size="sm" variant="outline"
                      className="flex-1 h-8 text-xs gap-1.5 border-border text-muted-foreground hover:bg-accent hover:text-foreground">
                      <FileSpreadsheet className="w-3.5 h-3.5" /> Excel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Audit note */}
        <Card className="border-amber-500/20" style={{ background: "rgba(245,158,11,0.05)" }}>
          <CardContent className="p-4 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-amber-400">Nota para Auditorías del Estado</p>
              <p className="text-xs text-amber-400/70 mt-1">
                El reporte de Auditoría incluye: inventario inicial, movimientos del período, inventario final,
                responsable de cada operación, referencias de documentos y firma digital. Cumple con los requisitos
                establecidos para revisiones gubernamentales.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
