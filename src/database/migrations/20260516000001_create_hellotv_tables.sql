-- Migration: Create HelloTV tables
-- Created at: 2026-05-16
-- Description: 创建HelloTV应用所需的所有数据表

-- ============================================
-- 1. Tab菜单表
-- ============================================
CREATE TABLE IF NOT EXISTS tab_menu (
  id VARCHAR(50) PRIMARY KEY,
  menu_code VARCHAR(20) NOT NULL,
  menu_name VARCHAR(100) NOT NULL,
  menu_type INTEGER DEFAULT 0,
  image_width VARCHAR(20),
  image_height VARCHAR(20),
  image VARCHAR(500),
  select_image VARCHAR(500),
  focus_image VARCHAR(500),
  focus_corner_image VARCHAR(500),
  corner_image VARCHAR(500),
  background_image VARCHAR(500),
  default_home VARCHAR(10) DEFAULT '0',
  sort_order INTEGER DEFAULT 0,
  status VARCHAR(20) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_tab_menu_code ON tab_menu(menu_code);
CREATE INDEX idx_tab_menu_sort ON tab_menu(sort_order);
CREATE INDEX idx_tab_menu_status ON tab_menu(status);

COMMENT ON TABLE tab_menu IS 'Tab菜单配置表';
COMMENT ON COLUMN tab_menu.menu_code IS '菜单编码';
COMMENT ON COLUMN tab_menu.menu_name IS '菜单名称';
COMMENT ON COLUMN tab_menu.default_home IS '是否默认首页：0-否，1-是';

-- ============================================
-- 2. 首页板块表
-- ============================================
CREATE TABLE IF NOT EXISTS home_plate (
  id VARCHAR(50) PRIMARY KEY,
  tab_id VARCHAR(50) NOT NULL,
  plate_name VARCHAR(255),
  show_plate_name VARCHAR(10) DEFAULT '0',
  plate_type VARCHAR(10) DEFAULT '1',
  height INTEGER DEFAULT 0,
  is_switch_cell_bg VARCHAR(10) DEFAULT '0',
  time_axis_switch VARCHAR(10) DEFAULT '0',
  is_focus_scroll_target BOOLEAN DEFAULT FALSE,
  sort_order INTEGER DEFAULT 0,
  status VARCHAR(20) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (tab_id) REFERENCES tab_menu(id) ON DELETE CASCADE
);

CREATE INDEX idx_home_plate_tab ON home_plate(tab_id);
CREATE INDEX idx_home_plate_sort ON home_plate(sort_order);
CREATE INDEX idx_home_plate_status ON home_plate(status);

COMMENT ON TABLE home_plate IS '首页板块表';
COMMENT ON COLUMN home_plate.plate_name IS '板块名称';
COMMENT ON COLUMN home_plate.show_plate_name IS '是否显示板块名称：0-否，1-是';
COMMENT ON COLUMN home_plate.plate_type IS '板块类型：1-普通板块';

-- ============================================
-- 3. 板块详情表
-- ============================================
CREATE TABLE IF NOT EXISTS plate_detail (
  id VARCHAR(50) PRIMARY KEY,
  plate_id VARCHAR(50) NOT NULL,
  pos_x INTEGER DEFAULT 0,
  pos_y INTEGER DEFAULT 0,
  width INTEGER DEFAULT 0,
  height INTEGER DEFAULT 0,
  cell_type VARCHAR(20) DEFAULT '0',
  poster VARCHAR(500),
  poster_title VARCHAR(255),
  poster_title_style VARCHAR(10),
  content_data VARCHAR(50),
  content_second_id VARCHAR(50),
  corner_color VARCHAR(20),
  corner_gradient VARCHAR(20),
  redirect_type INTEGER DEFAULT 0,
  action TEXT,
  inner_args TEXT,
  play_logo_switch VARCHAR(10) DEFAULT '0',
  play_data JSONB,
  sort_order INTEGER DEFAULT 0,
  status VARCHAR(20) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (plate_id) REFERENCES home_plate(id) ON DELETE CASCADE
);

CREATE INDEX idx_plate_detail_plate ON plate_detail(plate_id);
CREATE INDEX idx_plate_detail_content ON plate_detail(content_data);
CREATE INDEX idx_plate_detail_sort ON plate_detail(sort_order);
CREATE INDEX idx_plate_detail_status ON plate_detail(status);

COMMENT ON TABLE plate_detail IS '板块详情表';
COMMENT ON COLUMN plate_detail.cell_type IS '单元格类型：0-海报，3-占位符，10008-播放器轮播';
COMMENT ON COLUMN plate_detail.redirect_type IS '跳转类型：0-无，1-内部跳转';
COMMENT ON COLUMN plate_detail.play_data IS '播放数据（JSON格式）';

-- ============================================
-- 4. 媒体内容表（扩展）
-- ============================================
CREATE TABLE IF NOT EXISTS media_content (
  id VARCHAR(50) PRIMARY KEY,
  asset_title VARCHAR(255) NOT NULL,
  asset_sub_title VARCHAR(255),
  asset_alias VARCHAR(255),
  asset_type VARCHAR(10),
  description TEXT,
  media_type INTEGER DEFAULT 1,
  cp_name VARCHAR(100),
  tags VARCHAR(500),
  category_name VARCHAR(100),
  category_sub_name VARCHAR(200),
  anchors VARCHAR(500),
  clip_type VARCHAR(10),
  year VARCHAR(20),
  cover_h VARCHAR(500),
  cover_v VARCHAR(500),
  directors VARCHAR(500),
  actors VARCHAR(1000),
  region VARCHAR(100),
  language VARCHAR(50),
  pay_type VARCHAR(10) DEFAULT '1',
  fee_type INTEGER DEFAULT 1,
  total_episodes_num VARCHAR(10),
  update_episodes_num VARCHAR(10),
  drm VARCHAR(10) DEFAULT '0',
  series_type VARCHAR(10) DEFAULT '1',
  finish_status VARCHAR(10) DEFAULT '0',
  douban_score DECIMAL(4,1),
  description1 VARCHAR(500),
  description2 VARCHAR(500),
  description3 VARCHAR(500),
  description4 VARCHAR(500),
  description5 VARCHAR(500),
  status VARCHAR(10) DEFAULT '1',
  online_status VARCHAR(10) DEFAULT '1',
  licence_num VARCHAR(200),
  cache_tags TEXT,
  start_index INTEGER DEFAULT 1,
  episode_count INTEGER DEFAULT 0,
  play_count INTEGER DEFAULT 0,
  is_hot_search INTEGER DEFAULT 0,
  episode_sort_type INTEGER DEFAULT 0,
  start_index_type INTEGER DEFAULT 0,
  episode_tab_style INTEGER,
  corner_content VARCHAR(50),
  corner_color VARCHAR(20),
  corner_gradient VARCHAR(20),
  is_cms_relate INTEGER DEFAULT 0,
  newtv_status VARCHAR(20),
  tag_list JSONB,
  composite_score DECIMAL(4,1),
  package_name_list JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_media_content_title ON media_content(asset_title);
CREATE INDEX idx_media_content_category ON media_content(category_name);
CREATE INDEX idx_media_content_tags ON media_content USING GIN(tag_list);
CREATE INDEX idx_media_content_status ON media_content(status, online_status);
CREATE INDEX idx_media_content_play_count ON media_content(play_count DESC);
CREATE INDEX idx_media_content_score ON media_content(douban_score DESC);
CREATE INDEX idx_media_content_year ON media_content(year);

COMMENT ON TABLE media_content IS '媒体内容表';
COMMENT ON COLUMN media_content.asset_title IS '内容标题';
COMMENT ON COLUMN media_content.media_type IS '媒体类型：1-视频，2-音频';
COMMENT ON COLUMN media_content.pay_type IS '付费类型：1-免费，2-付费';
COMMENT ON COLUMN media_content.douban_score IS '豆瓣评分';

-- ============================================
-- 5. 媒体数据项表
-- ============================================
CREATE TABLE IF NOT EXISTS media_data_item (
  id VARCHAR(50) PRIMARY KEY,
  meta_id VARCHAR(50) NOT NULL,
  source_id VARCHAR(50),
  platform_id VARCHAR(50),
  platform_name VARCHAR(100),
  platform_code VARCHAR(50),
  pay_type VARCHAR(10),
  fee_type INTEGER,
  episodes VARCHAR(10),
  media_type INTEGER,
  redirection TEXT,
  background_colour VARCHAR(20),
  start_background_color VARCHAR(20),
  end_background_color VARCHAR(20),
  show_episode_tab INTEGER DEFAULT 1,
  episode_tab_style INTEGER DEFAULT 0,
  episode_tab_name VARCHAR(50),
  cp_name VARCHAR(100),
  category_name VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (meta_id) REFERENCES media_content(id) ON DELETE CASCADE
);

CREATE INDEX idx_media_data_item_meta ON media_data_item(meta_id);
CREATE INDEX idx_media_data_item_platform ON media_data_item(platform_code);

COMMENT ON TABLE media_data_item IS '媒体数据项表';
COMMENT ON COLUMN media_data_item.meta_id IS '关联的媒体内容ID';

-- ============================================
-- 6. 短视频表
-- ============================================
CREATE TABLE IF NOT EXISTS short_video (
  id VARCHAR(50) PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  poster VARCHAR(500),
  url VARCHAR(500) NOT NULL,
  corner VARCHAR(50),
  redirect_type INTEGER DEFAULT 0,
  action TEXT,
  inner_args TEXT,
  tag VARCHAR(50),
  score VARCHAR(20),
  sort VARCHAR(200),
  description TEXT,
  play_count INTEGER DEFAULT 0,
  like_count INTEGER DEFAULT 0,
  comment_count INTEGER DEFAULT 0,
  share_count INTEGER DEFAULT 0,
  status VARCHAR(20) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_short_video_title ON short_video(title);
CREATE INDEX idx_short_video_play_count ON short_video(play_count DESC);
CREATE INDEX idx_short_video_status ON short_video(status);
CREATE INDEX idx_short_video_created ON short_video(created_at DESC);

COMMENT ON TABLE short_video IS '短视频表';
COMMENT ON COLUMN short_video.title IS '短视频标题';
COMMENT ON COLUMN short_video.url IS '视频播放地址';
COMMENT ON COLUMN short_video.tag IS '标签（如：首播、独家）';

-- ============================================
-- 7. 搜索关键词表
-- ============================================
CREATE TABLE IF NOT EXISTS search_keyword (
  id SERIAL PRIMARY KEY,
  keyword VARCHAR(100) NOT NULL,
  search_count INTEGER DEFAULT 0,
  is_hot BOOLEAN DEFAULT FALSE,
  sort_order INTEGER DEFAULT 0,
  status VARCHAR(20) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (keyword)
);

CREATE INDEX idx_search_keyword_hot ON search_keyword(is_hot, search_count DESC);
CREATE INDEX idx_search_keyword_sort ON search_keyword(sort_order);
CREATE INDEX idx_search_keyword_status ON search_keyword(status);

COMMENT ON TABLE search_keyword IS '搜索关键词表';
COMMENT ON COLUMN search_keyword.keyword IS '关键词';
COMMENT ON COLUMN search_keyword.search_count IS '搜索次数';
COMMENT ON COLUMN search_keyword.is_hot IS '是否热门关键词';

-- ============================================
-- 8. 用户搜索历史表
-- ============================================
CREATE TABLE IF NOT EXISTS user_search_history (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(50),
  device_id VARCHAR(100),
  keyword VARCHAR(100) NOT NULL,
  search_time BIGINT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_user_search_history_user ON user_search_history(user_id, search_time DESC);
CREATE INDEX idx_user_search_history_device ON user_search_history(device_id, search_time DESC);
CREATE INDEX idx_user_search_history_keyword ON user_search_history(keyword);

COMMENT ON TABLE user_search_history IS '用户搜索历史表';
COMMENT ON COLUMN user_search_history.user_id IS '用户ID';
COMMENT ON COLUMN user_search_history.device_id IS '设备ID';
COMMENT ON COLUMN user_search_history.search_time IS '搜索时间戳';

-- ============================================
-- 9. 直播频道分组表
-- ============================================
CREATE TABLE IF NOT EXISTS live_channel_group (
  id SERIAL PRIMARY KEY,
  group_name VARCHAR(100) NOT NULL,
  sort_order INTEGER DEFAULT 0,
  status VARCHAR(20) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (group_name)
);

CREATE INDEX idx_live_channel_group_sort ON live_channel_group(sort_order);
CREATE INDEX idx_live_channel_group_status ON live_channel_group(status);

COMMENT ON TABLE live_channel_group IS '直播频道分组表';
COMMENT ON COLUMN live_channel_group.group_name IS '分组名称（如：CCTV、卫视频道）';

-- ============================================
-- 10. 直播频道表（扩展）
-- ============================================
CREATE TABLE IF NOT EXISTS live_channel (
  id SERIAL PRIMARY KEY,
  channel_id INTEGER NOT NULL,
  name VARCHAR(100) NOT NULL,
  group_id INTEGER,
  addrs JSONB NOT NULL,
  logo VARCHAR(500),
  sort_order INTEGER DEFAULT 0,
  status VARCHAR(20) DEFAULT 'online',
  viewer_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (group_id) REFERENCES live_channel_group(id) ON DELETE SET NULL
);

CREATE INDEX idx_live_channel_group ON live_channel(group_id);
CREATE INDEX idx_live_channel_name ON live_channel(name);
CREATE INDEX idx_live_channel_sort ON live_channel(sort_order);
CREATE INDEX idx_live_channel_status ON live_channel(status);

COMMENT ON TABLE live_channel IS '直播频道表';
COMMENT ON COLUMN live_channel.channel_id IS '频道ID';
COMMENT ON COLUMN live_channel.name IS '频道名称';
COMMENT ON COLUMN live_channel.addrs IS '播放地址列表（JSON数组）';

-- ============================================
-- 11. 背景视频表
-- ============================================
CREATE TABLE IF NOT EXISTS background_video (
  id VARCHAR(50) PRIMARY KEY,
  title VARCHAR(255),
  url VARCHAR(500) NOT NULL,
  definition VARCHAR(20) DEFAULT 'SD',
  status VARCHAR(20) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_background_video_status ON background_video(status);

COMMENT ON TABLE background_video IS '背景视频表';
COMMENT ON COLUMN background_video.url IS '视频播放地址';
COMMENT ON COLUMN background_video.definition IS '清晰度：SD/HD/FHD/4K';

-- ============================================
-- 触发器：自动更新 updated_at 字段
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 为所有表创建更新触发器
CREATE TRIGGER update_tab_menu_updated_at BEFORE UPDATE ON tab_menu FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_home_plate_updated_at BEFORE UPDATE ON home_plate FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_plate_detail_updated_at BEFORE UPDATE ON plate_detail FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_media_content_updated_at BEFORE UPDATE ON media_content FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_short_video_updated_at BEFORE UPDATE ON short_video FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_search_keyword_updated_at BEFORE UPDATE ON search_keyword FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_live_channel_group_updated_at BEFORE UPDATE ON live_channel_group FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_live_channel_updated_at BEFORE UPDATE ON live_channel FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_background_video_updated_at BEFORE UPDATE ON background_video FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
