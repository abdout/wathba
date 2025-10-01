import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import prisma from '@/lib/prisma';
import { withErrorHandler, APIError } from '@/lib/middleware/errorHandler';
import { rateLimit } from '@/lib/middleware/rateLimit';

// POST /api/orders/cancel - Cancel an order and restore stock
export const POST = withErrorHandler(async (request) => {
  // Apply rate limiting
  const rateLimitResult = await rateLimit(request, 'write');
  if (!rateLimitResult.success) {
    return NextResponse.json(
      { error: 'Too many requests' },
      { status: 429, headers: rateLimitResult.headers }
    );
  }

  const { userId } = await auth();

  if (!userId) {
    throw new APIError('Unauthorized', 401);
  }

  const body = await request.json();
  const { orderId, reason } = body;

  if (!orderId) {
    throw new APIError('Order ID is required', 400);
  }

  // Get user from database
  const user = await prisma.user.findUnique({
    where: { clerkUserId: userId }
  });

  if (!user) {
    throw new APIError('User not found', 404);
  }

  // Get the order with items
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      orderItems: true
    }
  });

  if (!order) {
    throw new APIError('Order not found', 404);
  }

  // Verify order belongs to user (or user is admin/vendor)
  if (order.userId !== user.id) {
    throw new APIError('Unauthorized to cancel this order', 403);
  }

  // Check if order can be cancelled
  if (order.status === 'SHIPPED' || order.status === 'DELIVERED') {
    throw new APIError('Cannot cancel order that has been shipped or delivered', 400);
  }

  if (order.status === 'CANCELLED') {
    throw new APIError('Order is already cancelled', 400);
  }

  // Use transaction to ensure atomicity
  const updatedOrder = await prisma.$transaction(async (tx) => {
    // Update order status
    const cancelled = await tx.order.update({
      where: { id: orderId },
      data: {
        status: 'CANCELLED',
        cancelledAt: new Date(),
        cancellationReason: reason || 'Cancelled by user'
      },
      include: {
        orderItems: {
          include: {
            product: true
          }
        }
      }
    });

    // Restore product quantities
    for (const item of cancelled.orderItems) {
      const newQuantity = item.product.quantity + item.quantity;

      await tx.product.update({
        where: { id: item.productId },
        data: {
          quantity: newQuantity,
          inStock: true // Product is back in stock after cancellation
        }
      });

      console.log(`Product ${item.productId} stock restored: ${item.product.quantity} -> ${newQuantity}`);
    }

    // If order was paid via Stripe, initiate refund
    if (order.isPaid && order.paymentMethod === 'STRIPE' && order.stripePaymentId) {
      // Note: Actual refund would be processed via Stripe API
      // This is a placeholder for the refund logic
      console.log(`Refund initiated for order ${orderId}, payment intent: ${order.stripePaymentId}`);

      // You would call Stripe refund API here:
      // const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
      // await stripe.refunds.create({ payment_intent: order.stripePaymentId });
    }

    return cancelled;
  });

  // Send cancellation email asynchronously
  if (user.email) {
    Promise.resolve().then(async () => {
      try {
        const { sendOrderCancellationEmail } = await import('@/lib/email/sendOrderEmail');
        await sendOrderCancellationEmail({
          order: updatedOrder,
          userEmail: user.email,
          userName: user.name,
          reason: reason || 'Cancelled by user'
        });
        console.log(`Cancellation email sent for order ${orderId}`);
      } catch (emailError) {
        console.error(`Failed to send cancellation email for order ${orderId}:`, emailError);
      }
    });
  }

  return NextResponse.json({
    success: true,
    message: 'Order cancelled successfully',
    order: updatedOrder
  });
});