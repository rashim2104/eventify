import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const hasDefaultPassword = req.nextauth?.token?.hasDefaultPassword;
    const path = req.nextUrl.pathname;

    if (hasDefaultPassword && path !== "/profile") {
      return NextResponse.redirect(new URL("/profile", req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = { matcher: ["/dashboard", "/create", "/status", "/update", "/approve", "/report", "/manage", "/profile", "/venues", "/events", "/events/:path*"] };