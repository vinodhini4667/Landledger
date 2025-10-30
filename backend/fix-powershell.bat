@echo off
echo ===============================================
echo BlockLand Registry - PowerShell Fix
echo ===============================================
echo.

echo Fixing PowerShell execution policy...
PowerShell -Command "Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser -Force"

echo.
echo Installing dependencies...
call npm install

echo.
echo ===============================================
echo Setup Complete!
echo ===============================================
echo Run 'npm run dev' to start the backend server
pause