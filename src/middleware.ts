import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token');

  const protectedRoutes = ['/', '/profile'];

  const authRoutes = ['/login', '/sign-up'];

  if (token && authRoutes.includes(request.nextUrl.pathname)) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  if (!token && protectedRoutes.includes(request.nextUrl.pathname)) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/:path*', '/profile/:path*', '/login', '/sign-up'],
};
