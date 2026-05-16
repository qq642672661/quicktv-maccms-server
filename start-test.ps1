# QuickTV 一键启动测试脚本

param(
    [switch]$SkipBuild,
    [switch]$SkipSeed
)

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "QuickTV 测试环境一键启动" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$ErrorActionPreference = "Stop"

# 进入服务端目录
Set-Location "d:\GitCangku2\quicktv-maccms-server"

Write-Host "步骤 1/6: 检查 Docker 服务..." -ForegroundColor Yellow
docker ps >$null 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "✗ Docker 未运行，正在启动..." -ForegroundColor Red
    Start-Process "C:\Program Files\Docker\Docker\Docker Desktop.exe"
    Write-Host "等待 Docker 启动（30秒）..." -ForegroundColor Yellow
    Start-Sleep -Seconds 30
}
Write-Host "✓ Docker 正在运行" -ForegroundColor Green

Write-Host ""
Write-Host "步骤 2/6: 启动数据库服务..." -ForegroundColor Yellow
docker-compose up -d postgres redis
if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ 数据库服务已启动" -ForegroundColor Green
    Write-Host "等待数据库初始化（10秒）..." -ForegroundColor Yellow
    Start-Sleep -Seconds 10
} else {
    Write-Host "✗ 数据库服务启动失败" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "步骤 3/6: 检查依赖..." -ForegroundColor Yellow
if (-not (Test-Path "node_modules")) {
    Write-Host "正在安装依赖..." -ForegroundColor Yellow
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "✗ 依赖安装失败" -ForegroundColor Red
        exit 1
    }
}
Write-Host "✓ 依赖已就绪" -ForegroundColor Green

if (-not $SkipBuild) {
    Write-Host ""
    Write-Host "步骤 4/6: 构建项目..." -ForegroundColor Yellow
    npm run build
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ 项目构建成功" -ForegroundColor Green
    } else {
        Write-Host "✗ 项目构建失败" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host ""
    Write-Host "步骤 4/6: 跳过构建" -ForegroundColor Gray
}

if (-not $SkipSeed) {
    Write-Host ""
    Write-Host "步骤 5/6: 初始化测试数据..." -ForegroundColor Yellow
    
    Write-Host "运行数据库迁移..." -ForegroundColor Yellow
    $env:NODE_ENV = "development"
    npx ts-node src/database/migrate.ts up 2>$null
    
    Write-Host "添加基础数据..." -ForegroundColor Yellow
    npx ts-node src/database/seed.ts 2>$null
    
    Write-Host "添加测试数据..." -ForegroundColor Yellow
    npx ts-node src/database/seed-test-data.ts 2>$null
    
    Write-Host "✓ 测试数据初始化完成" -ForegroundColor Green
} else {
    Write-Host ""
    Write-Host "步骤 5/6: 跳过数据初始化" -ForegroundColor Gray
}

Write-Host ""
Write-Host "步骤 6/6: 启动开发服务器..." -ForegroundColor Yellow
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "服务器信息" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "API 地址: http://localhost:3000/api" -ForegroundColor White
Write-Host "健康检查: http://localhost:3000/api/health" -ForegroundColor White
Write-Host "直播频道: http://localhost:3000/api/live/channels" -ForegroundColor White
Write-Host "点播内容: http://localhost:3000/api/vod/content" -ForegroundColor White
Write-Host ""
Write-Host "数据库服务:" -ForegroundColor White
Write-Host "  PostgreSQL: localhost:5432" -ForegroundColor Gray
Write-Host "  Redis: localhost:6379" -ForegroundColor Gray
Write-Host ""
Write-Host "按 Ctrl+C 停止服务器" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

npm run dev
