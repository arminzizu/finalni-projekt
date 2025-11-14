# Kako osvježiti kod na Vercel-u

## Problem: Vercel pokazuje stari kod iako je push-ano na GitHub

### Rješenje 1: Provjeri da li je push uspješan

1. **Provjeri GitHub**:
   - Idi na: https://github.com/arminzizu/office-app-v2
   - Provjeri da li vidiš najnoviji commit: "Update: Mobile responsive design..."
   - Provjeri da li su fajlovi ažurirani

2. **Ako nije push-ano, push-uj**:
   ```bash
   git push origin master
   ```
   
   Ako traži autentifikaciju:
   - Koristi GitHub Personal Access Token umjesto password-a
   - Ili koristi SSH umjesto HTTPS

---

### Rješenje 2: Trigger-uj redeploy na Vercel-u

#### Opcija A: Preko Vercel Dashboard-a (Najlakše)

1. **Idi na Vercel Dashboard**:
   - https://vercel.com/dashboard
   - Prijavi se

2. **Pronađi svoj projekt**:
   - Klikni na "office-app-v2" (ili kako se zove)

3. **Idi na Deployments tab**

4. **Pronađi posljednji deploy** i klikni na "..." (tri tačke)

5. **Klikni "Redeploy"**

6. **Potvrdi redeploy**

7. **Sačekaj da se build završi** (obično 1-2 minute)

8. **Hard refresh u browseru**: `Ctrl + Shift + R`

---

#### Opcija B: Push novi commit (trigger-uje auto-deploy)

1. **Napravi mali commit**:
   ```bash
   git commit --allow-empty -m "Trigger Vercel redeploy"
   git push origin master
   ```

2. **Vercel će automatski detektovati push i rebuild-ati**

3. **Sačekaj da se build završi**

---

#### Opcija C: Preko Vercel CLI

1. **Instaliraj Vercel CLI** (ako nije instaliran):
   ```bash
   npm install -g vercel
   ```

2. **Login**:
   ```bash
   vercel login
   ```

3. **Deploy**:
   ```bash
   vercel --prod
   ```

---

### Rješenje 3: Provjeri Vercel Settings

1. **Idi na Project Settings → Git**

2. **Provjeri**:
   - Da li je povezan pravi GitHub repo
   - Da li je branch "master" (ili "main")
   - Da li je Production Branch postavljen na "master"

3. **Ako nije, promijeni i redeploy**

---

### Rješenje 4: Provjeri Build Logs

1. **U Vercel Dashboard-u, klikni na posljednji deploy**

2. **Klikni na "Build Logs"**

3. **Provjeri da li ima grešaka**:
   - Ako ima grešaka, popravi ih
   - Ako je build uspješan ali kod je stari, probaj redeploy

---

### Rješenje 5: Provjeri Environment Variables

1. **Idi na Project Settings → Environment Variables**

2. **Provjeri da su sve Firebase varijable postavljene**:
   - `NEXT_PUBLIC_FIREBASE_API_KEY`
   - `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
   - `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
   - `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
   - `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
   - `NEXT_PUBLIC_FIREBASE_APP_ID`

3. **Ako su promijenjene, redeploy**

---

## Najbrži Put ⚡

1. Idi na https://vercel.com/dashboard
2. Klikni na svoj projekt
3. Klikni na posljednji deploy → "..." → "Redeploy"
4. Sačekaj 1-2 minute
5. Hard refresh u browseru (`Ctrl + Shift + R`)

---

## Troubleshooting

**Problem**: Vercel ne detektuje promjene
**Rješenje**: Provjeri da li je GitHub repo povezan i da li je push uspješan

**Problem**: Build fails
**Rješenje**: Provjeri Build Logs i popravi greške

**Problem**: Kod je ažuriran ali još uvijek vidiš staro
**Rješenje**: Hard refresh u browseru + provjeri da li je build uspješan

