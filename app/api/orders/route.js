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

  try {

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
  } catch (error) {
    console.error('[Orders API GET] Database error:', error.message);
    throw error;
  }
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

  try {

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

    // Check stock availability
    if (!product.inStock || product.quantity < item.quantity) {
      throw new APIError(
        `Product ${product.name} has insufficient stock. Available: ${product.quantity}, Requested: ${item.quantity}`,
        400
      );
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
          status: paymentMethod === 'STRIPE' ? 'PENDING_PAYMENT' : 'ORDER_PLACED',
          isPaid: false, // Always false initially, will be updated after payment confirmation
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

      // Decrement product quantities and update stock status
      for (const item of storeData.items) {
        const newQuantity = item.product.quantity - item.quantity;
        const isInStock = newQuantity > 0;

        await tx.product.update({
          where: { id: item.product.id },
          data: {
            quantity: newQuantity,
            inStock: isInStock
          }
        });

        console.log(`Product ${item.product.id} stock updated: ${item.product.quantity} -> ${newQuantity}`);
      }

      createdOrders.push(order);
    }

    // Only clear cart for COD orders, Stripe orders clear cart after payment confirmation
    if (paymentMethod === 'COD') {
      await tx.user.update({
        where: { id: user.id },
        data: { cart: {} }
      });
    }

    return createdOrders;
  });

  // Send order confirmation emails asynchronously
  // Import at the top of the file: import { sendOrderConfirmationEmail } from '@/lib/email/sendOrderEmail';
  Promise.all(orders.map(async (order) => {
    try {
      const { sendOrderConfirmationEmail } = await import('@/lib/email/sendOrderEmail');
      await sendOrderConfirmationEmail({
        order,
        userEmail: user.email,
        userName: user.name
      });
      console.log(`Order confirmation email sent for order ${order.id}`);
    } catch (emailError) {
      console.error(`Failed to send email for order ${order.id}:`, emailError);
      // Don't fail the request if email fails
    }
  })).catch(error => {
    console.error('Failed to send order confirmation emails:', error);
  });

  const response = NextResponse.json({
    success: true,
    order: orders[0], // Return single order for backward compatibility
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
  } catch (error) {
    console.error('[Orders API] Database error:', error.message);
    throw error;
  }
});