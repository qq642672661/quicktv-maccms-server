import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const dbDir = path.join(__dirname, '../../data');
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const dbPath = path.join(dbDir, 'quicktv.db');
const db = new Database(dbPath);

db.exec(`
  CREATE TABLE IF NOT EXISTS tabs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    menu_code VARCHAR(50) NOT NULL UNIQUE,
    menu_name VARCHAR(100) NOT NULL,
    menu_type INTEGER DEFAULT 0,
    default_home INTEGER DEFAULT 0,
    image TEXT,
    focus_image TEXT,
    select_image TEXT,
    image_width INTEGER,
    image_height INTEGER,
    corner_image TEXT,
    focus_corner_image TEXT,
    background_image TEXT,
    text_icon TEXT,
    redirect_type VARCHAR(50),
    action TEXT,
    inner_args TEXT,
    sort_order INTEGER DEFAULT 0,
    status INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS tab_contents (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    tab_id INTEGER NOT NULL,
    first_plate_margin_top INTEGER DEFAULT 0,
    disable_scroll_on_first_screen INTEGER DEFAULT 0,
    status INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tab_id) REFERENCES tabs(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS sections (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    tab_content_id INTEGER NOT NULL,
    plate_name VARCHAR(200) NOT NULL,
    show_plate_name INTEGER DEFAULT 1,
    plate_type INTEGER DEFAULT 1,
    height INTEGER NOT NULL,
    is_switch_cell_bg INTEGER DEFAULT 0,
    time_axis_switch INTEGER DEFAULT 0,
    is_focus_scroll_target INTEGER DEFAULT 0,
    sort_order INTEGER DEFAULT 0,
    status INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tab_content_id) REFERENCES tab_contents(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS section_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    section_id INTEGER NOT NULL,
    pos_x INTEGER NOT NULL,
    pos_y INTEGER NOT NULL,
    width INTEGER NOT NULL,
    height INTEGER NOT NULL,
    cell_type INTEGER NOT NULL,
    is_bg_player INTEGER DEFAULT 0,
    poster TEXT,
    poster_title VARCHAR(500),
    poster_title_style VARCHAR(50),
    poster_subtitle VARCHAR(500),
    float_title VARCHAR(200),
    corner_style VARCHAR(50),
    corner_position VARCHAR(50),
    corner_content VARCHAR(200),
    corner_color VARCHAR(50),
    corner_gradient VARCHAR(200),
    corner_image TEXT,
    focus_image TEXT,
    non_focus_image TEXT,
    play_logo_switch INTEGER DEFAULT 0,
    redirect_type VARCHAR(50),
    action TEXT,
    inner_args TEXT,
    content_data VARCHAR(100),
    content_second_id VARCHAR(100),
    content_third_id VARCHAR(100),
    sort_order INTEGER DEFAULT 0,
    status INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (section_id) REFERENCES sections(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS play_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    section_item_id INTEGER NOT NULL,
    title VARCHAR(500) NOT NULL,
    cover TEXT NOT NULL,
    url TEXT NOT NULL,
    sort_order INTEGER DEFAULT 0,
    status INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (section_item_id) REFERENCES section_items(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS media_library (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    media_id VARCHAR(100) UNIQUE NOT NULL,
    title VARCHAR(500) NOT NULL,
    subtitle VARCHAR(500),
    cover TEXT,
    video_url TEXT,
    duration INTEGER,
    category VARCHAR(100),
    tags TEXT,
    description TEXT,
    view_count INTEGER DEFAULT 0,
    status INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE INDEX IF NOT EXISTS idx_tabs_menu_code ON tabs(menu_code);
  CREATE INDEX IF NOT EXISTS idx_tab_contents_tab_id ON tab_contents(tab_id);
  CREATE INDEX IF NOT EXISTS idx_sections_tab_content_id ON sections(tab_content_id);
  CREATE INDEX IF NOT EXISTS idx_section_items_section_id ON section_items(section_id);
  CREATE INDEX IF NOT EXISTS idx_play_items_section_item_id ON play_items(section_item_id);
  CREATE INDEX IF NOT EXISTS idx_media_library_media_id ON media_library(media_id);
  CREATE INDEX IF NOT EXISTS idx_media_library_category ON media_library(category);
`);

console.log('✅ 数据库表结构创建成功！');
console.log('📍 数据库位置:', dbPath);

export default db;
