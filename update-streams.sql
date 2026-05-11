-- Update live channels with real HLS streams
-- Clear existing data
TRUNCATE TABLE live_channels CASCADE;

-- Insert real HLS live streams
INSERT INTO live_channels (id, name, logo, stream_url, category, status, quality, description, tags, sort_order, viewer_count) VALUES
('ch001', 'Big Buck Bunny Test', 'https://peach.blender.org/wp-content/uploads/bbb-splash.png', 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8', 'Test', 'online', '["1080p","720p","480p"]', 'Classic animation', '["test","animation"]', 1, 1500),
('ch002', 'Sintel HD', 'https://durian.blender.org/wp-content/uploads/2010/06/sintel_trailer_1080p.jpg', 'https://bitdash-a.akamaihd.net/content/sintel/hls/playlist.m3u8', 'Test', 'online', '["1080p","720p"]', 'Blender animation', '["test","animation"]', 2, 1200),
('ch003', 'Tears of Steel 4K', 'https://mango.blender.org/wp-content/uploads/2013/05/01_thom_celia_bridge.jpg', 'https://demo.unified-streaming.com/k8s/features/stable/video/tears-of-steel/tears-of-steel.ism/.m3u8', 'Test', 'online', '["4K","1080p","720p"]', 'Blender sci-fi', '["test","sci-fi"]', 3, 2000),
('ch004', 'Apple HLS Test', 'https://developer.apple.com/streaming/images/streaming-hero-large.jpg', 'https://devstreaming-cdn.apple.com/videos/streaming/examples/img_bipbop_adv_example_fmp4/master.m3u8', 'Official', 'online', '["1080p","720p","480p"]', 'Apple HLS example', '["test","official"]', 4, 1800),
('ch005', 'Wowza Live Test', 'https://www.wowza.com/wp-content/uploads/wowza-logo.png', 'https://cph-p2p-msl.akamaized.net/hls/live/2000341/test/master.m3u8', 'Live', 'online', '["720p","480p"]', 'Wowza test stream', '["test","live"]', 5, 900);

-- Insert view stats
INSERT INTO live_view_stats (channel_id, viewer_count, peak_viewers, total_views, avg_watch_time) VALUES
('ch001', 1500, 2500, 150000, 1800),
('ch002', 1200, 2000, 120000, 2100),
('ch003', 2000, 3500, 200000, 2400),
('ch004', 1800, 2800, 180000, 1900),
('ch005', 900, 1500, 90000, 1500);

-- Insert VOD videos
INSERT INTO videos (id, title, description, poster, video_url, category, duration, quality, tags, rating, view_count, release_date) VALUES
('v001', 'Big Buck Bunny', 'Classic animation short', 'https://peach.blender.org/wp-content/uploads/bbb-splash.png', 'https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4', 'Animation', 596, '["1080p"]', '["animation","comedy"]', 8.5, 50000, '2008-04-10'),
('v002', 'Sintel', 'Dragon story', 'https://durian.blender.org/wp-content/uploads/2010/06/sintel_trailer_1080p.jpg', 'https://storage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4', 'Animation', 888, '["1080p"]', '["animation","fantasy"]', 9.0, 80000, '2010-09-30'),
('v003', 'Tears of Steel', 'Sci-fi short', 'https://mango.blender.org/wp-content/uploads/2013/05/01_thom_celia_bridge.jpg', 'https://storage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4', 'Sci-Fi', 734, '["1080p"]', '["sci-fi","action"]', 8.8, 120000, '2012-09-26'),
('v004', 'Elephant Dream', 'First Blender movie', 'https://orange.blender.org/wp-content/themes/orange/images/media/s1_proog.jpg', 'https://storage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4', 'Animation', 654, '["720p"]', '["animation","art"]', 7.5, 60000, '2006-03-24'),
('v005', 'For Bigger Blazes', 'Google test video', 'https://storage.googleapis.com/gtv-videos-bucket/sample/images/ForBiggerBlazes.jpg', 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4', 'Test', 15, '["1080p"]', '["test"]', 7.0, 30000, '2018-01-01')
ON CONFLICT (id) DO NOTHING;
