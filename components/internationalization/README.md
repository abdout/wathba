# Internationalization (JavaScript Version)

**Feature-Based i18n Architecture for New & Existing Projects**

## Table of Contents

1. [Company Standard Overview](#company-standard-overview)
2. [Architecture Overview](#architecture-overview)
3. [Dependencies & Setup](#dependencies--setup)
4. [Feature-Based File Structure](#feature-based-file-structure)
5. [Implementation Guide](#implementation-guide)
6. [New Project Setup](#new-project-setup)
7. [Existing Project Migration](#existing-project-migration)
8. [Usage Patterns](#usage-patterns)
9. [Advanced Features](#advanced-features)
10. [Quality Assurance](#quality-assurance)
11. [Team Standards](#team-standards)

## Company Standard Overview

This document establishes **Databayt's JavaScript-based internationalization standard** using a feature-based architecture with professional-grade locale negotiation. This JavaScript implementation provides better compatibility and easier maintenance for projects not using TypeScript.

### Why JavaScript Version

- **Broader Compatibility**: Works with any Next.js project regardless of TypeScript setup
- **Simpler Implementation**: No TypeScript compilation or type checking overhead
- **Feature Isolation**: All i18n logic contained in dedicated feature directory
- **Professional Locale Detection**: Uses industry-standard libraries
- **Better Maintainability**: Cleaner separation of concerns
- **Enhanced DX**: Simpler component prop passing patterns
- **Easier Testing**: Isolated feature testing
- **Future-Proof**: Scalable architecture for complex applications

### Key Improvements Over TypeScript Version

- **No Type Complexity**: Direct JavaScript implementation without type annotations
- **JSDoc Documentation**: Clear function documentation with parameter types
- **Runtime Validation**: Robust error handling and locale validation
- **Better Error Messages**: User-friendly warning messages for debugging
- **Enhanced Flexibility**: Dynamic locale handling without type constraints

## Architecture Overview

### Core Components

```
components/internationalization/
├── config.js                  # Configuration and utilities
├── middleware.js               # Locale detection logic
├── dictionaries.js             # Dictionary loading
├── use-locale.js               # URL switching utility
├── en.json                     # English translation
└── ar.json                     # Arabic translation
```

### Data Flow

```
Request → Middleware → Locale Detection → Dictionary Loading → Props → Components
```

### Locale Detection Priority

1. **URL Path**: `/en/about` → `en`
2. **Cookie Preference**: `NEXT_LOCALE` cookie value
3. **Browser Headers**: `Accept-Language` header negotiation
4. **Default Fallback**: Configured default locale

## Dependencies & Setup

### Required Dependencies

```bash
# Core internationalization libraries
npm add @formatjs/intl-localematcher negotiator

# Optional: For enhanced development experience
npm add -D @types/negotiator  # Only if using TypeScript alongside
```

### Package Justification

- **`@formatjs/intl-localematcher`**: Industry-standard locale matching algorithm
- **`negotiator`**: Professional HTTP header negotiation
- **`@types/negotiator`**: TypeScript definitions (optional, for mixed projects)

## Feature-Based File Structure

**This EXACT structure MUST be used in every project:**

```
src/
├── middleware.js                           # Root middleware orchestrator
├── app/
│   ├── [lang]/                            # Dynamic locale routing
│   │   ├── layout.jsx                     # Locale-aware layout
│   │   ├── page.jsx                       # Localized pages
│   │   └── (routes)/                      # All your routes
│   └── globals.css
├── components/
│   └── internationalization/              # 🎯 All i18n logic here
│       ├── config.js                      # Configuration & utilities
│       ├── middleware.js                  # Middleware logic
│       ├── dictionaries.js                # Dictionary loader
│       ├── use-locale.js                  # URL switching hook
│       ├── en.json                        # English translations
│       └── ar.json                        # Arabic translations

```

## Implementation Guide

### Step 1: Install Dependencies

```bash
# Install required packages
npm add @formatjs/intl-localematcher negotiator
```

### Step 2: Create i18n Configuration

Create `src/components/internationalization/config.js`:

```javascript
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
```

### Step 3: Create Localization Middleware

Create `src/components/internationalization/middleware.js`:

```javascript
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
```

### Step 4: Create Dictionary Loader

Create `src/components/internationalization/dictionaries.js`:

```javascript
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
```

### Step 5: Create URL Switching Hook

Create `src/components/internationalization/use-locale.js`:

```javascript
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
```

### Step 6: Setup Root Middleware

Create/Update `src/middleware.js`:

```javascript
import { localizationMiddleware } from './components/internationalization/middleware.js';

// Matcher ignoring `/_next/`, `/api/`, and static files
export const config = {
  matcher: ['/((?!api|_next|_static|favicon.ico|.*\\.[a-zA-Z0-9]+$).*)'],
};

/**
 * Main middleware function
 * @param {import('next/server').NextRequest} request - The Next.js request object
 * @returns {import('next/server').NextResponse} The response object
 */
export function middleware(request) {
  return localizationMiddleware(request);
}
```

### Step 7: Create Translation Files

Create `src/components/internationalization/en.json`:

```json
{
  "metadata": {
    "title": "GoCart - Multi-Vendor E-commerce Platform",
    "description": "Professional multi-vendor e-commerce platform for Saudi Arabia"
  },
  "common": {
    "loading": "Loading...",
    "error": "Something went wrong",
    "success": "Success",
    "cancel": "Cancel",
    "save": "Save",
    "back": "Back",
    "next": "Next",
    "language": "Language",
    "currency": "Currency"
  },
  "navigation": {
    "home": "Home",
    "shop": "Shop",
    "cart": "Cart",
    "orders": "Orders",
    "about": "About",
    "contact": "Contact",
    "pricing": "Pricing"
  },
  "landing": {
    "welcome": "Welcome to GoCart",
    "subtitle": "Your ultimate multi-vendor e-commerce destination"
  },
  "auth": {
    "signIn": "Sign In",
    "signUp": "Sign Up",
    "email": "Email",
    "password": "Password"
  },
  "product": {
    "addToCart": "Add to Cart",
    "buyNow": "Buy Now",
    "outOfStock": "Out of Stock",
    "price": "Price",
    "quantity": "Quantity"
  },
  "cart": {
    "title": "Shopping Cart",
    "empty": "Your cart is empty",
    "total": "Total",
    "checkout": "Checkout"
  }
}
```

Create `src/components/internationalization/ar.json`:

```json
{
  "metadata": {
    "title": "جوكارت - منصة التجارة الإلكترونية متعددة البائعين",
    "description": "منصة تجارة إلكترونية احترافية متعددة البائعين للمملكة العربية السعودية"
  },
  "common": {
    "loading": "جاري التحميل...",
    "error": "حدث خطأ ما",
    "success": "نجح",
    "cancel": "إلغاء",
    "save": "حفظ",
    "back": "رجوع",
    "next": "التالي",
    "language": "اللغة",
    "currency": "العملة"
  },
  "navigation": {
    "home": "الرئيسية",
    "shop": "المتجر",
    "cart": "السلة",
    "orders": "الطلبات",
    "about": "حول",
    "contact": "اتصل بنا",
    "pricing": "التسعير"
  },
  "landing": {
    "welcome": "مرحباً بك في جوكارت",
    "subtitle": "وجهتك النهائية للتجارة الإلكترونية متعددة البائعين"
  },
  "auth": {
    "signIn": "تسجيل الدخول",
    "signUp": "إنشاء حساب",
    "email": "البريد الإلكتروني",
    "password": "كلمة المرور"
  },
  "product": {
    "addToCart": "أضف إلى السلة",
    "buyNow": "اشتري الآن",
    "outOfStock": "غير متوفر",
    "price": "السعر",
    "quantity": "الكمية"
  },
  "cart": {
    "title": "سلة التسوق",
    "empty": "سلة التسوق فارغة",
    "total": "المجموع",
    "checkout": "إتمام الشراء"
  }
}
```

## Usage Patterns

### Server Components

```javascript
import { getDictionary } from '@/components/internationalization/dictionaries';

export default async function ServerComponent({ params: { lang } }) {
  const dictionary = await getDictionary(lang);

  return (
    <div>
      <h1>{dictionary.landing.welcome}</h1>
      <p>{dictionary.landing.subtitle}</p>
    </div>
  );
}
```

### Client Components

```javascript
'use client';

import { useState } from 'react';

/**
 * Counter component with internationalization
 * @param {Object} props - Component props
 * @param {Object} props.dictionary - Dictionary object with translations
 */
export function CounterComponent({ dictionary }) {
  const [count, setCount] = useState(0);

  return (
    <div>
      <button onClick={() => setCount(n => n - 1)}>
        {dictionary.common.back}
      </button>
      <span>{count}</span>
      <button onClick={() => setCount(n => n + 1)}>
        {dictionary.common.next}
      </button>
    </div>
  );
}
```

### Language Switcher Component

```javascript
'use client';

import Link from 'next/link';
import { useSwitchLocaleHref } from '@/components/internationalization/use-locale';
import { i18n, localeConfig } from '@/components/internationalization/config';

/**
 * Language switcher component
 * @param {Object} props - Component props
 * @param {string} props.currentLocale - Current active locale
 */
export function LanguageSwitcher({ currentLocale }) {
  const getSwitchLocaleHref = useSwitchLocaleHref();

  return (
    <div className="flex gap-2">
      {i18n.locales.map((locale) => {
        const config = localeConfig[locale];
        const isActive = locale === currentLocale;

        return (
          <Link
            key={locale}
            href={getSwitchLocaleHref(locale)}
            className={`px-3 py-1 rounded ${
              isActive
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 hover:bg-gray-300'
            }`}
          >
            {config.flag} {config.nativeName}
          </Link>
        );
      })}
    </div>
  );
}
```

## Advanced Features

### Dynamic Dictionary Loading

```javascript
// For very large applications, you can split dictionaries
const dictionaries = {
  "en": {
    common: () => import("./en/common.json").then(m => m.default),
    auth: () => import("./en/auth.json").then(m => m.default),
    dashboard: () => import("./en/dashboard.json").then(m => m.default),
  },
  "ar": {
    common: () => import("./ar/common.json").then(m => m.default),
    auth: () => import("./ar/auth.json").then(m => m.default),
    dashboard: () => import("./ar/dashboard.json").then(m => m.default),
  },
};

/**
 * Get specific dictionary section
 * @param {string} locale - The locale
 * @param {string} section - The dictionary section
 * @returns {Promise<Object>} The dictionary section
 */
export const getDictionarySection = async (locale, section) => {
  try {
    const validLocale = i18n.locales.includes(locale) ? locale : i18n.defaultLocale;
    return await dictionaries[validLocale]?.[section]?.() ?? dictionaries["en"][section]();
  } catch (error) {
    console.warn(`Failed to load ${section} dictionary for locale: ${locale}`);
    return await dictionaries["en"][section]();
  }
};
```

## Quality Assurance

### Implementation Checklist

**Before deploying any project with i18n, verify ALL items:**

- [ ] Dependencies installed: `@formatjs/intl-localematcher`, `negotiator`
- [ ] Component directory structure follows standard: `components/internationalization/`
- [ ] All required files created: config, middleware, dictionaries, hooks
- [ ] URL routing works: `/en/`, `/ar/` patterns
- [ ] Locale detection works: browser headers, cookies, fallback
- [ ] Dictionary loading works: server-side async loading
- [ ] Props passing pattern implemented in components
- [ ] Language switcher component created and functional
- [ ] RTL support implemented for Arabic
- [ ] SEO metadata includes proper language tags
- [ ] Error boundaries handle missing translations
- [ ] JSDoc documentation is complete

## Team Standards

### JavaScript Code Standards

- Use JSDoc comments for all functions
- Implement proper error handling with try-catch
- Use descriptive variable and function names
- Follow consistent coding style with Prettier/ESLint
- Use async/await instead of .then() for better readability

### Documentation Requirements

- All functions must have JSDoc documentation
- Include parameter types and return types in comments
- Document complex logic with inline comments
- Update README when adding new features
- Provide usage examples for new utilities

**This JavaScript-based v2.0 pattern is the standard for ALL Databayt projects.**