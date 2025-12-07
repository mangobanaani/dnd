import { type NextRequest, NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
  // Skip Supabase auth for local development
  // When you're ready to add auth, uncomment the following:
  // import { updateSession } from "./app/lib/supabase/middleware";
  // return await updateSession(request);

  // For now, just pass through all requests
  return NextResponse.next();
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
