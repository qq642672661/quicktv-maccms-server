import db from '../database/schema';
import logger from '../utils/logger';

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

export class TabService {
  static getAllTabs(): Tab[] {
    try {
      const stmt = db.prepare(`
        SELECT * FROM tabs 
        WHERE status = 1 
        ORDER BY sort_order ASC, id ASC
      `);
      return stmt.all() as Tab[];
    } catch (error) {
      logger.error('获取Tab列表失败:', error);
      throw error;
    }
  }

  static getTabById(id: number): Tab | undefined {
    try {
      const stmt = db.prepare('SELECT * FROM tabs WHERE id = ? AND status = 1');
      return stmt.get(id) as Tab | undefined;
    } catch (error) {
      logger.error(`获取Tab失败 (id: ${id}):`, error);
      throw error;
    }
  }

  static getTabByMenuCode(menuCode: string): Tab | undefined {
    try {
      const stmt = db.prepare('SELECT * FROM tabs WHERE menu_code = ? AND status = 1');
      return stmt.get(menuCode) as Tab | undefined;
    } catch (error) {
      logger.error(`获取Tab失败 (menuCode: ${menuCode}):`, error);
      throw error;
    }
  }

  static createTab(tab: Tab): number {
    try {
      const stmt = db.prepare(`
        INSERT INTO tabs (
          menu_code, menu_name, menu_type, default_home, image, focus_image,
          select_image, image_width, image_height, corner_image, focus_corner_image,
          background_image, text_icon, redirect_type, action, inner_args, sort_order, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      
      const result = stmt.run(
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
      );
      
      logger.info(`Tab创建成功 (id: ${result.lastInsertRowid})`);
      return result.lastInsertRowid as number;
    } catch (error) {
      logger.error('创建Tab失败:', error);
      throw error;
    }
  }

  static updateTab(id: number, tab: Partial<Tab>): boolean {
    try {
      const fields: string[] = [];
      const values: any[] = [];

      Object.entries(tab).forEach(([key, value]) => {
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
        UPDATE tabs SET ${fields.join(', ')} WHERE id = ?
      `);
      
      const result = stmt.run(...values);
      logger.info(`Tab更新成功 (id: ${id})`);
      return result.changes > 0;
    } catch (error) {
      logger.error(`更新Tab失败 (id: ${id}):`, error);
      throw error;
    }
  }

  static deleteTab(id: number): boolean {
    try {
      const stmt = db.prepare('UPDATE tabs SET status = 0 WHERE id = ?');
      const result = stmt.run(id);
      logger.info(`Tab删除成功 (id: ${id})`);
      return result.changes > 0;
    } catch (error) {
      logger.error(`删除Tab失败 (id: ${id}):`, error);
      throw error;
    }
  }
}
