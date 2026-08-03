import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Lightweight cookie-presence check only. Full user validation happens in the
// dashboard layout via getSession() → dbFindUserById().
function hasValidSession(request: NextRequest): boolean {
  return !!request.cookies.get("session")?.value;
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
