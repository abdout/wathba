import "server-only";
import { i18n } from "./config.js";

// We enumerate all dictionaries here for better linting and code completion
const dictionaries = {
  "en": () => import("./en.json").then((module) => module.default),
  "ar": () => import("./ar.json").then((module) => module.default),
};

/**
 * Get dictionary for a specific locale
 * @param {string} locale - The locale to get dictionary for
 * @returns {Promise<Object>} The dictionary object for the locale
 */
export const getDictionary = async (locale) => {
  try {
    // Use the locale if it's supported, otherwise fall back to default
    const validLocale = i18n.locales.includes(locale) ? locale : i18n.defaultLocale;
    const dictionary = dictionaries[validLocale];

    if (!dictionary) {
      console.warn(`Dictionary not found for locale: ${validLocale}. Falling back to English.`);
      return await dictionaries["en"]();
    }

    return await dictionary();
  } catch (error) {
    console.warn(`Failed to load dictionary for locale: ${locale}. Falling back to English.`);
    return await dictionaries["en"]();
  }
};

/**
 * Preload dictionary for better performance
 * @param {string} locale - The locale to preload dictionary for
 * @returns {Promise<void>}
 */
export const preloadDictionary = async (locale) => {
  try {
    const validLocale = i18n.locales.includes(locale) ? locale : i18n.defaultLocale;
    const dictionary = dictionaries[validLocale];
    if (dictionary) {
      await dictionary();
    }
  } catch (error) {
    console.warn(`Failed to preload dictionary for locale: ${locale}`);
  }
};

/**
 * Get available dictionary locales
 * @returns {string[]} Array of available locale keys
 */
export const getAvailableLocales = () => {
  return Object.keys(dictionaries);
};