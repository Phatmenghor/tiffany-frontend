// src/middleware.ts
import { NextRequest, NextResponse } from "next/server";
import { locales, defaultLocale } from "./i18n/request";
import { ACCESS_TOKEN_KEY } from "@/constants/storage-keys";

export default function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get(ACCESS_TOKEN_KEY)?.value;

  // -----------------------------
  // Locale handling
  // -----------------------------
  const localeCookie = req.cookies.get("locale")?.value;
  const locale =
    localeCookie && locales.includes(localeCookie as any)
      ? localeCookie
      : defaultLocale;

  // -----------------------------
  // Route definitions
  // -----------------------------
  const publicRoutes = ["/login"];
  const protectedRoutes = ["/admin"];

  const isPublicRoute = publicRoutes.some((route) =>
    pathname.startsWith(route)
  );

  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );

  // =============================
  // PROTECTED ROUTES
  // =============================
  if (isProtectedRoute && !token) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // =============================
  // LOGIN PAGE
  // =============================
  if (isPublicRoute && token && pathname === "/login") {
    return NextResponse.redirect(new URL("/admin", req.url));
  }

  // -----------------------------
  // Continue request
  // -----------------------------
  const response = NextResponse.next();
  response.headers.set("x-locale", locale);

  return response;
}

// -----------------------------
// Matcher config
// -----------------------------
export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*|api).*)"],
};
