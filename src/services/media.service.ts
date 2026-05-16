import db from '../database/schema';
import logger from '../utils/logger';

export interface MediaItem {
  id?: number;
  media_id: string;
  title: string;
  subtitle?: string;
  cover?: string;
  video_url?: string;
  duration?: number;
  category?: string;
  tags?: string;
  description?: string;
  view_count?: number;
  status?: number;
}

export class MediaService {
  static getAllMedia(page: number = 1, limit: number = 20, category?: string): { data: MediaItem[], total: number } {
    try {
      let whereClause = 'WHERE status = 1';
      const params: any[] = [];

      if (category) {
        whereClause += ' AND category = ?';
        params.push(category);
      }

      const countStmt = db.prepare(`SELECT COUNT(*) as total FROM media_library ${whereClause}`);
      const { total } = countStmt.get(...params) as { total: number };

      const offset = (page - 1) * limit;
      const stmt = db.prepare(`
        SELECT * FROM media_library 
        ${whereClause}
        ORDER BY created_at DESC 
        LIMIT ? OFFSET ?
      `);
      
      const data = stmt.all(...params, limit, offset) as MediaItem[];
      
      return { data, total };
    } catch (error) {
      logger.error('获取媒体列表失败:', error);
      throw error;
    }
  }

  static getMediaById(id: number): MediaItem | undefined {
    try {
      const stmt = db.prepare('SELECT * FROM media_library WHERE id = ? AND status = 1');
      return stmt.get(id) as MediaItem | undefined;
    } catch (error) {
      logger.error(`获取媒体失败 (id: ${id}):`, error);
      throw error;
    }
  }

  static getMediaByMediaId(mediaId: string): MediaItem | undefined {
    try {
      const stmt = db.prepare('SELECT * FROM media_library WHERE media_id = ? AND status = 1');
      return stmt.get(mediaId) as MediaItem | undefined;
    } catch (error) {
      logger.error(`获取媒体失败 (mediaId: ${mediaId}):`, error);
      throw error;
    }
  }

  static createMedia(media: MediaItem): number {
    try {
      const stmt = db.prepare(`
        INSERT INTO media_library (
          media_id, title, subtitle, cover, video_url, duration,
          category, tags, description, view_count, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      
      const result = stmt.run(
        media.media_id,
        media.title,
        media.subtitle || null,
        media.cover || null,
        media.video_url || null,
        media.duration || null,
        media.category || null,
        media.tags || null,
        media.description || null,
        media.view_count || 0,
        media.status || 1
      );
      
      logger.info(`媒体创建成功 (id: ${result.lastInsertRowid})`);
      return result.lastInsertRowid as number;
    } catch (error) {
      logger.error('创建媒体失败:', error);
      throw error;
    }
  }

  static updateMedia(id: number, media: Partial<MediaItem>): boolean {
    try {
      const fields: string[] = [];
      const values: any[] = [];

      Object.entries(media).forEach(([key, value]) => {
        if (key !== 'id' && value !== undefined) {
          fields.push(`${key} = ?`);
          values.push(value);
        }
      });

      if (fields.length === 0) {
        return false;
      }

      fields.push('updated_at = CURRENT_TIMESTAMP');
      values.push(id);

      const stmt = db.prepare(`
        UPDATE media_library SET ${fields.join(', ')} WHERE id = ?
      `);
      
      const result = stmt.run(...values);
      logger.info(`媒体更新成功 (id: ${id})`);
      return result.changes > 0;
    } catch (error) {
      logger.error(`更新媒体失败 (id: ${id}):`, error);
      throw error;
    }
  }

  static deleteMedia(id: number): boolean {
    try {
      const stmt = db.prepare('UPDATE media_library SET status = 0 WHERE id = ?');
      const result = stmt.run(id);
      logger.info(`媒体删除成功 (id: ${id})`);
      return result.changes > 0;
    } catch (error) {
      logger.error(`删除媒体失败 (id: ${id}):`, error);
      throw error;
    }
  }

  static incrementViewCount(mediaId: string): boolean {
    try {
      const stmt = db.prepare('UPDATE media_library SET view_count = view_count + 1 WHERE media_id = ?');
      const result = stmt.run(mediaId);
      return result.changes > 0;
    } catch (error) {
      logger.error(`增加观看次数失败 (mediaId: ${mediaId}):`, error);
      throw error;
    }
  }
}
