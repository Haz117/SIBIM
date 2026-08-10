"use server";

import { createSupabaseClient, isSupabaseConfigured } from "./supabase";
import { ALL_AREA_NAMES } from "./areas-list";
import { hashPassword } from "./hash";
import { AUTH_USERS } from "./auth-users";
import { ProductWriteSchema, CategoryWriteSchema, MovementWriteSchema, UserWriteSchema } from "./schemas";
import type { Product, Category, Movement } from "./types";
import type { AuthUser } from "./auth-users";

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

// ── Usuarios ───────────────────────────────────────────────────────────────

export async function dbGetUsersWithMeta(): Promise<{ users: AuthUser[]; canManage: boolean }> {
  if (!isSupabaseConfigured()) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const users = AUTH_USERS.map(({ password: _pw, ...u }) => u);
    return { users, canManage: false };
  }
  const { data } = await createSupabaseClient()
    .from("users")
    .select("id, username, nombre, cargo, role, area, foto_url")
    .order("nombre");
  return { users: (data as AuthUser[]) ?? AUTH_USERS, canManage: true };
}

export async function dbAddUser(
  input: { nombre: string; username: string; password: string; cargo: string; role: AuthUser["role"]; area: string | null }
): Promise<AuthUser> {
  if (!isSupabaseConfigured()) throw new Error("Supabase no está configurado");
  assertValid(UserWriteSchema.safeParse(input), "Usuario");
  const id = crypto.randomUUID();
  const hashedPw = await hashPassword(input.password!);
  const row = { id, nombre: input.nombre, username: input.username, password: hashedPw, cargo: input.cargo, role: input.role, area: input.area };
  const { data, error } = await createSupabaseClient().from("users").insert(row).select("id, username, nombre, cargo, role, area, foto_url").single();
  if (error) throw error;
  return data as AuthUser;
}

export async function dbUpdateUser(
  id: string,
  updates: { nombre?: string; cargo?: string; role?: AuthUser["role"]; area?: string | null }
): Promise<void> {
  if (!isSupabaseConfigured()) throw new Error("Supabase no está configurado");
  assertValid(UserWriteSchema.partial().safeParse(updates), "Usuario");
  const { error } = await createSupabaseClient().from("users").update(updates).eq("id", id);
  if (error) throw error;
}

export async function dbChangeUserPassword(id: string, newPassword: string): Promise<void> {
  if (!isSupabaseConfigured()) throw new Error("Supabase no está configurado");
  if (!newPassword || newPassword.length < 8) throw new Error("La contraseña debe tener al menos 8 caracteres");
  const hashed = await hashPassword(newPassword);
  const { error } = await createSupabaseClient().from("users").update({ password: hashed }).eq("id", id);
  if (error) throw error;
}

export async function dbDeleteUser(id: string): Promise<void> {
  if (!isSupabaseConfigured()) throw new Error("Supabase no está configurado");
  const { error } = await createSupabaseClient().from("users").delete().eq("id", id);
  if (error) throw error;
}

export async function dbUpdateUserProfile(
  userId: string,
  updates: { nombre?: string; foto_url?: string | null }
): Promise<void> {
  if (!isSupabaseConfigured()) return;
  const { error } = await createSupabaseClient().from("users").update(updates).eq("id", userId);
  if (error) throw error;
}
