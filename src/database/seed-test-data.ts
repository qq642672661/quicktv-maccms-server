import db from './index';
import logger from '../utils/logger';
import { v4 as uuidv4 } from 'uuid';

async function seedTestData() {
  try {
    logger.info('开始添加测试数据...');

    logger.info('添加测试直播频道...');
    const liveChannels = [
      {
        id: uuidv4(),
        name: 'CCTV-1综合',
        logo: 'https://epg.112114.xyz/logo/CCTV1.png',
        stream_url: 'http://39.134.24.162/dbiptv.sn.chinamobile.com/PLTV/88888890/224/3221226231/index.m3u8',
        category: '央视频道',
        status: 'online',
        quality: JSON.stringify(['1080p', '720p', '480p']),
        description: 'CCTV-1综合频道',
        tags: JSON.stringify(['央视', '综合', '新闻']),
        sort_order: 1
      },
      {
        id: uuidv4(),
        name: 'CCTV-2财经',
        logo: 'https://epg.112114.xyz/logo/CCTV2.png',
        stream_url: 'http://39.134.24.161/dbiptv.sn.chinamobile.com/PLTV/88888890/224/3221226195/index.m3u8',
        category: '央视频道',
        status: 'online',
        quality: JSON.stringify(['1080p', '720p', '480p']),
        description: 'CCTV-2财经频道',
        tags: JSON.stringify(['央视', '财经', '经济']),
        sort_order: 2
      },
      {
        id: uuidv4(),
        name: 'CCTV-3综艺',
        logo: 'https://epg.112114.xyz/logo/CCTV3.png',
        stream_url: 'http://39.134.24.166/dbiptv.sn.chinamobile.com/PLTV/88888890/224/3221226397/index.m3u8',
        category: '央视频道',
        status: 'online',
        quality: JSON.stringify(['1080p', '720p', '480p']),
        description: 'CCTV-3综艺频道',
        tags: JSON.stringify(['央视', '综艺', '娱乐']),
        sort_order: 3
      },
      {
        id: uuidv4(),
        name: 'CCTV-5体育',
        logo: 'https://epg.112114.xyz/logo/CCTV5.png',
        stream_url: 'http://39.134.24.161/dbiptv.sn.chinamobile.com/PLTV/88888890/224/3221226395/index.m3u8',
        category: '央视频道',
        status: 'online',
        quality: JSON.stringify(['1080p', '720p', '480p']),
        description: 'CCTV-5体育频道',
        tags: JSON.stringify(['央视', '体育', '赛事']),
        sort_order: 4
      },
      {
        id: uuidv4(),
        name: 'CCTV-6电影',
        logo: 'https://epg.112114.xyz/logo/CCTV6.png',
        stream_url: 'http://39.134.24.166/dbiptv.sn.chinamobile.com/PLTV/88888890/224/3221226393/index.m3u8',
        category: '央视频道',
        status: 'online',
        quality: JSON.stringify(['1080p', '720p', '480p']),
        description: 'CCTV-6电影频道',
        tags: JSON.stringify(['央视', '电影', '影视']),
        sort_order: 5
      },
      {
        id: uuidv4(),
        name: '湖南卫视',
        logo: 'https://epg.112114.xyz/logo/湖南卫视.png',
        stream_url: 'http://39.134.24.161/dbiptv.sn.chinamobile.com/PLTV/88888890/224/3221225799/index.m3u8',
        category: '卫视频道',
        status: 'online',
        quality: JSON.stringify(['1080p', '720p', '480p']),
        description: '湖南卫视',
        tags: JSON.stringify(['卫视', '综艺', '娱乐']),
        sort_order: 6
      },
      {
        id: uuidv4(),
        name: '浙江卫视',
        logo: 'https://epg.112114.xyz/logo/浙江卫视.png',
        stream_url: 'http://39.134.24.162/dbiptv.sn.chinamobile.com/PLTV/88888890/224/3221225798/index.m3u8',
        category: '卫视频道',
        status: 'online',
        quality: JSON.stringify(['1080p', '720p', '480p']),
        description: '浙江卫视',
        tags: JSON.stringify(['卫视', '综艺', '娱乐']),
        sort_order: 7
      },
      {
        id: uuidv4(),
        name: '江苏卫视',
        logo: 'https://epg.112114.xyz/logo/江苏卫视.png',
        stream_url: 'http://39.134.24.166/dbiptv.sn.chinamobile.com/PLTV/88888890/224/3221225800/index.m3u8',
        category: '卫视频道',
        status: 'online',
        quality: JSON.stringify(['1080p', '720p', '480p']),
        description: '江苏卫视',
        tags: JSON.stringify(['卫视', '综艺', '娱乐']),
        sort_order: 8
      },
      {
        id: uuidv4(),
        name: '东方卫视',
        logo: 'https://epg.112114.xyz/logo/东方卫视.png',
        stream_url: 'http://39.134.24.161/dbiptv.sn.chinamobile.com/PLTV/88888890/224/3221225797/index.m3u8',
        category: '卫视频道',
        status: 'online',
        quality: JSON.stringify(['1080p', '720p', '480p']),
        description: '东方卫视',
        tags: JSON.stringify(['卫视', '综艺', '娱乐']),
        sort_order: 9
      },
      {
        id: uuidv4(),
        name: '北京卫视',
        logo: 'https://epg.112114.xyz/logo/北京卫视.png',
        stream_url: 'http://39.134.24.162/dbiptv.sn.chinamobile.com/PLTV/88888890/224/3221225796/index.m3u8',
        category: '卫视频道',
        status: 'online',
        quality: JSON.stringify(['1080p', '720p', '480p']),
        description: '北京卫视',
        tags: JSON.stringify(['卫视', '综艺', '娱乐']),
        sort_order: 10
      }
    ];

    for (const channel of liveChannels) {
      await db.query(`
        INSERT INTO live_channels (id, name, logo, stream_url, category, status, quality, description, tags, sort_order)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        ON CONFLICT (id) DO NOTHING
      `, [
        channel.id,
        channel.name,
        channel.logo,
        channel.stream_url,
        channel.category,
        channel.status,
        channel.quality,
        channel.description,
        channel.tags,
        channel.sort_order
      ]);

      await db.query(`
        INSERT INTO live_view_stats (channel_id, viewer_count, peak_viewers, total_views)
        VALUES ($1, 0, 0, 0)
        ON CONFLICT (channel_id) DO NOTHING
      `, [channel.id]);
    }

    logger.info(`已添加 ${liveChannels.length} 个测试直播频道`);

    logger.info('添加测试点播内容...');
    const vodContent = [
      {
        id: uuidv4(),
        title: '测试视频1 - 短片',
        description: '测试用短视频，用于验证播放器基本功能',
        cover_url: 'https://img.mtime.cn/mg/2019/03/21/153853.jpg',
        video_url: 'http://vfx.mtime.cn/Video/2019/03/21/mp4/190321153853126488.mp4',
        category: '测试短片',
        duration: 120,
        quality: JSON.stringify(['720p']),
        tags: JSON.stringify(['测试', '短片']),
        rating: 8.5,
        view_count: 0
      },
      {
        id: uuidv4(),
        title: '测试视频2 - 高清',
        description: '高清测试视频，用于验证高清播放能力',
        cover_url: 'https://img.mtime.cn/mg/2019/03/19/212559.jpg',
        video_url: 'http://vfx.mtime.cn/Video/2019/03/19/mp4/190319212559089721.mp4',
        category: '测试短片',
        duration: 180,
        quality: JSON.stringify(['1080p', '720p']),
        tags: JSON.stringify(['测试', '高清']),
        rating: 8.8,
        view_count: 0
      },
      {
        id: uuidv4(),
        title: '测试视频3 - 4K',
        description: '4K测试视频，用于验证4K播放能力',
        cover_url: 'https://img.mtime.cn/mg/2019/03/18/231014.jpg',
        video_url: 'http://vfx.mtime.cn/Video/2019/03/18/mp4/190318231014076505.mp4',
        category: '测试短片',
        duration: 150,
        quality: JSON.stringify(['4K', '1080p', '720p']),
        tags: JSON.stringify(['测试', '4K', '超清']),
        rating: 9.0,
        view_count: 0
      },
      {
        id: uuidv4(),
        title: '测试视频4 - 长视频',
        description: '长视频测试，用于验证长时间播放稳定性',
        cover_url: 'https://img.mtime.cn/mg/2019/03/14/223540.jpg',
        video_url: 'http://vfx.mtime.cn/Video/2019/03/14/mp4/190314223540373995.mp4',
        category: '测试长片',
        duration: 600,
        quality: JSON.stringify(['1080p', '720p', '480p']),
        tags: JSON.stringify(['测试', '长片', '稳定性']),
        rating: 8.2,
        view_count: 0
      },
      {
        id: uuidv4(),
        title: '测试视频5 - 网络测试',
        description: '网络稳定性测试视频',
        cover_url: 'https://img.mtime.cn/mg/2019/03/13/094901.jpg',
        video_url: 'http://vfx.mtime.cn/Video/2019/03/13/mp4/190313094901111138.mp4',
        category: '测试短片',
        duration: 90,
        quality: JSON.stringify(['720p', '480p']),
        tags: JSON.stringify(['测试', '网络']),
        rating: 8.0,
        view_count: 0
      }
    ];

    logger.info('测试数据添加完成！');
    logger.info(`- 直播频道: ${liveChannels.length} 个`);
    logger.info(`- 点播内容: ${vodContent.length} 个`);
    
    process.exit(0);
  } catch (error) {
    logger.error('添加测试数据失败:', error);
    process.exit(1);
  }
}

seedTestData();
