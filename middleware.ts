import { type NextRequest } from "next/server";
import { updateSession } from "./app/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  // Refresh the Supabase session and gate protected routes.
  // No-ops (passes through) when Supabase env vars are not configured.
  return await updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder and data files
     * - API routes
     */
    "/((?!_next/static|_next/image|favicon.ico|data/|api/|.*\\.(?:svg|png|jpg|jpeg|gif|webp|json)$).*)",
  ],
};
