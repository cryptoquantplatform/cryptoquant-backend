# DCPTG - Digital Crypto Professional Technology Group

A professional cryptocurrency investment platform with smart earning features and referral system.

## 🌟 Features

### Core Functionality
- **100% Crypto-Based**: All deposits and withdrawals in cryptocurrency (USDT, Bitcoin, Ethereum)
- **Daily Profit Clicks**: Earn 5-10% per click, up to 3-7 times daily based on your level
- **Level System**: Progress through levels by inviting friends and unlock higher earning rates
- **Referral System**: Build your team and earn passive commission on their activities
- **Secure Platform**: Modern security features and transparent operations

### Level System
| Level | Referrals Required | Daily Clicks | Earning Rate | Commission Bonus |
|-------|-------------------|--------------|--------------|------------------|
| Level 1 | 0 referrals | 3 clicks/day | 5-8% | 3% |
| Level 2 | 5 referrals | 5 clicks/day | 6-9% | 4% |
| Level 3 | 10 referrals | 7 clicks/day | 7-10% | 5% |

## 📁 Project Structure

```
├── index.html              # Landing page
├── login.html              # Login page
├── register.html           # Registration page with referral code input
├── dashboard.html          # Main dashboard with clicking system
├── deposit.html            # Crypto deposit page
├── withdraw.html           # Crypto withdrawal page
├── team.html              # Team/referral management
├── about.html             # About DCPTG platform
├── styles.css             # Landing page styles
├── auth-styles.css        # Authentication pages styles
├── dashboard-styles.css   # Dashboard styles
├── pages-styles.css       # Other pages styles
├── auth.js                # Authentication logic
├── dashboard.js           # Dashboard and clicking functionality
├── deposit.js             # Deposit page logic
├── withdraw.js            # Withdrawal page logic
├── team.js                # Team/referral logic
└── about.js               # About page interactions
```

## 🚀 Getting Started

### For Users

1. **Open the Website**: Open `index.html` in your web browser
2. **Register**: Click "Register" or "Get Started" to create an account
3. **Enter Referral Code** (Optional): If you were invited by someone, enter their referral code
4. **Login**: After registration, login with your credentials
5. **Deposit**: Make your first deposit (minimum 75€ in crypto)
6. **Start Earning**: Click the "Click to Earn" button to earn daily profits
7. **Invite Friends**: Share your referral link to build your team and unlock higher levels

### For Developers

This is a frontend-only demo application that uses localStorage for data persistence. To integrate with a real backend:

1. Replace localStorage calls with API endpoints
2. Implement proper authentication (JWT, OAuth, etc.)
3. Add blockchain transaction verification
4. Set up database for user data and transactions
5. Implement email verification system
6. Add 2FA security features

## 💰 How It Works

### Daily Clicking System
- Users can click a button 3-7 times per day (based on level)
- Each click generates 5-10% profit on their balance
- Earnings compound automatically
- Clicks reset daily at midnight

### Referral System
- Each user gets a unique referral code
- When someone registers with your code, they become your referral
- You earn 3-5% commission on their activities
- Invite 5 people → Level 2 (5 clicks/day, higher rates)
- Invite 10 people → Level 3 (7 clicks/day, maximum rates)

### Deposits & Withdrawals
- **Minimum Deposit**: 75€ (~75 USDT)
- **Supported Crypto**: USDT (TRC20), Bitcoin, Ethereum
- **Withdrawal Time**: 1-24 hours
- **Network Fee**: Paid by sender (deposits) or deducted (withdrawals)

## 🔒 Security Features

- Secure crypto wallet integration
- Transaction history tracking
- Email verification (to be implemented)
- 2FA support (to be implemented)
- All transactions on blockchain

## 📱 Responsive Design

The platform is fully responsive and works on:
- Desktop computers (optimized for 1200px+)
- Tablets (768px - 1024px)
- Mobile phones (320px - 767px)

## 🎨 Customization

### Changing Wallet Addresses

Edit the wallet addresses in `deposit.js`:

```javascript
const walletAddresses = {
    'usdt': 'YOUR_USDT_WALLET_ADDRESS',
    'btc': 'YOUR_BTC_WALLET_ADDRESS',
    'eth': 'YOUR_ETH_WALLET_ADDRESS'
};
```

### Changing Earning Rates

Edit the click logic in `dashboard.js`:

```javascript
const minPercent = 5 + (userData.level - 1);
const maxPercent = 8 + (userData.level - 1) * 2;
```

### Changing Level Requirements

Edit the level calculation in `dashboard.js`:

```javascript
function calculateLevel() {
    if (userData.referrals >= 10) {
        userData.level = 3;
        userData.maxClicks = 7;
        userData.bonusPercentage = 10;
    } else if (userData.referrals >= 5) {
        userData.level = 2;
        userData.maxClicks = 5;
        userData.bonusPercentage = 8;
    } else {
        userData.level = 1;
        userData.maxClicks = 3;
        userData.bonusPercentage = 5;
    }
}
```

## ⚠️ Important Notes

### Current Limitations (Demo Mode)
- Uses localStorage (data clears when cache is cleared)
- No actual blockchain integration
- No real payment processing
- No email verification
- No backend server

### For Production Use
To use this in production, you MUST:
1. Implement a secure backend server
2. Add real blockchain transaction verification
3. Set up proper database
4. Implement KYC/AML compliance
5. Add email/SMS verification
6. Implement proper security measures
7. Add transaction monitoring and fraud detection
8. Ensure legal compliance in your jurisdiction

## 📞 Support

For questions or support:
- Email: support@dcptg.com
- Telegram: @DCPTG_Official
- Available: 24/7

## 📄 License

This is a demonstration project. For commercial use, please ensure compliance with all relevant laws and regulations regarding cryptocurrency platforms in your jurisdiction.

---

**Disclaimer**: This is a demo application. Always consult with legal and financial advisors before launching any cryptocurrency platform. Ensure compliance with all applicable laws and regulations.


