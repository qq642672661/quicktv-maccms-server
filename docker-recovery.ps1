# QuickTV Docker 故障恢复脚本
# 用途：当Docker出现问题时，自动诊断并修复

$ErrorActionPreference = "Continue"

Write-Host "=== QuickTV Docker 故障恢复 ===" -ForegroundColor Cyan

Write-Host "`n[1/5] 停止所有容器..." -ForegroundColor Yellow
docker stop $(docker ps -aq) 2>$null

Write-Host "`n[2/5] 清理 Docker 资源..." -ForegroundColor Yellow
docker system prune -af --volumes

Write-Host "`n[3/5] 重启 Docker Desktop..." -ForegroundColor Yellow
& "$PSScriptRoot\docker-health-check.ps1" -Restart

Write-Host "`n[4/5] 重新构建镜像..." -ForegroundColor Yellow
Set-Location $PSScriptRoot
docker-compose build --no-cache

Write-Host "`n[5/5] 启动服务..." -ForegroundColor Yellow
docker-compose up -d

Write-Host "`n✅ Docker 故障恢复完成" -ForegroundColor Green
Write-Host "`n验证服务状态..." -ForegroundColor Yellow
docker-compose ps
