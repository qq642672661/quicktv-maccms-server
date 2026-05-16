import { Request, Response, NextFunction } from 'express';
import vodService from '../services/vod.service.sqlite';
import logger from '../utils/logger';

class VodController {
  async getContentList(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { category, page = '1', limit = '20' } = req.query;

      const result = await vodService.getContentList(
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
      logger.error('🎬 获取内容列表失败:', error);
      next(error);
    }
  }

  async getContentDetail(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { contentId } = req.params;

      const content = await vodService.getContentDetail(contentId);

      if (!content) {
        res.status(404).json({
          code: 404,
          message: 'Content not found'
        });
        return;
      }

      res.json({
        code: 200,
        message: 'success',
        data: content
      });
    } catch (error) {
      logger.error('🎬 获取内容详情失败:', error);
      next(error);
    }
  }

  async recordView(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { contentId } = req.params;
      const { deviceId = 'unknown', playDuration = 0 } = req.body;

      await vodService.recordView(contentId, deviceId, playDuration);

      res.json({
        code: 200,
        message: 'View recorded successfully'
      });
    } catch (error) {
      logger.error('🎬 记录观看失败:', error);
      next(error);
    }
  }

  async getCategories(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const categories = await vodService.getCategories();

      res.json({
        code: 200,
        message: 'success',
        data: categories
      });
    } catch (error) {
      logger.error('🎬 获取分类失败:', error);
      next(error);
    }
  }
}

export default new VodController();
