import Database from 'better-sqlite3';
import path from 'path';
import logger from '../utils/logger';
import {
  TabMenu,
  HomePlate,
  PlateDetail,
  MediaContent,
  ShortVideo,
  LiveChannel,
  TabContentResponse,
  SearchCenterResponse,
  SearchResultResponse,
  PaginationParams
} from '../types/hellotv.types';

const dbPath = process.env.SQLITE_PATH || path.join(process.cwd(), 'data', 'quicktv.db');
const db = new Database(dbPath);

db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

class HelloTVService {
  async getTabList(): Promise<TabMenu[]> {
    try {
      const stmt = db.prepare(`
        SELECT * FROM tab_menu
        WHERE status = 'active'
        ORDER BY sort_order ASC, id ASC
      `);

      const tabs = stmt.all() as TabMenu[];
      logger.info(`✅ 获取Tab列表成功: ${tabs.length}个`);
      return tabs;
    } catch (error) {
      logger.error('❌ 获取Tab列表失败:', error);
      throw error;
    }
  }

  async getTabContent(tabId: string): Promise<TabContentResponse> {
    try {
      const platesStmt = db.prepare(`
        SELECT * FROM home_plate
        WHERE tab_id = ? AND status = 'active'
        ORDER BY sort_order ASC, id ASC
      `);

      const plates = platesStmt.all(tabId) as HomePlate[];

      const platesWithDetails = plates.map(plate => {
        const detailsStmt = db.prepare(`
          SELECT * FROM plate_detail
          WHERE plate_id = ? AND status = 'active'
          ORDER BY sort_order ASC, id ASC
        `);

        const plateDetails = detailsStmt.all(plate.id) as PlateDetail[];

        return {
          ...plate,
          plateDetails
        };
      });

      logger.info(`✅ 获取Tab内容成功: tabId=${tabId}, ${plates.length}个板块`);

      return {
        id: tabId,
        image: '',
        plates: platesWithDetails
      };
    } catch (error) {
      logger.error(`❌ 获取Tab内容失败: tabId=${tabId}`, error);
      throw error;
    }
  }

  async getMediaDetail(mediaId: string): Promise<MediaContent | null> {
    try {
      const stmt = db.prepare(`
        SELECT * FROM media_content
        WHERE id = ? AND status = 'active'
      `);

      const media = stmt.get(mediaId) as MediaContent | undefined;

      if (media) {
        logger.info(`✅ 获取媒体详情成功: mediaId=${mediaId}`);
      } else {
        logger.warn(`⚠️  媒体不存在: mediaId=${mediaId}`);
      }

      return media || null;
    } catch (error) {
      logger.error(`❌ 获取媒体详情失败: mediaId=${mediaId}`, error);
      throw error;
    }
  }

  async getMediaList(params: PaginationParams & { category?: string }): Promise<SearchResultResponse> {
    try {
      const { page = 1, pageSize = 20, category } = params;
      const offset = (page - 1) * pageSize;

      let whereClause = "WHERE status = 'active'";
      const queryParams: any[] = [];

      if (category) {
        whereClause += ' AND category = ?';
        queryParams.push(category);
      }

      const countStmt = db.prepare(`SELECT COUNT(*) as total FROM media_content ${whereClause}`);
      const { total } = countStmt.get(...queryParams) as { total: number };

      const stmt = db.prepare(`
        SELECT * FROM media_content
        ${whereClause}
        ORDER BY created_at DESC
        LIMIT ? OFFSET ?
      `);

      const items = stmt.all(...queryParams, pageSize, offset) as MediaContent[];

      logger.info(`✅ 获取媒体列表成功: ${items.length}/${total}个`);

      return {
        total,
        page,
        pageSize,
        items
      };
    } catch (error) {
      logger.error('❌ 获取媒体列表失败:', error);
      throw error;
    }
  }

  async getSearchCenter(userId?: string): Promise<SearchCenterResponse> {
    try {
      const keywordStmt = db.prepare(`
        SELECT keyword FROM search_keyword
        WHERE status = 'active' AND is_hot = 1
        ORDER BY sort_order ASC, search_count DESC
        LIMIT 20
      `);

      const keywords = keywordStmt.all() as { keyword: string }[];
      const keywordList = keywords.map(k => k.keyword);

      let historyList: string[] = [];
      if (userId) {
        const historyStmt = db.prepare(`
          SELECT DISTINCT keyword FROM user_search_history
          WHERE user_id = ?
          ORDER BY search_time DESC
          LIMIT 10
        `);

        const history = historyStmt.all(userId) as { keyword: string }[];
        historyList = history.map(h => h.keyword);
      }

      logger.info(`✅ 获取搜索中心成功: ${keywordList.length}个热词, ${historyList.length}条历史`);

      return {
        historyList,
        keywordList
      };
    } catch (error) {
      logger.error('❌ 获取搜索中心失败:', error);
      throw error;
    }
  }

  async searchContent(keyword: string, params: PaginationParams): Promise<SearchResultResponse> {
    try {
      const { page = 1, pageSize = 20 } = params;
      const offset = (page - 1) * pageSize;

      const searchPattern = `%${keyword}%`;

      const countStmt = db.prepare(`
        SELECT COUNT(*) as total FROM media_content
        WHERE status = 'active' AND (title LIKE ? OR description LIKE ? OR tags LIKE ?)
      `);
      const { total } = countStmt.get(searchPattern, searchPattern, searchPattern) as { total: number };

      const stmt = db.prepare(`
        SELECT * FROM media_content
        WHERE status = 'active' AND (title LIKE ? OR description LIKE ? OR tags LIKE ?)
        ORDER BY view_count DESC, created_at DESC
        LIMIT ? OFFSET ?
      `);

      const items = stmt.all(searchPattern, searchPattern, searchPattern, pageSize, offset) as MediaContent[];

      const updateStmt = db.prepare(`
        UPDATE search_keyword
        SET search_count = search_count + 1
        WHERE keyword = ?
      `);
      updateStmt.run(keyword);

      logger.info(`✅ 搜索内容成功: keyword="${keyword}", ${items.length}/${total}个结果`);

      return {
        total,
        page,
        pageSize,
        items
      };
    } catch (error) {
      logger.error(`❌ 搜索内容失败: keyword="${keyword}"`, error);
      throw error;
    }
  }

  async addSearchHistory(userId: string, keyword: string): Promise<void> {
    try {
      const stmt = db.prepare(`
        INSERT INTO user_search_history (user_id, keyword, search_time)
        VALUES (?, ?, ?)
      `);

      stmt.run(userId, keyword, Date.now());
      logger.info(`✅ 添加搜索历史成功: userId=${userId}, keyword="${keyword}"`);
    } catch (error) {
      logger.error(`❌ 添加搜索历史失败: userId=${userId}, keyword="${keyword}"`, error);
      throw error;
    }
  }

  async getShortVideoList(params: PaginationParams): Promise<{ total: number; items: ShortVideo[] }> {
    try {
      const { page = 1, pageSize = 20 } = params;
      const offset = (page - 1) * pageSize;

      const countStmt = db.prepare(`SELECT COUNT(*) as total FROM short_video WHERE status = 'active'`);
      const { total } = countStmt.get() as { total: number };

      const stmt = db.prepare(`
        SELECT * FROM short_video
        WHERE status = 'active'
        ORDER BY created_at DESC
        LIMIT ? OFFSET ?
      `);

      const items = stmt.all(pageSize, offset) as ShortVideo[];

      logger.info(`✅ 获取短视频列表成功: ${items.length}/${total}个`);

      return { total, items };
    } catch (error) {
      logger.error('❌ 获取短视频列表失败:', error);
      throw error;
    }
  }

  async getLiveChannels(params: PaginationParams & { groupId?: number }): Promise<{ total: number; items: LiveChannel[] }> {
    try {
      const { page = 1, pageSize = 50, groupId } = params;
      const offset = (page - 1) * pageSize;

      let whereClause = "WHERE status = 'online'";
      const queryParams: any[] = [];

      if (groupId) {
        whereClause += ' AND group_id = ?';
        queryParams.push(groupId);
      }

      const countStmt = db.prepare(`SELECT COUNT(*) as total FROM live_channel ${whereClause}`);
      const { total } = countStmt.get(...queryParams) as { total: number };

      const stmt = db.prepare(`
        SELECT * FROM live_channel
        ${whereClause}
        ORDER BY sort_order ASC, id ASC
        LIMIT ? OFFSET ?
      `);

      const items = stmt.all(...queryParams, pageSize, offset) as LiveChannel[];

      logger.info(`✅ 获取直播频道成功: ${items.length}/${total}个`);

      return { total, items };
    } catch (error) {
      logger.error('❌ 获取直播频道失败:', error);
      throw error;
    }
  }

  async getLiveChannelGroups(): Promise<any[]> {
    try {
      const stmt = db.prepare(`
        SELECT * FROM live_channel_group
        WHERE status = 'active'
        ORDER BY sort_order ASC, id ASC
      `);

      const groups = stmt.all();
      logger.info(`✅ 获取直播分组成功: ${groups.length}个`);
      return groups;
    } catch (error) {
      logger.error('❌ 获取直播分组失败:', error);
      throw error;
    }
  }

  async recordView(contentId: string, contentType: 'media' | 'short_video'): Promise<void> {
    try {
      const table = contentType === 'media' ? 'media_content' : 'short_video';
      const stmt = db.prepare(`
        UPDATE ${table}
        SET view_count = view_count + 1
        WHERE id = ?
      `);

      stmt.run(contentId);
      logger.info(`✅ 记录观看成功: ${contentType}=${contentId}`);
    } catch (error) {
      logger.error(`❌ 记录观看失败: ${contentType}=${contentId}`, error);
      throw error;
    }
  }
}

export default new HelloTVService();
