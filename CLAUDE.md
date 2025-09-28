# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Alwathba (rebranded as Al Wathba Coop) is a multi-vendor e-commerce platform built with Next.js 15, featuring:
- Internationalization support (English/Arabic) with RTL layout
- Multi-vendor architecture with separate vendor dashboards
- Customer-facing storefront for shopping
- Admin panel for platform management
- State management using Redux Toolkit with persistence
- Prisma ORM with PostgreSQL database
- Clerk authentication integration
- ImageKit CDN for optimized image delivery

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
npx prisma migrate dev  # Create and apply migrations
```

## Architecture

### Core Technologies
- **Framework**: Next.js 15.3.5 with App Router and Turbopack
- **Styling**: Tailwind CSS v4 with PostCSS
- **State Management**: Redux Toolkit 2.8.2 with redux-persist
- **Database**: PostgreSQL with Prisma ORM 6.16.2
- **Authentication**: Clerk 6.33.0
- **Image Optimization**: ImageKit SDK (@imagekit/next)
- **Icons**: Lucide React 0.525.0
- **Notifications**: React Hot Toast 2.5.2

### Internationalization System
- **Dictionary Pattern**: Translation files in `/components/internationalization/`
  - `en.json` - English translations
  - `ar.json` - Arabic translations
  - `dictionaries.js` - Dictionary loader with fallback logic
  - `config.js` - i18n configuration with locale metadata
- **Language Routing**: `/[lang]/` prefix for all routes (e.g., `/en/shop`, `/ar/shop`)
- **RTL Support**: Automatic RTL layout for Arabic with conditional styling
- **Font Selection**: Outfit for English, Rubik for Arabic
- **Components**: Pass `dict` and `lang` props to all components needing translations

### Route Structure
- `/app/[lang]/` - Internationalized public routes
  - `page.jsx` - Homepage
  - `shop/page.jsx` - Shop listing with search and filters
  - `cart/page.jsx` - Shopping cart
  - `product/[productId]/page.jsx` - Product detail
  - `about/page.jsx` - About page
  - `onboarding/page.jsx` - New user onboarding
  - `create-store/page.jsx` - Vendor store creation
- `/app/admin/` - Admin dashboard pages
  - Dashboard, stores management, coupons, orders
- `/app/store/` - Vendor dashboard pages
  - Dashboard, product management, orders, ratings
- `/app/api/` - API routes
  - `/clerk-webhook` - User sync with database
  - `/imagekit-auth` - Upload authentication

### Image Management with ImageKit
- **OptimizedImage Component**: Drop-in replacement for Next.js Image
  - Automatic WebP/AVIF conversion
  - Responsive srcset generation
  - Error handling with fallback UI
  - Lazy loading by default
- **ImageKitUpload Component**: File upload with progress tracking
- **Asset URLs**: All assets served from `https://ik.imagekit.io/osmanabdout/assets/`
- **Transformations**: On-the-fly resizing, cropping, and optimization

### Component Architecture
- **Page Components**: Located in `/components/` with suffix `Page.jsx`
  - Accept `dict` and `lang` props for internationalization
  - Use Redux selectors to access state
- **Shared Components**: Reusable UI components
  - `NavbarWithTranslations.jsx` - Main navigation with language switcher
  - `Footer.jsx` - Footer with payment methods display
  - `ProductCard.jsx` - Product display card with translations
  - `OptimizedImage.jsx` - ImageKit-powered image component
  - `ImageKitUpload.jsx` - Image upload component

### State Management Structure
Redux store configuration in `/lib/store.js`:
- `/features/cart/cartSlice.js` - Shopping cart state with localStorage sync
- `/features/product/productSlice.js` - Product catalog state
- `/features/address/addressSlice.js` - User delivery addresses
- `/features/rating/ratingSlice.js` - Product reviews
- `/features/auth/authSlice.js` - User authentication state

### Database Schema (Prisma)
Key models in `prisma/schema.prisma`:
- `User` - Platform users with cart data (JSON field)
- `Store` - Vendor stores (status: pending/approved, isActive flag)
- `Product` - Products linked to stores with images array, MRP/selling price
- `Order` - Orders with enum status (ORDER_PLACED, PROCESSING, SHIPPED, DELIVERED)
- `OrderItem` - Line items in orders (composite primary key)
- `Address` - Delivery addresses
- `Rating` - Product reviews linked to orders
- `Coupon` - Discount codes with targeting options

### Authentication & Middleware
Middleware configuration in `middleware.ts`:
- **Protected Routes**: Cart, checkout, orders, account pages
- **Public Routes**: Shop, product details, about pages
- **Role-based Access**: Admin and vendor dashboards with approval checks
- **Onboarding Flow**: Mandatory completion after registration
- **Store Approval**: Vendors need approved store status for access

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

### Using OptimizedImage for ImageKit
```jsx
import OptimizedImage from '@/components/OptimizedImage';

<OptimizedImage
    src="/product.jpg" // or full ImageKit URL
    alt="Product"
    width={500}
    height={500}
    priority={false} // true for above-fold images
    transformation={[
        { width: 500, height: 500, quality: 85 }
    ]}
/>
```

### Redux State Access Pattern
```jsx
const products = useSelector(state => state?.product?.list || []);
const cart = useSelector(state => state?.cart?.cartItems || {});
const user = useSelector(state => state?.auth?.user);
```

### File Upload with ImageKit
```jsx
import ImageKitUpload from '@/components/ImageKitUpload';

<ImageKitUpload
    onUploadSuccess={(data) => {
        console.log('Uploaded:', data.url);
    }}
    folder="/products"
    maxSize={5} // MB
/>
```

## Environment Variables
Required in `.env.local`:
```env
# Clerk Authentication (required)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
CLERK_WEBHOOK_SECRET=whsec_...

# Database (required)
DATABASE_URL=postgresql://...
DIRECT_URL=postgresql://...

# ImageKit CDN (required)
NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT=https://ik.imagekit.io/osmanabdout
NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY=public_...
IMAGEKIT_PRIVATE_KEY=private_...

# Optional
NEXT_PUBLIC_CURRENCY_SYMBOL=AED
```

## Social Authentication Setup (Google & Facebook)

### Clerk Dashboard Configuration
Al Wathba Coop uses Clerk for authentication with Google and Facebook OAuth providers. Setup is done through the Clerk Dashboard:

1. **Access Social Connections**: Go to https://dashboard.clerk.com/last-active?path=user-management/social-connections
2. **Enable Providers**: Enable Google and Facebook OAuth providers
3. **Configure Credentials**: Add OAuth app credentials from each provider

### Google OAuth Setup
1. **Google Cloud Console**: Visit https://console.cloud.google.com/apis/credentials
2. **Create OAuth 2.0 Client ID**:
   - Application type: Web application
   - Name: "Al Wathba Coop"
   - Authorized JavaScript origins: `https://alwathbacoop.ae`
   - Authorized redirect URIs: Use the Clerk-provided redirect URI from your dashboard
3. **Copy Credentials**: Copy Client ID and Client Secret to Clerk Dashboard

### Facebook OAuth Setup
1. **Facebook Developers**: Visit https://developers.facebook.com/apps
2. **Create App**:
   - App type: Business
   - App name: "Al Wathba Coop"
   - Contact email: sales@alwathbacoop.ae
3. **Configure Facebook Login**:
   - Add Facebook Login product
   - Valid OAuth Redirect URIs: Use Clerk-provided redirect URI
   - App Domain: alwathbacoop.ae
4. **Copy Credentials**: Copy App ID and App Secret to Clerk Dashboard

### Production Redirect URIs
For Al Wathba Coop production deployment, ensure these redirect URIs are configured:
- **Google**: `https://clerk.alwathbacoop.ae/v1/oauth_callback`
- **Facebook**: `https://clerk.alwathbacoop.ae/v1/oauth_callback`

### Testing OAuth Flow
1. **Development**: Test with localhost redirect URIs
2. **Staging**: Test with staging domain redirect URIs
3. **Production**: Verify with production domain redirect URIs

## Data Flow Patterns

### Product Display Flow
1. Products loaded from database or dummy data in `/assets/assets.js`
2. Stored in Redux state via `productSlice`
3. Images served through ImageKit CDN with optimizations
4. Components access via Redux selectors

### Cart Management Flow
1. Cart actions dispatched to Redux store
2. Cart state persisted to localStorage via redux-persist
3. Synced with database for logged-in users via Clerk webhook
4. Cart total calculated from product prices and quantities

### Order Processing Flow
1. User adds items to cart
2. Proceeds to checkout (requires authentication)
3. Selects/adds delivery address
4. Applies coupon if available
5. Order created with status ORDER_PLACED
6. Vendor receives notification in dashboard

## Current Branding
- **Name**: Al Wathba Coop / تعاونية الوثبة
- **Contact**: +971502731313, sales@alwathbacoop.ae
- **Location**: Alwathbah north - Abu Dhabi
- **Currency**: AED (UAE Dirham)