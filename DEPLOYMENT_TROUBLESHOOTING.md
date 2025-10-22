# Deployment Troubleshooting Guide

This guide addresses the common errors you might encounter when deploying to Render.com or other cloud platforms.

## 🔴 Critical Issues from Your Deployment Logs

### 1. ❌ Database Password Authentication Failed (Error 28P01)

**Error Message:**
```
error: password authentication failed for user "..."
code: '28P01'
```

**Cause:**
- Incorrect DATABASE_URL in environment variables
- Database password expired or changed
- Database user doesn't have proper permissions
- Wrong database selected

**Fix on Render.com:**

1. **Check Database Connection String:**
   - Go to Render Dashboard → Your PostgreSQL Database
   - Click "Connect" → Copy the "External Database URL"
   - Go to your Web Service → Environment
   - Update `DATABASE_URL` with the correct connection string
   - Format: `postgresql://username:password@host:port/database`

2. **Verify Database Credentials:**
   ```
   - Username: Should match your database user
   - Password: Copy EXACTLY from Render (no extra spaces)
   - Host: Should be the external host (e.g., oregon-postgres.render.com)
   - Port: Usually 5432
   - Database name: Should match your database
   ```

3. **Common Mistakes:**
   - Using Internal Database URL instead of External
   - Extra spaces before/after password
   - Wrong database selected (if you have multiple)
   - Password changed but environment variable not updated

4. **Test Connection Manually:**
   ```bash
   # From Render Shell
   psql "postgresql://username:password@host:port/database"
   ```

**After Fixing:**
- Save environment variables
- Trigger a manual redeploy
- Check deployment logs for "✅ Database connected successfully"

---

### 2. ⚠️ Express Rate Limiter Trust Proxy Error

**Error Message:**
```
ValidationError: The 'X-Forwarded-For' header is set but the Express 'trust proxy' setting is false
```

**Cause:**
Rate limiters weren't configured to trust proxy headers from Render's load balancer.

**Status:** ✅ **FIXED** in the latest code update

The following files have been updated:
- `backend/middleware/security.js` - Added `trustProxy: true` to all rate limiters

**Verification:**
After redeploying, this error should no longer appear in logs.

---

### 3. 📧 Email SMTP Connection Timeout

**Error Message:**
```
❌ Email configuration error: Error: Connection timeout
code: 'ETIMEDOUT'
command: 'CONN'
```

**Cause:**
- SendGrid API key not configured
- Invalid SendGrid API key
- Network/firewall blocking SMTP

**Fix on Render.com:**

1. **Get SendGrid API Key:**
   - Go to [SendGrid](https://sendgrid.com)
   - Sign up or log in
   - Go to Settings → API Keys
   - Create new API key with "Full Access"
   - Copy the key (starts with `SG.`)

2. **Add to Environment Variables:**
   ```
   SENDGRID_API_KEY=SG.your_actual_api_key_here
   EMAIL_FROM=your-verified-email@domain.com
   ```

3. **Verify Email Sender:**
   - Go to SendGrid → Settings → Sender Authentication
   - Verify your domain OR single sender email
   - Use verified email in `EMAIL_FROM`

**Alternative: Use Gmail SMTP (Not Recommended for Production):**
```
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-specific-password
EMAIL_FROM=your-email@gmail.com
```

---

### 4. 🚫 Solana API Rate Limiting (429 Errors)

**Error Message:**
```
Error getting SOL transactions for [address]: Request failed with status code 429
```

**Cause:**
Solana public RPC endpoints have strict rate limits. Free tier allows very few requests.

**Status:** ✅ **IMPROVED** in the latest code update

**Changes Made:**
- Increased delay between Solana API calls from 1.5s to 3s
- Increased backoff period from 2 minutes to 5 minutes
- Added better error handling and timeout settings

**Long-term Solutions:**

1. **Use Paid Solana RPC Provider (Recommended):**
   - [Alchemy](https://www.alchemy.com/) - Free tier: 300M compute units/month
   - [QuickNode](https://www.quicknode.com/) - Free tier available
   - [Helius](https://www.helius.dev/) - Free tier: 100k credits/month

2. **Add to Environment Variables:**
   ```
   SOLANA_RPC_URL=https://your-provider-endpoint.com
   ```

3. **Update Code (if using custom RPC):**
   ```javascript
   // In backend/services/blockchainMonitor.js
   const SOLANA_RPC = process.env.SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com';
   ```

**Alternative:**
- Reduce monitoring frequency
- Monitor fewer Solana addresses
- Use webhooks instead of polling (advanced)

---

## 📝 Required Environment Variables Checklist

Make sure ALL of these are set in Render Dashboard → Environment:

```bash
# Database (CRITICAL)
DATABASE_URL=postgresql://username:password@host:port/database

# Server
NODE_ENV=production
PORT=10000
FRONTEND_URL=https://your-frontend-domain.com

# Email (SendGrid)
SENDGRID_API_KEY=SG.your_api_key_here
EMAIL_FROM=noreply@yourdomain.com

# JWT
JWT_SECRET=your_very_long_random_secret_key_here

# Admin
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your_secure_admin_password

# API Keys (Optional but Recommended)
ETHERSCAN_API_KEY=your_etherscan_key
BLOCKCYPHER_TOKEN=your_blockcypher_token
SOLANA_RPC_URL=https://your-solana-rpc-endpoint

# Crypto RPC (Optional)
ETH_RPC_URL=https://eth.llamarpc.com
```

---

## 🚀 Deployment Steps

1. **Fix Database Connection:**
   - Copy correct DATABASE_URL from your PostgreSQL database
   - Update in Web Service environment variables
   - Save changes

2. **Add Email Configuration:**
   - Get SendGrid API key
   - Add SENDGRID_API_KEY and EMAIL_FROM
   - Save changes

3. **Deploy Updated Code:**
   ```bash
   git add .
   git commit -m "Fix deployment issues - trust proxy, rate limits, db config"
   git push
   ```

4. **Verify Deployment:**
   - Wait for deployment to complete
   - Check logs for "✅ Database connected successfully"
   - Check logs - should NOT see rate limiter errors
   - Test API health endpoint: `https://your-app.onrender.com/api/health`

5. **Monitor for 24 Hours:**
   - Watch for any recurring errors
   - Check if Solana 429 errors reduced
   - Verify emails are sending
   - Test user registration and deposits

---

## 🔧 Testing Locally Before Deploy

```bash
# 1. Copy .env.example to .env
cp .env.example .env

# 2. Fill in your local database credentials
nano .env

# 3. Install dependencies
cd backend
npm install

# 4. Initialize database
npm run init-db

# 5. Start server
npm run dev

# 6. Test health endpoint
curl http://localhost:5000/api/health
```

---

## 📊 How to Read Deployment Logs

**Good Signs (✅):**
```
✅ Database connected successfully
✅ Email server is ready to send messages
🚀 DCPTG Backend Server Running
✅ Blockchain monitoring completed
```

**Warning Signs (⚠️):**
```
⚠️ Using fallback price for SOL
⏸️ Rate limit hit for SOL
⏳ Retrying in 5 seconds...
```

**Critical Errors (❌):**
```
❌ Database connection failed (code: 28P01)
❌ Email configuration error
❌ Unexpected database error
```

---

## 🆘 Emergency Fixes

### If Site is Down:

1. **Check Render Status:**
   - Render Dashboard → Check if service is "Live"
   - Check if there are any platform-wide issues

2. **View Recent Logs:**
   - Render Dashboard → Logs
   - Look for the most recent error

3. **Rollback:**
   - Render Dashboard → Manual Deploy
   - Select a previous successful commit
   - Deploy

### If Database is Inaccessible:

1. **Check Database Status:**
   - Render Dashboard → PostgreSQL Database
   - Verify it's running

2. **Reset Connection:**
   - Get new External Database URL
   - Update DATABASE_URL in Web Service
   - Redeploy

---

## 📞 Support

If issues persist:

1. **Check Render Status:** https://status.render.com
2. **Render Community:** https://community.render.com
3. **Contact Render Support:** support@render.com

---

## ✅ Summary of Fixes Applied

This deployment update includes:

- ✅ Fixed rate limiter trust proxy configuration
- ✅ Improved database connection with retry logic and better error messages
- ✅ Enhanced Solana API rate limit handling (3s delays + 5min backoff)
- ✅ Better email error logging
- ✅ Increased connection timeouts for better reliability

**Next Steps:**
1. Fix DATABASE_URL in Render environment variables
2. Add SENDGRID_API_KEY for email functionality
3. (Optional) Add paid Solana RPC endpoint to reduce 429 errors
4. Redeploy and monitor logs

