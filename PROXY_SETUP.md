# 🔄 Proxy Rotation Setup

This guide shows you how to configure proxy rotation to avoid 429 rate limit errors from blockchain APIs (Bitcoin, Solana, Ethereum).

## Why Use Proxies?

Blockchain APIs have strict rate limits:
- **BlockCypher (Bitcoin):** ~200 requests/hour
- **Solana RPC:** ~100 requests/10 seconds
- **Etherscan:** ~5 requests/second

Using **proxy rotation** allows you to:
- ✅ Bypass rate limits by rotating IP addresses
- ✅ Make unlimited API requests
- ✅ Avoid 429 errors and service interruptions

---

## 🚀 Setup Instructions

### Step 1: Get Proxies

You need **HTTPS proxies**. Here are some options:

#### Option A: Free Proxies (Not Recommended)
- Free proxies are unreliable and slow
- List: https://www.free-proxy-list.net/
- Format: `http://IP:PORT`

#### Option B: Paid Proxies (Recommended)
Best proxy providers for APIs:

1. **Bright Data** (formerly Luminati)
   - https://brightdata.com/
   - $500/month for datacenter proxies
   - Very reliable

2. **Smartproxy**
   - https://smartproxy.com/
   - $75/month for 5GB
   - Good for blockchain APIs

3. **Webshare**
   - https://www.webshare.io/
   - $250/month for 100 proxies
   - Affordable option

4. **ProxyMesh**
   - https://proxymesh.com/
   - $10/month for 10 proxies
   - Budget-friendly

### Step 2: Configure Environment Variable

Add your proxies to Render.com:

1. Go to **Render Dashboard** → Your Service → **Environment**
2. Add this variable:

```
PROXY_LIST=http://user:pass@proxy1.example.com:8080,http://user:pass@proxy2.example.com:8080,http://user:pass@proxy3.example.com:8080
```

#### Format:
- Multiple proxies separated by commas
- Each proxy format: `http://username:password@host:port`
- If no authentication: `http://host:port`

#### Examples:

**With authentication:**
```
PROXY_LIST=http://user123:pass456@proxy1.webshare.io:80,http://user123:pass456@proxy2.webshare.io:80
```

**Without authentication:**
```
PROXY_LIST=http://192.168.1.1:8080,http://192.168.1.2:8080
```

**SOCKS5 proxies (also supported):**
```
PROXY_LIST=socks5://user:pass@proxy.example.com:1080
```

### Step 3: Deploy

After adding `PROXY_LIST`, deploy your backend:

```bash
git add .
git commit -m "Add proxy rotation"
git push origin main
```

Render will automatically redeploy.

### Step 4: Verify

Check the logs on Render:

```
🔄 Using proxy 1/3: //***:***@proxy1.webshare.io:80
📊 Checking 4 BTC addresses...
✅ Proxy rotation working!
```

---

## 🔧 How It Works

The system automatically:
1. **Loads** all proxies from `PROXY_LIST`
2. **Rotates** through them for each API request
3. **Logs** which proxy is being used (credentials hidden)
4. **Falls back** to direct connection if no proxies configured

Example rotation:
```
Request 1 → Proxy 1
Request 2 → Proxy 2
Request 3 → Proxy 3
Request 4 → Proxy 1 (loops back)
```

---

## 📊 Testing Proxies

Test if your proxies work:

```bash
# Test proxy manually
curl -x http://user:pass@proxy.example.com:8080 https://api.blockcypher.com/v1/btc/main

# Should return JSON response
```

---

## ⚠️ Important Notes

1. **Quality matters:** Use paid proxies for production
2. **Location:** Choose proxies in same region as APIs (US-based recommended)
3. **Type:** HTTPS/HTTP proxies work best for REST APIs
4. **Rotation:** More proxies = better rate limit distribution
5. **Cost:** Budget $50-$500/month for reliable proxies

---

## 🆓 Free Alternatives (No Proxies Needed)

If you don't want to pay for proxies:

### Option 1: Use Alternative APIs
```env
# Instead of public Solana RPC, use paid RPC
SOLANA_RPC_URL=https://solana-mainnet.g.alchemy.com/v2/YOUR_API_KEY

# Use paid Etherscan plan
ETHERSCAN_API_KEY=your_premium_key
```

### Option 2: Self-Host Blockchain Nodes
- Run your own Bitcoin/Ethereum/Solana nodes
- No rate limits
- Costs: $100-$500/month for VPS

### Option 3: Increase Delays
In `blockchainMonitor.js`:
```javascript
ETH: 5000,   // 5 seconds
USDT: 5000,  // 5 seconds
BTC: 10000,  // 10 seconds
SOL: 8000    // 8 seconds
```

---

## 🐛 Troubleshooting

### Proxies not working?
1. Check proxy format in `PROXY_LIST`
2. Verify credentials are correct
3. Test proxy manually with curl
4. Check Render logs for errors

### Still getting 429 errors?
1. Add more proxies to rotation
2. Increase delays between requests
3. Use premium API keys
4. Contact your proxy provider

### Proxies are slow?
1. Use datacenter proxies (not residential)
2. Choose proxies near API servers
3. Use dedicated proxies (not shared)

---

## 💰 Cost Estimate

**Minimal setup (10 proxies):**
- Webshare: $50/month
- Total: **$50/month**

**Production setup (100 proxies):**
- Smartproxy: $200/month
- Total: **$200/month**

**Enterprise setup (1000 proxies):**
- Bright Data: $1000/month
- Total: **$1000/month**

---

## 📝 Example Configuration

Complete `.env` setup with proxies:

```env
# Database
DATABASE_URL=postgresql://user:pass@host/db

# Email
SENDGRID_API_KEY=SG.xxx

# Proxies (10 rotating proxies from Webshare)
PROXY_LIST=http://user:pass@p1.webshare.io:80,http://user:pass@p2.webshare.io:80,http://user:pass@p3.webshare.io:80,http://user:pass@p4.webshare.io:80,http://user:pass@p5.webshare.io:80,http://user:pass@p6.webshare.io:80,http://user:pass@p7.webshare.io:80,http://user:pass@p8.webshare.io:80,http://user:pass@p9.webshare.io:80,http://user:pass@p10.webshare.io:80

# Blockchain APIs (optional, uses defaults if not set)
ETHERSCAN_API_KEY=your_key
BLOCKCYPHER_TOKEN=your_token
```

---

## ✅ Next Steps

1. **Sign up** for a proxy provider (Webshare recommended for beginners)
2. **Add** `PROXY_LIST` to Render environment variables
3. **Deploy** and check logs
4. **Monitor** for 429 errors (should disappear)

Good luck! 🚀







