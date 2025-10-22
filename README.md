# 🚀 CryptoQuant Backend API

Node.js + Express + PostgreSQL Backend für die CryptoQuant Crypto Investment Plattform.

## ✨ Features

- ✅ **User Authentication** (JWT)
- ✅ **Email Verification** (Nodemailer)
- ✅ **Crypto Wallet Generation** (ETH, BTC, USDT, SOL)
- ✅ **Blockchain Monitoring** (Automatic deposit detection)
- ✅ **MLM Referral System** (Multi-level commissions)
- ✅ **Quantification System** (Click-to-earn)
- ✅ **Admin Dashboard** (User & transaction management)
- ✅ **Withdrawal System** (Multi-crypto support)

## 📦 Installation (Lokal)

```bash
npm install
```

## ⚙️ Configuration

Kopieren Sie `.env.example` zu `.env` und füllen Sie die Werte aus:

```bash
cp .env.example .env
```

## 🗄️ Database Setup

```bash
# Datenbank initialisieren
npm run init-db

# Admin Account erstellen
npm run create-admin
```

## 🚀 Start

```bash
# Development
npm run dev

# Production
npm start
```

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register` - User registrieren
- `POST /api/auth/login` - Login
- `POST /api/auth/send-code` - Email verification code senden
- `GET /api/auth/me` - Aktuellen User abrufen

### Dashboard
- `GET /api/dashboard` - Dashboard Daten
- `GET /api/dashboard/stats` - Statistiken
- `POST /api/dashboard/click` - Quantification click
- `GET /api/dashboard/clicks` - Click info

### Deposits
- `GET /api/deposit/addresses` - Deposit Adressen abrufen
- Automatisches Monitoring läuft im Background

### Withdrawals
- `POST /api/withdrawal` - Withdrawal erstellen
- `GET /api/withdrawal/history` - Withdrawal History

### Team/Referrals
- `GET /api/team` - Team Mitglieder
- `GET /api/team/stats` - Referral Statistiken

### Admin
- `POST /api/admin/login` - Admin Login
- `GET /api/admin/users` - Alle Users
- `GET /api/admin/deposits` - Alle Deposits
- `GET /api/admin/withdrawals` - Alle Withdrawals
- `POST /api/admin/deposits/:id/approve` - Deposit genehmigen
- `POST /api/admin/withdrawals/:id/approve` - Withdrawal genehmigen

## 🔐 Environment Variables

| Variable | Beschreibung | Beispiel |
|----------|--------------|----------|
| `NODE_ENV` | Environment | `production` |
| `PORT` | Server Port | `5000` |
| `DATABASE_URL` | PostgreSQL Connection | `postgresql://user:pass@host:5432/db` |
| `JWT_SECRET` | JWT Secret Key | `your-secret-key` |
| `EMAIL_HOST` | SMTP Host | `smtp.gmail.com` |
| `EMAIL_PORT` | SMTP Port | `587` |
| `EMAIL_USER` | Email Address | `your-email@gmail.com` |
| `EMAIL_PASS` | Email Password | `your-app-password` |
| `FRONTEND_URL` | Frontend URL | `https://yoursite.com` |

## 📊 Database Schema

- `users` - User accounts
- `admins` - Admin accounts
- `referrals` - MLM pyramid structure
- `user_deposit_addresses` - Crypto wallet addresses
- `deposits` - Deposit transactions
- `withdrawals` - Withdrawal requests
- `incoming_transactions` - Blockchain transactions
- `daily_clicks` - Quantification tracking
- `click_history` - Click history
- `admin_cashouts` - Admin wallet transfers
- `notifications` - User notifications

## 🔄 Background Jobs

- **Blockchain Monitoring**: Läuft alle 1 Minute
- **Daily Reset**: Läuft um Mitternacht (UTC)

## 🛡️ Security Features

- Rate Limiting (express-rate-limit)
- Helmet.js (Security headers)
- Input Validation (express-validator)
- Password Hashing (bcryptjs)
- JWT Authentication
- CORS Protection

## 📝 License

MIT

## 🆘 Support

Bei Fragen oder Problemen, öffnen Sie ein Issue auf GitHub!
