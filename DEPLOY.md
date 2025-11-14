# Upute za Deploy Aplikacije

## Opcija 1: Vercel (Preporučeno za Next.js) 🚀

Vercel je najlakši način za deploy Next.js aplikacija. Automatski build, HTTPS, i besplatan tier.

### Koraci:

1. **Instaliraj Vercel CLI** (opcionalno, možeš i preko web-a):
   ```bash
   npm install -g vercel
   ```

2. **Login na Vercel**:
   ```bash
   vercel login
   ```

3. **Deploy aplikacije**:
   ```bash
   vercel
   ```
   
   Ili direktno preko web-a:
   - Idi na https://vercel.com
   - Klikni "Add New Project"
   - Poveži GitHub repo (ili upload direktno)
   - Vercel će automatski detektovati Next.js

4. **Postavi Environment Varijable**:
   
   U Vercel dashboard-u, idi na Project Settings → Environment Variables i dodaj:
   
   ```
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   ```
   
   (Ove vrijednosti možeš naći u Firebase Console → Project Settings → General → Your apps)

5. **Redeploy** nakon postavljanja varijabli:
   - U Vercel dashboard-u klikni "Redeploy"

### Prednosti Vercel:
- ✅ Automatski build i deploy
- ✅ Besplatan tier (dovoljno za većinu projekata)
- ✅ Automatski HTTPS
- ✅ CDN globalno
- ✅ Lako povezivanje sa GitHub-om (auto-deploy na push)

---

## Opcija 2: Firebase Hosting 🔥

### Koraci:

1. **Instaliraj Firebase CLI**:
   ```bash
   npm install -g firebase-tools
   ```

2. **Login na Firebase**:
   ```bash
   firebase login
   ```

3. **Inicijaliziraj Firebase Hosting**:
   ```bash
   firebase init hosting
   ```
   
   Odaberi opcije:
   - What do you want to use as your public directory? → `.next`
   - Configure as a single-page app? → No
   - Set up automatic builds and deploys with GitHub? → Opcionalno

4. **Build aplikacije**:
   ```bash
   npm run build
   ```

5. **Export statičke verzije** (ako treba):
   - Dodaj u `next.config.ts`:
   ```typescript
   const nextConfig: NextConfig = {
     output: 'export', // Za statički export
   };
   ```
   
   **ILI** koristi Firebase Functions za server-side rendering.

6. **Postavi Environment Varijable**:
   
   Kreiraj `.env.production` fajl ili postavi u Firebase Functions config:
   ```bash
   firebase functions:config:set firebase.api_key="your_key" firebase.auth_domain="your_domain"
   ```

7. **Deploy**:
   ```bash
   firebase deploy --only hosting
   ```

---

## Opcija 3: Netlify 🌐

1. **Instaliraj Netlify CLI**:
   ```bash
   npm install -g netlify-cli
   ```

2. **Login**:
   ```bash
   netlify login
   ```

3. **Deploy**:
   ```bash
   netlify deploy --prod
   ```

4. **Postavi Environment Varijable** u Netlify dashboard-u.

---

## Važne Napomene ⚠️

1. **Environment Varijable**: 
   - Nikad ne commit-uj `.env.local` fajl u Git
   - Sve `NEXT_PUBLIC_*` varijable moraju biti postavljene u hosting servisu

2. **Firebase Rules**:
   - Provjeri Firestore Security Rules u Firebase Console
   - Osiguraj da su pravila postavljena za tvoj use case

3. **Build Command**:
   - Vercel automatski koristi `npm run build`
   - Za druge servise možda trebaš prilagoditi

4. **Custom Domain**:
   - Vercel: Settings → Domains
   - Firebase: Hosting → Add custom domain

---

## Najbrži Put (Vercel) ⚡

1. Idi na https://vercel.com
2. Sign up/Login sa GitHub-om
3. Klikni "Add New Project"
4. Importuj svoj repo
5. Postavi environment varijable
6. Klikni "Deploy"
7. Gotovo! 🎉

---

## Troubleshooting 🔧

**Problem**: Build fails zbog Firebase config
**Rješenje**: Provjeri da su sve `NEXT_PUBLIC_*` varijable postavljene

**Problem**: Aplikacija ne radi online
**Rješenje**: Provjeri Firebase Security Rules i environment varijable

**Problem**: Slow build times
**Rješenje**: Vercel ima caching, prvi build je uvijek sporiji

