import { createClient, RedisClientType } from 'redis'
import config from '../config'
import logger from '../utils/logger'

class RedisCache {
  private client: RedisClientType | null = null
  private isConnected: boolean = false

  async connect(): Promise<void> {
    try {
      this.client = createClient({
        socket: {
          host: config.redis.host,
          port: config.redis.port
        },
        password: config.redis.password || undefined,
        database: config.redis.db
      })

      this.client.on('error', (err) => {
        logger.error('Redis Client Error', err)
        this.isConnected = false
      })

      this.client.on('connect', () => {
        logger.info('Redis Client Connected')
        this.isConnected = true
      })

      this.client.on('disconnect', () => {
        logger.warn('Redis Client Disconnected')
        this.isConnected = false
      })

      await this.client.connect()
    } catch (error) {
      logger.error('Failed to connect to Redis:', error)
      throw error
    }
  }

  async disconnect(): Promise<void> {
    if (this.client) {
      await this.client.quit()
      this.isConnected = false
      logger.info('Redis Client Disconnected')
    }
  }

  async get<T>(key: string): Promise<T | null> {
    if (!this.isConnected || !this.client) {
      logger.warn('Redis not connected, skipping get')
      return null
    }

    try {
      const value = await this.client.get(key)
      if (!value) return null
      return JSON.parse(value) as T
    } catch (error) {
      logger.error(`Redis GET error for key ${key}:`, error)
      return null
    }
  }

  async set(key: string, value: any, ttl?: number): Promise<boolean> {
    if (!this.isConnected || !this.client) {
      logger.warn('Redis not connected, skipping set')
      return false
    }

    try {
      const serialized = JSON.stringify(value)
      const expiry = ttl || config.redis.ttl

      await this.client.setEx(key, expiry, serialized)
      return true
    } catch (error) {
      logger.error(`Redis SET error for key ${key}:`, error)
      return false
    }
  }

  async del(key: string): Promise<boolean> {
    if (!this.isConnected || !this.client) {
      logger.warn('Redis not connected, skipping del')
      return false
    }

    try {
      await this.client.del(key)
      return true
    } catch (error) {
      logger.error(`Redis DEL error for key ${key}:`, error)
      return false
    }
  }

  async delPattern(pattern: string): Promise<number> {
    if (!this.isConnected || !this.client) {
      logger.warn('Redis not connected, skipping delPattern')
      return 0
    }

    try {
      const keys = await this.client.keys(pattern)
      if (keys.length === 0) return 0

      await this.client.del(keys)
      return keys.length
    } catch (error) {
      logger.error(`Redis DEL pattern error for ${pattern}:`, error)
      return 0
    }
  }

  async exists(key: string): Promise<boolean> {
    if (!this.isConnected || !this.client) {
      return false
    }

    try {
      const result = await this.client.exists(key)
      return result === 1
    } catch (error) {
      logger.error(`Redis EXISTS error for key ${key}:`, error)
      return false
    }
  }

  async expire(key: string, seconds: number): Promise<boolean> {
    if (!this.isConnected || !this.client) {
      return false
    }

    try {
      await this.client.expire(key, seconds)
      return true
    } catch (error) {
      logger.error(`Redis EXPIRE error for key ${key}:`, error)
      return false
    }
  }

  async incr(key: string): Promise<number> {
    if (!this.isConnected || !this.client) {
      return 0
    }

    try {
      return await this.client.incr(key)
    } catch (error) {
      logger.error(`Redis INCR error for key ${key}:`, error)
      return 0
    }
  }

  async decr(key: string): Promise<number> {
    if (!this.isConnected || !this.client) {
      return 0
    }

    try {
      return await this.client.decr(key)
    } catch (error) {
      logger.error(`Redis DECR error for key ${key}:`, error)
      return 0
    }
  }

  async hSet(key: string, field: string, value: any): Promise<boolean> {
    if (!this.isConnected || !this.client) {
      return false
    }

    try {
      const serialized = JSON.stringify(value)
      await this.client.hSet(key, field, serialized)
      return true
    } catch (error) {
      logger.error(`Redis HSET error for key ${key}:`, error)
      return false
    }
  }

  async hGet<T>(key: string, field: string): Promise<T | null> {
    if (!this.isConnected || !this.client) {
      return null
    }

    try {
      const value = await this.client.hGet(key, field)
      if (!value) return null
      return JSON.parse(value) as T
    } catch (error) {
      logger.error(`Redis HGET error for key ${key}:`, error)
      return null
    }
  }

  async hGetAll<T>(key: string): Promise<Record<string, T> | null> {
    if (!this.isConnected || !this.client) {
      return null
    }

    try {
      const data = await this.client.hGetAll(key)
      if (!data || Object.keys(data).length === 0) return null

      const result: Record<string, T> = {}
      for (const [field, value] of Object.entries(data)) {
        result[field] = JSON.parse(value) as T
      }
      return result
    } catch (error) {
      logger.error(`Redis HGETALL error for key ${key}:`, error)
      return null
    }
  }

  async hDel(key: string, field: string): Promise<boolean> {
    if (!this.isConnected || !this.client) {
      return false
    }

    try {
      await this.client.hDel(key, field)
      return true
    } catch (error) {
      logger.error(`Redis HDEL error for key ${key}:`, error)
      return false
    }
  }

  getClient(): RedisClientType | null {
    return this.client
  }

  isReady(): boolean {
    return this.isConnected
  }
}

const redisCache = new RedisCache()
export default redisCache
