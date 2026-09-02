import { NextResponse } from "next/server";

// Routes that don't require authentication
const PUBLIC_PATHS = ["/login", "/admin/login", "/forgot-password", "/register", "/api/"];

// Role-based route prefixes — each role can only access its own section
const ROLE_ROUTES = {
  company: ["/company"],
  mr:      ["/mr"],
  admin:   ["/admin"],
};

export function middleware(request) {
  const { pathname } = request.nextUrl;

  // Read auth cookies upfront
  const token = request.cookies.get("access_token")?.value;
  const userRole = request.cookies.get("userRole")?.value;

  // Allow public paths (login, forgot-password, API routes, static assets)
  if (
    PUBLIC_PATHS.some((p) => pathname.startsWith(p)) ||
    pathname === "/" ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon")
  ) {
    // If already logged in and visiting login or landing, redirect to dashboard
    if (token && userRole && (pathname === "/" || pathname === "/login" || pathname === "/admin/login")) {
      const redirectMap = {
        company: "/company/overview",
        mr:      "/mr/dashboard",
        admin:   "/admin/dashboard",
      };
      const dest = redirectMap[userRole];
      if (dest) return NextResponse.redirect(new URL(dest, request.url));
    }
    return NextResponse.next();
  }

  // No token → redirect to login
  if (!token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Block MR from network routes (feature not available for MRs)
  if (userRole === "mr" && pathname.startsWith("/mr/network")) {
    return NextResponse.redirect(new URL("/mr/dashboard", request.url));
  }

  // Role-based access control: ensure user can only access their own routes
  if (userRole && ROLE_ROUTES[userRole]) {
    const allowedPrefixes = ROLE_ROUTES[userRole];
    const isAllowed =
      allowedPrefixes.some((prefix) => pathname.startsWith(prefix)) ||
      pathname.startsWith("/change-password") ||
      pathname.startsWith("/drug-details");

    if (!isAllowed) {
      // Redirect to their own dashboard instead of showing forbidden
      const redirectMap = {
        company: "/company/overview",
        mr:      "/mr/dashboard",
        admin:   "/admin/dashboard",
      };
      return NextResponse.redirect(new URL(redirectMap[userRole] || "/", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  // Run middleware on all routes except static files and Next.js internals
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
