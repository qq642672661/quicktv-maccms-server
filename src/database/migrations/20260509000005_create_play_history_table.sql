-- Migration: Create play_history table
-- Created at: 2026-05-09

CREATE TABLE IF NOT EXISTS play_history (
  id BIGSERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  video_id INTEGER REFERENCES videos(id) ON DELETE CASCADE,
  live_stream_id INTEGER REFERENCES live_streams(id) ON DELETE CASCADE,
  content_type VARCHAR(20) NOT NULL CHECK (content_type IN ('video', 'live')),
  play_duration INTEGER DEFAULT 0,
  progress_seconds INTEGER DEFAULT 0,
  device_type VARCHAR(50),
  device_id VARCHAR(100),
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT check_content CHECK (
    (content_type = 'video' AND video_id IS NOT NULL AND live_stream_id IS NULL) OR
    (content_type = 'live' AND live_stream_id IS NOT NULL AND video_id IS NULL)
  )
) PARTITION BY RANGE (created_at);

CREATE TABLE play_history_2026_01 PARTITION OF play_history
  FOR VALUES FROM ('2026-01-01') TO ('2026-02-01');

CREATE TABLE play_history_2026_02 PARTITION OF play_history
  FOR VALUES FROM ('2026-02-01') TO ('2026-03-01');

CREATE TABLE play_history_2026_03 PARTITION OF play_history
  FOR VALUES FROM ('2026-03-01') TO ('2026-04-01');

CREATE TABLE play_history_2026_04 PARTITION OF play_history
  FOR VALUES FROM ('2026-04-01') TO ('2026-05-01');

CREATE TABLE play_history_2026_05 PARTITION OF play_history
  FOR VALUES FROM ('2026-05-01') TO ('2026-06-01');

CREATE TABLE play_history_2026_06 PARTITION OF play_history
  FOR VALUES FROM ('2026-06-01') TO ('2026-07-01');

CREATE INDEX idx_play_history_user_id ON play_history(user_id, created_at DESC);
CREATE INDEX idx_play_history_video_id ON play_history(video_id);
CREATE INDEX idx_play_history_live_stream_id ON play_history(live_stream_id);
CREATE INDEX idx_play_history_content_type ON play_history(content_type);
CREATE INDEX idx_play_history_created_at ON play_history(created_at DESC);

COMMENT ON TABLE play_history IS '播放历史表（按月分区）';
COMMENT ON COLUMN play_history.user_id IS '用户ID';
COMMENT ON COLUMN play_history.content_type IS '内容类型：video-视频, live-直播';
COMMENT ON COLUMN play_history.play_duration IS '播放时长（秒）';
COMMENT ON COLUMN play_history.progress_seconds IS '播放进度（秒）';
