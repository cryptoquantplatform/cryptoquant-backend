# 🚀 CryptoQuant Backend - Complete Documentation

A comprehensive Node.js backend for cryptocurrency quantification and deposit management platform with automated blockchain monitoring, referral system, and admin panel.

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [Architecture](#architecture)
- [Database Schema](#database-schema)
- [API Endpoints](#api-endpoints)
- [Blockchain Monitoring](#blockchain-monitoring)
- [Proxy System](#proxy-system)
- [Security](#security)
- [Setup & Installation](#setup--installation)
- [Deployment](#deployment)
- [Environment Variables](#environment-variables)
- [File Structure](#file-structure)
- [Admin Panel](#admin-panel)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)

---

## 🎯 Overview

CryptoQuant Backend is a production-ready RESTful API server that handles:
- User authentication and management
- Multi-cryptocurrency deposit tracking (BTC, ETH, USDT, SOL)
- Automated blockchain transaction monitoring
- Quantification system (earnings from ads)
- Multi-level referral system (5 levels)
- Withdrawal processing
- Admin dashboard with full control panel
- Email notifications via SendGrid
- Proxy rotation for API rate limit management

---

## ✨ Features

### 🔐 Authentication & User Management
- JWT-based authentication
- Secure password hashing (bcrypt)
- Email verification
- Password reset functionality
- Session management
- Rate limiting on auth endpoints

### 💰 Cryptocurrency Support
- **Bitcoin (BTC)** - Native blockchain
- **Ethereum (ETH)** - ERC-20
- **USDT** - Tether (ERC-20)
- **Solana (SOL)** - Native blockchain

### 📊 Blockchain Monitoring
- Real-time transaction monitoring
- Multi-address tracking per user
- Automatic confirmation counting
- Transaction deduplication
- Balance crediting after confirmations
- Support for multiple blockchain explorers

### 🎁 Referral System
- 5-level deep referral tree
- Automatic bonus distribution:
  - Level 1: 10% of deposit
  - Level 2: 5% of deposit
  - Level 3: 3% of deposit
  - Level 4: 2% of deposit
  - Level 5: 1% of deposit
- Real-time earnings tracking
- Referral link generation

### 💵 Quantification System
- Click-based earnings
- Configurable payout rates
- Daily earning limits
- Cooldown periods
- Earnings added to withdrawable balance

### 🏦 Withdrawal Management
- Manual admin approval required
- Multi-crypto withdrawal support
- Balance validation
- Transaction history tracking
- Only earnings are withdrawable (not deposits)

### 👨‍💼 Admin Panel
- User management (view, edit, delete)
- Deposit approval/rejection
- Withdrawal approval/rejection
- Wallet management
- Admin cashouts (withdraw user deposits)
- Statistics dashboard
- Settings management

### 🔒 Security Features
- Rate limiting (global, auth, admin)
- CORS protection
- Helmet.js security headers
- SQL injection prevention
- XSS protection
- CSRF tokens
- Password complexity requirements
- IP-based rate limiting
- Proxy trust configuration

### 🔄 Proxy Rotation
- Automatic free proxy rotation
- Manual proxy configuration support
- API rate limit bypass
- 30-minute auto-refresh
- Fallback to direct connection

---

## 🛠️ Technology Stack

### Core
- **Node.js** (v18+)
- **Express.js** (v4.18.2) - Web framework
- **PostgreSQL** (v14+) - Database

### Authentication & Security
- **jsonwebtoken** (v9.0.2) - JWT tokens
- **bcryptjs** (v2.4.3) - Password hashing
- **express-rate-limit** (v7.1.5) - Rate limiting
- **helmet** (v7.1.0) - Security headers
- **cors** (v2.8.5) - CORS handling

### Blockchain
- **ethers** (v6.9.2) - Ethereum/USDT interaction
- **axios** (v1.6.5) - HTTP requests to blockchain APIs
- **https-proxy-agent** (v7.0.2) - Proxy support

### Email
- **@sendgrid/mail** (v8.1.0) - SendGrid integration
- **nodemailer** (v6.9.7) - Email transport (alternative)

### Utilities
- **dotenv** (v16.3.1) - Environment variables
- **cron** (v3.1.6) - Scheduled tasks
- **moment** (v2.30.1) - Date/time handling

---

## 🏗️ Architecture

### System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend (HTML/JS)                    │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐      │
│  │Dashboard │ │ Deposit  │ │Withdraw  │ │  Admin   │      │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘      │
└─────────────────────────────────────────────────────────────┘
                           │ HTTPS/REST API
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                    Express.js Backend                        │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ Security Middleware (Helmet, CORS, Rate Limiting)    │  │
│  └──────────────────────────────────────────────────────┘  │
│                           │                                  │
│  ┌────────────┐ ┌─────────────┐ ┌──────────────────────┐  │
│  │Auth Routes │ │ User Routes │ │ Admin Routes         │  │
│  └────────────┘ └─────────────┘ └──────────────────────┘  │
│                           │                                  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              Controllers Layer                        │  │
│  │  • authController    • transactionController          │  │
│  │  • dashboardController • adminController              │  │
│  └──────────────────────────────────────────────────────┘  │
│                           │                                  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              Services Layer                           │  │
│  │  • blockchainMonitor  • freeProxyManager              │  │
│  │  • emailService       • walletService                 │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                           │
        ┌──────────────────┼──────────────────┐
        ▼                  ▼                  ▼
┌─────────────┐  ┌──────────────────┐  ┌──────────────┐
│ PostgreSQL  │  │ Blockchain APIs  │  │   SendGrid   │
│  Database   │  │ (ETH,BTC,SOL)    │  │    Email     │
└─────────────┘  └──────────────────┘  └──────────────┘
```

### Request Flow

```
1. Client Request → Express Middleware Stack
   │
   ├─→ Security Headers (Helmet)
   ├─→ CORS Validation
   ├─→ Rate Limiting
   ├─→ Body Parser
   ├─→ JWT Verification (if protected route)
   │
2. Route Handler → Controller
   │
   ├─→ Input Validation
   ├─→ Business Logic
   │
3. Service Layer
   │
   ├─→ Database Queries
   ├─→ External API Calls
   ├─→ Blockchain Interactions
   │
4. Response → Client
   │
   └─→ JSON Response with status code
```

---

## 💾 Database Schema

### Users Table
```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    balance DECIMAL(20, 8) DEFAULT 0,
    total_earnings DECIMAL(20, 8) DEFAULT 0,  -- Quantification + Referrals
    referral_code VARCHAR(50) UNIQUE,
    referred_by INTEGER REFERENCES users(id),
    email_verified BOOLEAN DEFAULT FALSE,
    verification_token VARCHAR(255),
    reset_token VARCHAR(255),
    reset_token_expires TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP
);
```

### Deposit Addresses Table
```sql
CREATE TABLE deposit_addresses (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    crypto VARCHAR(10) NOT NULL,  -- BTC, ETH, USDT, SOL
    address VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, crypto)
);
```

### Incoming Transactions Table
```sql
CREATE TABLE incoming_transactions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    address VARCHAR(255) NOT NULL,
    crypto VARCHAR(10) NOT NULL,
    tx_hash VARCHAR(255) UNIQUE NOT NULL,
    amount DECIMAL(20, 8) NOT NULL,
    usd_value DECIMAL(20, 2),
    confirmations INTEGER DEFAULT 0,
    status VARCHAR(20) DEFAULT 'pending',  -- pending, confirmed
    credited BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    confirmed_at TIMESTAMP
);
```

### Deposits Table
```sql
CREATE TABLE deposits (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    crypto VARCHAR(10) NOT NULL,
    amount DECIMAL(20, 8) NOT NULL,
    usd_amount DECIMAL(20, 2),
    address VARCHAR(255),
    tx_hash VARCHAR(255),
    status VARCHAR(20) DEFAULT 'pending',  -- pending, approved, rejected
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    processed_at TIMESTAMP
);
```

### Withdrawals Table
```sql
CREATE TABLE withdrawals (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    crypto VARCHAR(10) NOT NULL,
    amount DECIMAL(20, 8) NOT NULL,
    usd_amount DECIMAL(20, 2),
    address VARCHAR(255) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending',  -- pending, approved, rejected, completed
    tx_hash VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    processed_at TIMESTAMP
);
```

### Quantifications Table
```sql
CREATE TABLE quantifications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    clicks INTEGER DEFAULT 0,
    earnings DECIMAL(20, 8) DEFAULT 0,
    last_click TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Referral Earnings Table
```sql
CREATE TABLE referral_earnings (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    from_user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    level INTEGER,  -- 1-5
    amount DECIMAL(20, 8),
    deposit_amount DECIMAL(20, 8),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Settings Table
```sql
CREATE TABLE settings (
    key VARCHAR(255) PRIMARY KEY,
    value TEXT,
    description TEXT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Admin Cashouts Table
```sql
CREATE TABLE admin_cashouts (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    crypto VARCHAR(10) NOT NULL,
    amount DECIMAL(20, 8) NOT NULL,
    usd_amount DECIMAL(20, 2),
    address VARCHAR(255) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending',  -- pending, completed
    tx_hash VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    processed_at TIMESTAMP
);
```

---

## 🌐 API Endpoints

### Authentication (`/api/auth`)

#### POST `/api/auth/register`
Register new user
```json
Request:
{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "SecurePass123!",
  "referralCode": "ABC123" // optional
}

Response:
{
  "success": true,
  "message": "Registration successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "username": "john_doe",
    "email": "john@example.com",
    "referralCode": "XYZ789"
  }
}
```

#### POST `/api/auth/login`
User login
```json
Request:
{
  "email": "john@example.com",
  "password": "SecurePass123!"
}

Response:
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "username": "john_doe",
    "email": "john@example.com"
  }
}
```

#### POST `/api/auth/forgot-password`
Request password reset
```json
Request:
{
  "email": "john@example.com"
}

Response:
{
  "success": true,
  "message": "Password reset email sent"
}
```

#### POST `/api/auth/reset-password`
Reset password with token
```json
Request:
{
  "token": "reset-token-from-email",
  "newPassword": "NewSecurePass123!"
}

Response:
{
  "success": true,
  "message": "Password reset successful"
}
```

### Dashboard (`/api/dashboard`)

#### GET `/api/dashboard/stats`
Get user dashboard statistics
```json
Headers: { "Authorization": "Bearer <token>" }

Response:
{
  "success": true,
  "balance": "125.50",
  "totalEarnings": "45.30",
  "availableBalance": "45.30",  // Only earnings withdrawable
  "todayEarnings": "5.20"
}
```

#### GET `/api/dashboard`
Get complete dashboard data
```json
Headers: { "Authorization": "Bearer <token>" }

Response:
{
  "success": true,
  "user": { ... },
  "stats": { ... },
  "recentTransactions": [ ... ],
  "referrals": {
    "count": 10,
    "earnings": "25.50"
  }
}
```

### Transactions (`/api/transactions`)

#### GET `/api/transactions/deposit-info`
Get deposit addresses and info
```json
Headers: { "Authorization": "Bearer <token>" }

Response:
{
  "success": true,
  "addresses": {
    "BTC": "1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa",
    "ETH": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
    "USDT": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
    "SOL": "DYw8jCTfwHNRJhhmFcbXvVDTqWMEVFBX6ZKUmG5CNSKK"
  },
  "minDeposit": 0,
  "confirmations": {
    "BTC": 3,
    "ETH": 12,
    "USDT": 12,
    "SOL": 1
  }
}
```

#### POST `/api/transactions/deposit`
Create manual deposit request
```json
Request:
{
  "crypto": "BTC",
  "amount": 0.01,
  "txHash": "abc123...",
  "address": "1A1zP1eP5QGefi..."
}

Response:
{
  "success": true,
  "message": "Deposit request submitted",
  "deposit": { ... }
}
```

#### POST `/api/transactions/withdraw`
Request withdrawal
```json
Request:
{
  "crypto": "BTC",
  "amount": 0.005,
  "address": "1A1zP1eP5QGefi..."
}

Response:
{
  "success": true,
  "message": "Withdrawal request submitted",
  "withdrawal": { ... }
}
```

#### GET `/api/transactions/history`
Get transaction history
```json
Headers: { "Authorization": "Bearer <token>" }
Query: ?type=deposits&limit=50

Response:
{
  "success": true,
  "transactions": [
    {
      "id": 1,
      "type": "deposit",
      "crypto": "BTC",
      "amount": "0.01",
      "status": "confirmed",
      "created_at": "2024-01-15T10:30:00Z"
    }
  ]
}
```

### Quantification (`/api/quantification`)

#### POST `/api/quantification/click`
Record quantification click
```json
Headers: { "Authorization": "Bearer <token>" }

Response:
{
  "success": true,
  "earned": "0.50",
  "totalEarnings": "45.80",
  "clicks": 92
}
```

#### GET `/api/quantification/stats`
Get quantification statistics
```json
Headers: { "Authorization": "Bearer <token>" }

Response:
{
  "success": true,
  "totalClicks": 92,
  "totalEarnings": "45.80",
  "todayClicks": 5,
  "todayEarnings": "2.50",
  "canClick": true,
  "cooldownRemaining": 0
}
```

### Referrals (`/api/referrals`)

#### GET `/api/referrals`
Get referral information
```json
Headers: { "Authorization": "Bearer <token>" }

Response:
{
  "success": true,
  "referralCode": "ABC123",
  "referralLink": "https://cryptoquant.com/register?ref=ABC123",
  "referrals": [
    {
      "username": "referred_user_1",
      "level": 1,
      "earnings": "5.00",
      "joined": "2024-01-10T12:00:00Z"
    }
  ],
  "totalReferrals": 10,
  "totalEarnings": "25.50"
}
```

### Admin (`/api/admin`)

#### POST `/api/admin/login`
Admin login
```json
Request:
{
  "username": "admin",
  "password": "admin_password"
}

Response:
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "admin": {
    "username": "admin"
  }
}
```

#### GET `/api/admin/users`
Get all users
```json
Headers: { "Authorization": "Bearer <admin_token>" }

Response:
{
  "success": true,
  "users": [
    {
      "id": 1,
      "username": "john_doe",
      "email": "john@example.com",
      "balance": "125.50",
      "total_earnings": "45.30",
      "created_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

#### GET `/api/admin/deposits`
Get all deposits
```json
Headers: { "Authorization": "Bearer <admin_token>" }
Query: ?status=pending

Response:
{
  "success": true,
  "deposits": [ ... ]
}
```

#### POST `/api/admin/deposits/:id/approve`
Approve deposit
```json
Headers: { "Authorization": "Bearer <admin_token>" }

Response:
{
  "success": true,
  "message": "Deposit approved"
}
```

#### POST `/api/admin/deposits/:id/reject`
Reject deposit
```json
Headers: { "Authorization": "Bearer <admin_token>" }
Request:
{
  "reason": "Invalid transaction hash"
}

Response:
{
  "success": true,
  "message": "Deposit rejected"
}
```

#### GET `/api/admin/withdrawals`
Get all withdrawals
```json
Headers: { "Authorization": "Bearer <admin_token>" }

Response:
{
  "success": true,
  "withdrawals": [ ... ]
}
```

#### POST `/api/admin/withdrawals/:id/approve`
Approve withdrawal
```json
Headers: { "Authorization": "Bearer <admin_token>" }
Request:
{
  "txHash": "0xabc123..."
}

Response:
{
  "success": true,
  "message": "Withdrawal approved"
}
```

#### GET `/api/admin/wallets/summary`
Get wallet summary
```json
Headers: { "Authorization": "Bearer <admin_token>" }

Response:
{
  "success": true,
  "totalBalance": "15000.00",
  "totalDeposits": "50000.00",
  "totalWithdrawals": "35000.00",
  "pendingWithdrawals": "500.00",
  "usersWithDepositsCount": 45,
  "usersWithDepositsList": [ ... ]
}
```

#### POST `/api/admin/wallets/cashout`
Admin cashout (withdraw user deposits)
```json
Headers: { "Authorization": "Bearer <admin_token>" }
Request:
{
  "userId": 1,
  "crypto": "BTC",
  "amount": 0.01,
  "address": "admin_btc_address"
}

Response:
{
  "success": true,
  "message": "Cashout processed",
  "cashout": { ... }
}
```

#### GET `/api/admin/settings`
Get system settings
```json
Headers: { "Authorization": "Bearer <admin_token>" }

Response:
{
  "success": true,
  "settings": {
    "min_deposit": "0",
    "min_withdrawal": "0",
    "quantification_rate": "0.50",
    "referral_level_1": "10",
    "referral_level_2": "5"
  }
}
```

#### PUT `/api/admin/settings`
Update settings
```json
Headers: { "Authorization": "Bearer <admin_token>" }
Request:
{
  "key": "min_deposit",
  "value": "10"
}

Response:
{
  "success": true,
  "message": "Setting updated"
}
```

---

## ⛓️ Blockchain Monitoring

### How It Works

The blockchain monitoring system runs continuously in the background:

```javascript
// Monitoring cycle (every 30-60 seconds)
1. Fetch all user deposit addresses from database
2. For each cryptocurrency:
   - Query blockchain API for new transactions
   - Check confirmations
   - Update database
   - Credit user balance when confirmed
   - Distribute referral bonuses
3. Handle rate limits with proxy rotation
4. Log all activities
```

### Supported Blockchains

#### Bitcoin (BTC)
- **API:** BlockCypher
- **Confirmations Required:** 3
- **Check Interval:** 60 seconds
- **Minimum Amount:** Any (no minimum)

#### Ethereum (ETH)
- **API:** Etherscan + Ethers.js RPC
- **Confirmations Required:** 12
- **Check Interval:** 30 seconds
- **Minimum Amount:** Any (no minimum)

#### USDT (Tether)
- **Network:** Ethereum (ERC-20)
- **API:** Etherscan
- **Confirmations Required:** 12
- **Check Interval:** 30 seconds
- **Minimum Amount:** Any (no minimum)

#### Solana (SOL)
- **API:** Solana RPC
- **Confirmations Required:** 1
- **Check Interval:** 45 seconds
- **Minimum Amount:** Any (no minimum)

### Transaction Flow

```
1. User deposits crypto to their unique address
   │
2. Blockchain Monitor detects transaction
   │
   ├─→ Creates incoming_transaction record (status: pending)
   │
3. Monitor checks confirmations on each cycle
   │
   ├─→ Updates confirmation count
   │
4. When confirmations >= required:
   │
   ├─→ Credits user balance
   ├─→ Updates total_earnings
   ├─→ Distributes referral bonuses (5 levels)
   ├─→ Marks transaction as confirmed
   │
5. User can now withdraw earnings
```

### Rate Limit Handling

```javascript
// Built-in delays
ETH: 2000ms between checks
USDT: 2000ms between checks
BTC: 5000ms between checks
SOL: 3000ms between checks

// Rate limit backoff
If 429 error detected:
- Stop checking for 5 minutes
- Log the backoff
- Resume after cooldown
```

### Proxy Integration

```javascript
// Every API request uses proxy rotation:
1. getAxiosConfig() is called
2. If PROXY_LIST configured → use paid proxies
3. Else if USE_FREE_PROXIES → use free proxies
4. Else → direct connection
5. Proxy rotates on each request
```

---

## 🔄 Proxy System

### Overview

The backend includes two proxy systems:

1. **Paid Proxy System** - Manual configuration via `PROXY_LIST`
2. **Free Proxy System** - Automatic free proxy fetching & rotation

### Free Proxy Manager

#### Features
- Fetches proxies from 3 sources (ProxyScrape, Geonode, Free-Proxy-List)
- Tests proxies automatically
- Keeps only working proxies (~10)
- Auto-refreshes every 30 minutes
- Falls back to direct connection if no proxies available

#### Sources
```javascript
1. ProxyScrape API
   - URL: api.proxyscrape.com
   - Type: HTTP/HTTPS
   - Average: 200+ proxies

2. Geonode API  
   - URL: proxylist.geonode.com
   - Type: HTTP/HTTPS
   - Average: 100+ proxies

3. Free-Proxy-List
   - URL: proxy-list.download
   - Type: HTTP
   - Average: 150+ proxies
```

#### Proxy Testing
```javascript
// Each proxy is tested with:
- Timeout: 5 seconds
- Test URL: api.ipify.org
- Success criteria: Returns valid IP

// Stops after finding 10 working proxies
```

#### Usage
```javascript
// Automatically used when:
- PROXY_LIST is not configured
- OR USE_FREE_PROXIES=true

// Get proxy config:
const config = freeProxyManager.getAxiosConfig(timeout);

// Check proxy count:
const count = freeProxyManager.getProxyCount();
```

### Paid Proxy Configuration

```bash
# In Render environment variables:
PROXY_LIST=http://user:pass@proxy1.com:80,http://user:pass@proxy2.com:80
```

### Priority
```
1. Paid proxies (PROXY_LIST) - if configured
2. Free proxies (automatic) - if no PROXY_LIST
3. Direct connection - if no proxies available
```

---

## 🔒 Security

### Authentication
- **JWT Tokens** with 7-day expiration
- **bcrypt** password hashing (10 rounds)
- Password requirements:
  - Minimum 8 characters
  - At least 1 uppercase
  - At least 1 lowercase
  - At least 1 number
  - At least 1 special character

### Rate Limiting

```javascript
// Global rate limit
- 100 requests per 15 minutes per IP

// Auth endpoints
- 5 requests per 15 minutes per IP (login, register)

// Admin endpoints
- 20 requests per 15 minutes per IP

// Password reset
- 3 requests per hour per IP
```

### Security Headers (Helmet.js)
```javascript
- X-DNS-Prefetch-Control: off
- X-Frame-Options: SAMEORIGIN
- Strict-Transport-Security: max-age=15552000
- X-Download-Options: noopen
- X-Content-Type-Options: nosniff
- X-XSS-Protection: 0
```

### CORS Configuration
```javascript
// Allowed origins from FRONTEND_URL
// Supports multiple domains separated by comma
// Credentials: true (for cookies)
```

### SQL Injection Prevention
- All queries use **parameterized statements**
- PostgreSQL `pg` library with prepared statements
- No string concatenation in queries

### XSS Protection
- Input sanitization
- HTML encoding
- Content Security Policy headers

---

## 🚀 Setup & Installation

### Prerequisites
- **Node.js** v18 or higher
- **PostgreSQL** v14 or higher
- **Git**
- **SendGrid Account** (for emails)

### Local Development Setup

#### 1. Clone Repository
```bash
git clone https://github.com/yourusername/cryptoquant-backend.git
cd cryptoquant-backend
```

#### 2. Install Dependencies
```bash
npm install
```

#### 3. Setup PostgreSQL Database
```bash
# Create database
createdb cryptoquant

# Or using psql:
psql -U postgres
CREATE DATABASE cryptoquant;
\q
```

#### 4. Initialize Database Schema
```bash
node scripts/initDatabase.js
```

This creates all tables and inserts default settings.

#### 5. Configure Environment Variables
```bash
cp .env.example .env
```

Edit `.env`:
```env
# Database
DATABASE_URL=postgresql://username:password@localhost:5432/cryptoquant

# Server
NODE_ENV=development
PORT=3000

# JWT
JWT_SECRET=your_super_secret_key_minimum_32_characters_long

# SendGrid Email
SENDGRID_API_KEY=SG.your_sendgrid_api_key
EMAIL_FROM=noreply@yourdomain.com

# Admin Credentials
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your_secure_admin_password

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:8080

# Optional: Blockchain API Keys
ETHERSCAN_API_KEY=your_etherscan_key
BLOCKCYPHER_TOKEN=your_blockcypher_token

# Optional: Proxy (leave empty to use free proxies)
PROXY_LIST=
USE_FREE_PROXIES=true
```

#### 6. Start Development Server
```bash
npm run dev
```

Server starts on `http://localhost:3000`

#### 7. Test API
```bash
curl http://localhost:3000/api/health

# Should return:
{"status":"ok","timestamp":"2024-01-15T10:30:00.000Z"}
```

---

## 📦 Deployment

### Render.com Deployment (Recommended)

#### 1. Create PostgreSQL Database
1. Go to Render Dashboard
2. Click "New" → "PostgreSQL"
3. Name: `cryptoquant-db`
4. Plan: Free or Starter
5. Create Database
6. **Copy External Database URL**

#### 2. Create Web Service
1. Click "New" → "Web Service"
2. Connect your GitHub repository
3. Settings:
   - **Name:** cryptoquant-backend
   - **Environment:** Node
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Plan:** Free or Starter

#### 3. Add Environment Variables
In Render Dashboard → Your Service → Environment:

```
DATABASE_URL=postgresql://user:pass@oregon-postgres.render.com:5432/dbname
NODE_ENV=production
PORT=10000
JWT_SECRET=[generate with: openssl rand -base64 32]
SENDGRID_API_KEY=SG.your_key
EMAIL_FROM=noreply@yourdomain.com
ADMIN_USERNAME=admin
ADMIN_PASSWORD=[secure password]
FRONTEND_URL=https://your-frontend-domain.com
USE_FREE_PROXIES=true
```

#### 4. Deploy
1. Click "Manual Deploy" → "Deploy latest commit"
2. Wait 3-5 minutes for build
3. Check logs for:
   ```
   ✅ Database connected successfully
   ✅ Server running on port 10000
   🆓 Free proxy mode enabled
   ```

#### 5. Initialize Database
```bash
# In Render Shell:
node scripts/initDatabase.js
```

#### 6. Test Deployment
```bash
curl https://your-app.onrender.com/api/health
```

### Environment-Specific Considerations

#### Production
- Use HTTPS only
- Enable rate limiting
- Use paid proxies for better reliability
- Set up monitoring (Sentry, LogRocket)
- Configure backups for PostgreSQL
- Use environment secrets management

#### Staging
- Separate database
- Lower rate limits for testing
- Free proxies acceptable
- Enable verbose logging

#### Development
- Local PostgreSQL
- No rate limiting
- Direct connection (no proxies)
- Debug mode enabled

---

## 🌍 Environment Variables

See `ENVIRONMENT_VARIABLES.md` for complete reference.

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@host:5432/db` |
| `NODE_ENV` | Environment mode | `production` |
| `PORT` | Server port | `10000` |
| `JWT_SECRET` | JWT signing secret (32+ chars) | `abc123...xyz789` |
| `SENDGRID_API_KEY` | SendGrid API key | `SG.abc123...` |
| `EMAIL_FROM` | Sender email address | `noreply@domain.com` |
| `ADMIN_USERNAME` | Admin panel username | `admin` |
| `ADMIN_PASSWORD` | Admin panel password | `secure_password` |
| `FRONTEND_URL` | Frontend domain (CORS) | `https://app.com` |

### Optional Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `USE_FREE_PROXIES` | Enable free proxy rotation | `true` |
| `PROXY_LIST` | Paid proxy list (comma-separated) | `` |
| `ETHERSCAN_API_KEY` | Etherscan API key | Public key |
| `BLOCKCYPHER_TOKEN` | BlockCypher token | `` |
| `SOLANA_RPC_URL` | Custom Solana RPC | `https://api.mainnet-beta.solana.com` |
| `ETH_RPC_URL` | Custom Ethereum RPC | `https://eth.llamarpc.com` |

---

## 📁 File Structure

```
cryptoquant-backend/
│
├── config/
│   ├── database.js          # PostgreSQL connection & retry logic
│   └── email.js             # SendGrid email configuration
│
├── controllers/
│   ├── authController.js           # Register, login, password reset
│   ├── dashboardController.js      # Dashboard stats & data
│   ├── transactionController.js    # Deposits & withdrawals
│   ├── quantificationController.js # Quantification clicks
│   ├── referralController.js       # Referral management
│   ├── adminController.js          # Admin user management
│   ├── adminDepositsController.js  # Admin deposit approval
│   ├── adminWithdrawalsController.js # Admin withdrawal approval
│   └── adminWalletsController.js   # Admin wallet & cashout management
│
├── middleware/
│   ├── auth.js              # JWT authentication middleware
│   └── security.js          # Rate limiting & security headers
│
├── routes/
│   ├── auth.js              # Auth routes (/api/auth)
│   ├── dashboard.js         # Dashboard routes (/api/dashboard)
│   ├── transactions.js      # Transaction routes (/api/transactions)
│   ├── quantification.js    # Quantification routes (/api/quantification)
│   ├── referrals.js         # Referral routes (/api/referrals)
│   └── admin.js             # Admin routes (/api/admin)
│
├── services/
│   ├── blockchainMonitor.js    # Blockchain monitoring service
│   ├── freeProxyManager.js     # Free proxy fetching & rotation
│   ├── emailService.js         # Email sending utilities
│   └── walletService.js        # Wallet address generation
│
├── scripts/
│   ├── initDatabase.js         # Database schema initialization
│   └── updateMinimumLimits.js  # Update deposit/withdrawal limits
│
├── docs/
│   ├── ENVIRONMENT_VARIABLES.md    # Environment variables guide
│   ├── PROXY_SETUP.md              # Paid proxy setup guide
│   ├── FREE_PROXIES_GUIDE.md       # Free proxy guide
│   └── DEPLOYMENT_TROUBLESHOOTING.md # Deployment help
│
├── .env.example             # Example environment variables
├── .gitignore              # Git ignore rules
├── package.json            # NPM dependencies & scripts
├── server.js               # Main server entry point
└── README.md               # This file
```

---

## 👨‍💼 Admin Panel

### Features

#### User Management
- View all users
- Edit user balances
- Delete users
- View user transaction history
- View user referrals

#### Deposit Management
- View all deposits (pending, approved, rejected)
- Approve deposits (credits user balance + referral bonuses)
- Reject deposits with reason
- View deposit details (tx hash, amount, confirmations)

#### Withdrawal Management
- View all withdrawals (pending, approved, rejected)
- Approve withdrawals (requires tx hash)
- Reject withdrawals with reason
- View withdrawal requests by status

#### Wallet Management
- View total platform balances
- View users with deposits
- Admin cashout functionality:
  - Withdraw user deposits to admin wallet
  - Only affects user deposits (not earnings)
  - Creates cashout record
  - Deducts from user balance

#### Settings Management
- Update system settings:
  - Minimum deposit amount
  - Minimum withdrawal amount
  - Quantification rate
  - Referral bonus percentages
  - Cooldown periods

#### Statistics Dashboard
- Total users
- Active users (logged in last 30 days)
- Total deposits (USD)
- Total withdrawals (USD)
- Pending deposits/withdrawals
- Platform balance
- Today's earnings

### Access

**URL:** `https://your-frontend.com/admin-login.html`

**Credentials:**
- Username: from `ADMIN_USERNAME` env variable
- Password: from `ADMIN_PASSWORD` env variable

### Security
- Separate JWT token for admin
- Higher rate limits
- All admin routes require `adminAuth` middleware
- Admin token expires after 24 hours
- No registration - credentials set via environment

---

## 🐛 Troubleshooting

### Database Connection Issues

**Error:** `Error: connect ECONNREFUSED 127.0.0.1:5432`

**Solution:**
```bash
# Check if PostgreSQL is running
pg_isready

# Start PostgreSQL (Mac)
brew services start postgresql

# Start PostgreSQL (Linux)
sudo systemctl start postgresql

# Check connection string
echo $DATABASE_URL
```

**Error:** `password authentication failed for user`

**Solution:**
- Verify DATABASE_URL credentials
- Ensure database exists
- Check PostgreSQL pg_hba.conf settings

### Blockchain Monitoring Issues

**Error:** `429 Too Many Requests`

**Solution:**
```bash
# Enable free proxies
USE_FREE_PROXIES=true

# Or configure paid proxies
PROXY_LIST=http://user:pass@proxy1.com:80,http://user:pass@proxy2.com:80
```

**Error:** `No free proxies found`

**Solution:**
- This is normal - proxy sources are sometimes down
- System will retry in 30 minutes
- Use paid proxies for production

### Email Issues

**Error:** `Email sending failed`

**Solution:**
```bash
# Verify SendGrid API key
echo $SENDGRID_API_KEY

# Check sender is verified in SendGrid
# Settings → Sender Authentication

# Test email manually
node -e "
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);
sgMail.send({
  to: 'test@example.com',
  from: process.env.EMAIL_FROM,
  subject: 'Test',
  text: 'Test email'
}).then(() => console.log('✅ Email sent'))
  .catch(err => console.error('❌ Error:', err));
"
```

### Rate Limiting Issues

**Error:** `Too many requests from this IP`

**Solution:**
```javascript
// Temporarily increase limits in middleware/security.js
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000, // Increased from 100
  // ...
});
```

### JWT Token Issues

**Error:** `invalid token` or `jwt expired`

**Solution:**
```bash
# Verify JWT_SECRET is set
echo $JWT_SECRET

# Check token expiration in authController.js
# Default: 7 days

# Clear client-side localStorage
localStorage.removeItem('token');
```

### Deployment Issues

**Error:** `Bad Gateway` on Render

**Solution:**
```bash
# Check Render logs
# Verify DATABASE_URL is set
# Ensure PORT=10000
# Check all required environment variables
```

See `DEPLOYMENT_TROUBLESHOOTING.md` for more issues.

---

## 🤝 Contributing

### Development Workflow

1. **Fork the repository**
```bash
git clone https://github.com/yourusername/cryptoquant-backend.git
cd cryptoquant-backend
```

2. **Create feature branch**
```bash
git checkout -b feature/your-feature-name
```

3. **Make changes**
```bash
# Edit files
# Add tests if applicable
```

4. **Test changes**
```bash
npm test
npm run lint
```

5. **Commit changes**
```bash
git add .
git commit -m "feat: add new feature"
```

6. **Push & Create PR**
```bash
git push origin feature/your-feature-name
# Create pull request on GitHub
```

### Coding Standards

- **ESLint** for code linting
- **Prettier** for code formatting
- **Conventional Commits** for commit messages
- **JSDoc** comments for functions
- **Error handling** in all async functions
- **Input validation** for all user inputs

### Testing

```bash
# Run all tests
npm test

# Run specific test
npm test -- auth.test.js

# Run with coverage
npm run test:coverage
```

---

## 📄 License

This project is licensed under the **MIT License**.

---

## 📞 Support

### Documentation
- `ENVIRONMENT_VARIABLES.md` - Environment setup
- `PROXY_SETUP.md` - Proxy configuration
- `FREE_PROXIES_GUIDE.md` - Free proxy guide
- `DEPLOYMENT_TROUBLESHOOTING.md` - Deployment help

### Contact
- **Email:** support@cryptoquant.com
- **GitHub Issues:** https://github.com/yourusername/cryptoquant-backend/issues
- **Discord:** https://discord.gg/cryptoquant

---

## 🎉 Acknowledgments

- **Express.js** - Web framework
- **PostgreSQL** - Database
- **Ethers.js** - Ethereum/USDT integration
- **SendGrid** - Email service
- **Render.com** - Hosting platform
- **BlockCypher** - Bitcoin API
- **ProxyScrape** - Free proxy source

---

**Built with ❤️ for the crypto community**

**Version:** 1.0.0  
**Last Updated:** January 2024  
**Status:** Production Ready ✅
