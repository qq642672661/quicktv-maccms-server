import { db } from '../config/database';
import { logger } from '../utils/logger';
import bcrypt from 'bcryptjs';

async function seed() {
  try {
    logger.info('Starting database seeding...');

    logger.info('Seeding categories...');
    await db.query(`
      INSERT INTO categories (name, slug, description, sort_order) VALUES
      ('电影', 'movies', '电影分类', 1),
      ('电视剧', 'tv-series', '电视剧分类', 2),
      ('综艺', 'variety', '综艺节目分类', 3),
      ('动漫', 'anime', '动漫分类', 4),
      ('纪录片', 'documentary', '纪录片分类', 5),
      ('体育', 'sports', '体育赛事分类', 6)
      ON CONFLICT (slug) DO NOTHING
    `);

    logger.info('Seeding admin user...');
    const passwordHash = await bcrypt.hash('admin123456', 12);
    await db.query(`
      INSERT INTO users (username, email, password_hash, role, is_verified) VALUES
      ('admin', 'admin@quicktv.com', $1, 'superadmin', true)
      ON CONFLICT (username) DO NOTHING
    `, [passwordHash]);

    logger.info('Seeding test users...');
    const testPasswordHash = await bcrypt.hash('test123456', 12);
    await db.query(`
      INSERT INTO users (username, email, password_hash, role, is_verified) VALUES
      ('testuser', 'test@quicktv.com', $1, 'user', true),
      ('vipuser', 'vip@quicktv.com', $1, 'vip', true),
      ('editor', 'editor@quicktv.com', $1, 'editor', true)
      ON CONFLICT (username) DO NOTHING
    `, [testPasswordHash]);

    logger.info('Seeding system configs...');
    await db.query(`
      INSERT INTO system_configs (config_key, config_value, config_type, description, is_public) VALUES
      ('site_name', 'QuickTV', 'string', '网站名称', true),
      ('site_description', '企业级TV流媒体平台', 'string', '网站描述', true),
      ('enable_registration', 'true', 'boolean', '是否开放注册', true),
      ('enable_comments', 'true', 'boolean', '是否开放评论', true),
      ('max_upload_size', '104857600', 'number', '最大上传大小（字节）', false),
      ('video_quality_options', '["360p", "480p", "720p", "1080p"]', 'json', '视频清晰度选项', true)
      ON CONFLICT (config_key) DO NOTHING
    `);

    logger.info('Initializing user statistics for existing users...');
    await db.query(`
      INSERT INTO user_statistics (user_id)
      SELECT id FROM users
      ON CONFLICT (user_id) DO NOTHING
    `);

    logger.info('Database seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    logger.error('Database seeding failed:', error);
    process.exit(1);
  }
}

seed();
