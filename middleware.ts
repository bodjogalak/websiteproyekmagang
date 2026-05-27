// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(request: NextRequest) {
  const token = await getToken({ 
    req: request, 
    secret: process.env.NEXTAUTH_SECRET 
  });
  
  const { pathname } = request.nextUrl;
  const referer = request.headers.get("referer");

  // 1. LOGIC UNTUK HALAMAN AUTH (Login/Register)
  const isAuthPage = pathname === "/login" || pathname === "/register";
  
  if (isAuthPage && token) {
    // Jika user sudah login dan mencoba akses login/regis:
    
    // Jika dia datang dari halaman internal (misal dari Landing Page)
    if (referer && referer.includes(request.nextUrl.origin)) {
      return NextResponse.redirect(referer); // Kembalikan ke tempat dia berasal
    }

    // Jika dia buka tab baru langsung ke /login, lempar ke dashboard masing-masing
    const fallback = token.role === "ADMIN" ? "/admin" : "/dashboard";
    return NextResponse.redirect(new URL(fallback, request.url));
  }

  // 2. PROTEKSI AREA ADMIN (Tetap sama)
  if (pathname.startsWith("/admin")) {
    if (!token || token.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  // 3. PROTEKSI AREA DASHBOARD USER (Tetap sama)
  if (pathname.startsWith("/dashboard")) {
    if (!token) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    if (token.role === "ADMIN") {
      return NextResponse.redirect(new URL("/admin", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/admin/:path*",
    "/login",
    "/register",
  ],
};