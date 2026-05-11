# QuickTV 项目启动脚本
# 用途：一键启动所有服务（Docker + 后端 + 前端）

$ErrorActionPreference = "Stop"

Write-Host "=== QuickTV 项目启动脚本 ===" -ForegroundColor Cyan

$projectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path

Write-Host "`n[1/4] 检查 Docker 状态..." -ForegroundColor Yellow
& "$projectRoot\docker-health-check.ps1"

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Docker 启动失败，无法继续" -ForegroundColor Red
    exit 1
}

Write-Host "`n[2/4] 启动 Docker 服务..." -ForegroundColor Yellow
Set-Location $projectRoot
docker-compose up -d

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Docker 服务启动失败" -ForegroundColor Red
    exit 1
}

Write-Host "`n[3/4] 等待服务就绪..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

Write-Host "`n[4/4] 验证服务状态..." -ForegroundColor Yellow
docker-compose ps

Write-Host "`n检查 API 健康状态..." -ForegroundColor Yellow
$maxRetries = 10
$retryCount = 0

while ($retryCount -lt $maxRetries) {
    try {
        $response = Invoke-RestMethod -Uri "http://192.168.10.133:3000/api/health" -TimeoutSec 5
        if ($response.status -eq "ok") {
            Write-Host "✅ API 服务正常" -ForegroundColor Green
            break
        }
    } catch {
        $retryCount++
        Write-Host "." -NoNewline
        Start-Sleep -Seconds 2
    }
}

if ($retryCount -ge $maxRetries) {
    Write-Host "`n⚠️ API 服务响应超时，请检查日志" -ForegroundColor Yellow
    docker-compose logs --tail=50 api
}

Write-Host "`n=== 服务启动完成 ===" -ForegroundColor Green
Write-Host "`n访问地址：" -ForegroundColor Cyan
Write-Host "  API:    http://192.168.10.133:3000" -ForegroundColor White
Write-Host "  Health: http://192.168.10.133:3000/api/health" -ForegroundColor White
Write-Host "  Docs:   http://192.168.10.133:3000/api-docs" -ForegroundColor White

Write-Host "`n常用命令：" -ForegroundColor Cyan
Write-Host "  查看日志: docker-compose logs -f" -ForegroundColor White
Write-Host "  停止服务: docker-compose down" -ForegroundColor White
Write-Host "  重启服务: docker-compose restart" -ForegroundColor White
