"use server";

import { createSupabaseClient, isSupabaseConfigured } from "./supabase";
import type { Product, Category, Movement } from "./types";

// ── Productos ──────────────────────────────────────────────────────────────

export async function dbAddProduct(product: Product) {
  if (!isSupabaseConfigured()) return;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { categoria, estado, ...row } = product;
  await createSupabaseClient().from("products").upsert(row);
}

export async function dbUpdateProduct(
  id: string,
  updates: Partial<Omit<Product, "id" | "created_at">>
) {
  if (!isSupabaseConfigured()) return;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { categoria, estado, ...row } = updates as any;
  await createSupabaseClient()
    .from("products")
    .update({ ...row, updated_at: new Date().toISOString() })
    .eq("id", id);
}

export async function dbDeleteProduct(id: string) {
  if (!isSupabaseConfigured()) return;
  await createSupabaseClient().from("products").delete().eq("id", id);
}

// ── Categorías ─────────────────────────────────────────────────────────────

export async function dbAddCategory(category: Category) {
  if (!isSupabaseConfigured()) return;
  await createSupabaseClient().from("categories").upsert(category);
}

export async function dbUpdateCategory(
  id: string,
  updates: Partial<Omit<Category, "id">>
) {
  if (!isSupabaseConfigured()) return;
  await createSupabaseClient().from("categories").update(updates).eq("id", id);
}

export async function dbDeleteCategory(id: string) {
  if (!isSupabaseConfigured()) return;
  await createSupabaseClient().from("categories").delete().eq("id", id);
}

// ── Movimientos ────────────────────────────────────────────────────────────

export async function dbAddMovement(movement: Movement) {
  if (!isSupabaseConfigured()) return;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { producto, ...row } = movement;
  const supabase = createSupabaseClient();
  await supabase.from("movements").insert(row);
  // Actualizar stock del producto en la misma operación
  await supabase
    .from("products")
    .update({ stock_actual: movement.stock_nuevo, updated_at: new Date().toISOString() })
    .eq("id", movement.producto_id);
}

export async function dbDeleteMovement(
  id: string,
  productoId: string,
  stockAnterior: number
) {
  if (!isSupabaseConfigured()) return;
  const supabase = createSupabaseClient();
  await supabase.from("movements").delete().eq("id", id);
  // Revertir stock
  await supabase
    .from("products")
    .update({ stock_actual: stockAnterior, updated_at: new Date().toISOString() })
    .eq("id", productoId);
}
