# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

GoCart (rebranded as Al Wathba Coop) is a multi-vendor e-commerce platform built with Next.js 15, featuring:
- Internationalization support (English/Arabic) with RTL layout
- Multi-vendor architecture with separate vendor dashboards
- Customer-facing storefront for shopping
- Admin panel for platform management
- State management using Redux Toolkit
- Prisma ORM with PostgreSQL database
- Clerk authentication integration

## Development Commands

```bash
# Install dependencies
npm install

# Run development server with Turbopack
npm run dev

# Build for production
npm run build

# Start production server
npm run start

# Run linting
npm run lint

# Prisma commands (if database is configured)
npx prisma generate    # Generate Prisma Client
npx prisma db push     # Push schema to database
npx prisma studio      # Open Prisma Studio GUI
```

## Architecture

### Core Technologies
- **Framework**: Next.js 15 with App Router
- **Styling**: Tailwind CSS v4
- **State Management**: Redux Toolkit with persist
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: Clerk
- **Icons**: Lucide React
- **Notifications**: React Hot Toast

### Internationalization System
- **Dictionary Pattern**: Translation files in `/components/internationalization/`
  - `en.json` - English translations
  - `ar.json` - Arabic translations
  - `dictionaries.js` - Dictionary loader
- **Language Routing**: `/[lang]/` prefix for all routes (e.g., `/en/shop`, `/ar/shop`)
- **RTL Support**: Automatic RTL layout for Arabic with conditional styling
- **Components**: Pass `dict` and `lang` props to all components needing translations

### Route Structure
- `/app/[lang]/` - Internationalized public routes
  - `page.jsx` - Homepage
  - `shop/page.jsx` - Shop listing
  - `cart/page.jsx` - Shopping cart
  - `product/[productId]/page.jsx` - Product detail
  - `about/page.jsx` - About page
- `/app/(public)/` - Legacy public routes (being migrated)
- `/app/admin/` - Admin dashboard pages
- `/app/store/` - Vendor dashboard pages

### Component Architecture
- **Page Components**: Located in `/components/` with suffix `Page.jsx` (e.g., `CartPage.jsx`, `ShopPage.jsx`)
  - Accept `dict` and `lang` props for internationalization
  - Use Redux selectors to access state
- **Shared Components**: Reusable UI components
  - `NavbarWithTranslations.jsx` - Main navigation with language switcher
  - `Footer.jsx` - Footer with payment methods display
  - `Banner.jsx` - Promotional banner with gradient animation
  - `ProductCard.jsx` - Product display card with translations

### State Management Structure
Redux store in `/lib/`:
- `store.js` - Store configuration with persistence
- `/features/cart/cartSlice.js` - Shopping cart state
- `/features/product/productSlice.js` - Product catalog state
- `/features/address/addressSlice.js` - User addresses
- `/features/rating/ratingSlice.js` - Product reviews

### Database Schema (Prisma)
Key models:
- `User` - Platform users with cart data (JSON field)
- `Store` - Vendor stores (status: pending/approved, isActive flag)
- `Product` - Products linked to stores
- `Order` - Orders with enum status (ORDER_PLACED, PROCESSING, SHIPPED, DELIVERED)
- `OrderItem` - Line items in orders
- `Address` - Delivery addresses
- `Rating` - Product reviews linked to orders
- `Coupon` - Discount codes with targeting options

### Assets Management
- `/assets/assets.js` - Central asset exports including:
  - Product images
  - Payment method icons (Visa, Mada, MasterCard, etc.)
  - Logo variations (English/Arabic)
  - Social media icons

## Key Implementation Patterns

### Adding Translations
1. Update both `en.json` and `ar.json` with new keys
2. Access in components via `dict?.section?.key || "Fallback"`
3. For RTL-sensitive components, check `lang === 'ar'`

### Creating Internationalized Pages
```jsx
// In app/[lang]/newpage/page.jsx
import NewPage from '@/components/NewPage';
import { getDictionary } from '@/lib/getDictionary';

export default async function Page({ params }) {
    const dict = await getDictionary(params.lang);
    return <NewPage dict={dict} lang={params.lang} />;
}
```

### Redux State Access Pattern
```jsx
const products = useSelector(state => state?.product?.list || []);
const cart = useSelector(state => state?.cart?.cartItems || {});
```

## Environment Variables
Required in `.env.local`:
- `NEXT_PUBLIC_CURRENCY_SYMBOL` - Display currency (default: 'AED')
- `DATABASE_URL` - PostgreSQL connection string
- `DIRECT_URL` - Direct database URL for migrations
- Clerk authentication keys (if using authentication)

## Current Branding
- **Name**: Al Wathba Coop / تعاونية الوثبة
- **Contact**: +971502731313, sales@alwathbacoop.ae
- **Location**: Alwathbah north - Abu Dhabi