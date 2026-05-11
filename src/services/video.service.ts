import db from '../config/database';
import { AppError } from '../middleware/error-handler';
import logger from '../utils/logger';

export interface Video {
  video_id: string;
  title: string;
  description?: string;
  category_id: string;
  video_url: string;
  cover_image?: string;
  duration?: number;
  resolution?: string;
  file_size?: number;
  view_count: number;
  like_count: number;
  rating: number;
  status: string;
  is_featured: boolean;
  tags?: string[];
  maccms_vod_id?: string;
  maccms_data?: any;
  created_at: Date;
  updated_at: Date;
}

export interface CreateVideoData {
  title: string;
  description?: string;
  category_id: string;
  video_url: string;
  cover_image?: string;
  duration?: number;
  resolution?: string;
  file_size?: number;
  tags?: string[];
  maccms_vod_id?: string;
  maccms_data?: any;
}

export interface UpdateVideoData {
  title?: string;
  description?: string;
  category_id?: string;
  video_url?: string;
  cover_image?: string;
  duration?: number;
  resolution?: string;
  file_size?: number;
  status?: string;
  is_featured?: boolean;
  tags?: string[];
  maccms_data?: any;
}

export interface VideoListQuery {
  page?: number;
  pageSize?: number;
  category_id?: string;
  status?: string;
  is_featured?: boolean;
  search?: string;
  sort?: 'latest' | 'popular' | 'rating';
}

class VideoService {
  async createVideo(data: CreateVideoData): Promise<Video> {
    try {
      const result = await db.query(
        `INSERT INTO videos (
          title, description, category_id, video_url, cover_image,
          duration, resolution, file_size, tags, maccms_vod_id, maccms_data
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        RETURNING *`,
        [
          data.title,
          data.description,
          data.category_id,
          data.video_url,
          data.cover_image,
          data.duration,
          data.resolution,
          data.file_size,
          data.tags,
          data.maccms_vod_id,
          data.maccms_data,
        ]
      );

      logger.info('Video created', { video_id: result.rows[0].video_id });
      return result.rows[0];
    } catch (error: any) {
      logger.error('Create video error:', error);
      if (error.code === '23503') {
        throw new AppError('分类不存在', 400);
      }
      throw new AppError('创建视频失败', 500);
    }
  }

  async getVideoById(videoId: string): Promise<Video> {
    const result = await db.query(
      `SELECT v.*, c.name as category_name
       FROM videos v
       LEFT JOIN categories c ON v.category_id = c.category_id
       WHERE v.video_id = $1`,
      [videoId]
    );

    if (result.rows.length === 0) {
      throw new AppError('视频不存在', 404);
    }

    return result.rows[0];
  }

  async getVideoList(query: VideoListQuery) {
    const page = query.page || 1;
    const pageSize = Math.min(query.pageSize || 20, 100);
    const offset = (page - 1) * pageSize;

    const whereConditions: string[] = [];
    const queryParams: any[] = [];
    let paramIndex = 1;

    if (query.category_id) {
      whereConditions.push(`v.category_id = $${paramIndex}`);
      queryParams.push(query.category_id);
      paramIndex++;
    }

    if (query.status) {
      whereConditions.push(`v.status = $${paramIndex}`);
      queryParams.push(query.status);
      paramIndex++;
    }

    if (query.is_featured !== undefined) {
      whereConditions.push(`v.is_featured = $${paramIndex}`);
      queryParams.push(query.is_featured);
      paramIndex++;
    }

    if (query.search) {
      whereConditions.push(`(v.title ILIKE $${paramIndex} OR v.description ILIKE $${paramIndex})`);
      queryParams.push(`%${query.search}%`);
      paramIndex++;
    }

    const whereClause = whereConditions.length > 0 
      ? `WHERE ${whereConditions.join(' AND ')}` 
      : '';

    let orderBy = 'v.created_at DESC';
    if (query.sort === 'popular') {
      orderBy = 'v.view_count DESC, v.created_at DESC';
    } else if (query.sort === 'rating') {
      orderBy = 'v.rating DESC, v.view_count DESC';
    }

    const countResult = await db.query(
      `SELECT COUNT(*) FROM videos v ${whereClause}`,
      queryParams
    );
    const total = parseInt(countResult.rows[0].count);

    const result = await db.query(
      `SELECT v.*, c.name as category_name
       FROM videos v
       LEFT JOIN categories c ON v.category_id = c.category_id
       ${whereClause}
       ORDER BY ${orderBy}
       LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
      [...queryParams, pageSize, offset]
    );

    return {
      videos: result.rows,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  async searchVideos(keyword: string, page: number = 1, pageSize: number = 20) {
    return this.getVideoList({
      page,
      pageSize,
      search: keyword,
      status: 'published',
    });
  }

  async updateVideo(videoId: string, data: UpdateVideoData): Promise<Video> {
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
    values.push(videoId);

    try {
      const result = await db.query(
        `UPDATE videos 
         SET ${updates.join(', ')}
         WHERE video_id = $${paramIndex}
         RETURNING *`,
        values
      );

      if (result.rows.length === 0) {
        throw new AppError('视频不存在', 404);
      }

      logger.info('Video updated', { video_id: videoId });
      return result.rows[0];
    } catch (error: any) {
      logger.error('Update video error:', error);
      if (error.code === '23503') {
        throw new AppError('分类不存在', 400);
      }
      throw error;
    }
  }

  async deleteVideo(videoId: string): Promise<void> {
    const result = await db.query(
      'DELETE FROM videos WHERE video_id = $1 RETURNING video_id',
      [videoId]
    );

    if (result.rows.length === 0) {
      throw new AppError('视频不存在', 404);
    }

    logger.info('Video deleted', { video_id: videoId });
  }

  async incrementViewCount(videoId: string): Promise<void> {
    await db.query(
      `UPDATE videos 
       SET view_count = view_count + 1, updated_at = NOW()
       WHERE video_id = $1`,
      [videoId]
    );
  }

  async incrementLikeCount(videoId: string): Promise<void> {
    await db.query(
      `UPDATE videos 
       SET like_count = like_count + 1, updated_at = NOW()
       WHERE video_id = $1`,
      [videoId]
    );
  }

  async updateRating(videoId: string, rating: number): Promise<void> {
    if (rating < 0 || rating > 10) {
      throw new AppError('评分必须在0-10之间', 400);
    }

    await db.query(
      `UPDATE videos 
       SET rating = $1, updated_at = NOW()
       WHERE video_id = $2`,
      [rating, videoId]
    );
  }

  async getFeaturedVideos(limit: number = 10): Promise<Video[]> {
    const result = await db.query(
      `SELECT v.*, c.name as category_name
       FROM videos v
       LEFT JOIN categories c ON v.category_id = c.category_id
       WHERE v.is_featured = true AND v.status = 'published'
       ORDER BY v.view_count DESC, v.created_at DESC
       LIMIT $1`,
      [limit]
    );

    return result.rows;
  }

  async getPopularVideos(limit: number = 10): Promise<Video[]> {
    const result = await db.query(
      `SELECT v.*, c.name as category_name
       FROM videos v
       LEFT JOIN categories c ON v.category_id = c.category_id
       WHERE v.status = 'published'
       ORDER BY v.view_count DESC, v.rating DESC
       LIMIT $1`,
      [limit]
    );

    return result.rows;
  }

  async getLatestVideos(limit: number = 10): Promise<Video[]> {
    const result = await db.query(
      `SELECT v.*, c.name as category_name
       FROM videos v
       LEFT JOIN categories c ON v.category_id = c.category_id
       WHERE v.status = 'published'
       ORDER BY v.created_at DESC
       LIMIT $1`,
      [limit]
    );

    return result.rows;
  }
}

export const videoService = new VideoService();
