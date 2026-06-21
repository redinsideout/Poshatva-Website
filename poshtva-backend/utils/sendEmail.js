const { Resend } = require('resend');

// Initialize Resend
const resend = new Resend(process.env.RESEND_API_KEY || 'dummy_key');

/**
 * Send email via Resend
 * @param {Object} options
 * @param {string} options.to - Recipient email
 * @param {string} options.subject - Subject line
 * @param {string} options.html - HTML body
 */
const sendEmail = async ({ to, subject, html }) => {
  if (!process.env.RESEND_API_KEY) {
    console.log('[EMAIL] Skipping email send - RESEND_API_KEY not configured.');
    return;
  }

  try {
    const { data, error } = await resend.emails.send({
      from: 'Poshatva 🌱 <orders@poshatva.com>',
      to,
      subject,
      html,
    });

    if (error) {
      console.error(`[EMAIL] Resend API error sending to ${to}:`, error);
      throw new Error(error.message || 'Resend API error');
    }

    return data;
  } catch (error) {
    console.error(`[EMAIL] Failed to send email to ${to}: ${error.message}`);
    throw error;
  }
};

module.exports = sendEmail;
