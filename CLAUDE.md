# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Alwathba Coop is a multi-vendor e-commerce platform built with Next.js 15, featuring internationalization (English/Arabic), multi-vendor architecture, and comprehensive admin/vendor dashboards.

## Development Commands

```bash
# Development
npm run dev              # Start dev server with Turbopack on port 3000
npm run build           # Production build
npm run start           # Start production server on port 3000
npm run lint            # Run ESLint

# Testing
npm run test            # Run Vitest in watch mode
npm run test:ui         # Vitest with UI interface
npm run test:run        # Run tests once (CI mode)
npm run test:coverage   # Generate coverage report

# Database (requires PostgreSQL - Neon recommended)
npx prisma generate     # Generate Prisma Client after schema changes
npx prisma db push      # Push schema changes without migration (dev)
npx prisma migrate dev  # Create and apply migrations
npx prisma studio       # Open database GUI browser
npx prisma db seed      # Seed database with sample data

# Deployment
npm run auto-deploy     # Unix/Mac deployment script
npm run auto-deploy-win # Windows deployment script (.bat)
```

## Critical Architecture Patterns

### Redux Store Architecture
The app uses Redux Toolkit with a modular slice pattern. Key slices:
- **cartSlice**: Manages cart state with optimistic UI updates
- **productSlice**: Handles product list, pagination, and loading states
- **addressSlice**: Manages user addresses with async thunks for API calls
- **authSlice**: Stores authenticated user data from Clerk
- **ratingSlice**: Manages product reviews and ratings

### Cart Management Flow
```javascript
// CRITICAL: addToCart expects productId directly
dispatch(addToCart(productId))        // ✅ Correct - adds single item
dispatch(addToCart({ productId }))    // ❌ Wrong - will fail

// Cart persists to User.cart (JSON) in database
// Dual-action: Optimistic UI update + Backend sync
```

### Order & Payment Architecture
```
1. Order Creation (POST /api/orders)
   - Creates order with status: PENDING_PAYMENT (Stripe) or ORDER_PLACED (COD)
   - Validates stock quantity (Product.quantity field)
   - Decrements stock on order creation
   - Cart cleared only for COD orders

2. Stripe Payment Flow
   - Order created first with PENDING_PAYMENT status
   - Checkout session created via /api/stripe/checkout
   - Webhook updates order to ORDER_PLACED on success
   - Cart cleared only after payment confirmation
   - Stock restored if payment fails

3. Order Cancellation (POST /api/orders/cancel)
   - Updates status to CANCELLED
   - Restores product quantities
   - Initiates refund for paid orders
```

### Address Management System
```javascript
// Addresses stored in database with isDefault flag
// Redux thunks handle API calls:
dispatch(fetchAddresses())       // GET /api/user/addresses
dispatch(deleteAddress(id))      // DELETE /api/user/addresses?id=
dispatch(setDefaultAddress(id))  // PUT /api/user/addresses

// Address selection uses IDs, not array indices
state.address.selectedAddressId  // Current selected address ID
```

### Product Data Loading Pattern
```javascript
// ProductDataLoader wraps pages needing products
// Fetches from /api/products with fallback to dummy data
// Access pattern:
const products = useSelector(state => state?.product?.list || [])

// API response caching via Redis/memory fallback
// Products include quantity tracking for inventory
```

### Middleware & Authentication
```typescript
// middleware.ts route protection hierarchy:
1. API routes: Skip middleware entirely (early return)
2. Onboarding: Redirect if !onboardingComplete
3. Admin routes: Require role === 'admin'
4. Store routes: Require role === 'vendor' && storeApproved
5. Protected routes: Require authentication
6. Public routes: Allow all

// Clerk auth pattern:
const { userId } = await auth()  // Server components
const user = await currentUser()  // Full user object
```

### Internationalization (i18n) System
```jsx
// Server component pattern
const dict = await getDictionary(params.lang) // en or ar
<ClientComponent dict={dict} lang={params.lang} />

// Client component usage
{dict?.section?.key || "Fallback"}
{lang === 'ar' && /* RTL-specific */}

// Translation files: /components/internationalization/{en,ar}.json
```

### Image Optimization with ImageKit
```jsx
// OptimizedImage component handles CDN transformation
<OptimizedImage
    src="/path.jpg"           // Auto-prefixed with ImageKit URL
    width={500}
    height={500}
    quality={80}               // Default 80
    placeholder="blur"         // Blur while loading
    transformation={[...]}     // Custom transforms
/>
// Base URL: https://ik.imagekit.io/osmanabdout
```

## Database Schema Highlights

### Key Models & Relationships
- **User**: Has cart (JSON), addresses (1:n), orders (1:n), single store (1:1)
- **Product**: Tracks quantity (Int) and lowStockThreshold for inventory
- **Order**: Status enum includes PENDING_PAYMENT, PAYMENT_FAILED, ORDER_PLACED, CANCELLED
- **Store**: status must be 'approved' for vendor operations
- **Address**: Has isDefault flag for primary address selection

### Recent Schema Updates
```prisma
// Product inventory tracking
model Product {
  quantity    Int @default(0)      // Available stock
  lowStockThreshold Int @default(5) // Warning threshold
}

// Order payment tracking
model Order {
  status OrderStatus // PENDING_PAYMENT, PAYMENT_FAILED, etc
  cancelledAt DateTime?
  cancellationReason String?
}

// Address management
model Address {
  isDefault Boolean @default(false)
}
```

## API Endpoints Structure

### User APIs
- `/api/user/addresses` - CRUD operations for addresses
- `/api/user/profile` - User profile management
- `/api/cart` - Cart sync and management

### Order APIs
- `/api/orders` - Create and list orders
- `/api/orders/cancel` - Cancel order with stock restoration
- `/api/orders/[id]` - Get specific order
- `/api/orders/[id]/status` - Update order status

### Payment APIs
- `/api/stripe/checkout` - Create Stripe session
- `/api/stripe/webhook` - Handle payment events

### Product APIs
- `/api/products` - List with filtering, pagination, caching
- `/api/products/[id]` - Get single product
- `/api/products/[id]/reviews` - Product reviews

### Vendor APIs
- `/api/vendor/store` - Store management
- `/api/vendor/products` - Product CRUD
- `/api/vendor/orders` - Order management
- `/api/vendor/analytics` - Sales analytics

### Admin APIs
- `/api/admin/stores` - Store approval/management
- `/api/admin/coupons` - Coupon management

## Environment Configuration

### Required Variables
```env
# Authentication (Clerk)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...
CLERK_SECRET_KEY=sk_live_...
CLERK_WEBHOOK_SECRET=whsec_...

# Database (PostgreSQL - Neon recommended)
DATABASE_URL=postgresql://...
DIRECT_URL=postgresql://...  # For migrations

# ImageKit CDN
NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT=https://ik.imagekit.io/osmanabdout
IMAGEKIT_PRIVATE_KEY=private_...

# Stripe Payments
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

### Optional Services
- **Redis Cache**: UPSTASH_REDIS_REST_URL, UPSTASH_REDIS_REST_TOKEN
- **Email**: RESEND_API_KEY for transactional emails
- **App URL**: NEXT_PUBLIC_APP_URL (defaults to http://localhost:3000)

## Deployment & Production

- **Platform**: Vercel (auto-deploy from main branch)
- **Database**: Neon PostgreSQL with connection pooling
- **CDN**: ImageKit for all product images
- **Cache**: Redis (Upstash) with memory fallback
- **Production URL**: https://wa.databayt.org

## Known Limitations

1. **TypeScript**: Project uses JavaScript with `ignoreBuildErrors: true`
2. **Search**: Client-side filtering, not full-text database search
3. **Stock**: No real-time stock updates across sessions
4. **Multi-vendor Orders**: Creates separate orders per store from single checkout