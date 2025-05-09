import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// Simple middleware for handling CORS and basic auth checks
export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const pathname = req.nextUrl.pathname
  
  // Add CORS headers for API routes
  if (pathname.startsWith('/api/')) {
    res.headers.set('Access-Control-Allow-Origin', '*')
    res.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
    res.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  }
  
  // For demo purposes, we'll assume the user is authenticated
  // In a real app, you would check for a valid session
  const session = true

  // Authentication logic
  const publicRoutes = ["/login", "/signup", "/forgot-password", "/reset-password", "/auth/callback"]
  const isPublicRoute = publicRoutes.some((route) => pathname.startsWith(route))
  const isRootRoute = pathname === "/"
  const isApiRoute = pathname.startsWith("/api/")

  // For demo purposes, we'll allow access to all routes
  // In a real app, you would redirect unauthenticated users
  
  // If authenticated and trying to access login/signup
  if (session && (pathname.startsWith("/login") || pathname.startsWith("/signup"))) {
    const redirectUrl = new URL("/dashboard", req.url)
    return NextResponse.redirect(redirectUrl)
  }

  return res
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
}
