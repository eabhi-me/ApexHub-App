@echo off
title Notes Todo App
echo Starting Notes Todo App...
echo.

echo Starting backend server...
start "Backend" cmd /k "cd /d "%~dp0server" && npm run dev"

timeout /t 2 /nobreak > nul

echo Starting frontend client...
start "Frontend" cmd /k "cd /d "%~dp0client" && npm start"

echo.
echo ✅ Servers starting!
echo Frontend: http://localhost:3000
echo Backend: http://localhost:5000
echo.
pause
