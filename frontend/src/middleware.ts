import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Simple passthrough middleware for Next.js 14 compatibility
export function middleware(request: NextRequest) {
  // For now, just pass through all requests
  // TODO: Implement authentication middleware when Supabase auth is updated
  return NextResponse.next()
}

// Optional: Configure which paths the middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}

// Commented out previous auth middleware for reference:
/*
// Temporarily disabled middleware due to deprecated Supabase auth helpers
// TODO: Update to use @supabase/ssr package

import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const response = NextResponse.next();
  const supabase = createMiddlewareClient({ req: request, res: response });
  
  const {
    data: { session },
  } = await supabase.auth.getSession();

  // Check auth for protected routes
  if (!session && request.nextUrl.pathname === '/profile') {
    return NextResponse.redirect(new URL('/auth', request.url));
  }
  
  // If user is signed in and accessing auth page, redirect to profile
  if (session && request.nextUrl.pathname === '/auth') {
    return NextResponse.redirect(new URL('/profile', request.url));
  }
  
  return response;
}

export const config = {
  matcher: ['/profile', '/auth'],
}; 
*/ 