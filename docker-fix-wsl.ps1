# Docker WSL2 Quick Fix Script

Write-Host "=== Docker WSL2 Quick Fix ===" -ForegroundColor Cyan

Write-Host "`n[1/5] Shutting down WSL..." -ForegroundColor Yellow
wsl --shutdown
Start-Sleep -Seconds 5

Write-Host "`n[2/5] Starting Docker Desktop..." -ForegroundColor Yellow
Start-Process "C:\Program Files\Docker\Docker\Docker Desktop.exe"

Write-Host "`n[3/5] Waiting for Docker to initialize (60s)..." -ForegroundColor Yellow
$waited = 0
while ($waited -lt 60) {
    Start-Sleep -Seconds 5
    $waited += 5
    
    try {
        $null = docker ps 2>$null
        Write-Host "`n`nDocker started successfully!" -ForegroundColor Green
        Write-Host "`nContainer status:" -ForegroundColor Cyan
        docker ps
        Write-Host "`nDocker is ready!" -ForegroundColor Green
        exit 0
    } catch {
        Write-Host "." -NoNewline
    }
}

Write-Host "`n`nDocker startup timeout." -ForegroundColor Yellow
Write-Host "`nPlease try:" -ForegroundColor Yellow
Write-Host "1. Restart computer" -ForegroundColor White
Write-Host "2. Update WSL2: wsl --update" -ForegroundColor White
Write-Host "3. Check Docker Desktop logs" -ForegroundColor White
Write-Host "4. Reinstall Docker Desktop" -ForegroundColor White

exit 1
