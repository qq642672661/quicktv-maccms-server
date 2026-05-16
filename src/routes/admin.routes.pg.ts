import express, { type Router as RouterType } from 'express';
import { MediaService } from '../services/media.service.pg';
import { TabService } from '../services/tab.service.pg';
import logger from '../utils/logger';
import { authMiddleware } from '../middleware/auth';

const router: RouterType = express.Router();

router.use(authMiddleware);

router.get('/media', async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const category = req.query.category as string;

    const result = await MediaService.getMediaList(page, limit, category);

    return res.json({
      code: 200,
      message: 'success',
      data: result.data,
      total: result.total,
      page,
      limit
    });
  } catch (error) {
    logger.error('获取媒体列表失败:', error);
    return res.status(500).json({
      code: 500,
      message: 'Internal server error'
    });
  }
});

router.get('/media/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const media = await MediaService.getMediaById(id);

    if (!media) {
      return res.status(404).json({
        code: 404,
        message: 'Media not found'
      });
    }

    return res.json({
      code: 200,
      message: 'success',
      data: media
    });
  } catch (error) {
    logger.error('获取媒体失败:', error);
    return res.status(500).json({
      code: 500,
      message: 'Internal server error'
    });
  }
});

router.post('/media', async (req, res) => {
  try {
    const media = req.body;
    const id = await MediaService.createMedia(media);

    return res.json({
      code: 200,
      message: 'success',
      data: { id }
    });
  } catch (error) {
    logger.error('创建媒体失败:', error);
    return res.status(500).json({
      code: 500,
      message: 'Internal server error'
    });
  }
});

router.put('/media/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const media = req.body;
    const success = await MediaService.updateMedia(id, media);

    if (!success) {
      return res.status(404).json({
        code: 404,
        message: 'Media not found or no changes'
      });
    }

    return res.json({
      code: 200,
      message: 'success'
    });
  } catch (error) {
    logger.error('更新媒体失败:', error);
    return res.status(500).json({
      code: 500,
      message: 'Internal server error'
    });
  }
});

router.delete('/media/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const success = await MediaService.deleteMedia(id);

    if (!success) {
      return res.status(404).json({
        code: 404,
        message: 'Media not found'
      });
    }

    return res.json({
      code: 200,
      message: 'success'
    });
  } catch (error) {
    logger.error('删除媒体失败:', error);
    return res.status(500).json({
      code: 500,
      message: 'Internal server error'
    });
  }
});

router.get('/tabs', async (_req, res) => {
  try {
    const tabs = await TabService.getAllTabs();

    return res.json({
      code: 200,
      message: 'success',
      data: tabs
    });
  } catch (error) {
    logger.error('获取Tab列表失败:', error);
    return res.status(500).json({
      code: 500,
      message: 'Internal server error'
    });
  }
});

router.post('/tabs', async (req, res) => {
  try {
    const tab = req.body;
    const id = await TabService.createTab(tab);

    return res.json({
      code: 200,
      message: 'success',
      data: { id }
    });
  } catch (error) {
    logger.error('创建Tab失败:', error);
    return res.status(500).json({
      code: 500,
      message: 'Internal server error'
    });
  }
});

router.put('/tabs/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const tab = req.body;
    const success = await TabService.updateTab(id, tab);

    if (!success) {
      return res.status(404).json({
        code: 404,
        message: 'Tab not found or no changes'
      });
    }

    return res.json({
      code: 200,
      message: 'success'
    });
  } catch (error) {
    logger.error('更新Tab失败:', error);
    return res.status(500).json({
      code: 500,
      message: 'Internal server error'
    });
  }
});

router.delete('/tabs/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const success = await TabService.deleteTab(id);

    if (!success) {
      return res.status(404).json({
        code: 404,
        message: 'Tab not found'
      });
    }

    return res.json({
      code: 200,
      message: 'success'
    });
  } catch (error) {
    logger.error('删除Tab失败:', error);
    return res.status(500).json({
      code: 500,
      message: 'Internal server error'
    });
  }
});

export default router;
