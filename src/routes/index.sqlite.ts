import { Router } from 'express';
import liveController from '../controllers/live.controller.sqlite';
import vodController from '../controllers/vod.controller.sqlite';
import hellotvRoutes from './hellotv.routes';

const router = Router();

router.get('/health', (_req, res) => {
  res.json({
    code: 200,
    message: 'QuickTV API is running',
    timestamp: new Date().toISOString(),
    database: 'SQLite'
  });
});

router.use(hellotvRoutes);

router.get('/live/channels', liveController.getChannelList.bind(liveController));
router.get('/live/channels/:channelId', liveController.getChannelDetail.bind(liveController));
router.post('/live/channels/:channelId/view', liveController.recordView.bind(liveController));
router.get('/live/categories', liveController.getCategories.bind(liveController));

router.get('/vod/content', vodController.getContentList.bind(vodController));
router.get('/vod/content/:contentId', vodController.getContentDetail.bind(vodController));
router.post('/vod/content/:contentId/view', vodController.recordView.bind(vodController));
router.get('/vod/categories', vodController.getCategories.bind(vodController));

export default router;
