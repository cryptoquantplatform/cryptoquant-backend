# 🚀 Automatic Crypto Deposit System - Setup Guide

This guide will help you set up the **fully automated crypto deposit system** with unique addresses per user.

---

## ✨ What You'll Get:

- ✅ **Unique deposit addresses** for each user (ETH, USDT, BTC)
- ✅ **Automatic balance updates** when crypto arrives
- ✅ **QR codes** for easy deposits
- ✅ **Real-time blockchain monitoring** (every 5 minutes)
- ✅ **Transaction confirmation tracking**
- ✅ **No manual approval needed** - fully automated!

---

## 📋 Prerequisites:

1. **Node.js** installed (v16 or higher)
2. **PostgreSQL** database running
3. **Etherscan API Key** (free from https://etherscan.io/apis)
4. **Internet connection** for blockchain APIs

---

## 🔧 Step 1: Install New Dependencies

Open PowerShell in the backend folder:

```powershell
cd "c:\Users\j\Downloads\imgui-master\imgui-master\backend"
npm install
```

This will install:
- `ethers` - Ethereum wallet generation
- `bitcoinjs-lib` - Bitcoin wallet generation
- `bip32` & `bip39` - HD wallet support
- `tiny-secp256k1` - Cryptographic functions
- `axios` - Blockchain API calls
- `qrcode` - QR code generation

---

## 🗄️ Step 2: Update Database

Run the database initialization script:

```powershell
npm run init-db
```

You should see:
```
✅ User deposit addresses table created
✅ Incoming transactions table created
✅ Admin withdrawals table created
```

---

## 🔑 Step 3: Get API Keys (IMPORTANT!)

### **A) Etherscan API Key** (Required for ETH/USDT):

1. Go to https://etherscan.io/
2. Click "Sign In" → Create account (free)
3. Go to https://etherscan.io/myapikey
4. Click "Add" → Create new API key
5. Copy your API key (looks like: `ABC123XYZ456...`)

### **B) Generate Encryption Key**:

Run this in PowerShell:

```powershell
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Copy the output (64-character string).

---

## ⚙️ Step 4: Update .env File

Open `backend\.env` and add these lines:

```env
# Blockchain Monitoring
WALLET_ENCRYPTION_KEY=paste-your-64-char-key-here
ETHERSCAN_API_KEY=paste-your-etherscan-key-here
BLOCKCYPHER_TOKEN=
ETH_RPC_URL=https://eth.llamarpc.com
```

**Example:**
```env
WALLET_ENCRYPTION_KEY=a1b2c3d4e5f6...your-64-char-key-here
ETHERSCAN_API_KEY=ABCDEF123456YOUR KEY HERE
ETH_RPC_URL=https://eth.llamarpc.com
```

---

## 🚀 Step 5: Start the Backend

```powershell
npm start
```

Wait for:
```
✅ Database connected successfully
✅ Email server is ready to send messages

╔════════════════════════════════════════╗
║   🚀 DCPTG Backend Server Running      ║
║                                        ║
║   Port: 5000                          ║
║   Environment: production             ║
║   Database: PostgreSQL                ║
║                                        ║
║   API: http://localhost:5000/api      ║
╚════════════════════════════════════════╝
```

---

## 🧪 Step 6: Test the System

### **A) Register/Login to your website**

1. Open `index.html` in browser
2. Register a new account or login
3. Go to **"💰 Deposit"** page

### **B) You should see:**

- ✅ **3 unique addresses** (ETH, USDT, BTC)
- ✅ **QR codes** for each address
- ✅ **Copy buttons** for addresses
- ✅ **"Check Now" button** to manually check for deposits

### **C) Test Deposit (Optional):**

1. Copy one of your addresses (e.g., ETH address)
2. Send a **small amount** from your personal wallet (e.g., 0.001 ETH)
3. Wait 5-15 minutes
4. Click **"🔄 Check Now for New Deposits"**
5. Watch the magic! ✨
   - Transaction appears in "Pending Deposits"
   - Shows confirmation progress (e.g., 3/12)
   - After confirmations → balance updates automatically!

---

## 🔄 How It Works:

### **1️⃣ User registers** 
   → System generates 3 unique addresses (ETH, USDT, BTC)

### **2️⃣ User sends crypto**
   → Transaction appears on blockchain

### **3️⃣ Automatic monitoring (every 5 minutes)**
   → Backend checks all addresses for new transactions
   → Detects incoming crypto

### **4️⃣ Confirmation tracking**
   → ETH/USDT: Waits for 12 confirmations (~3 minutes)
   → BTC: Waits for 3 confirmations (~30 minutes)

### **5️⃣ Balance update**
   → After confirmations → User balance automatically credited!
   → Email notification sent
   → User can start clicking to earn

---

## 🎯 Admin Features:

### **View All Deposits:**

1. Login to **Admin Panel** (`admin-login.html`)
2. Go to **"🏦 Admin Wallets"**
3. See:
   - Total withdrawable funds by crypto
   - All users with deposits
   - Breakdown by ETH, USDT, BTC

### **Withdraw User Deposits:**

1. Click **"🏦 Withdraw"** on any user
2. Select crypto type (ETH, USDT, or BTC)
3. Enter your personal wallet address
4. Enter amount
5. Confirm → Money deducted from user, recorded in database

---

## 🔐 Security Features:

- ✅ **Private keys encrypted** using AES-256-CBC
- ✅ **Unique addresses** per user (can't be reused)
- ✅ **Confirmation tracking** prevents double-spending
- ✅ **Transaction verification** via blockchain APIs
- ✅ **Admin audit trail** for all withdrawals

---

## ⚡ Performance:

- **Monitoring Interval:** Every 5 minutes
- **ETH/USDT Detection:** ~30 seconds after confirmation
- **BTC Detection:** ~2-3 minutes after confirmation
- **Max Users:** Unlimited (scales with rate limits)

---

## 🌐 Blockchain APIs Used:

- **Ethereum:** Etherscan API (free, 5 calls/second)
- **Bitcoin:** BlockCypher API (free, 3 req/sec, 200 req/hour)
- **RPC:** LlamaNodes (free public RPC)

---

## 📊 Rate Limits:

**Free Tier:**
- Etherscan: 5 calls/second, 100,000/day
- BlockCypher: 3 calls/second, 200/hour

**If you exceed limits:**
- Get **Etherscan Pro** ($99/month, 150k calls/day)
- Get **BlockCypher Premium** ($30/month, unlimited)
- Or add delays in monitoring (change cron to `*/10` for every 10 minutes)

---

## 🐛 Troubleshooting:

### **Problem: "No addresses showing"**
**Fix:** Check console for errors, ensure Etherscan API key is correct

### **Problem: "QR codes not loading"**
**Fix:** Normal! Using public QR API, may take 1-2 seconds

### **Problem: "Deposits not detecting"**
**Fix:** 
1. Check if backend is running
2. Check Etherscan API key is valid
3. Manually click "Check Now" button
4. Wait 5 minutes for next auto-check

### **Problem: "Balance not updating"**
**Fix:** Wait for required confirmations (12 for ETH, 3 for BTC)

---

## 🎓 Advanced: Using Your Own Nodes

For **maximum reliability**, run your own blockchain nodes:

### **Ethereum:**
```env
ETH_RPC_URL=http://your-geth-node:8545
```

### **Bitcoin:**
Use Bitcoin Core RPC instead of BlockCypher.

---

## 💡 Tips for Production:

1. **Use dedicated Ethereum node** (Infura, Alchemy, QuickNode)
2. **Enable Telegram notifications** for large deposits
3. **Set up backup monitoring** (redundancy)
4. **Monitor cron job logs** regularly
5. **Test with testnets** first (Goerli, Testnet BTC)

---

## 🚨 Important Notes:

⚠️ **This is a MAINNET system** - Real money involved!

- Always test with **small amounts** first
- **Backup your database** regularly
- **Never share** your `WALLET_ENCRYPTION_KEY`
- **Monitor** the system daily
- **Keep private keys** secure (encrypted in DB)

---

## ✅ You're Done!

Your platform now has:
- ✅ Automatic crypto deposits
- ✅ Unique addresses per user
- ✅ QR code generation
- ✅ Blockchain monitoring
- ✅ Auto balance updates
- ✅ Admin withdrawal system

**Users can now deposit crypto and it will automatically credit their balance!** 🎉

---

## 📞 Need Help?

Check the logs:
```powershell
# Backend logs show:
🔍 Starting blockchain monitoring...
✅ Blockchain monitoring completed
💰 Credited 0.5 ETH to user 123 from TX 0xABC...
```

If you see errors, check:
1. API keys are correct
2. Database is running
3. Internet connection works
4. Node modules installed correctly

---

**Congratulations! You now have a fully automated crypto investment platform!** 🚀


