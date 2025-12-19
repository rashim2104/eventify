const nodemailer = require('nodemailer');

// Theme colors from colors.config.js
const themeColors = {
  primary: '#c96442',        // Terracotta/rust primary color
  primaryLight: '#d97757',   // Lighter variant
  background: '#faf9f5',     // Warm cream background
  foreground: '#3d3929',     // Warm dark brown text
  muted: '#ede9de',          // Muted background
  mutedForeground: '#83827d', // Muted text
  border: '#dad9d4',         // Border color
  card: '#ffffff',           // Card background
};

export const sendMail = async (
  rcvmail,
  action,
  name,
  eventName,
  eventId,
  comment
) => {
  let sub = '';
  let content = ``;

  const headerTemplate = `<!DOCTYPE html>
<html lang="en">
<body style="margin: 0; padding: 0; background-color: ${themeColors.background}; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
    <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background-color: ${themeColors.background};">
        <tr>
            <td align="center" style="padding: 40px 0;">
                <table role="presentation" cellpadding="0" cellspacing="0" width="600" style="background-color: ${themeColors.card}; border-radius: 12px; box-shadow: 0 4px 12px rgba(61, 57, 41, 0.08);">
                    <tr>
                        <td style="background: linear-gradient(135deg, ${themeColors.primary} 0%, ${themeColors.primaryLight} 100%); padding: 35px; text-align: center; border-radius: 12px 12px 0 0;">
                            <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
                                <tr>
                                    <td align="center">
                                        <img src="https://eventifys3.s3.ap-south-1.amazonaws.com/SairamEOMS-white.png" alt="EOMS Logo" width="130" style="display: inline-block; margin: 0 12px; vertical-align: middle; filter: brightness(0) invert(1);">
                                        <img src="https://eventifys3.s3.ap-south-1.amazonaws.com/logo-white.png" alt="Eventify Logo" width="130" style="display: inline-block; margin: 0 12px; vertical-align: middle; filter: brightness(0) invert(1);">
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 45px 35px;">`;

  const footerTemplate = `
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 25px 35px; text-align: center; background-color: ${themeColors.muted}; border-top: 1px solid ${themeColors.border}; border-radius: 0 0 12px 12px;">
                            <p style="margin: 0 0 10px 0; color: ${themeColors.mutedForeground}; font-size: 14px;">Need assistance? Contact us at <a href="mailto:eventify@sairam.edu.in" style="color: ${themeColors.primary}; text-decoration: none; font-weight: 600;">eventify@sairam.edu.in</a></p>
                            <p style="margin: 0; color: ${themeColors.mutedForeground}; font-size: 13px;">&copy; 2025 Eventify. All rights reserved.</p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>`;

  const buttonStyle = `display: inline-block; padding: 14px 32px; color: white; background: linear-gradient(135deg, ${themeColors.primary} 0%, ${themeColors.primaryLight} 100%); text-decoration: none; border-radius: 8px; margin-top: 25px; border: none; cursor: pointer; font-weight: 600; font-size: 15px; box-shadow: 0 4px 12px rgba(201, 100, 66, 0.3);`;

  const highlightBoxStyle = `background-color: ${themeColors.muted}; border-left: 4px solid ${themeColors.primary}; padding: 18px 20px; margin: 25px 0; border-radius: 0 8px 8px 0;`;

  if (action === 'create') {
    sub = 'Request for Event Approval';
    content = `${headerTemplate}
        <h1 style="color: ${themeColors.primary}; text-align: center; margin-bottom: 25px; font-size: 26px; font-weight: 600;">Request for Event Approval</h1>
        <p style="text-align: center; color: ${themeColors.foreground}; font-size: 16px; line-height: 1.7;">${name} has created an event <strong style="color: ${themeColors.primary};">${eventName}</strong> and is awaiting your approval.</p>
        <p style="text-align: center;"><a href="https://eventify.sairam.edu.in/events/${eventId}" style="${buttonStyle}">View Event</a></p>
        ${footerTemplate}`;
  } else if (action === 'approve') {
    sub = `Your Event ${eventName} has been Approved.`;
    content = `${headerTemplate}
        <h1 style="color: ${themeColors.primary}; text-align: center; margin-bottom: 25px; font-size: 26px; font-weight: 600;">Your Event has been Approved</h1>
        <p style="text-align: center; color: ${themeColors.foreground}; font-size: 16px; line-height: 1.7;">Your event <strong style="color: ${themeColors.primary};">${eventName}</strong> has been approved by ${name} and is available on dashboard.</p>
        <p style="text-align: center;"><a href="https://eventify.sairam.edu.in/events/${eventId}" style="${buttonStyle}">View Event</a></p>
        ${footerTemplate}`;
  } else if (action === 'reject') {
    sub = `Your Event ${eventName} has been rejected.`;
    content = `${headerTemplate}
        <h1 style="color: ${themeColors.primary}; text-align: center; margin-bottom: 25px; font-size: 26px; font-weight: 600;">Your Event has been Rejected</h1>
        <p style="text-align: center; color: ${themeColors.foreground}; font-size: 16px; line-height: 1.7;">Your event <strong style="color: ${themeColors.primary};">${eventName}</strong> has been Rejected by ${name}.</p>
        <p style="text-align: center;"><a href="https://eventify.sairam.edu.in/events/${eventId}" style="${buttonStyle}">View Event</a></p>
        ${footerTemplate}`;
  } else if (action === 'comment') {
    sub = `Your Event ${eventName} has been Marked for change.`;
    content = `${headerTemplate}
        <h1 style="color: ${themeColors.primary}; text-align: center; margin-bottom: 25px; font-size: 26px; font-weight: 600;">Your Event has been Marked for Change</h1>
        <p style="text-align: center; color: ${themeColors.foreground}; font-size: 16px; line-height: 1.7;">Your event <strong style="color: ${themeColors.primary};">${eventName}</strong> has been Marked for Change by ${name}.</p>
        <div style="${highlightBoxStyle}">
            <p style="margin: 0; color: ${themeColors.foreground};"><strong style="color: ${themeColors.primary};">Comment:</strong> ${comment}</p>
        </div>
        <p style="text-align: center;"><a href="https://eventify.sairam.edu.in/events/${eventId}" style="${buttonStyle}">View Event</a></p>
        ${footerTemplate}`;
  } else if (action === 'reminder') {
    sub = `Reminder: Please submit post-event details for ${eventName}`;
    content = `${headerTemplate}
        <h1 style="color: ${themeColors.primary}; text-align: center; margin-bottom: 25px; font-size: 26px; font-weight: 600;">Post-Event Details Reminder</h1>
        <p style="text-align: center; color: ${themeColors.foreground}; font-size: 16px; line-height: 1.7;">Hello,</p>
        <p style="text-align: center; color: ${themeColors.foreground}; font-size: 16px; line-height: 1.7;">This is a friendly reminder to submit the post-event details for <strong style="color: ${themeColors.primary};">${eventName}</strong>.</p>
        <div style="${highlightBoxStyle}">
            <p style="margin: 0; color: ${themeColors.foreground};">${comment || 'Please submit post-event details at the earliest.'}</p>
        </div>
        <p style="text-align: center;"><a href="https://eventify.sairam.edu.in/events/${eventId}" style="${buttonStyle}">Open Event</a></p>
        ${footerTemplate}`;
  }
  try {
    // Create a transporter using Google SMTP
    const transporter = nodemailer.createTransport({
      service: 'Gmail',
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: process.env.SMTP_USERNAME,
        pass: process.env.SMTP_PASSWORD,
      },
    });

    // Define the email options
    const mailOptions = {
      from: 'Eventify <eventify@sairam.edu.in>',
      to: rcvmail, // Using the coordinator email passed from the route
      subject: sub,
      html: content,
    };

    // Send the email
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Error sending email:', error);
  }
};

export const sendPasswordResetEmail = async (email, name, resetToken) => {
  const resetUrl = `${process.env.NEXT_PUBLIC_URL}/reset-password?token=${resetToken}`;

  const headerTemplate = `<!DOCTYPE html>
<html lang="en">
<body style="margin: 0; padding: 0; background-color: ${themeColors.background}; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
    <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background-color: ${themeColors.background};">
        <tr>
            <td align="center" style="padding: 40px 0;">
                <table role="presentation" cellpadding="0" cellspacing="0" width="600" style="background-color: ${themeColors.card}; border-radius: 12px; box-shadow: 0 4px 12px rgba(61, 57, 41, 0.08);">
                    <tr>
                        <td style="background: linear-gradient(135deg, ${themeColors.primary} 0%, ${themeColors.primaryLight} 100%); padding: 35px; text-align: center; border-radius: 12px 12px 0 0;">
                            <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
                                <tr>
                                    <td align="center">
                                        <img src="https://eventifys3.s3.ap-south-1.amazonaws.com/SairamEOMS-white.png" alt="EOMS Logo" width="130" style="display: inline-block; margin: 0 12px; vertical-align: middle; filter: brightness(0) invert(1);">
                                        <img src="https://eventifys3.s3.ap-south-1.amazonaws.com/logo-white.png" alt="Eventify Logo" width="130" style="display: inline-block; margin: 0 12px; vertical-align: middle; filter: brightness(0) invert(1);">
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 45px 35px;">`;

  const footerTemplate = `
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 25px 35px; text-align: center; background-color: ${themeColors.muted}; border-top: 1px solid ${themeColors.border}; border-radius: 0 0 12px 12px;">
                            <p style="margin: 0 0 10px 0; color: ${themeColors.mutedForeground}; font-size: 14px;">Need assistance? Contact us at <a href="mailto:eventify@sairam.edu.in" style="color: ${themeColors.primary}; text-decoration: none; font-weight: 600;">eventify@sairam.edu.in</a></p>
                            <p style="margin: 0; color: ${themeColors.mutedForeground}; font-size: 13px;">&copy; 2025 Eventify. All rights reserved.</p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>`;

  const buttonStyle = `display: inline-block; padding: 16px 36px; color: white; background: linear-gradient(135deg, ${themeColors.primary} 0%, ${themeColors.primaryLight} 100%); text-decoration: none; border-radius: 8px; margin: 25px 0; border: none; cursor: pointer; font-weight: 600; font-size: 16px; box-shadow: 0 4px 12px rgba(201, 100, 66, 0.3);`;

  const content = `${headerTemplate}
        <h1 style="color: ${themeColors.primary}; text-align: center; margin-bottom: 25px; font-size: 26px; font-weight: 600;">Reset Your Password</h1>
        <p style="text-align: center; color: ${themeColors.foreground}; font-size: 16px; line-height: 1.7;">Hi ${name},</p>
        <p style="text-align: center; color: ${themeColors.foreground}; font-size: 16px; line-height: 1.7;">We received a request to reset your password for your Eventify account. Click the button below to create a new password:</p>
        <p style="text-align: center;"><a href="${resetUrl}" style="${buttonStyle}">Reset Password</a></p>
        <p style="text-align: center; color: ${themeColors.mutedForeground}; font-size: 14px; line-height: 1.6;">This link will expire in 1 hour for security reasons.</p>
        <p style="text-align: center; color: ${themeColors.mutedForeground}; font-size: 14px; line-height: 1.6;">If you didn't request this password reset, please ignore this email. Your password will remain unchanged.</p>
        ${footerTemplate}`;

  const sub = 'Reset Your Eventify Password';

  try {
    // Create a transporter using Google SMTP
    const transporter = nodemailer.createTransport({
      service: 'Gmail',
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: process.env.SMTP_USERNAME,
        pass: process.env.SMTP_PASSWORD,
      },
    });

    // Define the email options
    const mailOptions = {
      from: 'Eventify <eventify@sairam.edu.in>',
      to: email,
      subject: sub,
      html: content,
    };

    // Send the email
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Error sending password reset email:', error);
    throw error;
  }
};
