# Kako push-ovati kod na GitHub

## Status ✅

- ✅ Remote postavljen: `https://github.com/arminzizu/finalni-projekt.git`
- ✅ Branch: `main`
- ✅ Sve fajlovi su commit-ovani
- ⏳ Treba push-ovati na GitHub

---

## Opcija 1: GitHub Desktop (Najlakše) 🎯

1. **Instaliraj GitHub Desktop** (ako nije):
   - https://desktop.github.com/

2. **Otvori GitHub Desktop**

3. **File → Add Local Repository**

4. **Odaberi folder**: `C:\Users\User\Desktop\office-app`

5. **Publish repository**:
   - Klikni "Publish repository" gore desno
   - Provjeri da je repo: `arminzizu/finalni-projekt`
   - Klikni "Publish"

6. **Gotovo!** 🎉

---

## Opcija 2: Komandna linija sa Personal Access Token

1. **Kreiraj Personal Access Token**:
   - Idi na: https://github.com/settings/tokens
   - Generate new token (classic)
   - Označi `repo` scope
   - Kopiraj token

2. **Push-uj**:
   ```bash
   git push -u origin main
   ```

3. **Kada traži autentifikaciju**:
   - Username: `arminzizu`
   - Password: **Koristi token umjesto password-a**

---

## Opcija 3: Ručno upload preko GitHub web-a

Ako ništa ne radi:

1. **Idi na**: https://github.com/arminzizu/finalni-projekt

2. **Klikni "uploading an existing file"**

3. **Drag & drop** sve fajlove iz `office-app` foldera:
   - **NE upload-uj**: `node_modules`, `.next`, `.env.local`, `git` folder
   - **Upload-uj**: sve ostalo (src, public, package.json, itd.)

4. **Commit** sa porukom: "Initial commit: Office management app"

---

## Provjera

Nakon push-a, provjeri:

1. **Idi na**: https://github.com/arminzizu/finalni-projekt
2. **Provjeri da vidiš**:
   - `src/` folder
   - `package.json`
   - `next.config.ts`
   - Sve ostale fajlove

---

## Najbrži Put ⚡

**Koristi GitHub Desktop** - automatski rješava autentifikaciju i push-uje sve!

