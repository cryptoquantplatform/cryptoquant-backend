# 🚀 Deployment-Anleitung - 404 Fehler Behebung

## ✅ Was wurde geändert?

Die folgenden Dateien wurden aktualisiert, um automatisch zwischen lokalem und Produktions-Server zu wechseln:

1. **api-config.js** - Erkennt automatisch, ob lokal oder auf cryptoquant.info
2. **admin.js** - Gleiche Auto-Erkennung für Admin-Panel

## 📤 Deployment-Schritte

### Option 1: Via FTP/SFTP (Empfohlen)

1. Öffnen Sie Ihren FTP-Client (z.B. FileZilla)
2. Verbinden Sie sich mit **cryptoquant.info**
3. Laden Sie diese Dateien hoch (überschreiben Sie die alten):
   - `api-config.js`
   - `admin.js`

### Option 2: Via Hosting Control Panel (cPanel, Plesk, etc.)

1. Melden Sie sich bei Ihrem Hosting-Panel an
2. Gehen Sie zum File Manager
3. Navigieren Sie zum Website-Ordner (normalerweise `public_html` oder `www`)
4. Laden Sie diese Dateien hoch:
   - `api-config.js`
   - `admin.js`

### Option 3: Via Git (wenn Sie Git verwenden)

```bash
git add api-config.js admin.js
git commit -m "Fix 404 error - Auto-detect API URL for production"
git push origin main
```

## 🔍 Was macht die Änderung?

**Vorher:** Hardcodierte URL
```javascript
const API_URL = 'http://localhost:5000/api';  // Funktioniert nur lokal!
```

**Nachher:** Automatische Erkennung
```javascript
const isLocalhost = window.location.hostname === 'localhost' || 
                    window.location.hostname === '127.0.0.1';

const API_URL = isLocalhost 
    ? 'http://localhost:5000/api'  // Lokal
    : 'https://cryptoquant-api.onrender.com/api';  // Production
```

## 🧪 Nach dem Deployment testen:

1. **Von anderem Gerät**: Öffnen Sie `https://cryptoquant.info`
2. Testen Sie diese Seiten:
   - Dashboard
   - Admin-Login
   - Deposit
   - Withdrawal
   
3. Öffnen Sie die Browser-Konsole (F12) und prüfen Sie:
   - Keine 404 Fehler mehr
   - API-Aufrufe gehen zu `cryptoquant-api.onrender.com`

## ⚠️ Wichtige Hinweise:

1. **Backend muss laufen**: Stellen Sie sicher, dass `cryptoquant-api.onrender.com` aktiv ist
2. **CORS-Einstellungen**: Backend muss `cryptoquant.info` erlauben
3. **HTTPS**: Produktionsserver sollte HTTPS verwenden

## 🔧 Backend CORS überprüfen

Ihre Backend `.env` Datei sollte haben:
```
FRONTEND_URL=https://cryptoquant.info
```

Oder im Backend `server.js`:
```javascript
cors({
    origin: ['https://cryptoquant.info', 'http://localhost:8080'],
    credentials: true
})
```

## ✅ Checkliste:

- [ ] `api-config.js` hochgeladen
- [ ] `admin.js` hochgeladen
- [ ] Browser-Cache geleert (Strg+Shift+Del)
- [ ] Von anderem Gerät getestet
- [ ] Keine 404 Fehler mehr in der Konsole
- [ ] Backend CORS konfiguriert

## 🆘 Wenn es immer noch nicht funktioniert:

1. **Browser-Cache leeren**: Strg+Shift+Del → Alle Daten löschen
2. **Inkognito-Modus testen**: Strg+Shift+N
3. **Browser-Konsole öffnen** (F12) und prüfen:
   - Welche URL wird aufgerufen?
   - Was ist die genaue Fehlermeldung?

4. **Backend-Status prüfen**:
   ```
   https://cryptoquant-api.onrender.com/api/health
   ```
   Sollte zurückgeben:
   ```json
   {"success":true,"message":"DCPTG API is running"}
   ```

## 📞 Support

Falls Sie weitere Probleme haben:
- Überprüfen Sie die Backend-Logs auf Render.com
- Stellen Sie sicher, dass Render.com nicht im "Sleep-Modus" ist
- Prüfen Sie, ob die Domain korrekt auf den Server zeigt

---

**Erstellt:** 23. Oktober 2025
**Für:** cryptoquant.info Deployment






