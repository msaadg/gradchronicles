// /middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const publicRoutes = ['/', '/login', '/api/signup', '/api/auth'];
  const isPublicRoute = publicRoutes.some((route) => pathname === route || pathname.startsWith(route));
  const isApiRoute = pathname.startsWith('/api/');
  
  // Check for authentication token in cookies
  const authToken =
    request.cookies.get('next-auth.session-token')?.value ||
    request.cookies.get('__Secure-next-auth.session-token')?.value;

  if (isPublicRoute) {
    return NextResponse.next();
  }

  if (!authToken) {
    if (isApiRoute) {
      return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!$|_next/static|_next/image|favicon.ico|login|signup|features|api/auth|.*\\.(?:png|jpg|jpeg|gif|svg|ico|css|js)).*)',
    '/api/((?!auth).*)',
  ],
};