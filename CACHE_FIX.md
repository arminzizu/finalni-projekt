# Kako osvježiti kod nakon promjena

## Problem: Vidim stari kod iako sam push-ao promjene

### Rješenje 1: Lokalno (localhost:3000)

1. **Zaustavi dev server** (Ctrl+C u terminalu gdje radi `npm run dev`)

2. **Obriši cache**:
   ```bash
   # Windows PowerShell:
   Remove-Item -Recurse -Force .next
   
   # Ili jednostavno:
   rmdir /s /q .next
   ```

3. **Restart-uj dev server**:
   ```bash
   npm run dev
   ```

4. **Hard refresh u browseru**:
   - **Chrome/Edge**: `Ctrl + Shift + R` ili `Ctrl + F5`
   - **Firefox**: `Ctrl + Shift + R` ili `Ctrl + F5`
   - **Safari**: `Cmd + Shift + R`

5. **Ili obriši browser cache**:
   - Otvori DevTools (F12)
   - Desni klik na Refresh dugme
   - Odaberi "Empty Cache and Hard Reload"

---

### Rješenje 2: Online (Vercel/Firebase)

Ako gledaš online verziju:

1. **Provjeri da li je build prošao**:
   - Idi na Vercel dashboard
   - Provjeri da li je posljednji deploy uspješan

2. **Redeploy** (ako treba):
   - U Vercel dashboard-u klikni "Redeploy" na posljednjem deploy-u
   - Ili push-uj novi commit (čak i mali) da trigger-uje novi build

3. **Hard refresh u browseru** (kao gore)

4. **Provjeri environment varijable**:
   - U Vercel Settings → Environment Variables
   - Provjeri da su sve varijable postavljene

---

### Rješenje 3: Browser Cache Problem

Ako i dalje vidiš stari kod:

1. **Otvori u Incognito/Private mode**:
   - Chrome: `Ctrl + Shift + N`
   - Firefox: `Ctrl + Shift + P`
   - Edge: `Ctrl + Shift + N`

2. **Ili obriši cache za taj sajt**:
   - Chrome: Settings → Privacy → Clear browsing data → Cached images and files
   - Firefox: Settings → Privacy → Clear Data → Cached Web Content

---

### Rješenje 4: Service Worker Cache

Ako aplikacija koristi Service Worker:

1. Otvori DevTools (F12)
2. Application tab → Service Workers
3. Klikni "Unregister" za sve service workere
4. Hard refresh

---

## Brzi Fix Script

Kreiraj `refresh.bat` fajl:

```batch
@echo off
echo Stopping dev server...
taskkill /F /IM node.exe 2>nul
echo Cleaning cache...
if exist .next rmdir /s /q .next
echo Starting dev server...
start cmd /k "npm run dev"
echo Done! Press any key to exit...
pause >nul
```

Zatim samo pokreni `refresh.bat` kada trebaš osvježiti.

