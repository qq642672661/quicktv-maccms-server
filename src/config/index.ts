import dotenv from 'dotenv';

dotenv.config();

interface Config {
  env: string;
  port: number;
  host: string;
  database: {
    url: string;
    host: string;
    port: number;
    name: string;
    user: string;
    password: string;
    maxConnections: number;
    idleTimeout: number;
  };
  redis: {
    url: string;
    host: string;
    port: number;
    password: string;
    db: number;
    ttl: number;
  };
  jwt: {
    secret: string;
    expiresIn: string;
    refreshExpiresIn: string;
  };
  rabbitmq: {
    url: string;
    host: string;
    port: number;
    user: string;
    password: string;
  };
  maccms: {
    apiUrl: string;
    apiKey: string;
  };
  cors: {
    origin: string[];
  };
  rateLimit: {
    windowMs: number;
    maxRequests: number;
  };
  log: {
    level: string;
    filePath: string;
  };
  encryption: {
    key: string;
  };
  upload: {
    maxSize: number;
    path: string;
  };
  smtp: {
    host: string;
    port: number;
    user: string;
    password: string;
    from: string;
  };
}

export const config: Config = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3000', 10),
  host: process.env.HOST || '0.0.0.0',
  
  database: {
    url: process.env.DATABASE_URL || '',
    host: process.env.DATABASE_HOST || 'localhost',
    port: parseInt(process.env.DATABASE_PORT || '5432', 10),
    name: process.env.DATABASE_NAME || 'quicktv',
    user: process.env.DATABASE_USER || 'quicktv_user',
    password: process.env.DATABASE_PASSWORD || '',
    maxConnections: parseInt(process.env.DATABASE_MAX_CONNECTIONS || '20', 10),
    idleTimeout: parseInt(process.env.DATABASE_IDLE_TIMEOUT || '30000', 10)
  },
  
  redis: {
    url: process.env.REDIS_URL || 'redis://localhost:6379',
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    password: process.env.REDIS_PASSWORD || '',
    db: parseInt(process.env.REDIS_DB || '0', 10),
    ttl: parseInt(process.env.REDIS_TTL || '3600', 10)
  },
  
  jwt: {
    secret: process.env.JWT_SECRET || 'your_jwt_secret_key_min_32_characters_long',
    expiresIn: process.env.JWT_EXPIRES_IN || '24h',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d'
  },
  
  rabbitmq: {
    url: process.env.RABBITMQ_URL || 'amqp://localhost:5672',
    host: process.env.RABBITMQ_HOST || 'localhost',
    port: parseInt(process.env.RABBITMQ_PORT || '5672', 10),
    user: process.env.RABBITMQ_USER || 'guest',
    password: process.env.RABBITMQ_PASSWORD || 'guest'
  },
  
  maccms: {
    apiUrl: process.env.MACCMS_API_URL || '',
    apiKey: process.env.MACCMS_API_KEY || ''
  },
  
  cors: {
    origin: (process.env.CORS_ORIGIN || 'http://localhost:8080').split(',')
  },
  
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10),
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10)
  },
  
  log: {
    level: process.env.LOG_LEVEL || 'info',
    filePath: process.env.LOG_FILE_PATH || './logs'
  },
  
  encryption: {
    key: process.env.ENCRYPTION_KEY || ''
  },
  
  upload: {
    maxSize: parseInt(process.env.UPLOAD_MAX_SIZE || '10485760', 10),
    path: process.env.UPLOAD_PATH || './uploads'
  },
  
  smtp: {
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    user: process.env.SMTP_USER || '',
    password: process.env.SMTP_PASSWORD || '',
    from: process.env.SMTP_FROM || 'noreply@quicktv.com'
  }
};

export default config;
