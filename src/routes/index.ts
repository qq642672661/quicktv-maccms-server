import { Router } from 'express';
import userRoutes from './user.routes';

const router = Router();

router.get('/', (req, res) => {
  res.json({
    message: 'QuickTV-MacCMS API Server',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      metrics: '/metrics',
      users: '/api/users',
    },
  });
});

router.use('/users', userRoutes);

export default router;
