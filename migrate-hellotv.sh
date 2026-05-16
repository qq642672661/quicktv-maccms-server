#!/bin/bash

echo "╔════════════════════════════════════════════════════════╗"
echo "║     HelloTV 数据库迁移工具 (PostgreSQL + SQLite)      ║"
echo "╚════════════════════════════════════════════════════════╝"
echo ""

echo "📋 请选择数据库类型:"
echo ""
echo "[1] PostgreSQL (默认)"
echo "[2] SQLite"
echo "[3] 同时迁移两个数据库"
echo ""

read -p "请输入选项 (1-3): " choice

run_migration() {
    npx ts-node src/database/migrate-hellotv-unified.ts
    if [ $? -ne 0 ]; then
        echo ""
        echo "❌ 迁移失败，请检查错误信息"
        exit 1
    fi
}

case $choice in
    1)
        echo ""
        echo "🔧 使用 PostgreSQL..."
        export DB_TYPE=postgresql
        run_migration
        ;;
    2)
        echo ""
        echo "🔧 使用 SQLite..."
        export DB_TYPE=sqlite
        run_migration
        ;;
    3)
        echo ""
        echo "🔧 同时迁移 PostgreSQL 和 SQLite..."
        
        echo ""
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        echo "第 1 步: 迁移 PostgreSQL"
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        export DB_TYPE=postgresql
        run_migration
        
        echo ""
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        echo "第 2 步: 迁移 SQLite"
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        export DB_TYPE=sqlite
        run_migration
        
        echo ""
        echo "╔════════════════════════════════════════════════════════╗"
        echo "║          🎉 两个数据库迁移全部完成！                  ║"
        echo "╚════════════════════════════════════════════════════════╝"
        ;;
    *)
        echo ""
        echo "❌ 无效的选项，请重新运行脚本"
        exit 1
        ;;
esac

echo ""
echo "✅ 迁移完成！"
