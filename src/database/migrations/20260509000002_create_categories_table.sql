-- Migration: Create categories table
-- Created at: 2026-05-09

CREATE TABLE IF NOT EXISTS categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  parent_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_categories_slug ON categories(slug);
CREATE INDEX idx_categories_parent_id ON categories(parent_id);
CREATE INDEX idx_categories_sort_order ON categories(sort_order);
CREATE INDEX idx_categories_is_active ON categories(is_active);

COMMENT ON TABLE categories IS '视频分类表';
COMMENT ON COLUMN categories.id IS '分类ID';
COMMENT ON COLUMN categories.name IS '分类名称';
COMMENT ON COLUMN categories.slug IS '分类标识';
COMMENT ON COLUMN categories.parent_id IS '父分类ID';
COMMENT ON COLUMN categories.sort_order IS '排序顺序';
