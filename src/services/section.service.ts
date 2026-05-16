import db from '../database/schema';
import logger from '../utils/logger';

export interface Section {
  id?: number;
  tab_content_id: number;
  plate_name: string;
  show_plate_name?: number;
  plate_type?: number;
  height: number;
  is_switch_cell_bg?: number;
  time_axis_switch?: number;
  is_focus_scroll_target?: number;
  sort_order?: number;
  status?: number;
}

export interface SectionItem {
  id?: number;
  section_id: number;
  pos_x: number;
  pos_y: number;
  width: number;
  height: number;
  cell_type: number;
  is_bg_player?: number;
  poster?: string;
  poster_title?: string;
  poster_title_style?: string;
  poster_subtitle?: string;
  float_title?: string;
  corner_style?: string;
  corner_position?: string;
  corner_content?: string;
  corner_color?: string;
  corner_gradient?: string;
  corner_image?: string;
  focus_image?: string;
  non_focus_image?: string;
  play_logo_switch?: number;
  redirect_type?: string;
  action?: string;
  inner_args?: string;
  content_data?: string;
  content_second_id?: string;
  content_third_id?: string;
  sort_order?: number;
  status?: number;
}

export class SectionService {
  static getSectionsByTabContentId(tabContentId: number): Section[] {
    try {
      const stmt = db.prepare(`
        SELECT * FROM sections 
        WHERE tab_content_id = ? AND status = 1 
        ORDER BY sort_order ASC, id ASC
      `);
      return stmt.all(tabContentId) as Section[];
    } catch (error) {
      logger.error(`获取Section列表失败 (tabContentId: ${tabContentId}):`, error);
      throw error;
    }
  }

  static getSectionById(id: number): Section | undefined {
    try {
      const stmt = db.prepare('SELECT * FROM sections WHERE id = ? AND status = 1');
      return stmt.get(id) as Section | undefined;
    } catch (error) {
      logger.error(`获取Section失败 (id: ${id}):`, error);
      throw error;
    }
  }

  static createSection(section: Section): number {
    try {
      const stmt = db.prepare(`
        INSERT INTO sections (
          tab_content_id, plate_name, show_plate_name, plate_type, height,
          is_switch_cell_bg, time_axis_switch, is_focus_scroll_target, sort_order, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      
      const result = stmt.run(
        section.tab_content_id,
        section.plate_name,
        section.show_plate_name || 1,
        section.plate_type || 1,
        section.height,
        section.is_switch_cell_bg || 0,
        section.time_axis_switch || 0,
        section.is_focus_scroll_target || 0,
        section.sort_order || 0,
        section.status || 1
      );
      
      logger.info(`Section创建成功 (id: ${result.lastInsertRowid})`);
      return result.lastInsertRowid as number;
    } catch (error) {
      logger.error('创建Section失败:', error);
      throw error;
    }
  }

  static updateSection(id: number, section: Partial<Section>): boolean {
    try {
      const fields: string[] = [];
      const values: any[] = [];

      Object.entries(section).forEach(([key, value]) => {
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
        UPDATE sections SET ${fields.join(', ')} WHERE id = ?
      `);
      
      const result = stmt.run(...values);
      logger.info(`Section更新成功 (id: ${id})`);
      return result.changes > 0;
    } catch (error) {
      logger.error(`更新Section失败 (id: ${id}):`, error);
      throw error;
    }
  }

  static deleteSection(id: number): boolean {
    try {
      const stmt = db.prepare('UPDATE sections SET status = 0 WHERE id = ?');
      const result = stmt.run(id);
      logger.info(`Section删除成功 (id: ${id})`);
      return result.changes > 0;
    } catch (error) {
      logger.error(`删除Section失败 (id: ${id}):`, error);
      throw error;
    }
  }

  static getItemsBySectionId(sectionId: number): SectionItem[] {
    try {
      const stmt = db.prepare(`
        SELECT * FROM section_items 
        WHERE section_id = ? AND status = 1 
        ORDER BY sort_order ASC, id ASC
      `);
      return stmt.all(sectionId) as SectionItem[];
    } catch (error) {
      logger.error(`获取SectionItem列表失败 (sectionId: ${sectionId}):`, error);
      throw error;
    }
  }

  static createSectionItem(item: SectionItem): number {
    try {
      const stmt = db.prepare(`
        INSERT INTO section_items (
          section_id, pos_x, pos_y, width, height, cell_type, is_bg_player,
          poster, poster_title, poster_title_style, poster_subtitle, float_title,
          corner_style, corner_position, corner_content, corner_color, corner_gradient,
          corner_image, focus_image, non_focus_image, play_logo_switch,
          redirect_type, action, inner_args, content_data, content_second_id,
          content_third_id, sort_order, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      
      const result = stmt.run(
        item.section_id,
        item.pos_x,
        item.pos_y,
        item.width,
        item.height,
        item.cell_type,
        item.is_bg_player || 0,
        item.poster || null,
        item.poster_title || null,
        item.poster_title_style || null,
        item.poster_subtitle || null,
        item.float_title || null,
        item.corner_style || null,
        item.corner_position || null,
        item.corner_content || null,
        item.corner_color || null,
        item.corner_gradient || null,
        item.corner_image || null,
        item.focus_image || null,
        item.non_focus_image || null,
        item.play_logo_switch || 0,
        item.redirect_type || null,
        item.action || null,
        item.inner_args || null,
        item.content_data || null,
        item.content_second_id || null,
        item.content_third_id || null,
        item.sort_order || 0,
        item.status || 1
      );
      
      logger.info(`SectionItem创建成功 (id: ${result.lastInsertRowid})`);
      return result.lastInsertRowid as number;
    } catch (error) {
      logger.error('创建SectionItem失败:', error);
      throw error;
    }
  }
}
