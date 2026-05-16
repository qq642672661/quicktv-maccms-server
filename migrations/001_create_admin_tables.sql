-- QuickTV 后台管理系统数据库表结构
-- PostgreSQL版本

-- 1. 标签页表（Tab）
CREATE TABLE IF NOT EXISTS tabs (
  id SERIAL PRIMARY KEY,
  menu_code VARCHAR(50) NOT NULL UNIQUE,
  menu_name VARCHAR(100) NOT NULL,
  menu_type INTEGER DEFAULT 0,
  default_home INTEGER DEFAULT 0,
  image TEXT,
  focus_image TEXT,
  select_image TEXT,
  image_width INTEGER,
  image_height INTEGER,
  corner_image TEXT,
  focus_corner_image TEXT,
  background_image TEXT,
  text_icon TEXT,
  redirect_type VARCHAR(50),
  action TEXT,
  inner_args TEXT,
  sort_order INTEGER DEFAULT 0,
  status INTEGER DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. 标签页内容表
CREATE TABLE IF NOT EXISTS tab_contents (
  id SERIAL PRIMARY KEY,
  tab_id INTEGER NOT NULL REFERENCES tabs(id) ON DELETE CASCADE,
  first_plate_margin_top INTEGER DEFAULT 0,
  disable_scroll_on_first_screen INTEGER DEFAULT 0,
  status INTEGER DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. 板块表（Section）
CREATE TABLE IF NOT EXISTS sections (
  id SERIAL PRIMARY KEY,
  tab_content_id INTEGER NOT NULL REFERENCES tab_contents(id) ON DELETE CASCADE,
  plate_name VARCHAR(200) NOT NULL,
  show_plate_name INTEGER DEFAULT 1,
  plate_type INTEGER DEFAULT 1,
  height INTEGER NOT NULL,
  is_switch_cell_bg INTEGER DEFAULT 0,
  time_axis_switch INTEGER DEFAULT 0,
  is_focus_scroll_target INTEGER DEFAULT 0,
  sort_order INTEGER DEFAULT 0,
  status INTEGER DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. 板块内容项表（SectionItem）
CREATE TABLE IF NOT EXISTS section_items (
  id SERIAL PRIMARY KEY,
  section_id INTEGER NOT NULL REFERENCES sections(id) ON DELETE CASCADE,
  pos_x INTEGER NOT NULL,
  pos_y INTEGER NOT NULL,
  width INTEGER NOT NULL,
  height INTEGER NOT NULL,
  cell_type INTEGER NOT NULL,
  is_bg_player INTEGER DEFAULT 0,
  poster TEXT,
  poster_title VARCHAR(500),
  poster_title_style VARCHAR(50),
  poster_subtitle VARCHAR(500),
  float_title VARCHAR(200),
  corner_style VARCHAR(50),
  corner_position VARCHAR(50),
  corner_content VARCHAR(200),
  corner_color VARCHAR(50),
  corner_gradient VARCHAR(200),
  corner_image TEXT,
  focus_image TEXT,
  non_focus_image TEXT,
  play_logo_switch INTEGER DEFAULT 0,
  redirect_type VARCHAR(50),
  action TEXT,
  inner_args TEXT,
  content_data VARCHAR(100),
  content_second_id VARCHAR(100),
  content_third_id VARCHAR(100),
  sort_order INTEGER DEFAULT 0,
  status INTEGER DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. 播放项表（用于轮播）
CREATE TABLE IF NOT EXISTS play_items (
  id SERIAL PRIMARY KEY,
  section_item_id INTEGER NOT NULL REFERENCES section_items(id) ON DELETE CASCADE,
  title VARCHAR(500) NOT NULL,
  cover TEXT NOT NULL,
  url TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0,
  status INTEGER DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. 媒体库表（点播内容）
CREATE TABLE IF NOT EXISTS media_library (
  id SERIAL PRIMARY KEY,
  media_id VARCHAR(100) UNIQUE NOT NULL,
  title VARCHAR(500) NOT NULL,
  subtitle VARCHAR(500),
  cover TEXT,
  video_url TEXT,
  duration INTEGER,
  category VARCHAR(100),
  tags JSONB,
  description TEXT,
  view_count INTEGER DEFAULT 0,
  status INTEGER DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_tabs_menu_code ON tabs(menu_code);
CREATE INDEX IF NOT EXISTS idx_tabs_status ON tabs(status);
CREATE INDEX IF NOT EXISTS idx_tab_contents_tab_id ON tab_contents(tab_id);
CREATE INDEX IF NOT EXISTS idx_sections_tab_content_id ON sections(tab_content_id);
CREATE INDEX IF NOT EXISTS idx_sections_status ON sections(status);
CREATE INDEX IF NOT EXISTS idx_section_items_section_id ON section_items(section_id);
CREATE INDEX IF NOT EXISTS idx_section_items_status ON section_items(status);
CREATE INDEX IF NOT EXISTS idx_play_items_section_item_id ON play_items(section_item_id);
CREATE INDEX IF NOT EXISTS idx_media_library_media_id ON media_library(media_id);
CREATE INDEX IF NOT EXISTS idx_media_library_category ON media_library(category);
CREATE INDEX IF NOT EXISTS idx_media_library_status ON media_library(status);

-- 创建更新时间触发器函数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ language 'plpgsql';

-- 为所有表添加更新时间触发器
CREATE TRIGGER update_tabs_updated_at BEFORE UPDATE ON tabs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tab_contents_updated_at BEFORE UPDATE ON tab_contents
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sections_updated_at BEFORE UPDATE ON sections
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_section_items_updated_at BEFORE UPDATE ON section_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_play_items_updated_at BEFORE UPDATE ON play_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_media_library_updated_at BEFORE UPDATE ON media_library
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 插入示例数据
INSERT INTO tabs (menu_code, menu_name, menu_type, default_home, sort_order) VALUES
  ('0', '推荐', 0, 1, 0),
  ('live', '直播', 0, 0, 1)
ON CONFLICT (menu_code) DO NOTHING;

-- 插入示例媒体数据
INSERT INTO media_library (media_id, title, subtitle, cover, video_url, duration, category, tags, description) VALUES
  ('media_001', '示例视频1', '这是一个示例视频', 'https://picsum.photos/640/360', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4', 596, '电影', '["动画", "短片"]'::jsonb, '大雄兔示例视频'),
  ('media_002', '示例视频2', '另一个示例视频', 'https://picsum.photos/640/360', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4', 653, '电影', '["动画", "科幻"]'::jsonb, '大象之梦示例视频')
ON CONFLICT (media_id) DO NOTHING;
