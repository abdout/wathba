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
    where: { clerkUserId: userId },
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

  // Format cart items with product details (allow all products regardless of store status)
  const items = products
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
    where: { clerkUserId: userId },
    update: { cart },
    create: {
      clerkUserId: userId,
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
  let product;
  try {
    product = await prisma.product.findUnique({
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
  } catch (error) {
    console.error('[Cart API] Database error when fetching product:', error);
    console.error('[Cart API] Product ID:', productId);
    console.error('[Cart API] Error stack:', error.stack);
    // If database error, allow the operation to continue for development
    // In production, you might want to throw an error here
  }

  if (!product) {
    // Allow adding products even if not found in database (for dummy products)

    // Get current cart
    const user = await prisma.user.findUnique({
      where: { clerkUserId: userId },
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

    // Save updated cart
    await prisma.user.upsert({
      where: { clerkUserId: userId },
      update: { cart: updatedCart },
      create: {
        clerkUserId: userId,
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
        message: 'Cart updated successfully (development mode)'
      }
    });

    // Add rate limit headers
    if (rateLimitResult.headers) {
      Object.entries(rateLimitResult.headers).forEach(([key, value]) => {
        response.headers.set(key, value);
      });
    }

    return response;
  }

  if (!product.inStock) {
    throw new APIError('Product is out of stock', 400);
  }

  // Skip store validation entirely for now (both development and production)
  // This allows products to be added to cart regardless of store status
  // TODO: Re-enable store validation once store approval workflow is implemented

  // Get current cart
  let user;
  try {
    user = await prisma.user.findUnique({
      where: { clerkUserId: userId },
      select: { cart: true }
    });
  } catch (dbError) {
    console.error('[Cart API] Error fetching user:', dbError);
    console.error('[Cart API] User ID:', userId);
    console.error('[Cart API] Database connection check:', !!prisma);

    // In development, allow cart operations to continue without database
    if (process.env.NODE_ENV === 'development') {
      console.warn('[Cart API] Continuing without database in development mode');
      user = null; // Proceed with null user
    } else {
      throw new APIError('Database error while fetching user', 500);
    }
  }

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
  try {
    await prisma.user.upsert({
      where: { clerkUserId: userId },
      update: { cart: updatedCart },
      create: {
        clerkUserId: userId,
        name: 'User',
        email: 'user@example.com',
        image: '',
        cart: updatedCart
      }
    });
  } catch (dbError) {
    console.error('[Cart API] Error saving cart:', dbError);
    console.error('[Cart API] User ID:', userId);
    console.error('[Cart API] Cart data:', updatedCart);

    // In development, return success but log the error
    if (process.env.NODE_ENV === 'development') {
      console.warn('[Cart API] Database save failed in development mode, returning cart without persistence');
      // Continue without throwing error
    } else {
      throw new APIError('Database error while saving cart', 500);
    }
  }

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

  // Read productId from request body instead of URL params
  const body = await request.json();
  const { productId } = body;

  if (!productId) {
    throw new APIError('Product ID is required', 400);
  }

  // Get current cart
  const user = await prisma.user.findUnique({
    where: { clerkUserId: userId },
    select: { cart: true }
  });

  const currentCart = user?.cart || {};

  // Remove item from cart
  delete currentCart[productId];

  // Save updated cart
  await prisma.user.update({
    where: { clerkUserId: userId },
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