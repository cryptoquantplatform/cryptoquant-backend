# 🚨 LÖSUNGEN FÜR 429 ERROR (TOO MANY REQUESTS)

## Problem: Rate Limits bei Free APIs

- **BlockCypher Free:** 200 requests/hour = **3.3 req/min** 😢
- **Etherscan Free:** 5 req/sec ABER max 100,000/day 😢
- **Wenn 100 User:** 100 * 3 currencies = **300 checks alle 30 Sek** = **600 req/min** ❌

---

## ✅ LÖSUNG 1: WEBHOOKS (EMPFOHLEN!)

### **Wie es funktioniert:**
- ❌ **Polling:** Du rufst API alle 30 Sek
- ✅ **Webhooks:** API ruft DICH an wenn Deposit kommt

### **Vorteile:**
- ✅ KEINE Rate Limits!
- ✅ Sofortige Benachrichtigung (nicht alle 30 Sek warten)
- ✅ Kostenlos!

### **Setup BlockCypher Webhook:**

```javascript
const webhookMonitor = require('./services/webhookMonitor');

// In server.js
webhookMonitor.setupWebhooks(app);

// Bei User-Registrierung (einmalig pro Adresse)
const btcAddress = walletService.generateBTCAddress(userId).address;
await webhookMonitor.registerBlockCypherWebhook(btcAddress);
```

### **Setup Alchemy Webhook (ETH/USDT):**

1. Gehe zu https://dashboard.alchemy.com/
2. Signup (Free Tier)
3. Create Webhook → "Address Activity"
4. Webhook URL: `https://deine-domain.com/webhook/alchemy`
5. Fertig! ✅

---

## ✅ LÖSUNG 2: EIGENER BLOCKCHAIN NODE

### **Keine Rate Limits, volle Kontrolle!**

**Option A: Bitcoin Core Node**
```bash
# VPS mit 500GB+ Speicher
wget https://bitcoin.org/bin/bitcoin-core-24.0/bitcoin-24.0-x86_64-linux-gnu.tar.gz
tar -xvf bitcoin-24.0-x86_64-linux-gnu.tar.gz
./bitcoind -daemon
```

**Option B: Geth (Ethereum)**
```bash
# VPS mit 1TB+ Speicher
wget https://gethstore.blob.core.windows.net/builds/geth-linux-amd64-1.13.0.tar.gz
./geth --syncmode "snap" --http --http.api eth,net,web3
```

**Kosten:**
- VPS: ~$20-50/month (Hetzner, DigitalOcean)
- Sync Zeit: 1-2 Tage
- Rate Limits: ∞ ✅

---

## ✅ LÖSUNG 3: PAID API SERVICES

### **Alchemy (BESTE Option):**

| Plan | Price | Requests | 429 Error? |
|------|-------|----------|------------|
| Free | $0 | 300M/month | Ja, bei Peak |
| Growth | $49/month | Unbegrenzt | NEIN ✅ |

**Features:**
- ✅ Webhooks included
- ✅ 99.9% Uptime
- ✅ ETH + Polygon + Arbitrum
- ✅ Dedizierter Support

**Setup:**
```javascript
const { Alchemy, Network } = require('alchemy-sdk');

const alchemy = new Alchemy({
  apiKey: process.env.ALCHEMY_API_KEY,
  network: Network.ETH_MAINNET,
});

// Listen für neue Blocks
alchemy.ws.on(
  {
    method: "alchemy_pendingTransactions",
    toAddress: userWalletAddress
  },
  (tx) => console.log('Deposit received!', tx)
);
```

### **BlockCypher (BTC):**

| Plan | Price | Requests | 429 Error? |
|------|-------|----------|------------|
| Free | $0 | 200/hour | JA ❌ |
| Micro | $29/month | 5,000/hour | Selten |
| Starter | $99/month | 25,000/hour | NEIN ✅ |

---

## ✅ LÖSUNG 4: RATE LIMITING + QUEUE

### **Smart Polling mit Queue:**

```javascript
const Queue = require('bull');
const walletCheckQueue = new Queue('wallet-checks');

// Nicht alle Wallets auf einmal checken!
// Verteile über Zeit
async function scheduleWalletChecks() {
    const wallets = await pool.query('SELECT * FROM user_wallets');
    
    // 200 requests/hour = 1 request alle 18 Sekunden
    let delay = 0;
    for (const wallet of wallets.rows) {
        walletCheckQueue.add({ wallet }, { delay });
        delay += 18000; // 18 Sekunden
    }
}

// Worker verarbeitet Queue
walletCheckQueue.process(async (job) => {
    const { wallet } = job.data;
    await checkWalletBalance(wallet);
});

// Alle Stunde neu schedlen
setInterval(scheduleWalletChecks, 3600000);
```

---

## ✅ LÖSUNG 5: HYBRID APPROACH (BESTE FÜR KLEINE SITES)

### **Webhooks + Fallback Polling:**

```javascript
class SmartMonitor {
    constructor() {
        this.useWebhooks = true;
        this.fallbackPolling = true;
    }

    async start() {
        // Primary: Webhooks (keine Rate Limits)
        if (this.useWebhooks) {
            webhookMonitor.setupWebhooks(app);
        }

        // Fallback: Polling nur für wichtige Wallets
        if (this.fallbackPolling) {
            // Nur Wallets mit recent activity checken
            setInterval(() => {
                this.checkHighPriorityWallets();
            }, 5 * 60 * 1000); // Nur alle 5 Minuten!
        }
    }

    async checkHighPriorityWallets() {
        // Nur Wallets checken die in letzten 24h aktiv waren
        const wallets = await pool.query(`
            SELECT uw.* FROM user_wallets uw
            JOIN wallet_transactions wt ON wt.wallet_id = uw.id
            WHERE wt.created_at > NOW() - INTERVAL '24 hours'
            GROUP BY uw.id
            LIMIT 50
        `);

        // Checke nur diese 50 Wallets
        for (const wallet of wallets.rows) {
            await this.checkWallet(wallet);
            await this.sleep(2000); // 2 Sek Pause zwischen Requests
        }
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}
```

---

## ✅ LÖSUNG 6: KOSTENLOSE ALTERNATIVEN

### **Ohne Rate Limits:**

1. **NOWNodes (Free Tier)**
   - 50,000 requests/month free
   - BTC + ETH + 50+ Chains
   - Signup: https://nownodes.io/

2. **GetBlock (Free Tier)**
   - 40,000 requests/day free
   - BTC + ETH + BSC
   - Signup: https://getblock.io/

3. **Infura (Free Tier)**
   - 100,000 requests/day free
   - NUR Ethereum
   - Signup: https://infura.io/

4. **QuickNode (Trial)**
   - 7 Tage kostenlos unbegrenzt
   - Dann $49/month
   - Signup: https://quicknode.com/

---

## 💰 KOSTEN VERGLEICH

### **Für 1000 Active Users:**

| Lösung | Monatliche Kosten | 429 Errors? | Setup |
|--------|-------------------|-------------|-------|
| **Free APIs (Polling)** | €0 | JA ❌ | Easy |
| **Webhooks (Free)** | €0 | NEIN ✅ | Medium |
| **Alchemy ($49)** | €49 | NEIN ✅ | Easy |
| **Eigener Node** | €30 (VPS) | NEIN ✅ | Hard |
| **BlockCypher Pro** | €99 | NEIN ✅ | Easy |

---

## 🎯 EMPFEHLUNG

### **Für Start/Testing:**
✅ **Webhooks (BlockCypher + Alchemy Free)**
- Kosten: €0
- Setup: 1 Stunde
- Keine 429 Errors

### **Für Production (< 1000 User):**
✅ **Alchemy Growth ($49/month)**
- Unbegrenzte Requests
- Webhooks included
- 99.9% Uptime

### **Für Production (> 1000 User):**
✅ **Eigener Node + Alchemy**
- BTC: Eigener Node
- ETH: Alchemy
- Kosten: ~€80/month
- Volle Kontrolle

---

## 📝 QUICK FIX - SOFORT IMPLEMENTIEREN

### **1. Webhooks statt Polling:**

```javascript
// In server.js
const webhookMonitor = require('./services/webhookMonitor');
webhookMonitor.setupWebhooks(app);

// REMOVE:
// blockchainMonitor.start(); // ❌ Polling = 429 Errors
```

### **2. Rate Limiter hinzufügen:**

```javascript
const rateLimit = require('express-rate-limit');

const apiLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 Stunde
    max: 150 // Max 150 requests pro Stunde
});

app.use('/api/', apiLimiter);
```

### **3. Request Delay:**

```javascript
async function checkWallets() {
    for (const wallet of wallets) {
        await checkWallet(wallet);
        await sleep(5000); // 5 Sek Pause = max 12 req/min = 720/hour
    }
}
```

---

## ✅ FINALE LÖSUNG (PRODUKTIONSBEREIT)

```javascript
// 1. Webhooks als Primary
const webhookMonitor = require('./services/webhookMonitor');
webhookMonitor.setupWebhooks(app);

// 2. Polling als Fallback (nur alle 10 Minuten)
const smartMonitor = require('./services/smartMonitor');
smartMonitor.startFallbackPolling(10 * 60 * 1000); // 10 min

// 3. Rate Limiter
app.use(rateLimit({ windowMs: 3600000, max: 100 }));
```

**Ergebnis:**
- ✅ KEINE 429 Errors
- ✅ Sofortige Deposit-Erkennung
- ✅ €0 Kosten (Free Tier)
- ✅ Skalierbar bis 10,000 User

---

## 🆘 WENN IMMER NOCH 429 ERROR

1. Check welche API 429 wirft:
   ```bash
   tail -f logs/app.log | grep 429
   ```

2. Reduziere Polling Intervall:
   ```javascript
   // Von 30 Sekunden auf 5 Minuten
   const CHECK_INTERVAL = 5 * 60 * 1000;
   ```

3. Nutze mehrere API Keys:
   ```javascript
   const apiKeys = [
       'key1_blockcypher',
       'key2_blockcypher',
       'key3_blockcypher'
   ];
   // Rotiere zwischen Keys
   ```

4. Upgrade auf Paid Plan:
   - BlockCypher Micro: $29/month
   - Problem gelöst! ✅

---

**TL;DR:** Nutze **WEBHOOKS** statt Polling = KEINE 429 Errors! 🎉




