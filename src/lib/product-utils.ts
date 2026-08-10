import type { Product } from "./types";

export function computeEstado(p: {
  stock_actual: number;
  stock_minimo: number;
  fecha_vencimiento?: string | null;
}): Product["estado"] {
  if (p.fecha_vencimiento && new Date(p.fecha_vencimiento) < new Date()) return "vencido";
  if (p.stock_actual === 0) return "agotado";
  if (p.stock_actual <= p.stock_minimo) return "bajo_stock";
  return "activo";
}
