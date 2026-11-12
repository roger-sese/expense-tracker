import { NextResponse, type NextRequest } from 'next/server';
import { TOKEN_COOKIE } from '@/lib/token-storage';

const PROTECTED = ['/dashboard', '/expenses', '/categories'];
const AUTH_PAGES = ['/login', '/register'];

const matches = (pathname: string, prefixes: string[]) =>
  prefixes.some((p) => pathname === p || pathname.startsWith(`${p}/`));

/**
 * Route guard: signed-out users are sent to /login (remembering where they were going),
 * signed-in users skip the auth pages. Token validity is still enforced by the API.
 */
export function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl;
  const hasToken = Boolean(req.cookies.get(TOKEN_COOKIE)?.value);

  if (!hasToken && matches(pathname, PROTECTED)) {
    const url = new URL('/login', req.url);
    url.searchParams.set('next', `${pathname}${search}`);
    return NextResponse.redirect(url);
  }
  if (hasToken && matches(pathname, AUTH_PAGES)) {
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/expenses/:path*', '/categories/:path*', '/login', '/register'],
};
