import { Router } from 'express'
import liveRoutes from './live.routes'

const router = Router()

router.use('/live', liveRoutes)

router.get('/health', (_req, res) => {
  res.json({
    code: 200,
    message: 'OK',
    data: {
      status: 'healthy',
      timestamp: new Date().toISOString()
    }
  })
})

export default router
