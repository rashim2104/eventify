const nodemailer = require('nodemailer');

export const sendMail = async (rcvmail, action, name, eventName, eventId, comment) => {
    let sub = '';
    let content = ``;
    if(action === "create"){
        sub = "Request for Event Approval";
        content = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Request for Event Approval</title>
        <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f4f4f4;
            margin: 0;
            padding: 0;
        }
        .container {
            max-width: 600px;
            margin: 20px auto;
            background-color: #ffffff;
            border-radius: 10px;
            padding: 20px;
            box-shadow: 0px 0px 10px 0px rgba(0, 0, 0, 0.1);
        }
        h1 {
            color: #FE914E;
            text-align: center;
        }
        p {
            text-align: center;
        }
        .btn {
            display: inline-block;
            padding: 10px 20px;
            color: white; /* Change text color to white */
            background-color: #FE914E;
            text-decoration: none;
            border-radius: 5px;
            margin-top: 20px;
            border: none; /* Add this line to remove the button border */
            cursor: pointer; /* Add this line to change cursor on hover */
        }
        .btn:hover {
            background-color: #FF7F00; /* Change button color on hover */
        }
        </style>
        </head>
        <body>
        <div class="container">
        <h1>Request for Event Approval</h1>
        <p>${name} has created an event ${eventName} and is awaiting your approval.</p>
        <p><a href="http://localhost:3000/events/${eventId}" class="btn" style="color: white;">View Event</a></p>        
        </div>
        </body>
        </html>
        `;
    }else if(action === "approve"){
        sub = `Your Event ${eventName} has been Approved.`;
        content = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Your Event has been Approved.</title>
        <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f4f4f4;
            margin: 0;
            padding: 0;
        }
        .container {
            max-width: 600px;
            margin: 20px auto;
            background-color: #ffffff;
            border-radius: 10px;
            padding: 20px;
            box-shadow: 0px 0px 10px 0px rgba(0, 0, 0, 0.1);
        }
        h1 {
            color: #FE914E;
            text-align: center;
        }
        p {
            text-align: center;
        }
        .btn {
            display: inline-block;
            padding: 10px 20px;
            color: white; /* Change text color to white */
            background-color: #FE914E;
            text-decoration: none;
            border-radius: 5px;
            margin-top: 20px;
            border: none; /* Add this line to remove the button border */
            cursor: pointer; /* Add this line to change cursor on hover */
        }
        .btn:hover {
            background-color: #FF7F00; /* Change button color on hover */
        }
        </style>
        </head>
        <body>
        <div class="container">
        <h1>Your Event has been Approved</h1>
        <p>Your event ${eventName} has been approved by ${name} and is available on dashboard.</p>
        <p><a href="http://localhost:3000/events/${eventId}" class="btn" style="color: white;">View Event</a></p>        
        </div>
        </body>
        </html>
        `;
    }else if(action === "reject"){
        sub = `Your Event ${eventName} has been rejected.`;
        content = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Your Event has been Rejected</title>
        <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f4f4f4;
            margin: 0;
            padding: 0;
        }
        .container {
            max-width: 600px;
            margin: 20px auto;
            background-color: #ffffff;
            border-radius: 10px;
            padding: 20px;
            box-shadow: 0px 0px 10px 0px rgba(0, 0, 0, 0.1);
        }
        h1 {
            color: #FE914E;
            text-align: center;
        }
        p {
            text-align: center;
        }
        .btn {
            display: inline-block;
            padding: 10px 20px;
            color: white; /* Change text color to white */
            background-color: #FE914E;
            text-decoration: none;
            border-radius: 5px;
            margin-top: 20px;
            border: none; /* Add this line to remove the button border */
            cursor: pointer; /* Add this line to change cursor on hover */
        }
        .btn:hover {
            background-color: #FF7F00; /* Change button color on hover */
        }
        </style>
        </head>
        <body>
        <div class="container">
        <h1>Your Event has been Rejected.</h1>
        <p>Your event ${eventName} has been Rejected by ${name}.</p>
        <p><a href="http://localhost:3000/events/${eventId}" class="btn" style="color: white;">View Event</a></p>        
        </div>
        </body>
        </html>
        `;
    }else if(action === "comment"){
        sub = `Your Event ${eventName} has been Marked for change.`;
        content = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Your Event has been Marked for Change</title>
        <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f4f4f4;
            margin: 0;
            padding: 0;
        }
        .container {
            max-width: 600px;
            margin: 20px auto;
            background-color: #ffffff;
            border-radius: 10px;
            padding: 20px;
            box-shadow: 0px 0px 10px 0px rgba(0, 0, 0, 0.1);
        }
        h1 {
            color: #FE914E;
            text-align: center;
        }
        p {
            text-align: center;
        }
        .btn {
            display: inline-block;
            padding: 10px 20px;
            color: white; /* Change text color to white */
            background-color: #FE914E;
            text-decoration: none;
            border-radius: 5px;
            margin-top: 20px;
            border: none; /* Add this line to remove the button border */
            cursor: pointer; /* Add this line to change cursor on hover */
        }
        .btn:hover {
            background-color: #FF7F00; /* Change button color on hover */
        }
        </style>
        </head>
        <body>
        <div class="container">
        <h1>Your Event has been Marked for Change.</h1>
        <p>Your event ${eventName} has been Marked for Change by ${name}.</p>
        <p>Comment: ${comment}</p>
        <p><a href="http://localhost:3000/events/${eventId}" class="btn" style="color: white;">View Event</a></p>        
        </div>
        </body>
        </html>
        `;
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
            from: "Eventify <www.eventify@gmail.com>",
            to: "rashimrb22@gmail.com", //rcvmail
            subject: sub,
            html: content
        };

        // Send the email
        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent:', info.response);
    } catch (error) {
        console.error('Error sending email:', error);
    }
}