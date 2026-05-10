import { Router } from 'express';

const router = Router();

router.get('/', (req, res) => {
  res.json({
    message: 'QuickTV-MacCMS API Server',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      metrics: '/metrics',
      api: '/api'
    }
  });
});

export default router;
