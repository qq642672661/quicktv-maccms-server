-- Migration: Create videos table
-- Created at: 2026-05-09

CREATE TABLE IF NOT EXISTS videos (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
  cover_image VARCHAR(500),
  video_url VARCHAR(500),
  duration INTEGER DEFAULT 0,
  resolution VARCHAR(20),
  file_size BIGINT,
  view_count INTEGER DEFAULT 0,
  like_count INTEGER DEFAULT 0,
  comment_count INTEGER DEFAULT 0,
  favorite_count INTEGER DEFAULT 0,
  share_count INTEGER DEFAULT 0,
  status VARCHAR(20) DEFAULT 'published',
  is_featured BOOLEAN DEFAULT FALSE,
  is_recommended BOOLEAN DEFAULT FALSE,
  published_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  maccms_id INTEGER,
  maccms_type_id INTEGER,
  maccms_data JSONB
);

CREATE INDEX idx_videos_title ON videos(title);
CREATE INDEX idx_videos_category_id ON videos(category_id);
CREATE INDEX idx_videos_status ON videos(status);
CREATE INDEX idx_videos_view_count ON videos(view_count DESC);
CREATE INDEX idx_videos_published_at ON videos(published_at DESC);
CREATE INDEX idx_videos_is_featured ON videos(is_featured);
CREATE INDEX idx_videos_is_recommended ON videos(is_recommended);
CREATE INDEX idx_videos_maccms_id ON videos(maccms_id);

COMMENT ON TABLE videos IS '视频表';
COMMENT ON COLUMN videos.id IS '视频ID';
COMMENT ON COLUMN videos.title IS '视频标题';
COMMENT ON COLUMN videos.duration IS '视频时长（秒）';
COMMENT ON COLUMN videos.view_count IS '观看次数';
COMMENT ON COLUMN videos.status IS '状态：draft/published/archived';
COMMENT ON COLUMN videos.maccms_id IS 'MacCMS视频ID';
COMMENT ON COLUMN videos.maccms_data IS 'MacCMS原始数据';
