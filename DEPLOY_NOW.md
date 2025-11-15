# Kako deploy-ovati SADA - Korak po korak

## 📍 Gdje raditi korake

**Sve korake radi u PowerShell/CMD terminalu u folderu:**
```
C:\Users\User\Desktop\office-app
```

---

## 🚀 Koraci za Deploy (Redoslijed)

### Korak 1: Instaliraj Firebase CLI

U terminalu pokreni:
```bash
npm install -g firebase-tools
```

**Gdje**: PowerShell/CMD u folderu `office-app`

---

### Korak 2: Login na Firebase

U terminalu pokreni:
```bash
firebase login
```

**Što će se desiti**:
- Otvorit će se browser
- Prijavi se sa Google računom
- Vrati se u terminal - trebalo bi vidjeti "Success! Logged in as..."

**Gdje**: Isti terminal

---

### Korak 3: Inicijaliziraj Firebase

U terminalu pokreni:
```bash
firebase init
```

**Odgovori na pitanja**:
1. **Which Firebase features do you want to set up?**
   - Pritisni **Space** na "Hosting" (označi ga)
   - Pritisni **Space** na "Firestore" (označi ga)
   - Pritisni **Enter** za nastavak

2. **Please select an option:**
   - Odaberi **"Use an existing project"**
   - Pritisni **Enter**

3. **Select a default Firebase project:**
   - Odaberi svoj projekat (npr. `finalni-projekt`)
   - Pritisni **Enter**

4. **What do you want to use as your public directory?**
   - Unesi: `out`
   - Pritisni **Enter**

5. **Configure as a single-page app?**
   - Odgovori: **N** (No)
   - Pritisni **Enter**

6. **Set up automatic builds and deploys with GitHub?**
   - Odgovori: **N** (No)
   - Pritisni **Enter**

7. **What file should be used for Firestore Rules?**
   - Pritisni **Enter** (koristi `firestore.rules`)

8. **What file should be used for Firestore indexes?**
   - Pritisni **Enter** (koristi `firestore.indexes.json`)

**Gdje**: Isti terminal

---

### Korak 4: Build aplikacije

U terminalu pokreni:
```bash
npm run build
```

**Što će se desiti**:
- Next.js će build-ovati aplikaciju
- Kreirat će se `out/` folder sa statičkim fajlovima
- Sačekaj da se završi (1-2 minute)

**Gdje**: Isti terminal

---

### Korak 5: Deploy na Firebase

U terminalu pokreni:
```bash
firebase deploy
```

**Ili samo hosting**:
```bash
firebase deploy --only hosting
```

**Ili samo Firestore rules**:
```bash
firebase deploy --only firestore:rules
```

**Što će se desiti**:
- Firebase će upload-ovati fajlove
- Deploy-ovat će Firestore rules
- Prikazat će ti URL aplikacije (npr. `https://your-project.web.app`)

**Gdje**: Isti terminal

---

## ✅ Provjera

Nakon deploy-a:

1. **Otvori URL** koji Firebase prikaže (npr. `https://your-project.web.app`)
2. **Testiraj login/register**
3. **Provjeri da aplikacija radi**

---

## 📋 Brzi Checklist

- [ ] `npm install -g firebase-tools`
- [ ] `firebase login`
- [ ] `firebase init` (odaberi Hosting + Firestore)
- [ ] `npm run build`
- [ ] `firebase deploy`
- [ ] Otvori URL i testiraj

---

## 🆘 Ako imaš problema

**Problem**: "firebase: command not found"
**Rješenje**: Provjeri da je `npm install -g firebase-tools` završio uspješno

**Problem**: "No Firebase project found"
**Rješenje**: Prvo kreiraj projekat u Firebase Console, pa onda `firebase init`

**Problem**: Build fails
**Rješenje**: Provjeri da je `output: 'export'` u `next.config.ts`

---

## 💡 Napomena

Sve komande radi u **istom terminalu** u folderu `C:\Users\User\Desktop\office-app`

