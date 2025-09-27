# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

GoCart is an open-source multi-vendor e-commerce platform built with Next.js 15, featuring:
- Multi-vendor architecture with separate vendor dashboards
- Customer-facing storefront for shopping
- Admin panel for platform management
- State management using Redux Toolkit
- Prisma ORM with PostgreSQL database

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
```

## Architecture

### Directory Structure
- `/app` - Next.js 15 App Router pages organized by access level:
  - `(public)` - Customer-facing pages (shop, cart, product pages)
  - `/admin` - Admin dashboard pages
  - `/store` - Vendor dashboard pages
- `/components` - React components including admin/store specific layouts
- `/lib` - Redux store configuration and feature slices:
  - `store.js` - Redux store setup
  - `/features` - Redux slices for cart, product, address, and rating management
- `/prisma` - Database schema defining User, Product, Order, Store, and related models
- `/assets` - Static assets

### State Management
Uses Redux Toolkit with the following slices:
- `cartSlice` - Shopping cart management
- `productSlice` - Product data management
- `addressSlice` - User address management
- `ratingSlice` - Product ratings and reviews

### Database Models
Key Prisma models include:
- `User` - Platform users with cart data stored as JSON
- `Store` - Vendor stores requiring approval (status: pending/approved)
- `Product` - Products linked to stores
- `Order` - Orders with status tracking (ORDER_PLACED, PROCESSING, SHIPPED, DELIVERED)
- `OrderItem` - Individual items within orders
- `Address` - Delivery addresses
- `Rating` - Product reviews
- `Coupon` - Discount codes

### Key Features
- Store approval workflow (stores start with `status: "pending"`, `isActive: false`)
- Order status tracking with enum-based states
- Payment methods: COD and Stripe
- Coupon system with expiration and user targeting
- Product categories and image galleries
- Rating system linked to orders

## Environment Variables
Create a `.env.local` file based on `.env.example`:
- `NEXT_PUBLIC_CURRENCY_SYMBOL` - Display currency symbol (default: '$')
- `DATABASE_URL` - PostgreSQL connection string
- `DIRECT_URL` - Direct database URL for migrations