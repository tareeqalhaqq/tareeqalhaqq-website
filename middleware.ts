import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

function isAcademyHost(hostname: string, academyDomain: string) {
  if (!hostname) return false;
  if (!academyDomain) return false;
  if (hostname === academyDomain) return true;
  return hostname.startsWith(`${academyDomain}:`);
}

export function middleware(request: NextRequest) {
  const hostname = request.headers.get('host')?.toLowerCase();
  const academyDomain = process.env.ACADEMY_DOMAIN?.toLowerCase();

  if (!hostname || !academyDomain) {
    return NextResponse.next();
  }

  if (!isAcademyHost(hostname, academyDomain)) {
    return NextResponse.next();
  }

  const { pathname } = request.nextUrl;

  const isAssetPath =
    pathname.startsWith('/_next') ||
    pathname.startsWith('/static') ||
    pathname.startsWith('/public') ||
    pathname === '/favicon.ico';

  if (isAssetPath) {
    return NextResponse.next();
  }

  if (pathname === '/academy' || pathname.startsWith('/academy/')) {
    return NextResponse.next();
  }

  const url = request.nextUrl.clone();
  url.pathname = pathname === '/' ? '/academy' : `/academy${pathname}`;

  return NextResponse.rewrite(url);
}

export const config = {
  matcher: ['/((?!_next/|api/).*)'],
};
