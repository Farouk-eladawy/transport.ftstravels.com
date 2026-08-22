@echo off
setlocal EnableExtensions EnableDelayedExpansion

echo ========================================================
echo FTS Transport - push to GitHub
echo Repo: https://github.com/Farouk-eladawy/transport.ftstravels.com.git
echo Domain: https://transport.ftstravels.com
echo ========================================================
echo.

cd /d "%~dp0"

where git >nul 2>&1
if errorlevel 1 (
  echo ERROR: git is not installed or not in PATH.
  pause
  exit /b 1
)

set "REMOTE_URL=https://github.com/Farouk-eladawy/transport.ftstravels.com.git"

if not exist ".git" (
  echo Initializing git repository...
  git init
  if errorlevel 1 goto :fail
)

git remote get-url origin >nul 2>&1
if errorlevel 1 (
  git remote add origin "%REMOTE_URL%"
) else (
  git remote set-url origin "%REMOTE_URL%"
)

echo.
echo Remote:
git remote -v
echo.

echo Staging files...
git add -A
if errorlevel 1 goto :fail

git diff --cached --quiet
if not errorlevel 1 (
  echo Nothing new to commit.
) else (
  set "COMMIT_MSG=FTS Transport: OSM/Leaflet maps, Netlify config, branding for transport.ftstravels.com"
  git commit -m "!COMMIT_MSG!"
  if errorlevel 1 goto :fail
)

echo.
echo Pushing branch main to origin...
git branch -M main 2>nul
git push -u origin main
if errorlevel 1 (
  echo.
  echo Push failed. Common fixes:
  echo   1^) Sign in to GitHub ^(gh auth login or Git Credential Manager^)
  echo   2^) If remote has commits, run: git pull origin main --rebase
  echo   3^) Then run this script again
  goto :fail
)

echo.
echo Done. Open:
echo   https://github.com/Farouk-eladawy/transport.ftstravels.com
echo.
echo Next on Netlify:
echo   1^) Connect repo transport.ftstravels.com
echo   2^) Set NEXT_PUBLIC_API_URL to your public backend URL
echo   3^) See NETLIFY-SETUP-AR.md
echo.
echo Next on local backend:
echo   1^) Copy .env.ftstravels.example to .env and fill secrets
echo   2^) docker compose up -d
echo   3^) Expose :3001 via tunnel or VPS for Netlify to reach API
echo.
pause
exit /b 0

:fail
echo.
echo FAILED. See messages above.
pause
exit /b 1
