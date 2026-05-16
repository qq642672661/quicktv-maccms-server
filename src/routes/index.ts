import { Router } from 'express'
import liveRoutes from './live.routes'
import vodRoutes from './vod.routes'

const router = Router()

router.use('/live', liveRoutes)
router.use('/vod', vodRoutes)

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
