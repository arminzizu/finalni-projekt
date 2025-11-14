# Kako push-ovati kod na GitHub

## Problem: "Permission denied" ili "403 error"

GitHub više ne prihvaća password-e za push. Trebaš koristiti **Personal Access Token**.

---

## Rješenje 1: GitHub Personal Access Token

### Korak 1: Kreiraj Personal Access Token

1. **Idi na GitHub Settings**:
   - https://github.com/settings/tokens
   - Ili: GitHub → Profile → Settings → Developer settings → Personal access tokens → Tokens (classic)

2. **Klikni "Generate new token" → "Generate new token (classic)"**

3. **Ispunji formu**:
   - **Note**: "Office App Development" (ili bilo šta)
   - **Expiration**: Odaberi koliko želiš (npr. 90 days ili No expiration)
   - **Scopes**: Označi:
     - ✅ `repo` (sve opcije pod repo)
     - ✅ `workflow` (ako koristiš GitHub Actions)

4. **Klikni "Generate token"**

5. **KOPIRAJ TOKEN ODMAH** (nećeš moći vidjeti ponovo!)

### Korak 2: Koristi token umjesto password-a

Kada push-uješ i traži password:
- **Username**: Tvoj GitHub username
- **Password**: **Koristi token umjesto password-a**

---

## Rješenje 2: GitHub Desktop (Najlakše) 🎯

1. **Instaliraj GitHub Desktop**:
   - https://desktop.github.com/

2. **Otvori GitHub Desktop**

3. **File → Add Local Repository**

4. **Odaberi folder**: `C:\Users\User\Desktop\office-app`

5. **Publish repository**:
   - Klikni "Publish repository" gore desno
   - Odaberi "finalni-projekt" (ili kreiraj novi)
   - Klikni "Publish"

GitHub Desktop automatski rješava autentifikaciju!

---

## Rješenje 3: SSH Key (Za napredne)

1. **Generiši SSH key**:
   ```bash
   ssh-keygen -t ed25519 -C "your_email@example.com"
   ```

2. **Dodaj SSH key u GitHub**:
   - Kopiraj sadržaj `~/.ssh/id_ed25519.pub`
   - GitHub → Settings → SSH and GPG keys → New SSH key

3. **Promijeni remote na SSH**:
   ```bash
   git remote set-url origin git@github.com:arminzizu/finalni-projekt.git
   ```

4. **Push**:
   ```bash
   git push -u origin main
   ```

---

## Rješenje 4: Ručno upload preko GitHub web-a

Ako ništa ne radi, možeš upload-ovati fajlove direktno:

1. **Idi na**: https://github.com/arminzizu/finalni-projekt

2. **Klikni "uploading an existing file"**

3. **Drag & drop** sve fajlove (osim `node_modules`, `.next`, `.env.local`)

4. **Commit** sa porukom: "Initial commit"

---

## Najbrži Put ⚡

**Koristi GitHub Desktop** - najlakše i automatski rješava sve probleme!

1. Instaliraj GitHub Desktop
2. File → Add Local Repository → Odaberi `office-app` folder
3. Publish repository
4. Gotovo! 🎉

