import database from '../database';
import logger from '../utils/logger';
import redisCache from '../cache/redis';

export interface MediaItem {
  id?: number;
  media_id: string;
  title: string;
  subtitle?: string;
  cover?: string;
  video_url?: string;
  duration?: number;
  category?: string;
  tags?: any;
  description?: string;
  view_count?: number;
  status?: number;
}

const CACHE_TTL = 3600;
const CACHE_KEY_PREFIX = 'media:';

export class MediaService {
  static async getMediaList(page: number = 1, limit: number = 20, category?: string): Promise<{ data: MediaItem[], total: number }> {
    try {
      const offset = (page - 1) * limit;
      const cacheKey = `${CACHE_KEY_PREFIX}list:${page}:${limit}:${category || 'all'}`;
      const cached = await redisCache.get<{ data: MediaItem[], total: number }>(cacheKey);

      if (cached) {
        return cached;
      }

      let whereClause = 'WHERE status = 1';
      const params: any[] = [];
      let paramIndex = 1;

      if (category) {
        whereClause += ` AND category = $${paramIndex}`;
        params.push(category);
        paramIndex++;
      }

      const countResult = await database.query(
        `SELECT COUNT(*) as total FROM media_library ${whereClause}`,
        params
      );
      const total = parseInt(countResult.rows[0].total);

      params.push(limit, offset);
      const dataResult = await database.query(`
        SELECT * FROM media_library
        ${whereClause}
        ORDER BY created_at DESC
        LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
      `, params);

      const result = { data: dataResult.rows, total };
      await redisCache.set(cacheKey, result, CACHE_TTL);

      return result;
    } catch (error) {
      logger.error('获取媒体列表失败:', error);
      throw error;
    }
  }

  static async getMediaById(id: number): Promise<MediaItem | null> {
    try {
      const cacheKey = `${CACHE_KEY_PREFIX}${id}`;
      const cached = await redisCache.get<MediaItem>(cacheKey);

      if (cached) {
        return cached;
      }

      const result = await database.query(
        'SELECT * FROM media_library WHERE id = $1 AND status = 1',
        [id]
      );

      const media = result.rows[0] || null;
      if (media) {
        await redisCache.set(cacheKey, media, CACHE_TTL);
      }

      return media;
    } catch (error) {
      logger.error(`获取媒体失败 (id: ${id}):`, error);
      throw error;
    }
  }

  static async getMediaByMediaId(mediaId: string): Promise<MediaItem | null> {
    try {
      const cacheKey = `${CACHE_KEY_PREFIX}mid:${mediaId}`;
      const cached = await redisCache.get<MediaItem>(cacheKey);

      if (cached) {
        return cached;
      }

      const result = await database.query(
        'SELECT * FROM media_library WHERE media_id = $1 AND status = 1',
        [mediaId]
      );

      const media = result.rows[0] || null;
      if (media) {
        await redisCache.set(cacheKey, JSON.stringify(media), CACHE_TTL);
      }

      return media;
    } catch (error) {
      logger.error(`获取媒体失败 (mediaId: ${mediaId}):`, error);
      throw error;
    }
  }

  static async createMedia(media: MediaItem): Promise<number> {
    try {
      const result = await database.query(`
        INSERT INTO media_library (
          media_id, title, subtitle, cover, video_url, duration,
          category, tags, description, view_count, status
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        RETURNING id
      `, [
        media.media_id,
        media.title,
        media.subtitle || null,
        media.cover || null,
        media.video_url || null,
        media.duration || null,
        media.category || null,
        media.tags ? JSON.stringify(media.tags) : null,
        media.description || null,
        media.view_count || 0,
        media.status || 1
      ]);

      const id = result.rows[0].id;
      await this.clearCache();

      logger.info(`媒体创建成功 (id: ${id})`);
      return id;
    } catch (error) {
      logger.error('创建媒体失败:', error);
      throw error;
    }
  }

  static async updateMedia(id: number, media: Partial<MediaItem>): Promise<boolean> {
    try {
      const fields: string[] = [];
      const values: any[] = [];
      let paramIndex = 1;

      Object.entries(media).forEach(([key, value]) => {
        if (key !== 'id' && value !== undefined) {
          if (key === 'tags' && typeof value === 'object') {
            fields.push(`${key} = $${paramIndex}`);
            values.push(JSON.stringify(value));
          } else {
            fields.push(`${key} = $${paramIndex}`);
            values.push(value);
          }
          paramIndex++;
        }
      });

      if (fields.length === 0) {
        return false;
      }

      values.push(id);
      const result = await database.query(`
        UPDATE media_library SET ${fields.join(', ')} WHERE id = $${paramIndex}
      `, values);

      if (result.rowCount > 0) {
        await this.clearCache();
        logger.info(`媒体更新成功 (id: ${id})`);
        return true;
      }

      return false;
    } catch (error) {
      logger.error(`更新媒体失败 (id: ${id}):`, error);
      throw error;
    }
  }

  static async deleteMedia(id: number): Promise<boolean> {
    try {
      const result = await database.query(
        'UPDATE media_library SET status = 0 WHERE id = $1',
        [id]
      );

      if (result.rowCount > 0) {
        await this.clearCache();
        logger.info(`媒体删除成功 (id: ${id})`);
        return true;
      }

      return false;
    } catch (error) {
      logger.error(`删除媒体失败 (id: ${id}):`, error);
      throw error;
    }
  }

  static async incrementViewCount(mediaId: string): Promise<boolean> {
    try {
      const result = await database.query(
        'UPDATE media_library SET view_count = view_count + 1 WHERE media_id = $1',
        [mediaId]
      );

      if (result.rowCount > 0) {
        await redisCache.del(`${CACHE_KEY_PREFIX}mid:${mediaId}`);
        return true;
      }

      return false;
    } catch (error) {
      logger.error(`增加观看次数失败 (mediaId: ${mediaId}):`, error);
      throw error;
    }
  }

  private static async clearCache(): Promise<void> {
    try {
      await redisCache.delPattern(`${CACHE_KEY_PREFIX}*`);
    } catch (error) {
      logger.error('清除Media缓存失败:', error);
    }
  }
}
