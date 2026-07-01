import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const pathname = req.nextUrl.pathname;

    // Admin-only routes
    const adminRoutes = ["/admin"];
    if (adminRoutes.some((r) => pathname.startsWith(r))) {
      if (
        token?.role !== "SUPER_ADMIN" &&
        token?.role !== "ADMIN"
      ) {
        return NextResponse.redirect(new URL("/dashboard", req.url));
      }
    }

    // Schedule management routes
    const scheduleRoutes = ["/schedule"];
    if (scheduleRoutes.some((r) => pathname.startsWith(r))) {
      const allowed = [
        "SUPER_ADMIN",
        "ADMIN",
        "SCHEDULE_MANAGER",
        "DEPARTMENT_CHAIR",
      ];
      if (!allowed.includes(token?.role as string)) {
        return NextResponse.redirect(new URL("/dashboard", req.url));
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  // Protect all routes except login, API auth, and static files
  matcher: [
    "/((?!login|api/auth|_next/static|_next/image|favicon.ico|public).*)",
  ],
};
