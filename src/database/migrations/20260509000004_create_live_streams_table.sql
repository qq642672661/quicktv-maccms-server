-- Migration: Create live_streams table
-- Created at: 2026-05-09

CREATE TABLE IF NOT EXISTS live_streams (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
  cover_image VARCHAR(500),
  stream_url VARCHAR(500) NOT NULL,
  stream_key VARCHAR(255),
  stream_protocol VARCHAR(20) DEFAULT 'hls',
  resolution VARCHAR(20),
  bitrate INTEGER,
  viewer_count INTEGER DEFAULT 0,
  like_count INTEGER DEFAULT 0,
  comment_count INTEGER DEFAULT 0,
  status VARCHAR(20) DEFAULT 'offline',
  is_featured BOOLEAN DEFAULT FALSE,
  started_at TIMESTAMP,
  ended_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  maccms_id INTEGER,
  maccms_data JSONB
);

CREATE INDEX idx_live_streams_title ON live_streams(title);
CREATE INDEX idx_live_streams_category_id ON live_streams(category_id);
CREATE INDEX idx_live_streams_status ON live_streams(status);
CREATE INDEX idx_live_streams_viewer_count ON live_streams(viewer_count DESC);
CREATE INDEX idx_live_streams_is_featured ON live_streams(is_featured);
CREATE INDEX idx_live_streams_started_at ON live_streams(started_at DESC);
CREATE INDEX idx_live_streams_maccms_id ON live_streams(maccms_id);

COMMENT ON TABLE live_streams IS '直播表';
COMMENT ON COLUMN live_streams.id IS '直播ID';
COMMENT ON COLUMN live_streams.title IS '直播标题';
COMMENT ON COLUMN live_streams.stream_url IS '直播流地址';
COMMENT ON COLUMN live_streams.stream_protocol IS '流协议：hls/rtmp/flv';
COMMENT ON COLUMN live_streams.status IS '状态：offline/live/ended';
COMMENT ON COLUMN live_streams.viewer_count IS '当前观看人数';
