import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { locales } from './components/internationalization/config';

// Define protected routes that require authentication
const isProtectedRoute = createRouteMatcher([
  '/cart(.*)',
  '/checkout(.*)',
  '/orders(.*)',
  '/account(.*)',
  '/admin(.*)',
  '/store(.*)',
  '/vendor(.*)',
  '/:lang/cart(.*)',
  '/:lang/checkout(.*)',
  '/:lang/orders(.*)',
  '/:lang/account(.*)',
]);

// Define admin-only routes
const isAdminRoute = createRouteMatcher([
  '/admin(.*)',
  '/:lang/admin(.*)',
]);

// Define vendor-only routes
const isVendorRoute = createRouteMatcher([
  '/store(.*)',
  '/vendor(.*)',
  '/:lang/store(.*)',
  '/:lang/vendor(.*)',
]);

// Combine Clerk middleware with localization
export default clerkMiddleware(async (auth, req) => {
  const { pathname } = req.nextUrl;

  // Skip middleware for API routes, static files, and Next.js internals
  if (
    pathname.startsWith('/api') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon.ico') ||
    pathname.includes('.')
  ) {
    return;
  }

  // Protect routes that require authentication
  if (isProtectedRoute(req)) {
    await auth.protect();
  }

  // Additional role-based protection can be added here
  // For admin and vendor routes, the actual role check happens in the page components

  // Apply localization
  const pathnameHasLocale = locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );

  if (!pathnameHasLocale) {
    // Redirect to default locale
    const defaultLocale = 'en';
    return NextResponse.redirect(
      new URL(`/${defaultLocale}${pathname}`, req.url)
    );
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    // Skip all internal paths (_next, api)
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};