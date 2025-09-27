import { match } from '@formatjs/intl-localematcher';
import Negotiator from 'negotiator';
import { NextResponse } from 'next/server';
import { i18n } from './config.js';

/**
 * Get the best matching locale for a request
 * @param {import('next/server').NextRequest} request - The Next.js request object
 * @returns {string} The best matching locale
 */
function getLocale(request) {
  // 1. Check cookie first for user preference
  const cookieLocale = request.cookies.get('NEXT_LOCALE')?.value;
  if (cookieLocale && i18n.locales.includes(cookieLocale)) {
    return cookieLocale;
  }

  // 2. Get Accept-Language header
  const headers = {
    'accept-language': request.headers.get('accept-language') ?? '',
  };

  // Use negotiator to parse preferred languages
  const languages = new Negotiator({ headers }).languages();

  // Match against supported locales
  return match(languages, i18n.locales, i18n.defaultLocale);
}

/**
 * Middleware function for handling internationalization
 * @param {import('next/server').NextRequest} request - The Next.js request object
 * @returns {import('next/server').NextResponse} The response object
 */
export function localizationMiddleware(request) {
  const { pathname } = request.nextUrl;

  // Check if pathname already has a locale
  const pathnameHasLocale = i18n.locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );

  // If locale exists in URL, continue
  if (pathnameHasLocale) {
    return NextResponse.next();
  }

  // Get best matching locale
  const locale = getLocale(request);

  // Redirect to localized URL
  request.nextUrl.pathname = `/${locale}${pathname}`;
  const response = NextResponse.redirect(request.nextUrl);

  // Set cookie for future visits
  response.cookies.set('NEXT_LOCALE', locale, {
    maxAge: 365 * 24 * 60 * 60, // 1 year
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
  });

  return response;
}