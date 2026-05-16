import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import path from 'path';
import routes from './routes/index.sqlite';
import logger from './utils/logger';
import { initSQLiteDB, seedSQLiteData } from './database/sqlite';

const PORT = process.env.PORT || 3000;

class Server {
  private app: Application;

  constructor() {
    this.app = express();
    this.initializeMiddlewares();
    this.initializeRoutes();
    this.initializeErrorHandling();
  }

  private initializeMiddlewares(): void {
    this.app.use(helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'", "'unsafe-inline'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          imgSrc: ["'self'", "data:", "https:"],
          connectSrc: ["'self'"],
          fontSrc: ["'self'"],
          objectSrc: ["'none'"],
          mediaSrc: ["'self'"],
          frameSrc: ["'none'"],
        },
      },
    }));
    this.app.use(cors({
      origin: '*',
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization']
    }));
    this.app.use(compression());
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));
    this.app.use(express.static(path.join(__dirname, '../public')));
    this.app.use(morgan('dev'));
  }

  private initializeRoutes(): void {
    this.app.use('/api', routes);

    this.app.get('/', (_req: Request, res: Response) => {
      res.json({
        code: 200,
        message: 'QuickTV MacCMS Server API (SQLite)',
        version: '1.0.0',
        docs: '/api/health'
      });
    });
  }

  private initializeErrorHandling(): void {
    this.app.use((_req: Request, res: Response) => {
      res.status(404).json({
        code: 404,
        message: 'Route not found'
      });
    });

    this.app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
      logger.error('Unhandled error:', err);

      res.status(500).json({
        code: 500,
        message: err.message,
        stack: err.stack
      });
    });
  }

  public async start(): Promise<void> {
    try {
      logger.info('🚀 初始化SQLite数据库...');
      await initSQLiteDB();

      logger.info('📦 填充测试数据...');
      await seedSQLiteData();

      const port = Number(PORT);
      this.app.listen(port, '0.0.0.0', () => {
        logger.info(`✅ 服务器启动成功！`);
        logger.info(`📍 本地地址: http://localhost:${port}`);
        logger.info(`📍 网络地址: http://192.168.10.158:${port}`);
        logger.info(`📍 API: http://192.168.10.158:${port}/api/health`);
        logger.info(`💾 数据库: SQLite (quicktv.db)`);
      });
    } catch (error) {
      logger.error('❌ 服务器启动失败:', error);
      process.exit(1);
    }
  }
}

const server = new Server();
server.start();
