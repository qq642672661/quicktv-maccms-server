import { getSQLiteDB } from '../database/sqlite';
import logger from '../utils/logger';

class VodService {
  async getContentList(category?: string, page: number = 1, limit: number = 20) {
    const db = await getSQLiteDB();
    const offset = (page - 1) * limit;

    let query = 'SELECT * FROM vod_content WHERE status = ?';
    const params: any[] = ['active'];

    if (category) {
      query += ' AND category = ?';
      params.push(category);
    }

    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const content = await db.all(query, params);

    let countQuery = 'SELECT COUNT(*) as count FROM vod_content WHERE status = ?';
    const countParams: any[] = ['active'];
    if (category) {
      countQuery += ' AND category = ?';
      countParams.push(category);
    }

    const countResult = await db.get(countQuery, countParams);
    const total = countResult?.count || 0;

    logger.info(`🎬 [点播] 获取内容列表 - 分类: ${category || '全部'}, 页码: ${page}, 返回: ${content.length}/${total}`);

    return {
      total,
      content,
      page,
      limit
    };
  }

  async getContentDetail(contentId: string) {
    const db = await getSQLiteDB();
    const content = await db.get('SELECT * FROM vod_content WHERE id = ?', [contentId]);

    if (content) {
      logger.info(`🎬 [点播] 获取内容详情 - ID: ${contentId}, 标题: ${content.title}`);
    }

    return content;
  }

  async recordView(contentId: string, deviceId: string, playDuration: number = 0) {
    const db = await getSQLiteDB();

    await db.run(
      'UPDATE vod_content SET view_count = view_count + 1 WHERE id = ?',
      [contentId]
    );

    const existing = await db.get(
      'SELECT * FROM play_history WHERE device_id = ? AND content_type = ? AND content_id = ?',
      [deviceId, 'vod', contentId]
    );

    if (existing) {
      await db.run(
        'UPDATE play_history SET play_duration = ?, last_play_time = CURRENT_TIMESTAMP WHERE id = ?',
        [playDuration, existing.id]
      );
    } else {
      await db.run(
        'INSERT INTO play_history (device_id, content_type, content_id, play_duration, last_play_time) VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)',
        [deviceId, 'vod', contentId, playDuration]
      );
    }

    logger.info(`🎬 [点播] 记录观看 - 内容ID: ${contentId}, 设备: ${deviceId}, 时长: ${playDuration}s`);

    return { success: true };
  }

  async getCategories() {
    const db = await getSQLiteDB();
    const result = await db.all(
      'SELECT category, COUNT(*) as count FROM vod_content WHERE status = ? GROUP BY category ORDER BY category',
      ['active']
    );

    return result;
  }
}

export default new VodService();
