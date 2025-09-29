import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { redirectToSignIn } from '@clerk/nextjs/server';

// Define route matchers for different access levels
const isPublicRoute = createRouteMatcher([
  '/',
  '/(ar|en)',
  '/(ar|en)/shop(.*)',
  '/(ar|en)/product/(.*)',
  '/(ar|en)/about',
  '/(ar|en)/contact',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/(ar|en)/sign-in(.*)',
  '/(ar|en)/sign-up(.*)',
  '/api(.*)',  // Make API routes public
]);

const isOnboardingRoute = createRouteMatcher([
  '/(ar|en)/onboarding(.*)',
]);

const isProtectedRoute = createRouteMatcher([
  '/(ar|en)/cart',
  '/(ar|en)/checkout(.*)',
  '/(ar|en)/orders(.*)',
  '/(ar|en)/account(.*)',
]);

const isAdminRoute = createRouteMatcher([
  '/admin(.*)',
]);

const isStoreRoute = createRouteMatcher([
  '/store(.*)',
]);

export default clerkMiddleware(async (auth, req: NextRequest) => {
  // Skip middleware for API routes entirely
  if (req.nextUrl.pathname.startsWith('/api')) {
    return NextResponse.next();
  }

  const { isAuthenticated, sessionClaims } = await auth();

  // Handle onboarding route
  if (isOnboardingRoute(req)) {
    if (!isAuthenticated) {
      return redirectToSignIn({ returnBackUrl: req.url });
    }
    // Allow access to onboarding if user hasn't completed it
    if (sessionClaims?.metadata?.onboardingComplete !== true) {
      return NextResponse.next();
    }
    // Redirect to home if onboarding is already complete
    const homeUrl = new URL('/', req.url);
    return NextResponse.redirect(homeUrl);
  }

  // If the user is authenticated and hasn't completed onboarding,
  // redirect to onboarding (except for sign-out and public routes)
  if (isAuthenticated &&
      sessionClaims?.metadata?.onboardingComplete !== true &&
      !isPublicRoute(req) &&
      !req.url.includes('/sign-out')) {
    // Extract language from current path or default to 'en'
    const pathname = req.nextUrl.pathname;
    const langMatch = pathname.match(/^\/(ar|en)/);
    const lang = langMatch ? langMatch[1] : 'en';
    const onboardingUrl = new URL(`/${lang}/onboarding`, req.url);
    return NextResponse.redirect(onboardingUrl);
  }

  // Protect admin routes
  if (isAdminRoute(req)) {
    if (!isAuthenticated) {
      return redirectToSignIn({ returnBackUrl: req.url });
    }
    // Check if user has admin role
    const userRole = sessionClaims?.metadata?.role as string;
    if (userRole !== 'admin') {
      const unauthorizedUrl = new URL('/unauthorized', req.url);
      return NextResponse.redirect(unauthorizedUrl);
    }
    return NextResponse.next();
  }

  // Protect store (vendor) routes
  if (isStoreRoute(req)) {
    if (!isAuthenticated) {
      return redirectToSignIn({ returnBackUrl: req.url });
    }
    // Check if user has vendor role
    const userRole = sessionClaims?.metadata?.role as string;
    if (userRole !== 'vendor' && userRole !== 'admin') {
      const unauthorizedUrl = new URL('/unauthorized', req.url);
      return NextResponse.redirect(unauthorizedUrl);
    }
    // Check if vendor's store is approved
    const storeApproved = sessionClaims?.metadata?.storeApproved as boolean;
    if (userRole === 'vendor' && !storeApproved) {
      const pendingUrl = new URL('/store-pending-approval', req.url);
      return NextResponse.redirect(pendingUrl);
    }
    return NextResponse.next();
  }

  // Protect general authenticated routes (cart, checkout, orders, etc.)
  if (isProtectedRoute(req)) {
    if (!isAuthenticated) {
      return redirectToSignIn({ returnBackUrl: req.url });
    }
    return NextResponse.next();
  }

  // Allow access to public routes
  return NextResponse.next();
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};