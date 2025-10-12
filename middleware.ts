import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  console.log("Middleware: Provjera rute", pathname); // Debug log

  // Ignoriraj login i API rute
  if (pathname.startsWith("/login") || pathname.startsWith("/api/")) {
    console.log("Middleware: Ignoriram rutu", pathname);
    return NextResponse.next();
  }

  // Provjera session cookie-a
  const sessionCookie = request.cookies.get("session")?.value;
  console.log("Middleware: Session cookie:", sessionCookie ? "Postoji" : "Nema"); // Debug log

  if (!sessionCookie) {
    console.log("Middleware: Nema session cookie-a, preusmjeravam na /login");
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.search = `?redirect=${encodeURIComponent(pathname)}`;
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|login).*)"],
};