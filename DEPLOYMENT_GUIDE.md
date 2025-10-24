# 🚀 CryptoQuant Deployment Guide

## Option 1: Frontend auf Namecheap + Backend auf Render.com (EMPFOHLEN)

### ✅ Vorteile:
- **KOSTENLOS**: Render bietet kostenloses Hosting für Node.js + PostgreSQL
- **Einfach**: Kein Server-Management nötig
- **Professionell**: Automatische HTTPS, Skalierung
- **Schnell**: 5-10 Minuten Setup

---

## 📋 TEIL 1: Backend auf Render.com deployen

### Schritt 1: Repository vorbereiten (GitHub)

1. **Erstellen Sie ein GitHub Repository:**
   - Gehen Sie zu https://github.com/new
   - Name: `cryptoquant-backend`
   - Public oder Private (egal)
   - Klicken Sie "Create repository"

2. **Uploaden Sie Ihr Backend:**
   ```bash
   cd "C:\Users\j\Downloads\imgui-master\imgui-master\backend"
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/IHR-USERNAME/cryptoquant-backend.git
   git push -u origin main
   ```

### Schritt 2: Render.com Account erstellen

1. Gehen Sie zu **https://render.com**
2. Klicken Sie **"Get Started for Free"**
3. Registrieren Sie sich mit GitHub (empfohlen)

### Schritt 3: PostgreSQL Datenbank erstellen

1. In Render Dashboard → **"New +"** → **"PostgreSQL"**
2. **Name**: `cryptoquant-db`
3. **Database**: `cryptoquant`
4. **User**: `cryptoquant_user`
5. **Region**: Frankfurt (oder nächstgelegene)
6. **Plan**: **Free** ✅
7. Klicken Sie **"Create Database"**
8. ⚠️ **WICHTIG**: Notieren Sie die "Internal Database URL" (kommt später!)

### Schritt 4: Web Service erstellen (Node.js Backend)

1. In Render Dashboard → **"New +"** → **"Web Service"**
2. **"Connect a repository"** → Wählen Sie Ihr GitHub Repo
3. **Konfiguration:**
   - **Name**: `cryptoquant-api`
   - **Region**: Frankfurt
   - **Branch**: `main`
   - **Root Directory**: (leer lassen)
   - **Runtime**: **Node**
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: **Free** ✅

4. **Environment Variables** (sehr wichtig!):
   Klicken Sie "Add Environment Variable" und fügen Sie hinzu:
   ```
   NODE_ENV=production
   PORT=5000
   DATABASE_URL=[Die Internal Database URL von Schritt 3]
   JWT_SECRET=ihr-super-geheimer-jwt-schluessel-hier
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=ihre-email@gmail.com
   EMAIL_PASS=ihr-app-password
   FRONTEND_URL=https://ihre-domain.com
   ```

5. Klicken Sie **"Create Web Service"**
6. Warten Sie 2-5 Minuten bis Deployment fertig ist
7. ✅ Backend ist jetzt live unter: `https://cryptoquant-api.onrender.com`

---

## 📋 TEIL 2: Frontend auf Namecheap hosten

### Schritt 1: Frontend-Dateien vorbereiten

1. **API-URL ändern:**
   - Öffnen Sie `api-config.js`
   - Ändern Sie:
     ```javascript
     const API_URL = 'https://cryptoquant-api.onrender.com/api';
     ```

2. **Dateien die Sie uploaden müssen** (ALLE aus dem Hauptordner):
   ```
   ✅ index.html
   ✅ login.html
   ✅ register.html
   ✅ dashboard.html
   ✅ quantification.html
   ✅ deposit.html
   ✅ withdraw.html
   ✅ team.html
   ✅ about.html
   ✅ admin-login.html
   ✅ admin-dashboard.html
   
   ✅ api-config.js
   ✅ auth.js
   ✅ dashboard.js
   ✅ quantification.js
   ✅ deposit-auto.js
   ✅ withdraw.js
   ✅ team.js
   ✅ admin.js
   ✅ notifications.js
   ✅ support-widget.js
   
   ✅ styles.css
   ✅ auth-styles.css
   ✅ pages-styles.css
   ✅ dashboard-styles.css
   ✅ dashboard-banner.css
   ✅ quantification-styles.css
   ✅ support-widget.css
   ```

### Schritt 2: Mit Namecheap cPanel verbinden

1. **Login zu Namecheap:**
   - Gehen Sie zu https://www.namecheap.com
   - Login mit Ihrem Account

2. **cPanel öffnen:**
   - Dashboard → "Hosting List"
   - Klicken Sie "Manage" bei Ihrem Hosting
   - Klicken Sie "Go to cPanel"

3. **File Manager öffnen:**
   - Im cPanel → Suchen Sie "File Manager"
   - Öffnen Sie den Ordner `public_html`

### Schritt 3: Dateien hochladen

**Methode 1: File Manager Upload (einfach)**
1. Im cPanel File Manager → `public_html` Ordner
2. Klicken Sie "Upload" oben
3. Wählen Sie ALLE Frontend-Dateien aus
4. Warten Sie bis Upload fertig ist

**Methode 2: FTP (empfohlen für viele Dateien)**
1. **FTP Credentials in cPanel erstellen:**
   - cPanel → "FTP Accounts"
   - Erstellen Sie einen FTP Account

2. **FileZilla verwenden:**
   - Download: https://filezilla-project.org/
   - Host: `ftp.ihre-domain.com`
   - Username: Ihr FTP Username
   - Password: Ihr FTP Password
   - Port: 21
   - Verbinden → Alle Dateien nach `/public_html` uploaden

### Schritt 4: Domain konfigurieren

1. **In Namecheap Domain Settings:**
   - Dashboard → "Domain List"
   - Klicken Sie "Manage" bei Ihrer Domain
   - "Advanced DNS" → Fügen Sie hinzu:
     ```
     Type: A Record
     Host: @
     Value: [IP Ihres Hostings - steht in cPanel]
     TTL: Automatic
     
     Type: CNAME Record
     Host: www
     Value: ihre-domain.com
     TTL: Automatic
     ```

2. Warten Sie 10-30 Minuten für DNS Propagation

---

## 📋 TEIL 3: Datenbank initialisieren

1. **Render.com Dashboard öffnen**
2. Gehen Sie zu Ihrer PostgreSQL Datenbank
3. Klicken Sie "Connect" → "PSQL Command"
4. Kopieren Sie den Befehl und führen Sie lokal aus (oder nutzen Sie Web Console)
5. Führen Sie diese SQL-Befehle aus:
   ```sql
   -- [Ihre SQL Tabellen-Erstellung hier einfügen]
   -- users, referrals, deposits, withdrawals, etc.
   ```

---

## ✅ FERTIG! Ihre Webseite ist LIVE!

**URLs:**
- 🌐 **Frontend**: https://ihre-domain.com
- 🔧 **Backend API**: https://cryptoquant-api.onrender.com
- 🔑 **Admin Panel**: https://ihre-domain.com/admin-login.html

---

## 🆘 Häufige Probleme & Lösungen

### Problem: "CORS Error"
**Lösung**: Im Backend `server.js` → CORS konfigurieren:
```javascript
app.use(cors({
    origin: 'https://ihre-domain.com',
    credentials: true
}));
```

### Problem: Backend schläft (Free Plan)
**Render Free**: Schläft nach 15 Min Inaktivität
**Lösung**: Upgrade zu Paid Plan ($7/Monat) ODER benutzen Sie UptimeRobot.com (kostenlos) um alle 5 Min zu pingen

### Problem: Email funktioniert nicht
**Lösung**: Gmail App Password erstellen:
1. Google Account → Security
2. 2-Step Verification aktivieren
3. App Passwords erstellen
4. In Render Environment Variables einfügen

---

## 💡 Alternative: Alles auf Namecheap VPS

Falls Sie **Namecheap VPS** haben:

1. **SSH in VPS einloggen**
2. **Node.js installieren:**
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs
   ```

3. **PostgreSQL installieren:**
   ```bash
   sudo apt install postgresql postgresql-contrib
   ```

4. **Backend deployen:**
   ```bash
   cd /var/www
   git clone https://github.com/IHRE-REPO/cryptoquant-backend.git
   cd cryptoquant-backend
   npm install
   npm install -g pm2
   pm2 start server.js --name cryptoquant-api
   pm2 startup
   pm2 save
   ```

5. **Nginx als Reverse Proxy:**
   ```bash
   sudo apt install nginx
   sudo nano /etc/nginx/sites-available/cryptoquant
   ```
   
   Konfiguration:
   ```nginx
   server {
       listen 80;
       server_name ihre-domain.com;

       location / {
           root /var/www/html;
           try_files $uri $uri/ =404;
       }

       location /api {
           proxy_pass http://localhost:5000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

   ```bash
   sudo ln -s /etc/nginx/sites-available/cryptoquant /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl restart nginx
   ```

6. **SSL Certificate (Kostenlos mit Let's Encrypt):**
   ```bash
   sudo apt install certbot python3-certbot-nginx
   sudo certbot --nginx -d ihre-domain.com -d www.ihre-domain.com
   ```

---

## 📊 Kosten-Übersicht

### Option 1: Hybrid (Empfohlen)
- Namecheap Shared Hosting: $2-5/Monat
- Render.com Free Plan: **$0** ✅
- **TOTAL: $2-5/Monat**

### Option 2: Namecheap VPS
- VPS Hosting: $10-30/Monat
- **TOTAL: $10-30/Monat**

### Option 3: Cloud (Professionell)
- DigitalOcean Droplet: $6/Monat
- Cloudflare (CDN): Kostenlos
- **TOTAL: ~$6/Monat**

---

## 🎯 Meine Empfehlung

**START**: Option 1 (Namecheap + Render.com) - Kostenlos & Einfach!

**SPÄTER** (wenn Traffic wächst): Upgrade zu Namecheap VPS oder DigitalOcean

---

Brauchen Sie Hilfe bei einem dieser Schritte? Ich kann Ihnen detaillierte Anleitungen für jeden Teil geben! 🚀


