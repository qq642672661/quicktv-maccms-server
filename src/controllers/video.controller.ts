import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import { videoService } from '../services/video.service';

export class VideoController {
  async createVideo(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const video = await videoService.createVideo(req.body);

      res.status(201).json({
        success: true,
        message: '视频创建成功',
        data: video,
      });
    } catch (error) {
      next(error);
    }
  }

  async getVideoById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { videoId } = req.params;
      const video = await videoService.getVideoById(videoId);

      res.json({
        success: true,
        data: video,
      });
    } catch (error) {
      next(error);
    }
  }

  async getVideoList(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const query = {
        page: parseInt(req.query.page as string) || 1,
        pageSize: parseInt(req.query.pageSize as string) || 20,
        category_id: req.query.category_id as string,
        status: req.query.status as string,
        is_featured: req.query.is_featured === 'true' ? true : undefined,
        search: req.query.search as string,
        sort: req.query.sort as 'latest' | 'popular' | 'rating',
      };

      const result = await videoService.getVideoList(query);

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async searchVideos(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const keyword = req.query.keyword as string;
      const page = parseInt(req.query.page as string) || 1;
      const pageSize = parseInt(req.query.pageSize as string) || 20;

      if (!keyword) {
        res.status(400).json({
          success: false,
          message: '搜索关键词不能为空',
        });
        return;
      }

      const result = await videoService.searchVideos(keyword, page, pageSize);

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async updateVideo(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { videoId } = req.params;
      const video = await videoService.updateVideo(videoId, req.body);

      res.json({
        success: true,
        message: '视频更新成功',
        data: video,
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteVideo(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { videoId } = req.params;
      await videoService.deleteVideo(videoId);

      res.json({
        success: true,
        message: '视频删除成功',
      });
    } catch (error) {
      next(error);
    }
  }

  async recordPlay(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { videoId } = req.params;
      await videoService.incrementViewCount(videoId);

      res.json({
        success: true,
        message: '播放记录成功',
      });
    } catch (error) {
      next(error);
    }
  }

  async likeVideo(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { videoId } = req.params;
      await videoService.incrementLikeCount(videoId);

      res.json({
        success: true,
        message: '点赞成功',
      });
    } catch (error) {
      next(error);
    }
  }

  async rateVideo(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { videoId } = req.params;
      const { rating } = req.body;

      await videoService.updateRating(videoId, rating);

      res.json({
        success: true,
        message: '评分成功',
      });
    } catch (error) {
      next(error);
    }
  }

  async getFeaturedVideos(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const videos = await videoService.getFeaturedVideos(limit);

      res.json({
        success: true,
        data: videos,
      });
    } catch (error) {
      next(error);
    }
  }

  async getPopularVideos(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const videos = await videoService.getPopularVideos(limit);

      res.json({
        success: true,
        data: videos,
      });
    } catch (error) {
      next(error);
    }
  }

  async getLatestVideos(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const videos = await videoService.getLatestVideos(limit);

      res.json({
        success: true,
        data: videos,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const videoController = new VideoController();
