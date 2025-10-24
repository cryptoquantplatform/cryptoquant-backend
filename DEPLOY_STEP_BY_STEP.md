# 🚀 DEPLOYMENT GUIDE - Schritt für Schritt

## TEIL 1: Backend auf Render.com (15 Minuten)

### Schritt 1: GitHub Repository erstellen

1. **Öffnen Sie:** https://github.com/new
2. **Repository Name:** `cryptoquant-backend`
3. **Description:** `CryptoQuant Backend API`
4. **Public** oder **Private** (egal, beide funktionieren)
5. ❌ **NICHT** "Initialize with README" ankreuzen
6. Klicken Sie **"Create repository"**

✅ Sie sehen jetzt eine Seite mit Setup-Anweisungen

---

### Schritt 2: Git auf Ihrem PC installieren (falls nicht vorhanden)

**Windows:**
1. Download: https://git-scm.com/download/win
2. Installieren mit Standard-Einstellungen
3. Terminal öffnen (CMD oder PowerShell)
4. Testen: `git --version`

---

### Schritt 3: Backend Code zu GitHub pushen

**Öffnen Sie PowerShell als Administrator:**

```powershell
# 1. Zum Backend-Ordner navigieren
cd "C:\Users\j\Downloads\imgui-master\imgui-master\backend"

# 2. Git initialisieren
git init

# 3. Alle Dateien hinzufügen
git add .

# 4. Ersten Commit erstellen
git commit -m "Initial backend deployment"

# 5. Branch umbenennen
git branch -M main

# 6. GitHub Repository verbinden (ÄNDERN SIE IHR-USERNAME!)
git remote add origin https://github.com/IHR-USERNAME/cryptoquant-backend.git

# 7. Code hochladen
git push -u origin main
```

⚠️ **WICHTIG:** Ersetzen Sie `IHR-USERNAME` mit Ihrem GitHub Username!

**Bei Aufforderung:**
- Username: Ihr GitHub Username
- Password: Verwenden Sie ein **Personal Access Token** (nicht Ihr normales Password!)

**Personal Access Token erstellen:**
1. GitHub → Einstellungen → Developer Settings → Personal Access Tokens → Tokens (classic)
2. "Generate new token (classic)"
3. Name: "Render Deployment"
4. Ablaufdatum: "No expiration" (oder 90 Tage)
5. Scope: ✅ **repo** (alle Repo-Rechte)
6. "Generate token"
7. ⚠️ **TOKEN KOPIEREN UND SICHER SPEICHERN!**

Verwenden Sie diesen Token als "Password" beim Push!

---

### Schritt 4: Render.com Account erstellen

1. **Öffnen Sie:** https://render.com
2. Klicken Sie **"Get Started for Free"**
3. **"Sign up with GitHub"** (empfohlen!)
4. GitHub Account autorisieren
5. ✅ Account erstellt!

---

### Schritt 5: PostgreSQL Datenbank erstellen

1. **Im Render Dashboard:** Klicken Sie **"New +"** oben rechts
2. Wählen Sie **"PostgreSQL"**
3. **Konfiguration:**
   ```
   Name: cryptoquant-db
   Database: cryptoquant
   User: cryptoquant_user
   Region: Frankfurt (oder näher an Ihnen)
   Instance Type: Free
   ```
4. Klicken Sie **"Create Database"**
5. ⏳ Warten Sie 1-2 Minuten...

**WICHTIG: Database URL kopieren!**
1. Wenn fertig, klicken Sie auf die Datenbank
2. Scrollen Sie zu **"Connections"**
3. Kopieren Sie die **"Internal Database URL"**
   - Sieht aus wie: `postgresql://user:pass@host.internal:5432/db`
4. 📋 **Speichern Sie diese URL!** (Brauchen wir gleich)

---

### Schritt 6: Web Service erstellen (Backend API)

1. **Im Render Dashboard:** Klicken Sie wieder **"New +"**
2. Wählen Sie **"Web Service"**
3. Klicken Sie **"Connect a repository"**
4. **GitHub autorisieren** (falls gefragt)
5. **Wählen Sie:** Ihr `cryptoquant-backend` Repository
6. Klicken Sie **"Connect"**

**Service Konfiguration:**
```
Name: cryptoquant-api
Region: Frankfurt (oder gleiche wie Datenbank)
Branch: main
Root Directory: (leer lassen)
Runtime: Node
Build Command: npm install
Start Command: npm start
Instance Type: Free
```

**Klicken Sie NOCH NICHT auf "Create"!**

---

### Schritt 7: Environment Variables hinzufügen

**Scrollen Sie nach unten zu "Environment Variables"**

Klicken Sie **"Add Environment Variable"** und fügen Sie JEDE dieser Zeilen einzeln hinzu:

```
NODE_ENV = production
PORT = 10000
DATABASE_URL = [Ihre Database URL von Schritt 5]
JWT_SECRET = Ihr-Super-Geheimer-Schluessel-123456
EMAIL_HOST = smtp.gmail.com
EMAIL_PORT = 587
EMAIL_USER = ihre-email@gmail.com
EMAIL_PASS = [Ihr Gmail App Password - siehe unten]
FRONTEND_URL = https://cryptoquant.info
```

**Gmail App Password erstellen:**
1. Google Account → https://myaccount.google.com/security
2. **2-Step Verification** aktivieren (falls noch nicht)
3. Zurück zu Security → Suchen Sie "App passwords"
4. "Select app" → Mail
5. "Select device" → Other → "CryptoQuant"
6. "Generate"
7. **16-stelliges Password kopieren** (ohne Leerzeichen)
8. Dieses Password als `EMAIL_PASS` einfügen

**Jetzt klicken Sie:** **"Create Web Service"**

⏳ **Warten Sie 3-5 Minuten** während Render Ihr Backend deployed...

✅ **Wenn fertig:** Oben sehen Sie eine URL wie `https://cryptoquant-api.onrender.com`

📋 **KOPIEREN SIE DIESE URL!** (Brauchen wir für Frontend)

---

## TEIL 2: Frontend auf Stellar Hosting (10 Minuten)

### Schritt 8: Frontend Dateien vorbereiten

**Ändern Sie die API URL:**

1. Öffnen Sie: `C:\Users\j\Downloads\imgui-master\imgui-master\api-config.js`
2. Finden Sie Zeile 3:
   ```javascript
   const API_URL = 'http://localhost:5000/api';
   ```
3. Ändern Sie zu:
   ```javascript
   const API_URL = 'https://cryptoquant-api.onrender.com/api';
   ```
   (Verwenden Sie IHRE Render URL von Schritt 7!)
4. **Speichern Sie die Datei!**

---

### Schritt 9: Dateien auf Stellar hochladen

**Methode A: cPanel File Manager (Einfach)**

1. **Login zu Namecheap:** https://www.namecheap.com
2. **Dashboard → Hosting List**
3. Bei `cryptoquant.info` → **"Manage"**
4. **"Go to cPanel"**
5. Suchen Sie **"File Manager"**
6. Öffnen Sie den Ordner **`public_html`**
7. **Löschen Sie** alle Standard-Dateien (index.html, etc.)
8. Klicken Sie **"Upload"** oben
9. **Wählen Sie ALLE diese Dateien aus** Ihrem PC:

```
Von: C:\Users\j\Downloads\imgui-master\imgui-master\

HTML Dateien:
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

JavaScript Dateien:
✅ api-config.js (DIE GEÄNDERTE VERSION!)
✅ auth.js
✅ dashboard.js
✅ quantification.js
✅ deposit-auto.js
✅ withdraw.js
✅ team.js
✅ admin.js
✅ notifications.js
✅ support-widget.js

CSS Dateien:
✅ styles.css
✅ auth-styles.css
✅ pages-styles.css
✅ dashboard-styles.css
✅ dashboard-banner.css
✅ quantification-styles.css
✅ support-widget.css
```

10. Warten Sie bis Upload fertig ist (kann 1-2 Min dauern)
11. ✅ **Fertig!**

---

**Methode B: FTP (Schneller für viele Dateien)**

1. **Download FileZilla:** https://filezilla-project.org/download.php?type=client
2. **Installieren**
3. **FTP Credentials in cPanel erstellen:**
   - cPanel → "FTP Accounts"
   - "Create FTP Account"
   - Username: `cryptoquant`
   - Password: (ein sicheres Password)
   - Directory: `public_html`
   - "Create FTP Account"

4. **FileZilla öffnen:**
   - Host: `ftp.cryptoquant.info`
   - Username: `cryptoquant@cryptoquant.info`
   - Password: [Ihr FTP Password]
   - Port: `21`
   - "Quickconnect"

5. **Dateien übertragen:**
   - Links: Ihr lokaler PC (`C:\Users\j\Downloads\imgui-master\imgui-master\`)
   - Rechts: Server (`/public_html`)
   - Ziehen Sie alle Dateien von links nach rechts
   - Warten Sie bis Upload fertig

---

### Schritt 10: Testen!

**Öffnen Sie:** https://cryptoquant.info

✅ **Sie sollten Ihre Webseite sehen!**

**Testen Sie:**
1. Register → Account erstellen
2. Email Code erhalten & verifizieren
3. Login
4. Dashboard öffnen
5. Deposit-Adresse generieren
6. Quantification klicken

---

## TEIL 3: Datenbank initialisieren

**Datenbank Tables erstellen:**

1. **Render.com → Ihre PostgreSQL Datenbank**
2. Klicken Sie **"Connect"** → **"PSQL Command"**
3. Kopieren Sie den Befehl
4. Öffnen Sie **PowerShell**
5. Fügen Sie den Befehl ein (pgAdmin muss installiert sein)

**ODER einfacher:**

1. Klicken Sie **"Connect"** → **"External Database URL"**
2. Benutzen Sie ein Tool wie **pgAdmin** oder **DBeaver**
3. Verbinden Sie sich zur Datenbank
4. Führen Sie alle CREATE TABLE Statements aus

**Die SQL Statements finden Sie in:**
`C:\Users\j\Downloads\imgui-master\imgui-master\backend\scripts\`

Führen Sie aus:
- `initDatabase.js` (oder manuell die CREATE TABLE Befehle)
- `createAdmin.js` (Admin Account erstellen)

---

## ✅ GESCHAFFT!

**Ihre Webseite ist jetzt LIVE!**

🌐 **Frontend:** https://cryptoquant.info
🔧 **Backend:** https://cryptoquant-api.onrender.com
🗄️ **Database:** PostgreSQL auf Render.com

---

## 🆘 Hilfe bei Problemen

### "502 Bad Gateway" Fehler
- Backend ist noch am Starten (warten Sie 2-3 Min)
- Oder Backend ist "eingeschlafen" (Render Free schläft nach 15 Min)
- Lösung: Rufen Sie die Backend URL direkt auf zum Aufwecken

### "CORS Error" im Browser Console
- Überprüfen Sie `api-config.js` - richtige URL?
- In Render Environment Variables: `FRONTEND_URL = https://cryptoquant.info`

### Email kommt nicht an
- Gmail App Password korrekt?
- 2FA bei Gmail aktiviert?
- Überprüfen Sie Spam-Ordner

### Datei Upload Fehler
- Datei zu groß? (max 2MB bei Stellar)
- Alle Dateien gleichzeitig? Versuchen Sie Batches

---

## 💡 Nächste Schritte

1. **SSL/HTTPS:** Namecheap aktiviert automatisch Let's Encrypt SSL (kann 24h dauern)
2. **Custom Domain Email:** Erstellen Sie info@cryptoquant.info in cPanel
3. **Monitoring:** UptimeRobot.com (gratis) hinzufügen um Backend wach zu halten
4. **Backups:** Render macht Auto-Backups, aber auch lokal speichern!

---

Bei Fragen oder Problemen: Einfach fragen! 🚀


