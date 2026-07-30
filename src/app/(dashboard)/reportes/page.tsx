"use client";

import { useState, useMemo } from "react";
import { Topbar } from "@/components/layout/Topbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DateInput } from "@/components/ui/date-input";
import { Label } from "@/components/ui/label";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import {
  FilePdf, FileXls, CalendarBlank,
  TrendUp, Package, Warning, CurrencyDollar, Buildings,
} from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import { useData } from "@/lib/store";
import { useToast } from "@/components/ui/toast";
import { downloadExcel, printReport } from "@/lib/export";
import type { Product, Movement, Category } from "@/lib/types";

const PERIODOS = ["Hoy", "Esta semana", "Este mes", "Este año"];

function periodoLabel(periodo: string, fechaInicio: string, fechaFin: string) {
  if (fechaInicio && fechaFin) return `${fechaInicio} – ${fechaFin}`;
  return periodo;
}

function filterByPeriodo(movements: Movement[], periodo: string, fechaInicio: string, fechaFin: string) {
  const now = new Date();
  const getStart = () => {
    if (fechaInicio) return new Date(fechaInicio);
    if (periodo === "Hoy") return new Date(now.toDateString());
    if (periodo === "Esta semana") { const d = new Date(now); d.setDate(d.getDate() - d.getDay()); return d; }
    if (periodo === "Este mes") return new Date(now.getFullYear(), now.getMonth(), 1);
    if (periodo === "Este año") return new Date(now.getFullYear(), 0, 1);
    return new Date(0);
  };
  const getEnd = () => fechaFin ? new Date(fechaFin + "T23:59:59") : new Date(now.getTime() + 86400000);
  const start = getStart(); const end = getEnd();
  return movements.filter((m) => { const d = new Date(m.created_at); return d >= start && d <= end; });
}

export default function ReportesPage() {
  const { products, categories, movements } = useData();
  const { toast } = useToast();
  const [periodo, setPeriodo] = useState("Este mes");
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");

  const stockPorCategoria = useMemo(() =>
    categories.map((cat) => {
      const prods = products.filter((p) => p.categoria_id === cat.id);
      return {
        id: cat.id,
        name: cat.nombre.split(" ").pop() ?? cat.nombre,
        stock: prods.reduce((s, p) => s + p.stock_actual, 0),
        valor: prods.reduce((s, p) => s + p.stock_actual * p.precio_venta, 0),
        color: cat.color,
      };
    }),
  [products, categories]);

  const filteredMovements = useMemo(() =>
    filterByPeriodo(movements, periodo, fechaInicio, fechaFin),
  [movements, periodo, fechaInicio, fechaFin]);

  const dateRangeError = fechaInicio && fechaFin && fechaInicio > fechaFin
    ? "La fecha de inicio debe ser anterior a la fecha de fin"
    : null;

  const label = periodoLabel(periodo, fechaInicio, fechaFin);

  // ── Report generators ────────────────────────────────────────────────────

  function genInventarioGeneral(format: "pdf" | "excel") {
    const headers = ["Nombre", "Código", "Categoría", "Área", "Stock", "Mín.", "Valor Actual ($)", "Estado", "Proveedor", "Ubicación"];
    const rows = products.map((p) => [
      p.nombre, p.codigo, p.categoria?.nombre ?? "", p.area ?? "",
      String(p.stock_actual), String(p.stock_minimo),
      p.precio_venta.toFixed(2),
      { activo: "Activo", bajo_stock: "Bajo Stock", agotado: "Agotado", vencido: "Vencido" }[p.estado],
      p.proveedor ?? "", p.ubicacion ?? "",
    ]);
    if (format === "pdf") { printReport("Inventario General", label, headers, rows); }
    else { downloadExcel(`inventario_general_${new Date().toISOString().slice(0, 10)}.xlsx`, headers, rows); toast("Excel generado correctamente"); }
  }

  function genBienesPorArea(format: "pdf" | "excel") {
    const headers = ["Área", "Total Bienes", "Activos", "Alertas", "Valor Patrimonial ($)"];
    const areas = Array.from(new Set(products.map((p) => p.area).filter(Boolean))) as string[];
    const rows = areas.map((area) => {
      const prods = products.filter((p) => p.area === area);
      const alertas = prods.filter((p) => p.estado === "bajo_stock" || p.estado === "agotado").length;
      const valor = prods.reduce((s, p) => s + p.stock_actual * p.precio_venta, 0);
      return [area, String(prods.length), String(prods.filter((p) => p.estado === "activo").length), String(alertas), valor.toFixed(2)];
    });
    if (format === "pdf") { printReport("Bienes por Área", label, headers, rows); }
    else { downloadExcel(`bienes_por_area_${new Date().toISOString().slice(0, 10)}.xlsx`, headers, rows as (string | number)[][]); toast("Excel generado correctamente"); }
  }

  function genMovimientos(format: "pdf" | "excel") {
    const headers = ["Tipo", "Producto", "Código", "Cantidad", "Stock Ant.", "Stock Nuevo", "Motivo", "Referencia", "Usuario", "Fecha"];
    const rows = filteredMovements.map((m) => [
      m.tipo.charAt(0).toUpperCase() + m.tipo.slice(1),
      m.producto?.nombre ?? "", m.producto?.codigo ?? "",
      String(m.cantidad), String(m.stock_anterior), String(m.stock_nuevo),
      m.motivo ?? "", m.referencia ?? "", m.usuario_nombre,
      new Date(m.created_at).toLocaleString("es-MX"),
    ]);
    if (format === "pdf") { printReport("Reporte de Movimientos", label, headers, rows); }
    else { downloadExcel(`movimientos_${new Date().toISOString().slice(0, 10)}.xlsx`, headers, rows as (string | number)[][]); toast("Excel generado correctamente"); }
  }

  function genStockBajo(format: "pdf" | "excel") {
    const alerta = products.filter((p) => p.estado === "bajo_stock" || p.estado === "agotado");
    const headers = ["Nombre", "Código", "Categoría", "Stock Actual", "Stock Mínimo", "Estado", "Proveedor", "Área"];
    const rows = alerta.map((p) => [
      p.nombre, p.codigo, p.categoria?.nombre ?? "",
      String(p.stock_actual), String(p.stock_minimo),
      p.estado === "agotado" ? "Agotado" : "Bajo Stock",
      p.proveedor ?? "", p.area ?? "",
    ]);
    if (format === "pdf") { printReport("Alertas de Stock", label, headers, rows); }
    else { downloadExcel(`alertas_stock_${new Date().toISOString().slice(0, 10)}.xlsx`, headers, rows as (string | number)[][]); toast("Excel generado correctamente"); }
  }

  function genValoracion(format: "pdf" | "excel") {
    const headers = ["Categoría", "Total Bienes", "Stock Total", "Valor Total ($)", "% del Inventario"];
    const totalValor = stockPorCategoria.reduce((s, c) => s + c.valor, 0);
    const rows = stockPorCategoria.map((cat) => [
      cat.name ?? "",
      String(products.filter((p) => p.categoria_id === cat.id).length),
      String(cat.stock), cat.valor.toFixed(2),
      totalValor > 0 ? ((cat.valor / totalValor) * 100).toFixed(1) + "%" : "0%",
    ]);
    const totalsRow = ["TOTAL", String(products.length), String(stockPorCategoria.reduce((s, c) => s + c.stock, 0)), totalValor.toFixed(2), "100%"];
    if (format === "pdf") { printReport("Valoración de Inventario", label, headers, [...rows, totalsRow]); }
    else { downloadExcel(`valoracion_${new Date().toISOString().slice(0, 10)}.xlsx`, headers, [...rows, totalsRow] as (string | number)[][]); toast("Excel generado correctamente"); }
  }

  function genAuditoria(format: "pdf" | "excel") {
    const headers = ["Tipo", "Producto", "Código", "Área", "Cant.", "Stock Ant.", "Stock Nuevo", "Motivo", "Referencia", "Responsable", "Fecha"];
    const rows = filteredMovements.map((m) => [
      m.tipo.charAt(0).toUpperCase() + m.tipo.slice(1),
      m.producto?.nombre ?? "", m.producto?.codigo ?? "", m.producto?.area ?? "",
      String(m.cantidad), String(m.stock_anterior), String(m.stock_nuevo),
      m.motivo ?? "", m.referencia ?? "", m.usuario_nombre,
      new Date(m.created_at).toLocaleString("es-MX"),
    ]);
    if (format === "pdf") { printReport("Reporte de Auditoría", label, headers, rows); }
    else { downloadExcel(`auditoria_${new Date().toISOString().slice(0, 10)}.xlsx`, headers, rows as (string | number)[][]); toast("Excel generado correctamente"); }
  }

  function genVencimientos(format: "pdf" | "excel") {
    const now = Date.now();
    const porVencer = products.filter((p) => {
      if (!p.fecha_vencimiento) return false;
      const dias = Math.ceil((new Date(p.fecha_vencimiento).getTime() - now) / 86400000);
      return dias <= 30;
    });
    const headers = ["Nombre", "Código", "Categoría", "Días Restantes", "Fecha Vencimiento", "Proveedor", "Área"];
    const rows = porVencer.map((p) => {
      const dias = Math.ceil((new Date(p.fecha_vencimiento!).getTime() - now) / 86400000);
      return [
        p.nombre, p.codigo, p.categoria?.nombre ?? "",
        dias <= 0 ? "Vencido" : `${dias} días`,
        new Date(p.fecha_vencimiento!).toLocaleDateString("es-MX"),
        p.proveedor ?? "", p.area ?? "",
      ];
    });
    if (format === "pdf") { printReport("Garantías por Vencer", label, headers, rows); }
    else { downloadExcel(`vencimientos_${new Date().toISOString().slice(0, 10)}.xlsx`, headers, rows as (string | number)[][]); toast("Excel generado correctamente"); }
  }

  type ReportId = "inventario_general" | "bienes_por_area" | "movimientos" | "stock_bajo" | "valoracion" | "auditoria" | "vencimientos";

  const REPORT_TYPES: {
    id: ReportId; title: string; desc: string;
    icon: React.ElementType; color: string; bg: string; tag: string;
    count: string;
    onPdf: () => void; onExcel: () => void;
  }[] = [
    {
      id: "inventario_general", title: "Inventario General",
      desc: "Lista completa de bienes patrimoniales con existencias y valores actuales",
      icon: Package, color: "#7C3AED", bg: "rgba(124,58,237,0.15)", tag: "Auditoría",
      count: `${products.length} bienes`,
      onPdf: () => genInventarioGeneral("pdf"), onExcel: () => genInventarioGeneral("excel"),
    },
    {
      id: "bienes_por_area", title: "Bienes por Área",
      desc: "Distribución de bienes patrimoniales por secretaría y dirección responsable",
      icon: Buildings, color: "#EC4899", bg: "rgba(236,72,153,0.15)", tag: "Patrimonial",
      count: `${new Set(products.map((p) => p.area)).size} áreas`,
      onPdf: () => genBienesPorArea("pdf"), onExcel: () => genBienesPorArea("excel"),
    },
    {
      id: "movimientos", title: "Reporte de Movimientos",
      desc: "Historial de entradas, salidas y ajustes por período",
      icon: TrendUp, color: "#10B981", bg: "rgba(16,185,129,0.15)", tag: "Trazabilidad",
      count: `${filteredMovements.length} movs.`,
      onPdf: () => genMovimientos("pdf"), onExcel: () => genMovimientos("excel"),
    },
    {
      id: "stock_bajo", title: "Alertas de Stock",
      desc: "Productos con stock bajo o agotados que requieren reabastecimiento",
      icon: Warning, color: "#F59E0B", bg: "rgba(245,158,11,0.15)", tag: "Operativo",
      count: `${products.filter((p) => p.estado !== "activo").length} alertas`,
      onPdf: () => genStockBajo("pdf"), onExcel: () => genStockBajo("excel"),
    },
    {
      id: "valoracion", title: "Valoración de Inventario",
      desc: "Valor económico del inventario por categoría y total",
      icon: CurrencyDollar, color: "#3B82F6", bg: "rgba(59,130,246,0.15)", tag: "Financiero",
      count: `$${stockPorCategoria.reduce((s, c) => s + c.valor, 0).toLocaleString("es-MX", { maximumFractionDigits: 0 })}`,
      onPdf: () => genValoracion("pdf"), onExcel: () => genValoracion("excel"),
    },
    {
      id: "auditoria", title: "Reporte de Auditoría",
      desc: "Informe completo para auditorías del estado: movimientos, ajustes y responsables",
      icon: FilePdf, color: "#EF4444", bg: "rgba(239,68,68,0.15)", tag: "Estado",
      count: `${filteredMovements.length} registros`,
      onPdf: () => genAuditoria("pdf"), onExcel: () => genAuditoria("excel"),
    },
    {
      id: "vencimientos", title: "Garantías por Vencer",
      desc: "Bienes con garantía próxima a vencer en los próximos 30 días",
      icon: CalendarBlank, color: "#A78BFA", bg: "rgba(167,139,250,0.15)", tag: "Control",
      count: `${products.filter((p) => { if (!p.fecha_vencimiento) return false; const d = Math.ceil((new Date(p.fecha_vencimiento).getTime() - Date.now()) / 86400000); return d <= 30; }).length} bienes`,
      onPdf: () => genVencimientos("pdf"), onExcel: () => genVencimientos("excel"),
    },
  ];

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
                <DateInput className="h-9 w-40" value={fechaInicio} onChange={(e) => setFechaInicio(e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label className="text-muted-foreground text-xs">Fecha fin</Label>
                <DateInput className="h-9 w-40" value={fechaFin} onChange={(e) => setFechaFin(e.target.value)} />
              </div>
              <div className="flex gap-2 flex-wrap">
                {PERIODOS.map((p) => (
                  <Button key={p} variant="outline" size="sm"
                    onClick={() => { setPeriodo(p); setFechaInicio(""); setFechaFin(""); }}
                    className={cn(
                      "h-9 text-xs transition-all",
                      periodo === p && !fechaInicio && !fechaFin
                        ? "border-primary/50 bg-accent text-foreground"
                        : "border-border text-muted-foreground hover:bg-accent hover:text-foreground"
                    )}>
                    {p}
                  </Button>
                ))}
              </div>
              {(fechaInicio || fechaFin) && (
                <button type="button" onClick={() => { setFechaInicio(""); setFechaFin(""); }}
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                  × Limpiar fechas
                </button>
              )}
              {dateRangeError && (
                <p className="text-xs text-red-400 w-full">{dateRangeError}</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Chart */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
          <Card className="xl:col-span-2 border-border hover:shadow-md transition-shadow" style={{ background: "var(--card)" }}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold text-foreground">Stock por Categoría</CardTitle>
            </CardHeader>
            <CardContent>
              {stockPorCategoria.length === 0 ? (
                <div className="flex items-center justify-center h-[200px] text-sm text-muted-foreground">Sin categorías para mostrar</div>
              ) : (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={stockPorCategoria} barSize={32}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="name" tick={{ fill: "var(--muted-foreground)", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "var(--muted-foreground)", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: "8px", color: "var(--popover-foreground)" }}
                    cursor={{ fill: "var(--muted)" }}
                  />
                  <Bar dataKey="stock" name="Stock actual" radius={[6, 6, 0, 0]} fill="#7C3AED" fillOpacity={0.85} />
                </BarChart>
              </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          <Card className="border-border hover:shadow-md transition-shadow" style={{ background: "var(--card)" }}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold text-foreground">Valor por Categoría</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {stockPorCategoria.map((cat) => {
                const maxVal = Math.max(...stockPorCategoria.map((c) => c.valor), 1);
                return (
                  <div key={cat.id}>
                    <div className="flex justify-between mb-1">
                      <span className="text-xs text-muted-foreground">{cat.name}</span>
                      <span className="text-xs font-medium text-foreground">${cat.valor.toFixed(0)}</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-accent overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${Math.min((cat.valor / maxVal) * 100, 100)}%`, background: cat.color }} />
                    </div>
                  </div>
                );
              })}
              <div className="pt-2 border-t border-border flex justify-between">
                <span className="text-xs text-muted-foreground">Total inventario</span>
                <span className="text-sm font-bold text-foreground">
                  ${stockPorCategoria.reduce((s, c) => s + c.valor, 0).toLocaleString("es-MX", { minimumFractionDigits: 2 })}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Report types */}
        <div>
          <h2 className="text-sm font-semibold text-muted-foreground mb-3">Tipos de Reporte</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {REPORT_TYPES.map(({ id, title, desc, icon: Icon, color, bg, tag, count, onPdf, onExcel }, i) => (
              <Card key={id}
                className="border-border hover:border-primary/30 hover:shadow-md hover:-translate-y-0.5 transition-all group animate-in fade-in slide-in-from-bottom-1"
                style={{ background: "var(--card)", animationDelay: `${i * 40}ms`, animationFillMode: "backwards" }}>
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: bg }}>
                      <Icon className="w-5 h-5" style={{ color }} />
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Badge className="text-xs border-0" style={{ background: bg, color }}>{tag}</Badge>
                      <Badge variant="secondary" className="text-[10px] border-0 bg-muted text-muted-foreground">{count}</Badge>
                    </div>
                  </div>
                  <h3 className="font-semibold text-foreground text-sm mb-1">{title}</h3>
                  <p className="text-xs leading-relaxed mb-4 text-muted-foreground">{desc}</p>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={onPdf}
                      className="flex-1 h-8 text-xs gap-1.5"
                      style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}>
                      <FilePdf className="w-3.5 h-3.5" /> PDF
                    </Button>
                    <Button size="sm" variant="outline" onClick={onExcel}
                      className="flex-1 h-8 text-xs gap-1.5 border-border text-muted-foreground hover:bg-accent hover:text-foreground">
                      <FileXls className="w-3.5 h-3.5" /> Excel
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
            <Warning className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
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
