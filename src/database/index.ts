import { Pool, PoolClient } from 'pg'
import config from '../config'
import logger from '../utils/logger'

class Database {
  private pool: Pool | null = null

  async connect(): Promise<void> {
    try {
      this.pool = new Pool({
        host: config.database.host,
        port: config.database.port,
        database: config.database.name,
        user: config.database.user,
        password: config.database.password,
        min: config.database.pool.min,
        max: config.database.pool.max,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 2000
      })

      this.pool.on('error', (err) => {
        logger.error('Unexpected database error:', err)
      })

      const client = await this.pool.connect()
      await client.query('SELECT NOW()')
      client.release()

      logger.info('Database connected successfully')
    } catch (error) {
      logger.error('Failed to connect to database:', error)
      throw error
    }
  }

  async disconnect(): Promise<void> {
    if (this.pool) {
      await this.pool.end()
      logger.info('Database disconnected')
    }
  }

  async query(text: string, params?: any[]): Promise<any> {
    if (!this.pool) {
      throw new Error('Database not connected')
    }

    try {
      const result = await this.pool.query(text, params)
      return result
    } catch (error) {
      logger.error('Database query error:', error)
      throw error
    }
  }

  async getClient(): Promise<PoolClient> {
    if (!this.pool) {
      throw new Error('Database not connected')
    }
    return await this.pool.connect()
  }

  getPool(): Pool | null {
    return this.pool
  }
}

const database = new Database()
export default database
