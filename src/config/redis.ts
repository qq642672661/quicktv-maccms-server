import { createClient, RedisClientType } from 'redis';
import config from '../config';
import logger from '../utils/logger';

class RedisClient {
  private client: RedisClientType;
  private isConnected: boolean = false;

  constructor() {
    this.client = createClient({
      socket: {
        host: config.redis.host,
        port: config.redis.port,
      },
      password: config.redis.password || undefined,
      database: config.redis.db,
    });

    this.client.on('error', (err) => {
      logger.error('Redis Client Error:', err);
      this.isConnected = false;
    });

    this.client.on('connect', () => {
      logger.info('Redis Client Connected');
      this.isConnected = true;
    });

    this.client.on('disconnect', () => {
      logger.warn('Redis Client Disconnected');
      this.isConnected = false;
    });
  }

  async connect(): Promise<void> {
    try {
      await this.client.connect();
    } catch (error) {
      logger.error('Failed to connect to Redis:', error);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    if (this.isConnected) {
      await this.client.quit();
      this.isConnected = false;
      logger.info('Redis Client Disconnected');
    }
  }

  getClient(): RedisClientType {
    return this.client;
  }

  isReady(): boolean {
    return this.isConnected;
  }
}

export const redis = new RedisClient();
export default redis;
