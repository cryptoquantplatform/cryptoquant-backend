const crypto = require('crypto');

// Generate 6-digit verification code
const generateVerificationCode = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

// Generate unique referral code
const generateReferralCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 8; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
};

// Calculate user level based on referral count
const calculateUserLevel = (referralCount) => {
    if (referralCount >= parseInt(process.env.LEVEL_3_REFERRALS_REQUIRED || 10)) {
        return {
            level: 3,
            maxClicks: parseInt(process.env.LEVEL_3_CLICKS || 7),
            minPercent: parseFloat(process.env.LEVEL_3_MIN_PERCENT || 7),
            maxPercent: parseFloat(process.env.LEVEL_3_MAX_PERCENT || 10),
            commissionRate: 5
        };
    } else if (referralCount >= parseInt(process.env.LEVEL_2_REFERRALS_REQUIRED || 5)) {
        return {
            level: 2,
            maxClicks: parseInt(process.env.LEVEL_2_CLICKS || 5),
            minPercent: parseFloat(process.env.LEVEL_2_MIN_PERCENT || 6),
            maxPercent: parseFloat(process.env.LEVEL_2_MAX_PERCENT || 9),
            commissionRate: 4
        };
    } else {
        return {
            level: 1,
            maxClicks: parseInt(process.env.LEVEL_1_CLICKS || 3),
            minPercent: parseFloat(process.env.LEVEL_1_MIN_PERCENT || 5),
            maxPercent: parseFloat(process.env.LEVEL_1_MAX_PERCENT || 8),
            commissionRate: 3
        };
    }
};

// Calculate random earning percentage within level range
const calculateEarningPercentage = (minPercent, maxPercent) => {
    return (Math.random() * (maxPercent - minPercent) + minPercent) / 100;
};

// Validate email format
const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

// Validate crypto wallet address (basic validation)
const isValidWalletAddress = (address, crypto) => {
    if (!address) return false;
    
    switch (crypto.toLowerCase()) {
        case 'usdt':
            // TRC20 starts with T and is 34 characters
            return address.startsWith('T') && address.length === 34;
        case 'btc':
            // BTC starts with 1, 3, or bc1
            return /^(1|3|bc1)[a-zA-Z0-9]{25,62}$/.test(address);
        case 'eth':
            // ETH starts with 0x and is 42 characters
            return address.startsWith('0x') && address.length === 42;
        default:
            return false;
    }
};

// Format balance to 8 decimal places
const formatBalance = (balance) => {
    return parseFloat(parseFloat(balance).toFixed(8));
};

module.exports = {
    generateVerificationCode,
    generateReferralCode,
    calculateUserLevel,
    calculateEarningPercentage,
    isValidEmail,
    isValidWalletAddress,
    formatBalance
};



