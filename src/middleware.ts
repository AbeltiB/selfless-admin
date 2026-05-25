import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PUBLIC_PATHS = ['/login'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) return NextResponse.next();
  // Token check happens client-side; middleware just allows navigation
  return NextResponse.next();
}

export const config = { matcher: ['/((?!_next|favicon.ico|api).*)'] };
