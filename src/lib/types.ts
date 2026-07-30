export type ProductStatus = "activo" | "bajo_stock" | "agotado" | "vencido";
export type MovementType = "entrada" | "salida" | "ajuste" | "transferencia";
export type UserRole = "admin" | "auditor" | "empleado";

export interface Category {
  id: string;
  nombre: string;
  descripcion?: string;
  color: string;
  icono: string;
  created_at: string;
}

export interface Product {
  id: string;
  nombre: string;
  codigo: string;
  descripcion?: string;
  categoria_id: string;
  categoria?: Category;
  precio_compra: number;
  precio_venta: number;
  stock_actual: number;
  stock_minimo: number;
  stock_maximo: number;
  unidad: string;
  proveedor?: string;
  fecha_vencimiento?: string;
  foto_url?: string;
  estado: ProductStatus;
  ubicacion?: string;
  /** Nombre exacto de la secretaría, dirección o área (según config/areas.js) responsable del bien */
  area?: string;
  created_at: string;
  updated_at: string;
}

export interface Movement {
  id: string;
  producto_id: string;
  producto?: Product;
  tipo: MovementType;
  cantidad: number;
  stock_anterior: number;
  stock_nuevo: number;
  motivo?: string;
  referencia?: string;
  usuario_id: string;
  usuario_nombre: string;
  created_at: string;
}

export interface DashboardStats {
  total_productos: number;
  productos_activos: number;
  productos_bajo_stock: number;
  productos_agotados: number;
  productos_vencidos: number;
  valor_total_inventario: number;
  movimientos_hoy: number;
  categorias: number;
}
