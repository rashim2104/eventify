const nodemailer = require('nodemailer');

export const sendMail = async (rcvmail, action, name, eventName, eventId, comment) => {
    let sub = '';
    let content = ``;

    console.log('Sending email to:', rcvmail);
    console.log('Action:', action);
    console.log('Event Name:', eventName);
    console.log('Event ID:', eventId);
    console.log('Comment:', comment);
    
    
    const headerTemplate = `<!DOCTYPE html>
<html lang="en">
<body style="margin: 0; padding: 0; background-color: #f7f7f7; font-family: Arial, Helvetica, sans-serif;">
    <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f7f7f7;">
        <tr>
            <td align="center" style="padding: 40px 0;">
                <table role="presentation" cellpadding="0" cellspacing="0" width="600" style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                    <tr>
                        <td style="background-color: #ff6600; padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
                            <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
                                <tr>
                                    <td align="center">
                                        <img src="https://eventifys3.s3.ap-south-1.amazonaws.com/SairamEOMS-white.png" alt="EOMS Logo" width="140" style="display: inline-block; margin: 0 15px; vertical-align: middle; filter: brightness(0) invert(1);">
                                        <img src="https://eventifys3.s3.ap-south-1.amazonaws.com/logo-white.png" alt="Eventify Logo" width="140" style="display: inline-block; margin: 0 15px; vertical-align: middle; filter: brightness(0) invert(1);">
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 40px 30px;">`;

    const footerTemplate = `
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 25px; text-align: center; background-color: #f8f8f8; border-top: 1px solid #eeeeee; border-radius: 0 0 8px 8px;">
                            <p style="margin: 0 0 10px 0; color: #666666; font-size: 14px;">Need assistance? Contact us at <a href="mailto:eventify@sairam.edu.in" style="color: #ff6600; text-decoration: none; font-weight: bold;">eventify@sairam.edu.in</a></p>
                            <p style="margin: 0; color: #666666; font-size: 14px;">&copy; 2025 Eventify. All rights reserved.</p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>`;

    if(action === "create"){
        sub = "Request for Event Approval";
        content = `${headerTemplate}
        <h1 style="color: #ff6600; text-align: center; margin-bottom: 25px; font-size: 28px;">Request for Event Approval</h1>
        <p style="text-align: center; color: #333333; font-size: 16px; line-height: 1.6;">${name} has created an event <strong style="color: #ff6600;">${eventName}</strong> and is awaiting your approval.</p>
        <p style="text-align: center;"><a href="https://eventify.sairam.edu.in/events/${eventId}" style="display: inline-block; padding: 12px 30px; color: white; background-color: #ff6600; text-decoration: none; border-radius: 25px; margin-top: 25px; border: none; cursor: pointer; font-weight: bold; transition: background-color 0.3s;">View Event</a></p>
        ${footerTemplate}`;
    }else if(action === "approve"){
        sub = `Your Event ${eventName} has been Approved.`;
        content = `${headerTemplate}
        <h1 style="color: #ff6600; text-align: center; margin-bottom: 25px; font-size: 28px;">Your Event has been Approved</h1>
        <p style="text-align: center; color: #333333; font-size: 16px; line-height: 1.6;">Your event <strong style="color: #ff6600;">${eventName}</strong> has been approved by ${name} and is available on dashboard.</p>
        <p style="text-align: center;"><a href="https://eventify.sairam.edu.in/events/${eventId}" style="display: inline-block; padding: 12px 30px; color: white; background-color: #ff6600; text-decoration: none; border-radius: 25px; margin-top: 25px; border: none; cursor: pointer; font-weight: bold; transition: background-color 0.3s;">View Event</a></p>
        ${footerTemplate}`;
    }else if(action === "reject"){
        sub = `Your Event ${eventName} has been rejected.`;
        content = `${headerTemplate}
        <h1 style="color: #ff6600; text-align: center; margin-bottom: 25px; font-size: 28px;">Your Event has been Rejected</h1>
        <p style="text-align: center; color: #333333; font-size: 16px; line-height: 1.6;">Your event <strong style="color: #ff6600;">${eventName}</strong> has been Rejected by ${name}.</p>
        <p style="text-align: center;"><a href="https://eventify.sairam.edu.in/events/${eventId}" style="display: inline-block; padding: 12px 30px; color: white; background-color: #ff6600; text-decoration: none; border-radius: 25px; margin-top: 25px; border: none; cursor: pointer; font-weight: bold; transition: background-color 0.3s;">View Event</a></p>
        ${footerTemplate}`;
    }else if(action === "comment"){
        sub = `Your Event ${eventName} has been Marked for change.`;
        content = `${headerTemplate}
        <h1 style="color: #ff6600; text-align: center; margin-bottom: 25px; font-size: 28px;">Your Event has been Marked for Change</h1>
        <p style="text-align: center; color: #333333; font-size: 16px; line-height: 1.6;">Your event <strong style="color: #ff6600;">${eventName}</strong> has been Marked for Change by ${name}.</p>
        <div style="background-color: #fff5f0; border-left: 4px solid #ff6600; padding: 15px; margin: 20px 0; border-radius: 4px;">
            <p style="margin: 0; color: #333333;"><strong style="color: #ff6600;">Comment:</strong> ${comment}</p>
        </div>
        <p style="text-align: center;"><a href="https://eventify.sairam.edu.in/events/${eventId}" style="display: inline-block; padding: 12px 30px; color: white; background-color: #ff6600; text-decoration: none; border-radius: 25px; margin-top: 25px; border: none; cursor: pointer; font-weight: bold; transition: background-color 0.3s;">View Event</a></p>
        ${footerTemplate}`;
    }
    try {
        // Create a transporter using Google SMTP
        const transporter = nodemailer.createTransport({
            service: "Gmail",
            host: "smtp.gmail.com",
            port: 465,
            secure: true,
            auth: {
                user: process.env.SMTP_USERNAME,
                pass: process.env.SMTP_PASSWORD,
            },
        });

        // Define the email options
        const mailOptions = {
            from: "Eventify <eventify@sairam.edu.in>",
            to: rcvmail, // Using the coordinator email passed from the route
            subject: sub,
            html: content
        };

        // Send the email
        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent to:', rcvmail);
        console.log('Email sent:', info.response);
    } catch (error) {
        console.error('Error sending email:', error);
    }
}