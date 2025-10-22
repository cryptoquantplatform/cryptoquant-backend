const sgMail = require('@sendgrid/mail');
require('dotenv').config();

// Set SendGrid API Key
const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY || process.env.EMAIL_PASSWORD;
sgMail.setApiKey(SENDGRID_API_KEY);

// Verify SendGrid configuration
if (SENDGRID_API_KEY && SENDGRID_API_KEY.startsWith('SG.')) {
    console.log('✅ Email server is ready to send messages (SendGrid Web API)');
} else {
    console.log('❌ SendGrid API Key not configured properly');
}

// Send verification code email
const sendVerificationEmail = async (email, code, name) => {
    const msg = {
        to: email,
        from: process.env.EMAIL_FROM || 'cryptoquantplatform@gmail.com',
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
        await sgMail.send(msg);
        console.log(`✅ Verification email sent to ${email}`);
        return { success: true };
    } catch (error) {
        console.error('Error sending email:', error);
        if (error.response) {
            console.error('SendGrid Error:', error.response.body);
        }
        return { success: false, error: error.message };
    }
};

// Send withdrawal notification
const sendWithdrawalNotification = async (email, amount, crypto, address) => {
    const msg = {
        to: email,
        from: process.env.EMAIL_FROM || 'cryptoquantplatform@gmail.com',
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
        await sgMail.send(msg);
        console.log(`✅ Withdrawal notification sent to ${email}`);
        return { success: true };
    } catch (error) {
        console.error('Error sending withdrawal notification:', error);
        if (error.response) {
            console.error('SendGrid Error:', error.response.body);
        }
        return { success: false, error: error.message };
    }
};

module.exports = {
    sendVerificationEmail,
    sendWithdrawalNotification
};


