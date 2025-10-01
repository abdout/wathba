import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendWelcomeEmail({ userEmail, userName, role }) {
  if (!process.env.RESEND_API_KEY) {
    console.log('Resend API key not configured, skipping welcome email');
    return { success: false, error: 'Email service not configured' };
  }

  try {
    const subject = role === 'vendor'
      ? 'Welcome to Alwathba Coop - Your Store is Under Review'
      : 'Welcome to Alwathba Coop!';

    const htmlContent = role === 'vendor' ? `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Welcome to Alwathba Coop</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f4;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
            <!-- Header -->
            <div style="background: linear-gradient(135deg, #1D77B6 0%, #2596be 100%); padding: 40px 30px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 600;">Welcome to Alwathba Coop!</h1>
            </div>

            <!-- Content -->
            <div style="padding: 40px 30px;">
              <p style="color: #333333; font-size: 16px; line-height: 1.6; margin-top: 0;">
                Hi ${userName || 'there'},
              </p>

              <p style="color: #333333; font-size: 16px; line-height: 1.6;">
                Thank you for creating a vendor account with Alwathba Coop! We're excited to have you join our marketplace.
              </p>

              <div style="background-color: #f8f9fa; border-left: 4px solid #1D77B6; padding: 20px; margin: 30px 0; border-radius: 4px;">
                <h3 style="color: #1D77B6; margin-top: 0; font-size: 18px;">Your Store is Under Review</h3>
                <p style="color: #666666; font-size: 14px; line-height: 1.6; margin-bottom: 0;">
                  Our team is currently reviewing your store application. This typically takes 24-48 hours.
                  We'll send you an email as soon as your store is approved and ready to start selling!
                </p>
              </div>

              <h3 style="color: #333333; font-size: 18px; margin-top: 30px;">What happens next?</h3>

              <div style="margin: 20px 0;">
                <div style="display: flex; align-items: start; margin-bottom: 15px;">
                  <div style="background-color: #1D77B6; color: white; border-radius: 50%; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 12px; margin-right: 15px; flex-shrink: 0;">1</div>
                  <div>
                    <strong style="color: #333333;">Store Review</strong>
                    <p style="color: #666666; font-size: 14px; margin: 5px 0 0 0;">Our team reviews your store information</p>
                  </div>
                </div>

                <div style="display: flex; align-items: start; margin-bottom: 15px;">
                  <div style="background-color: #1D77B6; color: white; border-radius: 50%; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 12px; margin-right: 15px; flex-shrink: 0;">2</div>
                  <div>
                    <strong style="color: #333333;">Approval Notification</strong>
                    <p style="color: #666666; font-size: 14px; margin: 5px 0 0 0;">You'll receive an email once approved</p>
                  </div>
                </div>

                <div style="display: flex; align-items: start; margin-bottom: 15px;">
                  <div style="background-color: #1D77B6; color: white; border-radius: 50%; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 12px; margin-right: 15px; flex-shrink: 0;">3</div>
                  <div>
                    <strong style="color: #333333;">Start Selling</strong>
                    <p style="color: #666666; font-size: 14px; margin: 5px 0 0 0;">Add products and start growing your business</p>
                  </div>
                </div>
              </div>

              <p style="color: #666666; font-size: 14px; line-height: 1.6; margin-top: 30px;">
                If you have any questions, feel free to reach out to our support team.
              </p>

              <div style="text-align: center; margin-top: 40px;">
                <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://alwathba.com'}" style="display: inline-block; padding: 12px 30px; background-color: #1D77B6; color: #ffffff; text-decoration: none; border-radius: 5px; font-weight: 600;">Visit Your Dashboard</a>
              </div>
            </div>

            <!-- Footer -->
            <div style="background-color: #f8f9fa; padding: 30px; text-align: center; border-top: 1px solid #e0e0e0;">
              <p style="color: #999999; font-size: 12px; margin: 0;">
                © 2024 Alwathba Coop. All rights reserved.
              </p>
              <p style="color: #999999; font-size: 12px; margin: 10px 0 0 0;">
                This email was sent to ${userEmail}
              </p>
            </div>
          </div>
        </body>
      </html>
    ` : `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Welcome to Alwathba Coop</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f4;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
            <!-- Header -->
            <div style="background: linear-gradient(135deg, #1D77B6 0%, #2596be 100%); padding: 40px 30px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 600;">Welcome to Alwathba Coop!</h1>
            </div>

            <!-- Content -->
            <div style="padding: 40px 30px;">
              <p style="color: #333333; font-size: 16px; line-height: 1.6; margin-top: 0;">
                Hi ${userName || 'there'},
              </p>

              <p style="color: #333333; font-size: 16px; line-height: 1.6;">
                Welcome to Alwathba Coop! We're thrilled to have you as part of our community.
              </p>

              <div style="background-color: #f8f9fa; padding: 25px; margin: 30px 0; border-radius: 8px; text-align: center;">
                <h2 style="color: #1D77B6; margin-top: 0; font-size: 20px;">Start Shopping Today!</h2>
                <p style="color: #666666; font-size: 14px; line-height: 1.6;">
                  Discover amazing products from local vendors
                </p>
                <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://alwathba.com'}/shop" style="display: inline-block; margin-top: 20px; padding: 12px 30px; background-color: #1D77B6; color: #ffffff; text-decoration: none; border-radius: 5px; font-weight: 600;">Browse Products</a>
              </div>

              <h3 style="color: #333333; font-size: 18px; margin-top: 30px;">Why Shop with Alwathba Coop?</h3>

              <ul style="color: #666666; font-size: 14px; line-height: 2; padding-left: 20px;">
                <li>Wide selection of quality products</li>
                <li>Support local businesses and vendors</li>
                <li>Secure payment options including Cash on Delivery</li>
                <li>Fast and reliable delivery</li>
                <li>Excellent customer support</li>
              </ul>

              <div style="margin-top: 40px; padding: 20px; background-color: #fff8e1; border-radius: 8px;">
                <h3 style="color: #f57c00; margin-top: 0; font-size: 16px;">🎉 Special Welcome Offer</h3>
                <p style="color: #666666; font-size: 14px; line-height: 1.6; margin-bottom: 0;">
                  Enjoy free shipping on your first order! Start shopping now and experience the convenience of Alwathba Coop.
                </p>
              </div>

              <p style="color: #666666; font-size: 14px; line-height: 1.6; margin-top: 30px;">
                If you have any questions or need assistance, our support team is here to help!
              </p>
            </div>

            <!-- Footer -->
            <div style="background-color: #f8f9fa; padding: 30px; text-align: center; border-top: 1px solid #e0e0e0;">
              <div style="margin-bottom: 20px;">
                <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://alwathba.com'}" style="color: #1D77B6; text-decoration: none; margin: 0 10px; font-size: 14px;">Shop</a>
                <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://alwathba.com'}/about" style="color: #1D77B6; text-decoration: none; margin: 0 10px; font-size: 14px;">About</a>
                <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://alwathba.com'}/contact" style="color: #1D77B6; text-decoration: none; margin: 0 10px; font-size: 14px;">Contact</a>
              </div>
              <p style="color: #999999; font-size: 12px; margin: 0;">
                © 2024 Alwathba Coop. All rights reserved.
              </p>
              <p style="color: #999999; font-size: 12px; margin: 10px 0 0 0;">
                This email was sent to ${userEmail}
              </p>
            </div>
          </div>
        </body>
      </html>
    `;

    const { data, error } = await resend.emails.send({
      from: 'Alwathba Coop <onboarding@alwathba.com>',
      to: userEmail,
      subject: subject,
      html: htmlContent,
    });

    if (error) {
      console.error('Error sending welcome email:', error);
      return { success: false, error: error.message };
    }

    console.log('Welcome email sent successfully:', data.id);
    return { success: true, data };
  } catch (error) {
    console.error('Failed to send welcome email:', error);
    return { success: false, error: error.message };
  }
}