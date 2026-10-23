@echo off
title Career Ka Dost - Dev Server
cd /d "%~dp0"

where node >nul 2>nul
if errorlevel 1 (
    echo Node.js is not installed.
    echo Download it from nodejs.org ^(the LTS version^), install it ^(Next, Next, Finish^),
    echo then double-click this file again.
    echo.
    pause
    exit /b 1
)

if not exist node_modules (
    echo Installing - this only happens the first time, please wait...
    call npm install
    echo.
)

echo Starting the website at http://localhost:5173/
echo Staff portal: http://localhost:5173/#/admin
echo.
echo This is the EDITABLE version: it updates live as files change.
echo Keep this window open. Close it, or press Ctrl+C, to stop.
echo.
call npm run dev

pause
