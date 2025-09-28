import { Resend } from 'resend';

// Initialize Resend with API key
const resend = new Resend(process.env.RESEND_API_KEY || 'test_key');

export async function sendEmail({ to, subject, react, from = 'Al Wathba Coop <orders@alwathbacoop.ae>' }) {
  try {
    const { data, error } = await resend.emails.send({
      from,
      to,
      subject,
      react
    });

    if (error) {
      console.error('Email send error:', error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Email service error:', error);
    return { success: false, error: error.message };
  }
}

export default resend;