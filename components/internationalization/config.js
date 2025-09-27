export const i18n = {
  defaultLocale: 'en',
  locales: ['en', 'ar'], // Add your supported locales
};

// Locale metadata for enhanced functionality
export const localeConfig = {
  'en': {
    name: 'English',
    nativeName: 'English',
    dir: 'ltr',
    flag: '🇺🇸',
    dateFormat: 'MM/dd/yyyy',
    currency: 'USD',
  },
  'ar': {
    name: 'Arabic',
    nativeName: 'العربية',
    dir: 'rtl',
    flag: '🇸🇦',
    dateFormat: 'dd/MM/yyyy',
    currency: 'SAR',
  },
};

/**
 * Check if a locale uses right-to-left text direction
 * @param {string} locale - The locale to check
 * @returns {boolean} True if RTL, false if LTR
 */
export function isRTL(locale) {
  return localeConfig[locale]?.dir === 'rtl';
}

/**
 * Validate if a locale is supported
 * @param {string} locale - The locale to validate
 * @returns {boolean} True if supported, false otherwise
 */
export function isValidLocale(locale) {
  return i18n.locales.includes(locale);
}