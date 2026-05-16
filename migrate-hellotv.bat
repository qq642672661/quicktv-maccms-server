@echo off
chcp 65001 >nul
echo ╔════════════════════════════════════════════════════════╗
echo ║     HelloTV 数据库迁移工具 (PostgreSQL + SQLite)      ║
echo ╚════════════════════════════════════════════════════════╝
echo.

echo 📋 请选择数据库类型:
echo.
echo [1] PostgreSQL (默认)
echo [2] SQLite
echo [3] 同时迁移两个数据库
echo.

set /p choice="请输入选项 (1-3): "

if "%choice%"=="1" (
    echo.
    echo 🔧 使用 PostgreSQL...
    set DB_TYPE=postgresql
    call :run_migration
) else if "%choice%"=="2" (
    echo.
    echo 🔧 使用 SQLite...
    set DB_TYPE=sqlite
    call :run_migration
) else if "%choice%"=="3" (
    echo.
    echo 🔧 同时迁移 PostgreSQL 和 SQLite...
    
    echo.
    echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    echo 第 1 步: 迁移 PostgreSQL
    echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    set DB_TYPE=postgresql
    call :run_migration
    
    echo.
    echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    echo 第 2 步: 迁移 SQLite
    echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    set DB_TYPE=sqlite
    call :run_migration
    
    echo.
    echo ╔════════════════════════════════════════════════════════╗
    echo ║          🎉 两个数据库迁移全部完成！                  ║
    echo ╚════════════════════════════════════════════════════════╝
) else (
    echo.
    echo ❌ 无效的选项，请重新运行脚本
    pause
    exit /b 1
)

echo.
pause
exit /b 0

:run_migration
    npx ts-node src/database/migrate-hellotv-unified.ts
    if errorlevel 1 (
        echo.
        echo ❌ 迁移失败，请检查错误信息
        pause
        exit /b 1
    )
    goto :eof
