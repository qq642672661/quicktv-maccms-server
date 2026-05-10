-- Migration: Create user_statistics table
-- Created at: 2026-05-09

CREATE TABLE IF NOT EXISTS user_statistics (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  total_watch_time INTEGER DEFAULT 0,
  total_videos_watched INTEGER DEFAULT 0,
  total_live_watched INTEGER DEFAULT 0,
  favorite_count INTEGER DEFAULT 0,
  comment_count INTEGER DEFAULT 0,
  like_count INTEGER DEFAULT 0,
  share_count INTEGER DEFAULT 0,
  last_watch_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_user_statistics_user_id ON user_statistics(user_id);
CREATE INDEX idx_user_statistics_total_watch_time ON user_statistics(total_watch_time DESC);
CREATE INDEX idx_user_statistics_last_watch_at ON user_statistics(last_watch_at DESC);

COMMENT ON TABLE user_statistics IS '用户统计表';
COMMENT ON COLUMN user_statistics.user_id IS '用户ID';
COMMENT ON COLUMN user_statistics.total_watch_time IS '总观看时长（秒）';
COMMENT ON COLUMN user_statistics.total_videos_watched IS '观看视频总数';
COMMENT ON COLUMN user_statistics.total_live_watched IS '观看直播总数';
