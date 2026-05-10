import { Router } from 'express';
import { liveStreamController } from '../controllers/live.controller';
import { authMiddleware, requireAdmin } from '../middleware/auth';

const router = Router();

router.get('/', liveStreamController.getLiveStreamList);
router.get('/live', liveStreamController.getLiveStreams);
router.get('/featured', liveStreamController.getFeaturedLiveStreams);
router.get('/popular', liveStreamController.getPopularLiveStreams);
router.get('/:id', liveStreamController.getLiveStreamById);

router.post('/', authMiddleware, requireAdmin(), liveStreamController.createLiveStream);
router.put('/:id', authMiddleware, requireAdmin(), liveStreamController.updateLiveStream);
router.delete('/:id', authMiddleware, requireAdmin(), liveStreamController.deleteLiveStream);

router.post('/:id/start', authMiddleware, requireAdmin(), liveStreamController.startLiveStream);
router.post('/:id/end', authMiddleware, requireAdmin(), liveStreamController.endLiveStream);
router.post('/:id/join', liveStreamController.joinLiveStream);
router.post('/:id/leave', liveStreamController.leaveLiveStream);
router.post('/:id/like', authMiddleware, liveStreamController.likeLiveStream);

export default router;
