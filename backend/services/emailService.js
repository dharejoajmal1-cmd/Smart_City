// =====================================================
// services/emailService.js
// Sends transactional emails (e.g. registration welcome
// email) using Gmail via Nodemailer.
//
// Required environment variables (see .env.example):
//   EMAIL_USER  -> the Gmail address that sends the mail
//   EMAIL_PASS  -> a Gmail "App Password" (NOT your normal
//                  Gmail login password)
//   EMAIL_FROM  -> (optional) display name/address used in
//                  the "From" header, defaults to EMAIL_USER
// =====================================================

const nodemailer = require('nodemailer');

let transporter = null;

/**
 * Lazily creates (and caches) the Nodemailer transporter so the
 * app doesn't crash on boot if email env vars aren't set yet.
 */
function getTransporter() {
  if (transporter) return transporter;

  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASS;

  if (!user || !pass) {
    console.warn(
      '⚠️  EMAIL_USER / EMAIL_PASS not set. Registration emails will be skipped.'
    );
    return null;
  }

  transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user, pass },
  });

  return transporter;
}

/**
 * Sends an email. Never throws — logs and returns false on failure
 * so a failed email never breaks registration/login flows.
 * @param {{to:string, subject:string, html:string, text?:string}} opts
 * @returns {Promise<boolean>}
 */
async function sendMail({ to, subject, html, text }) {
  try {
    const t = getTransporter();
    if (!t) return false;

    await t.sendMail({
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to,
      subject,
      html,
      text: text || html.replace(/<[^>]+>/g, ''),
    });

    console.log(`📧 Email sent to ${to}: ${subject}`);
    return true;
  } catch (err) {
    console.error('❌ Failed to send email:', err.message);
    return false;
  }
}

/**
 * Sends the "welcome / registration successful" email to a newly
 * registered user.
 * @param {{name:string, email:string}} user
 */
async function sendWelcomeEmail(user) {
  const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';

  return sendMail({
    to: user.email,
    subject: 'Welcome to Smart City Jamshoro 🎉',
    html: `
      <div style="font-family:Arial,sans-serif;max-width:520px;margin:auto;line-height:1.6">
        <h2 style="color:#1a73e8;">Welcome, ${user.name}!</h2>
        <p>Your account on <strong>Smart City Jamshoro</strong> has been created successfully.</p>
        <p><strong>Registered email:</strong> ${user.email}</p>
        <p>You can now log in and start exploring properties.</p>
        <p>
          <a href="${clientUrl}/login"
             style="display:inline-block;padding:10px 18px;background:#1a73e8;color:#fff;
                    text-decoration:none;border-radius:6px;">
            Go to Login
          </a>
        </p>
        <hr style="border:none;border-top:1px solid #eee;margin:24px 0" />
        <p style="font-size:12px;color:#888">
          If you did not create this account, you can safely ignore this email.
        </p>
      </div>
    `,
  });
}

module.exports = { sendMail, sendWelcomeEmail };
