# QuickTV-MacCMS Server

企业级 TV 流媒体后端服务 - Node.js + Express + TypeScript + PostgreSQL

## 项目简介

QuickTV-MacCMS Server 是一个高性能、可扩展的电视流媒体后端服务，为 QuickTV 客户端和管理后台提供 RESTful API 接口。

### 核心特性

- ✅ **TypeScript** - 类型安全，提升代码质量
- ✅ **Express** - 成熟的 Node.js Web 框架
- ✅ **PostgreSQL** - 企业级关系型数据库
- ✅ **Redis** - 高性能缓存和会话管理
- ✅ **JWT** - 安全的身份认证
- ✅ **RBAC** - 基于角色的访问控制
- ✅ **Prometheus** - 应用性能监控
- ✅ **Winston** - 结构化日志记录
- ✅ **RabbitMQ** - 消息队列支持
- ✅ **Docker** - 容器化部署

## 技术栈

- **运行时**: Node.js 18+
- **语言**: TypeScript 5.3+
- **框架**: Express 4.18+
- **数据库**: PostgreSQL 15+
- **缓存**: Redis 7+
- **消息队列**: RabbitMQ 3+
- **ORM**: 原生 SQL + pg
- **认证**: JWT + bcrypt
- **验证**: Joi
- **日志**: Winston
- **测试**: Jest + Supertest
- **代码质量**: ESLint + Prettier

## 项目结构

```
quicktv-maccms-server/
├── src/
│   ├── config/           # 配置文件
│   ├── controllers/      # 控制器层
│   ├── models/           # 数据模型
│   ├── routes/           # 路由定义
│   ├── services/         # 业务逻辑层
│   ├── middleware/       # 中间件
│   ├── utils/            # 工具函数
│   ├── types/            # TypeScript 类型定义
│   ├── database/         # 数据库相关
│   │   ├── migrations/   # 数据库迁移
│   │   └── seeds/        # 数据填充
│   └── server.ts         # 应用入口
├── tests/                # 测试文件
├── logs/                 # 日志文件
├── dist/                 # 编译输出
├── .env.example          # 环境变量示例
├── package.json
├── tsconfig.json
└── README.md
```

## 快速开始

### 环境要求

- Node.js >= 18.0.0
- PostgreSQL >= 15.0
- Redis >= 7.0
- npm >= 9.0.0

### 安装依赖

```bash
npm install
```

### 配置环境变量

```bash
cp .env.example .env
```

编辑 `.env` 文件，配置数据库连接等信息。

### 数据库迁移

```bash
npm run migrate:up
```

### 填充测试数据

```bash
npm run seed
```

### 启动开发服务器

```bash
npm run dev
```

服务将在 http://localhost:3000 启动。

### 构建生产版本

```bash
npm run build
npm start
```

## API 文档

### 认证接口

- `POST /api/auth/register` - 用户注册
- `POST /api/auth/login` - 用户登录
- `POST /api/auth/refresh` - 刷新 Token
- `POST /api/auth/logout` - 用户登出

### 用户接口

- `GET /api/users/profile` - 获取用户信息
- `PUT /api/users/profile` - 更新用户信息
- `PUT /api/users/password` - 修改密码

### 视频接口

- `GET /api/videos` - 获取视频列表
- `GET /api/videos/:id` - 获取视频详情
- `POST /api/videos` - 创建视频（管理员）
- `PUT /api/videos/:id` - 更新视频（管理员）
- `DELETE /api/videos/:id` - 删除视频（管理员）

### 直播接口

- `GET /api/live/channels` - 获取直播频道列表
- `GET /api/live/channels/:id` - 获取频道详情

### 统计接口

- `GET /api/stats/overview` - 系统概览
- `GET /api/stats/users` - 用户统计
- `GET /api/stats/videos` - 视频统计

详细 API 文档请参考：[API_SPECIFICATION.md](../quicktv-quicktvui-project/docs/API_SPECIFICATION.md)

## 数据库设计

详细数据库设计请参考：[DATABASE_SCHEMA.md](../quicktv-quicktvui-project/docs/DATABASE_SCHEMA.md)

## 部署

### Docker 部署

```bash
docker build -t quicktv-maccms-server .
docker run -p 3000:3000 --env-file .env quicktv-maccms-server
```

### Docker Compose 部署

```bash
docker-compose up -d
```

详细部署指南请参考：[DEPLOYMENT_GUIDE.md](../quicktv-quicktvui-project/docs/DEPLOYMENT_GUIDE.md)

## 监控

应用暴露 Prometheus 指标：

```
http://localhost:3000/metrics
```

详细监控配置请参考：[MONITORING_GUIDE.md](../quicktv-quicktvui-project/docs/MONITORING_GUIDE.md)

## 安全

详细安全配置请参考：[SECURITY_GUIDE.md](../quicktv-quicktvui-project/docs/SECURITY_GUIDE.md)

## 测试

```bash
# 运行所有测试
npm test

# 运行测试并生成覆盖率报告
npm run test:coverage

# 监听模式运行测试
npm run test:watch
```

## 代码质量

```bash
# 运行 ESLint
npm run lint

# 自动修复 ESLint 问题
npm run lint:fix

# 格式化代码
npm run format
```

## 开发规范

- 使用 TypeScript 严格模式
- 遵循 ESLint 规则
- 编写单元测试
- 提交前运行 lint 和 test
- 使用语义化版本号
- 编写清晰的 commit message

## 性能优化

- 使用 Redis 缓存热点数据
- 数据库查询优化和索引
- API 响应压缩
- 连接池管理
- 请求限流
- 静态资源 CDN

## 相关项目

- [quicktv-maccms-client](https://github.com/qq642672661/quicktv-maccms-client) - TV 客户端
- [quicktv-maccms-admin](https://github.com/qq642672661/quicktv-maccms-admin) - 管理后台

## 许可证

MIT License

## 联系方式

- GitHub Issues: https://github.com/qq642672661/quicktv-maccms-server/issues
- Email: support@quicktv.com

---

**最后更新**: 2026-05-09
