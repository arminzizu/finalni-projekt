# Kako dodati Environment Variables u Vercel-u - Rješavanje problema

## ⚠️ Važno: GitHub token se NE koristi u Vercel Environment Variables!

Vercel automatski ima pristup GitHub repo-u kroz OAuth - ne trebaš dodavati GitHub token.

---

## Problem: "No environment variables were created"

### Rješenje: Dodaj varijable pravilno

1. **Idi na Vercel Dashboard**:
   - https://vercel.com/dashboard
   - Otvori projekt "finalni-projekt"

2. **Settings → Environment Variables**

3. **Klikni "Add New"** (gumb u gornjem desnom uglu)

4. **Ispunji formu**:
   - **Key**: `NEXT_PUBLIC_FIREBASE_API_KEY` (točno ovako, bez razmaka)
   - **Value**: Tvoja Firebase API key (npr. `AIzaSyC...`)
   - **Environment**: Označi sve tri opcije:
     - ✅ Production
     - ✅ Preview
     - ✅ Development
   - **Klikni "Save"**

5. **Ponovi za svaku varijablu** (dodaj jednu po jednu):

---

## 📋 Sve varijable koje trebaš dodati

### Varijabla 1:
- **Key**: `NEXT_PUBLIC_FIREBASE_API_KEY`
- **Value**: (iz Firebase Console → Project Settings → General → Your apps → Web app → apiKey)

### Varijabla 2:
- **Key**: `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- **Value**: (iz Firebase Console → authDomain)

### Varijabla 3:
- **Key**: `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- **Value**: (iz Firebase Console → projectId)

### Varijabla 4:
- **Key**: `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- **Value**: (iz Firebase Console → storageBucket)

### Varijabla 5:
- **Key**: `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- **Value**: (iz Firebase Console → messagingSenderId)

### Varijabla 6:
- **Key**: `NEXT_PUBLIC_FIREBASE_APP_ID`
- **Value**: (iz Firebase Console → appId)

---

## 🔍 Gdje naći Firebase vrijednosti

1. **Idi na Firebase Console**:
   - https://console.firebase.google.com/
   - Odaberi svoj projekat

2. **Project Settings** (⚙️ ikona u lijevom meniju)

3. **General** tab

4. **Scroll down** do "Your apps" sekcije

5. **Ako nema web app**:
   - Klikni "Add app" → Web (`</>` ikona)
   - App nickname: `finalni-projekt-web`
   - **NE označavaj** Firebase Hosting
   - Klikni "Register app"

6. **Kopiraj vrijednosti** iz `firebaseConfig` objekta:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyC...",                    // ← Ovo ide u NEXT_PUBLIC_FIREBASE_API_KEY
  authDomain: "my-project.firebaseapp.com", // ← Ovo ide u NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
  projectId: "my-project-id",               // ← Ovo ide u NEXT_PUBLIC_FIREBASE_PROJECT_ID
  storageBucket: "my-project.appspot.com",  // ← Ovo ide u NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
  messagingSenderId: "123456789",           // ← Ovo ide u NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
  appId: "1:123456789:web:abc123"          // ← Ovo ide u NEXT_PUBLIC_FIREBASE_APP_ID
};
```

---

## ✅ Provjera da su varijable dodane

1. **U Vercel Dashboard-u**:
   - Settings → Environment Variables
   - Trebao bi vidjeti listu sa svih 6 varijabli

2. **Ako ne vidiš varijable**:
   - Provjeri da si kliknuo "Save" nakon dodavanja svake
   - Provjeri da su Key-ovi točno napisani (case-sensitive!)
   - Provjeri da nema razmaka u Key-ovima

---

## 🚀 Nakon dodavanja varijabli

1. **Redeploy aplikaciju**:
   - Deployments tab
   - Klikni "..." na posljednjem deploy-u
   - Klikni "Redeploy"
   - Potvrdi

2. **Sačekaj 1-2 minute** da se build završi

3. **Provjeri da aplikacija radi**

---

## ❌ Što NE treba dodavati

- ❌ GitHub token (Vercel automatski ima pristup)
- ❌ GitHub API key
- ❌ Bilo koje GitHub credentials

---

## 💡 Ako i dalje ne radi

1. **Provjeri da su sve varijable dodane** (mora biti točno 6)

2. **Provjeri da su Key-ovi točno napisani**:
   - `NEXT_PUBLIC_FIREBASE_API_KEY` (ne `NEXT_PUBLIC_FIREBASE_APIKEY`)
   - `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` (ne `AUTH_DOMAIN`)
   - itd.

3. **Provjeri da su označeni svi environment-i** (Production, Preview, Development)

4. **Redeploy** aplikaciju nakon dodavanja varijabli

5. **Provjeri Build Logs** za greške

