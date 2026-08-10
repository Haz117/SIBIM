import "server-only";
import { createSupabaseClient, isSupabaseConfigured } from "./supabase";
import { mockCategories, mockProducts, mockMovements } from "./mock-data";
import { AUTH_USERS } from "./auth-users";
import { computeEstado } from "./product-utils";
import { verifyPassword } from "./hash";
import type { Product, Category, Movement } from "./types";
import type { AuthUser } from "./auth-users";

export async function dbGetCategories(): Promise<Category[]> {
  if (!isSupabaseConfigured()) return mockCategories;
  const { data, error } = await createSupabaseClient()
    .from("categories")
    .select("*")
    .order("nombre");
  if (error || !data) return mockCategories;
  return data as Category[];
}

export async function dbGetProducts(): Promise<Product[]> {
  if (!isSupabaseConfigured()) return mockProducts;
  const { data, error } = await createSupabaseClient()
    .from("products")
    .select("*, categoria:categories(*)")
    .order("created_at", { ascending: false });
  if (error || !data) return mockProducts;
  return (data as any[]).map((p) => ({ ...p, estado: computeEstado(p) })) as Product[];
}

export async function dbGetMovements(): Promise<Movement[]> {
  if (!isSupabaseConfigured()) return mockMovements;
  const { data, error } = await createSupabaseClient()
    .from("movements")
    .select("*, producto:products(*, categoria:categories(*))")
    .order("created_at", { ascending: false });
  if (error || !data) return mockMovements;
  return data as Movement[];
}

export async function dbFindUserByCredentials(
  username: string,
  password: string
): Promise<AuthUser | null> {
  if (!isSupabaseConfigured()) {
    return AUTH_USERS.find((u) => u.username === username && u.password === password) ?? null;
  }
  const { data } = await createSupabaseClient()
    .from("users")
    .select("*")
    .eq("username", username)
    .single();
  if (!data) return null;
  const valid = await verifyPassword(password, (data as any).password);
  if (!valid) return null;
  // No devolver el hash al cliente
  const { password: _pw, ...user } = data as any;
  return user as AuthUser;
}

export async function dbFindUserById(id: string): Promise<AuthUser | null> {
  if (!isSupabaseConfigured()) {
    return AUTH_USERS.find((u) => u.id === id) ?? null;
  }
  const { data } = await createSupabaseClient()
    .from("users")
    .select("id, username, nombre, cargo, role, area, foto_url")
    .eq("id", id)
    .single();
  return (data as AuthUser) ?? null;
}
