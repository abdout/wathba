import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import Stripe from 'stripe';
import prisma from '@/lib/prisma';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_dummy', {
  apiVersion: '2024-11-20.acacia'
});

// Disable body parsing for webhooks
export const runtime = 'nodejs';

export async function POST(request) {
  try {
    const body = await request.text();
    const signature = (await headers()).get('stripe-signature');
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!signature || !webhookSecret) {
      return NextResponse.json(
        { error: 'Missing stripe signature or webhook secret' },
        { status: 400 }
      );
    }

    let event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      console.error('Webhook signature verification failed:', err.message);
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      );
    }

    // Handle different event types
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        await handleCheckoutSessionCompleted(session);
        break;
      }

      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object;
        console.log('Payment succeeded:', paymentIntent.id);
        break;
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object;
        console.log('Payment failed:', paymentIntent.id);
        await handlePaymentFailed(paymentIntent);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}

async function handleCheckoutSessionCompleted(session) {
  try {
    const { userId, addressId, orderData } = session.metadata;

    if (!userId || !addressId || !orderData) {
      console.error('Missing metadata in session:', session.id);
      return;
    }

    // Check if this session was already processed (idempotency)
    const existingOrder = await prisma.order.findFirst({
      where: {
        userId,
        isPaid: true,
        createdAt: {
          gte: new Date(Date.now() - 5 * 60 * 1000) // Last 5 minutes
        }
      }
    });

    if (existingOrder) {
      console.log('Session already processed:', session.id);
      return;
    }

    const parsedOrderData = JSON.parse(orderData);
    const createdOrders = [];

    // Use transaction to ensure all-or-nothing
    await prisma.$transaction(async (tx) => {
      // Create orders for each store
      for (const storeOrder of parsedOrderData.itemsByStore) {
        const { storeId, items } = storeOrder;

        // Calculate total for this store
        const storeTotal = items.reduce(
          (sum, item) => sum + (item.price * item.quantity),
          0
        );

        // Create order
        const order = await tx.order.create({
          data: {
            userId,
            storeId,
            addressId,
            total: storeTotal,
            paymentMethod: 'STRIPE',
            status: 'ORDER_PLACED',
            isPaid: true,
            orderItems: {
              create: items.map(item => ({
                productId: item.productId,
                quantity: item.quantity,
                price: item.price
              }))
            }
          },
          include: {
            orderItems: {
              include: {
                product: true
              }
            },
            user: true,
            address: true,
            store: true
          }
        });

        createdOrders.push(order);
        console.log(`Order created: ${order.id} for store: ${storeId}`);
      }

      // Clear user's cart
      await tx.user.update({
        where: { id: userId },
        data: { cart: {} }
      });
    });

    // Send order confirmation emails (after transaction succeeds)
    for (const order of createdOrders) {
      try {
        await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/emails/order-confirmation`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ orderId: order.id })
        });
      } catch (emailError) {
        console.error('Failed to send order email:', emailError);
        // Don't fail the webhook if email fails
      }
    }

    console.log('Checkout session completed successfully:', session.id);
  } catch (error) {
    console.error('Error handling checkout session:', error);
    throw error;
  }
}

async function handlePaymentFailed(paymentIntent) {
  // Log failed payment
  console.error('Payment failed for intent:', paymentIntent.id);

  // You could update order status or notify user
  // For now, just log it
}