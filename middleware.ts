import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
  // Get the frontend URL from environment variable or use a wildcard
  const frontendUrl = process.env.FRONTEND_URL || '*';
  
  // Create the response
  const response = NextResponse.next();
  
  // Add CORS headers
  response.headers.set('Access-Control-Allow-Origin', frontendUrl);
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  response.headers.set('Access-Control-Max-Age', '86400'); // 24 hours

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return new NextResponse(null, { 
      status: 204,
      headers: response.headers
    });
  }

  return response;
}

// Only apply this middleware to API routes
export const config = {
  matcher: '/api/:path*',
};
