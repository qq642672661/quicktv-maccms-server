/**
 * 视频路由模块
 * 定义所有与视频相关的API路由
 * 功能：
 * 1. 视频列表查询（支持分页、筛选）
 * 2. 视频搜索
 * 3. 视频详情获取
 * 4. 特色视频、热门视频、最新视频
 * 5. 视频管理（创建、更新、删除）- 需要管理员权限
 * 6. 视频互动（播放记录、点赞、评分）
 */

import { Router, type Router as RouterType } from 'express';
import { videoController } from '../controllers/video.controller';
import { authMiddleware, requireAdmin } from '../middleware/auth';
import { validateBody, validateQuery } from '../middleware/validate';
import {
  createVideoSchema,
  updateVideoSchema,
  rateVideoSchema,
  videoListQuerySchema,
  searchVideosQuerySchema,
} from '../validators/video.validator';

// 创建路由实例
const router: RouterType = Router();

// ==================== 公开API（无需认证） ====================

/**
 * GET /videos
 * 获取视频列表
 * 查询参数：
 * - page: 页码（默认1）
 * - limit: 每页数量（默认20）
 * - category: 分类ID（可选）
 * - sort: 排序方式（可选）
 */
router.get(
  '/',
  validateQuery(videoListQuerySchema),  // 验证查询参数
  videoController.getVideoList           // 调用控制器方法
);

/**
 * GET /videos/search
 * 搜索视频
 * 查询参数：
 * - keyword: 搜索关键词（必需）
 * - page: 页码（默认1）
 * - limit: 每页数量（默认20）
 */
router.get(
  '/search',
  validateQuery(searchVideosQuerySchema),  // 验证查询参数
  videoController.searchVideos              // 调用控制器方法
);

/**
 * GET /videos/featured
 * 获取特色推荐视频
 * 返回编辑精选的优质视频列表
 */
router.get(
  '/featured',
  videoController.getFeaturedVideos
);

/**
 * GET /videos/popular
 * 获取热门视频
 * 根据播放量、点赞数等指标排序
 */
router.get(
  '/popular',
  videoController.getPopularVideos
);

/**
 * GET /videos/latest
 * 获取最新视频
 * 按发布时间倒序排列
 */
router.get(
  '/latest',
  videoController.getLatestVideos
);

/**
 * GET /videos/:videoId
 * 获取视频详情
 * 路径参数：
 * - videoId: 视频ID
 * 返回视频的完整信息，包括播放地址、演员、导演等
 */
router.get(
  '/:videoId',
  videoController.getVideoById
);

// ==================== 管理员API（需要认证和管理员权限） ====================

/**
 * POST /videos
 * 创建新视频
 * 需要管理员权限
 * 请求体：视频信息（标题、描述、分类、播放地址等）
 */
router.post(
  '/',
  authMiddleware,                      // 验证用户登录
  requireAdmin(),                      // 验证管理员权限
  validateBody(createVideoSchema),     // 验证请求体
  videoController.createVideo          // 调用控制器方法
);

/**
 * PUT /videos/:videoId
 * 更新视频信息
 * 需要管理员权限
 * 路径参数：
 * - videoId: 视频ID
 * 请求体：要更新的字段
 */
router.put(
  '/:videoId',
  authMiddleware,                      // 验证用户登录
  requireAdmin(),                      // 验证管理员权限
  validateBody(updateVideoSchema),     // 验证请求体
  videoController.updateVideo          // 调用控制器方法
);

/**
 * DELETE /videos/:videoId
 * 删除视频
 * 需要管理员权限
 * 路径参数：
 * - videoId: 视频ID
 */
router.delete(
  '/:videoId',
  authMiddleware,                      // 验证用户登录
  requireAdmin(),                      // 验证管理员权限
  videoController.deleteVideo          // 调用控制器方法
);

// ==================== 用户互动API ====================

/**
 * POST /videos/:videoId/play
 * 记录视频播放
 * 用于统计播放次数，无需认证
 * 路径参数：
 * - videoId: 视频ID
 */
router.post(
  '/:videoId/play',
  videoController.recordPlay
);

/**
 * POST /videos/:videoId/like
 * 点赞视频
 * 需要用户登录
 * 路径参数：
 * - videoId: 视频ID
 */
router.post(
  '/:videoId/like',
  authMiddleware,                      // 验证用户登录
  videoController.likeVideo            // 调用控制器方法
);

/**
 * POST /videos/:videoId/rate
 * 评分视频
 * 需要用户登录
 * 路径参数：
 * - videoId: 视频ID
 * 请求体：
 * - rating: 评分（1-10）
 */
router.post(
  '/:videoId/rate',
  authMiddleware,                      // 验证用户登录
  validateBody(rateVideoSchema),       // 验证请求体
  videoController.rateVideo            // 调用控制器方法
);

// 导出路由
export default router;
