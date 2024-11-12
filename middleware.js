export { default } from "next-auth/middleware";

export const config = { matcher: ["/dashboard","/create","/status","/update","/approve","/report","/manage","/profile","/events","/events/:path*"] };