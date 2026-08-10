"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { dbFindUserByCredentials } from "./db";
import { createSession, deleteSession } from "./session";
import { checkRateLimit, resetRateLimit } from "./rate-limit";
import { LoginSchema } from "./schemas";

export interface LoginState {
  error?: string;
}

export async function login(_prevState: LoginState | undefined, formData: FormData): Promise<LoginState> {
  const headersList = await headers();
  const ip =
    headersList.get("x-forwarded-for")?.split(",")[0].trim() ??
    headersList.get("x-real-ip") ??
    "unknown";

  const { allowed, retryAfter } = checkRateLimit(ip);
  if (!allowed) {
    return { error: `Demasiados intentos fallidos. Intenta en ${retryAfter} minutos.` };
  }

  const parsed = LoginSchema.safeParse({
    username: String(formData.get("username") ?? "").trim(),
    password: String(formData.get("password") ?? ""),
  });

  if (!parsed.success) {
    return { error: "Usuario o contraseña inválidos" };
  }

  const { username, password } = parsed.data;
  const user = await dbFindUserByCredentials(username, password);

  if (!user) {
    return { error: "Usuario o contraseña incorrectos" };
  }

  resetRateLimit(ip);
  await createSession(user.id);
  redirect("/dashboard");
}

export async function logout() {
  await deleteSession();
  redirect("/login");
}
