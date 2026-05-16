import { Request, Response, NextFunction } from 'express'
import vodService from '../services/vod.service'
import logger from '../utils/logger'

class VodController {
  async getContentList(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { type, category, page = '1', limit = '20' } = req.query

      logger.info(`[测试] 获取点播内容列表 - 类型: ${type || '全部'}, 分类: ${category || '全部'}, 页码: ${page}, 每页: ${limit}`)

      const result = await vodService.getContentList(
        type as 'movie' | 'tv' | undefined,
        category as string,
        parseInt(page as string),
        parseInt(limit as string)
      )

      logger.info(`[测试] 返回 ${result.items?.length || 0} 个内容, 总数: ${result.total || 0}`)

      res.json({
        code: 200,
        message: 'success',
        data: result
      })
    } catch (error) {
      logger.error('Get content list error:', error)
      next(error)
    }
  }

  async getContentDetail(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { contentId } = req.params

      const content = await vodService.getContentDetail(contentId)

      if (!content) {
        res.status(404).json({
          code: 404,
          message: 'Content not found'
        })
        return
      }

      res.json({
        code: 200,
        message: 'success',
        data: content
      })
    } catch (error) {
      logger.error('Get content detail error:', error)
      next(error)
    }
  }

  async createContent(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const content = await vodService.createContent(req.body)

      res.status(201).json({
        code: 201,
        message: 'Content created successfully',
        data: content
      })
    } catch (error) {
      logger.error('Create content error:', error)
      next(error)
    }
  }

  async updateContent(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { contentId } = req.params

      const content = await vodService.updateContent(contentId, req.body)

      if (!content) {
        res.status(404).json({
          code: 404,
          message: 'Content not found'
        })
        return
      }

      res.json({
        code: 200,
        message: 'Content updated successfully',
        data: content
      })
    } catch (error) {
      logger.error('Update content error:', error)
      next(error)
    }
  }

  async recordView(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { contentId } = req.params
      const { deviceId } = req.body

      logger.info(`[测试] 🎬 记录点播观看 - 内容ID: ${contentId}, 设备ID: ${deviceId}`)

      const success = await vodService.recordView(contentId)

      if (!success) {
        res.status(404).json({
          code: 404,
          message: 'Content not found'
        })
        return
      }

      logger.info(`[测试] ✅ 点播观看记录成功`)

      res.json({
        code: 200,
        message: 'View recorded successfully'
      })
    } catch (error) {
      logger.error('Record view error:', error)
      next(error)
    }
  }

  async getCategoryList(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { type } = req.query

      const categories = await vodService.getCategoryList(type as 'movie' | 'tv' | undefined)

      res.json({
        code: 200,
        message: 'success',
        data: categories
      })
    } catch (error) {
      logger.error('Get category list error:', error)
      next(error)
    }
  }

  async getPopularContent(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { type, limit = '10' } = req.query

      const content = await vodService.getPopularContent(
        type as 'movie' | 'tv' | undefined,
        parseInt(limit as string)
      )

      res.json({
        code: 200,
        message: 'success',
        data: content
      })
    } catch (error) {
      logger.error('Get popular content error:', error)
      next(error)
    }
  }

  async getLatestContent(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { type, limit = '10' } = req.query

      const content = await vodService.getLatestContent(
        type as 'movie' | 'tv' | undefined,
        parseInt(limit as string)
      )

      res.json({
        code: 200,
        message: 'success',
        data: content
      })
    } catch (error) {
      logger.error('Get latest content error:', error)
      next(error)
    }
  }
}

export default new VodController()
