import { inngest } from '../client';
import prisma from '@/lib/prisma';

// Initialize Resend conditionally with dynamic import
let resendInstance = null;

const getResend = async () => {
  if (resendInstance !== null) {
    return resendInstance === false ? null : resendInstance;
  }

  if (!process.env.RESEND_API_KEY || process.env.RESEND_API_KEY === 'test_key' || process.env.RESEND_API_KEY === '') {
    console.warn('Resend API key not configured for cart abandonment');
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

// Check for abandoned carts
export const checkAbandonedCarts = inngest.createFunction(
  {
    id: 'check-abandoned-carts',
    name: 'Check for Abandoned Carts',
  },
  {
    cron: '0 */4 * * *' // Run every 4 hours
  },
  async ({ step }) => {
    // Step 1: Find users with non-empty carts
    const usersWithCarts = await step.run('find-users-with-carts', async () => {
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

      return await prisma.user.findMany({
        where: {
          cart: {
            not: {}
          },
          updatedAt: {
            lt: oneHourAgo
          }
        },
        select: {
          id: true,
          email: true,
          name: true,
          cart: true
        }
      });
    });

    // Step 2: Process each abandoned cart
    const results = await step.run('process-abandoned-carts', async () => {
      const processedCarts = [];

      for (const user of usersWithCarts) {
        // Check if cart has items
        const cartItems = user.cart;
        if (!cartItems || Object.keys(cartItems).length === 0) continue;

        // Send event for each abandoned cart
        await inngest.send({
          name: 'cart/abandoned',
          data: {
            userId: user.id,
            userEmail: user.email,
            userName: user.name,
            cartItems: cartItems,
            cartValue: 0 // Would calculate actual value
          }
        });

        processedCarts.push(user.id);
      }

      return processedCarts;
    });

    return {
      success: true,
      processedCarts: results.length,
      message: `Processed ${results.length} abandoned carts`
    };
  }
);

// Send abandoned cart reminder
export const sendAbandonedCartReminder = inngest.createFunction(
  {
    id: 'send-abandoned-cart-reminder',
    name: 'Send Abandoned Cart Reminder',
    retries: 3
  },
  { event: 'cart/abandoned' },
  async ({ event, step }) => {
    const { userId, userEmail, userName, cartItems } = event.data;

    // Step 1: Fetch product details for cart items
    const products = await step.run('fetch-cart-products', async () => {
      const productIds = Object.keys(cartItems);
      return await prisma.product.findMany({
        where: {
          id: { in: productIds }
        },
        select: {
          id: true,
          name: true,
          price: true,
          images: true
        }
      });
    });

    // Step 2: Calculate cart value
    const cartValue = await step.run('calculate-cart-value', async () => {
      let total = 0;
      products.forEach(product => {
        const quantity = cartItems[product.id] || 0;
        total += product.price * quantity;
      });
      return total;
    });

    // Step 3: Send first reminder after 1 hour
    await step.sleep('wait-before-first-reminder', '1h');

    await step.run('send-first-reminder', async () => {
      const emailHtml = `
        <h2>You left something in your cart!</h2>
        <p>Hi ${userName},</p>
        <p>We noticed you left some items in your shopping cart. Don't miss out!</p>
        <h3>Your Cart Items:</h3>
        <ul>
          ${products.map(product => {
            const quantity = cartItems[product.id] || 0;
            return `<li>${product.name} - Quantity: ${quantity} - $${product.price}</li>`;
          }).join('')}
        </ul>
        <p><strong>Total: $${cartValue.toFixed(2)}</strong></p>
        <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/cart">Complete Your Purchase</a></p>
        <p>Items in your cart are not reserved and may sell out.</p>
      `;

      const resend = await getResend();
      if (!resend) {
        console.warn('Skipping first cart reminder - Resend not configured');
        return;
      }

      await resend.emails.send({
        from: process.env.EMAIL_FROM || 'noreply@alwathbacoop.ae',
        to: userEmail,
        subject: 'You left items in your cart!',
        html: emailHtml
      });

      // Log the reminder
      console.log(`First reminder sent to ${userEmail} for cart value $${cartValue}`);
    });

    // Step 4: Send second reminder after 24 hours (with discount)
    await step.sleep('wait-before-second-reminder', '23h'); // 24h total

    await step.run('send-second-reminder', async () => {
      // Check if cart is still abandoned
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { cart: true }
      });

      if (!user?.cart || Object.keys(user.cart).length === 0) {
        return { cartCleared: true };
      }

      // Send reminder with discount
      const discountCode = `SAVE10_${userId.substring(0, 6).toUpperCase()}`;

      const emailHtml = `
        <h2>Still thinking about it? Here's 10% off!</h2>
        <p>Hi ${userName},</p>
        <p>Your cart is waiting for you, and we'd love to help you save!</p>
        <p>Use code <strong>${discountCode}</strong> for 10% off your order.</p>
        <h3>Your Cart Items:</h3>
        <ul>
          ${products.map(product => {
            const quantity = cartItems[product.id] || 0;
            return `<li>${product.name} - Quantity: ${quantity} - $${product.price}</li>`;
          }).join('')}
        </ul>
        <p><strong>Total: $${cartValue.toFixed(2)}</strong></p>
        <p><strong>With 10% off: $${(cartValue * 0.9).toFixed(2)}</strong></p>
        <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/cart">Claim Your Discount</a></p>
        <p>This offer expires in 48 hours!</p>
      `;

      const resend = await getResend();
      if (!resend) {
        console.warn('Skipping second cart reminder - Resend not configured');
        return;
      }

      await resend.emails.send({
        from: process.env.EMAIL_FROM || 'noreply@alwathbacoop.ae',
        to: userEmail,
        subject: '10% OFF - Your cart is waiting!',
        html: emailHtml
      });

      // Create temporary coupon in database
      await prisma.coupon.create({
        data: {
          code: discountCode,
          description: 'Abandoned cart recovery discount',
          discount: 10,
          forNewUser: false,
          forMember: false,
          isPublic: false,
          expiresAt: new Date(Date.now() + 48 * 60 * 60 * 1000) // 48 hours
        }
      });

      console.log(`Second reminder with discount sent to ${userEmail}`);
    });

    // Step 5: Final reminder after 72 hours
    await step.sleep('wait-before-final-reminder', '48h'); // 72h total

    await step.run('send-final-reminder', async () => {
      // Check if cart is still abandoned
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { cart: true }
      });

      if (!user?.cart || Object.keys(user.cart).length === 0) {
        return { cartCleared: true };
      }

      const emailHtml = `
        <h2>Last chance for your items!</h2>
        <p>Hi ${userName},</p>
        <p>This is your final reminder about the items in your cart.</p>
        <p>After today, we can't guarantee these items will still be available.</p>
        <h3>Your Cart Items:</h3>
        <ul>
          ${products.map(product => {
            const quantity = cartItems[product.id] || 0;
            return `<li>${product.name} - Quantity: ${quantity} - $${product.price}</li>`;
          }).join('')}
        </ul>
        <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/cart">Complete Your Order Now</a></p>
        <p>Need help? Reply to this email and our support team will assist you.</p>
      `;

      const resend = await getResend();
      if (!resend) {
        console.warn('Skipping final cart reminder - Resend not configured');
        return;
      }

      await resend.emails.send({
        from: process.env.EMAIL_FROM || 'noreply@alwathbacoop.ae',
        to: userEmail,
        subject: 'Last chance - Your cart expires soon!',
        html: emailHtml
      });

      console.log(`Final reminder sent to ${userEmail}`);
    });

    return {
      success: true,
      userId,
      cartValue,
      remindersCompleted: true
    };
  }
);