import { localizationMiddleware } from './components/internationalization/middleware';

export function middleware(request) {
  const { pathname } = request.nextUrl;

  // Skip middleware for API routes, static files, and Next.js internals
  if (
    pathname.startsWith('/api') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon.ico') ||
    pathname.includes('.')
  ) {
    return;
  }

  // Apply localization middleware
  return localizationMiddleware(request);
}

export const config = {
  matcher: [
    // Skip all internal paths (_next, api)
    '/((?!api|_next/static|_next/image|favicon.ico|images|assets).*)',
    // Optional: only run on root (/) URL
    // '/'
  ],
};