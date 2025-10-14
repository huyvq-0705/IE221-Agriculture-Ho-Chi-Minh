import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname === '/agrihcmAdmin/login') {
    return NextResponse.next();
  }

  const accessToken = request.cookies.get('accessToken')?.value;

  if (!accessToken) {
    return NextResponse.redirect(new URL('/agrihcmAdmin/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/agrihcmAdmin/:path*'],
};
