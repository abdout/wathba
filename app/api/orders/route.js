import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import prisma from '@/lib/prisma';
import { createOrderSchema, orderFilterSchema } from '@/lib/validations/order';
import { rateLimit, createRateLimitResponse } from '@/lib/middleware/rateLimit';
import { withErrorHandler, APIError } from '@/lib/middleware/errorHandler';

// GET all orders for authenticated user
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

  const { searchParams } = new URL(request.url);

  // Validate query parameters
  const queryParams = Object.fromEntries(searchParams.entries());
  const { page, limit, status } = orderFilterSchema.parse(queryParams);
  const skip = (page - 1) * limit;

  // Get user from database
  const user = await prisma.user.findUnique({
    where: { clerkUserId: userId }
  });

  if (!user) {
    return NextResponse.json({
      success: true,
      data: {
        orders: [],
        pagination: {
          page,
          limit,
          totalPages: 0,
          totalCount: 0
        }
      }
    });
  }

  // Build where clause
  const where = {
    userId: user.id,
    ...(status && { status })
  };

  // Get orders and total count in parallel to optimize performance
  const [totalCount, orders] = await Promise.all([
    prisma.order.count({ where }),
    prisma.order.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        orderItems: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                images: true,
                category: true,
                price: true
              }
            }
          }
        },
        store: {
          select: {
            id: true,
            name: true,
            username: true,
            logo: true
          }
        },
        address: true
      }
    })
  ]);

  const response = NextResponse.json({
    success: true,
    data: {
      orders,
      pagination: {
        page,
        limit,
        totalPages: Math.ceil(totalCount / limit),
        totalCount
      }
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

// POST - Create new order
export const POST = withErrorHandler(async (request) => {
  // Apply stricter rate limiting for write operations
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
  const validated = createOrderSchema.parse(body);
  const { addressId, paymentMethod, couponCode, items } = validated;

  // Get user from database
  const user = await prisma.user.findUnique({
    where: { clerkUserId: userId }
  });

  if (!user) {
    throw new APIError('User not found', 404);
  }

  // Verify address belongs to user
  const address = await prisma.address.findFirst({
    where: {
      id: addressId,
      userId: user.id
    }
  });

  if (!address) {
    throw new APIError('Invalid address', 400);
  }

  // Batch fetch all products to avoid N+1 queries
  const productIds = items.map(item => item.productId);
  const products = await prisma.product.findMany({
    where: {
      id: { in: productIds }
    },
    include: {
      store: true
    }
  });

  // Create product map for efficient lookup
  const productMap = new Map(products.map(p => [p.id, p]));

  // Validate all products exist and are in stock
  const itemsByStore = {};
  for (const item of items) {
    const product = productMap.get(item.productId);

    if (!product) {
      throw new APIError(`Product ${item.productId} not found`, 400);
    }

    if (!product.inStock) {
      throw new APIError(`Product ${product.name} is out of stock`, 400);
    }

    const storeId = product.storeId;
    if (!itemsByStore[storeId]) {
      itemsByStore[storeId] = {
        store: product.store,
        items: [],
        total: 0
      };
    }

    const itemTotal = product.price * item.quantity;
    itemsByStore[storeId].items.push({
      product,
      quantity: item.quantity,
      price: product.price,
      subtotal: itemTotal
    });
    itemsByStore[storeId].total += itemTotal;
  }

  // Handle coupon if provided
  let couponData = null;
  let discount = 0;
  if (couponCode) {
    const [coupon, orderCount] = await Promise.all([
      prisma.coupon.findUnique({
        where: { code: couponCode }
      }),
      prisma.order.count({ where: { userId: user.id } })
    ]);

    if (coupon && coupon.expiresAt > new Date()) {
      // Check if coupon is valid for user
      const isFirstOrder = orderCount === 0;

      if ((!coupon.forNewUser || isFirstOrder) && coupon.isPublic) {
        couponData = coupon;
        discount = coupon.discount;
      }
    }
  }

  // Create orders for each store using transaction
  const orders = await prisma.$transaction(async (tx) => {
    const createdOrders = [];

    for (const [storeId, storeData] of Object.entries(itemsByStore)) {
      const orderTotal = Math.max(0, storeData.total - (discount / Object.keys(itemsByStore).length));

      const order = await tx.order.create({
        data: {
          userId: user.id,
          storeId,
          addressId,
          total: orderTotal,
          paymentMethod,
          status: 'ORDER_PLACED',
          isPaid: paymentMethod === 'COD' ? false : true,
          isCouponUsed: !!couponData,
          coupon: couponData || {},
          orderItems: {
            create: storeData.items.map(item => ({
              productId: item.product.id,
              quantity: item.quantity,
              price: item.price
            }))
          }
        },
        include: {
          orderItems: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  images: true,
                  category: true
                }
              }
            }
          },
          store: {
            select: {
              id: true,
              name: true,
              username: true,
              logo: true
            }
          },
          address: true
        }
      });

      createdOrders.push(order);
    }

    // Clear user's cart after successful order
    await tx.user.update({
      where: { id: user.id },
      data: { cart: {} }
    });

    return createdOrders;
  });

  const response = NextResponse.json({
    success: true,
    data: {
      orders,
      message: `Successfully created ${orders.length} order(s)`
    }
  }, { status: 201 });

  // Add rate limit headers
  if (rateLimitResult.headers) {
    Object.entries(rateLimitResult.headers).forEach(([key, value]) => {
      response.headers.set(key, value);
    });
  }

  return response;
});