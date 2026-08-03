import "server-only";
import { cookies } from "next/headers";
import { AuthUser } from "./auth-users";
import { dbFindUserById } from "./db";

const COOKIE_NAME = "session";

// DEMO ONLY: the cookie stores the plain user id. There's no real secret to
// protect since AUTH_USERS is mock data — in production, replace this with a
// signed/encrypted session (e.g. `jose` + SESSION_SECRET) or delegate entirely
// to a real auth provider (Supabase Auth).

export async function createSession(userId: string) {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, userId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function getSession(): Promise<AuthUser | null> {
  const cookieStore = await cookies();
  const userId = cookieStore.get(COOKIE_NAME)?.value;
  if (!userId) return null;
  return dbFindUserById(userId);
}

export async function deleteSession() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}
