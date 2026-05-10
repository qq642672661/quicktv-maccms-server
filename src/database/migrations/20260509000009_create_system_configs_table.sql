-- Migration: Create system_configs table
-- Created at: 2026-05-09

CREATE TABLE IF NOT EXISTS system_configs (
  id SERIAL PRIMARY KEY,
  config_key VARCHAR(100) NOT NULL UNIQUE,
  config_value TEXT,
  config_type VARCHAR(20) DEFAULT 'string',
  description TEXT,
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_system_configs_key ON system_configs(config_key);
CREATE INDEX idx_system_configs_is_public ON system_configs(is_public);

COMMENT ON TABLE system_configs IS '系统配置表';
COMMENT ON COLUMN system_configs.config_key IS '配置键';
COMMENT ON COLUMN system_configs.config_value IS '配置值';
COMMENT ON COLUMN system_configs.config_type IS '配置类型：string/number/boolean/json';
COMMENT ON COLUMN system_configs.is_public IS '是否公开（前端可访问）';
