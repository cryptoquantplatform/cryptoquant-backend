# DCPTG Backend Deployment Guide

## 📋 Prerequisites

Before deploying, you need:

1. **Server** (VPS or Cloud Hosting)
   - DigitalOcean, AWS EC2, Linode, Vultr, etc.
   - Minimum: 2GB RAM, 1 CPU, 20GB SSD
   - Ubuntu 20.04+ or similar Linux distribution

2. **Domain Name** (Optional but recommended)
   - Example: api.dcptg.com

3. **Email Service Account**
   - Gmail with App Password
   - Or SendGrid, AWS SES, Mailgun, etc.

4. **PostgreSQL Database**
   - Can be on same server or managed (AWS RDS, DigitalOcean Managed DB)

---

## 🚀 Quick Start Deployment

### Step 1: Install Node.js and PostgreSQL on Server

```bash
# SSH into your server
ssh root@your-server-ip

# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PostgreSQL
sudo apt install postgresql postgresql-contrib -y

# Install PM2 for process management
sudo npm install -g pm2
```

### Step 2: Set Up PostgreSQL Database

```bash
# Switch to postgres user
sudo -u postgres psql

# In PostgreSQL shell:
CREATE DATABASE dcptg_db;
CREATE USER dcptg_user WITH ENCRYPTED PASSWORD 'your_strong_password';
GRANT ALL PRIVILEGES ON DATABASE dcptg_db TO dcptg_user;
\q
```

### Step 3: Upload Backend Code

```bash
# On your local machine, from the backend folder:
# Install dependencies first
cd backend
npm install

# Compress backend folder
tar -czf dcptg-backend.tar.gz .

# Upload to server (from your local machine)
scp dcptg-backend.tar.gz root@your-server-ip:/var/www/

# On server:
cd /var/www
tar -xzf dcptg-backend.tar.gz
mv backend dcptg-backend
cd dcptg-backend
npm install --production
```

### Step 4: Configure Environment Variables

```bash
# On server, create .env file
nano .env
```

Copy and modify this (use .env.example as template):

```env
# Server
PORT=5000
NODE_ENV=production

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=dcptg_db
DB_USER=dcptg_user
DB_PASSWORD=your_strong_password

# JWT
JWT_SECRET=change-this-to-a-super-long-random-string-for-production
JWT_EXPIRE=7d

# Email (Gmail example)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-specific-password
EMAIL_FROM=noreply@dcptg.com

# Frontend URL
FRONTEND_URL=https://yourdomain.com

# Crypto Wallets (YOUR REAL WALLETS!)
WALLET_USDT_TRC20=TYourRealUSDTWalletAddress
WALLET_BTC=1YourRealBitcoinAddress
WALLET_ETH=0xYourRealEthereumAddress

# Settings
MIN_DEPOSIT=75
WITHDRAWAL_FEE_USDT=1
```

**Important:** Generate a strong JWT secret:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### Step 5: Initialize Database

```bash
cd /var/www/dcptg-backend
npm run init-db
```

### Step 6: Start Server with PM2

```bash
# Start the server
pm2 start server.js --name dcptg-backend

# Make it start on server reboot
pm2 startup
pm2 save

# Check status
pm2 status
pm2 logs dcptg-backend
```

### Step 7: Set Up Nginx Reverse Proxy

```bash
# Install Nginx
sudo apt install nginx -y

# Create Nginx config
sudo nano /etc/nginx/sites-available/dcptg-backend
```

Add this configuration:

```nginx
server {
    listen 80;
    server_name api.yourdomain.com;  # Change this!

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# Enable the site
sudo ln -s /etc/nginx/sites-available/dcptg-backend /etc/nginx/sites-enabled/

# Test Nginx config
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
```

### Step 8: Set Up SSL with Let's Encrypt (FREE)

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx -y

# Get SSL certificate
sudo certbot --nginx -d api.yourdomain.com

# Follow prompts, choose to redirect HTTP to HTTPS
```

---

## 📧 Email Setup Options

### Option 1: Gmail (Free, Easy for Testing)

1. Go to Google Account Settings
2. Enable 2-Factor Authentication
3. Generate App Password: https://myaccount.google.com/apppasswords
4. Use that password in EMAIL_PASSWORD

### Option 2: SendGrid (Recommended for Production)

1. Sign up: https://sendgrid.com/
2. Free tier: 100 emails/day
3. Get API Key
4. Update .env:

```env
EMAIL_HOST=smtp.sendgrid.net
EMAIL_PORT=587
EMAIL_USER=apikey
EMAIL_PASSWORD=your_sendgrid_api_key
```

### Option 3: AWS SES (Scalable)

1. Set up AWS SES
2. Verify domain
3. Use SMTP credentials

---

## 🗄️ Database Backup

Set up automatic daily backups:

```bash
# Create backup script
sudo nano /usr/local/bin/backup-dcptg-db.sh
```

```bash
#!/bin/bash
BACKUP_DIR="/var/backups/dcptg"
mkdir -p $BACKUP_DIR
DATE=$(date +%Y%m%d_%H%M%S)
pg_dump -U dcptg_user dcptg_db > $BACKUP_DIR/dcptg_backup_$DATE.sql
# Keep only last 7 days
find $BACKUP_DIR -name "*.sql" -mtime +7 -delete
```

```bash
# Make executable
sudo chmod +x /usr/local/bin/backup-dcptg-db.sh

# Add to crontab (runs daily at 2 AM)
sudo crontab -e
# Add this line:
0 2 * * * /usr/local/bin/backup-dcptg-db.sh
```

---

## 🔒 Security Checklist

- [ ] Changed default PostgreSQL password
- [ ] Generated strong JWT_SECRET
- [ ] Configured firewall (UFW):
  ```bash
  sudo ufw allow 22    # SSH
  sudo ufw allow 80    # HTTP
  sudo ufw allow 443   # HTTPS
  sudo ufw enable
  ```
- [ ] Set up SSL/HTTPS
- [ ] Configured CORS properly (only your frontend domain)
- [ ] Using strong passwords for all services
- [ ] Regular database backups enabled
- [ ] Server updates scheduled:
  ```bash
  sudo apt update && sudo apt upgrade -y
  ```

---

## 📊 Monitoring & Logs

### View Logs
```bash
# PM2 logs
pm2 logs dcptg-backend

# Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# PostgreSQL logs
sudo tail -f /var/log/postgresql/postgresql-*.log
```

### Monitor Performance
```bash
pm2 monit
```

---

## 🔄 Updating the Backend

```bash
# On local machine, make changes, then:
cd backend
tar -czf dcptg-backend-update.tar.gz .
scp dcptg-backend-update.tar.gz root@your-server-ip:/tmp/

# On server:
cd /var/www/dcptg-backend
pm2 stop dcptg-backend
tar -xzf /tmp/dcptg-backend-update.tar.gz
npm install --production
pm2 start dcptg-backend
```

---

## 🌐 Frontend Configuration

Update your frontend to use the API:

In your HTML files, update the API URL:

```javascript
const API_URL = 'https://api.yourdomain.com/api';
```

---

## 💰 Cost Estimation

**Minimum Setup (Development/Testing):**
- VPS (DigitalOcean Droplet): $6/month
- Domain: $12/year
- **Total: ~$7-8/month**

**Production Setup (Scalable):**
- VPS (2GB RAM): $12/month
- Managed PostgreSQL: $15/month
- SendGrid (paid): $15/month (40k emails)
- Domain + SSL: $12/year
- **Total: ~$43/month**

---

## 🆘 Troubleshooting

### Server won't start
```bash
pm2 logs dcptg-backend --lines 50
```

### Database connection error
```bash
# Test connection
psql -U dcptg_user -d dcptg_db -h localhost
```

### Email not sending
```bash
# Test SMTP connection
telnet smtp.gmail.com 587
```

---

## 📞 Support

If you need help:
1. Check logs first
2. Verify .env configuration
3. Test each service individually
4. Check firewall/security groups

---

**Your backend is now live and ready!** 🎉

API Base URL: `https://api.yourdomain.com/api`



