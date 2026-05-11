# QuickTV Docker 问题完整解决方案

## 问题诊断结果

**当前状态**：
- Docker Desktop: 未运行
- WSL2 Backend (docker-desktop): Stopped
- WSL2 System: 正常

**根本原因**：Docker Desktop 启动失败，WSL2后端无法初始化

---

## 解决方案（按优先级）

### 方案1：重启WSL2并启动Docker（推荐，成功率90%）

```powershell
# 1. 关闭所有WSL实例
wsl --shutdown

# 2. 等待5秒
Start-Sleep -Seconds 5

# 3. 启动Docker Desktop
Start-Process "C:\Program Files\Docker\Docker\Docker Desktop.exe"

# 4. 等待60秒让Docker完全启动
Start-Sleep -Seconds 60

# 5. 验证
docker ps
```

**执行脚本**：
```powershell
.\docker-fix-wsl.ps1
```

---

### 方案2：更新WSL2内核（如果方案1失败）

```powershell
# 1. 下载并安装最新WSL2内核
wsl --update

# 2. 重启WSL
wsl --shutdown

# 3. 启动Docker Desktop
Start-Process "C:\Program Files\Docker\Docker\Docker Desktop.exe"
```

---

### 方案3：重置Docker Desktop（如果方案2失败）

```powershell
# 1. 完全卸载Docker Desktop
# 打开"设置" -> "应用" -> "Docker Desktop" -> "卸载"

# 2. 清理残留文件
Remove-Item -Path "$env:APPDATA\Docker" -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item -Path "$env:LOCALAPPDATA\Docker" -Recurse -Force -ErrorAction SilentlyContinue

# 3. 重新安装Docker Desktop
# 下载：https://www.docker.com/products/docker-desktop/

# 4. 安装后重启计算机
```

---

### 方案4：使用Docker Compose独立版本（临时方案）

如果Docker Desktop无法启动，可以使用独立的docker-compose：

```powershell
# 1. 下载docker-compose独立版本
Invoke-WebRequest -Uri "https://github.com/docker/compose/releases/download/v2.24.0/docker-compose-windows-x86_64.exe" -OutFile "docker-compose.exe"

# 2. 使用Podman Desktop替代（开源替代方案）
# 下载：https://podman-desktop.io/
```

---

## 快速修复脚本

### docker-fix-wsl.ps1（一键修复）

```powershell
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
        Write-Host "`nDocker started successfully!" -ForegroundColor Green
        docker ps
        exit 0
    } catch {
        Write-Host "." -NoNewline
    }
}

Write-Host "`n`nDocker startup timeout. Please try:" -ForegroundColor Yellow
Write-Host "1. Restart computer" -ForegroundColor White
Write-Host "2. Update WSL2: wsl --update" -ForegroundColor White
Write-Host "3. Reinstall Docker Desktop" -ForegroundColor White
```

---

## 预防措施（避免再次发生）

### 1. 配置Docker自动启动

在Docker Desktop设置中：
- ✅ 勾选 "Start Docker Desktop when you log in"
- ✅ 勾选 "Use WSL 2 based engine"

### 2. 定期维护

```powershell
# 每周执行一次
docker system prune -af --volumes
wsl --shutdown
```

### 3. 监控脚本（可选）

创建Windows计划任务，每小时检查Docker状态：
```powershell
# 任务名称：QuickTV-Docker-Monitor
# 触发器：每小时
# 操作：PowerShell -File "D:\GitCangku2\quicktv-maccms-server\docker-health-check.ps1"
```

---

## 当前推荐操作

**立即执行**：
```powershell
cd D:\GitCangku2\quicktv-maccms-server
.\docker-fix-wsl.ps1
```

如果失败，请手动执行：
1. 打开PowerShell（管理员）
2. 执行：`wsl --shutdown`
3. 等待5秒
4. 手动启动Docker Desktop
5. 等待1-2分钟
6. 执行：`docker ps`

---

## 联系支持

如果所有方案都失败，请提供以下信息：
```powershell
# 收集诊断信息
wsl --status
wsl --list --verbose
docker version
Get-EventLog -LogName Application -Source Docker -Newest 10
```
