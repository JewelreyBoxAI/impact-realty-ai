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