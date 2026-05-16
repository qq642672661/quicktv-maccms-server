/**
 * 数据迁移脚本 - SQLite版本
 * 用途：将Mock测试数据迁移到SQLite数据库
 * 功能：
 * 1. 迁移视频分类数据
 * 2. 迁移直播频道数据
 * 3. 迁移点播视频数据
 * 4. 迁移数据源配置（M3U源和MacCMS API）
 * 5. 数据验证和回滚功能
 *
 * 使用方法：
 * npm run migrate:mock
 * 或
 * ts-node src/database/migrate-mock-data-sqlite.ts
 */

import Database from 'better-sqlite3';
import { v4 as uuidv4 } from 'uuid';
import * as fs from 'fs';
import * as path from 'path';

// ==================== 类型定义 ====================

/**
 * Mock直播源数据结构
 */
interface MockLiveSource {
  id: string;          // 频道ID
  name: string;        // 频道名称
  url: string;         // 直播流URL
  category: string;    // 频道分类
  logo: string;        // 频道Logo
}

/**
 * Mock点播视频数据结构
 */
interface MockVodSource {
  id: string;          // 视频ID
  name: string;        // 视频名称
  url: string;         // 视频URL
  category: string;    // 视频分类
  poster: string;      // 封面图
  duration: number;    // 时长（秒）
  description: string; // 描述
}

/**
 * Mock M3U源数据结构
 */
interface MockM3uSource {
  id: string;          // 源ID
  name: string;        // 源名称
  url: string;         // M3U文件URL
  description: string; // 描述
  type: string;        // 类型（m3u）
}

/**
 * Mock MacCMS API数据结构
 */
interface MockMacCmsApi {
  id: string;          // API ID
  name: string;        // API名称
  url: string;         // API地址
  description: string; // 描述
  type: string;        // 类型（maccms）
}

/**
 * 迁移统计信息
 */
interface MigrationStats {
  categories: number;    // 迁移的分类数量
  liveChannels: number;  // 迁移的直播频道数量
  videos: number;        // 迁移的视频数量
  m3uSources: number;    // 迁移的M3U源数量
  macCmsApis: number;    // 迁移的MacCMS API数量
  errors: string[];      // 错误信息列表
}

// ==================== 数据迁移类 ====================

/**
 * 数据迁移管理类
 * 负责执行所有数据迁移操作
 */
class DataMigrationSQLite {
  private db: Database.Database;  // SQLite数据库连接
  private stats: MigrationStats = {
    categories: 0,
    liveChannels: 0,
    videos: 0,
    m3uSources: 0,
    macCmsApis: 0,
    errors: []
  };

  /**
   * 构造函数
   * @param dbPath - 数据库文件路径
   */
  constructor(dbPath: string) {
    // 初始化数据库连接
    this.db = new Database(dbPath);
    // 启用WAL模式，提高并发性能
    this.db.pragma('journal_mode = WAL');
    // 启用外键约束
    this.db.pragma('foreign_keys = ON');
  }

  /**
   * 关闭数据库连接
   */
  close(): void {
    this.db.close();
    console.log('✅ 数据库连接已关闭');
  }

  /**
   * 加载Mock测试数据
   * 返回预定义的测试数据，包括直播频道、视频、M3U源和MacCMS API
   * @returns Promise<Object> 包含所有测试数据的对象
   */
  async loadMockData(): Promise<{
    liveChannels: MockLiveSource[];
    vodContent: MockVodSource[];
    m3uSources: MockM3uSource[];
    macCmsApis: MockMacCmsApi[];
  }> {
    console.log('📥 加载Mock数据...');

    // 测试直播频道数据：包含央视和卫视频道
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

    // 测试点播视频数据：包含不同类型的测试视频
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

    // M3U直播源配置：来自GitHub的公开直播源
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

    // MacCMS资源站API配置：常用的影视资源接口
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

    // 输出加载的数据统计
    console.log(`✅ Mock数据加载完成: ${testLiveSources.length}个直播频道, ${testVodSources.length}个视频`);

    // 返回所有测试数据
    return {
      liveChannels: testLiveSources,
      vodContent: testVodSources,
      m3uSources: testM3uSources,
      macCmsApis: testMacCmsApis
    };
  }

  /**
   * 迁移分类数据
   * 从视频数据中提取唯一的分类，插入到categories表
   * @param vodContent - 视频数据数组
   * @returns Map<string, number> 分类名称到ID的映射
   */
  migrateCategories(vodContent: MockVodSource[]): Map<string, number> {
    console.log('\n📂 开始迁移分类数据...');
    const categoryMap = new Map<string, number>();

    try {
      // 从视频数据中提取所有唯一的分类名称
      const uniqueCategories = [...new Set(vodContent.map(v => v.category))];

      // 准备SQL语句：插入分类（如果不存在）
      const insertStmt = this.db.prepare(`
        INSERT OR IGNORE INTO categories (name, slug, description, sort_order, is_active, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, datetime('now'), datetime('now'))
      `);

      // 准备SQL语句：查询分类ID
      const selectStmt = this.db.prepare('SELECT id FROM categories WHERE slug = ?');

      // 使用事务批量插入，提高性能
      const transaction = this.db.transaction(() => {
        for (const categoryName of uniqueCategories) {
          // 生成URL友好的slug（小写，空格替换为连字符）
          const slug = categoryName.toLowerCase().replace(/\s+/g, '-');

          // 插入分类数据
          insertStmt.run(categoryName, slug, `${categoryName}分类`, 0, 1);

          // 查询插入后的分类ID
          const result = selectStmt.get(slug) as { id: number };
          // 保存分类名称到ID的映射
          categoryMap.set(categoryName, result.id);
          this.stats.categories++;
        }
      });

      // 执行事务
      transaction();

      console.log(`✅ 分类迁移完成: ${this.stats.categories}个分类`);
    } catch (error) {
      const errorMsg = `分类迁移失败: ${error}`;
      console.error(`❌ ${errorMsg}`);
      this.stats.errors.push(errorMsg);
      throw error;
    }

    return categoryMap;
  }

  /**
   * 迁移直播频道数据
   * 将直播频道信息插入到live_channels表
   * @param liveChannels - 直播频道数据数组
   */
  /**
   * 迁移直播频道数据
   * 将直播频道信息插入到live_channels表
   * @param liveChannels - 直播频道数据数组
   */
  migrateLiveChannels(liveChannels: MockLiveSource[]): void {
    console.log('\n📺 开始迁移直播频道数据...');

    try {
      // 准备SQL语句：插入频道（如果不存在）
      const insertStmt = this.db.prepare(`
        INSERT OR IGNORE INTO live_channels (id, name, logo, stream_url, category, status, quality, description, tags, sort_order, viewer_count, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
      `);

      // 使用事务批量插入
      const transaction = this.db.transaction(() => {
        for (const channel of liveChannels) {
          // 生成UUID作为频道ID
          const id = uuidv4();

          // 插入频道数据
          insertStmt.run(
            id,
            channel.name,
            channel.logo,
            channel.url,
            channel.category,
            'online',                                    // 状态：在线
            JSON.stringify(['高清', '标清']),            // 支持的清晰度
            `${channel.name} - ${channel.category}`,    // 描述
            JSON.stringify([channel.category]),          // 标签
            0,                                           // 排序
            0                                            // 观看人数
          );

          this.stats.liveChannels++;
        }
      });

      // 执行事务
      transaction();

      console.log(`✅ 直播频道迁移完成: ${this.stats.liveChannels}个频道`);
    } catch (error) {
      const errorMsg = `直播频道迁移失败: ${error}`;
      console.error(`❌ ${errorMsg}`);
      this.stats.errors.push(errorMsg);
      throw error;
    }
  }

  /**
   * 迁移点播视频数据
   * 将视频信息插入到videos表
   * @param vodContent - 视频数据数组
   * @param categoryMap - 分类名称到ID的映射
   */
  migrateVodContent(vodContent: MockVodSource[], categoryMap: Map<string, number>): void {
    console.log('\n🎬 开始迁移点播视频数据...');

    try {
      // 准备SQL语句：插入视频数据
      const insertStmt = this.db.prepare(`
        INSERT INTO videos (title, description, category_id, cover_image, video_url, duration, resolution, view_count, status, is_featured, is_recommended, published_at, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'), datetime('now'))
      `);

      // 使用事务批量插入
      const transaction = this.db.transaction(() => {
        for (const video of vodContent) {
          // 从映射中获取分类ID
          const categoryId = categoryMap.get(video.category);

          // 插入视频数据
          insertStmt.run(
            video.name,           // 标题
            video.description,    // 描述
            categoryId,           // 分类ID
            video.poster,         // 封面图
            video.url,            // 视频URL
            video.duration,       // 时长
            '高清',               // 分辨率
            0,                    // 观看次数
            'published',          // 状态：已发布
            0,                    // 是否特色
            0                     // 是否推荐
          );

          this.stats.videos++;
        }
      });

      // 执行事务
      transaction();

      console.log(`✅ 视频迁移完成: ${this.stats.videos}个视频`);
    } catch (error) {
      const errorMsg = `视频迁移失败: ${error}`;
      console.error(`❌ ${errorMsg}`);
      this.stats.errors.push(errorMsg);
      throw error;
    }
  }

  /**
   * 迁移数据源配置
   * 将M3U源和MacCMS API配置插入到data_sources表
   * @param m3uSources - M3U源数据数组
   * @param macCmsApis - MacCMS API数据数组
   */
  migrateDataSources(m3uSources: MockM3uSource[], macCmsApis: MockMacCmsApi[]): void {
    console.log('\n🔗 开始迁移数据源配置...');

    try {
      // 创建data_sources表（如果不存在）
      this.db.exec(`
        CREATE TABLE IF NOT EXISTS data_sources (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          type TEXT NOT NULL,
          url TEXT NOT NULL,
          description TEXT,
          is_active INTEGER DEFAULT 1,
          last_sync_at TEXT,
          created_at TEXT DEFAULT (datetime('now')),
          updated_at TEXT DEFAULT (datetime('now'))
        )
      `);

      // 准备SQL语句：插入数据源
      const insertStmt = this.db.prepare(`
        INSERT INTO data_sources (name, type, url, description, is_active)
        VALUES (?, ?, ?, ?, ?)
      `);

      // 使用事务批量插入
      const transaction = this.db.transaction(() => {
        // 插入M3U源
        for (const source of m3uSources) {
          insertStmt.run(source.name, source.type, source.url, source.description, 1);
          this.stats.m3uSources++;
        }

        // 插入MacCMS API
        for (const api of macCmsApis) {
          insertStmt.run(api.name, api.type, api.url, api.description, 1);
          this.stats.macCmsApis++;
        }
      });

      // 执行事务
      transaction();

      console.log(`✅ 数据源迁移完成: ${this.stats.m3uSources}个M3U源, ${this.stats.macCmsApis}个MacCMS API`);
    } catch (error) {
      const errorMsg = `数据源迁移失败: ${error}`;
      console.error(`❌ ${errorMsg}`);
      this.stats.errors.push(errorMsg);
      throw error;
    }
  }

  /**
   * 验证迁移结果
   * 检查数据库中的数据是否正确迁移
   * @returns boolean 验证是否通过
   */
  validateMigration(): boolean {
    console.log('\n🔍 验证迁移结果...');

    try {
      // 查询各表的记录数量
      const categoriesCount = this.db.prepare('SELECT COUNT(*) as count FROM categories').get() as { count: number };
      const liveCount = this.db.prepare('SELECT COUNT(*) as count FROM live_channels').get() as { count: number };
      const videosCount = this.db.prepare('SELECT COUNT(*) as count FROM videos').get() as { count: number };
      const sourcesCount = this.db.prepare('SELECT COUNT(*) as count FROM data_sources').get() as { count: number };

      // 输出迁移统计信息
      console.log('\n📊 迁移统计:');
      console.log(`  - 分类: ${categoriesCount.count}个`);
      console.log(`  - 直播频道: ${liveCount.count}个`);
      console.log(`  - 视频: ${videosCount.count}个`);
      console.log(`  - 数据源: ${sourcesCount.count}个`);

      // 如果有错误，输出错误信息
      if (this.stats.errors.length > 0) {
        console.log('\n⚠️  迁移过程中出现错误:');
        this.stats.errors.forEach((error, index) => {
          console.log(`  ${index + 1}. ${error}`);
        });
      }

      // 验证数据完整性：至少要有分类、频道和视频
      const isValid = categoriesCount.count > 0 && liveCount.count > 0 && videosCount.count > 0;

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

  /**
   * 回滚迁移
   * 删除本次迁移的所有数据，用于测试或出错时恢复
   * 注意：此操作不可逆，请谨慎使用
   */
  rollback(): void {
    console.log('\n🔄 开始回滚迁移...');

    try {
      // 使用事务执行回滚操作
      const transaction = this.db.transaction(() => {
        // 删除没有maccms_id的视频（即本次迁移的测试数据）
        this.db.exec('DELETE FROM videos WHERE maccms_id IS NULL');
        // 删除最近1小时内创建的直播频道
        this.db.exec(`DELETE FROM live_channels WHERE created_at > datetime('now', '-1 hour')`);
        // 删除最近1小时内创建的分类
        this.db.exec(`DELETE FROM categories WHERE created_at > datetime('now', '-1 hour')`);
        // 删除data_sources表
        this.db.exec('DROP TABLE IF EXISTS data_sources');
      });

      // 执行事务
      transaction();

      console.log('✅ 回滚完成');
    } catch (error) {
      console.error('❌ 回滚失败:', error);
      throw error;
    }
  }

  /**
   * 执行完整的迁移流程
   * 包括：加载数据 -> 迁移分类 -> 迁移频道 -> 迁移视频 -> 迁移数据源 -> 验证
   */
  async run(): Promise<void> {
    console.log('\n🚀 开始数据迁移...\n');

    const startTime = Date.now();

    try {
      // 步骤1：加载Mock测试数据
      const mockData = await this.loadMockData();

      // 步骤2：迁移分类数据（返回分类映射供后续使用）
      const categoryMap = this.migrateCategories(mockData.vodContent);

      // 步骤3：迁移直播频道数据
      this.migrateLiveChannels(mockData.liveChannels);

      // 步骤4：迁移点播视频数据
      this.migrateVodContent(mockData.vodContent, categoryMap);

      // 步骤5：迁移数据源配置
      this.migrateDataSources(mockData.m3uSources, mockData.macCmsApis);

      // 步骤6：验证迁移结果
      const isValid = this.validateMigration();

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
      this.close();
    }
  }

  getStats(): MigrationStats {
    return this.stats;
  }
}

// ==================== 主程序入口 ====================

/**
 * 主函数：执行数据迁移
 * 使用方式：ts-node src/database/migrate-mock-data-sqlite.ts
 */
async function main() {
  // 数据库文件路径（支持环境变量配置）
  const dbPath = process.env.SQLITE_DB_PATH || path.join(__dirname, '../../data/quicktv.db');

  console.log(`📁 数据库路径: ${dbPath}`);

  // 创建迁移实例
  const migration = new DataMigrationSQLite(dbPath);

  try {
    // 执行迁移流程
    await migration.run();

    // 获取迁移统计信息
    const stats = migration.getStats();

    // 保存迁移报告到JSON文件
    const reportPath = path.join(__dirname, '../../migration-report-sqlite.json');
    fs.writeFileSync(reportPath, JSON.stringify(stats, null, 2));
    console.log(`\n📄 迁移报告已保存到: ${reportPath}`);

    process.exit(0);
  } catch (error) {
    console.error('迁移失败:', error);
    process.exit(1);
  }
}

// 当直接运行此文件时执行main函数
if (require.main === module) {
  main();
}

export { DataMigrationSQLite, MigrationStats };
