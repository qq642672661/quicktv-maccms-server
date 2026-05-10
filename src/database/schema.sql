-- 创建直播频道表
CREATE TABLE IF NOT EXISTS live_channels (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  logo VARCHAR(500),
  stream_url TEXT NOT NULL,
  category VARCHAR(100) NOT NULL,
  status VARCHAR(20) DEFAULT 'offline' CHECK (status IN ('online', 'offline', 'maintenance')),
  quality JSONB DEFAULT '[]',
  description TEXT,
  tags JSONB DEFAULT '[]',
  sort_order INTEGER DEFAULT 0,
  viewer_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_live_channels_category ON live_channels(category);
CREATE INDEX idx_live_channels_status ON live_channels(status);
CREATE INDEX idx_live_channels_sort_order ON live_channels(sort_order);

-- 创建直播观看统计表
CREATE TABLE IF NOT EXISTS live_view_stats (
  id SERIAL PRIMARY KEY,
  channel_id VARCHAR(36) NOT NULL UNIQUE,
  viewer_count INTEGER DEFAULT 0,
  peak_viewers INTEGER DEFAULT 0,
  total_views BIGINT DEFAULT 0,
  avg_watch_time INTEGER DEFAULT 0,
  last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (channel_id) REFERENCES live_channels(id) ON DELETE CASCADE
);

CREATE INDEX idx_live_view_stats_channel ON live_view_stats(channel_id);

-- 创建播放历史表
CREATE TABLE IF NOT EXISTS play_history (
  id VARCHAR(36) PRIMARY KEY,
  device_id VARCHAR(100) NOT NULL,
  video_id VARCHAR(100) NOT NULL,
  video_title VARCHAR(255),
  episode_id VARCHAR(100),
  episode_title VARCHAR(255),
  cover_url VARCHAR(500),
  play_progress INTEGER DEFAULT 0,
  total_duration INTEGER DEFAULT 0,
  last_play_time BIGINT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_play_history_device ON play_history(device_id);
CREATE INDEX idx_play_history_video ON play_history(video_id);
CREATE INDEX idx_play_history_time ON play_history(last_play_time DESC);

-- 创建收藏表
CREATE TABLE IF NOT EXISTS favorites (
  id VARCHAR(36) PRIMARY KEY,
  device_id VARCHAR(100) NOT NULL,
  video_id VARCHAR(100) NOT NULL,
  video_title VARCHAR(255),
  cover_url VARCHAR(500),
  episode_count INTEGER DEFAULT 0,
  latest_episode VARCHAR(100),
  category VARCHAR(100),
  tags JSONB DEFAULT '[]',
  add_time BIGINT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(device_id, video_id)
);

CREATE INDEX idx_favorites_device ON favorites(device_id);
CREATE INDEX idx_favorites_video ON favorites(video_id);
CREATE INDEX idx_favorites_time ON favorites(add_time DESC);

-- 创建评论表
CREATE TABLE IF NOT EXISTS comments (
  id VARCHAR(36) PRIMARY KEY,
  video_id VARCHAR(100) NOT NULL,
  user_id VARCHAR(100) NOT NULL,
  user_name VARCHAR(100),
  user_avatar VARCHAR(500),
  content TEXT NOT NULL,
  parent_id VARCHAR(36),
  like_count INTEGER DEFAULT 0,
  reply_count INTEGER DEFAULT 0,
  create_time BIGINT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_comments_video ON comments(video_id);
CREATE INDEX idx_comments_user ON comments(user_id);
CREATE INDEX idx_comments_parent ON comments(parent_id);
CREATE INDEX idx_comments_time ON comments(create_time DESC);

-- 创建评论点赞表
CREATE TABLE IF NOT EXISTS comment_likes (
  id SERIAL PRIMARY KEY,
  comment_id VARCHAR(36) NOT NULL,
  user_id VARCHAR(100) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(comment_id, user_id),
  FOREIGN KEY (comment_id) REFERENCES comments(id) ON DELETE CASCADE
);

CREATE INDEX idx_comment_likes_comment ON comment_likes(comment_id);
CREATE INDEX idx_comment_likes_user ON comment_likes(user_id);
