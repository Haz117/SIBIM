"use client";

import { useState } from "react";
import { Topbar } from "@/components/layout/Topbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DateInput } from "@/components/ui/date-input";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  ArrowUpRight, ArrowDownRight, Activity, Plus, Search, RefreshCw, ClipboardList,
} from "lucide-react";
import { mockMovements, mockProducts } from "@/lib/mock-data";
import { MovementType } from "@/lib/types";
import { CategoryIcon } from "@/lib/icon-map";
import { useAuth } from "@/components/auth-provider";

const TIPO_CONFIG: Record<MovementType, { label: string; icon: React.ReactNode; color: string; bg: string }> = {
  entrada: {
    label: "Entrada",
    icon: <ArrowUpRight className="w-3.5 h-3.5" />,
    color: "text-emerald-400",
    bg: "bg-emerald-500/15",
  },
  salida: {
    label: "Salida",
    icon: <ArrowDownRight className="w-3.5 h-3.5" />,
    color: "text-red-400",
    bg: "bg-red-500/15",
  },
  ajuste: {
    label: "Ajuste",
    icon: <RefreshCw className="w-3.5 h-3.5" />,
    color: "text-purple-400",
    bg: "bg-purple-500/15",
  },
  transferencia: {
    label: "Transferencia",
    icon: <Activity className="w-3.5 h-3.5" />,
    color: "text-blue-400",
    bg: "bg-blue-500/15",
  },
};

export default function MovimientosPage() {
  const user = useAuth();
  const [search, setSearch] = useState("");
  const [filterTipo, setFilterTipo] = useState("todos");
  const [openDialog, setOpenDialog] = useState(false);

  const scopedMovements = user.role === "admin" ? mockMovements : mockMovements.filter((m) => m.producto?.area === user.area);
  const scopedProducts = user.role === "admin" ? mockProducts : mockProducts.filter((p) => p.area === user.area);

  const summary = (["entrada", "salida", "ajuste"] as MovementType[]).map((tipo) => {
    const items = scopedMovements.filter((m) => m.tipo === tipo);
    return { tipo, total: items.length, qty: items.reduce((s, m) => s + m.cantidad, 0) };
  }).filter((s) => s.total > 0);

  const filtered = scopedMovements.filter((m) => {
    const matchSearch = m.producto?.nombre.toLowerCase().includes(search.toLowerCase()) ||
      m.referencia?.toLowerCase().includes(search.toLowerCase());
    const matchTipo = filterTipo === "todos" || m.tipo === filterTipo;
    return matchSearch && matchTipo;
  });

  return (
    <div className="min-h-screen" style={{ background: "var(--background)" }}>
      <Topbar title="Movimientos" subtitle="Registro de entradas, salidas y ajustes" />

      <div className="p-6 space-y-4">

        {/* Summary cards */}
        <div className="grid grid-cols-3 gap-4">
          {summary.map(({ tipo, total, qty }) => {
            const cfg = TIPO_CONFIG[tipo];
            return (
              <Card key={tipo} className="border-border hover:shadow-md transition-shadow" style={{ background: "var(--card)" }}>
                <CardContent className="p-4 flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${cfg.bg}`}>
                    <span className={cfg.color}>{cfg.icon}</span>
                  </div>
                  <div>
                    <p className="text-xl font-bold text-foreground">{qty} <span className="text-sm font-normal text-muted-foreground">uds.</span></p>
                    <p className="text-xs text-muted-foreground">{cfg.label}s hoy · {total} ops</p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <Input value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar producto, referencia..."
              className="pl-9 h-9 bg-muted border-border text-foreground placeholder:text-muted-foreground" />
          </div>
          <Select value={filterTipo} onValueChange={(v) => setFilterTipo(v ?? "todos")}>
            <SelectTrigger className="w-40 h-9 bg-muted border-border text-foreground">
              <SelectValue placeholder="Tipo" />
            </SelectTrigger>
            <SelectContent className="border-border" style={{ background: "var(--card)" }}>
              <SelectItem value="todos" className="text-foreground">Todos</SelectItem>
              <SelectItem value="entrada" className="text-foreground">Entrada</SelectItem>
              <SelectItem value="salida" className="text-foreground">Salida</SelectItem>
              <SelectItem value="ajuste" className="text-foreground">Ajuste</SelectItem>
              <SelectItem value="transferencia" className="text-foreground">Transferencia</SelectItem>
            </SelectContent>
          </Select>
          <DateInput className="w-40 h-9" />

          <Dialog open={openDialog} onOpenChange={setOpenDialog}>
            <DialogTrigger render={<Button className="h-9 gap-2 text-foreground" style={{ background: "var(--primary)" }} />}>
              <Plus className="w-4 h-4" /> Registrar Movimiento
            </DialogTrigger>
            <DialogContent className="max-w-lg border-border text-foreground" style={{ background: "var(--card)" }}>
              <DialogHeader>
                <DialogTitle className="text-foreground">Registrar Movimiento</DialogTitle>
              </DialogHeader>
              <MovimientoForm onClose={() => setOpenDialog(false)} products={scopedProducts} />
            </DialogContent>
          </Dialog>
        </div>

        {/* Table */}
        <Card className="border-border hover:shadow-md transition-shadow" style={{ background: "var(--card)" }}>
          <CardHeader className="pb-0 pt-4 px-6">
            <CardTitle className="text-sm text-muted-foreground font-normal">{filtered.length} registros</CardTitle>
          </CardHeader>
          <CardContent className="p-0 mt-2">
            <Table>
              <TableHeader>
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead className="text-muted-foreground font-medium">Tipo</TableHead>
                  <TableHead className="text-muted-foreground font-medium">Producto</TableHead>
                  <TableHead className="text-muted-foreground font-medium text-center">Cantidad</TableHead>
                  <TableHead className="text-muted-foreground font-medium text-center">Stock Ant.</TableHead>
                  <TableHead className="text-muted-foreground font-medium text-center">Stock Nuevo</TableHead>
                  <TableHead className="text-muted-foreground font-medium">Motivo</TableHead>
                  <TableHead className="text-muted-foreground font-medium">Referencia</TableHead>
                  <TableHead className="text-muted-foreground font-medium">Usuario</TableHead>
                  <TableHead className="text-muted-foreground font-medium">Fecha</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((mov, i) => {
                  const cfg = TIPO_CONFIG[mov.tipo];
                  return (
                    <TableRow key={mov.id} className="border-border hover:bg-accent/50 animate-in fade-in"
                      style={{ animationDelay: `${Math.min(i, 12) * 30}ms`, animationFillMode: "backwards" }}>
                      <TableCell>
                        <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium ${cfg.bg} ${cfg.color}`}>
                          {cfg.icon} {cfg.label}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <CategoryIcon name={mov.producto?.categoria?.icono} className="w-4 h-4 text-muted-foreground" />
                          <div>
                            <p className="text-sm font-medium text-foreground">{mov.producto?.nombre}</p>
                            <p className="text-xs text-muted-foreground">{mov.producto?.codigo}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <span className={`font-bold text-sm ${cfg.color}`}>
                          {mov.tipo === "entrada" ? "+" : mov.tipo === "salida" ? "-" : "±"}{mov.cantidad}
                        </span>
                      </TableCell>
                      <TableCell className="text-center text-muted-foreground text-sm">{mov.stock_anterior}</TableCell>
                      <TableCell className="text-center text-foreground font-medium text-sm">{mov.stock_nuevo}</TableCell>
                      <TableCell className="text-sm text-muted-foreground max-w-32 truncate">{mov.motivo}</TableCell>
                      <TableCell className="font-mono text-xs text-muted-foreground">{mov.referencia || "—"}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{mov.usuario_nombre}</TableCell>
                      <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                        {new Date(mov.created_at).toLocaleString("es-MX", { dateStyle: "short", timeStyle: "short" })}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>

            {filtered.length === 0 && (
              <div className="text-center py-16">
                <ClipboardList className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
                <p className="text-muted-foreground">No se encontraron movimientos</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function MovimientoForm({ onClose, products }: { onClose: () => void; products: typeof mockProducts }) {
  const [tipo, setTipo] = useState<MovementType>("entrada");
  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <Label className="text-muted-foreground text-xs">Tipo de Movimiento *</Label>
        <div className="grid grid-cols-4 gap-2">
          {(["entrada", "salida", "ajuste", "transferencia"] as MovementType[]).map((t) => {
            const cfg = TIPO_CONFIG[t];
            return (
              <button key={t} onClick={() => setTipo(t)}
                className={`py-2 px-3 rounded-xl text-xs font-medium transition-all flex flex-col items-center gap-1
                  ${tipo === t ? `${cfg.bg} ${cfg.color} ring-1 ring-current` : "bg-muted text-muted-foreground hover:bg-accent"}`}>
                {cfg.icon}
                {cfg.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-1.5">
        <Label className="text-muted-foreground text-xs">Producto *</Label>
        <Select>
          <SelectTrigger className="bg-muted border-border text-foreground">
            <SelectValue placeholder="Seleccionar producto" />
          </SelectTrigger>
          <SelectContent className="border-border" style={{ background: "var(--card)" }}>
            {products.map((p) => (
              <SelectItem key={p.id} value={p.id} className="text-foreground">
                <span className="inline-flex items-center gap-1.5"><CategoryIcon name={p.categoria?.icono} className="w-3.5 h-3.5" /> {p.nombre} — Stock: {p.stock_actual} {p.unidad}</span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label className="text-muted-foreground text-xs">Cantidad *</Label>
          <Input type="number" min="1" className="bg-muted border-border text-foreground" placeholder="0" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-muted-foreground text-xs">Referencia / Folio</Label>
          <Input className="bg-muted border-border text-foreground placeholder:text-muted-foreground" placeholder="FAC-2024-001" />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label className="text-muted-foreground text-xs">Motivo</Label>
        <Input className="bg-muted border-border text-foreground placeholder:text-muted-foreground" placeholder="Ej. Compra a proveedor, Venta, Merma..." />
      </div>

      <div className="flex gap-3 pt-2">
        <Button variant="outline" onClick={onClose} className="flex-1 border-border text-muted-foreground hover:bg-accent">
          Cancelar
        </Button>
        <Button className="flex-1 text-foreground" style={{ background: "var(--primary)" }}>
          Registrar
        </Button>
      </div>
    </div>
  );
}
