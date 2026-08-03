"use server";

import { redirect } from "next/navigation";
import { dbFindUserByCredentials } from "./db";
import { createSession, deleteSession } from "./session";

export interface LoginState {
  error?: string;
}

export async function login(_prevState: LoginState | undefined, formData: FormData): Promise<LoginState> {
  const username = String(formData.get("username") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!username || !password) {
    return { error: "Ingresa tu usuario y contraseña" };
  }

  const user = await dbFindUserByCredentials(username, password);
  if (!user) {
    return { error: "Usuario o contraseña incorrectos" };
  }

  await createSession(user.id);
  redirect("/dashboard");
}

export async function logout() {
  await deleteSession();
  redirect("/login");
}
