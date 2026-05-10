import { Request, Response, NextFunction } from 'express'
import liveService from '../services/live.service'
import logger from '../utils/logger'

class LiveController {
  async getChannelList(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { category, page = '1', limit = '20' } = req.query
      
      const result = await liveService.getChannelList(
        category as string,
        parseInt(page as string),
        parseInt(limit as string)
      )

      res.json({
        code: 200,
        message: 'success',
        data: result
      })
    } catch (error) {
      logger.error('Get channel list error:', error)
      next(error)
    }
  }

  async getChannelDetail(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { channelId } = req.params
      
      const channel = await liveService.getChannelDetail(channelId)
      
      if (!channel) {
        res.status(404).json({
          code: 404,
          message: 'Channel not found'
        })
        return
      }

      res.json({
        code: 200,
        message: 'success',
        data: channel
      })
    } catch (error) {
      logger.error('Get channel detail error:', error)
      next(error)
    }
  }

  async createChannel(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const channel = await liveService.createChannel(req.body)
      
      res.status(201).json({
        code: 201,
        message: 'Channel created successfully',
        data: channel
      })
    } catch (error) {
      logger.error('Create channel error:', error)
      next(error)
    }
  }

  async updateChannel(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { channelId } = req.params
      
      const channel = await liveService.updateChannel(channelId, req.body)
      
      if (!channel) {
        res.status(404).json({
          code: 404,
          message: 'Channel not found'
        })
        return
      }

      res.json({
        code: 200,
        message: 'Channel updated successfully',
        data: channel
      })
    } catch (error) {
      logger.error('Update channel error:', error)
      next(error)
    }
  }

  async updateChannelStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { channelId } = req.params
      const { status } = req.body
      
      const success = await liveService.updateChannelStatus(channelId, status)
      
      if (!success) {
        res.status(404).json({
          code: 404,
          message: 'Channel not found'
        })
        return
      }

      res.json({
        code: 200,
        message: 'Channel status updated successfully'
      })
    } catch (error) {
      logger.error('Update channel status error:', error)
      next(error)
    }
  }

  async getStreamInfo(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { channelId } = req.params
      const { quality } = req.query
      
      const streamInfo = await liveService.getStreamInfo(channelId, quality as string)
      
      if (!streamInfo) {
        res.status(404).json({
          code: 404,
          message: 'Channel not found'
        })
        return
      }

      res.json({
        code: 200,
        message: 'success',
        data: streamInfo
      })
    } catch (error) {
      logger.error('Get stream info error:', error)
      next(error)
    }
  }

  async getViewStats(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { channelId } = req.params
      
      const stats = await liveService.getViewStats(channelId)
      
      res.json({
        code: 200,
        message: 'success',
        data: stats
      })
    } catch (error) {
      logger.error('Get view stats error:', error)
      next(error)
    }
  }

  async recordView(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { channelId } = req.params
      const { deviceId } = req.body
      
      await liveService.recordView(channelId, deviceId)
      
      res.json({
        code: 200,
        message: 'View recorded successfully'
      })
    } catch (error) {
      logger.error('Record view error:', error)
      next(error)
    }
  }

  async getCategoryList(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const categories = await liveService.getCategoryList()
      
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
}

export default new LiveController()
