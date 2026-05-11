-- 清空现有频道数据
TRUNCATE TABLE live_channels CASCADE;

-- 插入国内 CCTV 直播源
INSERT INTO live_channels (id, name, logo, stream_url, category, sort_order, status, created_at, updated_at) VALUES
(gen_random_uuid()::text, 'CCTV1', 'https://gitee.com/mytv-android/myTVlogo/raw/main/img/CCTV1.png', 'http://112.123.243.37:50085/tsfile/live/0001_1.m3u8?key=txiptv&playlive=0&authid=0', '央视频道', 1, 'online', NOW(), NOW()),
(gen_random_uuid()::text, 'CCTV2', 'https://gitee.com/mytv-android/myTVlogo/raw/main/img/CCTV2.png', 'http://112.123.243.37:50085/tsfile/live/0002_1.m3u8?key=txiptv&playlive=0&authid=0', '央视频道', 2, 'online', NOW(), NOW()),
(gen_random_uuid()::text, 'CCTV3', 'https://gitee.com/mytv-android/myTVlogo/raw/main/img/CCTV3.png', 'http://112.123.243.37:50085/tsfile/live/0003_1.m3u8?key=txiptv&playlive=0&authid=0', '央视频道', 3, 'online', NOW(), NOW()),
(gen_random_uuid()::text, 'CCTV4', 'https://gitee.com/mytv-android/myTVlogo/raw/main/img/CCTV4.png', 'http://112.123.243.37:50085/tsfile/live/0004_1.m3u8?key=txiptv&playlive=0&authid=0', '央视频道', 4, 'online', NOW(), NOW()),
(gen_random_uuid()::text, 'CCTV5', 'https://gitee.com/mytv-android/myTVlogo/raw/main/img/CCTV5.png', 'http://221.13.235.3:9901/tsfile/live/0005_1.m3u8?key=txiptv&playlive=1&authid=0', '体育频道', 5, 'online', NOW(), NOW()),
(gen_random_uuid()::text, 'CCTV5+', 'https://gitee.com/mytv-android/myTVlogo/raw/main/img/CCTV5+.png', 'http://112.123.243.37:50085/tsfile/live/0006_1.m3u8?key=txiptv&playlive=0&authid=0', '体育频道', 6, 'online', NOW(), NOW()),
(gen_random_uuid()::text, 'CCTV6', 'https://gitee.com/mytv-android/myTVlogo/raw/main/img/CCTV6.png', 'http://112.123.243.37:50085/tsfile/live/0007_1.m3u8?key=txiptv&playlive=0&authid=0', '央视频道', 7, 'online', NOW(), NOW()),
(gen_random_uuid()::text, 'CCTV7', 'https://gitee.com/mytv-android/myTVlogo/raw/main/img/CCTV7.png', 'http://112.123.243.37:50085/tsfile/live/0008_1.m3u8?key=txiptv&playlive=0&authid=0', '央视频道', 8, 'online', NOW(), NOW()),
(gen_random_uuid()::text, 'CCTV8', 'https://gitee.com/mytv-android/myTVlogo/raw/main/img/CCTV8.png', 'http://112.123.243.37:50085/tsfile/live/0009_1.m3u8?key=txiptv&playlive=0&authid=0', '央视频道', 9, 'online', NOW(), NOW()),
(gen_random_uuid()::text, 'CCTV9', 'https://gitee.com/mytv-android/myTVlogo/raw/main/img/CCTV9.png', 'http://183.129.255.66:8480/hls/10/index.m3u8', '央视频道', 10, 'online', NOW(), NOW()),
(gen_random_uuid()::text, 'CCTV10', 'https://gitee.com/mytv-android/myTVlogo/raw/main/img/CCTV10.png', 'http://112.123.243.37:50085/tsfile/live/0011_1.m3u8?key=txiptv&playlive=0&authid=0', '央视频道', 11, 'online', NOW(), NOW()),
(gen_random_uuid()::text, 'CCTV11', 'https://gitee.com/mytv-android/myTVlogo/raw/main/img/CCTV11.png', 'http://112.123.243.37:50085/tsfile/live/0012_1.m3u8?key=txiptv&playlive=0&authid=0', '央视频道', 12, 'online', NOW(), NOW()),
(gen_random_uuid()::text, 'CCTV12', 'https://gitee.com/mytv-android/myTVlogo/raw/main/img/CCTV12.png', 'http://112.123.243.37:50085/tsfile/live/0013_1.m3u8?key=txiptv&playlive=0&authid=0', '央视频道', 13, 'online', NOW(), NOW()),
(gen_random_uuid()::text, 'CCTV13', 'https://gitee.com/mytv-android/myTVlogo/raw/main/img/CCTV13.png', 'http://221.13.235.3:9901/tsfile/live/0013_1.m3u8?key=txiptv&playlive=1&authid=0', '央视频道', 14, 'online', NOW(), NOW()),
(gen_random_uuid()::text, 'CCTV14', 'https://gitee.com/mytv-android/myTVlogo/raw/main/img/CCTV14.png', 'http://112.123.243.37:50085/tsfile/live/0015_1.m3u8?key=txiptv&playlive=0&authid=0', '少儿频道', 15, 'online', NOW(), NOW()),
(gen_random_uuid()::text, 'CCTV15', 'https://gitee.com/mytv-android/myTVlogo/raw/main/img/CCTV15.png', 'http://183.129.255.66:8480/hls/16/index.m3u8', '央视频道', 16, 'online', NOW(), NOW()),
(gen_random_uuid()::text, 'CCTV16', 'https://gitee.com/mytv-android/myTVlogo/raw/main/img/CCTV16.png', 'http://183.129.255.66:8480/hls/17/index.m3u8', '央视频道', 17, 'online', NOW(), NOW()),
(gen_random_uuid()::text, 'CCTV17', 'https://gitee.com/mytv-android/myTVlogo/raw/main/img/CCTV17.png', 'http://183.129.255.66:8480/hls/18/index.m3u8', '央视频道', 18, 'online', NOW(), NOW());

SELECT COUNT(*) as total_channels FROM live_channels;
