-- 更新直播频道为真实可用的 HLS 流地址
-- 基于调研结果，使用公开的测试流

-- 清空现有数据
TRUNCATE TABLE live_channels CASCADE;
TRUNCATE TABLE live_view_stats CASCADE;

-- 插入真实的 HLS 直播流
INSERT INTO live_channels (id, name, logo, stream_url, category, status, quality, description, tags, sort_order, viewer_count) VALUES
-- 测试流 1: Big Buck Bunny (经典测试视频)
('ch001', 'Big Buck Bunny 测试频道', 'https://peach.blender.org/wp-content/uploads/bbb-splash.png', 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8', '测试频道', 'online', '["1080p","720p","480p"]', '经典开源动画短片，适合测试播放器功能', '["测试","动画","HD"]', 1, 1500),

-- 测试流 2: Sintel (另一个经典测试视频)
('ch002', 'Sintel 高清频道', 'https://durian.blender.org/wp-content/uploads/2010/06/sintel_trailer_1080p.jpg', 'https://bitdash-a.akamaihd.net/content/sintel/hls/playlist.m3u8', '测试频道', 'online', '["1080p","720p"]', 'Blender 开源动画项目', '["测试","动画","高清"]', 2, 1200),

-- 测试流 3: Tears of Steel
('ch003', 'Tears of Steel 4K', 'https://mango.blender.org/wp-content/uploads/2013/05/01_thom_celia_bridge.jpg', 'https://demo.unified-streaming.com/k8s/features/stable/video/tears-of-steel/tears-of-steel.ism/.m3u8', '测试频道', 'online', '["4K","1080p","720p"]', 'Blender 科幻短片，支持多码率', '["测试","科幻","4K"]', 3, 2000),

-- 测试流 4: Apple 官方测试流
('ch004', 'Apple HLS 测试流', 'https://developer.apple.com/streaming/images/streaming-hero-large.jpg', 'https://devstreaming-cdn.apple.com/videos/streaming/examples/img_bipbop_adv_example_fmp4/master.m3u8', '官方测试', 'online', '["1080p","720p","480p"]', 'Apple 官方 HLS 示例流', '["测试","官方","多码率"]', 4, 1800),

-- 测试流 5: Wowza 测试流
('ch005', 'Wowza 直播测试', 'https://www.wowza.com/wp-content/uploads/wowza-logo.png', 'https://cph-p2p-msl.akamaized.net/hls/live/2000341/test/master.m3u8', '直播测试', 'online', '["720p","480p"]', 'Wowza 流媒体服务器测试流', '["测试","直播"]', 5, 900);

-- 插入观看统计数据
INSERT INTO live_view_stats (channel_id, viewer_count, peak_viewers, total_views, avg_watch_time) VALUES
('ch001', 1500, 2500, 150000, 1800),
('ch002', 1200, 2000, 120000, 2100),
('ch003', 2000, 3500, 200000, 2400),
('ch004', 1800, 2800, 180000, 1900),
('ch005', 900, 1500, 90000, 1500)
ON CONFLICT (channel_id) DO NOTHING;

-- 插入点播视频数据
INSERT INTO videos (id, title, description, poster, video_url, category, duration, quality, tags, rating, view_count, release_date) VALUES
-- 点播视频 1: Big Buck Bunny MP4
('v001', 'Big Buck Bunny 完整版', '经典开源动画短片，讲述一只大兔子的故事', 'https://peach.blender.org/wp-content/uploads/bbb-splash.png', 'https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4', '动画', 596, '["1080p"]', '["动画","喜剧","家庭"]', 8.5, 50000, '2008-04-10'),

-- 点播视频 2: Sintel
('v002', 'Sintel 龙之传说', 'Blender 开源项目，讲述女孩与龙的故事', 'https://durian.blender.org/wp-content/uploads/2010/06/sintel_trailer_1080p.jpg', 'https://storage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4', '动画', 888, '["1080p"]', '["动画","奇幻","冒险"]', 9.0, 80000, '2010-09-30'),

-- 点播视频 3: Tears of Steel
('v003', 'Tears of Steel 钢铁之泪', 'Blender 科幻短片，展示视觉特效', 'https://mango.blender.org/wp-content/uploads/2013/05/01_thom_celia_bridge.jpg', 'https://storage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4', '科幻', 734, '["1080p"]', '["科幻","动作","特效"]', 8.8, 120000, '2012-09-26'),

-- 点播视频 4: Elephant Dream
('v004', 'Elephant Dream 大象之梦', 'Blender 第一部开源电影', 'https://orange.blender.org/wp-content/themes/orange/images/media/s1_proog.jpg', 'https://storage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4', '动画', 654, '["720p"]', '["动画","艺术","实验"]', 7.5, 60000, '2006-03-24'),

-- 点播视频 5: For Bigger Blazes
('v005', 'For Bigger Blazes 烈焰', 'Google 测试视频', 'https://storage.googleapis.com/gtv-videos-bucket/sample/images/ForBiggerBlazes.jpg', 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4', '测试', 15, '["1080p"]', '["测试","短片"]', 7.0, 30000, '2018-01-01')
ON CONFLICT (id) DO NOTHING;
