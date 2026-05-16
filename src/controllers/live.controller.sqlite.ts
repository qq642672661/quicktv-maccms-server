import { Request, Response, NextFunction } from 'express';
import liveService from '../services/live.service.sqlite';
import logger from '../utils/logger';

class LiveController {
  async getChannelList(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { category, page = '1', limit = '20' } = req.query;

      const result = await liveService.getChannelList(
        category as string,
        parseInt(page as string),
        parseInt(limit as string)
      );

      res.json({
        code: 200,
        message: 'success',
        data: result
      });
    } catch (error) {
      logger.error('📺 获取频道列表失败:', error);
      next(error);
    }
  }

  async getChannelDetail(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { channelId } = req.params;

      const channel = await liveService.getChannelDetail(channelId);

      if (!channel) {
        res.status(404).json({
          code: 404,
          message: 'Channel not found'
        });
        return;
      }

      res.json({
        code: 200,
        message: 'success',
        data: channel
      });
    } catch (error) {
      logger.error('📺 获取频道详情失败:', error);
      next(error);
    }
  }

  async recordView(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { channelId } = req.params;
      const { deviceId = 'unknown' } = req.body;

      await liveService.recordView(channelId, deviceId);

      res.json({
        code: 200,
        message: 'View recorded successfully'
      });
    } catch (error) {
      logger.error('📺 记录观看失败:', error);
      next(error);
    }
  }

  async getCategories(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const categories = await liveService.getCategories();

      res.json({
        code: 200,
        message: 'success',
        data: categories
      });
    } catch (error) {
      logger.error('📺 获取分类失败:', error);
      next(error);
    }
  }
}

export default new LiveController();
