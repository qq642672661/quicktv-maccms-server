/**
 * 点播内容控制器
 * 处理视频点播相关的HTTP请求，包括内容列表、详情、创建、更新等
 *
 * 主要功能：
 * 1. 内容列表查询（支持分类、分页）
 * 2. 内容详情获取
 * 3. 内容创建和更新
 * 4. 观看记录统计
 * 5. 分类列表查询
 * 6. 热门和最新内容推荐
 */

import { Request, Response, NextFunction } from 'express'
import vodService from '../services/vod.service'
import logger from '../utils/logger'

/**
 * 点播控制器类
 * 负责处理所有点播相关的API请求
 */
class VodController {
  /**
   * 获取点播内容列表
   * 支持按类型、分类筛选，支持分页
   *
   * @param req - 请求对象，包含查询参数：type（类型）、category（分类）、page（页码）、limit（每页数量）
   * @param res - 响应对象
   * @param next - 下一个中间件函数
   */
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

  /**
   * 获取点播内容详情
   * 根据内容ID获取完整的视频信息
   *
   * @param req - 请求对象，包含路径参数：contentId（内容ID）
   * @param res - 响应对象
   * @param next - 下一个中间件函数
   */
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

  /**
   * 创建点播内容
   * 添加新的视频内容到数据库
   *
   * @param req - 请求对象，包含请求体：视频内容信息
   * @param res - 响应对象
   * @param next - 下一个中间件函数
   */
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

  /**
   * 更新点播内容
   * 修改已存在的视频内容信息
   *
   * @param req - 请求对象，包含路径参数：contentId（内容ID）和请求体：更新的内容信息
   * @param res - 响应对象
   * @param next - 下一个中间件函数
   */
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

  /**
   * 记录观看次数
   * 统计视频的观看数据，用于热门推荐等功能
   *
   * @param req - 请求对象，包含路径参数：contentId（内容ID）和请求体：deviceId（设备ID）
   * @param res - 响应对象
   * @param next - 下一个中间件函数
   */
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

  /**
   * 获取分类列表
   * 获取所有可用的视频分类，支持按类型筛选
   *
   * @param req - 请求对象，包含查询参数：type（类型：movie或tv）
   * @param res - 响应对象
   * @param next - 下一个中间件函数
   */
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

  /**
   * 获取热门内容
   * 根据观看次数返回最受欢迎的视频内容
   *
   * @param req - 请求对象，包含查询参数：type（类型）、limit（数量限制，默认10）
   * @param res - 响应对象
   * @param next - 下一个中间件函数
   */
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

  /**
   * 获取最新内容
   * 根据创建时间返回最新上传的视频内容
   *
   * @param req - 请求对象，包含查询参数：type（类型）、limit（数量限制，默认10）
   * @param res - 响应对象
   * @param next - 下一个中间件函数
   */
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

// 导出控制器单例
export default new VodController()
