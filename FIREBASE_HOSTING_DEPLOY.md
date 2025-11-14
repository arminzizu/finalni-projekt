# Kako deploy-ovati na Firebase Hosting sa bazom podataka po korisniku

## Pregled

- **Hosting**: Firebase Hosting (umjesto Vercel-a)
- **Baza podataka**: Firestore - svaki korisnik ima svoju bazu podataka
- **Authentication**: Firebase Auth (već postoji)

---

## Korak 1: Instaliraj Firebase CLI

1. **Instaliraj Firebase CLI**:
   ```bash
   npm install -g firebase-tools
   ```

2. **Login na Firebase**:
   ```bash
   firebase login
   ```
   - Otvorit će se browser za login
   - Prijavi se sa Google računom

---

## Korak 2: Inicijaliziraj Firebase u projektu

1. **U root folderu projekta** (`office-app`), pokreni:
   ```bash
   firebase init
   ```

2. **Odaberi opcije**:
   - ✅ **Hosting** (pritisni Space da označiš, Enter da potvrdiš)
   - ✅ **Firestore** (ako želiš postaviti rules)
   - Enter za nastavak

3. **Odaberi postojeći projekat**:
   - Odaberi svoj Firebase projekat (npr. `finalni-projekt`)

4. **Hosting postavke**:
   - **What do you want to use as your public directory?**: `.next` (za Next.js)
   - **Configure as a single-page app?**: **No** (Next.js ima svoje routing)
   - **Set up automatic builds and deploys with GitHub?**: **No** (možeš kasnije)

5. **Firestore postavke** (ako si odabrao):
   - **What file should be used for Firestore Rules?**: `firestore.rules`
   - **What file should be used for Firestore indexes?**: `firestore.indexes.json`

---

## Korak 3: Konfiguriraj Next.js za Firebase Hosting

### Opcija A: Static Export (Preporučeno za jednostavnije deploy)

1. **Ažuriraj `next.config.ts`**:
   ```typescript
   import type { NextConfig } from "next";

   const nextConfig: NextConfig = {
     output: 'export', // Static export za Firebase Hosting
     images: {
       unoptimized: true, // Potrebno za static export
     },
   };

   export default nextConfig;
   ```

2. **Build aplikacije**:
   ```bash
   npm run build
   ```

3. **Ažuriraj `firebase.json`** (kreira se automatski):
   ```json
   {
     "hosting": {
       "public": "out",
       "ignore": [
         "firebase.json",
         "**/.*",
         "**/node_modules/**"
       ],
       "rewrites": [
         {
           "source": "**",
           "destination": "/index.html"
         }
       ]
     },
     "firestore": {
       "rules": "firestore.rules",
       "indexes": "firestore.indexes.json"
     }
   }
   ```

### Opcija B: Firebase Functions (Za server-side rendering)

Ako želiš koristiti Next.js SSR, trebaš koristiti Firebase Functions. To je složenije, ali omogućava punu Next.js funkcionalnost.

---

## Korak 4: Postavi Firestore Security Rules (VAŽNO!)

1. **Otvori `firestore.rules`** (kreira se automatski)

2. **Postavi pravila** da svaki korisnik vidi samo svoje podatke:

   ```javascript
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       // Pravila za korisničke podatke
       match /users/{userId} {
         // Korisnik može čitati i pisati samo svoje podatke
         allow read, write: if request.auth != null && request.auth.uid == userId;
         
         // Pravila za appName unutar korisničkog dokumenta
         match /appName/{document=**} {
           allow read, write: if request.auth != null && request.auth.uid == userId;
         }
       }
       
       // Pravila za arhivu obračuna - svaki korisnik vidi samo svoje
       match /arhivaObracuna/{documentId} {
         // Provjeri da je korisnik vlasnik dokumenta
         allow read, write: if request.auth != null && 
           resource.data.userId == request.auth.uid;
         
         // Dozvoli kreiranje novog dokumenta ako je userId jednak auth.uid
         allow create: if request.auth != null && 
           request.resource.data.userId == request.auth.uid;
       }
       
       // Pravila za cjenovnik - svaki korisnik ima svoj
       match /cjenovnik/{documentId} {
         allow read, write: if request.auth != null && 
           resource.data.userId == request.auth.uid;
         allow create: if request.auth != null && 
           request.resource.data.userId == request.auth.uid;
       }
     }
   }
   ```

3. **Deploy pravila**:
   ```bash
   firebase deploy --only firestore:rules
   ```

---

## Korak 5: Ažuriraj kod da koristi userId

Trebamo ažurirati kod da sprema `userId` sa svakim dokumentom:

### Primjer za `obracun/page.tsx`:

```typescript
// U handleSaveObracun funkciji, dodaj userId:
const user = auth.currentUser;
if (user) {
  const arhiviraniObracun = {
    ...obracun,
    userId: user.uid, // DODAJ OVO
    datum: datumString,
    // ... ostalo
  };
  
  // Spremi u localStorage
  localStorage.setItem("arhivaObracuna", JSON.stringify(arhiva));
  
  // Spremi u Firestore
  try {
    const docRef = doc(db, "arhivaObracuna", `${user.uid}_${datumString}`);
    await setDoc(docRef, {
      ...arhiviraniObracun,
      userId: user.uid, // DODAJ OVO
      savedAt: serverTimestamp(),
    });
  } catch (error) {
    // ...
  }
}
```

### Primjer za učitavanje (samo korisnikove podatke):

```typescript
// U loadArhiva funkciji:
const user = auth.currentUser;
if (user) {
  const q = query(
    collection(db, "arhivaObracuna"),
    where("userId", "==", user.uid) // FILTRIRAJ PO userId
  );
  
  const querySnapshot = await getDocs(q);
  // ...
}
```

---

## Korak 6: Build i Deploy

1. **Build aplikacije**:
   ```bash
   npm run build
   ```

2. **Deploy na Firebase Hosting**:
   ```bash
   firebase deploy --only hosting
   ```

3. **Ili deploy sve (hosting + firestore rules)**:
   ```bash
   firebase deploy
   ```

4. **Aplikacija će biti dostupna na**:
   - `https://your-project-id.web.app`
   - `https://your-project-id.firebaseapp.com`

---

## Korak 7: Postavi Custom Domain (Opcionalno)

1. **U Firebase Console**:
   - Hosting → Add custom domain
   - Unesi svoj domen
   - Slijedi upute za DNS postavke

---

## 📋 Checklist

- [ ] Firebase CLI instaliran
- [ ] `firebase login` uspješan
- [ ] `firebase init` završen
- [ ] `next.config.ts` ažuriran (output: 'export')
- [ ] `firebase.json` konfigurisan
- [ ] Firestore Rules postavljene (svaki korisnik vidi samo svoje podatke)
- [ ] Kod ažuriran da sprema `userId` sa dokumentima
- [ ] Kod ažuriran da filtrira po `userId` pri učitavanju
- [ ] `npm run build` uspješan
- [ ] `firebase deploy` uspješan

---

## ⚠️ Važne napomene

1. **Static Export ograničenja**:
   - Ne možeš koristiti API routes (`/api/*`)
   - Ne možeš koristiti server-side rendering (SSR)
   - Sve mora biti client-side

2. **Firestore Rules**:
   - **OBAVEZNO** postavi pravila da svaki korisnik vidi samo svoje podatke
   - Bez pravila, svi korisnici bi vidjeli sve podatke!

3. **userId u dokumentima**:
   - **OBAVEZNO** dodaj `userId` u svaki dokument koji kreiraš
   - **OBAVEZNO** filtriraj po `userId` pri učitavanju

4. **localStorage**:
   - Ako koristiš localStorage, podaci su lokalni na svakom uređaju
   - Firestore omogućava sinkronizaciju između uređaja

---

## 🔄 Migracija podataka

Ako već imaš podatke u Firestore-u bez `userId`:

1. **Kreiraj Cloud Function** da doda `userId` postojećim dokumentima
2. **Ili ručno ažuriraj** dokumente u Firebase Console

---

## 💡 Prednosti Firebase Hosting

- ✅ Besplatno (do određenog limita)
- ✅ Automatski HTTPS
- ✅ CDN globalno
- ✅ Integracija sa Firebase servisima
- ✅ Lako postavljanje custom domain-a

---

## 🆘 Troubleshooting

**Problem**: Build fails
**Rješenje**: Provjeri da je `output: 'export'` u `next.config.ts`

**Problem**: Aplikacija ne radi nakon deploy-a
**Rješenje**: Provjeri `firebase.json` - `public` treba biti `out` (za static export)

**Problem**: Korisnici vide tuđe podatke
**Rješenje**: Provjeri Firestore Rules i da li kod sprema/filtrira po `userId`

