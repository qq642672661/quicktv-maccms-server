/**
 * Express应用主类
 * 负责初始化Express应用、配置中间件、路由和错误处理
 * 
 * 功能模块：
 * 1. 安全防护：Helmet安全头、CORS跨域、请求限流
 * 2. 请求处理：JSON解析、URL编码、响应压缩
 * 3. 日志记录：开发环境使用dev格式，生产环境使用combined格式
 * 4. 路由管理：统一挂载到/api路径下
 * 5. 错误处理：404和500错误的统一处理
 */

import express, { Application, Request, Response, NextFunction } from 'express'
import cors from 'cors'
import helmet from 'helmet'
import compression from 'compression'
import morgan from 'morgan'
import rateLimit from 'express-rate-limit'
import config from './config'
import routes from './routes'
import logger from './utils/logger'

/**
 * Express应用类
 * 封装Express应用的初始化和配置逻辑
 */
class App {
  public app: Application

  /**
   * 构造函数
   * 按顺序初始化中间件、路由和错误处理
   */
  constructor() {
    this.app = express()
    this.initializeMiddlewares()
    this.initializeRoutes()
    this.initializeErrorHandling()
  }

  /**
   * 初始化中间件
   * 配置安全、跨域、压缩、解析、限流和日志等中间件
   */
  private initializeMiddlewares(): void {
    // 安全防护：设置各种HTTP安全头
    this.app.use(helmet())
    
    // 跨域配置：开发环境允许所有来源，生产环境使用配置的白名单
    this.app.use(cors({
      origin: config.env === 'development' ? '*' : config.cors.origin,
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization']
    }))
    
    // 响应压缩：减少传输数据量
    this.app.use(compression())
    
    // JSON解析：支持最大10MB的JSON请求体
    this.app.use(express.json({ limit: '10mb' }))
    
    // URL编码解析：支持表单数据和嵌套对象
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }))
    
    // 请求限流：防止API滥用和DDoS攻击
    const limiter = rateLimit({
      windowMs: config.rateLimit.windowMs,
      max: config.rateLimit.maxRequests,
      message: 'Too many requests from this IP, please try again later.',
      standardHeaders: true,
      legacyHeaders: false,
    })
    this.app.use('/api/', limiter)
    
    // HTTP请求日志：开发环境简洁格式，生产环境详细格式
    if (config.env === 'development') {
      this.app.use(morgan('dev'))
    } else {
      this.app.use(morgan('combined', {
        stream: {
          write: (message: string) => logger.info(message.trim())
        }
      }))
    }
  }

  /**
   * 初始化路由
   * 挂载API路由和根路径健康检查
   */
  private initializeRoutes(): void {
    // 挂载所有API路由到/api路径下
    this.app.use('/api', routes)
    
    // 根路径：返回API基本信息
    this.app.get('/', (_req: Request, res: Response) => {
      res.json({
        code: 200,
        message: 'QuickTV MacCMS Server API',
        version: '1.0.0',
        docs: '/api/health'
      })
    })
  }

  /**
   * 初始化错误处理
   * 配置404和500错误的统一响应格式
   */
  private initializeErrorHandling(): void {
    // 404错误处理：路由未找到
    this.app.use((_req: Request, res: Response) => {
      res.status(404).json({
        code: 404,
        message: 'Route not found'
      })
    })

    // 500错误处理：服务器内部错误
    this.app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
      logger.error('Unhandled error:', err)
      
      res.status(500).json({
        code: 500,
        message: config.env === 'production' ? 'Internal server error' : err.message,
        ...(config.env === 'development' && { stack: err.stack })
      })
    })
  }

  /**
   * 获取Express应用实例
   * @returns Express应用实例
   */
  public getApp(): Application {
    return this.app
  }
}

// 导出应用实例
export default new App().getApp()
