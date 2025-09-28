import { inngest } from '../client';
import prisma from '@/lib/prisma';

// Initialize Resend conditionally with dynamic import
let resendInstance = null;

const getResend = async () => {
  if (resendInstance !== null) {
    return resendInstance === false ? null : resendInstance;
  }

  if (!process.env.RESEND_API_KEY || process.env.RESEND_API_KEY === 'test_key' || process.env.RESEND_API_KEY === '') {
    console.warn('Resend API key not configured for order processing');
    resendInstance = false;
    return null;
  }

  try {
    const { Resend } = await import('resend');
    resendInstance = new Resend(process.env.RESEND_API_KEY);
    return resendInstance;
  } catch (error) {
    console.warn('Failed to initialize Resend:', error.message);
    resendInstance = false;
    return null;
  }
};

// Process new orders
export const processNewOrder = inngest.createFunction(
  { id: 'process-new-order', name: 'Process New Order' },
  { event: 'order/placed' },
  async ({ event, step }) => {
    const { orderId } = event.data;

    // Step 1: Fetch order details
    const order = await step.run('fetch-order', async () => {
      return await prisma.order.findUnique({
        where: { id: orderId },
        include: {
          user: true,
          address: true,
          orderItems: {
            include: {
              product: true
            }
          },
          store: true
        }
      });
    });

    if (!order) {
      throw new Error(`Order ${orderId} not found`);
    }

    // Step 2: Update inventory
    await step.run('update-inventory', async () => {
      for (const item of order.orderItems) {
        await prisma.product.update({
          where: { id: item.productId },
          data: {
            // In a real app, you'd have a separate inventory table
            inStock: true // Simplified for demo
          }
        });

        // Check for low stock
        // This would normally check actual inventory counts
        await inngest.send({
          name: 'product/low-stock',
          data: {
            productId: item.productId,
            productName: item.product.name,
            storeId: item.product.storeId
          }
        });
      }
    });

    // Step 3: Send order confirmation email
    await step.run('send-confirmation-email', async () => {
      const resend = await getResend();
      if (!resend) {
        console.warn('Skipping order confirmation email - Resend not configured');
        return;
      }

      const emailHtml = `
        <h2>Order Confirmation</h2>
        <p>Hi ${order.user.name},</p>
        <p>Thank you for your order #${order.id}!</p>
        <h3>Order Details:</h3>
        <ul>
          ${order.orderItems.map(item => `
            <li>${item.product.name} - Quantity: ${item.quantity} - Price: $${item.price}</li>
          `).join('')}
        </ul>
        <p><strong>Total: $${order.total}</strong></p>
        <h3>Shipping Address:</h3>
        <p>${order.address.name}<br>
        ${order.address.street}<br>
        ${order.address.city}, ${order.address.state} ${order.address.zip}<br>
        ${order.address.country}</p>
        <p>We'll notify you when your order ships!</p>
      `;

      await resend.emails.send({
        from: process.env.EMAIL_FROM || 'noreply@alwathbacoop.ae',
        to: order.user.email,
        subject: `Order Confirmation #${order.id}`,
        html: emailHtml
      });
    });

    // Step 4: Notify vendor
    await step.run('notify-vendor', async () => {
      // Send notification to vendor about new order
      // This could be email, SMS, or in-app notification
      console.log(`Notifying vendor ${order.store.name} about order ${order.id}`);
    });

    // Step 5: Schedule status check
    await step.sleep('wait-before-status-check', '1h');

    await step.run('check-order-status', async () => {
      const currentOrder = await prisma.order.findUnique({
        where: { id: orderId },
        select: { status: true }
      });

      if (currentOrder?.status === 'ORDER_PLACED') {
        // Send reminder to vendor if order hasn't been processed
        console.log(`Order ${orderId} still pending after 1 hour`);
      }
    });

    return {
      success: true,
      orderId,
      message: 'Order processed successfully'
    };
  }
);

// Handle order shipment
export const handleOrderShipped = inngest.createFunction(
  { id: 'handle-order-shipped', name: 'Handle Order Shipped' },
  { event: 'order/shipped' },
  async ({ event, step }) => {
    const { orderId, trackingNumber } = event.data;

    // Send shipping notification email
    await step.run('send-shipping-email', async () => {
      const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: { user: true }
      });

      if (!order) return;

      const emailHtml = `
        <h2>Your Order Has Shipped!</h2>
        <p>Hi ${order.user.name},</p>
        <p>Good news! Your order #${orderId} has been shipped.</p>
        ${trackingNumber ? `<p>Tracking Number: <strong>${trackingNumber}</strong></p>` : ''}
        <p>You should receive your order within 3-5 business days.</p>
      `;

      const resend = await getResend();
      if (!resend) {
        console.warn('Skipping shipping email - Resend not configured');
        return;
      }

      await resend.emails.send({
        from: process.env.EMAIL_FROM || 'noreply@alwathbacoop.ae',
        to: order.user.email,
        subject: `Order Shipped - #${orderId}`,
        html: emailHtml
      });
    });

    // Schedule delivery reminder
    await step.sleep('wait-for-delivery', '3d');

    await step.run('send-delivery-reminder', async () => {
      const order = await prisma.order.findUnique({
        where: { id: orderId },
        select: { status: true, user: { select: { email: true, name: true } } }
      });

      if (order?.status === 'SHIPPED') {
        // Send delivery reminder
        const resend = await getResend();
        if (!resend) {
          console.warn('Skipping delivery reminder email - Resend not configured');
          return;
        }

        await resend.emails.send({
          from: process.env.EMAIL_FROM || 'noreply@alwathbacoop.ae',
          to: order.user.email,
          subject: `Has your order arrived? - #${orderId}`,
          html: `
            <p>Hi ${order.user.name},</p>
            <p>Your order should have arrived by now. If you've received it, please let us know!</p>
            <p>If you haven't received your order yet, please contact our support team.</p>
          `
        });
      }
    });

    return { success: true };
  }
);

// Handle order cancellation
export const handleOrderCancelled = inngest.createFunction(
  { id: 'handle-order-cancelled', name: 'Handle Order Cancelled' },
  { event: 'order/cancelled' },
  async ({ event, step }) => {
    const { orderId, reason } = event.data;

    // Process refund
    await step.run('process-refund', async () => {
      const order = await prisma.order.findUnique({
        where: { id: orderId },
        select: { isPaid: true, paymentMethod: true, total: true }
      });

      if (order?.isPaid && order.paymentMethod === 'STRIPE') {
        // Process Stripe refund
        console.log(`Processing refund for order ${orderId}: $${order.total}`);
        // Actual Stripe refund logic would go here
      }
    });

    // Restore inventory
    await step.run('restore-inventory', async () => {
      const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: { orderItems: true }
      });

      if (!order) return;

      for (const item of order.orderItems) {
        // Restore product inventory
        // In a real app, you'd have proper inventory management
        console.log(`Restoring inventory for product ${item.productId}: +${item.quantity}`);
      }
    });

    // Send cancellation email
    await step.run('send-cancellation-email', async () => {
      const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: { user: true }
      });

      if (!order) return;

      const resend = await getResend();
      if (!resend) {
        console.warn('Skipping cancellation email - Resend not configured');
        return;
      }

      await resend.emails.send({
        from: process.env.EMAIL_FROM || 'noreply@alwathbacoop.ae',
        to: order.user.email,
        subject: `Order Cancelled - #${orderId}`,
        html: `
          <h2>Order Cancellation Confirmation</h2>
          <p>Hi ${order.user.name},</p>
          <p>Your order #${orderId} has been cancelled.</p>
          ${reason ? `<p>Reason: ${reason}</p>` : ''}
          ${order.isPaid ? '<p>Your refund is being processed and should appear in 3-5 business days.</p>' : ''}
          <p>If you have any questions, please contact our support team.</p>
        `
      });
    });

    return { success: true };
  }
);