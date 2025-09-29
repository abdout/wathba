// Lazy initialization with dynamic import to prevent build-time errors
let resend = null;

const getResendClient = async () => {
  if (resend !== null) {
    return resend === false ? null : resend;
  }

  const hasValidApiKey = process.env.RESEND_API_KEY &&
                         process.env.RESEND_API_KEY !== 'test_key' &&
                         process.env.RESEND_API_KEY !== '';

  if (hasValidApiKey) {
    try {
      const { Resend } = await import('resend');
      resend = new Resend(process.env.RESEND_API_KEY);
      return resend;
    } catch (error) {
      console.warn('Failed to initialize Resend:', error.message);
      resend = false; // Mark as tried but failed
      return null;
    }
  } else {
    resend = false; // Mark as no valid key
    return null;
  }
};

export async function sendEmail({ to, subject, react, from = 'Alwathba Coop <orders@alwathbacoop.ae>' }) {
  try {
    // Get Resend client lazily
    const resendClient = await getResendClient();

    // Return early if no valid Resend client
    if (!resendClient) {
      console.warn('Resend API key not configured. Email not sent.');
      return { success: false, error: 'Resend API key not configured' };
    }

    const { data, error } = await resendClient.emails.send({
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

// Export a function to get the client instead of the client directly
export default getResendClient;