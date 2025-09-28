import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import prisma from '@/lib/prisma';
import { updateCartSchema, addToCartSchema } from '@/lib/validations/cart';
import { rateLimit, createRateLimitResponse } from '@/lib/middleware/rateLimit';
import { withErrorHandler, APIError } from '@/lib/middleware/errorHandler';

// GET cart for authenticated user
export const GET = withErrorHandler(async (request) => {
  // Apply rate limiting
  const rateLimitResult = await rateLimit(request, 'api');
  if (!rateLimitResult.success) {
    return createRateLimitResponse(rateLimitResult.headers);
  }

  const { userId } = await auth();

  if (!userId) {
    throw new APIError('Unauthorized', 401);
  }

  // Get user's cart from database
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { cart: true }
  });

  if (!user) {
    const response = NextResponse.json({
      success: true,
      data: { cart: {}, items: [], total: 0, itemCount: 0 }
    });

    if (rateLimitResult.headers) {
      Object.entries(rateLimitResult.headers).forEach(([key, value]) => {
        response.headers.set(key, value);
      });
    }

    return response;
  }

  // Get product details for cart items
  const cartData = user.cart || {};
  const productIds = Object.keys(cartData);

  if (productIds.length === 0) {
    const response = NextResponse.json({
      success: true,
      data: { cart: {}, items: [], total: 0, itemCount: 0 }
    });

    if (rateLimitResult.headers) {
      Object.entries(rateLimitResult.headers).forEach(([key, value]) => {
        response.headers.set(key, value);
      });
    }

    return response;
  }

  const products = await prisma.product.findMany({
    where: {
      id: { in: productIds },
      inStock: true // Only include in-stock products
    },
    include: {
      store: {
        select: {
          id: true,
          name: true,
          username: true,
          isActive: true,
          status: true
        }
      }
    }
  });

  // Format cart items with product details (filter out inactive stores)
  const items = products
    .filter(product => product.store.isActive && product.store.status === 'APPROVED')
    .map(product => ({
      ...product,
      quantity: cartData[product.id],
      subtotal: product.price * cartData[product.id]
    }));

  // Calculate total
  const total = items.reduce((sum, item) => sum + item.subtotal, 0);

  const response = NextResponse.json({
    success: true,
    data: {
      cart: cartData,
      items,
      total,
      itemCount: items.reduce((sum, item) => sum + item.quantity, 0)
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

// POST/PUT - Update cart
export const POST = withErrorHandler(async (request) => {
  // Apply rate limiting for write operations
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
  const { cart } = updateCartSchema.parse(body);

  // Update user's cart in database
  const updatedUser = await prisma.user.upsert({
    where: { id: userId },
    update: { cart },
    create: {
      id: userId,
      name: 'User',
      email: 'user@example.com',
      image: '',
      cart
    },
    select: { cart: true }
  });

  const response = NextResponse.json({
    success: true,
    data: { cart: updatedUser.cart }
  });

  // Add rate limit headers
  if (rateLimitResult.headers) {
    Object.entries(rateLimitResult.headers).forEach(([key, value]) => {
      response.headers.set(key, value);
    });
  }

  return response;
});

// PUT - Add item to cart
export const PUT = withErrorHandler(async (request) => {
  // Apply rate limiting for write operations
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
  const { productId, quantity } = addToCartSchema.parse(body);

  // Check if product exists and is in stock
  const product = await prisma.product.findUnique({
    where: { id: productId },
    include: {
      store: {
        select: {
          isActive: true,
          status: true
        }
      }
    }
  });

  if (!product) {
    throw new APIError('Product not found', 404);
  }

  if (!product.inStock) {
    throw new APIError('Product is out of stock', 400);
  }

  if (!product.store.isActive || product.store.status !== 'APPROVED') {
    throw new APIError('Product is not available from this store', 400);
  }

  // Get current cart
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { cart: true }
  });

  const currentCart = user?.cart || {};

  // Update cart with new quantity
  const updatedCart = {
    ...currentCart,
    [productId]: (currentCart[productId] || 0) + quantity
  };

  // Remove item if quantity is 0 or less
  if (updatedCart[productId] <= 0) {
    delete updatedCart[productId];
  }

  // Validate cart size limit
  if (Object.keys(updatedCart).length > 50) {
    throw new APIError('Maximum 50 different products allowed in cart', 400);
  }

  // Save updated cart
  await prisma.user.upsert({
    where: { id: userId },
    update: { cart: updatedCart },
    create: {
      id: userId,
      name: 'User',
      email: 'user@example.com',
      image: '',
      cart: updatedCart
    }
  });

  const response = NextResponse.json({
    success: true,
    data: {
      cart: updatedCart,
      message: 'Cart updated successfully'
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

// DELETE - Remove item from cart
export const DELETE = withErrorHandler(async (request) => {
  // Apply rate limiting for write operations
  const rateLimitResult = await rateLimit(request, 'write');
  if (!rateLimitResult.success) {
    return createRateLimitResponse(rateLimitResult.headers);
  }

  const { userId } = await auth();

  if (!userId) {
    throw new APIError('Unauthorized', 401);
  }

  const { searchParams } = new URL(request.url);
  const productId = searchParams.get('productId');

  if (!productId) {
    throw new APIError('Product ID is required', 400);
  }

  // Get current cart
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { cart: true }
  });

  const currentCart = user?.cart || {};

  // Remove item from cart
  delete currentCart[productId];

  // Save updated cart
  await prisma.user.update({
    where: { id: userId },
    data: { cart: currentCart }
  });

  const response = NextResponse.json({
    success: true,
    data: {
      cart: currentCart,
      message: 'Item removed from cart'
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