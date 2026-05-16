import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const dataDir = path.join(process.cwd(), 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'quicktv.db');
const db = new Database(dbPath);

console.log('📁 创建数据库表结构...');

db.exec(`
  CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    parent_id INTEGER,
    sort_order INTEGER DEFAULT 0,
    is_active INTEGER DEFAULT 1,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (parent_id) REFERENCES categories(id)
  );

  CREATE TABLE IF NOT EXISTS videos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    category_id INTEGER,
    cover_image TEXT,
    video_url TEXT,
    duration INTEGER DEFAULT 0,
    resolution TEXT,
    file_size INTEGER,
    view_count INTEGER DEFAULT 0,
    like_count INTEGER DEFAULT 0,
    comment_count INTEGER DEFAULT 0,
    favorite_count INTEGER DEFAULT 0,
    share_count INTEGER DEFAULT 0,
    status TEXT DEFAULT 'published',
    is_featured INTEGER DEFAULT 0,
    is_recommended INTEGER DEFAULT 0,
    published_at TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    maccms_id INTEGER,
    maccms_type_id INTEGER,
    FOREIGN KEY (category_id) REFERENCES categories(id)
  );

  CREATE TABLE IF NOT EXISTS live_channels (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    logo TEXT,
    stream_url TEXT NOT NULL,
    category TEXT NOT NULL,
    status TEXT DEFAULT 'offline',
    quality TEXT DEFAULT '[]',
    description TEXT,
    tags TEXT DEFAULT '[]',
    sort_order INTEGER DEFAULT 0,
    viewer_count INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS play_history (
    id TEXT PRIMARY KEY,
    device_id TEXT NOT NULL,
    video_id TEXT NOT NULL,
    video_title TEXT,
    episode_id TEXT,
    episode_title TEXT,
    cover_url TEXT,
    play_progress INTEGER DEFAULT 0,
    total_duration INTEGER DEFAULT 0,
    last_play_time INTEGER NOT NULL,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
  );

  CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);
  CREATE INDEX IF NOT EXISTS idx_categories_parent_id ON categories(parent_id);
  CREATE INDEX IF NOT EXISTS idx_videos_title ON videos(title);
  CREATE INDEX IF NOT EXISTS idx_videos_category_id ON videos(category_id);
  CREATE INDEX IF NOT EXISTS idx_videos_status ON videos(status);
  CREATE INDEX IF NOT EXISTS idx_live_channels_category ON live_channels(category);
  CREATE INDEX IF NOT EXISTS idx_live_channels_status ON live_channels(status);
  CREATE INDEX IF NOT EXISTS idx_play_history_device ON play_history(device_id);
`);

console.log('✅ 数据库表结构创建完成');

db.close();
console.log('✅ 数据库连接已关闭');
