"use client";

import { createContext, useContext } from "react";
import type { AuthUser } from "@/lib/auth-users";

const AuthContext = createContext<AuthUser | null>(null);

export function AuthProvider({ user, children }: { user: AuthUser; children: React.ReactNode }) {
  return <AuthContext.Provider value={user}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthUser {
  const user = useContext(AuthContext);
  if (!user) {
    throw new Error("useAuth() debe usarse dentro de <AuthProvider> (rutas del dashboard)");
  }
  return user;
}
