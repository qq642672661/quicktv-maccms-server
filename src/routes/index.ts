import { Router } from 'express';
import userRoutes from './user.routes';
import videoRoutes from './video.routes';

const router = Router();

router.get('/', (req, res) => {
  res.json({
    message: 'QuickTV-MacCMS API Server',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      metrics: '/metrics',
      users: '/api/users',
      videos: '/api/videos',
    },
  });
});

router.use('/users', userRoutes);
router.use('/videos', videoRoutes);

export default router;
