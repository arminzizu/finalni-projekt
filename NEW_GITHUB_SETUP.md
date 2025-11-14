# Upute za kreiranje novog GitHub projekta

## Korak 1: Kreiraj novi GitHub Repository

1. **Idi na GitHub**:
   - https://github.com/new
   - Ili klikni "+" u gornjem desnom uglu → "New repository"

2. **Ispunji formu**:
   - **Repository name**: `office-app` (ili bilo koji naziv koji želiš)
   - **Description**: (opcionalno) "Office management application"
   - **Visibility**: 
     - ✅ **Public** (besplatno, svi vide)
     - ✅ **Private** (besplatno, samo ti vidiš)
   - **NE označavaj**:
     - ❌ Add a README file
     - ❌ Add .gitignore
     - ❌ Choose a license
   
   (Ostavimo prazno jer već imamo kod)

3. **Klikni "Create repository"**

4. **Kopiraj URL** koji GitHub prikaže:
   - Ako koristiš HTTPS: `https://github.com/TVOJE_KORISNICKO_IME/office-app.git`
   - Ako koristiš SSH: `git@github.com:TVOJE_KORISNICKO_IME/office-app.git`

---

## Korak 2: Poveži lokalni kod sa novim GitHub repo-om

### Opcija A: Preko komandne linije (Windows PowerShell)

1. **Dodaj novi remote**:
   ```powershell
   git remote add origin https://github.com/TVOJE_KORISNICKO_IME/office-app.git
   ```
   
   (Zamijeni `TVOJE_KORISNICKO_IME` sa svojim GitHub username-om)

2. **Provjeri da li je dodan**:
   ```powershell
   git remote -v
   ```

3. **Push-uj kod**:
   ```powershell
   git push -u origin master
   ```
   
   Ako traži autentifikaciju:
   - Koristi GitHub Personal Access Token (ne password)
   - Ili koristi GitHub Desktop aplikaciju

### Opcija B: Preko GitHub Desktop (Najlakše)

1. **Instaliraj GitHub Desktop** (ako nije):
   - https://desktop.github.com/

2. **Otvori GitHub Desktop**

3. **File → Add Local Repository**

4. **Odaberi folder**: `C:\Users\User\Desktop\office-app`

5. **Publish repository**:
   - Klikni "Publish repository"
   - Odaberi naziv i visibility
   - Klikni "Publish"

---

## Korak 3: Ažuriraj Vercel da koristi novi repo

1. **Idi na Vercel Dashboard**:
   - https://vercel.com/dashboard

2. **Idi na Project Settings → Git**

3. **Disconnect** trenutni repo

4. **Connect** novi repo:
   - Klikni "Connect Git Repository"
   - Odaberi novi GitHub repo
   - Potvrdi

5. **Redeploy**:
   - Vercel će automatski rebuild-ovati sa novim repo-om

---

## Korak 4: Provjeri da sve radi

1. **Provjeri GitHub**:
   - Idi na novi repo URL
   - Provjeri da su svi fajlovi tu

2. **Provjeri Vercel**:
   - Provjeri da je deploy uspješan
   - Provjeri da aplikacija radi

---

## Troubleshooting

**Problem**: "Permission denied" pri push-u
**Rješenje**: 
- Koristi GitHub Personal Access Token umjesto password-a
- Ili koristi GitHub Desktop

**Problem**: "Repository not found"
**Rješenje**: 
- Provjeri da li si kreirao repo na GitHub-u
- Provjeri da li je URL tačan
- Provjeri da li imaš pristup repo-u

**Problem**: Vercel ne vidi novi repo
**Rješenje**: 
- Disconnect i reconnect repo u Vercel Settings
- Provjeri da li je repo public ili da li si dao pristup Vercel-u

