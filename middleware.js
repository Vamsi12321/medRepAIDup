import { NextResponse } from "next/server";

const roleRoutes = {
  company: ["/company"],
  doctor:  ["/doctor"],
  mr:      ["/mr"],
};

const dashboards = {
  company: "/company/overview",
  doctor:  "/doctor/home",
  mr:      "/mr/dashboard",
};

export function middleware(request) {
  const { pathname } = request.nextUrl;

  const token    = request.cookies.get("access_token")?.value;
  const userRole = request.cookies.get("userRole")?.value;

  // Public routes — let through
  if (pathname === "/" || pathname.startsWith("/login") || pathname.startsWith("/api") || pathname.startsWith("/drug-details")) {
    // If already logged in, redirect to their dashboard
    if (token && userRole && (pathname === "/" || pathname === "/login")) {
      const dest = dashboards[userRole];
      if (dest) return NextResponse.redirect(new URL(dest, request.url));
    }
    return NextResponse.next();
  }

  // Not logged in — send to login
  if (!token || !userRole) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Wrong role — send to their own dashboard
  const allowedPrefixes = roleRoutes[userRole] || [];
  const hasAccess = allowedPrefixes.some((prefix) => pathname.startsWith(prefix));

  if (!hasAccess) {
    return NextResponse.redirect(new URL(dashboards[userRole] || "/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
