@echo off
echo ========================================
echo   Ex Revolution Admin Panel Startup
echo ========================================
echo.

echo Starting API Server (Port 5000)...
start "API Server" cmd /k "cd api && node local-server.js"

echo.
echo Waiting 3 seconds for API server to start...
timeout /t 3 /nobreak >nul

echo.
echo Starting Website Server (Port 3000)...
start "Website Server" cmd /k "node start-website.js"

echo.
echo ========================================
echo   SERVERS STARTED SUCCESSFULLY!
echo ========================================
echo.
echo API Server:     http://localhost:5000
echo Website:        http://localhost:3000
echo Admin Panel:    http://localhost:3000/admin/login.html
echo.
echo Admin Login:
echo   Email:    admin@exrevolution.com
echo   Password: Admin@123
echo.
echo Press any key to open admin panel in browser...
pause >nul

start http://localhost:3000/admin/login.html
