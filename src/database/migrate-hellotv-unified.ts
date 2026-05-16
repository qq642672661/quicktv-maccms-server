import fs from 'fs';
import path from 'path';
import { Pool } from 'pg';
import Database from 'better-sqlite3';
import dotenv from 'dotenv';

dotenv.config();

type DatabaseType = 'postgresql' | 'sqlite';

interface MigrationConfig {
  type: DatabaseType;
  pgPool?: Pool;
  sqliteDb?: Database.Database;
}

class HelloTVMigration {
  private config: MigrationConfig;

  constructor(config: MigrationConfig) {
    this.config = config;
  }

  async detectDatabaseType(): Promise<DatabaseType> {
    const dbType = process.env.DB_TYPE?.toLowerCase();
    
    if (dbType === 'sqlite' || dbType === 'sqlite3') {
      return 'sqlite';
    }
    
    if (dbType === 'postgresql' || dbType === 'postgres' || dbType === 'pg') {
      return 'postgresql';
    }

    if (process.env.DATABASE_URL?.includes('postgres')) {
      return 'postgresql';
    }

    if (process.env.SQLITE_PATH || process.env.DB_PATH) {
      return 'sqlite';
    }

    return 'postgresql';
  }

  async initializeConnection(): Promise<void> {
    const dbType = await this.detectDatabaseType();
    this.config.type = dbType;

    console.log(`\n🔍 检测到数据库类型: ${dbType.toUpperCase()}\n`);

    if (dbType === 'postgresql') {
      this.config.pgPool = new Pool({
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '5432'),
        database: process.env.DB_NAME || 'quicktv',
        user: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD || 'postgres',
      });

      try {
        const client = await this.config.pgPool.connect();
        console.log('✅ PostgreSQL 连接成功');
        client.release();
      } catch (error) {
        console.error('❌ PostgreSQL 连接失败:', error);
        throw error;
      }
    } else {
      const dbPath = process.env.SQLITE_PATH || 
                     process.env.DB_PATH || 
                     path.join(process.cwd(), 'data', 'quicktv.db');
      
      const dbDir = path.dirname(dbPath);
      if (!fs.existsSync(dbDir)) {
        fs.mkdirSync(dbDir, { recursive: true });
      }

      this.config.sqliteDb = new Database(dbPath);
      this.config.sqliteDb.pragma('journal_mode = WAL');
      this.config.sqliteDb.pragma('foreign_keys = ON');
      
      console.log(`✅ SQLite 连接成功: ${dbPath}`);
    }
  }

  async runMigration(): Promise<void> {
    console.log('\n📦 开始执行数据库迁移...\n');

    if (this.config.type === 'postgresql') {
      await this.runPostgreSQLMigration();
    } else {
      await this.runSQLiteMigration();
    }

    console.log('\n✅ 数据库迁移完成！\n');
  }

  private async runPostgreSQLMigration(): Promise<void> {
    const sqlPath = path.join(__dirname, 'migrations', '20260516000001_create_hellotv_tables.sql');
    const sql = fs.readFileSync(sqlPath, 'utf-8');

    const client = await this.config.pgPool!.connect();
    try {
      await client.query('BEGIN');
      
      const statements = sql
        .split(';')
        .map(s => s.trim())
        .filter(s => s.length > 0 && !s.startsWith('--'));

      for (const statement of statements) {
        await client.query(statement);
      }

      await client.query('COMMIT');
      console.log('✅ PostgreSQL 表结构创建成功');
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('❌ PostgreSQL 迁移失败:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  private async runSQLiteMigration(): Promise<void> {
    const sqlPath = path.join(__dirname, 'migrations', '20260516000001_create_hellotv_tables_sqlite.sql');
    const sql = fs.readFileSync(sqlPath, 'utf-8');

    try {
      this.config.sqliteDb!.exec(sql);
      console.log('✅ SQLite 表结构创建成功');
    } catch (error) {
      console.error('❌ SQLite 迁移失败:', error);
      throw error;
    }
  }

  async importMockData(): Promise<void> {
    console.log('\n📥 开始导入 Mock 数据...\n');

    const mockDataPath = path.join(__dirname, '..', '..', '..', 'hellotv', 'src', 'mock');
    
    if (!fs.existsSync(mockDataPath)) {
      console.warn('⚠️  未找到 Mock 数据目录，跳过数据导入');
      return;
    }

    await this.importTabMenus(mockDataPath);
    await this.importHomePlates(mockDataPath);
    await this.importMediaContents(mockDataPath);
    await this.importShortVideos(mockDataPath);
    await this.importLiveChannels(mockDataPath);
    await this.importSearchKeywords(mockDataPath);

    console.log('\n✅ Mock 数据导入完成！\n');
  }

  private async importTabMenus(mockDataPath: string): Promise<void> {
    console.log('📋 导入 Tab 菜单数据...');
    
    try {
      const homeIndexPath = path.join(mockDataPath, 'home', 'index.ts');
      if (!fs.existsSync(homeIndexPath)) {
        console.warn('⚠️  未找到 home/index.ts');
        return;
      }

      const content = fs.readFileSync(homeIndexPath, 'utf-8');
      const tabsMatch = content.match(/export const tabs[^=]*=\s*(\[[\s\S]*?\]);/);
      
      if (!tabsMatch) {
        console.warn('⚠️  未找到 tabs 数据');
        return;
      }

      const tabsData = eval(tabsMatch[1]);
      
      for (const tab of tabsData) {
        const data = {
          id: tab.id || `tab_${Date.now()}_${Math.random()}`,
          menu_code: tab.menuCode || tab.id,
          menu_name: tab.menuName || tab.name || '',
          menu_type: tab.menuType || 0,
          image_width: tab.imageWidth || null,
          image_height: tab.imageHeight || null,
          image: tab.image || null,
          select_image: tab.selectImage || null,
          focus_image: tab.focusImage || null,
          focus_corner_image: tab.focusCornerImage || null,
          corner_image: tab.cornerImage || null,
          background_image: tab.backgroundImage || null,
          default_home: tab.defaultHome || '0',
          sort_order: tab.sortOrder || 0,
          status: 'active',
        };

        if (this.config.type === 'postgresql') {
          await this.insertPostgreSQL('tab_menu', data);
        } else {
          await this.insertSQLite('tab_menu', data);
        }
      }

      console.log(`✅ 导入了 ${tabsData.length} 条 Tab 菜单数据`);
    } catch (error) {
      console.error('❌ 导入 Tab 菜单失败:', error);
    }
  }

  private async importHomePlates(mockDataPath: string): Promise<void> {
    console.log('📋 导入首页板块数据...');
    
    try {
      const homeIndexPath = path.join(mockDataPath, 'home', 'index.ts');
      if (!fs.existsSync(homeIndexPath)) {
        console.warn('⚠️  未找到 home/index.ts');
        return;
      }

      const content = fs.readFileSync(homeIndexPath, 'utf-8');
      const platesMatch = content.match(/export const plates[^=]*=\s*(\[[\s\S]*?\]);/);
      
      if (!platesMatch) {
        console.warn('⚠️  未找到 plates 数据');
        return;
      }

      const platesData = eval(platesMatch[1]);
      let totalPlates = 0;
      let totalDetails = 0;

      for (const plate of platesData) {
        const plateId = plate.id || `plate_${Date.now()}_${Math.random()}`;
        
        const plateData = {
          id: plateId,
          tab_id: plate.tabId || 'tab_home',
          plate_name: plate.plateName || '',
          show_plate_name: plate.showPlateName || '0',
          plate_type: plate.plateType || '1',
          height: plate.height || 0,
          is_switch_cell_bg: plate.isSwitchCellBg || '0',
          time_axis_switch: plate.timeAxisSwitch || '0',
          is_focus_scroll_target: plate.isFocusScrollTarget || 0,
          sort_order: plate.sortOrder || 0,
          status: 'active',
        };

        if (this.config.type === 'postgresql') {
          await this.insertPostgreSQL('home_plate', plateData);
        } else {
          await this.insertSQLite('home_plate', plateData);
        }
        totalPlates++;

        if (plate.plateDetails && Array.isArray(plate.plateDetails)) {
          for (const detail of plate.plateDetails) {
            const detailData = {
              id: detail.id || `detail_${Date.now()}_${Math.random()}`,
              plate_id: plateId,
              pos_x: detail.posX || 0,
              pos_y: detail.posY || 0,
              width: detail.width || 0,
              height: detail.height || 0,
              cell_type: detail.cellType || '0',
              poster: detail.poster || null,
              poster_title: detail.posterTitle || null,
              poster_title_style: detail.posterTitleStyle ? JSON.stringify(detail.posterTitleStyle) : null,
              content_data: detail.contentData || null,
              content_second_id: detail.contentSecondId || null,
              corner_color: detail.cornerColor || null,
              corner_gradient: detail.cornerGradient ? JSON.stringify(detail.cornerGradient) : null,
              redirect_type: detail.redirectType || 0,
              action: detail.action || null,
              inner_args: detail.innerArgs ? JSON.stringify(detail.innerArgs) : null,
              play_logo_switch: detail.playLogoSwitch || '0',
              play_data: detail.playData ? JSON.stringify(detail.playData) : null,
              sort_order: detail.sortOrder || 0,
              status: 'active',
            };

            if (this.config.type === 'postgresql') {
              await this.insertPostgreSQL('plate_detail', detailData);
            } else {
              await this.insertSQLite('plate_detail', detailData);
            }
            totalDetails++;
          }
        }
      }

      console.log(`✅ 导入了 ${totalPlates} 条板块数据，${totalDetails} 条板块详情数据`);
    } catch (error) {
      console.error('❌ 导入首页板块失败:', error);
    }
  }

  private async importMediaContents(mockDataPath: string): Promise<void> {
    console.log('📋 导入媒体内容数据...');
    
    try {
      const detailIndexPath = path.join(mockDataPath, 'detail', 'index.ts');
      if (!fs.existsSync(detailIndexPath)) {
        console.warn('⚠️  未找到 detail/index.ts');
        return;
      }

      const content = fs.readFileSync(detailIndexPath, 'utf-8');
      const metaMatch = content.match(/export const meta[^=]*=\s*(\{[\s\S]*?\});/);
      
      if (!metaMatch) {
        console.warn('⚠️  未找到 meta 数据');
        return;
      }

      const metaData = eval(`(${metaMatch[1]})`);
      
      const mediaData = {
        id: metaData.id || `media_${Date.now()}`,
        asset_title: metaData.assetTitle || '',
        asset_sub_title: metaData.assetSubTitle || null,
        asset_alias: metaData.assetAlias || null,
        asset_type: metaData.assetType || null,
        description: metaData.description || null,
        media_type: metaData.mediaType || 1,
        cp_name: metaData.cpName || null,
        tags: metaData.tags || null,
        category_name: metaData.categoryName || null,
        category_sub_name: metaData.categorySubName || null,
        anchors: metaData.anchors || null,
        clip_type: metaData.clipType || null,
        year: metaData.year || null,
        cover_h: metaData.coverH || null,
        cover_v: metaData.coverV || null,
        directors: metaData.directors || null,
        actors: metaData.actors || null,
        region: metaData.region || null,
        language: metaData.language || null,
        pay_type: metaData.payType || '1',
        fee_type: metaData.feeType || 1,
        total_episodes_num: metaData.totalEpisodesNum || null,
        update_episodes_num: metaData.updateEpisodesNum || null,
        drm: metaData.drm || '0',
        series_type: metaData.seriesType || '1',
        finish_status: metaData.finishStatus || '0',
        douban_score: metaData.doubanScore || null,
        description1: metaData.description1 || null,
        description2: metaData.description2 || null,
        description3: metaData.description3 || null,
        description4: metaData.description4 || null,
        description5: metaData.description5 || null,
        status: metaData.status || '1',
        online_status: metaData.onlineStatus || '1',
        licence_num: metaData.licenceNum || null,
        cache_tags: metaData.cacheTags || null,
        start_index: metaData.startIndex || 1,
        episode_count: metaData.episodeCount || 0,
        play_count: metaData.playCount || 0,
        is_hot_search: metaData.isHotSearch || 0,
        episode_sort_type: metaData.episodeSortType || 0,
        start_index_type: metaData.startIndexType || 0,
        episode_tab_style: metaData.episodeTabStyle || null,
        corner_content: metaData.cornerContent || null,
        corner_color: metaData.cornerColor || null,
        corner_gradient: metaData.cornerGradient ? JSON.stringify(metaData.cornerGradient) : null,
        is_cms_relate: metaData.isCmsRelate || 0,
        newtv_status: metaData.newtvStatus || null,
        tag_list: metaData.tagList ? JSON.stringify(metaData.tagList) : null,
        composite_score: metaData.compositeScore || null,
        package_name_list: metaData.packageNameList ? JSON.stringify(metaData.packageNameList) : null,
      };

      if (this.config.type === 'postgresql') {
        await this.insertPostgreSQL('media_content', mediaData);
      } else {
        await this.insertSQLite('media_content', mediaData);
      }

      console.log('✅ 导入了 1 条媒体内容数据');
    } catch (error) {
      console.error('❌ 导入媒体内容失败:', error);
    }
  }

  private async importShortVideos(mockDataPath: string): Promise<void> {
    console.log('📋 导入短视频数据...');
    
    try {
      const shortIndexPath = path.join(mockDataPath, 'short', 'index.ts');
      if (!fs.existsSync(shortIndexPath)) {
        console.warn('⚠️  未找到 short/index.ts');
        return;
      }

      const content = fs.readFileSync(shortIndexPath, 'utf-8');
      const listMatch = content.match(/export const list[^=]*=\s*(\[[\s\S]*?\]);/);
      
      if (!listMatch) {
        console.warn('⚠️  未找到短视频 list 数据');
        return;
      }

      const listData = eval(listMatch[1]);
      
      for (const video of listData) {
        const videoData = {
          id: video.id || `short_${Date.now()}_${Math.random()}`,
          title: video.title || '',
          poster: video.poster || null,
          url: video.url || '',
          corner: video.corner || null,
          redirect_type: video.redirectType || 0,
          action: video.action || null,
          inner_args: video.innerArgs ? JSON.stringify(video.innerArgs) : null,
          tag: video.tag || null,
          score: video.score || null,
          sort: video.sort || null,
          description: video.description || null,
          play_count: video.playCount || 0,
          like_count: video.likeCount || 0,
          comment_count: video.commentCount || 0,
          share_count: video.shareCount || 0,
          status: 'active',
        };

        if (this.config.type === 'postgresql') {
          await this.insertPostgreSQL('short_video', videoData);
        } else {
          await this.insertSQLite('short_video', videoData);
        }
      }

      console.log(`✅ 导入了 ${listData.length} 条短视频数据`);
    } catch (error) {
      console.error('❌ 导入短视频失败:', error);
    }
  }

  private async importLiveChannels(mockDataPath: string): Promise<void> {
    console.log('📋 导入直播频道数据...');
    
    try {
      const liveIndexPath = path.join(mockDataPath, 'live', 'index.ts');
      if (!fs.existsSync(liveIndexPath)) {
        console.warn('⚠️  未找到 live/index.ts');
        return;
      }

      const content = fs.readFileSync(liveIndexPath, 'utf-8');
      const channelsMatch = content.match(/export const channels[^=]*=\s*(\[[\s\S]*?\]);/);
      
      if (!channelsMatch) {
        console.warn('⚠️  未找到 channels 数据');
        return;
      }

      const channelsData = eval(channelsMatch[1]);
      const groupMap = new Map<string, number>();
      let groupIdCounter = 1;
      
      for (const channel of channelsData) {
        const groupName = channel.group || '默认分组';
        
        if (!groupMap.has(groupName)) {
          const groupData = {
            group_name: groupName,
            sort_order: groupIdCounter,
            status: 'active',
          };

          if (this.config.type === 'postgresql') {
            const result = await this.insertPostgreSQLReturning('live_channel_group', groupData, 'id');
            groupMap.set(groupName, result.id);
          } else {
            const result = await this.insertSQLiteReturning('live_channel_group', groupData);
            groupMap.set(groupName, result.lastInsertRowid as number);
          }
          
          groupIdCounter++;
        }

        const channelData = {
          channel_id: channel.channelId || channel.id,
          name: channel.name || '',
          group_id: groupMap.get(groupName),
          addrs: JSON.stringify(channel.addrs || []),
          logo: channel.logo || null,
          sort_order: channel.sortOrder || 0,
          status: channel.status || 'online',
          viewer_count: channel.viewerCount || 0,
        };

        if (this.config.type === 'postgresql') {
          await this.insertPostgreSQL('live_channel', channelData);
        } else {
          await this.insertSQLite('live_channel', channelData);
        }
      }

      console.log(`✅ 导入了 ${groupMap.size} 个频道分组，${channelsData.length} 条直播频道数据`);
    } catch (error) {
      console.error('❌ 导入直播频道失败:', error);
    }
  }

  private async importSearchKeywords(mockDataPath: string): Promise<void> {
    console.log('📋 导入搜索关键词数据...');
    
    try {
      const searchIndexPath = path.join(mockDataPath, 'search', 'index.ts');
      if (!fs.existsSync(searchIndexPath)) {
        console.warn('⚠️  未找到 search/index.ts');
        return;
      }

      const content = fs.readFileSync(searchIndexPath, 'utf-8');
      const keywordsMatch = content.match(/export const hotSearchList[^=]*=\s*(\[[\s\S]*?\]);/);
      
      if (!keywordsMatch) {
        console.warn('⚠️  未找到 hotSearchList 数据');
        return;
      }

      const keywordsData = eval(keywordsMatch[1]);
      
      for (let i = 0; i < keywordsData.length; i++) {
        const keyword = keywordsData[i];
        const keywordData = {
          keyword: typeof keyword === 'string' ? keyword : keyword.keyword || keyword.name,
          search_count: typeof keyword === 'object' ? keyword.searchCount || 0 : 0,
          is_hot: 1,
          sort_order: i + 1,
          status: 'active',
        };

        if (this.config.type === 'postgresql') {
          await this.insertPostgreSQL('search_keyword', keywordData);
        } else {
          await this.insertSQLite('search_keyword', keywordData);
        }
      }

      console.log(`✅ 导入了 ${keywordsData.length} 条搜索关键词数据`);
    } catch (error) {
      console.error('❌ 导入搜索关键词失败:', error);
    }
  }

  private async insertPostgreSQL(table: string, data: any): Promise<void> {
    const keys = Object.keys(data);
    const values = Object.values(data);
    const placeholders = keys.map((_, i) => `$${i + 1}`).join(', ');
    
    const sql = `
      INSERT INTO ${table} (${keys.join(', ')})
      VALUES (${placeholders})
      ON CONFLICT DO NOTHING
    `;

    await this.config.pgPool!.query(sql, values);
  }

  private async insertPostgreSQLReturning(table: string, data: any, returning: string): Promise<any> {
    const keys = Object.keys(data);
    const values = Object.values(data);
    const placeholders = keys.map((_, i) => `$${i + 1}`).join(', ');
    
    const sql = `
      INSERT INTO ${table} (${keys.join(', ')})
      VALUES (${placeholders})
      RETURNING ${returning}
    `;

    const result = await this.config.pgPool!.query(sql, values);
    return result.rows[0];
  }

  private async insertSQLite(table: string, data: any): Promise<void> {
    const keys = Object.keys(data);
    const values = Object.values(data);
    const placeholders = keys.map(() => '?').join(', ');
    
    const sql = `
      INSERT OR IGNORE INTO ${table} (${keys.join(', ')})
      VALUES (${placeholders})
    `;

    this.config.sqliteDb!.prepare(sql).run(...values);
  }

  private async insertSQLiteReturning(table: string, data: any): Promise<any> {
    const keys = Object.keys(data);
    const values = Object.values(data);
    const placeholders = keys.map(() => '?').join(', ');
    
    const sql = `
      INSERT INTO ${table} (${keys.join(', ')})
      VALUES (${placeholders})
    `;

    return this.config.sqliteDb!.prepare(sql).run(...values);
  }

  async close(): Promise<void> {
    if (this.config.type === 'postgresql' && this.config.pgPool) {
      await this.config.pgPool.end();
      console.log('✅ PostgreSQL 连接已关闭');
    } else if (this.config.type === 'sqlite' && this.config.sqliteDb) {
      this.config.sqliteDb.close();
      console.log('✅ SQLite 连接已关闭');
    }
  }
}

async function main() {
  console.log('╔════════════════════════════════════════════════════════╗');
  console.log('║     HelloTV 数据库迁移工具 (PostgreSQL + SQLite)      ║');
  console.log('╚════════════════════════════════════════════════════════╝');

  const migration = new HelloTVMigration({ type: 'postgresql' });

  try {
    await migration.initializeConnection();
    await migration.runMigration();
    await migration.importMockData();
    
    console.log('╔════════════════════════════════════════════════════════╗');
    console.log('║              🎉 迁移完成！数据库已就绪！               ║');
    console.log('╚════════════════════════════════════════════════════════╝');
  } catch (error) {
    console.error('\n❌ 迁移过程中发生错误:', error);
    process.exit(1);
  } finally {
    await migration.close();
  }
}

if (require.main === module) {
  main();
}

export { HelloTVMigration, DatabaseType, MigrationConfig };
