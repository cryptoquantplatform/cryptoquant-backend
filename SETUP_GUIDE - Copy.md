# 🚀 DCPTG Platform - Complete Setup Guide

## Overview

This is a **full-stack cryptocurrency investment platform** with:
- ✅ **Frontend**: HTML, CSS, JavaScript (responsive design)
- ✅ **Backend**: Node.js, Express, PostgreSQL
- ✅ **Features**: User authentication, email verification, crypto deposits/withdrawals, referral system, daily clicking earnings

---

## 📁 Project Structure

```
dcptg-platform/
├── frontend/              # HTML, CSS, JS files
│   ├── index.html        # Landing page
│   ├── login.html        # Login page
│   ├── register.html     # Registration
│   ├── dashboard.html    # Main dashboard
│   ├── deposit.html      # Deposits
│   ├── withdraw.html     # Withdrawals
│   ├── team.html         # Referrals
│   ├── about.html        # About page
│   └── *.js              # Frontend JavaScript
│
└── backend/              # Node.js backend
    ├── server.js         # Main server file
    ├── package.json      # Dependencies
    ├── config/           # Database & email config
    ├── controllers/      # API logic
    ├── middleware/       # Auth middleware
    ├── utils/            # Helper functions
    └── scripts/          # Database initialization

```

---

## 🎯 Quick Start (Local Development)

### 1. Install PostgreSQL

**Windows:**
1. Download from: https://www.postgresql.org/download/windows/
2. Install with default settings
3. Remember your password!

**Mac:**
```bash
brew install postgresql
brew services start postgresql
```

**Linux:**
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
```

### 2. Create Database

```bash
# Access PostgreSQL
psql -U postgres

# In PostgreSQL shell:
CREATE DATABASE dcptg_db;
CREATE USER dcptg_user WITH ENCRYPTED PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE dcptg_db TO dcptg_user;
\q
```

### 3. Set Up Backend

```bash
cd backend

# Install dependencies
npm install

# Copy environment file
copy .env.example .env    # Windows
# OR
cp .env.example .env      # Mac/Linux

# Edit .env file with your settings
# IMPORTANT: Update database password, JWT secret, email settings
```

### 4. Configure Email (Choose One)

**Option A: Gmail (Quick Test)**
1. Enable 2FA on your Google account
2. Generate App Password: https://myaccount.google.com/apppasswords
3. Update .env:
```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
```

**Option B: SendGrid (Recommended)**
1. Sign up: https://sendgrid.com (Free: 100 emails/day)
2. Get API key
3. Update .env:
```env
EMAIL_HOST=smtp.sendgrid.net
EMAIL_PORT=587
EMAIL_USER=apikey
EMAIL_PASSWORD=your_sendgrid_api_key
```

### 5. Initialize Database Tables

```bash
cd backend
npm run init-db
```

You should see:
```
✅ Users table created
✅ Verification codes table created
✅ Daily clicks table created
...
🎉 Database initialization completed successfully!
```

### 6. Start Backend Server

```bash
npm start
# OR for development (auto-restart):
npm run dev
```

You should see:
```
╔════════════════════════════════════════╗
║   🚀 DCPTG Backend Server Running      ║
║   Port: 5000                           ║
║   API: http://localhost:5000/api       ║
╚════════════════════════════════════════╝
```

### 7. Configure Frontend

Update the API URL in `frontend/config.js` (or create it):

```javascript
const API_URL = 'http://localhost:5000/api';
```

### 8. Run Frontend

Open `index.html` in your browser or use a simple server:

```bash
# Option 1: Direct open
# Just double-click index.html

# Option 2: Python server
cd frontend
python -m http.server 3000

# Option 3: Node server
npx http-server -p 3000
```

Visit: `http://localhost:3000`

---

## ✅ Testing the Platform

### 1. Register a New User

1. Go to Register page
2. Fill in details
3. Click "Send Verification Code"
4. Check your email for 6-digit code
5. Enter code and complete registration
6. You'll be auto-logged in!

### 2. Test Features

- **Dashboard**: View balance, click to earn
- **Deposit**: Get crypto address (you'll need to manually confirm in database for testing)
- **Withdraw**: Request withdrawal
- **Team**: Copy referral link, register another user with it
- **About**: Learn about the platform

### 3. Manual Deposit Confirmation (Testing Only)

Since real blockchain integration requires webhooks, manually confirm deposits:

```sql
-- Connect to database
psql -U dcptg_user -d dcptg_db

-- View pending deposits
SELECT * FROM deposits WHERE status = 'pending';

-- Confirm a deposit (replace ID and user_id)
BEGIN;
UPDATE deposits SET status = 'confirmed', confirmed_at = NOW() WHERE id = 1;
UPDATE users SET balance = balance + [amount] WHERE id = [user_id];
COMMIT;
```

---

## 🌍 Production Deployment

See `backend/DEPLOYMENT.md` for complete deployment guide.

**Quick summary:**
1. Get a VPS (DigitalOcean, AWS, etc.)
2. Install Node.js, PostgreSQL, Nginx
3. Upload code
4. Configure environment
5. Set up SSL with Let's Encrypt
6. Use PM2 for process management

**Estimated cost:** $6-15/month

---

## 🔐 Security Features

✅ **Password Hashing**: bcrypt with salt
✅ **JWT Authentication**: Secure token-based auth
✅ **Email Verification**: 6-digit codes with expiration
✅ **Rate Limiting**: Prevent brute force attacks
✅ **Helmet.js**: Security headers
✅ **SQL Injection Protection**: Parameterized queries
✅ **CORS**: Configured for your domain only

---

## 💰 Crypto Integration

### Current Setup

The platform is ready for crypto payments. You need to:

1. **Add Your Wallet Addresses** in `.env`:
```env
WALLET_USDT_TRC20=YourRealAddress
WALLET_BTC=YourRealAddress
WALLET_ETH=YourRealAddress
```

2. **Payment Verification Options**:

**Option A: Manual (Simple)**
- Users send crypto
- Admin confirms in database

**Option B: Payment Gateway (Recommended)**
- Use: Coinbase Commerce, NOWPayments, CoinGate
- Auto-confirms payments via webhooks

**Option C: Blockchain API (Advanced)**
- Monitor wallets directly
- Use Tron/Bitcoin/Ethereum APIs

### Adding Coinbase Commerce (Example)

1. Sign up: https://commerce.coinbase.com
2. Get API key
3. Add to `.env`:
```env
COINBASE_COMMERCE_API_KEY=your_key
```

4. Install SDK:
```bash
npm install coinbase-commerce-node
```

5. Update `transactionController.js` to create charges

---

## 📊 Database Schema

```
users
├── id (primary key)
├── full_name
├── email (unique)
├── password_hash
├── referral_code (unique)
├── referred_by
├── level
├── balance
├── total_earnings
└── created_at

daily_clicks
├── user_id (foreign key)
├── clicks_used
├── max_clicks
├── today_earnings
└── last_reset

referrals
├── referrer_id (foreign key)
├── referred_id (foreign key)
└── commission_earned

deposits
├── user_id (foreign key)
├── amount
├── crypto
├── status
└── created_at

withdrawals
├── user_id (foreign key)
├── amount
├── crypto
├── wallet_address
├── status
└── created_at
```

---

## 🔧 Configuration

### Environment Variables

All settings in `backend/.env`:

```env
# Server
PORT=5000
NODE_ENV=production

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=dcptg_db
DB_USER=dcptg_user
DB_PASSWORD=strong_password

# Security
JWT_SECRET=long_random_string
JWT_EXPIRE=7d

# Email
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your@email.com
EMAIL_PASSWORD=app_password

# Wallets
WALLET_USDT_TRC20=TYourAddress
WALLET_BTC=1YourAddress
WALLET_ETH=0xYourAddress

# Business Logic
MIN_DEPOSIT=75
WITHDRAWAL_FEE_USDT=1
LEVEL_1_CLICKS=3
LEVEL_2_CLICKS=5
LEVEL_3_CLICKS=7
LEVEL_2_REFERRALS_REQUIRED=5
LEVEL_3_REFERRALS_REQUIRED=10
```

---

## 🐛 Troubleshooting

### Backend won't start

```bash
# Check logs
npm start

# Common issues:
# 1. PostgreSQL not running
sudo systemctl start postgresql

# 2. Wrong database credentials
# Check .env file

# 3. Port already in use
# Change PORT in .env
```

### Email not sending

```bash
# Test email config
node -e "require('./config/email').sendVerificationEmail('test@test.com', '123456', 'Test')"
```

### Database connection error

```bash
# Test connection
psql -U dcptg_user -d dcptg_db -h localhost

# If fails, check:
# 1. PostgreSQL running
# 2. Database exists
# 3. User has permissions
```

---

## 📞 API Documentation

### Base URL
```
http://localhost:5000/api
```

### Endpoints

**Authentication:**
```
POST /auth/send-code         # Send verification email
POST /auth/register          # Register new user
POST /auth/login             # Login user
GET  /auth/me                # Get current user (auth required)
```

**Dashboard:**
```
GET  /dashboard              # Get dashboard data (auth required)
POST /dashboard/click        # Perform click to earn (auth required)
```

**Transactions:**
```
GET  /deposit/info/:crypto   # Get deposit address
POST /deposit                # Record deposit
GET  /deposit/history        # Deposit history
POST /withdrawal             # Create withdrawal
GET  /withdrawal/history     # Withdrawal history
```

**Team:**
```
GET  /team                   # Get team data
GET  /team/stats             # Get referral stats
```

---

## 📈 Next Steps

1. **Test Locally**: Register users, test all features
2. **Customize**: Update branding, colors, text
3. **Add Real Wallets**: Replace placeholder addresses
4. **Set Up Email**: Configure SendGrid or similar
5. **Deploy to Server**: Follow DEPLOYMENT.md
6. **Configure Domain**: Point to your server
7. **Set Up SSL**: Use Let's Encrypt
8. **Go Live!**: Start accepting users

---

## 💡 Tips

- **Backup Database**: Set up automatic backups from day 1
- **Monitor Logs**: Use PM2 for production
- **Test Payments**: Start with small amounts
- **KYC/AML**: Research legal requirements in your country
- **Customer Support**: Set up email/Telegram for support

---

## ⚖️ Legal Notice

**IMPORTANT**: Running a crypto investment platform requires legal compliance:

- Check regulations in your jurisdiction
- May need money transmitter license
- KYC/AML requirements
- Tax reporting obligations
- Terms of service
- Privacy policy
- Consult with a lawyer!

This software is provided as-is for educational purposes.

---

## 🎉 You're Ready!

Your platform is now fully functional and ready to deploy. Good luck with your crypto platform! 🚀

For questions or issues, check the code comments or create detailed logs.


