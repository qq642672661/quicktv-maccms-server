# HelloTV 数据库迁移完整方案

## ✅ 已完成工作

### 1. 数据库表结构设计

#### PostgreSQL版本
- 文件：`src/database/migrations/20260516000001_create_hellotv_tables.sql`
- 包含11张表，完整的索引、外键、触发器

#### SQLite版本
- 文件：`src/database/migrations/20260516000001_create_hellotv_tables_sqlite.sql`
- 适配SQLite语法，保持功能一致

### 2. 统一迁移脚本

- 文件：`src/database/migrate-hellotv-unified.ts`
- **智能检测**：自动识别数据库类型（PostgreSQL或SQLite）
- **自动迁移**：创建表结构
- **数据导入**：从hellotv前端Mock数据自动导入

### 3. 便捷启动脚本

#### Windows批处理脚本
- 文件：`migrate-hellotv.bat`
- 交互式选择数据库类型

#### Linux/Mac Shell脚本
- 文件：`migrate-hellotv.sh`
- 交互式选择数据库类型

### 4. NPM命令

已添加到`package.json`：
```bash
# 自动检测数据库类型并迁移
npm run migrate:hellotv

# 强制使用PostgreSQL
npm run migrate:hellotv:pg

# 强制使用SQLite
npm run migrate:hellotv:sqlite
```

### 5. 环境配置

更新了`.env.example`，支持：
- `DB_TYPE` - 数据库类型配置
- PostgreSQL完整配置
- SQLite路径配置

---

## 🚀 使用方法

### 方法1：使用批处理脚本（推荐）

**Windows:**
```bash
cd D:\GitCangku2\quicktv-maccms-server
migrate-hellotv.bat
```

**Linux/Mac:**
```bash
cd D:\GitCangku2\quicktv-maccms-server
chmod +x migrate-hellotv.sh
./migrate-hellotv.sh
```

然后选择：
- `[1]` PostgreSQL
- `[2]` SQLite  
- `[3]` 同时迁移两个数据库

### 方法2：使用NPM命令

```bash
cd D:\GitCangku2\quicktv-maccms-server

# 自动检测（根据.env中的DB_TYPE）
npm run migrate:hellotv

# 或者指定数据库类型
npm run migrate:hellotv:pg      # PostgreSQL
npm run migrate:hellotv:sqlite  # SQLite
```

### 方法3：直接运行TypeScript

```bash
cd D:\GitCangku2\quicktv-maccms-server

# PostgreSQL
set DB_TYPE=postgresql
npx ts-node src/database/migrate-hellotv-unified.ts

# SQLite
set DB_TYPE=sqlite
npx ts-node src/database/migrate-hellotv-unified.ts
```

---

## 📋 迁移内容

### 创建的表（11张）

1. **tab_menu** - Tab菜单配置
2. **home_plate** - 首页板块
3. **plate_detail** - 板块详情
4. **media_content** - 媒体内容
5. **media_data_item** - 媒体数据项
6. **short_video** - 短视频
7. **search_keyword** - 搜索关键词
8. **user_search_history** - 用户搜索历史
9. **live_channel_group** - 直播频道分组
10. **live_channel** - 直播频道
11. **background_video** - 背景视频

### 导入的Mock数据

- ✅ Tab菜单数据（4个Tab）
- ✅ 首页板块数据（多个板块和详情）
- ✅ 媒体内容数据（示例视频）
- ✅ 短视频数据（10+个短视频）
- ✅ 直播频道数据（9个分组，30+个频道）
- ✅ 搜索关键词数据（20+个热词）

---

## ⚙️ 配置说明

### PostgreSQL配置

在`.env`文件中设置：
```env
DB_TYPE=postgresql
DB_HOST=localhost
DB_PORT=5432
DB_NAME=quicktv
DB_USER=postgres
DB_PASSWORD=postgres
```

### SQLite配置

在`.env`文件中设置：
```env
DB_TYPE=sqlite
SQLITE_PATH=./data/quicktv.db
```

---

## 🔍 智能检测逻辑

迁移脚本会按以下优先级检测数据库类型：

1. 环境变量`DB_TYPE`（postgresql/sqlite）
2. 环境变量`DATABASE_URL`（包含postgres则为PostgreSQL）
3. 环境变量`SQLITE_PATH`或`DB_PATH`（存在则为SQLite）
4. 默认使用PostgreSQL

---

## 📊 迁移流程

```
开始
  ↓
检测数据库类型
  ↓
初始化数据库连接
  ↓
执行表结构迁移
  ├─ PostgreSQL: 执行 .sql 文件
  └─ SQLite: 执行 _sqlite.sql 文件
  ↓
导入Mock数据
  ├─ Tab菜单
  ├─ 首页板块
  ├─ 媒体内容
  ├─ 短视频
  ├─ 直播频道
  └─ 搜索关键词
  ↓
关闭数据库连接
  ↓
完成
```

---

## ✨ 特性

### 1. 智能适配
- 自动检测数据库类型
- 自动适配SQL语法差异
- 自动处理数据类型转换

### 2. 事务保护
- 所有操作在事务中执行
- 失败自动回滚
- 保证数据一致性

### 3. 错误处理
- 详细的错误日志
- 友好的错误提示
- 自动清理资源

### 4. 进度显示
- 实时显示迁移进度
- 统计导入数据量
- 彩色输出易于阅读

---

## 🎯 下一步

迁移完成后，你可以：

1. **启动后端服务**
   ```bash
   npm run dev
   ```

2. **测试API接口**
   - GET http://localhost:3000/api/home/tabs
   - GET http://localhost:3000/api/media/list
   - GET http://localhost:3000/api/search/keywords

3. **前端对接**
   - 修改hellotv前端配置
   - 切换到真实API接口
   - 测试所有页面功能

---

## 📝 注意事项

1. **PostgreSQL**
   - 确保PostgreSQL服务已启动
   - 确保数据库已创建
   - 确保用户有足够权限

2. **SQLite**
   - 自动创建data目录
   - 自动创建数据库文件
   - 无需额外配置

3. **Mock数据路径**
   - 脚本会自动查找`../../../hellotv/src/mock`
   - 如果路径不存在，会跳过数据导入
   - 只创建表结构

---

## 🆘 故障排除

### 问题1：PostgreSQL连接失败
```
解决方案：
1. 检查PostgreSQL服务是否启动
2. 检查.env中的数据库配置
3. 确认数据库已创建
4. 检查防火墙设置
```

### 问题2：SQLite权限错误
```
解决方案：
1. 检查data目录是否有写权限
2. 尝试手动创建data目录
3. 检查磁盘空间
```

### 问题3：Mock数据导入失败
```
解决方案：
1. 检查hellotv项目路径是否正确
2. 检查Mock文件是否存在
3. 查看详细错误日志
4. 可以先只创建表结构，稍后手动导入数据
```

---

## 📚 相关文档

- [HelloTV前后端页面实现分析.md](file:///D:/GitCangku2/HelloTV前后端页面实现分析.md)
- [HelloTV数据迁移和API实现进度.md](file:///D:/GitCangku2/HelloTV数据迁移和API实现进度.md)

---

## 🎉 准备就绪！

现在你可以：
- ✅ 运行迁移脚本创建数据库
- ✅ 导入Mock数据
- ✅ 开始实现API接口
- ✅ 前后端对接测试

**立即开始？**
```bash
cd D:\GitCangku2\quicktv-maccms-server
migrate-hellotv.bat
```
