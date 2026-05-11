# QuickTV Docker Health Check and Auto-Start Script

param(
    [switch]$Force,
    [switch]$Restart
)

$ErrorActionPreference = "Stop"

Write-Host "=== QuickTV Docker Health Check ===" -ForegroundColor Cyan

function Test-DockerRunning {
    try {
        $null = docker ps 2>$null
        return $true
    } catch {
        return $false
    }
}

function Start-DockerDesktop {
    Write-Host "`nStarting Docker Desktop..." -ForegroundColor Yellow

    $dockerPath = "C:\Program Files\Docker\Docker\Docker Desktop.exe"
    if (!(Test-Path $dockerPath)) {
        Write-Host "Docker Desktop not found at default path" -ForegroundColor Red
        return $false
    }

    Start-Process $dockerPath

    Write-Host "Waiting for Docker engine..." -ForegroundColor Yellow
    $maxWait = 60
    $waited = 0

    while ($waited -lt $maxWait) {
        Start-Sleep -Seconds 2
        $waited += 2

        if (Test-DockerRunning) {
            Write-Host "`nDocker engine started!" -ForegroundColor Green
            return $true
        }

        Write-Host "." -NoNewline
    }

    Write-Host "`nDocker startup timeout" -ForegroundColor Yellow
    return $false
}

function Stop-DockerDesktop {
    Write-Host "`nStopping Docker Desktop..." -ForegroundColor Yellow
    Get-Process -Name "Docker Desktop" -ErrorAction SilentlyContinue | Stop-Process -Force
    Start-Sleep -Seconds 5
    Write-Host "Docker Desktop stopped" -ForegroundColor Green
}

if ($Restart) {
    Stop-DockerDesktop
    Start-Sleep -Seconds 3
}

if ((Test-DockerRunning) -and !$Force -and !$Restart) {
    Write-Host "Docker is running normally" -ForegroundColor Green

    Write-Host "`nContainer status:" -ForegroundColor Cyan
    docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

    Write-Host "`nSystem resources:" -ForegroundColor Cyan
    docker system df

    exit 0
}

if (!(Test-DockerRunning) -or $Force -or $Restart) {
    if (Start-DockerDesktop) {
        Write-Host "`nVerifying Docker..." -ForegroundColor Yellow

        Write-Host "`nDocker version:" -ForegroundColor Cyan
        docker version --format '{{.Server.Version}}'

        Write-Host "`nContainer status:" -ForegroundColor Cyan
        docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

        Write-Host "`nDocker is fully operational!" -ForegroundColor Green
        exit 0
    } else {
        Write-Host "`nDocker startup failed" -ForegroundColor Red
        Write-Host "Please try:" -ForegroundColor Yellow
        Write-Host "1. Start Docker Desktop manually" -ForegroundColor White
        Write-Host "2. Check WSL2: wsl --status" -ForegroundColor White
        Write-Host "3. Restart computer" -ForegroundColor White
        exit 1
    }
}
