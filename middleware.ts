import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  // 1. Check for your auth token (Update 'token' to your actual cookie name if different)
  const token = request.cookies.get("token")?.value;
  const { pathname } = request.nextUrl;

  // 2. Define the "Lockdown" pages
  // We only block the Live Arena and protected API calls
  const isLiveMatch = pathname.startsWith("/play/live");
  const isProtectedRoute =
    pathname.startsWith("/api/challenge") ||
    pathname.startsWith("/api/live-move");

  // 3. Logic: If trying to go LIVE or save challenges without a token -> Redirect to Profile/Login
  if ((isLiveMatch || isProtectedRoute) && !token) {
    // Redirect to profile so they can "fill the form" and get a token/account
    return NextResponse.redirect(new URL("/profile", request.url));
  }

  // Allow everything else (Free play, Profile viewing, etc.)
  return NextResponse.next();
}

// 4. The Matcher (Tells Next.js where to run this script)
export const config = {
  matcher: [
    "/api/pusher/auth", // Explicitly include it
    "/play/live/:path*",
    "/api/challenge/:path*",
    "/api/live-move/:path*",
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public (public folder)
     */
    "/((?!_next/static|_next/image|favicon.ico|public).*)",
  ],
};
