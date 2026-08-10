import "server-only";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { dbFindUserById } from "./db";
import type { AuthUser } from "./auth-users";

const COOKIE_NAME = "session";
const ALG = "HS256";
const MAX_AGE = 60 * 60 * 24 * 7; // 7 días

function getSecret(): Uint8Array {
  const raw = process.env.SESSION_SECRET;
  if (!raw && process.env.NODE_ENV === "production") {
    throw new Error("SESSION_SECRET no está configurado. Genera uno con: openssl rand -base64 32");
  }
  // En desarrollo/demo se usa un fallback — no es seguro para producción
  return new TextEncoder().encode(raw ?? "sibim-dev-secret-change-in-production");
}

export async function createSession(userId: string) {
  const token = await new SignJWT({ sub: userId })
    .setProtectedHeader({ alg: ALG })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(getSecret());

  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE,
  });
}

export async function getSession(): Promise<AuthUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, getSecret(), { algorithms: [ALG] });
    const userId = payload.sub;
    if (!userId) return null;
    return dbFindUserById(userId);
  } catch {
    // Token inválido, expirado o manipulado — tratar como sesión inexistente
    return null;
  }
}

export async function deleteSession() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}
