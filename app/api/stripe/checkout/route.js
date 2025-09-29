import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import Stripe from 'stripe';
import prisma from '@/lib/prisma';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-06-20',
});

// POST create checkout session
export async function POST(request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { orderId, returnUrl } = body;

    if (!orderId) {
      return NextResponse.json(
        { success: false, error: 'Order ID required' },
        { status: 400 }
      );
    }

    // Get user and order
    const user = await prisma.user.findUnique({
      where: { clerkUserId: userId }
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        orderItems: {
          include: {
            product: true
          }
        },
        address: true,
        store: true
      }
    });

    if (!order) {
      return NextResponse.json(
        { success: false, error: 'Order not found' },
        { status: 404 }
      );
    }

    // Verify order belongs to user
    if (order.userId !== user.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 403 }
      );
    }

    // Check if order is already paid
    if (order.isPaid) {
      return NextResponse.json(
        { success: false, error: 'Order already paid' },
        { status: 400 }
      );
    }

    // Create line items for Stripe
    const lineItems = order.orderItems.map(item => ({
      price_data: {
        currency: 'aed',
        product_data: {
          name: item.product.name,
          description: item.product.description || undefined,
          images: item.product.images?.length > 0 ? [item.product.images[0]] : undefined,
          metadata: {
            productId: item.product.id,
            storeId: order.storeId
          }
        },
        unit_amount: Math.round(item.price * 100), // Stripe expects amounts in cents
      },
      quantity: item.quantity,
    }));

    // Add shipping as a line item if applicable
    const shippingAmount = 0; // Free shipping for now, can be calculated based on location
    if (shippingAmount > 0) {
      lineItems.push({
        price_data: {
          currency: 'aed',
          product_data: {
            name: 'Shipping & Handling',
            description: `Delivery to ${order.address.city}, ${order.address.state}`,
          },
          unit_amount: Math.round(shippingAmount * 100),
        },
        quantity: 1,
      });
    }

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      customer_email: user.email,
      metadata: {
        orderId: order.id,
        userId: user.id,
        storeId: order.storeId,
      },
      success_url: returnUrl || `${process.env.NEXT_PUBLIC_APP_URL}/orders/${order.id}?payment=success`,
      cancel_url: returnUrl || `${process.env.NEXT_PUBLIC_APP_URL}/orders/${order.id}?payment=cancelled`,
      shipping_address_collection: {
        allowed_countries: ['AE'], // UAE only for now
      },
      phone_number_collection: {
        enabled: true,
      },
      locale: 'auto',
      expires_at: Math.floor(Date.now() / 1000) + 30 * 60, // 30 minutes
    });

    // Store session ID in order for tracking
    await prisma.order.update({
      where: { id: order.id },
      data: {
        stripeSessionId: session.id
      }
    });

    return NextResponse.json({
      success: true,
      data: {
        sessionId: session.id,
        checkoutUrl: session.url
      }
    });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create checkout session',
        message: error.message
      },
      { status: 500 }
    );
  }
}

// GET check payment status
export async function GET(request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');

    if (!sessionId) {
      return NextResponse.json(
        { success: false, error: 'Session ID required' },
        { status: 400 }
      );
    }

    // Retrieve session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    // Update order if payment successful
    if (session.payment_status === 'paid' && session.metadata?.orderId) {
      await prisma.order.update({
        where: { id: session.metadata.orderId },
        data: {
          isPaid: true,
          paidAt: new Date(),
          paymentMethod: 'CARD',
          stripePaymentId: session.payment_intent
        }
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        status: session.payment_status,
        orderId: session.metadata?.orderId,
        amountTotal: session.amount_total ? session.amount_total / 100 : 0,
        currency: session.currency
      }
    });
  } catch (error) {
    console.error('Error checking payment status:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to check payment status',
        message: error.message
      },
      { status: 500 }
    );
  }
}