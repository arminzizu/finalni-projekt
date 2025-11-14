# Koraci za Deploy na Firebase Hosting

## ✅ Što je već urađeno

- ✅ `firebase.json` kreiran
- ✅ `firestore.rules` postavljene (svaki korisnik vidi samo svoje podatke)
- ✅ `next.config.ts` ažuriran za static export
- ✅ `.gitignore` ažuriran
- ✅ Kod već koristi subcollection strukturu (`users/{userId}/obracuni`)

---

## 📋 Koraci za Deploy

### 1. Instaliraj Firebase CLI

```bash
npm install -g firebase-tools
```

### 2. Login na Firebase

```bash
firebase login
```

- Otvorit će se browser za login
- Prijavi se sa Google računom

### 3. Inicijaliziraj Firebase (ako već nije)

```bash
firebase init
```

**Odaberi opcije:**
- ✅ **Hosting** (pritisni Space, Enter)
- ✅ **Firestore** (za rules)
- Odaberi postojeći projekat
- **Public directory**: `out` (za Next.js static export)
- **Single-page app**: **No**
- **GitHub deploys**: **No** (možeš kasnije)

### 4. Build aplikacije

```bash
npm run build
```

Ovo će kreirati `out/` folder sa statičkim fajlovima.

### 5. Deploy na Firebase

```bash
firebase deploy
```

Ili samo hosting:
```bash
firebase deploy --only hosting
```

Ili samo Firestore rules:
```bash
firebase deploy --only firestore:rules
```

### 6. Aplikacija je online! 🎉

Aplikacija će biti dostupna na:
- `https://your-project-id.web.app`
- `https://your-project-id.firebaseapp.com`

---

## 🔒 Firestore Security Rules

Rules su već postavljene u `firestore.rules`:
- Svaki korisnik vidi samo svoje podatke
- Struktura: `users/{userId}/obracuni/{datum}`
- Automatska izolacija podataka po korisniku

---

## ⚠️ Važne napomene

1. **Static Export ograničenja**:
   - Ne možeš koristiti API routes (`/api/*`)
   - Ne možeš koristiti server-side rendering
   - Sve mora biti client-side

2. **Firestore Rules**:
   - Automatski deploy-ovane sa `firebase deploy`
   - Svaki korisnik vidi samo svoje podatke

3. **localStorage**:
   - Aplikacija i dalje koristi localStorage kao primarni izvor
   - Firestore je opcionalan backup/sinkronizacija

---

## 🔄 Ažuriranje aplikacije

Nakon promjena u kodu:

1. **Build**:
   ```bash
   npm run build
   ```

2. **Deploy**:
   ```bash
   firebase deploy --only hosting
   ```

---

## 📱 Custom Domain

1. **U Firebase Console**:
   - Hosting → Add custom domain
   - Unesi svoj domen
   - Slijedi upute za DNS postavke

---

## 🆘 Troubleshooting

**Problem**: Build fails
**Rješenje**: Provjeri da je `output: 'export'` u `next.config.ts`

**Problem**: "No such file or directory: out"
**Rješenje**: Pokreni `npm run build` prije deploy-a

**Problem**: Korisnici vide tuđe podatke
**Rješenje**: Provjeri da su Firestore rules deploy-ovane (`firebase deploy --only firestore:rules`)

