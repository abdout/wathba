'use client';

import { usePathname, useParams } from 'next/navigation';
import { i18n, localeConfig } from './config.js';

/**
 * Hook to get a function for switching locale URLs
 * @returns {function} Function that returns URL for target locale
 */
export function useSwitchLocaleHref() {
  const pathname = usePathname();

  /**
   * Get URL for switching to target locale
   * @param {string} targetLocale - The locale to switch to
   * @returns {string} The URL for the target locale
   */
  return function switchLocaleHref(targetLocale) {
    // Validate target locale
    if (!i18n.locales.includes(targetLocale)) {
      console.warn(`Invalid target locale: ${targetLocale}. Falling back to default.`);
      targetLocale = i18n.defaultLocale;
    }

    // Extract current locale from pathname
    const currentLocale = i18n.locales.find(locale =>
      pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
    );

    if (!currentLocale) {
      // If no current locale detected, prepend target locale
      return `/${targetLocale}${pathname}`;
    }

    // Replace current locale with target locale
    const newPathname = pathname.replace(`/${currentLocale}`, `/${targetLocale}`);
    return newPathname;
  };
}

/**
 * Hook to get current locale information
 * @returns {Object} Object containing locale, isRTL flag, and locale config
 */
export function useLocale() {
  const params = useParams();
  const locale = (params?.lang && i18n.locales.includes(params.lang))
    ? params.lang
    : i18n.defaultLocale;

  return {
    locale,
    isRTL: localeConfig[locale]?.dir === 'rtl',
    localeConfig: localeConfig[locale],
    isValidLocale: i18n.locales.includes(locale)
  };
}

/**
 * Hook to get locale switching utilities
 * @returns {Object} Object containing locale utilities
 */
export function useLocaleUtils() {
  const { locale } = useLocale();
  const getSwitchLocaleHref = useSwitchLocaleHref();

  return {
    currentLocale: locale,
    switchLocaleHref: getSwitchLocaleHref,
    availableLocales: i18n.locales,
    defaultLocale: i18n.defaultLocale,
    isRTL: localeConfig[locale]?.dir === 'rtl',
  };
}