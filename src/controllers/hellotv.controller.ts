import { Request, Response, NextFunction } from 'express';
import hellotvService from '../services/hellotv.service';
import logger from '../utils/logger';

class HelloTVController {
  async getTabList(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      logger.info('📋 [HelloTV] 获取Tab列表');

      const tabs = await hellotvService.getTabList();

      res.json({
        code: 200,
        message: 'success',
        data: tabs
      });
    } catch (error) {
      logger.error('❌ [HelloTV] 获取Tab列表失败:', error);
      next(error);
    }
  }

  async getTabContent(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { tabId } = req.params;

      logger.info(`📋 [HelloTV] 获取Tab内容: tabId=${tabId}`);

      const content = await hellotvService.getTabContent(tabId);

      res.json({
        code: 200,
        message: 'success',
        data: content
      });
    } catch (error) {
      logger.error(`❌ [HelloTV] 获取Tab内容失败: tabId=${req.params.tabId}`, error);
      next(error);
    }
  }

  async getMediaDetail(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { mediaId } = req.params;

      logger.info(`🎬 [HelloTV] 获取媒体详情: mediaId=${mediaId}`);

      const media = await hellotvService.getMediaDetail(mediaId);

      if (!media) {
        res.status(404).json({
          code: 404,
          message: 'Media not found',
          data: null
        });
        return;
      }

      res.json({
        code: 200,
        message: 'success',
        data: media
      });
    } catch (error) {
      logger.error(`❌ [HelloTV] 获取媒体详情失败: mediaId=${req.params.mediaId}`, error);
      next(error);
    }
  }

  async getMediaList(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { page = '1', pageSize = '20', category } = req.query;

      logger.info(`🎬 [HelloTV] 获取媒体列表: page=${page}, category=${category || 'all'}`);

      const result = await hellotvService.getMediaList({
        page: parseInt(page as string),
        pageSize: parseInt(pageSize as string),
        category: category as string
      });

      res.json({
        code: 200,
        message: 'success',
        data: result
      });
    } catch (error) {
      logger.error('❌ [HelloTV] 获取媒体列表失败:', error);
      next(error);
    }
  }

  async getSearchCenter(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { userId } = req.query;

      logger.info(`🔍 [HelloTV] 获取搜索中心: userId=${userId || 'guest'}`);

      const result = await hellotvService.getSearchCenter(userId as string);

      res.json({
        code: 200,
        message: 'success',
        data: result
      });
    } catch (error) {
      logger.error('❌ [HelloTV] 获取搜索中心失败:', error);
      next(error);
    }
  }

  async searchContent(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { keyword, page = '1', pageSize = '20' } = req.query;

      if (!keyword) {
        res.status(400).json({
          code: 400,
          message: 'Keyword is required',
          data: null
        });
        return;
      }

      logger.info(`🔍 [HelloTV] 搜索内容: keyword="${keyword}", page=${page}`);

      const result = await hellotvService.searchContent(keyword as string, {
        page: parseInt(page as string),
        pageSize: parseInt(pageSize as string)
      });

      res.json({
        code: 200,
        message: 'success',
        data: result
      });
    } catch (error) {
      logger.error(`❌ [HelloTV] 搜索内容失败: keyword="${req.query.keyword}"`, error);
      next(error);
    }
  }

  async addSearchHistory(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { userId, keyword } = req.body;

      if (!userId || !keyword) {
        res.status(400).json({
          code: 400,
          message: 'UserId and keyword are required',
          data: null
        });
        return;
      }

      logger.info(`🔍 [HelloTV] 添加搜索历史: userId=${userId}, keyword="${keyword}"`);

      await hellotvService.addSearchHistory(userId, keyword);

      res.json({
        code: 200,
        message: 'success',
        data: null
      });
    } catch (error) {
      logger.error('❌ [HelloTV] 添加搜索历史失败:', error);
      next(error);
    }
  }

  async getShortVideoList(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { page = '1', pageSize = '20' } = req.query;

      logger.info(`📹 [HelloTV] 获取短视频列表: page=${page}`);

      const result = await hellotvService.getShortVideoList({
        page: parseInt(page as string),
        pageSize: parseInt(pageSize as string)
      });

      res.json({
        code: 200,
        message: 'success',
        data: result
      });
    } catch (error) {
      logger.error('❌ [HelloTV] 获取短视频列表失败:', error);
      next(error);
    }
  }

  async getLiveChannels(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { page = '1', pageSize = '50', groupId } = req.query;

      logger.info(`📺 [HelloTV] 获取直播频道: page=${page}, groupId=${groupId || 'all'}`);

      const result = await hellotvService.getLiveChannels({
        page: parseInt(page as string),
        pageSize: parseInt(pageSize as string),
        groupId: groupId ? parseInt(groupId as string) : undefined
      });

      res.json({
        code: 200,
        message: 'success',
        data: result
      });
    } catch (error) {
      logger.error('❌ [HelloTV] 获取直播频道失败:', error);
      next(error);
    }
  }

  async getLiveChannelGroups(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      logger.info('📺 [HelloTV] 获取直播分组');

      const groups = await hellotvService.getLiveChannelGroups();

      res.json({
        code: 200,
        message: 'success',
        data: groups
      });
    } catch (error) {
      logger.error('❌ [HelloTV] 获取直播分组失败:', error);
      next(error);
    }
  }

  async recordView(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { contentId, contentType = 'media' } = req.body;

      if (!contentId) {
        res.status(400).json({
          code: 400,
          message: 'ContentId is required',
          data: null
        });
        return;
      }

      logger.info(`👁️  [HelloTV] 记录观看: ${contentType}=${contentId}`);

      await hellotvService.recordView(contentId, contentType as 'media' | 'short_video');

      res.json({
        code: 200,
        message: 'success',
        data: null
      });
    } catch (error) {
      logger.error('❌ [HelloTV] 记录观看失败:', error);
      next(error);
    }
  }
}

export default new HelloTVController();
