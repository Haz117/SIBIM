"use client";

import { useState, useEffect } from "react";
import { Topbar } from "@/components/layout/Topbar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DateInput } from "@/components/ui/date-input";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Pagination } from "@/components/ui/pagination";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  ArrowUp, ArrowDown, ArrowsLeftRight, Equalizer,
  Plus, MagnifyingGlass, ClipboardText, ArrowUpRight, ArrowDownRight,
  WarningCircle, DownloadSimple, Prohibit,
} from "@phosphor-icons/react";
import { CategoryIcon } from "@/lib/icon-map";
import { useAuth } from "@/components/auth-provider";
import { useData } from "@/lib/store";
import { useToast } from "@/components/ui/toast";
import { downloadCSV, downloadExcel } from "@/lib/export";
import type { MovementType, Product } from "@/lib/types";

const TIPO_CONFIG: Record<MovementType, {
  label: string; icon: React.ReactNode;
  color: string; bg: string; hex: string; hexBg: string;
}> = {
  entrada: { label: "Entrada", icon: <ArrowUp className="w-4 h-4" />, color: "text-emerald-400", bg: "bg-emerald-500/15", hex: "#10B981", hexBg: "rgba(16,185,129,0.15)" },
  salida: { label: "Salida", icon: <ArrowDown className="w-4 h-4" />, color: "text-red-400", bg: "bg-red-500/15", hex: "#EF4444", hexBg: "rgba(239,68,68,0.15)" },
  ajuste: { label: "Ajuste", icon: <Equalizer className="w-4 h-4" />, color: "text-purple-400", bg: "bg-purple-500/15", hex: "#A78BFA", hexBg: "rgba(167,139,250,0.15)" },
  transferencia: { label: "Transferencia", icon: <ArrowsLeftRight className="w-4 h-4" />, color: "text-blue-400", bg: "bg-blue-500/15", hex: "#3B82F6", hexBg: "rgba(59,130,246,0.15)" },
};

export default function MovimientosPage() {
  const user = useAuth();
  const { products, movements, deleteMovement } = useData();
  const { toast } = useToast();

  const [search, setSearch] = useState("");
  const [filterTipo, setFilterTipo] = useState("todos");
  const [fechaDesde, setFechaDesde] = useState("");
  const [fechaHasta, setFechaHasta] = useState("");
  const [openDialog, setOpenDialog] = useState(false);
  const [deleteMovId, setDeleteMovId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(25);
  const [exportOpen, setExportOpen] = useState(false);

  useEffect(() => { setPage(1); }, [search, filterTipo, fechaDesde, fechaHasta]);

  const scopedMovements = user.role === "admin"
    ? movements
    : movements.filter((m) => m.producto?.area === user.area);
  const scopedProducts = user.role === "admin"
    ? products
    : products.filter((p) => p.area === user.area);

  const summary = (["entrada", "salida", "ajuste", "transferencia"] as MovementType[]).map((tipo) => {
    const items = scopedMovements.filter((m) => m.tipo === tipo);
    return { tipo, total: items.length, qty: items.reduce((s, m) => s + m.cantidad, 0) };
  }).filter((s) => s.total > 0);

  const filtered = scopedMovements.filter((m) => {
    const matchSearch =
      m.producto?.nombre.toLowerCase().includes(search.toLowerCase()) ||
      m.referencia?.toLowerCase().includes(search.toLowerCase());
    const matchTipo = filterTipo === "todos" || m.tipo === filterTipo;
    const fecha = new Date(m.created_at);
    const matchDesde = !fechaDesde || fecha >= new Date(fechaDesde);
    const matchHasta = !fechaHasta || fecha <= new Date(fechaHasta + "T23:59:59");
    return matchSearch && matchTipo && matchDesde && matchHasta;
  });

  useEffect(() => {
    const maxPage = Math.max(1, Math.ceil(filtered.length / perPage));
    if (page > maxPage) setPage(maxPage);
  }, [filtered.length, perPage, page]);

  const hasFilters = search || filterTipo !== "todos" || fechaDesde || fechaHasta;
  const paginated = filtered.slice((page - 1) * perPage, page * perPage);

  function handleAnular() {
    if (!deleteMovId) return;
    deleteMovement(deleteMovId);
    setDeleteMovId(null);
    toast("Movimiento anulado. Stock restaurado.", "info");
  }

  const anularTarget = movements.find((m) => m.id === deleteMovId);

  function handleExportCSV() {
    const headers = ["Tipo", "Producto", "Código", "Cantidad", "Stock Ant.", "Stock Nuevo", "Motivo", "Referencia", "Usuario", "Fecha"];
    const rows = filtered.map((m) => [
      TIPO_CONFIG[m.tipo].label, m.producto?.nombre ?? "", m.producto?.codigo ?? "",
      String(m.cantidad), String(m.stock_anterior), String(m.stock_nuevo),
      m.motivo ?? "", m.referencia ?? "", m.usuario_nombre,
      new Date(m.created_at).toLocaleString("es-MX"),
    ]);
    downloadCSV(`movimientos_${new Date().toISOString().slice(0, 10)}.csv`, headers, rows);
    toast("CSV exportado correctamente");
  }

  function handleExportExcel() {
    const headers = ["Tipo", "Producto", "Código", "Cantidad", "Stock Ant.", "Stock Nuevo", "Motivo", "Referencia", "Usuario", "Fecha"];
    const rows = filtered.map((m) => [
      TIPO_CONFIG[m.tipo].label, m.producto?.nombre ?? "", m.producto?.codigo ?? "",
      m.cantidad, m.stock_anterior, m.stock_nuevo,
      m.motivo ?? "", m.referencia ?? "", m.usuario_nombre,
      new Date(m.created_at).toLocaleString("es-MX"),
    ]);
    downloadExcel(`movimientos_${new Date().toISOString().slice(0, 10)}.xlsx`, headers, rows);
    toast("Excel exportado correctamente");
  }

  return (
    <div className="min-h-screen" style={{ background: "var(--background)" }}>
      <Topbar title="Movimientos" subtitle="Registro de entradas, salidas y ajustes" />

      <div className="p-6 space-y-5">

        {/* Summary cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {summary.map(({ tipo, total, qty }, i) => {
            const cfg = TIPO_CONFIG[tipo];
            return (
              <Card key={tipo}
                className="border-border relative overflow-hidden group hover:shadow-lg hover:-translate-y-1 transition-all duration-200 animate-in fade-in slide-in-from-bottom-1"
                style={{ animationDelay: `${i * 50}ms`, animationFillMode: "backwards", background: `linear-gradient(135deg, var(--card) 40%, ${cfg.hexBg})` }}>
                <div className="absolute inset-y-0 left-0 w-1 rounded-l-lg" style={{ background: cfg.hex }} />
                <div className="absolute -top-4 -right-4 w-16 h-16 rounded-full opacity-10 blur-xl" style={{ background: cfg.hex }} />
                <CardContent className="p-4 pl-5 relative">
                  <div className="flex items-start justify-between mb-2">
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: cfg.hexBg }}>
                      <span style={{ color: cfg.hex }}>{cfg.icon}</span>
                    </div>
                    {tipo === "entrada"
                      ? <ArrowUpRight className="w-3.5 h-3.5 text-emerald-500" />
                      : <ArrowDownRight className="w-3.5 h-3.5 text-red-400 opacity-60" />}
                  </div>
                  <p className="text-2xl font-bold text-foreground leading-none">{qty}</p>
                  <p className="text-xs mt-1 text-muted-foreground">{cfg.label}s</p>
                  <p className="text-xs mt-0.5 font-medium" style={{ color: cfg.hex }}>{total} operación{total !== 1 ? "es" : ""}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Toolbar */}
        <Card className="border-border" style={{ background: "var(--card)" }}>
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center gap-3">
              <div className="relative flex-1">
                <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Buscar por producto o referencia..."
                  className="pl-10 h-9 bg-muted/60 border-border text-foreground placeholder:text-muted-foreground"
                />
              </div>
              <Button variant="outline" size="sm" onClick={handleExportCSV}
                disabled={filtered.length === 0}
                className="h-9 gap-2 border-border text-muted-foreground hover:text-foreground hover:bg-accent shrink-0 hidden sm:flex disabled:opacity-40 disabled:cursor-not-allowed">
                <DownloadSimple className="w-4 h-4" /> CSV
              </Button>
              <Button variant="outline" size="sm" onClick={handleExportExcel}
                disabled={filtered.length === 0}
                className="h-9 gap-2 border-border text-muted-foreground hover:text-foreground hover:bg-accent shrink-0 hidden sm:flex disabled:opacity-40 disabled:cursor-not-allowed">
                <DownloadSimple className="w-4 h-4" /> Excel
              </Button>
              {/* Mobile export dropdown */}
              <div className="relative sm:hidden">
                <Button variant="outline" size="sm"
                  onClick={() => setExportOpen((v) => !v)}
                  className="h-9 w-9 p-0 border-border text-muted-foreground hover:text-foreground hover:bg-accent shrink-0">
                  <DownloadSimple className="w-4 h-4" />
                </Button>
                {exportOpen && (
                  <div className="absolute right-0 top-full mt-1 z-50 rounded-xl border border-border shadow-lg overflow-hidden"
                    style={{ background: "var(--card)", minWidth: 120 }}>
                    <button onClick={() => { handleExportCSV(); setExportOpen(false); }}
                      className="w-full text-left px-4 py-2.5 text-xs text-foreground hover:bg-accent transition-colors flex items-center gap-2">
                      <DownloadSimple className="w-3.5 h-3.5" /> CSV
                    </button>
                    <button onClick={() => { handleExportExcel(); setExportOpen(false); }}
                      className="w-full text-left px-4 py-2.5 text-xs text-foreground hover:bg-accent transition-colors flex items-center gap-2">
                      <DownloadSimple className="w-3.5 h-3.5" /> Excel
                    </button>
                  </div>
                )}
              </div>
              <Dialog open={openDialog} onOpenChange={setOpenDialog}>
                <DialogTrigger render={
                  <Button className="h-9 gap-2 shrink-0 text-primary-foreground" style={{ background: "var(--primary)" }} />
                }>
                  <Plus className="w-4 h-4" weight="bold" /> Registrar
                </DialogTrigger>
                <DialogContent className="max-w-lg border-border text-foreground" style={{ background: "var(--card)" }}>
                  <DialogHeader>
                    <DialogTitle className="text-foreground">Registrar Movimiento</DialogTitle>
                  </DialogHeader>
                  <MovimientoForm
                    products={scopedProducts}
                    user={user}
                    onClose={() => setOpenDialog(false)}
                    onSaved={() => { toast("Movimiento registrado correctamente"); setPage(1); }}
                  />
                </DialogContent>
              </Dialog>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Select value={filterTipo} onValueChange={(v) => setFilterTipo(v ?? "todos")}>
                <SelectTrigger className="h-8 text-xs bg-muted/60 border-border text-foreground w-40">
                  <SelectValue placeholder="Todos los tipos" />
                </SelectTrigger>
                <SelectContent className="border-border" style={{ background: "var(--card)" }}>
                  <SelectItem value="todos" className="text-foreground text-xs">Todos los tipos</SelectItem>
                  {(["entrada", "salida", "ajuste", "transferencia"] as MovementType[]).map((t) => (
                    <SelectItem key={t} value={t} className="text-foreground text-xs">
                      <span className="flex items-center gap-2">
                        <span style={{ color: TIPO_CONFIG[t].hex }}>{TIPO_CONFIG[t].icon}</span>
                        {TIPO_CONFIG[t].label}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground shrink-0">Desde</span>
                <DateInput className="w-44" value={fechaDesde} onChange={(e) => setFechaDesde(e.target.value)} />
                <span className="text-muted-foreground/50 text-xs select-none">→</span>
                <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground shrink-0">Hasta</span>
                <DateInput className="w-44" value={fechaHasta} onChange={(e) => setFechaHasta(e.target.value)} />
              </div>

              {hasFilters && (
                <button type="button"
                  onClick={() => { setSearch(""); setFilterTipo("todos"); setFechaDesde(""); setFechaHasta(""); }}
                  className="h-8 px-3 text-xs text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted transition-colors">
                  × Limpiar
                </button>
              )}
              <span className="ml-auto text-xs text-muted-foreground">
                {filtered.length} de {scopedMovements.length} registros
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Table */}
        <Card className="border-border hover:shadow-md transition-shadow" style={{ background: "var(--card)" }}>
          <CardContent className="p-0">
            {/* Mobile card list */}
            <div className="md:hidden divide-y divide-border">
              {paginated.map((mov) => {
                const cfg = TIPO_CONFIG[mov.tipo];
                return (
                  <div key={mov.id} className="p-4 flex items-start gap-3 hover:bg-accent/30 transition-colors">
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                      style={{ background: cfg.hexBg }}>
                      <span style={{ color: cfg.hex }}>{cfg.icon}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className="font-medium text-sm text-foreground truncate">{mov.producto?.nombre}</p>
                        <span className="text-sm font-bold flex-shrink-0" style={{ color: cfg.hex }}>
                          {mov.tipo === "entrada" ? "+" : mov.tipo === "salida" ? "−" : "±"}{mov.cantidad}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground font-mono mt-0.5">{mov.producto?.codigo}</p>
                      <div className="flex items-center justify-between mt-1.5">
                        <div className="text-xs text-muted-foreground space-y-0.5">
                          <p>{mov.motivo || cfg.label}</p>
                          <p className="font-mono">{mov.stock_anterior} → <span className="text-foreground font-semibold">{mov.stock_nuevo}</span></p>
                        </div>
                        <div className="flex items-center gap-1">
                          <p className="text-xs text-muted-foreground">
                            {new Date(mov.created_at).toLocaleDateString("es-MX", { day: "2-digit", month: "short" })}
                          </p>
                          <Button variant="ghost" size="icon"
                            className="h-7 w-7 hover:bg-red-500/10 text-muted-foreground hover:text-red-400"
                            onClick={() => setDeleteMovId(mov.id)}>
                            <Prohibit className="w-3 h-3" weight="duotone" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Desktop table */}
            <div className="hidden md:block overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-border hover:bg-transparent">
                    <TableHead className="text-muted-foreground font-medium pl-6">Tipo</TableHead>
                    <TableHead className="text-muted-foreground font-medium">Producto</TableHead>
                    <TableHead className="text-muted-foreground font-medium text-center">Cantidad</TableHead>
                    <TableHead className="text-muted-foreground font-medium text-center">Ant. → Nuevo</TableHead>
                    <TableHead className="text-muted-foreground font-medium">Motivo</TableHead>
                    <TableHead className="text-muted-foreground font-medium">Referencia</TableHead>
                    <TableHead className="text-muted-foreground font-medium">Usuario</TableHead>
                    <TableHead className="text-muted-foreground font-medium">Fecha</TableHead>
                    <TableHead className="text-muted-foreground font-medium text-center pr-4">Acción</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginated.map((mov, i) => {
                    const cfg = TIPO_CONFIG[mov.tipo];
                    return (
                      <TableRow key={mov.id}
                        className="border-border hover:bg-accent/60 transition-colors animate-in fade-in"
                        style={{
                          animationDelay: `${Math.min(i, 12) * 30}ms`,
                          animationFillMode: "backwards",
                          background: i % 2 === 1 ? "color-mix(in oklch, var(--muted) 35%, transparent)" : undefined,
                        }}>
                        <TableCell className="pl-6">
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold"
                            style={{ background: cfg.hexBg, color: cfg.hex }}>
                            {cfg.icon} {cfg.label}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <CategoryIcon name={mov.producto?.categoria?.icono} className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                            <div>
                              <p className="text-sm font-medium text-foreground leading-tight">{mov.producto?.nombre}</p>
                              <p className="text-xs text-muted-foreground font-mono">{mov.producto?.codigo}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <span className="font-bold text-sm" style={{ color: cfg.hex }}>
                            {mov.tipo === "entrada" ? "+" : mov.tipo === "salida" ? "−" : "±"}{mov.cantidad}
                          </span>
                        </TableCell>
                        <TableCell className="text-center">
                          <span className="text-xs text-muted-foreground font-mono">
                            {mov.stock_anterior} → <span className="text-foreground font-semibold">{mov.stock_nuevo}</span>
                          </span>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground max-w-32 truncate">{mov.motivo || "—"}</TableCell>
                        <TableCell className="font-mono text-xs text-muted-foreground">{mov.referencia || "—"}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{mov.usuario_nombre}</TableCell>
                        <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                          {new Date(mov.created_at).toLocaleString("es-MX", { dateStyle: "short", timeStyle: "short" })}
                        </TableCell>
                        <TableCell className="text-center pr-4">
                          <Button variant="ghost" size="icon"
                            className="h-7 w-7 hover:bg-red-500/10 text-muted-foreground hover:text-red-400"
                            title="Anular movimiento"
                            onClick={() => setDeleteMovId(mov.id)}>
                            <Prohibit className="w-3.5 h-3.5" weight="duotone" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>

            {filtered.length === 0 && (
              <div className="text-center py-16 flex flex-col items-center gap-3">
                <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center">
                  <ClipboardText className="w-7 h-7 text-muted-foreground" weight="duotone" />
                </div>
                <div>
                  <p className="text-foreground font-medium text-sm">Sin movimientos</p>
                  <p className="text-muted-foreground text-xs mt-1">
                    {hasFilters ? "Prueba con otros filtros" : "Registra el primer movimiento"}
                  </p>
                </div>
                {hasFilters && (
                  <Button variant="outline" size="sm"
                    onClick={() => { setSearch(""); setFilterTipo("todos"); setFechaDesde(""); setFechaHasta(""); }}
                    className="text-xs">
                    Limpiar filtros
                  </Button>
                )}
              </div>
            )}
            <Pagination
              total={filtered.length}
              page={page}
              perPage={perPage}
              onPageChange={setPage}
              onPerPageChange={setPerPage}
            />
          </CardContent>
        </Card>
      </div>

      <ConfirmDialog
        open={!!deleteMovId}
        title="Anular movimiento"
        description={`¿Anular este movimiento de ${anularTarget ? `${TIPO_CONFIG[anularTarget.tipo].label.toLowerCase()} de ${anularTarget.cantidad} ${anularTarget.producto?.unidad ?? "unidades"}` : ""}? El stock del producto será restaurado al valor anterior.`}
        confirmLabel="Anular"
        destructive
        onConfirm={handleAnular}
        onCancel={() => setDeleteMovId(null)}
      />
    </div>
  );
}

// ─── Movimiento Form ──────────────────────────────────────────────────────────

function MovimientoForm({
  onClose, onSaved, products, user,
}: {
  onClose: () => void;
  onSaved: () => void;
  products: Product[];
  user: import("@/lib/auth-users").AuthUser;
}) {
  const { addMovement } = useData();
  const [tipo, setTipo] = useState<MovementType>("entrada");
  const [productoId, setProductoId] = useState("");
  const [cantidad, setCantidad] = useState("");
  const [referencia, setReferencia] = useState("");
  const [motivo, setMotivo] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const selectedProduct = products.find((p) => p.id === productoId);

  const errors = {
    producto: !productoId ? "Selecciona un producto" : undefined,
    cantidad: !cantidad || parseInt(cantidad) <= 0 ? "Ingresa una cantidad válida" : undefined,
    stockInsuficiente:
      selectedProduct && tipo === "salida" && parseInt(cantidad) > selectedProduct.stock_actual
        ? `Stock insuficiente (disponible: ${selectedProduct.stock_actual})`
        : undefined,
  };
  const hasErrors = Object.values(errors).some(Boolean);

  function calcNuevoStock(): number {
    if (!selectedProduct) return 0;
    const qty = parseInt(cantidad) || 0;
    if (tipo === "entrada") return selectedProduct.stock_actual + qty;
    if (tipo === "salida") return Math.max(0, selectedProduct.stock_actual - qty);
    if (tipo === "transferencia") return Math.max(0, selectedProduct.stock_actual - qty);
    return qty; // ajuste: cantidad es el nuevo valor absoluto
  }

  function handleSubmit() {
    setSubmitted(true);
    if (hasErrors) return;

    const product = products.find((p) => p.id === productoId)!;
    const stockAnterior = product.stock_actual;
    const stockNuevo = calcNuevoStock();

    addMovement({
      producto_id: product.id,
      producto: { ...product, stock_actual: stockNuevo },
      tipo,
      cantidad: parseInt(cantidad),
      stock_anterior: stockAnterior,
      stock_nuevo: stockNuevo,
      motivo: motivo || undefined,
      referencia: referencia || undefined,
      usuario_id: user.id,
      usuario_nombre: user.nombre,
    });

    onSaved();
    onClose();
  }

  const errClass = (field: keyof typeof errors) =>
    submitted && errors[field] ? "border-destructive" : "";

  return (
    <form className="space-y-5" onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
      {/* Tipo */}
      <div className="space-y-2">
        <Label className="text-muted-foreground text-xs">Tipo de Movimiento *</Label>
        <div className="grid grid-cols-4 gap-2">
          {(["entrada", "salida", "ajuste", "transferencia"] as MovementType[]).map((t) => {
            const cfg = TIPO_CONFIG[t];
            const isSelected = tipo === t;
            return (
              <button key={t} type="button" onClick={() => setTipo(t)}
                className="py-3 px-2 rounded-xl text-xs font-semibold transition-all flex flex-col items-center gap-1.5 border"
                style={isSelected
                  ? { background: cfg.hexBg, color: cfg.hex, borderColor: cfg.hex + "50", boxShadow: `0 0 0 2px ${cfg.hex}25` }
                  : { background: "var(--muted)", color: "var(--muted-foreground)", borderColor: "transparent" }
                }>
                <span style={isSelected ? { color: cfg.hex } : {}}>{cfg.icon}</span>
                {cfg.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Producto */}
      <div className="space-y-1.5">
        <Label className="text-muted-foreground text-xs">Producto *</Label>
        <Select value={productoId} onValueChange={(v) => setProductoId(v ?? "")}>
          <SelectTrigger className={`w-full bg-muted border-border text-foreground ${errClass("producto")}`}>
            <SelectValue placeholder="Seleccionar producto" />
          </SelectTrigger>
          <SelectContent className="border-border max-h-60" style={{ background: "var(--card)" }}>
            {products.map((p) => (
              <SelectItem key={p.id} value={p.id} className="text-foreground">
                <span className="inline-flex items-center gap-1.5">
                  <CategoryIcon name={p.categoria?.icono} className="w-3.5 h-3.5" />
                  {p.nombre}
                  <span className="text-muted-foreground ml-1">— {p.stock_actual} {p.unidad}</span>
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {submitted && errors.producto && (
          <p className="flex items-center gap-1 text-[11px] text-destructive mt-1">
            <WarningCircle className="w-3 h-3" weight="fill" /> {errors.producto}
          </p>
        )}
      </div>

      {/* Stock preview */}
      {selectedProduct && cantidad && parseInt(cantidad) > 0 && (
        <div className="flex items-center justify-between px-4 py-3 rounded-xl border border-border bg-muted/40 text-xs">
          <span className="text-muted-foreground">Stock actual: <b className="text-foreground">{selectedProduct.stock_actual}</b></span>
          <span className="text-muted-foreground/50">→</span>
          <span className="text-muted-foreground">Nuevo stock: <b className="text-foreground">{calcNuevoStock()}</b></span>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label className="text-muted-foreground text-xs">
            {tipo === "ajuste" ? "Nuevo Stock (absoluto) *" : "Cantidad *"}
          </Label>
          <Input type="number" min="1" value={cantidad} onChange={(e) => setCantidad(e.target.value)}
            className={`h-9 bg-muted border-border text-foreground ${errClass("cantidad")}`} placeholder="0" />
          {submitted && (errors.cantidad || errors.stockInsuficiente) && (
            <p className="flex items-center gap-1 text-[11px] text-destructive mt-1">
              <WarningCircle className="w-3 h-3" weight="fill" /> {errors.cantidad || errors.stockInsuficiente}
            </p>
          )}
        </div>
        <div className="space-y-1.5">
          <Label className="text-muted-foreground text-xs">Referencia / Folio</Label>
          <Input value={referencia} onChange={(e) => setReferencia(e.target.value)}
            className="h-9 bg-muted border-border text-foreground placeholder:text-muted-foreground" placeholder="FAC-2024-001" />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label className="text-muted-foreground text-xs">Motivo</Label>
        <Input value={motivo} onChange={(e) => setMotivo(e.target.value)}
          className="h-9 bg-muted border-border text-foreground placeholder:text-muted-foreground"
          placeholder="Ej. Compra a proveedor, Devolución, Merma..." />
      </div>

      <div className="flex gap-3 pt-1">
        <Button type="button" variant="outline" onClick={onClose} className="flex-1 border-border text-muted-foreground hover:bg-accent">
          Cancelar
        </Button>
        <Button type="submit" className="flex-1 text-primary-foreground" style={{ background: "var(--primary)" }}>
          Registrar Movimiento
        </Button>
      </div>
    </form>
  );
}
