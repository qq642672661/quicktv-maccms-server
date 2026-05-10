import dotenv from 'dotenv'

dotenv.config()

interface Config {
  env: string
  port: number
  database: {
    url: string
    host: string
    port: number
    name: string
    user: string
    password: string
    pool: {
      min: number
      max: number
    }
  }
  redis: {
    host: string
    port: number
    password: string
    db: number
    ttl: number
  }
  jwt: {
    secret: string
    expiresIn: string
    refreshExpiresIn: string
  }
  maccms: {
    apiUrl: string
    timeout: number
  }
  cors: {
    origin: string[]
  }
  rateLimit: {
    windowMs: number
    maxRequests: number
  }
  log: {
    level: string
    filePath: string
  }
  upload: {
    maxSize: number
    path: string
  }
  cache: {
    enabled: boolean
    defaultTTL: number
  }
}

const config: Config = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3000', 10),
  database: {
    url: process.env.DATABASE_URL || '',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    name: process.env.DB_NAME || 'quicktv_maccms',
    user: process.env.DB_USER || 'quicktv',
    password: process.env.DB_PASSWORD || '',
    pool: {
      min: parseInt(process.env.DB_POOL_MIN || '2', 10),
      max: parseInt(process.env.DB_POOL_MAX || '10', 10)
    }
  },
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    password: process.env.REDIS_PASSWORD || '',
    db: parseInt(process.env.REDIS_DB || '0', 10),
    ttl: parseInt(process.env.REDIS_TTL || '3600', 10)
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'your-secret-key',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d'
  },
  maccms: {
    apiUrl: process.env.MACCMS_API_URL || '',
    timeout: parseInt(process.env.MACCMS_TIMEOUT || '10000', 10)
  },
  cors: {
    origin: (process.env.CORS_ORIGIN || 'http://localhost:3000').split(',')
  },
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10),
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10)
  },
  log: {
    level: process.env.LOG_LEVEL || 'info',
    filePath: process.env.LOG_FILE_PATH || './logs'
  },
  upload: {
    maxSize: parseInt(process.env.UPLOAD_MAX_SIZE || '10485760', 10),
    path: process.env.UPLOAD_PATH || './uploads'
  },
  cache: {
    enabled: process.env.CACHE_ENABLED === 'true',
    defaultTTL: parseInt(process.env.CACHE_DEFAULT_TTL || '300', 10)
  }
}

export default config
