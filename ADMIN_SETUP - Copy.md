# 🔐 Admin Panel Setup Guide

## Übersicht

Das Admin Panel gibt dir **VOLLE KONTROLLE** über deine CryptoQuant Plattform:

- 👥 **User Management**: Alle User sehen, bearbeiten, löschen, Balance ändern
- 💰 **Deposits**: Alle Einzahlungen genehmigen oder ablehnen
- 💸 **Withdrawals**: Alle Auszahlungen verwalten
- 📊 **Statistics**: Echtzeit-Statistiken der gesamten Plattform
- ⚙️ **Settings**: Alle System-Einstellungen ändern (Min. Deposit, Click %, etc.)
- 🔐 **Security**: Separater Admin-Login, Password ändern

---

## ⚡ Quick Start

### 1. Datenbank aktualisieren

Öffne PowerShell im Backend-Ordner:

```powershell
cd c:\Users\j\Downloads\imgui-master\imgui-master\backend
npm run init-db
```

**Was passiert:**
- ✅ Erstellt `admins` Tabelle
- ✅ Erstellt `system_settings` Tabelle
- ✅ Fügt Default-Einstellungen ein

---

### 2. Admin-User erstellen

```powershell
npm run create-admin
```

**Du bekommst:**
```
╔════════════════════════════════════════╗
║   🔐 ADMIN CREDENTIALS                 ║
╠════════════════════════════════════════╣
║   Username: admin                      ║
║   Password: Admin123!                  ║
║   Email: admin@cryptoquant.com         ║
╠════════════════════════════════════════╣
║   ⚠️  CHANGE PASSWORD AFTER LOGIN!     ║
╚════════════════════════════════════════╝
```

**⚠️ WICHTIG:**
- Diese Credentials sind **NUR FÜR DEN ERSTEN LOGIN**
- **ÄNDERE DAS PASSWORT SOFORT** nach dem ersten Login!

---

### 3. Backend starten

```powershell
npm start
```

---

### 4. Admin Panel öffnen

Öffne in deinem Browser:

```
file:///C:/Users/j/Downloads/imgui-master/imgui-master/admin-login.html
```

Oder klicke einfach auf: **`admin-login.html`**

---

## 🎯 Login

1. **Öffne** `admin-login.html`
2. **Gib ein:**
   - Username: `admin`
   - Password: `Admin123!`
3. **Klicke** auf "Login to Admin Panel"

➡️ Du wirst automatisch zum Admin Dashboard weitergeleitet!

---

## 📊 Admin Panel Features

### 1. Dashboard Overview

**Zeigt dir:**
- Total Users (Gesamt-User)
- Active Users (Aktive User in letzten 30 Tagen)
- Total Balance (Gesamtguthaben auf Plattform)
- Total Earnings (Gesamte ausgeschüttete Earnings)
- Pending Deposits (Wartende Einzahlungen)
- Pending Withdrawals (Wartende Auszahlungen)
- Today's Clicks (Heutige Clicks)
- Total Referrals (Gesamt-Referrals)

---

### 2. User Management

**Was du kannst:**
- ✅ **Alle User sehen** (mit Suche und Pagination)
- ✅ **User Details anzeigen** (Referrals, Deposits, Clicks, etc.)
- ✅ **Balance ändern** (+ oder - jeder Betrag)
- ✅ **User aktivieren/deaktivieren** (Account sperren/entsperren)
- ✅ **User löschen** (komplett entfernen)

**Wie:**
1. Klicke auf "👥 Users"
2. Such nach einem User (Name, Email, Referral Code)
3. Klicke "View" für Details
4. Klicke "Disable" um User zu sperren

**Balance ändern:**
1. Klicke "View" bei einem User
2. Gib Betrag ein:
   - **Positiv** (+100) = Geld hinzufügen
   - **Negativ** (-50) = Geld abziehen
3. Optional: Grund angeben
4. Klicke "Update Balance"

---

### 3. Deposit Management

**Was du kannst:**
- ✅ **Alle Deposits sehen** (Filter: All, Pending, Confirmed, Rejected)
- ✅ **Deposits genehmigen** → User bekommt Geld auf Balance
- ✅ **Deposits ablehnen** → Kein Geld für User

**Workflow:**
1. User macht Deposit auf der Website
2. Status = "Pending" (gelb)
3. Du siehst es im Admin Panel
4. Du klickst **"Approve"**:
   - Optional: TX Hash eingeben
   - Balance wird automatisch dem User gutgeschrieben
5. Oder **"Reject"**: Deposit wird abgelehnt

**Filter:**
- **Pending**: Nur wartende Deposits
- **Confirmed**: Genehmigte Deposits
- **Rejected**: Abgelehnte Deposits
- **All**: Alle Deposits

---

### 4. Withdrawal Management

**Was du kannst:**
- ✅ **Alle Withdrawals sehen** (Filter: All, Processing, Completed, Rejected)
- ✅ **Withdrawals abschließen** mit TX Hash
- ✅ **Withdrawals ablehnen** → Geld geht zurück an User

**Workflow:**
1. User beantragt Withdrawal
2. Geld wird SOFORT von Balance abgezogen
3. Status = "Processing" (gelb)
4. Du siehst es im Admin Panel
5. Du sendest die Crypto an den User
6. Du klickst **"Complete"**:
   - TX Hash eingeben (PFLICHT!)
   - Status wird "Completed" (grün)
7. Oder **"Reject"**:
   - Geld wird zurück an User gegeben
   - Status wird "Rejected" (rot)

**Filter:**
- **Processing**: Zu bearbeitende Withdrawals
- **Completed**: Abgeschlossene Withdrawals
- **Rejected**: Abgelehnte Withdrawals
- **All**: Alle Withdrawals

---

### 5. System Settings

**Was du ändern kannst:**

**Deposit & Withdrawal:**
- Minimum Deposit (EUR): z.B. `75`
- Minimum Withdrawal: z.B. `10`
- Withdrawal Fee (%): z.B. `0` (0% = keine Fee)

**Click System:**
- Min Click % Earnings: z.B. `5` (5% per Click)
- Max Click % Earnings: z.B. `8` (8% per Click)

**User Levels:**
- Level 1 Daily Clicks: `3` (3 Clicks/Tag)
- Level 2 Daily Clicks: `5` (5 Clicks/Tag)
- Level 2 Referrals Required: `5` (5 Referrals für Level 2)
- Level 3 Daily Clicks: `7` (7 Clicks/Tag)
- Level 3 Referrals Required: `10` (10 Referrals für Level 3)

**Referral Commission:**
- Min Commission (%): z.B. `3`
- Max Commission (%): z.B. `5`

**Wie:**
1. Klicke auf "⚙️ Settings"
2. Ändere die Werte
3. Klicke "💾 Save All Settings"
4. Fertig! Die neuen Werte gelten SOFORT für alle User

---

### 6. Password ändern

**So änderst du dein Admin-Passwort:**

1. Klicke auf "⚙️ Settings"
2. Scrolle runter zu "Change Admin Password"
3. Gib ein:
   - Current Password: `Admin123!` (oder dein aktuelles)
   - New Password: z.B. `MeinSuperSicheresPasswort123!`
   - Confirm New Password: (nochmal dasselbe)
4. Klicke "🔐 Change Password"
5. Fertig! Beim nächsten Login das neue Passwort verwenden

**⚠️ Passwort-Anforderungen:**
- Mindestens 8 Zeichen
- Am besten: Groß-/Kleinbuchstaben, Zahlen, Sonderzeichen

---

## 🔐 Security

### Admin vs. User Token

- **User Token** = Für normale User (Dashboard, Deposits, etc.)
- **Admin Token** = Für Admins (Admin Panel, User Management, etc.)

**Sie sind GETRENNT!**
- User können NICHT aufs Admin Panel zugreifen
- Admin Token ist nur 24h gültig
- Nach Logout musst du dich neu einloggen

### Token Speicherung

Tokens werden in `localStorage` gespeichert:
- `adminToken` = JWT für Admin
- `adminUser` = Admin-Info (Username, Email)

### Session Timeout

- Admin Token läuft nach **24 Stunden** ab
- Danach musst du dich neu einloggen

---

## 🛠️ Troubleshooting

### "No admin token" Fehler

**Problem:** Du wurdest ausgeloggt oder Token ist abgelaufen.

**Lösung:**
1. Gehe zu `admin-login.html`
2. Logge dich neu ein

---

### "Invalid credentials" beim Login

**Problem:** Username oder Passwort falsch.

**Lösung:**
1. Standard-Credentials: `admin` / `Admin123!`
2. Falls geändert: Dein neues Passwort verwenden
3. Falls vergessen: Neuen Admin erstellen:
   ```powershell
   cd backend
   npm run create-admin
   ```

---

### Deposits/Withdrawals werden nicht angezeigt

**Problem:** Backend läuft nicht oder Verbindungsfehler.

**Lösung:**
1. Check ob Backend läuft:
   ```powershell
   cd c:\Users\j\Downloads\imgui-master\imgui-master\backend
   npm start
   ```
2. Öffne Browser-Konsole (F12) und schau nach Fehlern
3. Check `api-config.js`: API_BASE_URL muss stimmen

---

### "Failed to load statistics"

**Problem:** Admin-Token ungültig oder Backend-Fehler.

**Lösung:**
1. Logout und neu einloggen
2. Check Backend-Logs in PowerShell
3. Check ob Datenbank-Tabellen existieren:
   ```powershell
   npm run init-db
   ```

---

## 📱 Mobile Support

Das Admin Panel funktioniert auch auf **Tablet und Handy**!

- Sidebar wird kleiner auf Mobile (nur Icons)
- Tabellen sind scrollbar
- Responsive Design

**Aber:** Für optimale Nutzung empfehle ich **Desktop/Laptop**.

---

## 🎨 Admin Panel Features im Detail

### User Details Modal

Wenn du auf "View" bei einem User klickst, siehst du:

**Account Information:**
- ID, Email, Balance, Total Earnings
- Level, Referral Code, Referred By
- Status, Email Verified, Created Date

**Update Balance:**
- Einfach Betrag eingeben (+ oder -)
- Optional: Grund angeben
- Klick "Update Balance" → Sofort aktualisiert!

**Recent Activity:**
- **Referrals**: Letzte 5 Referrals mit Commission
- **Recent Deposits**: Letzte 5 Deposits
- **Recent Clicks**: Letzte 5 Quantification-Clicks

---

## 🚀 Pro-Tipps

### 1. Regelmäßig Deposits checken

- Gehe täglich ins Admin Panel
- Check "💰 Deposits" → Filter: "Pending"
- Approve alle echten Deposits schnell!

### 2. Withdrawals SOFORT bearbeiten

- User warten auf ihr Geld!
- Check "💸 Withdrawals" → Filter: "Processing"
- Sende Crypto, gib TX Hash ein, klick "Complete"

### 3. User-Support

- Wenn ein User ein Problem hat:
- Gehe zu "👥 Users"
- Such nach Email/Name
- Klick "View" → Siehst ALLES über den User
- Kannst Balance korrigieren, Account sperren, etc.

### 4. Settings anpassen

- Am Anfang: Standard-Settings nutzen
- Später: Click % erhöhen für mehr Earnings
- Oder: Min. Deposit ändern (z.B. 100€ statt 75€)

### 5. Statistiken überwachen

- Dashboard zeigt dir:
  - Wie viele User aktiv sind
  - Wie viel Geld auf der Plattform ist
  - Wie viele Pending Deposits/Withdrawals
- Check regelmäßig, damit nichts liegen bleibt!

---

## ❓ FAQ

### Kann ich mehrere Admins erstellen?

Ja! Einfach im Admin-Panel manuell in der Datenbank einen neuen Admin eintragen, oder das Script `createAdmin.js` anpassen.

### Kann ich das Admin-Passwort im Code ändern?

Ja! In `backend/scripts/createAdmin.js`:
```javascript
const password = 'DeinNeuesPasswort123!';
```

### Wo sind die Admin-Seiten?

- `admin-login.html` = Login-Seite
- `admin-dashboard.html` = Admin Panel
- `admin-styles.css` = Styling
- `admin.js` = JavaScript-Logik

### Kann ich das Design ändern?

Ja! Alles in `admin-styles.css`. Es nutzt ein Gradient-Design mit Glasmorphism.

---

## 🎯 Zusammenfassung

**Du hast jetzt:**

✅ **Volles Admin Panel** mit allen Features  
✅ **User Management** (sehen, bearbeiten, löschen, Balance ändern)  
✅ **Deposit Management** (genehmigen, ablehnen)  
✅ **Withdrawal Management** (abschließen, ablehnen)  
✅ **System Settings** (alles anpassbar)  
✅ **Echtzeit-Statistiken** (Dashboard Overview)  
✅ **Sicherer Login** (separater Admin-Token)  

**Alles was du brauchst, um deine Crypto-Plattform zu verwalten!** 🚀

---

## 📞 Support

Falls du Fragen hast:
1. Check die Logs in PowerShell (Backend)
2. Öffne Browser-Konsole (F12) für Frontend-Fehler
3. Check diese Anleitung nochmal

**Viel Erfolg mit deinem Admin Panel! 🔐**


