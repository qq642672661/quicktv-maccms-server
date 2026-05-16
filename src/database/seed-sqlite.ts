import { getSQLiteDB } from './sqlite';
import { logger } from '../utils/logger';

export async function seedTestData() {
  const db = await getSQLiteDB();

  try {
    const existingChannels = await db.get('SELECT COUNT(*) as count FROM live_channels');
    if (existingChannels.count > 0) {
      logger.info('⏭️  测试数据已存在，跳过初始化');
      return;
    }

    logger.info('🌱 开始初始化测试数据...');

    const liveChannels = [
      { name: 'CCTV-1 综合', logo: 'https://via.placeholder.com/150?text=CCTV1', stream_url: 'http://example.com/cctv1.m3u8', category: '央视', sort_order: 1 },
      { name: 'CCTV-2 财经', logo: 'https://via.placeholder.com/150?text=CCTV2', stream_url: 'http://example.com/cctv2.m3u8', category: '央视', sort_order: 2 },
      { name: 'CCTV-3 综艺', logo: 'https://via.placeholder.com/150?text=CCTV3', stream_url: 'http://example.com/cctv3.m3u8', category: '央视', sort_order: 3 },
      { name: 'CCTV-5 体育', logo: 'https://via.placeholder.com/150?text=CCTV5', stream_url: 'http://example.com/cctv5.m3u8', category: '央视', sort_order: 4 },
      { name: 'CCTV-6 电影', logo: 'https://via.placeholder.com/150?text=CCTV6', stream_url: 'http://example.com/cctv6.m3u8', category: '央视', sort_order: 5 },
      { name: '湖南卫视', logo: 'https://via.placeholder.com/150?text=HNTV', stream_url: 'http://example.com/hunantv.m3u8', category: '卫视', sort_order: 6 },
      { name: '浙江卫视', logo: 'https://via.placeholder.com/150?text=ZJTV', stream_url: 'http://example.com/zhejiangtv.m3u8', category: '卫视', sort_order: 7 },
      { name: '江苏卫视', logo: 'https://via.placeholder.com/150?text=JSTV', stream_url: 'http://example.com/jiangsutv.m3u8', category: '卫视', sort_order: 8 },
      { name: '东方卫视', logo: 'https://via.placeholder.com/150?text=DFTV', stream_url: 'http://example.com/dongfangtv.m3u8', category: '卫视', sort_order: 9 },
      { name: '北京卫视', logo: 'https://via.placeholder.com/150?text=BJTV', stream_url: 'http://example.com/beijingtv.m3u8', category: '卫视', sort_order: 10 }
    ];

    for (const channel of liveChannels) {
      const result = await db.run(
        'INSERT INTO live_channels (name, logo, stream_url, category, sort_order) VALUES (?, ?, ?, ?, ?)',
        [channel.name, channel.logo, channel.stream_url, channel.category, channel.sort_order]
      );
      
      await db.run(
        'INSERT INTO live_view_stats (channel_id, viewer_count, total_views) VALUES (?, 0, 0)',
        [result.lastID]
      );
    }

    const vodContent = [
      { title: '测试视频1 - 动作片', description: '精彩动作大片', cover_image: 'https://via.placeholder.com/300x400?text=Movie1', video_url: 'http://example.com/movie1.mp4', category: '电影', duration: 7200, resolution: '1080p' },
      { title: '测试视频2 - 喜剧片', description: '爆笑喜剧', cover_image: 'https://via.placeholder.com/300x400?text=Movie2', video_url: 'http://example.com/movie2.mp4', category: '电影', duration: 5400, resolution: '720p' },
      { title: '测试视频3 - 电视剧', description: '热门电视剧', cover_image: 'https://via.placeholder.com/300x400?text=TV1', video_url: 'http://example.com/tv1.mp4', category: '电视剧', duration: 2700, resolution: '1080p' },
      { title: '测试视频4 - 纪录片', description: '自然纪录片', cover_image: 'https://via.placeholder.com/300x400?text=Doc1', video_url: 'http://example.com/doc1.mp4', category: '纪录片', duration: 3600, resolution: '4K' },
      { title: '测试视频5 - 综艺', description: '娱乐综艺节目', cover_image: 'https://via.placeholder.com/300x400?text=Show1', video_url: 'http://example.com/show1.mp4', category: '综艺', duration: 4500, resolution: '1080p' }
    ];

    for (const vod of vodContent) {
      await db.run(
        'INSERT INTO vod_content (title, description, cover_image, video_url, category, duration, resolution) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [vod.title, vod.description, vod.cover_image, vod.video_url, vod.category, vod.duration, vod.resolution]
      );
    }

    logger.info('✅ 测试数据初始化完成');
    logger.info(`   - ${liveChannels.length} 个直播频道`);
    logger.info(`   - ${vodContent.length} 个点播视频`);
  } catch (error) {
    logger.error('❌ 测试数据初始化失败:', error);
    throw error;
  }
}
