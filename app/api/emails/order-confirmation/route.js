import { NextResponse } from 'next/server';
import { sendEmail } from '@/lib/email/resend';
import OrderConfirmation from '@/lib/email/templates/OrderConfirmation';

export async function POST(request) {
  try {
    const body = await request.json();
    const { order, customer, items, address } = body;

    if (!order || !customer || !items) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Send email
    const result = await sendEmail({
      to: customer.email,
      subject: `Order Confirmation #${order.id} - Alwathba Coop`,
      react: OrderConfirmation({
        customerName: customer.name,
        orderNumber: order.id,
        orderDate: new Date(order.createdAt).toLocaleDateString(),
        items,
        total: order.total,
        shippingAddress: address,
        estimatedDelivery: '3-5 business days'
      })
    });

    if (!result.success) {
      console.error('Failed to send order confirmation:', result.error);
      return NextResponse.json(
        { success: false, error: 'Failed to send email' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Order confirmation sent',
      data: result.data
    });
  } catch (error) {
    console.error('Error sending order confirmation:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to send order confirmation',
        message: error.message
      },
      { status: 500 }
    );
  }
}