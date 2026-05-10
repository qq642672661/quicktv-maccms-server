-- Migration: Create favorites table
-- Created at: 2026-05-09

CREATE TABLE IF NOT EXISTS favorites (
  id BIGSERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  video_id INTEGER REFERENCES videos(id) ON DELETE CASCADE,
  live_stream_id INTEGER REFERENCES live_streams(id) ON DELETE CASCADE,
  content_type VARCHAR(20) NOT NULL CHECK (content_type IN ('video', 'live')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT check_favorite_content CHECK (
    (content_type = 'video' AND video_id IS NOT NULL AND live_stream_id IS NULL) OR
    (content_type = 'live' AND live_stream_id IS NOT NULL AND video_id IS NULL)
  ),
  CONSTRAINT unique_user_video UNIQUE (user_id, video_id),
  CONSTRAINT unique_user_live UNIQUE (user_id, live_stream_id)
);

CREATE INDEX idx_favorites_user_id ON favorites(user_id, created_at DESC);
CREATE INDEX idx_favorites_video_id ON favorites(video_id);
CREATE INDEX idx_favorites_live_stream_id ON favorites(live_stream_id);
CREATE INDEX idx_favorites_content_type ON favorites(content_type);

COMMENT ON TABLE favorites IS '收藏表';
COMMENT ON COLUMN favorites.user_id IS '用户ID';
COMMENT ON COLUMN favorites.content_type IS '内容类型：video-视频, live-直播';
