import { Resend } from 'resend';
import OrderConfirmation from './templates/OrderConfirmation';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendOrderConfirmationEmail({ order, userEmail, userName }) {
  try {
    if (!process.env.RESEND_API_KEY) {
      console.warn('Resend API key not configured, skipping email');
      return { success: false, error: 'Email service not configured' };
    }

    const { data, error } = await resend.emails.send({
      from: process.env.EMAIL_FROM || 'Alwathba Coop <orders@alwathbacoop.ae>',
      to: userEmail,
      subject: `Order Confirmation #${order.id.slice(-8).toUpperCase()}`,
      react: OrderConfirmation({
        order,
        userName: userName || 'Customer'
      }),
    });

    if (error) {
      console.error('Failed to send order confirmation email:', error);
      return { success: false, error };
    }

    console.log('Order confirmation email sent:', data);
    return { success: true, data };
  } catch (error) {
    console.error('Error sending order confirmation email:', error);
    return { success: false, error: error.message };
  }
}

export async function sendOrderStatusUpdateEmail({ order, userEmail, userName, newStatus }) {
  try {
    if (!process.env.RESEND_API_KEY) {
      console.warn('Resend API key not configured, skipping email');
      return { success: false, error: 'Email service not configured' };
    }

    const statusMessages = {
      PROCESSING: 'Your order is now being processed',
      SHIPPED: 'Your order has been shipped!',
      DELIVERED: 'Your order has been delivered',
      CANCELLED: 'Your order has been cancelled'
    };

    const { data, error } = await resend.emails.send({
      from: process.env.EMAIL_FROM || 'Alwathba Coop <orders@alwathbacoop.ae>',
      to: userEmail,
      subject: `Order Update #${order.id.slice(-8).toUpperCase()} - ${statusMessages[newStatus]}`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <title>Order Status Update</title>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background-color: #10b981; color: white; padding: 20px; text-align: center; }
              .content { padding: 20px; background-color: #f9fafb; }
              .status { display: inline-block; padding: 10px 20px; background-color: #10b981; color: white; border-radius: 5px; font-weight: bold; }
              .footer { text-align: center; padding: 20px; color: #666; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>Order Status Update</h1>
              </div>
              <div class="content">
                <p>Dear ${userName},</p>
                <p>${statusMessages[newStatus]}</p>
                <p>Order ID: <strong>#${order.id.slice(-8).toUpperCase()}</strong></p>
                ${newStatus === 'SHIPPED' && order.trackingNumber ? `
                  <p>Tracking Number: <strong>${order.trackingNumber}</strong></p>
                ` : ''}
                <p>Current Status: <span class="status">${newStatus}</span></p>
                <p>You can track your order in your account dashboard.</p>
              </div>
              <div class="footer">
                <p>Thank you for shopping with Alwathba Coop</p>
                <p>Contact: +971502731313 | sales@alwathbacoop.ae</p>
              </div>
            </div>
          </body>
        </html>
      `,
    });

    if (error) {
      console.error('Failed to send order status update email:', error);
      return { success: false, error };
    }

    console.log('Order status update email sent:', data);
    return { success: true, data };
  } catch (error) {
    console.error('Error sending order status update email:', error);
    return { success: false, error: error.message };
  }
}

export async function sendWelcomeEmail({ userEmail, userName }) {
  try {
    if (!process.env.RESEND_API_KEY) {
      console.warn('Resend API key not configured, skipping email');
      return { success: false, error: 'Email service not configured' };
    }

    const { data, error } = await resend.emails.send({
      from: process.env.EMAIL_FROM || 'Alwathba Coop <welcome@alwathbacoop.ae>',
      to: userEmail,
      subject: 'Welcome to Alwathba Coop!',
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <title>Welcome to Alwathba Coop</title>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background-color: #10b981; color: white; padding: 30px; text-align: center; }
              .content { padding: 30px; background-color: #f9fafb; }
              .button { display: inline-block; padding: 12px 30px; background-color: #10b981; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
              .features { margin: 20px 0; }
              .feature { padding: 10px 0; }
              .footer { text-align: center; padding: 20px; color: #666; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>Welcome to Alwathba Coop!</h1>
              </div>
              <div class="content">
                <h2>Hello ${userName}!</h2>
                <p>Thank you for joining Alwathba Coop. We're excited to have you as part of our community.</p>

                <div class="features">
                  <h3>What you can do:</h3>
                  <div class="feature">✓ Shop from multiple vendors in one place</div>
                  <div class="feature">✓ Track your orders in real-time</div>
                  <div class="feature">✓ Save your favorite products</div>
                  <div class="feature">✓ Enjoy exclusive member offers</div>
                </div>

                <center>
                  <a href="${process.env.NEXT_PUBLIC_APP_URL}/shop" class="button">Start Shopping</a>
                </center>

                <p>If you have any questions, feel free to contact our support team.</p>
              </div>
              <div class="footer">
                <p>Alwathba Coop - Your trusted marketplace</p>
                <p>Contact: +971502731313 | sales@alwathbacoop.ae</p>
                <p>Alwathbah north - Abu Dhabi</p>
              </div>
            </div>
          </body>
        </html>
      `,
    });

    if (error) {
      console.error('Failed to send welcome email:', error);
      return { success: false, error };
    }

    console.log('Welcome email sent:', data);
    return { success: true, data };
  } catch (error) {
    console.error('Error sending welcome email:', error);
    return { success: false, error: error.message };
  }
}