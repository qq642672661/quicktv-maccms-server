import express from 'express';
import liveRoutes from './live.routes.sqlite';
import vodRoutes from './vod.routes.sqlite';
import hellotvRoutes from './hellotv.routes';
import adminRoutes from './admin.routes';

const router = express.Router();

router.get('/health', (_req, res) => {
  res.json({
    code: 200,
    message: 'QuickTV API is running',
    timestamp: new Date().toISOString(),
    database: 'SQLite'
  });
});

router.use('/live', liveRoutes);
router.use('/vod', vodRoutes);
router.use('/v2/zero/arrange', hellotvRoutes);
router.use('/admin', adminRoutes);

export default router;
