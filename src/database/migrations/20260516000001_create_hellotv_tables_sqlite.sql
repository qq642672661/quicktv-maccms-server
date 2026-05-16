-- SQLite版本的HelloTV表创建脚本
-- 注意：SQLite不支持某些PostgreSQL特性，需要做适配

-- ============================================
-- 1. Tab菜单表
-- ============================================
CREATE TABLE IF NOT EXISTS tab_menu (
  id TEXT PRIMARY KEY,
  menu_code TEXT NOT NULL,
  menu_name TEXT NOT NULL,
  menu_type INTEGER DEFAULT 0,
  image_width TEXT,
  image_height TEXT,
  image TEXT,
  select_image TEXT,
  focus_image TEXT,
  focus_corner_image TEXT,
  corner_image TEXT,
  background_image TEXT,
  default_home TEXT DEFAULT '0',
  sort_order INTEGER DEFAULT 0,
  status TEXT DEFAULT 'active',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_tab_menu_code ON tab_menu(menu_code);
CREATE INDEX IF NOT EXISTS idx_tab_menu_sort ON tab_menu(sort_order);
CREATE INDEX IF NOT EXISTS idx_tab_menu_status ON tab_menu(status);

-- ============================================
-- 2. 首页板块表
-- ============================================
CREATE TABLE IF NOT EXISTS home_plate (
  id TEXT PRIMARY KEY,
  tab_id TEXT NOT NULL,
  plate_name TEXT,
  show_plate_name TEXT DEFAULT '0',
  plate_type TEXT DEFAULT '1',
  height INTEGER DEFAULT 0,
  is_switch_cell_bg TEXT DEFAULT '0',
  time_axis_switch TEXT DEFAULT '0',
  is_focus_scroll_target INTEGER DEFAULT 0,
  sort_order INTEGER DEFAULT 0,
  status TEXT DEFAULT 'active',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (tab_id) REFERENCES tab_menu(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_home_plate_tab ON home_plate(tab_id);
CREATE INDEX IF NOT EXISTS idx_home_plate_sort ON home_plate(sort_order);
CREATE INDEX IF NOT EXISTS idx_home_plate_status ON home_plate(status);

-- ============================================
-- 3. 板块详情表
-- ============================================
CREATE TABLE IF NOT EXISTS plate_detail (
  id TEXT PRIMARY KEY,
  plate_id TEXT NOT NULL,
  pos_x INTEGER DEFAULT 0,
  pos_y INTEGER DEFAULT 0,
  width INTEGER DEFAULT 0,
  height INTEGER DEFAULT 0,
  cell_type TEXT DEFAULT '0',
  poster TEXT,
  poster_title TEXT,
  poster_title_style TEXT,
  content_data TEXT,
  content_second_id TEXT,
  corner_color TEXT,
  corner_gradient TEXT,
  redirect_type INTEGER DEFAULT 0,
  action TEXT,
  inner_args TEXT,
  play_logo_switch TEXT DEFAULT '0',
  play_data TEXT,
  sort_order INTEGER DEFAULT 0,
  status TEXT DEFAULT 'active',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (plate_id) REFERENCES home_plate(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_plate_detail_plate ON plate_detail(plate_id);
CREATE INDEX IF NOT EXISTS idx_plate_detail_content ON plate_detail(content_data);
CREATE INDEX IF NOT EXISTS idx_plate_detail_sort ON plate_detail(sort_order);
CREATE INDEX IF NOT EXISTS idx_plate_detail_status ON plate_detail(status);

-- ============================================
-- 4. 媒体内容表
-- ============================================
CREATE TABLE IF NOT EXISTS media_content (
  id TEXT PRIMARY KEY,
  asset_title TEXT NOT NULL,
  asset_sub_title TEXT,
  asset_alias TEXT,
  asset_type TEXT,
  description TEXT,
  media_type INTEGER DEFAULT 1,
  cp_name TEXT,
  tags TEXT,
  category_name TEXT,
  category_sub_name TEXT,
  anchors TEXT,
  clip_type TEXT,
  year TEXT,
  cover_h TEXT,
  cover_v TEXT,
  directors TEXT,
  actors TEXT,
  region TEXT,
  language TEXT,
  pay_type TEXT DEFAULT '1',
  fee_type INTEGER DEFAULT 1,
  total_episodes_num TEXT,
  update_episodes_num TEXT,
  drm TEXT DEFAULT '0',
  series_type TEXT DEFAULT '1',
  finish_status TEXT DEFAULT '0',
  douban_score REAL,
  description1 TEXT,
  description2 TEXT,
  description3 TEXT,
  description4 TEXT,
  description5 TEXT,
  status TEXT DEFAULT '1',
  online_status TEXT DEFAULT '1',
  licence_num TEXT,
  cache_tags TEXT,
  start_index INTEGER DEFAULT 1,
  episode_count INTEGER DEFAULT 0,
  play_count INTEGER DEFAULT 0,
  is_hot_search INTEGER DEFAULT 0,
  episode_sort_type INTEGER DEFAULT 0,
  start_index_type INTEGER DEFAULT 0,
  episode_tab_style INTEGER,
  corner_content TEXT,
  corner_color TEXT,
  corner_gradient TEXT,
  is_cms_relate INTEGER DEFAULT 0,
  newtv_status TEXT,
  tag_list TEXT,
  composite_score REAL,
  package_name_list TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_media_content_title ON media_content(asset_title);
CREATE INDEX IF NOT EXISTS idx_media_content_category ON media_content(category_name);
CREATE INDEX IF NOT EXISTS idx_media_content_status ON media_content(status, online_status);
CREATE INDEX IF NOT EXISTS idx_media_content_play_count ON media_content(play_count DESC);
CREATE INDEX IF NOT EXISTS idx_media_content_score ON media_content(douban_score DESC);
CREATE INDEX IF NOT EXISTS idx_media_content_year ON media_content(year);

-- ============================================
-- 5. 媒体数据项表
-- ============================================
CREATE TABLE IF NOT EXISTS media_data_item (
  id TEXT PRIMARY KEY,
  meta_id TEXT NOT NULL,
  source_id TEXT,
  platform_id TEXT,
  platform_name TEXT,
  platform_code TEXT,
  pay_type TEXT,
  fee_type INTEGER,
  episodes TEXT,
  media_type INTEGER,
  redirection TEXT,
  background_colour TEXT,
  start_background_color TEXT,
  end_background_color TEXT,
  show_episode_tab INTEGER DEFAULT 1,
  episode_tab_style INTEGER DEFAULT 0,
  episode_tab_name TEXT,
  cp_name TEXT,
  category_name TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (meta_id) REFERENCES media_content(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_media_data_item_meta ON media_data_item(meta_id);
CREATE INDEX IF NOT EXISTS idx_media_data_item_platform ON media_data_item(platform_code);

-- ============================================
-- 6. 短视频表
-- ============================================
CREATE TABLE IF NOT EXISTS short_video (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  poster TEXT,
  url TEXT NOT NULL,
  corner TEXT,
  redirect_type INTEGER DEFAULT 0,
  action TEXT,
  inner_args TEXT,
  tag TEXT,
  score TEXT,
  sort TEXT,
  description TEXT,
  play_count INTEGER DEFAULT 0,
  like_count INTEGER DEFAULT 0,
  comment_count INTEGER DEFAULT 0,
  share_count INTEGER DEFAULT 0,
  status TEXT DEFAULT 'active',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_short_video_title ON short_video(title);
CREATE INDEX IF NOT EXISTS idx_short_video_play_count ON short_video(play_count DESC);
CREATE INDEX IF NOT EXISTS idx_short_video_status ON short_video(status);
CREATE INDEX IF NOT EXISTS idx_short_video_created ON short_video(created_at DESC);

-- ============================================
-- 7. 搜索关键词表
-- ============================================
CREATE TABLE IF NOT EXISTS search_keyword (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  keyword TEXT NOT NULL UNIQUE,
  search_count INTEGER DEFAULT 0,
  is_hot INTEGER DEFAULT 0,
  sort_order INTEGER DEFAULT 0,
  status TEXT DEFAULT 'active',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_search_keyword_hot ON search_keyword(is_hot, search_count DESC);
CREATE INDEX IF NOT EXISTS idx_search_keyword_sort ON search_keyword(sort_order);
CREATE INDEX IF NOT EXISTS idx_search_keyword_status ON search_keyword(status);

-- ============================================
-- 8. 用户搜索历史表
-- ============================================
CREATE TABLE IF NOT EXISTS user_search_history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT,
  device_id TEXT,
  keyword TEXT NOT NULL,
  search_time INTEGER NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_user_search_history_user ON user_search_history(user_id, search_time DESC);
CREATE INDEX IF NOT EXISTS idx_user_search_history_device ON user_search_history(device_id, search_time DESC);
CREATE INDEX IF NOT EXISTS idx_user_search_history_keyword ON user_search_history(keyword);

-- ============================================
-- 9. 直播频道分组表
-- ============================================
CREATE TABLE IF NOT EXISTS live_channel_group (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  group_name TEXT NOT NULL UNIQUE,
  sort_order INTEGER DEFAULT 0,
  status TEXT DEFAULT 'active',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_live_channel_group_sort ON live_channel_group(sort_order);
CREATE INDEX IF NOT EXISTS idx_live_channel_group_status ON live_channel_group(status);

-- ============================================
-- 10. 直播频道表
-- ============================================
CREATE TABLE IF NOT EXISTS live_channel (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  channel_id INTEGER NOT NULL UNIQUE,
  name TEXT NOT NULL,
  group_id INTEGER,
  addrs TEXT NOT NULL,
  logo TEXT,
  sort_order INTEGER DEFAULT 0,
  status TEXT DEFAULT 'online',
  viewer_count INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (group_id) REFERENCES live_channel_group(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_live_channel_group ON live_channel(group_id);
CREATE INDEX IF NOT EXISTS idx_live_channel_name ON live_channel(name);
CREATE INDEX IF NOT EXISTS idx_live_channel_sort ON live_channel(sort_order);
CREATE INDEX IF NOT EXISTS idx_live_channel_status ON live_channel(status);

-- ============================================
-- 11. 背景视频表
-- ============================================
CREATE TABLE IF NOT EXISTS background_video (
  id TEXT PRIMARY KEY,
  title TEXT,
  url TEXT NOT NULL,
  definition TEXT DEFAULT 'SD',
  status TEXT DEFAULT 'active',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_background_video_status ON background_video(status);

-- ============================================
-- 触发器：自动更新 updated_at 字段
-- ============================================
CREATE TRIGGER IF NOT EXISTS update_tab_menu_updated_at
AFTER UPDATE ON tab_menu
FOR EACH ROW
BEGIN
  UPDATE tab_menu SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS update_home_plate_updated_at
AFTER UPDATE ON home_plate
FOR EACH ROW
BEGIN
  UPDATE home_plate SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS update_plate_detail_updated_at
AFTER UPDATE ON plate_detail
FOR EACH ROW
BEGIN
  UPDATE plate_detail SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS update_media_content_updated_at
AFTER UPDATE ON media_content
FOR EACH ROW
BEGIN
  UPDATE media_content SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS update_short_video_updated_at
AFTER UPDATE ON short_video
FOR EACH ROW
BEGIN
  UPDATE short_video SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS update_search_keyword_updated_at
AFTER UPDATE ON search_keyword
FOR EACH ROW
BEGIN
  UPDATE search_keyword SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS update_live_channel_group_updated_at
AFTER UPDATE ON live_channel_group
FOR EACH ROW
BEGIN
  UPDATE live_channel_group SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS update_live_channel_updated_at
AFTER UPDATE ON live_channel
FOR EACH ROW
BEGIN
  UPDATE live_channel SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS update_background_video_updated_at
AFTER UPDATE ON background_video
FOR EACH ROW
BEGIN
  UPDATE background_video SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;
