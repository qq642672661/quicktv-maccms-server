Write-Host "================================" -ForegroundColor Cyan
Write-Host "QuickTV 后端服务启动脚本 (SQLite)" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "检查 Node.js..." -ForegroundColor Yellow
$nodeVersion = node --version 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ 未找到 Node.js，请先安装 Node.js" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Node.js 版本: $nodeVersion" -ForegroundColor Green

Write-Host ""
Write-Host "检查依赖..." -ForegroundColor Yellow
if (-not (Test-Path "node_modules")) {
    Write-Host "📦 安装依赖..." -ForegroundColor Yellow
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ 依赖安装失败" -ForegroundColor Red
        exit 1
    }
}
Write-Host "✅ 依赖已就绪" -ForegroundColor Green

Write-Host ""
Write-Host "清理旧数据库..." -ForegroundColor Yellow
if (Test-Path "quicktv.db") {
    Remove-Item "quicktv.db" -Force
    Write-Host "✅ 已删除旧数据库" -ForegroundColor Green
}

Write-Host ""
Write-Host "🚀 启动服务器..." -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

npx ts-node src/server.sqlite.ts
