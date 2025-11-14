# Kako postaviti Environment Variables u Vercel-u

## Korak 1: Pripremi Firebase konfiguraciju

Prvo trebaš imati Firebase `firebaseConfig` vrijednosti:

1. **Idi na Firebase Console**: https://console.firebase.google.com/
2. **Odaberi svoj projekat**
3. **Project Settings** (⚙️ ikona) → **General** tab
4. **Scroll down** do "Your apps" sekcije
5. **Ako nema web app, klikni "Add app" → Web (`</>`)**:
   - App nickname: `finalni-projekt-web`
   - **NE označavaj** Firebase Hosting
   - Klikni "Register app"
6. **Kopiraj vrijednosti** iz `firebaseConfig` objekta

---

## Korak 2: Postavi Environment Variables u Vercel-u

1. **Idi na Vercel Dashboard**:
   - https://vercel.com/dashboard
   - Prijavi se

2. **Pronađi svoj projekt**:
   - Klikni na "finalni-projekt" (ili kako se zove)

3. **Idi na Settings**:
   - Klikni "Settings" u gornjem meniju

4. **Idi na Environment Variables**:
   - U lijevom meniju klikni "Environment Variables"

5. **Dodaj varijable** (jednu po jednu):

   Klikni "Add New" i dodaj:

   **Varijabla 1:**
   - **Key**: `NEXT_PUBLIC_FIREBASE_API_KEY`
   - **Value**: `AIza...` (iz firebaseConfig.apiKey)
   - **Environment**: Označi sve (Production, Preview, Development)
   - Klikni "Save"

   **Varijabla 2:**
   - **Key**: `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
   - **Value**: `your-project.firebaseapp.com` (iz firebaseConfig.authDomain)
   - **Environment**: Označi sve
   - Klikni "Save"

   **Varijabla 3:**
   - **Key**: `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
   - **Value**: `your-project-id` (iz firebaseConfig.projectId)
   - **Environment**: Označi sve
   - Klikni "Save"

   **Varijabla 4:**
   - **Key**: `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
   - **Value**: `your-project.appspot.com` (iz firebaseConfig.storageBucket)
   - **Environment**: Označi sve
   - Klikni "Save"

   **Varijabla 5:**
   - **Key**: `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
   - **Value**: `123456789` (iz firebaseConfig.messagingSenderId)
   - **Environment**: Označi sve
   - Klikni "Save"

   **Varijabla 6:**
   - **Key**: `NEXT_PUBLIC_FIREBASE_APP_ID`
   - **Value**: `1:123456789:web:abc123` (iz firebaseConfig.appId)
   - **Environment**: Označi sve
   - Klikni "Save"

---

## Korak 3: Redeploy aplikaciju

1. **Idi na "Deployments" tab**

2. **Pronađi posljednji deploy** i klikni na "..." (tri tačke)

3. **Klikni "Redeploy"**

4. **Potvrdi redeploy**

5. **Sačekaj 1-2 minute** da se build završi

---

## 📋 Checklist varijabli

Provjeri da imaš sve 6 varijabli:

- [ ] `NEXT_PUBLIC_FIREBASE_API_KEY`
- [ ] `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- [ ] `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- [ ] `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- [ ] `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- [ ] `NEXT_PUBLIC_FIREBASE_APP_ID`

---

## ⚠️ Važne napomene

1. **Sve varijable moraju počinjati sa `NEXT_PUBLIC_`** - to je Next.js konvencija za varijable dostupne u browseru

2. **Označi sve environment-e** (Production, Preview, Development) za svaku varijablu

3. **Nakon dodavanja varijabli, MORAŠ redeploy-ovati** aplikaciju da bi se primjenile

4. **Ne dijelj javno** ove vrijednosti - one su osjetljive (ali `NEXT_PUBLIC_*` varijable su vidljive u browseru, što je OK za Firebase config)

---

## 🔍 Kako provjeriti da su postavljene

1. **U Vercel Dashboard-u**:
   - Settings → Environment Variables
   - Trebao bi vidjeti sve 6 varijabli

2. **U Build Logs**:
   - Deployments → Klikni na deploy → Build Logs
   - Ne bi trebalo biti grešaka vezanih za Firebase config

3. **U aplikaciji**:
   - Login/Register bi trebao raditi
   - Ne bi trebalo biti grešaka u konzoli vezanih za Firebase

---

## 💡 Primjer firebaseConfig objekta

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyC...",                    // → NEXT_PUBLIC_FIREBASE_API_KEY
  authDomain: "my-project.firebaseapp.com", // → NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
  projectId: "my-project-id",               // → NEXT_PUBLIC_FIREBASE_PROJECT_ID
  storageBucket: "my-project.appspot.com",  // → NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
  messagingSenderId: "123456789",           // → NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
  appId: "1:123456789:web:abc123def456"     // → NEXT_PUBLIC_FIREBASE_APP_ID
};
```

---

## 🆘 Troubleshooting

**Problem**: "Missing Firebase configuration" greška
**Rješenje**: Provjeri da su sve varijable postavljene i da redeploy-uješ

**Problem**: Varijable se ne primjenjuju
**Rješenje**: Redeploy aplikaciju nakon dodavanja varijabli

**Problem**: Ne znam gdje naći Firebase config
**Rješenje**: Firebase Console → Project Settings → General → Your apps → Web app

