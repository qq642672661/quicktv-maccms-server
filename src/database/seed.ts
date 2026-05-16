import db from './schema';
import { TabService } from '../services/tab.service';
import { SectionService } from '../services/section.service';
import { MediaService } from '../services/media.service';
import { default as logger } from '../utils/logger';
import homeTabData from '../../hellotv-mock-data/home_tab';
import homePage0 from '../../hellotv-mock-data/home_page0';

export async function seedDatabase() {
  try {
    logger.info('🌱 开始填充数据库...');

    const existingTabs = TabService.getAllTabs();
    if (existingTabs.length > 0) {
      logger.info('⏭️  数据已存在，跳过初始化');
      return;
    }

    logger.info('📦 从mock数据迁移Tab...');
    homeTabData.forEach((tab: any, index: number) => {
      TabService.createTab({
        menu_code: tab.menuCode || tab.id,
        menu_name: tab.menuName,
        menu_type: parseInt(tab.menuType) || 0,
        default_home: parseInt(tab.defaultHome) || 0,
        image: tab.image || null,
        focus_image: tab.focusImage || null,
        select_image: tab.selectImage || null,
        image_width: tab.imageWidth || null,
        image_height: tab.imageHeight || null,
        corner_image: tab.cornerImage || null,
        focus_corner_image: tab.focusCornerImage || null,
        background_image: tab.backgroundImage || null,
        sort_order: index
      });
    });

    logger.info('📦 创建TabContent...');
    const tabs = TabService.getAllTabs();
    const homeTab = tabs.find(t => t.menu_code === '0' || t.menu_code === '1');

    if (homeTab) {
      const tabContentStmt = db.prepare(`
        INSERT INTO tab_contents (tab_id, first_plate_margin_top, disable_scroll_on_first_screen)
        VALUES (?, ?, ?)
      `);
      const tabContentResult = tabContentStmt.run(homeTab.id, 0, 0);
      const tabContentId = tabContentResult.lastInsertRowid as number;

      logger.info('📦 从mock数据迁移Section和SectionItem...');
      if (homePage0.plates && Array.isArray(homePage0.plates)) {
        homePage0.plates.forEach((plate: any, plateIndex: number) => {
          const sectionId = SectionService.createSection({
            tab_content_id: tabContentId,
            plate_name: plate.plateName || `板块${plateIndex + 1}`,
            show_plate_name: parseInt(plate.showPlateName) || 0,
            plate_type: parseInt(plate.plateType) || 1,
            height: plate.height || 400,
            is_switch_cell_bg: parseInt(plate.isSwitchCellBg) || 0,
            time_axis_switch: parseInt(plate.timeAxisSwitch) || 0,
            is_focus_scroll_target: plate.isFocusScrollTarget ? 1 : 0,
            sort_order: plateIndex
          });

          if (plate.plateDetails && Array.isArray(plate.plateDetails)) {
            plate.plateDetails.forEach((item: any, itemIndex: number) => {
              SectionService.createSectionItem({
                section_id: sectionId,
                pos_x: item.posX || 0,
                pos_y: item.posY || 0,
                width: item.width || 400,
                height: item.height || 300,
                cell_type: parseInt(item.cellType) || 0,
                is_bg_player: item.isBgPlayer ? 1 : 0,
                poster: item.poster || null,
                poster_title: item.posterTitle || null,
                poster_title_style: item.posterTitleStyle || null,
                poster_subtitle: item.posterSubtitle || null,
                corner_style: item.cornerStyle || null,
                corner_position: item.cornerPosition || null,
                corner_content: item.cornerContent || null,
                corner_color: item.cornerColor || null,
                corner_gradient: item.cornerGradient || null,
                corner_image: item.cornerImage || null,
                focus_image: item.focusImage || null,
                non_focus_image: item.nonFocusImage || null,
                play_logo_switch: parseInt(item.playLogoSwitch) || 0,
                redirect_type: item.redirectType?.toString() || null,
                action: item.action || null,
                inner_args: item.innerArgs || null,
                content_data: item.contentData || null,
                content_second_id: item.contentSecondId || null,
                content_third_id: item.contentThirdId || null,
                sort_order: itemIndex
              });

              if (item.playData && Array.isArray(item.playData)) {
                const sectionItemId = db.prepare('SELECT last_insert_rowid() as id').get() as { id: number };
                item.playData.forEach((playItem: any, playIndex: number) => {
                  const playItemStmt = db.prepare(`
                    INSERT INTO play_items (section_item_id, title, cover, url, sort_order)
                    VALUES (?, ?, ?, ?, ?)
                  `);
                  playItemStmt.run(
                    sectionItemId.id,
                    playItem.title || '',
                    playItem.cover || '',
                    playItem.url || '',
                    playIndex
                  );
                });
              }
            });
          }
        });
      }
    }

    logger.info('📦 添加示例媒体数据...');
    const sampleMedia = [
      {
        media_id: 'media_001',
        title: '示例视频1',
        subtitle: '这是一个示例视频',
        cover: 'https://picsum.photos/640/360',
        video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
        duration: 596,
        category: '电影',
        tags: JSON.stringify(['动画', '短片']),
        description: '大雄兔示例视频'
      },
      {
        media_id: 'media_002',
        title: '示例视频2',
        subtitle: '另一个示例视频',
        cover: 'https://picsum.photos/640/360',
        video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
        duration: 653,
        category: '电影',
        tags: JSON.stringify(['动画', '科幻']),
        description: '大象之梦示例视频'
      }
    ];

    sampleMedia.forEach(media => {
      MediaService.createMedia(media);
    });

    logger.info('✅ 数据库填充完成！');
  } catch (error) {
    logger.error('❌ 数据库填充失败:', error);
    throw error;
  }
}
