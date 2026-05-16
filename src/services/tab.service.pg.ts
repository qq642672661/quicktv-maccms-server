import database from '../database';
import logger from '../utils/logger';
import redisCache from '../cache/redis';

export interface Tab {
  id?: number;
  menu_code: string;
  menu_name: string;
  menu_type?: number;
  default_home?: number;
  image?: string;
  focus_image?: string;
  select_image?: string;
  image_width?: number;
  image_height?: number;
  corner_image?: string;
  focus_corner_image?: string;
  background_image?: string;
  text_icon?: string;
  redirect_type?: string;
  action?: string;
  inner_args?: string;
  sort_order?: number;
  status?: number;
}

const CACHE_TTL = 3600;
const CACHE_KEY_PREFIX = 'tab:';

export class TabService {
  static async getAllTabs(): Promise<Tab[]> {
    try {
      const cacheKey = `${CACHE_KEY_PREFIX}all`;
      const cached = await redisCache.get<Tab[]>(cacheKey);

      if (cached) {
        return cached;
      }

      const result = await database.query(`
        SELECT * FROM tabs
        WHERE status = 1
        ORDER BY sort_order ASC, id ASC
      `);

      const tabs = result.rows;
      await redisCache.set(cacheKey, tabs, CACHE_TTL);

      return tabs;
    } catch (error) {
      logger.error('获取Tab列表失败:', error);
      throw error;
    }
  }

  static async getTabById(id: number): Promise<Tab | null> {
    try {
      const cacheKey = `${CACHE_KEY_PREFIX}${id}`;
      const cached = await redisCache.get<Tab>(cacheKey);

      if (cached) {
        return cached;
      }

      const result = await database.query(
        'SELECT * FROM tabs WHERE id = $1 AND status = 1',
        [id]
      );

      const tab = result.rows[0] || null;
      if (tab) {
        await redisCache.set(cacheKey, tab, CACHE_TTL);
      }

      return tab;
    } catch (error) {
      logger.error(`获取Tab失败 (id: ${id}):`, error);
      throw error;
    }
  }

  static async getTabByMenuCode(menuCode: string): Promise<Tab | null> {
    try {
      const cacheKey = `${CACHE_KEY_PREFIX}code:${menuCode}`;
      const cached = await redisCache.get<Tab>(cacheKey);

      if (cached) {
        return cached;
      }

      const result = await database.query(
        'SELECT * FROM tabs WHERE menu_code = $1 AND status = 1',
        [menuCode]
      );

      const tab = result.rows[0] || null;
      if (tab) {
        await redisCache.set(cacheKey, tab, CACHE_TTL);
      }

      return tab;
    } catch (error) {
      logger.error(`获取Tab失败 (menuCode: ${menuCode}):`, error);
      throw error;
    }
  }

  static async createTab(tab: Tab): Promise<number> {
    try {
      const result = await database.query(`
        INSERT INTO tabs (
          menu_code, menu_name, menu_type, default_home, image, focus_image,
          select_image, image_width, image_height, corner_image, focus_corner_image,
          background_image, text_icon, redirect_type, action, inner_args, sort_order, status
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
        RETURNING id
      `, [
        tab.menu_code,
        tab.menu_name,
        tab.menu_type || 0,
        tab.default_home || 0,
        tab.image || null,
        tab.focus_image || null,
        tab.select_image || null,
        tab.image_width || null,
        tab.image_height || null,
        tab.corner_image || null,
        tab.focus_corner_image || null,
        tab.background_image || null,
        tab.text_icon || null,
        tab.redirect_type || null,
        tab.action || null,
        tab.inner_args || null,
        tab.sort_order || 0,
        tab.status || 1
      ]);

      const id = result.rows[0].id;
      await this.clearCache();

      logger.info(`Tab创建成功 (id: ${id})`);
      return id;
    } catch (error) {
      logger.error('创建Tab失败:', error);
      throw error;
    }
  }

  static async updateTab(id: number, tab: Partial<Tab>): Promise<boolean> {
    try {
      const fields: string[] = [];
      const values: any[] = [];
      let paramIndex = 1;

      Object.entries(tab).forEach(([key, value]) => {
        if (key !== 'id' && value !== undefined) {
          fields.push(`${key} = $${paramIndex}`);
          values.push(value);
          paramIndex++;
        }
      });

      if (fields.length === 0) {
        return false;
      }

      values.push(id);
      const result = await database.query(`
        UPDATE tabs SET ${fields.join(', ')} WHERE id = $${paramIndex}
      `, values);

      if (result.rowCount > 0) {
        await this.clearCache();
        logger.info(`Tab更新成功 (id: ${id})`);
        return true;
      }

      return false;
    } catch (error) {
      logger.error(`更新Tab失败 (id: ${id}):`, error);
      throw error;
    }
  }

  static async deleteTab(id: number): Promise<boolean> {
    try {
      const result = await database.query(
        'UPDATE tabs SET status = 0 WHERE id = $1',
        [id]
      );

      if (result.rowCount > 0) {
        await this.clearCache();
        logger.info(`Tab删除成功 (id: ${id})`);
        return true;
      }

      return false;
    } catch (error) {
      logger.error(`删除Tab失败 (id: ${id}):`, error);
      throw error;
    }
  }

  private static async clearCache(): Promise<void> {
    try {
      await redisCache.delPattern(`${CACHE_KEY_PREFIX}*`);
    } catch (error) {
      logger.error('清除Tab缓存失败:', error);
    }
  }
}
