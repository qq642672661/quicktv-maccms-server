import { db } from '../config/database';
import { AppError } from '../middleware/error-handler';
import { logger } from '../utils/logger';

export interface PlayHistory {
  id: string;
  user_id: string;
  video_id: string;
  progress: number;
  duration: number;
  completed: boolean;
  last_played_at: Date;
  created_at: Date;
}

class PlayHistoryService {
  async recordPlay(userId: string, videoId: string, progress: number, duration: number): Promise<PlayHistory> {
    try {
      const completed = progress >= duration * 0.9;
      
      const result = await db.query(
        `INSERT INTO play_history (user_id, video_id, progress, duration, completed, last_played_at)
         VALUES ($1, $2, $3, $4, $5, NOW())
         ON CONFLICT (user_id, video_id) 
         DO UPDATE SET 
           progress = $3,
           duration = $4,
           completed = $5,
           last_played_at = NOW()
         RETURNING *`,
        [userId, videoId, progress, duration, completed]
      );

      logger.info('Play history recorded', { user_id: userId, video_id: videoId });
      return result.rows[0];
    } catch (error: any) {
      logger.error('Record play history error:', error);
      throw new AppError('记录播放历史失败', 500);
    }
  }

  async getPlayHistory(userId: string, page: number = 1, pageSize: number = 20) {
    const offset = (page - 1) * pageSize;

    const countResult = await db.query(
      'SELECT COUNT(*) FROM play_history WHERE user_id = $1',
      [userId]
    );
    const total = parseInt(countResult.rows[0].count);

    const result = await db.query(
      `SELECT ph.*, v.title, v.cover_image, v.duration as video_duration
       FROM play_history ph
       LEFT JOIN videos v ON ph.video_id = v.video_id
       WHERE ph.user_id = $1
       ORDER BY ph.last_played_at DESC
       LIMIT $2 OFFSET $3`,
      [userId, pageSize, offset]
    );

    return {
      history: result.rows,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  async getPlayProgress(userId: string, videoId: string): Promise<PlayHistory | null> {
    const result = await db.query(
      'SELECT * FROM play_history WHERE user_id = $1 AND video_id = $2',
      [userId, videoId]
    );

    return result.rows.length > 0 ? result.rows[0] : null;
  }

  async clearHistory(userId: string, videoId?: string): Promise<void> {
    if (videoId) {
      await db.query(
        'DELETE FROM play_history WHERE user_id = $1 AND video_id = $2',
        [userId, videoId]
      );
      logger.info('Play history cleared for video', { user_id: userId, video_id: videoId });
    } else {
      await db.query(
        'DELETE FROM play_history WHERE user_id = $1',
        [userId]
      );
      logger.info('All play history cleared', { user_id: userId });
    }
  }

  async getContinueWatching(userId: string, limit: number = 10) {
    const result = await db.query(
      `SELECT ph.*, v.title, v.cover_image, v.duration as video_duration
       FROM play_history ph
       LEFT JOIN videos v ON ph.video_id = v.video_id
       WHERE ph.user_id = $1 AND ph.completed = false AND ph.progress > 0
       ORDER BY ph.last_played_at DESC
       LIMIT $2`,
      [userId, limit]
    );

    return result.rows;
  }

  async getWatchedVideos(userId: string, limit: number = 20) {
    const result = await db.query(
      `SELECT ph.*, v.title, v.cover_image, v.duration as video_duration
       FROM play_history ph
       LEFT JOIN videos v ON ph.video_id = v.video_id
       WHERE ph.user_id = $1 AND ph.completed = true
       ORDER BY ph.last_played_at DESC
       LIMIT $2`,
      [userId, limit]
    );

    return result.rows;
  }
}

export const playHistoryService = new PlayHistoryService();
