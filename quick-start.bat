@echo off
title ApexHub - Tasks, Finance & Study Suite
echo ========================================================
echo   Starting ApexHub: Tasks, Finance & Study Suite
echo ========================================================
echo.

echo Starting backend server on port 5000...
start "ApexHub Backend (Port 5000)" cmd /k "cd /d "%~dp0server" && npm run dev"

timeout /t 2 /nobreak > nul

echo Starting frontend client on port 3000...
start "ApexHub Frontend (Port 3000)" cmd /k "cd /d "%~dp0client" && npm start"

echo.
echo ========================================================
echo  [OK] ApexHub servers starting!
echo  Frontend UI: http://localhost:3000
echo  Backend API: http://localhost:5000
echo ========================================================
echo.
pause
