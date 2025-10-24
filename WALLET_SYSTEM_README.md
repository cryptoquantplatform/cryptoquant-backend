# 🔐 CRYPTO WALLET SYSTEM - WIE RAINBET/STAKE

## 📚 ÜBERSICHT

Dieses System generiert **unique Wallet-Adressen** für jeden User, genau wie Rainbet/Stake/Roobet.

### **Wie es funktioniert:**

1. **HD Wallets (Hierarchical Deterministic)**
   - 1 Master Seed kontrolliert alle Adressen
   - Jeder User bekommt eigene BTC/ETH/USDT Adresse
   - Deterministisch: Gleicher Seed = gleiche Adressen

2. **Blockchain Monitor**
   - Überprüft alle Adressen alle 30 Sekunden
   - Erkennt eingehende Transaktionen
   - Updated automatisch User Balance

3. **Automatische Verarbeitung**
   - Deposit erkannt → Balance + Notification
   - Keine manuelle Verarbeitung nötig!

---

## 🚀 INSTALLATION

### **1. Dependencies installieren:**

```bash
cd backend
npm install @scure/bip32 @scure/bip39 bitcoinjs-lib ethers axios
```

### **2. Datenbank Schema erstellen:**

```sql
-- User Wallets Table
CREATE TABLE user_wallets (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    currency VARCHAR(10) NOT NULL,
    address VARCHAR(255) UNIQUE NOT NULL,
    derivation_path VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_user_wallets_user_id ON user_wallets(user_id);
CREATE INDEX idx_user_wallets_address ON user_wallets(address);

-- Wallet Transactions Table
CREATE TABLE wallet_transactions (
    id SERIAL PRIMARY KEY,
    wallet_id INTEGER REFERENCES user_wallets(id) ON DELETE CASCADE,
    tx_hash VARCHAR(255) UNIQUE NOT NULL,
    amount DECIMAL(20, 8) NOT NULL,
    confirmations INTEGER DEFAULT 0,
    status VARCHAR(20) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_wallet_transactions_wallet_id ON wallet_transactions(wallet_id);
CREATE INDEX idx_wallet_transactions_tx_hash ON wallet_transactions(tx_hash);
```

### **3. Environment Variables (.env):**

```env
# MASTER MNEMONIC - NIEMALS COMMITTEN!
# Generiere mit: https://iancoleman.io/bip39/
WALLET_MASTER_MNEMONIC="word1 word2 word3 ... word12"

# Blockchain API Keys
BLOCKCYPHER_TOKEN="your_blockcypher_token"
ETHERSCAN_API_KEY="your_etherscan_api_key"
```

**⚠️ WICHTIG:** 
- Master Mnemonic NIEMALS in Git committen!
- Sichere Backup der Mnemonic an 2-3 Orten!
- Bei Verlust = ALLE Coins verloren!

---

## 📡 API ENDPOINTS

### **1. User Wallets holen:**

```javascript
GET /api/wallet/my-wallets
Authorization: Bearer {token}

Response:
{
  "success": true,
  "wallets": [
    {
      "currency": "BTC",
      "address": "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh"
    },
    {
      "currency": "ETH",
      "address": "0x1234567890abcdef1234567890abcdef12345678"
    },
    {
      "currency": "USDT",
      "address": "0x1234567890abcdef1234567890abcdef12345678"
    }
  ]
}
```

### **2. Deposit Adresse für Währung:**

```javascript
GET /api/wallet/deposit/:currency
// currency = BTC | ETH | USDT

Response:
{
  "success": true,
  "currency": "BTC",
  "address": "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh",
  "qrCode": "https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=..."
}
```

### **3. Wallet Transaktionen:**

```javascript
GET /api/wallet/transactions
Authorization: Bearer {token}

Response:
{
  "success": true,
  "transactions": [
    {
      "tx_hash": "abc123...",
      "amount": "0.001",
      "currency": "BTC",
      "confirmations": 6,
      "status": "confirmed",
      "created_at": "2025-10-23T..."
    }
  ]
}
```

---

## 🔧 BACKEND INTEGRATION

### **In server.js hinzufügen:**

```javascript
const walletController = require('./controllers/walletController');
const blockchainMonitor = require('./services/blockchainMonitor');

// Wallet Routes
app.get('/api/wallet/my-wallets', authMiddleware, walletController.getUserWallets);
app.get('/api/wallet/deposit/:currency', authMiddleware, walletController.getDepositAddress);
app.get('/api/wallet/transactions', authMiddleware, walletController.getWalletTransactions);
app.post('/api/wallet/create', walletController.createUserWallets);

// Starte Blockchain Monitor
blockchainMonitor.start();

// Graceful Shutdown
process.on('SIGTERM', () => {
    blockchainMonitor.stop();
    process.exit(0);
});
```

### **Bei User-Registrierung:**

```javascript
// In authController.js register()
const walletService = require('../services/walletService');

async function register(req, res) {
    // ... User erstellen ...
    
    // Wallets automatisch erstellen
    const wallets = walletService.generateAllWallets(newUser.id);
    
    for (const wallet of wallets) {
        await pool.query(`
            INSERT INTO user_wallets (user_id, currency, address, derivation_path)
            VALUES ($1, $2, $3, $4)
        `, [newUser.id, wallet.currency, wallet.address, wallet.derivationPath]);
    }
    
    // ...
}
```

---

## 🎨 FRONTEND INTEGRATION

### **Deposit Modal Beispiel:**

```javascript
async function showDepositModal(currency) {
    const response = await fetch(`/api/wallet/deposit/${currency}`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await response.json();
    
    // Zeige Adresse + QR Code
    document.getElementById('depositAddress').textContent = data.address;
    document.getElementById('depositQR').src = data.qrCode;
}
```

---

## 🔒 SICHERHEIT

### **Best Practices:**

1. ✅ **Master Mnemonic sichern:**
   - Schreib auf Papier
   - Safe Deposit Box
   - Encrypted Backup

2. ✅ **Environment Variables:**
   - Niemals in Git
   - Nur auf Production Server
   - Regelmäßig rotieren

3. ✅ **API Rate Limits:**
   - BlockCypher: 200 req/hour (free)
   - Etherscan: 5 req/sec (free)
   - Für Production: Bezahl-Plan!

4. ✅ **Monitoring:**
   - Log alle Deposits
   - Alert bei großen Beträgen
   - Daily Balance Check

---

## 💰 KOSTEN

### **Free Tier:**
- ✅ BlockCypher: 200 req/hour
- ✅ Etherscan: 5 req/sec
- ⚠️ Für 100 User OK, für 1000+ User → Paid

### **Paid Services:**
- 🔸 **Alchemy** (ETH): $49/month
- 🔸 **BlockCypher** (BTC): $99/month
- 🔸 **Infura** (ETH): $50/month

---

## 📊 BEISPIEL FLOW

```
USER WILL DEPOSIT MACHEN:
1. Klickt "Deposit BTC"
2. Frontend holt Adresse: GET /api/wallet/deposit/BTC
3. User sieht seine unique BTC Adresse + QR Code
4. User sendet BTC an diese Adresse

BLOCKCHAIN MONITOR (läuft im Hintergrund):
5. Monitor checkt Adresse alle 30 Sek
6. Transaktion erkannt: 0.01 BTC
7. Warte auf 6 Confirmations
8. Update User Balance: +500€
9. Erstelle Notification: "Deposit received!"
10. User sieht €500 im Account
```

---

## 🧪 TESTING

### **Testnet verwenden:**

```javascript
// In walletService.js
const bitcoin = require('bitcoinjs-lib');

generateBTCAddress(userId) {
    // TESTNET für Testing!
    const { address } = bitcoin.payments.p2wpkh({
        pubkey: Buffer.from(child.publicKey),
        network: bitcoin.networks.testnet // <-- TESTNET
    });
}
```

### **Testnet Faucets:**
- BTC Testnet: https://testnet-faucet.mempool.co/
- ETH Sepolia: https://sepoliafaucet.com/

---

## ❓ FAQ

**Q: Kann ich die Coins ausgeben?**
A: Ja! Du hast den Private Key (über Master Seed). Nutze ein Tool wie `bitcoinjs-lib` um Transaktionen zu signieren.

**Q: Was wenn Master Seed verloren geht?**
A: ALLE Coins sind verloren! Backup ist CRITICAL!

**Q: Warum nicht ein Custodial Service wie Coinbase?**
A: Mehr Kontrolle, keine KYC, sofortige Verarbeitung, günstiger.

**Q: Wie viele Adressen kann ich generieren?**
A: Praktisch unbegrenzt! HD Wallets können 2^31 Adressen generieren.

---

## 📞 SUPPORT

Bei Fragen:
1. Prüfe Logs: `tail -f logs/blockchain-monitor.log`
2. Check Database: `SELECT * FROM wallet_transactions ORDER BY created_at DESC LIMIT 10;`
3. Test API: `curl http://localhost:3000/api/wallet/my-wallets`

---

**🚀 READY TO DEPLOY!**



