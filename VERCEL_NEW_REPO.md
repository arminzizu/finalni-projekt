# Kako povezati Vercel sa novim GitHub repo-om

## Korak 1: Poveži Vercel sa novim repo-om

1. **Idi na Vercel Dashboard**:
   - https://vercel.com/dashboard
   - Prijavi se

2. **Pronađi stari projekt** (office-app-v2 ili kako se zove):
   - Klikni na projekt

3. **Idi na Settings → Git**:
   - Klikni "Disconnect" pored trenutnog repo-a
   - Potvrdi disconnect

4. **Connect novi repo**:
   - Klikni "Connect Git Repository"
   - Odaberi "GitHub"
   - Pronađi i odaberi: `arminzizu/finalni-projekt`
   - Klikni "Import"

5. **Provjeri postavke**:
   - **Root Directory**: `/` (ostavi prazno)
   - **Framework Preset**: Next.js (automatski detektovano)
   - **Build Command**: `npm run build` (automatski)
   - **Output Directory**: `.next` (automatski)
   - **Install Command**: `npm install` (automatski)

6. **Environment Variables**:
   - Idi na "Environment Variables" sekciju
   - Dodaj sve Firebase varijable:
     ```
     NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
     NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
     NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
     NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
     NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
     NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
     ```
   - Za svaku varijablu odaberi:
     - ✅ Production
     - ✅ Preview
     - ✅ Development

7. **Deploy**:
   - Klikni "Deploy"
   - Sačekaj da se build završi (1-2 minute)

---

## Korak 2: ILI kreiraj novi projekt

Ako želiš kreirati potpuno novi projekt:

1. **Idi na Vercel Dashboard**:
   - https://vercel.com/dashboard

2. **Klikni "Add New Project"**

3. **Import Git Repository**:
   - Odaberi "GitHub"
   - Pronađi i odaberi: `arminzizu/finalni-projekt`
   - Klikni "Import"

4. **Configure Project**:
   - **Project Name**: `finalni-projekt` (ili bilo koji naziv)
   - **Framework Preset**: Next.js (automatski)
   - **Root Directory**: `/` (ostavi prazno)
   - **Build and Output Settings**: Ostavi default (automatski)

5. **Environment Variables**:
   - Dodaj sve Firebase varijable (kao gore)

6. **Deploy**:
   - Klikni "Deploy"
   - Sačekaj da se build završi

---

## Korak 3: Provjeri da sve radi

1. **Provjeri Build Logs**:
   - U Vercel Dashboard-u, klikni na deploy
   - Provjeri "Build Logs" da nema grešaka

2. **Provjeri aplikaciju**:
   - Klikni na URL (npr. `finalni-projekt.vercel.app`)
   - Provjeri da aplikacija radi

3. **Hard refresh u browseru**:
   - `Ctrl + Shift + R` da osvježiš cache

---

## Korak 4: Custom Domain (Opcionalno)

Ako želiš koristiti svoj domen:

1. **Idi na Settings → Domains**

2. **Dodaj domen**:
   - Unesi svoj domen (npr. `moja-aplikacija.com`)
   - Slijedi upute za DNS postavke

---

## Troubleshooting

**Problem**: Build fails
**Rješenje**: 
- Provjeri Build Logs za greške
- Provjeri da su sve environment varijable postavljene
- Provjeri da li je `package.json` ispravan

**Problem**: Aplikacija ne radi online
**Rješenje**: 
- Provjeri environment varijable
- Provjeri Firebase Security Rules
- Provjeri Build Logs

**Problem**: Vercel ne vidi novi repo
**Rješenje**: 
- Provjeri da li si dao pristup Vercel-u u GitHub Settings
- GitHub → Settings → Applications → Authorized OAuth Apps → Vercel

---

## Važne Napomene ⚠️

1. **Environment Variables**: 
   - Sve `NEXT_PUBLIC_*` varijable moraju biti postavljene
   - Vrijednosti možeš naći u Firebase Console → Project Settings

2. **Auto Deploy**:
   - Vercel automatski deploy-uje svaki put kada push-uješ na `main` branch
   - Preview deploy-ovi se kreiraju za Pull Requests

3. **Build Time**:
   - Prvi build može trajati 2-3 minute
   - Sljedeći build-ovi su brži zbog caching-a

