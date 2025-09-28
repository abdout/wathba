# Alwathba Setup Instructions - Action Required! 🚀

## ✅ Completed Steps

### 1. Database & API Setup
- ✅ Created seed script at `prisma/seed.js` with sample data
- ✅ Added seed command to `package.json`
- ✅ Implemented all product API routes:
  - `/api/products` - List products with pagination & filters
  - `/api/products/[id]` - Get single product
  - `/api/products/search` - Search products
  - `/api/products/categories` - Get categories
  - `/api/products/featured` - Featured products for homepage
- ✅ Implemented cart API routes:
  - `/api/cart` - Get/update cart for authenticated users

---

## 🔴 ACTION REQUIRED - Database Setup

### Step 1: Configure PostgreSQL Database

You need to set up a PostgreSQL database. Choose one option:

#### Option A: Use Neon (Recommended - Free Tier Available)
1. Go to https://neon.tech and sign up
2. Create a new project
3. Copy the connection strings from the dashboard
4. Update your `.env.local` file:
```env
DATABASE_URL="postgresql://username:password@host/database?sslmode=require"
DIRECT_URL="postgresql://username:password@host/database?sslmode=require"
```

#### Option B: Use Supabase
1. Go to https://supabase.com and sign up
2. Create a new project
3. Go to Settings > Database
4. Copy the connection strings
5. Update your `.env.local` file with the connection strings

#### Option C: Use Local PostgreSQL
1. Install PostgreSQL locally
2. Create a database named `alwathba`
3. Update your `.env.local` file:
```env
DATABASE_URL="postgresql://postgres:yourpassword@localhost:5432/alwathba"
DIRECT_URL="postgresql://postgres:yourpassword@localhost:5432/alwathba"
```

### Step 2: Run Database Migration & Seed

Once your database is configured, run these commands in order:

```bash
# 1. Generate Prisma client (already done, but run to ensure)
npx prisma generate

# 2. Push the schema to create tables
npx prisma db push

# 3. Seed the database with sample data
npx prisma db seed

# 4. Open Prisma Studio to verify data (optional)
npx prisma studio
```

### Step 3: Verify Setup

After running the above commands, you should see:
- ✅ Tables created in your database
- ✅ Sample data populated (users, stores, products, coupons)
- ✅ Prisma Studio showing the data

---

## 🔴 ACTION REQUIRED - Clerk Configuration

### Ensure Clerk is Properly Configured

1. Check your `.env.local` has valid Clerk keys:
```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
CLERK_WEBHOOK_SECRET=whsec_...
```

2. If you don't have Clerk keys:
   - Go to https://clerk.com
   - Sign up/login to your account
   - Create a new application
   - Copy the API keys from the dashboard
   - Update your `.env.local` file

3. Configure Clerk Webhook (for user sync):
   - In Clerk Dashboard, go to Webhooks
   - Add endpoint: `https://yourdomain.com/api/clerk-webhook`
   - Select events: `user.created`, `user.updated`, `user.deleted`
   - Copy the webhook secret to `CLERK_WEBHOOK_SECRET` in `.env.local`

---

## 🔴 ACTION REQUIRED - ImageKit Configuration

### Configure ImageKit (Optional but Recommended)

1. Check your `.env.local` has ImageKit keys:
```env
NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT=https://ik.imagekit.io/your_id
NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY=public_...
IMAGEKIT_PRIVATE_KEY=private_...
```

2. If you don't have ImageKit keys:
   - Go to https://imagekit.io
   - Sign up for free account
   - Go to Dashboard > Developer > API Keys
   - Copy your credentials
   - Update your `.env.local` file

---

## 🟡 Next Steps After Database Setup

Once you've completed the database setup:

### 1. Start the Development Server
```bash
npm run dev
```

### 2. Test the APIs

Open your browser or use a tool like Postman to test:

- **Products List**: http://localhost:3000/api/products
- **Single Product**: http://localhost:3000/api/products/[product-id]
- **Categories**: http://localhost:3000/api/products/categories
- **Featured Products**: http://localhost:3000/api/products/featured
- **Search**: http://localhost:3000/api/products/search?q=milk

### 3. Frontend Should Now Work With Real Data!

The frontend pages should now display real products from the database:
- Homepage: http://localhost:3000
- Shop Page: http://localhost:3000/shop
- Product Details: Click on any product

---

## 📊 Progress Update

### What's Working Now:
- ✅ All product browsing APIs
- ✅ Product search and filtering
- ✅ Cart management (for authenticated users)
- ✅ Database schema and relationships
- ✅ Sample data seeding

### What's Coming Next:
- 🔄 Order creation and management
- 🔄 User addresses API
- 🔄 Vendor product management
- 🔄 Admin store approval
- 🔄 Payment integration (Stripe)
- 🔄 Email notifications

---

## 🐛 Troubleshooting

### Common Issues:

1. **"Database connection failed"**
   - Check your `DATABASE_URL` in `.env.local`
   - Ensure your database is running
   - Check firewall/network settings

2. **"Prisma client not generated"**
   - Run: `npx prisma generate`

3. **"Migration failed"**
   - Check database permissions
   - Try: `npx prisma db push --force-reset` (WARNING: This will delete all data)

4. **"Seed failed"**
   - Check if tables exist: `npx prisma studio`
   - Check for duplicate IDs in seed data

5. **"Cart API returns 401 Unauthorized"**
   - Ensure Clerk is properly configured
   - Check if you're logged in when testing

---

## 📝 Summary of Manual Actions Required:

1. ✅ **Set up PostgreSQL database** (Neon/Supabase/Local)
2. ✅ **Update `.env.local`** with database connection strings
3. ✅ **Run migrations**: `npx prisma db push`
4. ✅ **Seed database**: `npx prisma db seed`
5. ✅ **Verify Clerk configuration** in `.env.local`
6. ✅ **Start dev server**: `npm run dev`
7. ✅ **Test the application** at http://localhost:3000

Once you complete these steps, your e-commerce platform will be running with:
- Real product data from the database
- Working cart functionality
- Product search and filtering
- Category browsing

---

**Need Help?** Check the error messages in the console or contact support!

**Last Updated**: 2025-09-28