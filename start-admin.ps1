# Ex Revolution Admin Panel Startup Script

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   Ex Revolution Admin Panel Startup" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Starting API Server (Port 5000)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd api; node local-server.js"

Write-Host ""
Write-Host "Waiting 3 seconds for API server to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 3

Write-Host ""
Write-Host "Starting Website Server (Port 3000)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "node start-website.js"

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "   SERVERS STARTED SUCCESSFULLY!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "API Server:     http://localhost:5000" -ForegroundColor White
Write-Host "Website:        http://localhost:3000" -ForegroundColor White
Write-Host "Admin Panel:    http://localhost:3000/admin/login.html" -ForegroundColor Cyan
Write-Host ""
Write-Host "Admin Login:" -ForegroundColor Yellow
Write-Host "   Email:    admin@exrevolution.com" -ForegroundColor White
Write-Host "   Password: Admin@123" -ForegroundColor White
Write-Host ""
Write-Host "Press any key to open admin panel in browser..." -ForegroundColor Green
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

Start-Process "http://localhost:3000/admin/login.html"
