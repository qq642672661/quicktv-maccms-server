# QuickTV MacCMS Server

企业级 Node.js + Express + TypeScript + PostgreSQL + Redis 后端服务

## 功能特性

- ✅ 直播管理 API（频道列表、状态管理、观看统计）
- ✅ 播放历史 API
- ✅ 收藏功能 API
- ✅ 评论系统 API
- ✅ Redis 缓存层
- ✅ PostgreSQL 数据库
- ✅ TypeScript 类型安全
- ✅ 日志系统
- ✅ 错误处理
- ✅ CORS 支持
- ✅ 安全防护（Helmet）
- ✅ 压缩响应
- ✅ 优雅关闭

## 技术栈

- **运行时**: Node.js 18+
- **框架**: Express 4.x
- **语言**: TypeScript 5.x
- **数据库**: PostgreSQL 14+
- **缓存**: Redis 7+
- **日志**: Winston
- **安全**: Helmet, CORS

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 配置环境变量

```bash
cp .env.example .env
```

编辑 `.env` 文件，配置数据库和Redis连接信息。

### 3. 初始化数据库

```bash
# 创建数据库
createdb quicktv_maccms

# 执行数据库迁移
psql -U quicktv -d quicktv_maccms -f src/database/schema.sql
```

### 4. 启动服务

```bash
# 开发模式
npm run dev

# 生产模式
npm run build
npm start
```

服务将在 `http://localhost:3000` 启动。

## API 文档

### 健康检查

```
GET /api/health
```

### 直播管理

#### 获取频道列表
```
GET /api/live/channels?category=体育&page=1&limit=20
```

#### 获取频道详情
```
GET /api/live/channels/:channelId
```

#### 创建频道
```
POST /api/live/channels
Content-Type: application/json

{
  "name": "CCTV-5",
  "logo": "https://example.com/logo.png",
  "streamUrl": "https://example.com/stream.m3u8",
  "category": "体育",
  "quality": ["1080p", "720p", "480p"],
  "description": "体育频道",
  "tags": ["体育", "直播"]
}
```

#### 更新频道状态
```
POST /api/live/channels/:channelId/status
Content-Type: application/json

{
  "status": "online"
}
```

#### 获取流信息
```
GET /api/live/channels/:channelId/stream?quality=1080p
```

#### 获取观看统计
```
GET /api/live/channels/:channelId/stats
```

#### 记录观看
```
POST /api/live/channels/:channelId/view
Content-Type: application/json

{
  "deviceId": "device-123"
}
```

#### 获取分类列表
```
GET /api/live/categories
```

## 项目结构

```
quicktv-maccms-server/
├── src/
│   ├── cache/              # Redis 缓存
│   │   └── redis.ts
│   ├── config/             # 配置
│   │   └── index.ts
│   ├── controllers/        # 控制器
│   │   └── live.controller.ts
│   ├── database/           # 数据库
│   │   ├── index.ts
│   │   └── schema.sql
│   ├── routes/             # 路由
│   │   ├── index.ts
│   │   └── live.routes.ts
│   ├── services/           # 服务层
│   │   └── live.service.ts
│   ├── types/              # 类型定义
│   │   └── live.ts
│   ├── utils/              # 工具
│   │   └── logger.ts
│   ├── app.ts              # Express 应用
│   └── server.ts           # 服务器入口
├── .env.example            # 环境变量模板
├── .gitignore
├── package.json
├── tsconfig.json
└── README.md
```

## 开发

### 运行测试

```bash
npm test
```

### 代码检查

```bash
npm run lint
npm run lint:fix
```

### 代码格式化

```bash
npm run format
```

## 部署

### Docker 部署

```bash
# 构建镜像
docker build -t quicktv-maccms-server .

# 运行容器
docker run -d -p 3000:3000 --env-file .env quicktv-maccms-server
```

### Docker Compose

```bash
docker-compose up -d
```

## 环境变量

| 变量名 | 说明 | 默认值 |
|--------|------|--------|
| NODE_ENV | 运行环境 | development |
| PORT | 服务端口 | 3000 |
| DATABASE_URL | 数据库连接 | - |
| REDIS_HOST | Redis 主机 | localhost |
| REDIS_PORT | Redis 端口 | 6379 |
| JWT_SECRET | JWT 密钥 | - |

## 许可证

MIT

## 作者

QuickTV Team
