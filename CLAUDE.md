# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Alwathba Coop is a multi-vendor e-commerce platform built with Next.js 15, featuring internationalization (English/Arabic), multi-vendor architecture, and comprehensive admin/vendor dashboards.

## Development Commands

```bash
# Development
npm run dev              # Start dev server with Turbopack on port 3001
npm run build           # Production build
npm run start           # Start production server
npm run lint            # Run ESLint

# Testing
npm run test            # Run Vitest in watch mode
npm run test:ui         # Vitest with UI interface
npm run test:run        # Run tests once
npm run test:coverage   # Generate coverage report

# Database (requires PostgreSQL configuration)
npx prisma generate     # Generate Prisma Client
npx prisma db push      # Push schema changes
npx prisma studio       # Open database GUI
npx prisma migrate dev  # Create migrations
npx prisma db seed      # Seed with sample data

# Deployment
npm run auto-deploy     # Unix/Mac deployment script
npm run auto-deploy-win # Windows deployment script
```

## Critical Architecture Patterns

### Redux Cart Management
The cart system uses a **dual-action pattern** for immediate UI updates and backend sync:
```javascript
// In cartSlice.js - addToCart expects productId directly, NOT an object
dispatch(addToCart(productId))        // ✅ Correct
dispatch(addToCart({ productId }))    // ❌ Wrong
```

### Product Data Loading Flow
Products must be fetched before display:
1. `ProductDataLoader` component wraps pages needing products
2. Fetches from `/api/products` which tries database first, falls back to dummy data
3. Stores in Redux: `state.product.list`
4. Components access via: `useSelector(state => state?.product?.list || [])`

### Middleware Authentication Flow
```typescript
// middleware.ts handles route protection
1. API routes bypass middleware completely (return early)
2. Uses Clerk's auth() for authentication
3. redirectToSignIn requires: (await auth()).redirectToSignIn()
4. Protected routes: /cart, /checkout, /orders, /account
5. Public routes: /, /shop, /product/*, /about
```

### Internationalization Pattern
All user-facing components require translation:
```jsx
// Page component (server-side)
const dict = await getDictionary(params.lang);
return <Component dict={dict} lang={params.lang} />;

// Component usage
{dict?.section?.key || "Fallback Text"}
{lang === 'ar' && /* RTL-specific code */}
```

### ImageKit Integration
All images use OptimizedImage component:
```jsx
<OptimizedImage
    src="/path.jpg"  // Automatically prefixed with ImageKit URL
    alt="Description"
    width={500}
    height={500}
    transformation={[{ width: 500, quality: 85 }]}
/>
```

## Common Development Tasks

### Adding a New Page
1. Create in `/app/[lang]/pagename/page.jsx`
2. Import page component from `/components/PageNamePage.jsx`
3. Pass `dict` and `lang` props
4. Add translations to `/components/internationalization/{en,ar}.json`

### Debugging Production Issues
Check these in order:
1. **Products not loading**: Verify ProductDataLoader wraps component
2. **Add to Cart not working**: Ensure `addToCart(productId)` not `addToCart({ productId })`
3. **API 307 redirects**: Check middleware.ts excludes API routes
4. **Rate limiting errors**: Redis optional - skips if not configured
5. **Authentication errors**: Verify Clerk environment variables

### Working with Skeleton Loaders
Components have corresponding skeletons in `/components/skeletons/`:
- `ProductDetailsSkeleton` - Product page loading
- `ProductCardSkeleton` - Grid item loading
- `ProductDescriptionSkeleton` - Description section loading

## Environment Configuration

### Required Variables
```env
# Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_...
CLERK_SECRET_KEY=sk_...
CLERK_WEBHOOK_SECRET=whsec_...

# Database (PostgreSQL)
DATABASE_URL=postgresql://...
DIRECT_URL=postgresql://... # For migrations

# ImageKit CDN
NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT=https://ik.imagekit.io/osmanabdout
NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY=public_...
IMAGEKIT_PRIVATE_KEY=private_...
```

### Optional Services
- **Rate Limiting**: Set UPSTASH_REDIS_* vars or it auto-disables
- **Payments**: STRIPE_* variables
- **Email**: RESEND_API_KEY
- **Currency**: NEXT_PUBLIC_CURRENCY_SYMBOL (default: AED)

## Database Schema Key Points

- **User.cart**: Stores cart as JSON field for persistence
- **Store.status**: Must be 'approved' for vendor access
- **Product.images**: Array of ImageKit URLs
- **Order.status**: Enum (ORDER_PLACED, PROCESSING, SHIPPED, DELIVERED)
- **Rating**: Linked to orders to verify purchases

## Redux Store Structure

```javascript
state = {
  cart: {
    cartItems: { [productId]: quantity },
    total: number,
    loading: boolean,
    error: string | null
  },
  product: {
    list: Product[],
    loading: boolean,
    error: string | null,
    pagination: {...}
  },
  auth: { user: User | null },
  address: { list: Address[] },
  rating: { list: Rating[] }
}
```

## Deployment Notes

- **Vercel**: Automatic deployments from main branch
- **Production URL**: https://wa.databayt.org
- **Fallback Data**: API uses dummy data if database unavailable
- **Image CDN**: All images served from ImageKit, not local storage

## Current Limitations & Workarounds

1. **No Real Database in Dev**: Products load from `/assets/assets.js` dummy data
2. **Cart Sync**: Backend sync attempts but fails gracefully if API unavailable
3. **Rate Limiting**: Auto-disabled if Redis not configured
4. **Search**: Currently filters client-side, not database queries
5. **TypeScript**: Build errors ignored (`ignoreBuildErrors: true` in next.config.mjs)