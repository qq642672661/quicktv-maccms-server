import { Pool } from 'pg';
import { v4 as uuidv4 } from 'uuid';
import * as fs from 'fs';
import * as path from 'path';

interface MockLiveSource {
  id: string;
  name: string;
  url: string;
  category: string;
  logo: string;
}

interface MockVodSource {
  id: string;
  name: string;
  url: string;
  category: string;
  poster: string;
  duration: number;
  description: string;
}

interface MockM3uSource {
  id: string;
  name: string;
  url: string;
  description: string;
  type: string;
}

interface MockMacCmsApi {
  id: string;
  name: string;
  url: string;
  description: string;
  type: string;
}

interface MigrationStats {
  categories: number;
  liveChannels: number;
  videos: number;
  m3uSources: number;
  macCmsApis: number;
  errors: string[];
}

class DataMigration {
  private pool: Pool;
  private stats: MigrationStats = {
    categories: 0,
    liveChannels: 0,
    videos: 0,
    m3uSources: 0,
    macCmsApis: 0,
    errors: []
  };

  constructor(connectionString: string) {
    this.pool = new Pool({
      connectionString,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    });
  }

  async connect(): Promise<void> {
    try {
      await this.pool.query('SELECT NOW()');
      console.log('✅ 数据库连接成功');
    } catch (error) {
      console.error('❌ 数据库连接失败:', error);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    await this.pool.end();
    console.log('✅ 数据库连接已关闭');
  }

  async loadMockData(): Promise<{
    liveChannels: MockLiveSource[];
    vodContent: MockVodSource[];
    m3uSources: MockM3uSource[];
    macCmsApis: MockMacCmsApi[];
  }> {
    console.log('📥 加载Mock数据...');

    const testLiveSources: MockLiveSource[] = [
      {
        id: 'test_live_1',
        name: 'CCTV-1综合',
        url: 'http://39.134.24.162/dbiptv.sn.chinamobile.com/PLTV/88888890/224/3221226231/index.m3u8',
        category: '央视频道',
        logo: 'https://epg.112114.xyz/logo/CCTV1.png'
      },
      {
        id: 'test_live_2',
        name: 'CCTV-2财经',
        url: 'http://39.134.24.161/dbiptv.sn.chinamobile.com/PLTV/88888890/224/3221226195/index.m3u8',
        category: '央视频道',
        logo: 'https://epg.112114.xyz/logo/CCTV2.png'
      },
      {
        id: 'test_live_3',
        name: 'CCTV-3综艺',
        url: 'http://39.134.24.166/dbiptv.sn.chinamobile.com/PLTV/88888890/224/3221226397/index.m3u8',
        category: '央视频道',
        logo: 'https://epg.112114.xyz/logo/CCTV3.png'
      },
      {
        id: 'test_live_4',
        name: 'CCTV-4中文国际',
        url: 'http://39.134.24.162/dbiptv.sn.chinamobile.com/PLTV/88888890/224/3221226191/index.m3u8',
        category: '央视频道',
        logo: 'https://epg.112114.xyz/logo/CCTV4.png'
      },
      {
        id: 'test_live_5',
        name: 'CCTV-5体育',
        url: 'http://39.134.24.161/dbiptv.sn.chinamobile.com/PLTV/88888890/224/3221226395/index.m3u8',
        category: '央视频道',
        logo: 'https://epg.112114.xyz/logo/CCTV5.png'
      },
      {
        id: 'test_live_6',
        name: 'CCTV-6电影',
        url: 'http://39.134.24.166/dbiptv.sn.chinamobile.com/PLTV/88888890/224/3221226393/index.m3u8',
        category: '央视频道',
        logo: 'https://epg.112114.xyz/logo/CCTV6.png'
      },
      {
        id: 'test_live_7',
        name: '湖南卫视',
        url: 'http://39.134.24.161/dbiptv.sn.chinamobile.com/PLTV/88888890/224/3221225799/index.m3u8',
        category: '卫视频道',
        logo: 'https://epg.112114.xyz/logo/湖南卫视.png'
      },
      {
        id: 'test_live_8',
        name: '浙江卫视',
        url: 'http://39.134.24.162/dbiptv.sn.chinamobile.com/PLTV/88888890/224/3221225798/index.m3u8',
        category: '卫视频道',
        logo: 'https://epg.112114.xyz/logo/浙江卫视.png'
      },
      {
        id: 'test_live_9',
        name: '江苏卫视',
        url: 'http://39.134.24.166/dbiptv.sn.chinamobile.com/PLTV/88888890/224/3221225800/index.m3u8',
        category: '卫视频道',
        logo: 'https://epg.112114.xyz/logo/江苏卫视.png'
      },
      {
        id: 'test_live_10',
        name: '东方卫视',
        url: 'http://39.134.24.161/dbiptv.sn.chinamobile.com/PLTV/88888890/224/3221225797/index.m3u8',
        category: '卫视频道',
        logo: 'https://epg.112114.xyz/logo/东方卫视.png'
      }
    ];

    const testVodSources: MockVodSource[] = [
      {
        id: 'test_vod_1',
        name: '测试视频1 - 短片',
        url: 'http://vfx.mtime.cn/Video/2019/03/21/mp4/190321153853126488.mp4',
        category: '测试短片',
        poster: 'https://img.mtime.cn/mg/2019/03/21/153853.jpg',
        duration: 120,
        description: '测试用短视频，用于验证播放器基本功能'
      },
      {
        id: 'test_vod_2',
        name: '测试视频2 - 高清',
        url: 'http://vfx.mtime.cn/Video/2019/03/19/mp4/190319212559089721.mp4',
        category: '测试短片',
        poster: 'https://img.mtime.cn/mg/2019/03/19/212559.jpg',
        duration: 180,
        description: '高清测试视频，用于验证高清播放能力'
      },
      {
        id: 'test_vod_3',
        name: '测试视频3 - 4K',
        url: 'http://vfx.mtime.cn/Video/2019/03/18/mp4/190318231014076505.mp4',
        category: '测试短片',
        poster: 'https://img.mtime.cn/mg/2019/03/18/231014.jpg',
        duration: 150,
        description: '4K测试视频，用于验证4K播放能力'
      },
      {
        id: 'test_vod_4',
        name: '测试视频4 - 长视频',
        url: 'http://vfx.mtime.cn/Video/2019/03/14/mp4/190314223540373995.mp4',
        category: '测试长片',
        poster: 'https://img.mtime.cn/mg/2019/03/14/223540.jpg',
        duration: 600,
        description: '长视频测试，用于验证长时间播放稳定性'
      },
      {
        id: 'test_vod_5',
        name: '测试视频5 - 网络测试',
        url: 'http://vfx.mtime.cn/Video/2019/03/13/mp4/190313094901111138.mp4',
        category: '测试短片',
        poster: 'https://img.mtime.cn/mg/2019/03/13/094901.jpg',
        duration: 90,
        description: '网络稳定性测试视频'
      }
    ];

    const testM3uSources: MockM3uSource[] = [
      {
        id: 'm3u_source_1',
        name: 'GitHub IPTV-ORG 直播源',
        url: 'https://live.zbds.top/tv/iptv4.m3u',
        description: '来自 vbskycn/iptv 项目，每6小时自动更新，包含央视、卫视等频道',
        type: 'm3u'
      },
      {
        id: 'm3u_source_2',
        name: 'fanmingming 直播源',
        url: 'https://live.fanmingming.cn/tv/m3u/ipv6.m3u',
        description: '范明明维护的 IPv6 直播源，稳定可靠',
        type: 'm3u'
      },
      {
        id: 'm3u_source_3',
        name: 'YanG-1989 综合直播源',
        url: 'https://tv.iill.top/m3u/Gather',
        description: '综合直播源，支持 IPv4/IPv6，带 EPG 和台标',
        type: 'm3u'
      }
    ];

    const testMacCmsApis: MockMacCmsApi[] = [
      {
        id: 'maccms_api_1',
        name: '速播资源站',
        url: 'https://www.subo988.com/api.php/provide/vod/',
        description: '速播资源站 - 提供电影、电视剧、综艺等内容',
        type: 'maccms'
      },
      {
        id: 'maccms_api_2',
        name: '红牛资源站',
        url: 'https://www.hongniuzy2.com/api.php/provide/vod/',
        description: '红牛资源站 - 高清影视资源',
        type: 'maccms'
      },
      {
        id: 'maccms_api_3',
        name: '飞速资源站',
        url: 'https://www.feisuzyapi.com/api.php/provide/vod/',
        description: '飞速资源站 - 更新快速的影视资源',
        type: 'maccms'
      },
      {
        id: 'maccms_api_4',
        name: '光速资源站',
        url: 'https://api.guangsuapi.com/api.php/provide/vod/',
        description: '光速资源站 - 稳定的影视接口',
        type: 'maccms'
      },
      {
        id: 'maccms_api_5',
        name: '新浪资源站',
        url: 'https://api.xinlangapi.com/xinlangapi.php/provide/vod/',
        description: '新浪资源站 - 综合影视资源',
        type: 'maccms'
      }
    ];

    console.log(`✅ Mock数据加载完成: ${testLiveSources.length}个直播频道, ${testVodSources.length}个视频`);

    return {
      liveChannels: testLiveSources,
      vodContent: testVodSources,
      m3uSources: testM3uSources,
      macCmsApis: testMacCmsApis
    };
  }

  async migrateCategories(vodContent: MockVodSource[]): Promise<Map<string, number>> {
    console.log('\n📂 开始迁移分类数据...');
    const client = await this.pool.connect();
    const categoryMap = new Map<string, number>();

    try {
      await client.query('BEGIN');

      const uniqueCategories = [...new Set(vodContent.map(v => v.category))];

      for (const categoryName of uniqueCategories) {
        const slug = categoryName.toLowerCase().replace(/\s+/g, '-');
        
        const result = await client.query(
          `INSERT INTO categories (name, slug, description, sort_order, is_active)
           VALUES ($1, $2, $3, $4, $5)
           ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name
           RETURNING id`,
          [categoryName, slug, `${categoryName}分类`, 0, true]
        );

        categoryMap.set(categoryName, result.rows[0].id);
        this.stats.categories++;
      }

      await client.query('COMMIT');
      console.log(`✅ 分类迁移完成: ${this.stats.categories}个分类`);
    } catch (error) {
      await client.query('ROLLBACK');
      const errorMsg = `分类迁移失败: ${error}`;
      console.error(`❌ ${errorMsg}`);
      this.stats.errors.push(errorMsg);
      throw error;
    } finally {
      client.release();
    }

    return categoryMap;
  }

  async migrateLiveChannels(liveChannels: MockLiveSource[]): Promise<void> {
    console.log('\n📺 开始迁移直播频道数据...');
    const client = await this.pool.connect();

    try {
      await client.query('BEGIN');

      for (const channel of liveChannels) {
        const id = uuidv4();
        
        await client.query(
          `INSERT INTO live_channels (id, name, logo, stream_url, category, status, quality, description, tags, sort_order, viewer_count)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
           ON CONFLICT (id) DO NOTHING`,
          [
            id,
            channel.name,
            channel.logo,
            channel.url,
            channel.category,
            'online',
            JSON.stringify(['高清', '标清']),
            `${channel.name} - ${channel.category}`,
            JSON.stringify([channel.category]),
            0,
            0
          ]
        );

        this.stats.liveChannels++;
      }

      await client.query('COMMIT');
      console.log(`✅ 直播频道迁移完成: ${this.stats.liveChannels}个频道`);
    } catch (error) {
      await client.query('ROLLBACK');
      const errorMsg = `直播频道迁移失败: ${error}`;
      console.error(`❌ ${errorMsg}`);
      this.stats.errors.push(errorMsg);
      throw error;
    } finally {
      client.release();
    }
  }

  async migrateVodContent(vodContent: MockVodSource[], categoryMap: Map<string, number>): Promise<void> {
    console.log('\n🎬 开始迁移点播视频数据...');
    const client = await this.pool.connect();

    try {
      await client.query('BEGIN');

      for (const video of vodContent) {
        const categoryId = categoryMap.get(video.category);
        
        await client.query(
          `INSERT INTO videos (title, description, category_id, cover_image, video_url, duration, resolution, view_count, status, is_featured, is_recommended, published_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
          [
            video.name,
            video.description,
            categoryId,
            video.poster,
            video.url,
            video.duration,
            '高清',
            0,
            'published',
            false,
            false,
            new Date()
          ]
        );

        this.stats.videos++;
      }

      await client.query('COMMIT');
      console.log(`✅ 视频迁移完成: ${this.stats.videos}个视频`);
    } catch (error) {
      await client.query('ROLLBACK');
      const errorMsg = `视频迁移失败: ${error}`;
      console.error(`❌ ${errorMsg}`);
      this.stats.errors.push(errorMsg);
      throw error;
    } finally {
      client.release();
    }
  }

  async migrateDataSources(m3uSources: MockM3uSource[], macCmsApis: MockMacCmsApi[]): Promise<void> {
    console.log('\n🔗 开始迁移数据源配置...');
    const client = await this.pool.connect();

    try {
      await client.query('BEGIN');

      await client.query(`
        CREATE TABLE IF NOT EXISTS data_sources (
          id SERIAL PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          type VARCHAR(50) NOT NULL,
          url TEXT NOT NULL,
          description TEXT,
          is_active BOOLEAN DEFAULT TRUE,
          last_sync_at TIMESTAMP,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);

      for (const source of m3uSources) {
        await client.query(
          `INSERT INTO data_sources (name, type, url, description, is_active)
           VALUES ($1, $2, $3, $4, $5)`,
          [source.name, source.type, source.url, source.description, true]
        );
        this.stats.m3uSources++;
      }

      for (const api of macCmsApis) {
        await client.query(
          `INSERT INTO data_sources (name, type, url, description, is_active)
           VALUES ($1, $2, $3, $4, $5)`,
          [api.name, api.type, api.url, api.description, true]
        );
        this.stats.macCmsApis++;
      }

      await client.query('COMMIT');
      console.log(`✅ 数据源迁移完成: ${this.stats.m3uSources}个M3U源, ${this.stats.macCmsApis}个MacCMS API`);
    } catch (error) {
      await client.query('ROLLBACK');
      const errorMsg = `数据源迁移失败: ${error}`;
      console.error(`❌ ${errorMsg}`);
      this.stats.errors.push(errorMsg);
      throw error;
    } finally {
      client.release();
    }
  }

  async validateMigration(): Promise<boolean> {
    console.log('\n🔍 验证迁移结果...');
    
    try {
      const categoriesResult = await this.pool.query('SELECT COUNT(*) FROM categories');
      const liveResult = await this.pool.query('SELECT COUNT(*) FROM live_channels');
      const videosResult = await this.pool.query('SELECT COUNT(*) FROM videos');
      const sourcesResult = await this.pool.query('SELECT COUNT(*) FROM data_sources');

      const categoriesCount = parseInt(categoriesResult.rows[0].count);
      const liveCount = parseInt(liveResult.rows[0].count);
      const videosCount = parseInt(videosResult.rows[0].count);
      const sourcesCount = parseInt(sourcesResult.rows[0].count);

      console.log('\n📊 迁移统计:');
      console.log(`  - 分类: ${categoriesCount}个`);
      console.log(`  - 直播频道: ${liveCount}个`);
      console.log(`  - 视频: ${videosCount}个`);
      console.log(`  - 数据源: ${sourcesCount}个`);

      if (this.stats.errors.length > 0) {
        console.log('\n⚠️  迁移过程中出现错误:');
        this.stats.errors.forEach((error, index) => {
          console.log(`  ${index + 1}. ${error}`);
        });
      }

      const isValid = categoriesCount > 0 && liveCount > 0 && videosCount > 0;
      
      if (isValid) {
        console.log('\n✅ 数据验证通过');
      } else {
        console.log('\n❌ 数据验证失败');
      }

      return isValid;
    } catch (error) {
      console.error('❌ 验证失败:', error);
      return false;
    }
  }

  async rollback(): Promise<void> {
    console.log('\n🔄 开始回滚迁移...');
    const client = await this.pool.connect();

    try {
      await client.query('BEGIN');
      
      await client.query('DELETE FROM videos WHERE maccms_id IS NULL');
      await client.query('DELETE FROM live_channels WHERE created_at > NOW() - INTERVAL \'1 hour\'');
      await client.query('DELETE FROM categories WHERE created_at > NOW() - INTERVAL \'1 hour\'');
      await client.query('DROP TABLE IF EXISTS data_sources');

      await client.query('COMMIT');
      console.log('✅ 回滚完成');
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('❌ 回滚失败:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  async run(): Promise<void> {
    console.log('🚀 开始数据迁移...\n');
    const startTime = Date.now();

    try {
      await this.connect();

      const mockData = await this.loadMockData();

      const categoryMap = await this.migrateCategories(mockData.vodContent);

      await this.migrateLiveChannels(mockData.liveChannels);

      await this.migrateVodContent(mockData.vodContent, categoryMap);

      await this.migrateDataSources(mockData.m3uSources, mockData.macCmsApis);

      const isValid = await this.validateMigration();

      const duration = ((Date.now() - startTime) / 1000).toFixed(2);
      
      if (isValid) {
        console.log(`\n🎉 数据迁移成功完成! 耗时: ${duration}秒`);
      } else {
        console.log(`\n⚠️  数据迁移完成但存在问题，请检查日志。耗时: ${duration}秒`);
      }

    } catch (error) {
      console.error('\n❌ 数据迁移失败:', error);
      throw error;
    } finally {
      await this.disconnect();
    }
  }

  getStats(): MigrationStats {
    return this.stats;
  }
}

async function main() {
  const connectionString = process.env.DATABASE_URL || 'postgresql://quicktv:quicktv123@localhost:5432/quicktv';
  
  const migration = new DataMigration(connectionString);

  try {
    await migration.run();
    
    const stats = migration.getStats();
    
    const reportPath = path.join(__dirname, '../../migration-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(stats, null, 2));
    console.log(`\n📄 迁移报告已保存到: ${reportPath}`);
    
    process.exit(0);
  } catch (error) {
    console.error('迁移失败:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

export { DataMigration, MigrationStats };
