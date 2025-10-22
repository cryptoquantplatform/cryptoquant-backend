const nodemailer = require('nodemailer');
require('dotenv').config();

// Create email transporter
const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: process.env.EMAIL_SECURE === 'true',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
    }
});

// Verify email connection
transporter.verify(function (error, success) {
    if (error) {
        console.log('❌ Email configuration error:', error);
    } else {
        console.log('✅ Email server is ready to send messages');
    }
});

// Send verification code email
const sendVerificationEmail = async (email, code, name) => {
    const mailOptions = {
        from: `DCPTG Platform <${process.env.EMAIL_FROM}>`,
        to: email,
        subject: 'Email Verification Code - DCPTG',
        html: `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0; }
                    .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 40px; border-radius: 10px; margin-top: 20px; }
                    .header { text-align: center; margin-bottom: 30px; }
                    .logo { font-size: 32px; font-weight: bold; color: #3b82f6; margin-bottom: 10px; }
                    .code-box { background: linear-gradient(135deg, #3b82f6, #2563eb); color: white; padding: 30px; border-radius: 10px; text-align: center; margin: 30px 0; }
                    .code { font-size: 36px; font-weight: bold; letter-spacing: 8px; margin: 10px 0; }
                    .message { color: #333; line-height: 1.6; }
                    .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e5e5; color: #666; font-size: 12px; text-align: center; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <div class="logo">DCPTG</div>
                        <p style="color: #666;">Smart Crypto Investment Platform</p>
                    </div>
                    
                    <p class="message">Hello <strong>${name}</strong>,</p>
                    
                    <p class="message">Thank you for registering with DCPTG! To complete your registration, please use the verification code below:</p>
                    
                    <div class="code-box">
                        <p style="margin: 0; font-size: 14px;">Your Verification Code</p>
                        <div class="code">${code}</div>
                        <p style="margin: 0; font-size: 12px; opacity: 0.9;">This code will expire in 10 minutes</p>
                    </div>
                    
                    <p class="message">If you didn't create an account with DCPTG, please ignore this email.</p>
                    
                    <div class="footer">
                        <p>© ${new Date().getFullYear()} DCPTG. All rights reserved.</p>
                        <p>This is an automated message, please do not reply.</p>
                    </div>
                </div>
            </body>
            </html>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        return { success: true };
    } catch (error) {
        console.error('Error sending email:', error);
        return { success: false, error: error.message };
    }
};

// Send withdrawal notification
const sendWithdrawalNotification = async (email, amount, crypto, address) => {
    const mailOptions = {
        from: `DCPTG Platform <${process.env.EMAIL_FROM}>`,
        to: email,
        subject: 'Withdrawal Request Received - DCPTG',
        html: `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0; }
                    .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 40px; border-radius: 10px; margin-top: 20px; }
                    .header { text-align: center; margin-bottom: 30px; }
                    .logo { font-size: 32px; font-weight: bold; color: #3b82f6; }
                    .info-box { background-color: #f8f9fa; padding: 20px; border-radius: 10px; margin: 20px 0; }
                    .info-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e5e5e5; }
                    .label { color: #666; }
                    .value { font-weight: bold; color: #333; }
                    .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e5e5; color: #666; font-size: 12px; text-align: center; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <div class="logo">DCPTG</div>
                    </div>
                    
                    <h2 style="color: #333;">Withdrawal Request Received</h2>
                    
                    <p>Your withdrawal request has been received and is being processed.</p>
                    
                    <div class="info-box">
                        <div class="info-row">
                            <span class="label">Amount:</span>
                            <span class="value">${amount} ${crypto}</span>
                        </div>
                        <div class="info-row">
                            <span class="label">Cryptocurrency:</span>
                            <span class="value">${crypto}</span>
                        </div>
                        <div class="info-row">
                            <span class="label">Wallet Address:</span>
                            <span class="value" style="font-size: 12px;">${address}</span>
                        </div>
                        <div class="info-row" style="border-bottom: none;">
                            <span class="label">Processing Time:</span>
                            <span class="value">1-24 hours</span>
                        </div>
                    </div>
                    
                    <p style="color: #666;">You will receive another email once your withdrawal has been completed.</p>
                    
                    <div class="footer">
                        <p>© ${new Date().getFullYear()} DCPTG. All rights reserved.</p>
                    </div>
                </div>
            </body>
            </html>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        return { success: true };
    } catch (error) {
        console.error('Error sending withdrawal notification:', error);
        return { success: false, error: error.message };
    }
};

module.exports = {
    sendVerificationEmail,
    sendWithdrawalNotification
};


