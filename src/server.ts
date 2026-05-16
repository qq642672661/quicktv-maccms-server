/**
 * 服务器启动入口文件
 * 负责启动HTTP服务器、连接数据库和缓存、处理优雅关闭
 * 
 * 主要功能：
 * 1. 启动HTTP服务器并监听指定端口
 * 2. 连接数据库（PostgreSQL/SQLite）
 * 3. 连接Redis缓存
 * 4. 处理进程信号实现优雅关闭
 * 5. 捕获未处理的异常和Promise拒绝
 */

import app from './app'
import config from './config'
import database from './database'
import redisCache from './cache/redis'
import logger from './utils/logger'
import { createServer } from 'http'

// 创建HTTP服务器实例
const server = createServer(app)

/**
 * 启动服务器
 * 按顺序连接数据库、Redis，然后启动HTTP服务器
 */
async function startServer(): Promise<void> {
  try {
    // 连接数据库
    await database.connect()
    logger.info('Database connected')

    // 连接Redis缓存
    await redisCache.connect()
    logger.info('Redis connected')

    // 启动HTTP服务器
    server.listen(config.port, () => {
      logger.info(`Server is running on port ${config.port}`)
      logger.info(`Environment: ${config.env}`)
      logger.info(`API URL: http://localhost:${config.port}/api`)
    })
  } catch (error) {
    logger.error('Failed to start server:', error)
    process.exit(1)
  }
}

/**
 * 优雅关闭服务器
 * 按顺序关闭HTTP服务器、断开Redis连接、断开数据库连接
 * 
 * @param signal - 触发关闭的信号名称（SIGTERM、SIGINT等）
 */
async function gracefulShutdown(signal: string): Promise<void> {
  logger.info(`${signal} received, shutting down gracefully...`)
  
  // 停止接收新的HTTP请求
  server.close(async () => {
    logger.info('HTTP server closed')
    
    try {
      // 断开Redis连接
      await redisCache.disconnect()
      logger.info('Redis disconnected')
      
      // 断开数据库连接
      await database.disconnect()
      logger.info('Database disconnected')
      
      // 正常退出
      process.exit(0)
    } catch (error) {
      logger.error('Error during shutdown:', error)
      process.exit(1)
    }
  })

  // 超时强制关闭：如果10秒内未完成优雅关闭，强制退出
  setTimeout(() => {
    logger.error('Forced shutdown after timeout')
    process.exit(1)
  }, 10000)
}

// 监听SIGTERM信号（Docker、Kubernetes等容器环境的停止信号）
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'))

// 监听SIGINT信号（Ctrl+C终止信号）
process.on('SIGINT', () => gracefulShutdown('SIGINT'))

// 捕获未处理的Promise拒绝
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason)
})

// 捕获未捕获的异常
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error)
  gracefulShutdown('UNCAUGHT_EXCEPTION')
})

// 启动服务器
startServer()
