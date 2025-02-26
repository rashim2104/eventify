import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const hasDefaultPassword = req.nextauth?.token?.hasDefaultPassword;
    const path = req.nextUrl.pathname;

    // Force password change for default password users
    if (hasDefaultPassword && path !== "/profile") {
      return NextResponse.redirect(new URL("/profile", req.url));
    }

    // Ensure authenticated users trying to access login page are redirected to dashboard
    if (path === "/" && req.nextauth.token) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const path = req.nextUrl.pathname;
        // Allow public access to home and root
        if (path === "/home" || path === "/") {
          return true;
        }
        // Require authentication for all other routes
        return !!token;
      },
    },
  }
);

export const config = { 
  matcher: [
    "/",
    "/home",
    "/dashboard", 
    "/create", 
    "/status", 
    "/update", 
    "/approve", 
    "/report", 
    "/manage", 
    "/profile", 
    "/venues", 
    "/events", 
    "/events/:path*"
  ] 
};