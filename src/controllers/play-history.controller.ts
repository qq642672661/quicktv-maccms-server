import { Request, Response, NextFunction } from 'express';
import { playHistoryService } from '../services/play-history.service';
import { AppError } from '../middleware/error-handler';

export class PlayHistoryController {
  async recordPlay(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;
      const { videoId, progress, duration } = req.body;

      if (!userId) {
        throw new AppError('未授权', 401);
      }

      const history = await playHistoryService.recordPlay(userId, videoId, progress, duration);

      res.json({
        success: true,
        data: history,
      });
    } catch (error) {
      next(error);
    }
  }

  async getPlayHistory(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;
      const page = parseInt(req.query.page as string) || 1;
      const pageSize = parseInt(req.query.pageSize as string) || 20;

      if (!userId) {
        throw new AppError('未授权', 401);
      }

      const result = await playHistoryService.getPlayHistory(userId, page, pageSize);

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async getPlayProgress(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;
      const { videoId } = req.params;

      if (!userId) {
        throw new AppError('未授权', 401);
      }

      const progress = await playHistoryService.getPlayProgress(userId, videoId);

      res.json({
        success: true,
        data: progress,
      });
    } catch (error) {
      next(error);
    }
  }

  async clearHistory(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;
      const { videoId } = req.body;

      if (!userId) {
        throw new AppError('未授权', 401);
      }

      await playHistoryService.clearHistory(userId, videoId);

      res.json({
        success: true,
        message: videoId ? '播放记录已删除' : '播放历史已清空',
      });
    } catch (error) {
      next(error);
    }
  }

  async getContinueWatching(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;
      const limit = parseInt(req.query.limit as string) || 10;

      if (!userId) {
        throw new AppError('未授权', 401);
      }

      const videos = await playHistoryService.getContinueWatching(userId, limit);

      res.json({
        success: true,
        data: videos,
      });
    } catch (error) {
      next(error);
    }
  }

  async getWatchedVideos(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;
      const limit = parseInt(req.query.limit as string) || 20;

      if (!userId) {
        throw new AppError('未授权', 401);
      }

      const videos = await playHistoryService.getWatchedVideos(userId, limit);

      res.json({
        success: true,
        data: videos,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const playHistoryController = new PlayHistoryController();
