import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { AUTH_USERS } from "@/lib/auth-users";

// Optimistic check only (reads the cookie directly — Proxy can't use next/headers).
// Real authorization for data access still happens in each page via useAuth()/getSession().
function hasValidSession(request: NextRequest): boolean {
  const sessionId = request.cookies.get("session")?.value;
  if (!sessionId) return false;
  return AUTH_USERS.some((u) => u.id === sessionId);
}

export default function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isAuthenticated = hasValidSession(request);

  if (pathname === "/login") {
    if (isAuthenticated) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    return NextResponse.next();
  }

  if (!isAuthenticated) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|ico)$).*)"],
};
