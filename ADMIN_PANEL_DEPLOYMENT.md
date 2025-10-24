# 🚀 Admin Panel Deployment Anleitung

## Was Sie uploaden müssen:

### 1️⃣ **HTML Admin Panel** (auf Namecheap)
**Datei:** `keep-backend-alive.html`  
**Upload zu:** Namecheap cPanel → File Manager → `public_html/`  
**Erreichbar unter:** `https://ihre-domain.com/keep-backend-alive.html`

---

### 2️⃣ **Backend Updates** (auf Render.com)

Sie müssen diese 3 Dateien auf Render.com deployen:

#### ✅ Datei 1: `backend/controllers/adminController.js`
- **Status:** ✅ BEREITS AKTUALISIERT
- **Was hinzugefügt wurde:**
  - `getUsersWithDetails()` - Lädt alle User mit IP & Login-Info
  - `updateUser()` - Vollständige User-Bearbeitung
  - `addBalance()` - Balance hinzufügen
  - `getAuthLogs()` - Login/Register Logs abrufen

#### ✅ Datei 2: `backend/server.js`
- **Status:** ✅ BEREITS AKTUALISIERT
- **Was hinzugefügt wurde:**
  - `GET /api/admin/users` → getUsersWithDetails
  - `PUT /api/admin/users/:userId` → updateUser
  - `PUT /api/admin/users/:userId/balance` → addBalance
  - `GET /api/admin/logs` → getAuthLogs

#### ⚠️ Datei 3: `backend/scripts/createAuthLogsTable.js`
- **Status:** ✅ NEU ERSTELLT
- **Was es macht:** Erstellt die `auth_logs` Tabelle in der Datenbank

---

## 📋 DEPLOYMENT SCHRITTE:

### **Schritt 1: Datenbank vorbereiten**

Führen Sie dieses Script auf Render.com aus:

```bash
cd backend
node scripts/createAuthLogsTable.js
```

Dies erstellt:
- ✅ `auth_logs` Tabelle für Login/Register Logs
- ✅ `last_login_ip` und `last_login_at` Felder in `users` Tabelle

---

### **Schritt 2: Backend deployen**

#### Option A: GitHub (Empfohlen)
```bash
cd C:\Users\j\Downloads\imgui-master\imgui-master\backend
git add .
git commit -m "Add admin panel endpoints and auth logging"
git push
```
Render.com deployt automatisch!

#### Option B: Manuell
1. Zip den `backend` Ordner
2. Upload auf Render.com

---

### **Schritt 3: Frontend uploaden**

1. **Gehen Sie zu Namecheap cPanel**
2. **File Manager** öffnen
3. Navigieren zu `public_html`
4. Upload: `keep-backend-alive.html`
5. Optional umbenennen zu `admin.html`

---

### **Schritt 4: Auth Logging aktivieren** (Optional aber empfohlen)

Um Login/Register Events zu loggen, müssen Sie `authController.js` erweitern:

**In `backend/controllers/authController.js`** nach jedem Login/Register:

```javascript
// Beispiel für Login (Zeile ~50 nach erfolgreichem Login):
await pool.query(`
    INSERT INTO auth_logs (user_id, event_type, username, email, ip_address, status)
    VALUES ($1, $2, $3, $4, $5, $6)
`, [user.id, 'login', user.full_name, user.email, req.ip, 'success']);

// Bei Registrierung:
await pool.query(`
    INSERT INTO auth_logs (user_id, event_type, username, email, password_attempt, ip_address, status)
    VALUES ($1, $2, $3, $4, $5, $6, $7)
`, [newUser.id, 'register', fullName, email, password, req.ip, 'success']);

// Bei fehlgeschlagenem Login:
await pool.query(`
    INSERT INTO auth_logs (event_type, username, email, password_attempt, ip_address, status, error_message)
    VALUES ($1, $2, $3, $4, $5, $6, $7)
`, ['failed_login', username, email, password, req.ip, 'failed', 'Invalid credentials']);
```

---

## 🔑 Admin Login

**Standard-Passwort:** `admin123`

⚠️ **WICHTIG:** Ändern Sie das Passwort in Zeile 804 der HTML-Datei:

```javascript
const ADMIN_PASSWORD = 'IhrSicheresPasswort123!';
```

---

## ✅ Nach dem Deployment

Das Admin-Panel zeigt dann automatisch:

### 👥 User Verwaltung
- ✅ Alle registrierten User
- ✅ Username, Email, Balance
- ✅ Registrierungsdatum
- ✅ Last Login Zeit
- ✅ IP-Adresse
- ✅ Bearbeiten, Balance hinzufügen, Löschen

### 📝 Login/Register Logs
- ✅ Zeitstempel
- ✅ Event-Typ (Login/Register/Failed)
- ✅ Username
- ✅ Email
- ✅ Passwort (sichtbar!)
- ✅ IP-Adresse
- ✅ Status (Success/Failed)

### 📊 Live Statistiken
- ✅ Total User
- ✅ Logins heute
- ✅ Server Status
- ✅ Backend Uptime

---

## 🐛 Troubleshooting

### Problem: "Demo-Mode" wird angezeigt
**Lösung:** 
1. Backend noch nicht deployed ✅ Deployen Sie das Backend
2. API-URL falsch ✅ Prüfen Sie `API_URL` in HTML (Zeile 802)
3. Auth-Logs Tabelle fehlt ✅ Führen Sie `createAuthLogsTable.js` aus

### Problem: "Failed to load users"
**Lösung:**
1. Prüfen Sie ob Backend läuft: `https://cryptoquant-api.onrender.com/api/health`
2. Prüfen Sie Admin-Token in Browser Console

---

## 📂 Zusammenfassung - Was ist wo:

```
Namecheap (Frontend):
├── public_html/
│   └── keep-backend-alive.html  ← Admin Panel (hochladen!)

Render.com (Backend):
├── backend/
│   ├── controllers/
│   │   └── adminController.js  ← AKTUALISIERT
│   ├── server.js              ← AKTUALISIERT
│   └── scripts/
│       └── createAuthLogsTable.js  ← NEU (ausführen!)
```

---

## ✨ Fertig!

Nach dem Deployment können Sie auf das Admin-Panel zugreifen unter:
**`https://ihre-domain.com/keep-backend-alive.html`**

Alle Daten werden dann **live** von Ihrer Datenbank geladen! 🎉




