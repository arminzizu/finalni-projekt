# Kako kreirati novi Firebase projekat

## Korak 1: Kreiraj novi Firebase projekat

1. **Idi na Firebase Console**:
   - https://console.firebase.google.com/
   - Prijavi se sa Google računom

2. **Klikni "Add project"** (ili "Create a project")

3. **Ispunji formu**:
   - **Project name**: `finalni-projekt` (ili bilo koji naziv)
   - **Project ID**: Firebase će automatski generisati (možeš promijeniti)
   - Klikni "Continue"

4. **Google Analytics** (opcionalno):
   - Možeš omogućiti ili onemogućiti
   - Ako omogućiš, odaberi Analytics account
   - Klikni "Create project"

5. **Sačekaj da se projekat kreira** (10-30 sekundi)
   - Klikni "Continue" kada je gotovo

---

## Korak 2: Dodaj Web App

1. **U Firebase Console-u, klikni na Web ikonu** (`</>`)

2. **Ispunji formu**:
   - **App nickname**: `finalni-projekt-web` (ili bilo koji naziv)
   - **Firebase Hosting**: ❌ **NE označavaj** (koristimo Vercel)
   - Klikni "Register app"

3. **Kopiraj Firebase konfiguraciju**:
   - Vidjet ćeš `firebaseConfig` objekt
   - **SAČUVAJ OVE VRIJEDNOSTI** - trebat ćeš ih za Vercel!

   ```javascript
   const firebaseConfig = {
     apiKey: "AIza...",
     authDomain: "your-project.firebaseapp.com",
     projectId: "your-project-id",
     storageBucket: "your-project.appspot.com",
     messagingSenderId: "123456789",
     appId: "1:123456789:web:abc123"
   };
   ```

4. **Klikni "Continue to console"**

---

## Korak 3: Omogući Authentication

1. **U Firebase Console-u, klikni "Authentication"** u lijevom meniju

2. **Klikni "Get started"**

3. **Omogući "Email/Password"**:
   - Klikni na "Email/Password"
   - Omogući "Email/Password" (toggle ON)
   - Klikni "Save"

---

## Korak 4: Kreiraj Firestore Database (Opcionalno)

Ako želiš koristiti Firestore (aplikacija može raditi i bez njega):

1. **Klikni "Firestore Database"** u lijevom meniju

2. **Klikni "Create database"**

3. **Odaberi mode**:
   - **Production mode** (za produkciju)
   - **Test mode** (za development - lakše, ali manje sigurno)
   - Klikni "Next"

4. **Odaberi lokaciju**:
   - Odaberi najbližu lokaciju (npr. `europe-west` za Evropu)
   - Klikni "Enable"

5. **Postavi Security Rules** (ako si odabrao Production mode):
   - Idi na "Rules" tab
   - Postavi pravila:

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

   - Klikni "Publish"

---

## Korak 5: Postavi Environment Variables u Vercel-u

1. **Idi na Vercel Dashboard**:
   - https://vercel.com/dashboard
   - Otvori projekt "finalni-projekt"
   - Settings → Environment Variables

2. **Dodaj sve Firebase varijable** (koristi vrijednosti iz Koraka 2):

   ```
   NEXT_PUBLIC_FIREBASE_API_KEY=AIza... (iz firebaseConfig.apiKey)
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
   NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc123
   ```

3. **Za svaku varijablu odaberi**:
   - ✅ Production
   - ✅ Preview
   - ✅ Development

4. **Klikni "Save"**

5. **Redeploy** aplikaciju:
   - Idi na "Deployments" tab
   - Klikni "..." na posljednjem deploy-u
   - Klikni "Redeploy"

---

## Korak 6: Provjeri da sve radi

1. **Provjeri da aplikacija radi** online na Vercel URL-u

2. **Testiraj login/register**:
   - Klikni "Registracija"
   - Kreiraj novi račun
   - Provjeri da radi

3. **Provjeri Firebase Console**:
   - Authentication → Users - trebao bi vidjeti novog korisnika
   - Firestore Database → Data - trebao bi vidjeti podatke (ako koristiš Firestore)

---

## 📋 Checklist

- [ ] Firebase projekat kreiran
- [ ] Web app dodan
- [ ] Authentication omogućen (Email/Password)
- [ ] Firestore Database kreiran (opcionalno)
- [ ] Security Rules postavljene (ako koristiš Production mode)
- [ ] Environment Variables postavljene u Vercel-u
- [ ] Aplikacija redeploy-ovana
- [ ] Login/Register testiran

---

## 💡 Napomene

- **Firebase Hosting**: Ne koristimo ga - koristimo Vercel
- **Firestore**: Opcionalan - aplikacija može raditi i bez njega (koristi localStorage)
- **Authentication**: Obavezan - potreban za login/register
- **Environment Variables**: Obavezno postaviti u Vercel-u!

---

## 🔗 Korisni linkovi

- Firebase Console: https://console.firebase.google.com/
- Vercel Dashboard: https://vercel.com/dashboard
- Firebase Docs: https://firebase.google.com/docs

