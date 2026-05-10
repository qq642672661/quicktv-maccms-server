import express, { Application, Request, Response, NextFunction } from 'express'
import cors from 'cors'
import helmet from 'helmet'
import compression from 'compression'
import morgan from 'morgan'
import rateLimit from 'express-rate-limit'
import config from './config'
import routes from './routes'
import logger from './utils/logger'

class App {
  public app: Application

  constructor() {
    this.app = express()
    this.initializeMiddlewares()
    this.initializeRoutes()
    this.initializeErrorHandling()
  }

  private initializeMiddlewares(): void {
    this.app.use(helmet())
    this.app.use(cors({
      origin: config.cors.origin,
      credentials: true
    }))
    this.app.use(compression())
    this.app.use(express.json({ limit: '10mb' }))
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }))
    
    const limiter = rateLimit({
      windowMs: config.rateLimit.windowMs,
      max: config.rateLimit.maxRequests,
      message: 'Too many requests from this IP, please try again later.',
      standardHeaders: true,
      legacyHeaders: false,
    })
    this.app.use('/api/', limiter)
    
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

  private initializeRoutes(): void {
    this.app.use('/api', routes)
    
    this.app.get('/', (_req: Request, res: Response) => {
      res.json({
        code: 200,
        message: 'QuickTV MacCMS Server API',
        version: '1.0.0',
        docs: '/api/health'
      })
    })
  }

  private initializeErrorHandling(): void {
    this.app.use((_req: Request, res: Response) => {
      res.status(404).json({
        code: 404,
        message: 'Route not found'
      })
    })

    this.app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
      logger.error('Unhandled error:', err)
      
      res.status(500).json({
        code: 500,
        message: config.env === 'production' ? 'Internal server error' : err.message,
        ...(config.env === 'development' && { stack: err.stack })
      })
    })
  }

  public getApp(): Application {
    return this.app
  }
}

export default new App().getApp()
