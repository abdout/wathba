# GoCart Internationalization Implementation Plan

## ✅ Completed Tasks

### 1. **JavaScript Conversion (COMPLETED)**
- ✅ Converted all TypeScript files to JavaScript
- ✅ Added comprehensive JSDoc documentation
- ✅ Enhanced error handling and validation
- ✅ All files properly structured with `.js` extensions

### 2. **Translation Files (COMPLETED)**
- ✅ Created comprehensive `en.json` with all English text
- ✅ Created complete `ar.json` with Arabic translations
- ✅ Organized translations into logical categories
- ✅ Covered all user-facing text in the application

## 📋 Implementation Steps

### Phase 1: Project Structure Setup (Day 1)

#### 1.1 Install Dependencies
```bash
npm add @formatjs/intl-localematcher negotiator
```

#### 1.2 Create Root Middleware
Create `middleware.js` in project root:
```javascript
import { localizationMiddleware } from './components/internationalization/middleware.js';

export const config = {
  matcher: ['/((?!api|_next|_static|favicon.ico|.*\\.[a-zA-Z0-9]+$).*)'],
};

export function middleware(request) {
  return localizationMiddleware(request);
}
```

#### 1.3 Restructure App Directory
```bash
# Create locale-based routing structure
mkdir -p app/[lang]
mkdir -p app/[lang]/(public)
mkdir -p app/[lang]/admin
mkdir -p app/[lang]/store

# Move existing routes into [lang] directory
mv app/(public)/* app/[lang]/(public)/
mv app/admin/* app/[lang]/admin/
mv app/store/* app/[lang]/store/
```

### Phase 2: Layout Updates (Day 1-2)

#### 2.1 Create Locale-Aware Root Layout
Update `app/[lang]/layout.jsx`:
```javascript
import { getDictionary } from '@/components/internationalization/dictionaries';
import { localeConfig } from '@/components/internationalization/config';
import StoreProvider from '@/app/StoreProvider';
import { Toaster } from 'react-hot-toast';
import '../globals.css';

export async function generateMetadata({ params: { lang } }) {
  const dictionary = await getDictionary(lang);

  return {
    title: dictionary.metadata.title,
    description: dictionary.metadata.description,
  };
}

export default async function LocaleLayout({ children, params: { lang } }) {
  const config = localeConfig[lang];
  const isRTL = config?.dir === 'rtl';

  return (
    <html lang={lang} dir={config?.dir || 'ltr'}>
      <body className={isRTL ? 'font-arabic' : ''}>
        <StoreProvider>
          <Toaster position="top-center" />
          {children}
        </StoreProvider>
      </body>
    </html>
  );
}

export function generateStaticParams() {
  return [{ lang: 'en' }, { lang: 'ar' }];
}
```

### Phase 3: Component Updates (Day 2-3)

#### 3.1 Update Navbar Component
```javascript
// components/Navbar.jsx
import { useSwitchLocaleHref } from '@/components/internationalization/use-locale';

export default function Navbar({ dictionary, currentLocale }) {
  const getSwitchLocaleHref = useSwitchLocaleHref();

  return (
    <nav>
      {/* Navigation items using dictionary */}
      <Link href={`/${currentLocale}`}>{dictionary.navigation.home}</Link>
      <Link href={`/${currentLocale}/shop`}>{dictionary.navigation.shop}</Link>

      {/* Language Switcher */}
      <div className="flex gap-2">
        <Link href={getSwitchLocaleHref('en')}>🇺🇸 English</Link>
        <Link href={getSwitchLocaleHref('ar')}>🇸🇦 العربية</Link>
      </div>
    </nav>
  );
}
```

#### 3.2 Update Page Components
Example for home page `app/[lang]/(public)/page.jsx`:
```javascript
import { getDictionary } from '@/components/internationalization/dictionaries';
import Hero from '@/components/Hero';
import LatestProducts from '@/components/LatestProducts';

export default async function HomePage({ params: { lang } }) {
  const dictionary = await getDictionary(lang);

  return (
    <div>
      <Hero dictionary={dictionary.hero} lang={lang} />
      <LatestProducts dictionary={dictionary.product} lang={lang} />
    </div>
  );
}
```

### Phase 4: Key Components Priority List (Day 3-4)

Update these components in order of priority:

1. **Navigation Components**
   - ✏️ Navbar.jsx
   - ✏️ Footer.jsx
   - ✏️ AdminSidebar.jsx
   - ✏️ StoreSidebar.jsx

2. **Product Components**
   - ✏️ ProductCard.jsx
   - ✏️ ProductDetails.jsx
   - ✏️ ProductDescription.jsx
   - ✏️ LatestProducts.jsx
   - ✏️ BestSelling.jsx

3. **Cart & Order Components**
   - ✏️ OrderSummary.jsx
   - ✏️ OrderItem.jsx
   - ✏️ Cart page

4. **Form Components**
   - ✏️ AddressModal.jsx
   - ✏️ RatingModal.jsx
   - ✏️ Store creation form

### Phase 5: RTL Support for Arabic (Day 4)

#### 5.1 Update Tailwind Config
```javascript
// tailwind.config.js
module.exports = {
  content: [/* ... */],
  theme: {
    extend: {
      fontFamily: {
        'arabic': ['Rubik', 'sans-serif'],
      },
    },
  },
  plugins: [
    require('tailwindcss-rtl'),
  ],
}
```

#### 5.2 Add RTL Utilities
```css
/* globals.css */
[dir="rtl"] {
  font-family: 'Rubik', sans-serif;
}

[dir="rtl"] .rtl\:space-x-reverse > * + * {
  margin-right: var(--tw-space-x);
  margin-left: 0;
}
```

### Phase 6: Dynamic Content Handling (Day 5)

#### 6.1 API Response Localization
For dynamic content from database:
```javascript
// Example API response handler
export async function getProducts(locale) {
  const products = await fetchProducts();

  return products.map(product => ({
    ...product,
    // Use locale-specific fields if available
    name: product[`name_${locale}`] || product.name,
    description: product[`description_${locale}`] || product.description,
  }));
}
```

#### 6.2 Currency Formatting
```javascript
// utils/currency.js
export function formatCurrency(amount, locale) {
  const currency = locale === 'ar' ? 'SAR' : 'SAR';
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
  }).format(amount);
}
```

### Phase 7: Testing & QA (Day 5-6)

#### 7.1 Testing Checklist
- [ ] All pages load correctly with `/en/` and `/ar/` URLs
- [ ] Language switcher works on all pages
- [ ] RTL layout displays correctly for Arabic
- [ ] All text is translated (no hardcoded English in Arabic version)
- [ ] Forms submit correctly in both languages
- [ ] Currency displays with Riyal symbol
- [ ] Cart functionality works in both languages
- [ ] Admin and store dashboards work correctly

#### 7.2 Browser Testing
- [ ] Chrome
- [ ] Firefox
- [ ] Safari
- [ ] Edge
- [ ] Mobile browsers

### Phase 8: Deployment (Day 6)

#### 8.1 Build & Deploy
```bash
# Build the application
npm run build

# Test production build locally
npm start

# Deploy to production
git add .
git commit -m "Add internationalization support for English and Arabic"
git push origin main
```

## 📊 Implementation Timeline

| Phase | Duration | Status |
|-------|----------|--------|
| Phase 1: Project Structure | 0.5 day | 🔄 Ready |
| Phase 2: Layout Updates | 1 day | 🔄 Ready |
| Phase 3: Component Updates | 1.5 days | 🔄 Ready |
| Phase 4: Priority Components | 1 day | 🔄 Ready |
| Phase 5: RTL Support | 0.5 day | 🔄 Ready |
| Phase 6: Dynamic Content | 0.5 day | 🔄 Ready |
| Phase 7: Testing & QA | 1 day | 🔄 Ready |
| Phase 8: Deployment | 0.5 day | 🔄 Ready |

**Total Estimated Time: 6.5 days**

## 🚀 Quick Start Commands

```bash
# 1. Install dependencies
npm add @formatjs/intl-localematcher negotiator

# 2. Start development server
npm run dev

# 3. Test English version
http://localhost:3000/en

# 4. Test Arabic version
http://localhost:3000/ar
```

## ⚠️ Important Notes

1. **Incremental Implementation**: Start with core pages and components, then expand
2. **Testing**: Test each component after updating to catch issues early
3. **Performance**: Use dynamic imports for dictionaries to reduce bundle size
4. **SEO**: Ensure proper meta tags and alternate links for both languages
5. **Accessibility**: Test with screen readers in both languages

## 📝 Component Update Template

Use this template when updating each component:

```javascript
// Server Component
import { getDictionary } from '@/components/internationalization/dictionaries';

export default async function ServerComponent({ params: { lang } }) {
  const dictionary = await getDictionary(lang);
  return <div>{dictionary.section.key}</div>;
}

// Client Component
'use client';

export default function ClientComponent({ dictionary, lang }) {
  return <div>{dictionary.key}</div>;
}
```

## ✅ Success Criteria

- All user-facing text is translatable
- URLs follow pattern: `/en/path` and `/ar/path`
- Language switcher available on all pages
- RTL layout works correctly for Arabic
- No console errors related to i18n
- Performance impact < 5% on page load
- SEO meta tags properly localized

## 🆘 Troubleshooting

### Common Issues & Solutions

1. **Middleware not working**: Check `matcher` config in middleware.js
2. **Missing translations**: Check JSON file structure and keys
3. **RTL issues**: Ensure Tailwind RTL plugin is installed
4. **Cookie not persisting**: Check cookie settings in middleware
5. **Build errors**: Ensure all imports use `.js` extension

## 📚 Resources

- [Next.js i18n Documentation](https://nextjs.org/docs/app/building-your-application/routing/internationalization)
- [Format.js Documentation](https://formatjs.io/)
- [Negotiator Documentation](https://www.npmjs.com/package/negotiator)
- [Tailwind RTL Support](https://github.com/20lives/tailwindcss-rtl)

---

This implementation plan provides a clear, step-by-step approach to adding internationalization to the GoCart application. Follow each phase sequentially for best results.