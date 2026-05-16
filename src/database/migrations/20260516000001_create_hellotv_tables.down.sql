-- Migration Rollback: Drop HelloTV tables
-- Created at: 2026-05-16

-- 删除触发器
DROP TRIGGER IF EXISTS update_background_video_updated_at ON background_video;
DROP TRIGGER IF EXISTS update_live_channel_updated_at ON live_channel;
DROP TRIGGER IF EXISTS update_live_channel_group_updated_at ON live_channel_group;
DROP TRIGGER IF EXISTS update_search_keyword_updated_at ON search_keyword;
DROP TRIGGER IF EXISTS update_short_video_updated_at ON short_video;
DROP TRIGGER IF EXISTS update_media_content_updated_at ON media_content;
DROP TRIGGER IF EXISTS update_plate_detail_updated_at ON plate_detail;
DROP TRIGGER IF EXISTS update_home_plate_updated_at ON home_plate;
DROP TRIGGER IF EXISTS update_tab_menu_updated_at ON tab_menu;

-- 删除函数
DROP FUNCTION IF EXISTS update_updated_at_column();

-- 按依赖关系倒序删除表
DROP TABLE IF EXISTS background_video CASCADE;
DROP TABLE IF EXISTS live_channel CASCADE;
DROP TABLE IF EXISTS live_channel_group CASCADE;
DROP TABLE IF EXISTS user_search_history CASCADE;
DROP TABLE IF EXISTS search_keyword CASCADE;
DROP TABLE IF EXISTS short_video CASCADE;
DROP TABLE IF EXISTS media_data_item CASCADE;
DROP TABLE IF EXISTS media_content CASCADE;
DROP TABLE IF EXISTS plate_detail CASCADE;
DROP TABLE IF EXISTS home_plate CASCADE;
DROP TABLE IF EXISTS tab_menu CASCADE;
