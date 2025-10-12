@echo off
REM Postavi direktorij na trenutni gdje se nalazi .bat fajl
cd /d "%~dp0"
REM Provjeri da li je package.json prisutan
if not exist package.json (
  echo Greska: package.json nije pronadjen u %cd%. Provjeri putanju projekta.
  pause
  exit /b 1
)
echo Provjeravam Node.js instalaciju...
where npm >nul 2>&1
if %errorlevel% neq 0 (
  echo Greska: Node.js nije instaliran. Preuzmi ga s https://nodejs.org/ i ponovo pokreni ovaj fajl.
  pause
  exit /b 1
)
echo Pokrecem Office App na localhost:3000...
call npm install
if %errorlevel% neq 0 (
  echo Greska prilikom instalacije zavisnosti. Provjeri internet konekciju ili package.json.
  pause
  exit /b %errorlevel%
)
call npm run dev
if %errorlevel% neq 0 (
  echo Greska prilikom pokretanja servera.
  pause
  exit /b %errorlevel%
)
start http://localhost:3000
pause