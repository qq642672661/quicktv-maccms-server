import { getSQLiteDB } from '../database/sqlite';
import logger from '../utils/logger';

class LiveService {
  async getChannelList(category?: string, page: number = 1, limit: number = 20) {
    const db = await getSQLiteDB();
    const offset = (page - 1) * limit;

    let query = 'SELECT * FROM live_channels WHERE status = ?';
    const params: any[] = ['active'];

    if (category) {
      query += ' AND category = ?';
      params.push(category);
    }

    query += ' ORDER BY sort_order ASC, created_at DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const channels = await db.all(query, params);

    let countQuery = 'SELECT COUNT(*) as count FROM live_channels WHERE status = ?';
    const countParams: any[] = ['active'];
    if (category) {
      countQuery += ' AND category = ?';
      countParams.push(category);
    }

    const countResult = await db.get(countQuery, countParams);
    const total = countResult?.count || 0;

    logger.info(`📺 [直播] 获取频道列表 - 分类: ${category || '全部'}, 页码: ${page}, 返回: ${channels.length}/${total}`);

    return {
      total,
      channels,
      page,
      limit
    };
  }

  async getChannelDetail(channelId: string) {
    const db = await getSQLiteDB();
    const channel = await db.get('SELECT * FROM live_channels WHERE id = ?', [channelId]);

    if (channel) {
      logger.info(`📺 [直播] 获取频道详情 - ID: ${channelId}, 名称: ${channel.name}`);
    }

    return channel;
  }

  async recordView(channelId: string, deviceId: string) {
    const db = await getSQLiteDB();

    await db.run(
      'UPDATE live_view_stats SET viewer_count = viewer_count + 1, total_views = total_views + 1, last_view_time = CURRENT_TIMESTAMP WHERE channel_id = ?',
      [channelId]
    );

    await db.run(
      'INSERT INTO play_history (device_id, content_type, content_id, last_play_time) VALUES (?, ?, ?, CURRENT_TIMESTAMP)',
      [deviceId, 'live', channelId]
    );

    logger.info(`📺 [直播] 记录观看 - 频道ID: ${channelId}, 设备: ${deviceId}`);

    return { success: true };
  }

  async getCategories() {
    const db = await getSQLiteDB();
    const result = await db.all(
      'SELECT category, COUNT(*) as count FROM live_channels WHERE status = ? GROUP BY category ORDER BY category',
      ['active']
    );

    return result;
  }
}

export default new LiveService();
