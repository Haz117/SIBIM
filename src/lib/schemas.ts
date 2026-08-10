import { z } from "zod";

export const LoginSchema = z.object({
  username: z.string().min(1).max(50),
  password: z.string().min(1).max(128),
});

export const ProductWriteSchema = z.object({
  nombre: z.string().min(1, "Nombre requerido").max(200),
  codigo: z.string().min(1, "Código requerido").max(50),
  descripcion: z.string().max(500).nullish(),
  categoria_id: z.string().min(1, "Categoría requerida"),
  precio_compra: z.number().min(0, "El precio no puede ser negativo"),
  precio_venta: z.number().min(0, "El precio no puede ser negativo"),
  stock_actual: z.number().int().min(0),
  stock_minimo: z.number().int().min(0),
  stock_maximo: z.number().int().min(0),
  unidad: z.string().min(1).max(50),
  proveedor: z.string().max(200).nullish(),
  ubicacion: z.string().max(200).nullish(),
  area: z.string().max(200).nullish(),
  fecha_vencimiento: z.string().nullish(),
  foto_url: z.string().nullish(),
});

export const CategoryWriteSchema = z.object({
  nombre: z.string().min(1, "Nombre requerido").max(100),
  descripcion: z.string().max(300).nullish(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Color inválido"),
  icono: z.string().min(1).max(50),
});

export const MovementWriteSchema = z.object({
  producto_id: z.string().min(1, "Producto requerido"),
  tipo: z.enum(["entrada", "salida", "ajuste", "transferencia"]),
  cantidad: z.number().int().positive("La cantidad debe ser mayor a 0"),
  stock_anterior: z.number().int().min(0),
  stock_nuevo: z.number().int().min(0),
  motivo: z.string().max(500).nullish(),
  referencia: z.string().max(100).nullish(),
  usuario_id: z.string().min(1),
  usuario_nombre: z.string().min(1).max(100),
});
