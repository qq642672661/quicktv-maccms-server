import app from './app'
import config from './config'
import database from './database'
import redisCache from './cache/redis'
import logger from './utils/logger'
import { createServer } from 'http'

const server = createServer(app)

async function startServer(): Promise<void> {
  try {
    await database.connect()
    logger.info('Database connected')

    await redisCache.connect()
    logger.info('Redis connected')

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

async function gracefulShutdown(signal: string): Promise<void> {
  logger.info(`${signal} received, shutting down gracefully...`)
  
  server.close(async () => {
    logger.info('HTTP server closed')
    
    try {
      await redisCache.disconnect()
      logger.info('Redis disconnected')
      
      await database.disconnect()
      logger.info('Database disconnected')
      
      process.exit(0)
    } catch (error) {
      logger.error('Error during shutdown:', error)
      process.exit(1)
    }
  })

  setTimeout(() => {
    logger.error('Forced shutdown after timeout')
    process.exit(1)
  }, 10000)
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'))
process.on('SIGINT', () => gracefulShutdown('SIGINT'))

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason)
})

process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error)
  gracefulShutdown('UNCAUGHT_EXCEPTION')
})

startServer()
