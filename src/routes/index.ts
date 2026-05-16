import express from 'express'
import liveRoutes from './live.routes'
import vodRoutes from './vod.routes'
import userRoutes from './user.routes'
import adminRoutes from './admin.routes.pg'

const router = express.Router()

router.get('/health', (_req, res) => {
  res.json({
    code: 200,
    message: 'QuickTV MacCMS Server API',
    version: '2.0.0',
    timestamp: new Date().toISOString(),
    database: 'PostgreSQL',
    cache: 'Redis'
  })
})

router.use('/live', liveRoutes)
router.use('/vod', vodRoutes)
router.use('/users', userRoutes)
router.use('/admin', adminRoutes)

export default router
