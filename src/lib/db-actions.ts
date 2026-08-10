"use server";

import { createSupabaseClient, isSupabaseConfigured } from "./supabase";
import { ALL_AREA_NAMES } from "./areas-list";
import { ProductWriteSchema, CategoryWriteSchema, MovementWriteSchema } from "./schemas";
import type { Product, Category, Movement } from "./types";

function validateArea(area?: string) {
  if (area && !ALL_AREA_NAMES.includes(area)) {
    throw new Error(`Área inválida: "${area}"`);
  }
}

function assertValid<T>(result: { success: boolean; error?: { issues: { message: string }[] } }, label: string): void {
  if (!result.success) {
    const msg = result.error?.issues[0]?.message ?? "dato inválido";
    throw new Error(`${label}: ${msg}`);
  }
}

// ── Productos ──────────────────────────────────────────────────────────────

export async function dbAddProduct(product: Product) {
  if (!isSupabaseConfigured()) return;
  validateArea(product.area ?? undefined);
  assertValid(ProductWriteSchema.safeParse(product), "Producto");
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { categoria, estado, ...row } = product;
  const { error } = await createSupabaseClient().from("products").upsert(row);
  if (error) throw error;
}

export async function dbUpdateProduct(
  id: string,
  updates: Partial<Omit<Product, "id" | "created_at">>
) {
  if (!isSupabaseConfigured()) return;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { categoria, estado, ...row } = updates as any;
  if (row.area !== undefined) validateArea(row.area);
  assertValid(ProductWriteSchema.partial().safeParse(row), "Producto");
  const { error } = await createSupabaseClient()
    .from("products")
    .update({ ...row, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw error;
}

export async function dbDeleteProduct(id: string) {
  if (!isSupabaseConfigured()) return;
  const { error } = await createSupabaseClient().from("products").delete().eq("id", id);
  if (error) throw error;
}

// ── Categorías ─────────────────────────────────────────────────────────────

export async function dbAddCategory(category: Category) {
  if (!isSupabaseConfigured()) return;
  assertValid(CategoryWriteSchema.safeParse(category), "Categoría");
  const { error } = await createSupabaseClient().from("categories").upsert(category);
  if (error) throw error;
}

export async function dbUpdateCategory(
  id: string,
  updates: Partial<Omit<Category, "id">>
) {
  if (!isSupabaseConfigured()) return;
  assertValid(CategoryWriteSchema.partial().safeParse(updates), "Categoría");
  const { error } = await createSupabaseClient().from("categories").update(updates).eq("id", id);
  if (error) throw error;
}

export async function dbDeleteCategory(id: string) {
  if (!isSupabaseConfigured()) return;
  const { error } = await createSupabaseClient().from("categories").delete().eq("id", id);
  if (error) throw error;
}

// ── Movimientos ────────────────────────────────────────────────────────────
// Ambas operaciones usan funciones Postgres (RPC) para ejecutar el INSERT/UPDATE
// en una sola transacción, evitando inconsistencias si la segunda query falla.

export async function dbAddMovement(movement: Movement) {
  if (!isSupabaseConfigured()) return;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { producto, ...row } = movement;
  assertValid(MovementWriteSchema.safeParse(row), "Movimiento");
  const { error } = await createSupabaseClient().rpc("add_movement_atomic", {
    p_id: row.id,
    p_producto_id: row.producto_id,
    p_tipo: row.tipo,
    p_cantidad: row.cantidad,
    p_stock_anterior: row.stock_anterior,
    p_stock_nuevo: row.stock_nuevo,
    p_motivo: row.motivo ?? null,
    p_referencia: row.referencia ?? null,
    p_usuario_id: row.usuario_id,
    p_usuario_nombre: row.usuario_nombre,
    p_created_at: row.created_at,
  });
  if (error) throw error;
}

export async function dbDeleteMovement(
  id: string,
  productoId: string,
  stockAnterior: number
) {
  if (!isSupabaseConfigured()) return;
  if (typeof stockAnterior !== "number" || stockAnterior < 0) {
    throw new Error("Stock anterior inválido");
  }
  const { error } = await createSupabaseClient().rpc("delete_movement_atomic", {
    p_id: id,
    p_producto_id: productoId,
    p_stock_anterior: stockAnterior,
  });
  if (error) throw error;
}
