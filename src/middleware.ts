import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtDecode } from 'jwt-decode';
import { destroyCookie } from 'nookies';

async function verifyToken(token: string) {
  try {
    const decoded_token = jwtDecode(token) as { exp: number };
    const currentTime = Date.now() / 1000;
    if (decoded_token.exp < currentTime) {
      console.log('Expired token');
      return null;
    }
    return decoded_token;
  } catch (error) {
    console.log(error)
    return null;
  }
}

export async function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  const path = request.nextUrl.pathname;

  const protectedRoutes = ['/', '/profile'];
  const authRoutes = ['/login', '/sign-up'];

  const isAuthenticated = token && (await verifyToken(token));
  
  if (!isAuthenticated && protectedRoutes.includes(path)) {
    destroyCookie({ res: NextResponse }, 'token', { path: '/' });
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (isAuthenticated && authRoutes.includes(path)) {
    return NextResponse.redirect(new URL('/', request.url));
  }


  return NextResponse.next();
}

export const config = {
  matcher: ['/:path*', '/profile/:path*', '/login', '/sign-up'],
};
