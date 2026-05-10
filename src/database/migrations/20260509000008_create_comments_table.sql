-- Migration: Create comments table
-- Created at: 2026-05-09

CREATE TABLE IF NOT EXISTS comments (
  id BIGSERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  video_id INTEGER REFERENCES videos(id) ON DELETE CASCADE,
  live_stream_id INTEGER REFERENCES live_streams(id) ON DELETE CASCADE,
  content_type VARCHAR(20) NOT NULL CHECK (content_type IN ('video', 'live')),
  parent_id BIGINT REFERENCES comments(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  like_count INTEGER DEFAULT 0,
  reply_count INTEGER DEFAULT 0,
  status VARCHAR(20) DEFAULT 'approved',
  ip_address VARCHAR(45),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT check_comment_content CHECK (
    (content_type = 'video' AND video_id IS NOT NULL AND live_stream_id IS NULL) OR
    (content_type = 'live' AND live_stream_id IS NOT NULL AND video_id IS NULL)
  )
);

CREATE INDEX idx_comments_user_id ON comments(user_id);
CREATE INDEX idx_comments_video_id ON comments(video_id, created_at DESC);
CREATE INDEX idx_comments_live_stream_id ON comments(live_stream_id, created_at DESC);
CREATE INDEX idx_comments_parent_id ON comments(parent_id);
CREATE INDEX idx_comments_status ON comments(status);
CREATE INDEX idx_comments_created_at ON comments(created_at DESC);

COMMENT ON TABLE comments IS '评论表';
COMMENT ON COLUMN comments.user_id IS '用户ID';
COMMENT ON COLUMN comments.content_type IS '内容类型：video-视频, live-直播';
COMMENT ON COLUMN comments.parent_id IS '父评论ID（回复）';
COMMENT ON COLUMN comments.status IS '状态：pending/approved/rejected';
