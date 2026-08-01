"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  ArrowUp, ArrowDown, ArrowsLeftRight, Equalizer, WarningCircle,
} from "@phosphor-icons/react";
import { CategoryIcon } from "@/lib/icon-map";
import { useData } from "@/lib/store";
import type { MovementType, Product } from "@/lib/types";
import type { AuthUser } from "@/lib/auth-users";

export const TIPO_CONFIG: Record<MovementType, {
  label: string; icon: React.ReactNode;
  color: string; bg: string; hex: string; hexBg: string;
}> = {
  entrada: { label: "Entrada", icon: <ArrowUp className="w-4 h-4" />, color: "text-emerald-400", bg: "bg-emerald-500/15", hex: "#10B981", hexBg: "rgba(16,185,129,0.15)" },
  salida: { label: "Salida", icon: <ArrowDown className="w-4 h-4" />, color: "text-red-400", bg: "bg-red-500/15", hex: "#EF4444", hexBg: "rgba(239,68,68,0.15)" },
  ajuste: { label: "Ajuste", icon: <Equalizer className="w-4 h-4" />, color: "text-purple-400", bg: "bg-purple-500/15", hex: "#A78BFA", hexBg: "rgba(167,139,250,0.15)" },
  transferencia: { label: "Transferencia", icon: <ArrowsLeftRight className="w-4 h-4" />, color: "text-blue-400", bg: "bg-blue-500/15", hex: "#3B82F6", hexBg: "rgba(59,130,246,0.15)" },
};

export function MovimientoForm({
  onClose, onSaved, products, user, defaultProductId, defaultTipo,
}: {
  onClose: () => void;
  onSaved: () => void;
  products: Product[];
  user: AuthUser;
  defaultProductId?: string;
  defaultTipo?: MovementType;
}) {
  const { addMovement } = useData();
  const [tipo, setTipo] = useState<MovementType>(defaultTipo ?? "entrada");
  const [productoId, setProductoId] = useState(defaultProductId ?? "");
  const [cantidad, setCantidad] = useState("");
  const [referencia, setReferencia] = useState("");
  const [motivo, setMotivo] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const selectedProduct = products.find((p) => p.id === productoId);

  const errors = {
    producto: !productoId ? "Selecciona un producto" : undefined,
    cantidad: tipo === "ajuste"
      ? (!cantidad || parseInt(cantidad) < 0 ? "Ingresa el nuevo stock (0 o más)" : undefined)
      : (!cantidad || parseInt(cantidad) <= 0 ? "Ingresa una cantidad válida" : undefined),
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
        <Select value={productoId} onValueChange={(v) => setProductoId(v ?? "")}
          items={Object.fromEntries(products.map((p) => [p.id, `${p.nombre} — ${p.stock_actual} ${p.unidad}`]))}>
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
      {selectedProduct && cantidad !== "" && (tipo === "ajuste" ? parseInt(cantidad) >= 0 : parseInt(cantidad) > 0) && (
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
          <Input type="number" min={tipo === "ajuste" ? "0" : "1"} value={cantidad} onChange={(e) => setCantidad(e.target.value)}
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
