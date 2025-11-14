# Firebase Setup - Što treba i što ne treba

## ✅ Što NE treba raditi

- ❌ **Ne treba deploy-ovati kod na Firebase Hosting** - koristimo Vercel
- ❌ **Ne treba upload-ovati fajlove na Firebase** - kod ide na GitHub/Vercel
- ❌ **Ne treba kreirati novi Firebase projekat** - već postoji i koristi se

---

## ✅ Što TREBA provjeriti/postaviti

### 1. Firebase Projekat već postoji ✅

Tvoj Firebase projekat već postoji i koristi se za:
- **Authentication** (login/register korisnika)
- **Firestore** (baza podataka - opcionalno, aplikacija prioritizira localStorage)

---

### 2. Environment Varijable u Vercel-u ⚠️

**OVO JE VAŽNO!** Trebaš postaviti Firebase konfiguraciju u Vercel-u:

1. **Idi na Vercel Dashboard**:
   - https://vercel.com/dashboard
   - Otvori projekt "finalni-projekt"
   - Settings → Environment Variables

2. **Dodaj sve Firebase varijable**:
   ```
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   ```

3. **Gdje naći ove vrijednosti**:
   - Idi na: https://console.firebase.google.com/
   - Odaberi svoj projekat
   - Project Settings (⚙️) → General tab
   - Scroll down do "Your apps" sekcije
   - Ako nema web app, klikni "Add app" → Web (</>)
   - Kopiraj vrijednosti iz `firebaseConfig` objekta

4. **Za svaku varijablu odaberi**:
   - ✅ Production
   - ✅ Preview  
   - ✅ Development

5. **Redeploy** nakon postavljanja varijabli

---

### 3. Firestore Security Rules (Opcionalno) ⚠️

Ako želiš da Firestore radi (trenutno aplikacija prioritizira localStorage):

1. **Idi na Firebase Console**:
   - https://console.firebase.google.com/
   - Odaberi projekat
   - Firestore Database → Rules

2. **Postavi pravila** (za development/testiranje):
   ```javascript
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       // Dozvoli pristup samo autentifikovanim korisnicima
       match /users/{userId} {
         allow read, write: if request.auth != null && request.auth.uid == userId;
       }
       
       // Dozvoli pristup arhivi samo autentifikovanim korisnicima
       match /arhivaObracuna/{document=**} {
         allow read, write: if request.auth != null;
       }
     }
   }
   ```

3. **Klikni "Publish"**

**NAPOMENA**: Ako ne postaviš pravila, aplikacija će i dalje raditi jer koristi localStorage kao primarni izvor podataka.

---

## 📋 Sažetak

### Što radi aplikacija:
- ✅ **Lokalno**: Koristi localStorage (ne treba internet)
- ✅ **Online**: Pokušava koristiti Firestore (opcionalno, kao backup)
- ✅ **Authentication**: Koristi Firebase Auth (za login/register)

### Što trebaš:
1. ✅ **Postavi Environment Variables u Vercel-u** (VAŽNO!)
2. ⚠️ **Opcionalno**: Postavi Firestore Security Rules

### Što NE trebaš:
- ❌ Deploy-ovati kod na Firebase
- ❌ Upload-ovati fajlove na Firebase
- ❌ Kreirati novi Firebase projekat

---

## 🔍 Provjera

Nakon postavljanja environment varijabli u Vercel-u:

1. **Redeploy** aplikaciju na Vercel-u
2. **Provjeri da aplikacija radi** online
3. **Provjeri da login/register radi** (koristi Firebase Auth)

---

## 💡 Važno

Aplikacija je dizajnirana da radi **offline-first**:
- Podaci se čuvaju u `localStorage`
- Firestore je opcionalan backup
- Ako Firestore ne radi (nema interneta ili nema dozvola), aplikacija i dalje radi sa localStorage

