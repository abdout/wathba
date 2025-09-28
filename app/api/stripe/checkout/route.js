import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import Stripe from 'stripe';
import prisma from '@/lib/prisma';
import { stripeCheckoutSchema } from '@/lib/validations/stripe';
import { rateLimit, createRateLimitResponse } from '@/lib/middleware/rateLimit';
import { withErrorHandler, APIError } from '@/lib/middleware/errorHandler';

// Initialize Stripe (optional for build)
const stripeKey = process.env.STRIPE_SECRET_KEY;
const stripe = stripeKey ? new Stripe(stripeKey, {
  apiVersion: '2024-11-20.acacia'
}) : null;

// POST - Create checkout session
export const POST = withErrorHandler(async (request) => {
  // Check if Stripe is configured
  if (!stripe) {
    throw new APIError('Payment system is not configured', 503);
  }

  // Apply stricter rate limiting for payment operations
  const rateLimitResult = await rateLimit(request, 'write');
  if (!rateLimitResult.success) {
    return createRateLimitResponse(rateLimitResult.headers);
  }

  const { userId } = await auth();

  if (!userId) {
    throw new APIError('Unauthorized', 401);
  }

  const body = await request.json();

  // Validate input
  const { addressId, items } = stripeCheckoutSchema.parse(body);

  // Get user and address
  const [user, address] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true
      }
    }),
    prisma.address.findFirst({
      where: { id: addressId, userId }
    })
  ]);

  if (!user || !address) {
    throw new APIError('Invalid user or address', 400);
  }

  // Batch fetch all products to avoid N+1 queries
  const productIds = items.map(item => item.productId);
  const products = await prisma.product.findMany({
    where: {
      id: { in: productIds },
      inStock: true
    },
    include: {
      store: {
        select: {
          id: true,
          name: true,
          isActive: true,
          status: true
        }
      }
    }
  });

  // Create product map for efficient lookup
  const productMap = new Map(products.map(p => [p.id, p]));

  // Group items by store for multi-vendor support
  const itemsByStore = {};
  let totalAmount = 0;

  for (const item of items) {
    const product = productMap.get(item.productId);

    if (!product) {
      throw new APIError(`Product ${item.productId} not found or out of stock`, 400);
    }

    if (!product.store.isActive || product.store.status !== 'APPROVED') {
      throw new APIError(`Product ${item.productId} not available from this store`, 400);
    }

    const storeId = product.storeId;
    if (!itemsByStore[storeId]) {
      itemsByStore[storeId] = {
        store: product.store,
        items: []
      };
    }

    itemsByStore[storeId].items.push({
      product,
      quantity: item.quantity
    });

    totalAmount += product.price * item.quantity;
  }

  // Validate minimum amount (Stripe requires minimum charges)
  if (totalAmount < 2) { // 2 AED minimum
    throw new APIError('Order total must be at least 2 AED', 400);
  }

  // Create line items for Stripe
  const lineItems = [];
  for (const storeData of Object.values(itemsByStore)) {
    for (const item of storeData.items) {
      // Validate price is positive
      if (item.product.price <= 0) {
        throw new APIError(`Invalid product price for ${item.product.name}`, 400);
      }

      lineItems.push({
        price_data: {
          currency: 'aed',
          product_data: {
            name: item.product.name,
            description: `Sold by ${storeData.store.name}`,
            images: item.product.images && item.product.images.length > 0 ? [item.product.images[0]] : [],
            metadata: {
              productId: item.product.id,
              storeId: storeData.store.id,
              storeName: storeData.store.name
            }
          },
          unit_amount: Math.round(item.product.price * 100) // Convert to cents
        },
        quantity: item.quantity
      });
    }
  }

  // Validate environment variables
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;
  if (!appUrl) {
    throw new APIError('Application URL not configured', 500);
  }

  // Create checkout session
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: lineItems,
    mode: 'payment',
    success_url: `${appUrl}/orders?success=true&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${appUrl}/cart?cancelled=true`,
    customer_email: user.email,
    client_reference_id: userId,
    metadata: {
      userId,
      addressId,
      orderData: JSON.stringify({
        itemsByStore: Object.entries(itemsByStore).map(([storeId, data]) => ({
          storeId,
          storeName: data.store.name,
          items: data.items.map(item => ({
            productId: item.product.id,
            quantity: item.quantity,
            price: item.product.price
          }))
        }))
      })
    },
    shipping_address_collection: {
      allowed_countries: ['AE']
    },
    expires_at: Math.floor(Date.now() / 1000) + (30 * 60), // 30 minutes expiry
    billing_address_collection: 'required'
  });

  const response = NextResponse.json({
    success: true,
    data: {
      sessionId: session.id,
      sessionUrl: session.url,
      totalAmount: totalAmount,
      currency: 'AED'
    }
  });

  // Add rate limit headers
  if (rateLimitResult.headers) {
    Object.entries(rateLimitResult.headers).forEach(([key, value]) => {
      response.headers.set(key, value);
    });
  }

  return response;
});