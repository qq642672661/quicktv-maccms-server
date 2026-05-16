/**
 * HelloTV Mock数据迁移脚本 - PostgreSQL版本
 * 将hellotv前端的Mock数据导入到后端PostgreSQL数据库
 * 
 * 功能：
 * 1. 导入Tab菜单数据
 * 2. 导入首页板块和详情数据
 * 3. 导入媒体内容数据
 * 4. 导入短视频数据
 * 5. 导入直播频道数据
 * 6. 导入搜索关键词数据
 * 
 * 使用方式：
 * npx ts-node src/database/migrate-hellotv-mock.ts
 */

import { Pool } from 'pg'
import path from 'path'
import fs from 'fs'
import config from '../config'

const pool = new Pool({
  host: config.database.host,
  port: config.database.port,
  database: config.database.name,
  user: config.database.user,
  password: config.database.password
})

const HELLOTV_MOCK_PATH = path.join(__dirname, '../../../hellotv/src/api')

interface MigrationStats {
  tabs: number
  plates: number
  plateDetails: number
  mediaContents: number
  shortVideos: number
  liveGroups: number
  liveChannels: number
  searchKeywords: number
}

function readMockFile(filePath: string): any {
  try {
    if (!fs.existsSync(filePath)) {
      console.warn(`⚠️  文件不存在: ${filePath}`)
      return null
    }

    const content = fs.readFileSync(filePath, 'utf-8')
    
    const exportMatch = content.match(/export\s+default\s+(\{[\s\S]*?\n\}(?=\s*;?\s*$)|\[[\s\S]*?\n\](?=\s*;?\s*$))/m)
    if (!exportMatch) {
      console.warn(`⚠️  无法解析文件: ${filePath}`)
      return null
    }

    let jsonStr = exportMatch[1]
      .replace(/\/\/.*$/gm, '')
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .replace(/(\w+):/g, '"$1":')
      .replace(/'/g, '"')
      .replace(/,(\s*[}\]])/g, '$1')
      .replace(/undefined/g, 'null')

    return JSON.parse(jsonStr)
  } catch (error) {
    console.error(`❌ 读取文件失败: ${filePath}`, error)
    return null
  }
}

async function migrateTabMenu(): Promise<number> {
  console.log('📋 开始迁移Tab菜单数据...')
  
  const tabData = readMockFile(path.join(HELLOTV_MOCK_PATH, 'home/mock/home_tab.ts'))
  if (!tabData || !Array.isArray(tabData)) {
    console.error('❌ Tab数据格式错误')
    return 0
  }

  let count = 0
  for (const tab of tabData) {
    await pool.query(`
      INSERT INTO tab_menu (
        id, menu_code, menu_name, menu_type, image_width, image_height,
        image, select_image, focus_image, focus_corner_image, corner_image,
        background_image, default_home, sort_order, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
      ON CONFLICT (id) DO UPDATE SET
        menu_code = EXCLUDED.menu_code,
        menu_name = EXCLUDED.menu_name,
        updated_at = CURRENT_TIMESTAMP
    `, [
      tab.id,
      tab.menuCode,
      tab.menuName,
      tab.menuType || 0,
      tab.imageWidth,
      tab.imageHeight,
      tab.image,
      tab.selectImage,
      tab.focusImage,
      tab.focusCornerImage,
      tab.cornerImage,
      tab.backgroundImage,
      tab.defaultHome || '0',
      count++,
      'active'
    ])
  }

  console.log(`✅ 成功导入 ${count} 个Tab菜单`)
  return count
}

async function migrateHomePlate(): Promise<{ plates: number; details: number }> {
  console.log('🏠 开始迁移首页板块数据...')
  
  const pageFiles = [
    'home/mock/home_page0.ts',
    'home/mock/home_page1.ts',
    'home/mock/home_page2.ts',
    'home/mock/home_page3.ts'
  ]

  let plateCount = 0
  let detailCount = 0

  for (let tabIndex = 0; tabIndex < pageFiles.length; tabIndex++) {
    const pageData = readMockFile(path.join(HELLOTV_MOCK_PATH, pageFiles[tabIndex]))
    if (!pageData || !pageData.plates) continue

    const tabId = String(tabIndex)

    for (let plateIndex = 0; plateIndex < pageData.plates.length; plateIndex++) {
      const plate = pageData.plates[plateIndex]
      
      await pool.query(`
        INSERT INTO home_plate (
          id, tab_id, plate_name, show_plate_name, plate_type, height,
          is_switch_cell_bg, time_axis_switch, is_focus_scroll_target,
          sort_order, status
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        ON CONFLICT (id) DO UPDATE SET
          plate_name = EXCLUDED.plate_name,
          updated_at = CURRENT_TIMESTAMP
      `, [
        plate.id,
        tabId,
        plate.plateName,
        plate.showPlateName || '0',
        plate.plateType || '1',
        plate.height || 0,
        plate.isSwitchCellBg || '0',
        plate.timeAxisSwitch || '0',
        plate.isFocusScrollTarget ? 1 : 0,
        plateIndex,
        'active'
      ])
      plateCount++

      if (plate.plateDetails && Array.isArray(plate.plateDetails)) {
        for (let detailIndex = 0; detailIndex < plate.plateDetails.length; detailIndex++) {
          const detail = plate.plateDetails[detailIndex]
          
          await pool.query(`
            INSERT INTO plate_detail (
              id, plate_id, pos_x, pos_y, width, height, cell_type,
              poster, poster_title, poster_title_style, content_data,
              content_second_id, corner_color, corner_gradient, redirect_type,
              action, inner_args, play_logo_switch, play_data, sort_order, status
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21)
            ON CONFLICT (id) DO UPDATE SET
              poster = EXCLUDED.poster,
              updated_at = CURRENT_TIMESTAMP
          `, [
            detail.id,
            plate.id,
            detail.posX || 0,
            detail.posY || 0,
            detail.width || 0,
            detail.height || 0,
            detail.cellType || '0',
            detail.poster,
            detail.posterTitle,
            detail.posterTitleStyle,
            detail.contentData,
            detail.contentSecondId,
            detail.cornerColor,
            detail.cornerGradient,
            detail.redirectType || 0,
            detail.action,
            detail.innerArgs,
            detail.playLogoSwitch || '0',
            detail.playData ? JSON.stringify(detail.playData) : null,
            detailIndex,
            'active'
          ])
          detailCount++
        }
      }
    }
  }

  console.log(`✅ 成功导入 ${plateCount} 个板块，${detailCount} 个板块详情`)
  return { plates: plateCount, details: detailCount }
}

async function migrateMediaContent(): Promise<number> {
  console.log('🎬 开始迁移媒体内容数据...')
  
  const mediaFiles = [
    'media/mock/media_detail_1703598812798386177.ts',
    'media/mock/media_detail_1745001057714049026.ts'
  ]

  let count = 0
  for (const file of mediaFiles) {
    const mediaData = readMockFile(path.join(HELLOTV_MOCK_PATH, file))
    if (!mediaData || !mediaData.data) continue

    const data = mediaData.data
    
    await pool.query(`
      INSERT INTO media_content (
        id, asset_title, asset_sub_title, asset_alias, asset_type, description,
        media_type, cp_name, tags, category_name, category_sub_name, anchors,
        clip_type, year, cover_h, cover_v, directors, actors, region, language,
        pay_type, fee_type, total_episodes_num, update_episodes_num, drm,
        series_type, finish_status, douban_score, description1, description2,
        description3, description4, description5, status, online_status,
        licence_num, cache_tags, start_index, episode_count, play_count,
        is_hot_search, episode_sort_type, start_index_type, episode_tab_style,
        corner_content, corner_color, corner_gradient, is_cms_relate,
        newtv_status, tag_list, composite_score, package_name_list
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16,
        $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, $30,
        $31, $32, $33, $34, $35, $36, $37, $38, $39, $40, $41, $42, $43, $44,
        $45, $46, $47, $48, $49, $50, $51, $52
      )
      ON CONFLICT (id) DO UPDATE SET
        asset_title = EXCLUDED.asset_title,
        updated_at = CURRENT_TIMESTAMP
    `, [
      data.id,
      data.assetTitle,
      data.assetSubTitle,
      data.assetAlias,
      data.assetType,
      data.description,
      data.mediaType || 1,
      data.cpName,
      data.tags,
      data.categoryName,
      data.categorySubName,
      data.anchors,
      data.clipType,
      data.year,
      data.coverH,
      data.coverV,
      data.directors,
      data.actors,
      data.region,
      data.language,
      data.payType || '1',
      data.feeType || 1,
      data.totalEpisodesNum,
      data.updateEpisodesNum,
      data.drm || '0',
      data.seriesType || '1',
      data.finishStatus || '0',
      data.doubanScore,
      data.description1,
      data.description2,
      data.description3,
      data.description4,
      data.description5,
      data.status || '1',
      data.onlineStatus || '1',
      data.licenceNum,
      data.cacheTags,
      data.startIndex || 1,
      data.episodeCount || 0,
      data.playCount || 0,
      data.isHotSearch || 0,
      data.episodeSortType || 0,
      data.startIndexType || 0,
      data.episodeTabStyle,
      data.cornerContent,
      data.cornerColor,
      data.cornerGradient,
      data.isCmsRelate || 0,
      data.newtvStatus,
      data.tagList ? JSON.stringify(data.tagList) : null,
      data.compositeScore,
      data.packageNameList ? JSON.stringify(data.packageNameList) : null
    ])
    count++
  }

  console.log(`✅ 成功导入 ${count} 个媒体内容`)
  return count
}

async function migrateShortVideo(): Promise<number> {
  console.log('📹 开始迁移短视频数据...')
  
  const shortVideoData = readMockFile(path.join(HELLOTV_MOCK_PATH, 'shortVideo/mock/short_video_data.ts'))
  if (!shortVideoData || !Array.isArray(shortVideoData)) {
    console.error('❌ 短视频数据格式错误')
    return 0
  }

  let count = 0
  for (const video of shortVideoData) {
    await pool.query(`
      INSERT INTO short_video (
        id, title, poster, url, corner, redirect_type, action, inner_args,
        tag, score, sort, description, play_count, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
      ON CONFLICT (id) DO UPDATE SET
        title = EXCLUDED.title,
        updated_at = CURRENT_TIMESTAMP
    `, [
      video.id,
      video.title,
      video.poster,
      video.url,
      video.corner,
      video.redirectType || 0,
      video.action,
      video.innerArgs,
      video.videoInfo?.tag,
      video.videoInfo?.score,
      video.videoInfo?.sort,
      video.videoInfo?.desc,
      0,
      'active'
    ])
    count++
  }

  console.log(`✅ 成功导入 ${count} 个短视频`)
  return count
}

async function migrateLiveChannel(): Promise<{ groups: number; channels: number }> {
  console.log('📺 开始迁移直播频道数据...')
  
  const channelData = readMockFile(path.join(HELLOTV_MOCK_PATH, '../pages/live/mock/channel.ts'))
  if (!channelData || !Array.isArray(channelData)) {
    console.error('❌ 直播频道数据格式错误')
    return { groups: 0, channels: 0 }
  }

  let groupCount = 0
  let channelCount = 0

  for (let groupIndex = 0; groupIndex < channelData.length; groupIndex++) {
    const group = channelData[groupIndex]
    
    const groupResult = await pool.query(`
      INSERT INTO live_channel_group (group_name, sort_order, status)
      VALUES ($1, $2, $3)
      ON CONFLICT (group_name) DO UPDATE SET
        sort_order = EXCLUDED.sort_order,
        updated_at = CURRENT_TIMESTAMP
      RETURNING id
    `, [group.name, groupIndex, 'active'])
    
    const groupId = groupResult.rows[0].id
    groupCount++

    if (group.data && Array.isArray(group.data)) {
      for (let channelIndex = 0; channelIndex < group.data.length; channelIndex++) {
        const channel = group.data[channelIndex]
        
        await pool.query(`
          INSERT INTO live_channel (
            channel_id, name, group_id, addrs, sort_order, status
          ) VALUES ($1, $2, $3, $4, $5, $6)
          ON CONFLICT (channel_id) DO UPDATE SET
            name = EXCLUDED.name,
            updated_at = CURRENT_TIMESTAMP
        `, [
          channel.id,
          channel.name,
          groupId,
          JSON.stringify(channel.addrs),
          channelIndex,
          'online'
        ])
        channelCount++
      }
    }
  }

  console.log(`✅ 成功导入 ${groupCount} 个频道分组，${channelCount} 个直播频道`)
  return { groups: groupCount, channels: channelCount }
}

async function migrateSearchKeyword(): Promise<number> {
  console.log('🔍 开始迁移搜索关键词数据...')
  
  const searchData = readMockFile(path.join(HELLOTV_MOCK_PATH, 'search/mock/search_center_list.ts'))
  if (!searchData) {
    console.error('❌ 搜索数据格式错误')
    return 0
  }

  let count = 0

  if (searchData.keywordList && Array.isArray(searchData.keywordList)) {
    for (let index = 0; index < searchData.keywordList.length; index++) {
      const keyword = searchData.keywordList[index]
      
      await pool.query(`
        INSERT INTO search_keyword (keyword, search_count, is_hot, sort_order, status)
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT (keyword) DO UPDATE SET
          is_hot = EXCLUDED.is_hot,
          updated_at = CURRENT_TIMESTAMP
      `, [keyword, 0, 1, index, 'active'])
      count++
    }
  }

  console.log(`✅ 成功导入 ${count} 个搜索关键词`)
  return count
}

async function main() {
  console.log('========================================')
  console.log('🚀 HelloTV Mock数据迁移开始')
  console.log('========================================\n')

  const stats: MigrationStats = {
    tabs: 0,
    plates: 0,
    plateDetails: 0,
    mediaContents: 0,
    shortVideos: 0,
    liveGroups: 0,
    liveChannels: 0,
    searchKeywords: 0
  }

  try {
    await pool.query('BEGIN')

    stats.tabs = await migrateTabMenu()
    
    const plateResult = await migrateHomePlate()
    stats.plates = plateResult.plates
    stats.plateDetails = plateResult.details
    
    stats.mediaContents = await migrateMediaContent()
    stats.shortVideos = await migrateShortVideo()
    
    const liveResult = await migrateLiveChannel()
    stats.liveGroups = liveResult.groups
    stats.liveChannels = liveResult.channels
    
    stats.searchKeywords = await migrateSearchKeyword()

    await pool.query('COMMIT')

    console.log('\n========================================')
    console.log('✅ 所有数据迁移完成！')
    console.log('========================================')
    console.log('📊 迁移统计：')
    console.log(`   - Tab菜单: ${stats.tabs}`)
    console.log(`   - 首页板块: ${stats.plates}`)
    console.log(`   - 板块详情: ${stats.plateDetails}`)
    console.log(`   - 媒体内容: ${stats.mediaContents}`)
    console.log(`   - 短视频: ${stats.shortVideos}`)
    console.log(`   - 直播分组: ${stats.liveGroups}`)
    console.log(`   - 直播频道: ${stats.liveChannels}`)
    console.log(`   - 搜索关键词: ${stats.searchKeywords}`)
    console.log('========================================\n')
  } catch (error) {
    await pool.query('ROLLBACK')
    console.error('\n❌ 数据迁移失败:', error)
    process.exit(1)
  } finally {
    await pool.end()
  }
}

main()
