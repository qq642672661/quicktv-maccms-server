import { Router } from 'express';
import { videoController } from '../controllers/video.controller';
import { authMiddleware, requireAdmin } from '../middleware/auth';
import { validateBody, validateQuery } from '../middleware/validate';
import {
  createVideoSchema,
  updateVideoSchema,
  rateVideoSchema,
  videoListQuerySchema,
  searchVideosQuerySchema,
} from '../validators/video.validator';

const router = Router();

router.get(
  '/',
  validateQuery(videoListQuerySchema),
  videoController.getVideoList
);

router.get(
  '/search',
  validateQuery(searchVideosQuerySchema),
  videoController.searchVideos
);

router.get(
  '/featured',
  videoController.getFeaturedVideos
);

router.get(
  '/popular',
  videoController.getPopularVideos
);

router.get(
  '/latest',
  videoController.getLatestVideos
);

router.get(
  '/:videoId',
  videoController.getVideoById
);

router.post(
  '/',
  authMiddleware,
  requireAdmin(),
  validateBody(createVideoSchema),
  videoController.createVideo
);

router.put(
  '/:videoId',
  authMiddleware,
  requireAdmin(),
  validateBody(updateVideoSchema),
  videoController.updateVideo
);

router.delete(
  '/:videoId',
  authMiddleware,
  requireAdmin(),
  videoController.deleteVideo
);

router.post(
  '/:videoId/play',
  videoController.recordPlay
);

router.post(
  '/:videoId/like',
  authMiddleware,
  videoController.likeVideo
);

router.post(
  '/:videoId/rate',
  authMiddleware,
  validateBody(rateVideoSchema),
  videoController.rateVideo
);

export default router;
