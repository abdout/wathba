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
    const { orderId, userId, storeId } = session.metadata;

    if (!orderId) {
      console.error('Missing orderId in session metadata:', session.id);
      return;
    }

    console.log(`Processing payment for order ${orderId}`);

    // Use transaction to ensure all-or-nothing
    await prisma.$transaction(async (tx) => {
      // Update the existing order to mark as paid
      const order = await tx.order.update({
        where: { id: orderId },
        data: {
          isPaid: true,
          paidAt: new Date(),
          status: 'ORDER_PLACED',
          stripePaymentId: session.payment_intent,
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

      console.log(`Order ${order.id} marked as paid`);

      // Clear user's cart after successful payment
      if (userId) {
        await tx.user.update({
          where: { id: userId },
          data: { cart: {} }
        });
      }

      // Send order confirmation email
      if (order.user?.email) {
        try {
          const { sendOrderConfirmationEmail } = await import('@/lib/email/sendOrderEmail');
          await sendOrderConfirmationEmail({
            order,
            userEmail: order.user.email,
            userName: order.user.name
          });
          console.log(`Order confirmation email sent for order ${order.id}`);
        } catch (emailError) {
          console.error('Failed to send order email:', emailError);
          // Don't fail the webhook if email fails
        }
      }
    });

    console.log('Checkout session completed successfully:', session.id);
  } catch (error) {
    console.error('Error handling checkout session:', error);
    throw error;
  }
}

async function handlePaymentFailed(paymentIntent) {
  // Log failed payment
  console.error('Payment failed for intent:', paymentIntent.id);

  try {
    // Find order with this payment intent
    const order = await prisma.order.findFirst({
      where: {
        stripePaymentId: paymentIntent.id
      }
    });

    if (order) {
      // Update order status to payment failed
      await prisma.order.update({
        where: { id: order.id },
        data: {
          status: 'PAYMENT_FAILED',
          isPaid: false
        }
      });

      console.log(`Order ${order.id} marked as payment failed`);
    }
  } catch (error) {
    console.error('Error updating failed payment order:', error);
  }
}