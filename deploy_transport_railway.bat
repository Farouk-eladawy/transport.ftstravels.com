@echo off
setlocal
cd /d "%~dp0"

echo === FTS Transport - Railway Deploy ===
echo Repo: Farouk-eladawy/transport.ftstravels.com
echo.

where railway >nul 2>&1
if errorlevel 1 (
  echo Railway CLI not found. Install: npm i -g @railway/cli
  echo Or deploy from Railway dashboard linked to GitHub.
  pause
  exit /b 1
)

git status
echo.
set /p CONFIRM=Push to GitHub and deploy to Railway? [y/N]:
if /i not "%CONFIRM%"=="y" exit /b 0

git add -A
git commit -m "Railway deploy: healthcheck, migrations, CORS, docs" 2>nul
git push origin main
if errorlevel 1 git push origin master

railway link 1608ce57-3bfd-49f0-9bb1-b252439992ec
railway up

echo.
echo Done. Set variables from railway_vars.example.json in Railway UI.
echo Health: https://transport-ftstravels.up.railway.app/api/health
pause
