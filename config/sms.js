const twilio = require('twilio');
require('dotenv').config();

// Initialize Twilio client (only if credentials are provided)
let twilioClient = null;

if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
    twilioClient = twilio(
        process.env.TWILIO_ACCOUNT_SID,
        process.env.TWILIO_AUTH_TOKEN
    );
    console.log('✅ Twilio SMS service initialized');
} else {
    console.log('⚠️  Twilio credentials not configured - SMS verification disabled');
}

// Send SMS verification code
const sendSMSVerification = async (phoneNumber, code) => {
    if (!twilioClient) {
        console.log('SMS sending skipped - Twilio not configured');
        return { success: false, error: 'SMS service not configured' };
    }

    try {
        await twilioClient.messages.create({
            body: `Your CryptoQuant verification code is: ${code}. This code will expire in 10 minutes.`,
            from: process.env.TWILIO_PHONE_NUMBER,
            to: phoneNumber
        });

        return { success: true };
    } catch (error) {
        console.error('Error sending SMS:', error);
        return { success: false, error: error.message };
    }
};

// Check if SMS is configured
const isSMSConfigured = () => {
    return !!twilioClient;
};

module.exports = {
    sendSMSVerification,
    isSMSConfigured
};


