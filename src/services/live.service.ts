import { db } from '../config/database';
import { AppError } from '../middleware/error-handler';
import { logger } from '../utils/logger';

export interface LiveStream {
  id: string;
  title: string;
  description?: string;
  category_id?: string;
  cover_image?: string;
  stream_url: string;
  stream_key?: string;
  stream_protocol: string;
  resolution?: string;
  bitrate?: number;
  viewer_count: number;
  like_count: number;
  comment_count: number;
  status: string;
  is_featured: boolean;
  started_at?: Date;
  ended_at?: Date;
  created_at: Date;
  updated_at: Date;
}

export interface CreateLiveStreamData {
  title: string;
  description?: string;
  category_id?: string;
  cover_image?: string;
  stream_url: string;
  stream_key?: string;
  stream_protocol?: string;
  resolution?: string;
  bitrate?: number;
}

export interface UpdateLiveStreamData {
  title?: string;
  description?: string;
  category_id?: string;
  cover_image?: string;
  stream_url?: string;
  stream_key?: string;
  stream_protocol?: string;
  resolution?: string;
  bitrate?: number;
  status?: string;
  is_featured?: boolean;
}

export interface LiveStreamListQuery {
  page?: number;
  pageSize?: number;
  category_id?: string;
  status?: string;
  is_featured?: boolean;
  search?: string;
}

class LiveStreamService {
  async createLiveStream(data: CreateLiveStreamData): Promise<LiveStream> {
    try {
      const result = await db.query(
        `INSERT INTO live_streams (
          title, description, category_id, cover_image, stream_url,
          stream_key, stream_protocol, resolution, bitrate
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING *`,
        [
          data.title,
          data.description,
          data.category_id,
          data.cover_image,
          data.stream_url,
          data.stream_key,
          data.stream_protocol || 'hls',
          data.resolution,
          data.bitrate,
        ]
      );

      logger.info('Live stream created', { id: result.rows[0].id });
      return result.rows[0];
    } catch (error: any) {
      logger.error('Create live stream error:', error);
      if (error.code === '23503') {
        throw new AppError('分类不存在', 400);
      }
      throw new AppError('创建直播失败', 500);
    }
  }

  async getLiveStreamById(id: string): Promise<LiveStream> {
    const result = await db.query(
      `SELECT ls.*, c.name as category_name
       FROM live_streams ls
       LEFT JOIN categories c ON ls.category_id = c.id
       WHERE ls.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      throw new AppError('直播不存在', 404);
    }

    return result.rows[0];
  }

  async getLiveStreamList(query: LiveStreamListQuery) {
    const page = query.page || 1;
    const pageSize = Math.min(query.pageSize || 20, 100);
    const offset = (page - 1) * pageSize;

    let whereConditions: string[] = [];
    let queryParams: any[] = [];
    let paramIndex = 1;

    if (query.category_id) {
      whereConditions.push(`ls.category_id = $${paramIndex}`);
      queryParams.push(query.category_id);
      paramIndex++;
    }

    if (query.status) {
      whereConditions.push(`ls.status = $${paramIndex}`);
      queryParams.push(query.status);
      paramIndex++;
    }

    if (query.is_featured !== undefined) {
      whereConditions.push(`ls.is_featured = $${paramIndex}`);
      queryParams.push(query.is_featured);
      paramIndex++;
    }

    if (query.search) {
      whereConditions.push(`(ls.title ILIKE $${paramIndex} OR ls.description ILIKE $${paramIndex})`);
      queryParams.push(`%${query.search}%`);
      paramIndex++;
    }

    const whereClause = whereConditions.length > 0 
      ? `WHERE ${whereConditions.join(' AND ')}` 
      : '';

    const countResult = await db.query(
      `SELECT COUNT(*) FROM live_streams ls ${whereClause}`,
      queryParams
    );
    const total = parseInt(countResult.rows[0].count);

    const result = await db.query(
      `SELECT ls.*, c.name as category_name
       FROM live_streams ls
       LEFT JOIN categories c ON ls.category_id = c.id
       ${whereClause}
       ORDER BY 
         CASE WHEN ls.status = 'live' THEN 0 ELSE 1 END,
         ls.viewer_count DESC,
         ls.created_at DESC
       LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
      [...queryParams, pageSize, offset]
    );

    return {
      streams: result.rows,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  async updateLiveStream(id: string, data: UpdateLiveStreamData): Promise<LiveStream> {
    const updates: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined) {
        updates.push(`${key} = $${paramIndex}`);
        values.push(value);
        paramIndex++;
      }
    });

    if (updates.length === 0) {
      throw new AppError('没有要更新的数据', 400);
    }

    updates.push(`updated_at = NOW()`);
    values.push(id);

    try {
      const result = await db.query(
        `UPDATE live_streams 
         SET ${updates.join(', ')}
         WHERE id = $${paramIndex}
         RETURNING *`,
        values
      );

      if (result.rows.length === 0) {
        throw new AppError('直播不存在', 404);
      }

      logger.info('Live stream updated', { id });
      return result.rows[0];
    } catch (error: any) {
      logger.error('Update live stream error:', error);
      if (error.code === '23503') {
        throw new AppError('分类不存在', 400);
      }
      throw error;
    }
  }

  async deleteLiveStream(id: string): Promise<void> {
    const result = await db.query(
      'DELETE FROM live_streams WHERE id = $1 RETURNING id',
      [id]
    );

    if (result.rows.length === 0) {
      throw new AppError('直播不存在', 404);
    }

    logger.info('Live stream deleted', { id });
  }

  async startLiveStream(id: string): Promise<void> {
    const result = await db.query(
      `UPDATE live_streams 
       SET status = 'live', started_at = NOW(), updated_at = NOW()
       WHERE id = $1 AND status = 'offline'
       RETURNING id`,
      [id]
    );

    if (result.rows.length === 0) {
      throw new AppError('直播不存在或已经在直播中', 400);
    }

    logger.info('Live stream started', { id });
  }

  async endLiveStream(id: string): Promise<void> {
    const result = await db.query(
      `UPDATE live_streams 
       SET status = 'ended', ended_at = NOW(), updated_at = NOW()
       WHERE id = $1 AND status = 'live'
       RETURNING id`,
      [id]
    );

    if (result.rows.length === 0) {
      throw new AppError('直播不存在或未在直播中', 400);
    }

    logger.info('Live stream ended', { id });
  }

  async incrementViewerCount(id: string): Promise<void> {
    await db.query(
      `UPDATE live_streams 
       SET viewer_count = viewer_count + 1, updated_at = NOW()
       WHERE id = $1`,
      [id]
    );
  }

  async decrementViewerCount(id: string): Promise<void> {
    await db.query(
      `UPDATE live_streams 
       SET viewer_count = GREATEST(viewer_count - 1, 0), updated_at = NOW()
       WHERE id = $1`,
      [id]
    );
  }

  async incrementLikeCount(id: string): Promise<void> {
    await db.query(
      `UPDATE live_streams 
       SET like_count = like_count + 1, updated_at = NOW()
       WHERE id = $1`,
      [id]
    );
  }

  async getLiveStreams(limit: number = 20): Promise<LiveStream[]> {
    const result = await db.query(
      `SELECT ls.*, c.name as category_name
       FROM live_streams ls
       LEFT JOIN categories c ON ls.category_id = c.id
       WHERE ls.status = 'live'
       ORDER BY ls.viewer_count DESC, ls.started_at DESC
       LIMIT $1`,
      [limit]
    );

    return result.rows;
  }

  async getFeaturedLiveStreams(limit: number = 10): Promise<LiveStream[]> {
    const result = await db.query(
      `SELECT ls.*, c.name as category_name
       FROM live_streams ls
       LEFT JOIN categories c ON ls.category_id = c.id
       WHERE ls.is_featured = true AND ls.status IN ('live', 'offline')
       ORDER BY 
         CASE WHEN ls.status = 'live' THEN 0 ELSE 1 END,
         ls.viewer_count DESC
       LIMIT $1`,
      [limit]
    );

    return result.rows;
  }

  async getPopularLiveStreams(limit: number = 10): Promise<LiveStream[]> {
    const result = await db.query(
      `SELECT ls.*, c.name as category_name
       FROM live_streams ls
       LEFT JOIN categories c ON ls.category_id = c.id
       WHERE ls.status = 'live'
       ORDER BY ls.viewer_count DESC, ls.like_count DESC
       LIMIT $1`,
      [limit]
    );

    return result.rows;
  }
}

export const liveStreamService = new LiveStreamService();
