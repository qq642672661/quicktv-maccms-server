import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import { liveStreamService } from '../services/live.service';

export class LiveStreamController {
  async createLiveStream(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const stream = await liveStreamService.createLiveStream(req.body);
      res.status(201).json({ success: true, message: '直播创建成功', data: stream });
    } catch (error) {
      next(error);
    }
  }

  async getLiveStreamById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const stream = await liveStreamService.getLiveStreamById(req.params.id);
      res.json({ success: true, data: stream });
    } catch (error) {
      next(error);
    }
  }

  async getLiveStreamList(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const query = {
        page: parseInt(req.query.page as string) || 1,
        pageSize: parseInt(req.query.pageSize as string) || 20,
        category_id: req.query.category_id as string,
        status: req.query.status as string,
        is_featured: req.query.is_featured === 'true' ? true : undefined,
        search: req.query.search as string,
      };
      const result = await liveStreamService.getLiveStreamList(query);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async updateLiveStream(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const stream = await liveStreamService.updateLiveStream(req.params.id, req.body);
      res.json({ success: true, message: '直播更新成功', data: stream });
    } catch (error) {
      next(error);
    }
  }

  async deleteLiveStream(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await liveStreamService.deleteLiveStream(req.params.id);
      res.json({ success: true, message: '直播删除成功' });
    } catch (error) {
      next(error);
    }
  }

  async startLiveStream(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await liveStreamService.startLiveStream(req.params.id);
      res.json({ success: true, message: '直播已开始' });
    } catch (error) {
      next(error);
    }
  }

  async endLiveStream(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await liveStreamService.endLiveStream(req.params.id);
      res.json({ success: true, message: '直播已结束' });
    } catch (error) {
      next(error);
    }
  }

  async joinLiveStream(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await liveStreamService.incrementViewerCount(req.params.id);
      res.json({ success: true, message: '加入直播成功' });
    } catch (error) {
      next(error);
    }
  }

  async leaveLiveStream(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await liveStreamService.decrementViewerCount(req.params.id);
      res.json({ success: true, message: '离开直播成功' });
    } catch (error) {
      next(error);
    }
  }

  async likeLiveStream(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await liveStreamService.incrementLikeCount(req.params.id);
      res.json({ success: true, message: '点赞成功' });
    } catch (error) {
      next(error);
    }
  }

  async getLiveStreams(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const limit = parseInt(req.query.limit as string) || 20;
      const streams = await liveStreamService.getLiveStreams(limit);
      res.json({ success: true, data: streams });
    } catch (error) {
      next(error);
    }
  }

  async getFeaturedLiveStreams(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const streams = await liveStreamService.getFeaturedLiveStreams(limit);
      res.json({ success: true, data: streams });
    } catch (error) {
      next(error);
    }
  }

  async getPopularLiveStreams(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const streams = await liveStreamService.getPopularLiveStreams(limit);
      res.json({ success: true, data: streams });
    } catch (error) {
      next(error);
    }
  }
}

export const liveStreamController = new LiveStreamController();
