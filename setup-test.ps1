# QuickTV 测试环境设置脚本

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "QuickTV 测试环境设置" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 检查 Node.js
Write-Host "检查 Node.js..." -ForegroundColor Yellow
$nodeVersion = node --version 2>$null
if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Node.js 已安装: $nodeVersion" -ForegroundColor Green
} else {
    Write-Host "✗ Node.js 未安装，请先安装 Node.js 18+" -ForegroundColor Red
    exit 1
}

# 检查 npm
Write-Host "检查 npm..." -ForegroundColor Yellow
$npmVersion = npm --version 2>$null
if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ npm 已安装: $npmVersion" -ForegroundColor Green
} else {
    Write-Host "✗ npm 未安装" -ForegroundColor Red
    exit 1
}

# 检查依赖
Write-Host ""
Write-Host "检查项目依赖..." -ForegroundColor Yellow
if (Test-Path "node_modules") {
    Write-Host "✓ 依赖已安装" -ForegroundColor Green
} else {
    Write-Host "正在安装依赖..." -ForegroundColor Yellow
    npm install
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ 依赖安装成功" -ForegroundColor Green
    } else {
        Write-Host "✗ 依赖安装失败" -ForegroundColor Red
        exit 1
    }
}

# 检查环境变量文件
Write-Host ""
Write-Host "检查环境变量配置..." -ForegroundColor Yellow
if (Test-Path ".env") {
    Write-Host "✓ .env 文件已存在" -ForegroundColor Green
} else {
    Write-Host "创建 .env 文件..." -ForegroundColor Yellow
    Copy-Item ".env.example" ".env"
    Write-Host "✓ .env 文件已创建，请根据需要修改配置" -ForegroundColor Green
}

# 检查 Docker
Write-Host ""
Write-Host "检查 Docker..." -ForegroundColor Yellow
$dockerVersion = docker --version 2>$null
if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Docker 已安装: $dockerVersion" -ForegroundColor Green
    
    # 检查 Docker 是否运行
    docker ps >$null 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ Docker 正在运行" -ForegroundColor Green
    } else {
        Write-Host "✗ Docker 未运行，请启动 Docker Desktop" -ForegroundColor Red
        Write-Host "提示: 可以运行 'docker-compose up -d' 启动服务" -ForegroundColor Yellow
    }
} else {
    Write-Host "✗ Docker 未安装" -ForegroundColor Red
    Write-Host "提示: 可以手动启动 PostgreSQL 和 Redis" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "设置完成！" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "后续步骤:" -ForegroundColor Yellow
Write-Host "1. 启动数据库服务:" -ForegroundColor White
Write-Host "   docker-compose up -d postgres redis" -ForegroundColor Gray
Write-Host ""
Write-Host "2. 运行数据库迁移:" -ForegroundColor White
Write-Host "   npm run migrate:up" -ForegroundColor Gray
Write-Host ""
Write-Host "3. 添加测试数据:" -ForegroundColor White
Write-Host "   npm run seed" -ForegroundColor Gray
Write-Host "   ts-node src/database/seed-test-data.ts" -ForegroundColor Gray
Write-Host ""
Write-Host "4. 启动开发服务器:" -ForegroundColor White
Write-Host "   npm run dev" -ForegroundColor Gray
Write-Host ""
Write-Host "5. 测试 API:" -ForegroundColor White
Write-Host "   curl http://localhost:3000/api/health" -ForegroundColor Gray
Write-Host ""
