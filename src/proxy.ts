import type { NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

/**
 * Next.js 16 proxy (formerly middleware). Refreshes the Supabase session on
 * every request and blocks unauthenticated access to protected routes before a
 * page is ever rendered.
 */
export function proxy(request: NextRequest) {
  return updateSession(request);
}

/**
 * Only the routes that actually need a session.
 *
 * This previously matched every request, so each marketing page — all of them
 * static — waited on a network round trip to the Supabase auth server before a
 * byte was sent. That was most of the delay between pages. Static pages now
 * come straight from the edge cache, and the session check runs only where it
 * decides something.
 */
export const config = {
  matcher: [
    "/dashboard/:path*",
    "/admin/:path*",
    "/welcome",
    "/login",
    "/register",
    "/admin-login",
  ],
};
