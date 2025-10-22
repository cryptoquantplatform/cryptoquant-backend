# Environment Variables Reference

## Required Environment Variables

Copy these to your Render.com Dashboard → Environment tab:

### Critical (App Won't Work Without These)

```bash
# Database - MUST use EXTERNAL Database URL from Render PostgreSQL
DATABASE_URL=postgresql://username:password@host:port/database

# Server Configuration
NODE_ENV=production
PORT=10000

# JWT Secret (generate with: openssl rand -base64 32)
JWT_SECRET=your_very_long_random_secret_key_minimum_32_characters

# Email (SendGrid)
SENDGRID_API_KEY=SG.your_actual_sendgrid_api_key_here
EMAIL_FROM=noreply@yourdomain.com

# Admin Credentials
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your_secure_admin_password_here

# Frontend URL (for CORS)
FRONTEND_URL=https://your-frontend-domain.com
```

---

## Optional (Recommended for Better Performance)

```bash
# Blockchain API Keys
ETHERSCAN_API_KEY=your_etherscan_api_key
BLOCKCYPHER_TOKEN=your_blockcypher_token
SOLANA_RPC_URL=https://your-premium-solana-endpoint.com
ETH_RPC_URL=https://eth.llamarpc.com

# Proxy Rotation (to avoid 429 rate limit errors)
PROXY_LIST=http://user:pass@proxy1.example.com:8080,http://user:pass@proxy2.example.com:8080
```

---

## How to Set Each Variable

### DATABASE_URL
**Where to get it:**
1. Render Dashboard → PostgreSQL Database
2. Click "Info" or "Connect"
3. Copy "External Database URL" (NOT Internal!)
4. Format: `postgresql://user:pass@oregon-postgres.render.com:5432/dbname`

**Common Mistakes:**
- ❌ Using Internal URL (has "dpg-internal")
- ❌ Using shortened format without password
- ❌ Extra spaces or quotes

### SENDGRID_API_KEY
**Where to get it:**
1. Sign up at https://sendgrid.com/
2. Go to Settings → API Keys
3. Create API Key → Full Access
4. Copy the key (starts with `SG.`)

**Format:** `SG.abc123...xyz789` (about 69 characters)

### EMAIL_FROM
**Must be verified in SendGrid:**
1. SendGrid → Settings → Sender Authentication
2. Either verify your domain OR single sender email
3. Use the verified email here

**Examples:**
- `noreply@yourdomain.com`
- `support@yourdomain.com`
- `notifications@yourdomain.com`

### JWT_SECRET
**How to generate:**
```bash
# On Mac/Linux:
openssl rand -base64 32

# Or use online generator:
# https://www.random.org/strings/
```

**Requirements:**
- Minimum 32 characters
- Use letters, numbers, special characters
- Keep it secret!

### FRONTEND_URL
**Examples:**
- Production: `https://your-app.vercel.app`
- Development: `http://localhost:3000`
- Multiple: `https://app.yourdomain.com,https://www.yourdomain.com`

### PROXY_LIST
**What is this:**
- Rotates through multiple proxy servers for API requests
- Helps avoid 429 rate limit errors from blockchain APIs
- Optional but recommended for production

**Format:**
```bash
PROXY_LIST=http://user:pass@proxy1.com:8080,http://user:pass@proxy2.com:8080,http://user:pass@proxy3.com:8080
```

**Where to get proxies:**
- Webshare.io ($50/month for 10 proxies)
- Smartproxy.com ($75/month)
- Bright Data ($500/month)

**See PROXY_SETUP.md for detailed instructions!**

### ETHERSCAN_API_KEY
**Where to get it:**
1. Create account at https://etherscan.io/
2. Go to API-KEYs section
3. Create new API key (free tier available)

**Used for:** Monitoring Ethereum and USDT transactions

### SOLANA_RPC_URL
**Free Options:**
- Alchemy: https://www.alchemy.com/ (300M compute units/month)
- Helius: https://www.helius.dev/ (100k credits/month)
- QuickNode: https://www.quicknode.com/

**Default (if not set):** `https://api.mainnet-beta.solana.com` (rate limited)

---

## Local Development Setup

Create a `.env` file in the `backend` folder:

```bash
# Copy this template
NODE_ENV=development
PORT=5000
DATABASE_URL=postgresql://postgres:password@localhost:5432/dcptg_db
JWT_SECRET=local_development_secret_key_32_chars
SENDGRID_API_KEY=SG.your_key
EMAIL_FROM=test@example.com
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin123
FRONTEND_URL=http://localhost:3000
```

Then run:
```bash
npm install
npm run init-db
npm run dev
```

---

## Security Best Practices

✅ **DO:**
- Use different passwords for production and development
- Use long, random strings for JWT_SECRET
- Keep .env file in .gitignore
- Use environment variable management (Render, Vercel, etc.)
- Rotate API keys periodically

❌ **DON'T:**
- Commit .env files to Git
- Share API keys publicly
- Use simple/guessable secrets
- Hardcode secrets in source code
- Reuse passwords across services

---

## Verification Checklist

After setting all variables:

1. [ ] DATABASE_URL connects successfully
2. [ ] SENDGRID_API_KEY starts with "SG."
3. [ ] EMAIL_FROM is verified in SendGrid
4. [ ] JWT_SECRET is at least 32 characters
5. [ ] ADMIN_PASSWORD is strong
6. [ ] FRONTEND_URL matches your actual frontend
7. [ ] All values have no extra spaces/quotes

---

## Testing Environment Variables

**Test Database Connection:**
```bash
# In Render Shell or local terminal
psql "$DATABASE_URL"
```

**Test SendGrid:**
```bash
# Make a test API call
curl -X POST https://api.sendgrid.com/v3/mail/send \
  -H "Authorization: Bearer $SENDGRID_API_KEY" \
  -H "Content-Type: application/json"
```

**Test API Health:**
```bash
curl https://your-app.onrender.com/api/health
```

---

## Troubleshooting

### DATABASE_URL not working?
- Verify it's the EXTERNAL URL (not internal)
- Check if database is running
- Test connection manually with psql
- Make sure no extra spaces/quotes

### Emails not sending?
- Verify SENDGRID_API_KEY format (must start with SG.)
- Check if EMAIL_FROM is verified in SendGrid
- Look at SendGrid Activity dashboard
- Check Render logs for email errors

### JWT errors?
- Make sure JWT_SECRET is set
- Use minimum 32 characters
- Don't use special shell characters without quotes

---

## Template for Render.com

Copy-paste this to Render Dashboard → Environment → Bulk Edit:

```
DATABASE_URL=postgresql://user:pass@host:5432/db
NODE_ENV=production
PORT=10000
JWT_SECRET=generate_random_32_char_string_here
SENDGRID_API_KEY=SG.your_key_here
EMAIL_FROM=noreply@yourdomain.com
ADMIN_USERNAME=admin
ADMIN_PASSWORD=secure_password_here
FRONTEND_URL=https://your-frontend.com
```

Remember to replace all placeholder values with actual credentials!

