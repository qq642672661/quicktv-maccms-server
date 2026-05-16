/**
 * 直播路由模块
 * 定义所有与直播频道相关的API路由
 * 功能：
 * 1. 频道列表查询（支持分页、分类筛选）
 * 2. 频道详情获取
 * 3. 频道管理（创建、更新、状态控制）
 * 4. 直播流信息获取
 * 5. 观看统计和记录
 * 6. 分类列表查询
 */

import { Router, type Router as RouterType } from "express";
import liveController from "../controllers/live.controller";

// 创建路由实例
const router: RouterType = Router();

// ==================== 公开API（无需认证） ====================

/**
 * GET /live/channels
 * 获取直播频道列表
 * 查询参数：
 * - page: 页码（默认1）
 * - limit: 每页数量（默认20）
 * - category: 频道分类（可选，如：央视、卫视等）
 * - keyword: 搜索关键词（可选）
 * 返回频道列表，包含频道名称、Logo、分类、状态等信息
 */
router.get("/channels", liveController.getChannelList.bind(liveController));

/**
 * GET /live/channels/:channelId
 * 获取频道详情
 * 路径参数：
 * - channelId: 频道ID
 * 返回频道的完整信息，包括直播流地址、EPG信息等
 */
router.get(
  "/channels/:channelId",
  liveController.getChannelDetail.bind(liveController),
);

/**
 * GET /live/channels/:channelId/stream
 * 获取直播流信息
 * 路径参数：
 * - channelId: 频道ID
 * 返回可用的直播流URL和协议信息（HLS、RTMP、FLV等）
 */
router.get(
  "/channels/:channelId/stream",
  liveController.getStreamInfo.bind(liveController),
);

/**
 * GET /live/channels/:channelId/stats
 * 获取频道观看统计
 * 路径参数：
 * - channelId: 频道ID
 * 返回频道的观看人数、历史统计等数据
 */
router.get(
  "/channels/:channelId/stats",
  liveController.getViewStats.bind(liveController),
);

/**
 * GET /live/categories
 * 获取直播分类列表
 * 返回所有可用的频道分类（央视、卫视、地方、体育等）
 */
router.get("/categories", liveController.getCategoryList.bind(liveController));

// ==================== 用户互动API ====================

/**
 * POST /live/channels/:channelId/view
 * 记录观看行为
 * 路径参数：
 * - channelId: 频道ID
 * 请求体：
 * - deviceId: 设备ID（用于统计唯一观看数）
 * 用于统计频道观看人数和观看时长
 */
router.post(
  "/channels/:channelId/view",
  liveController.recordView.bind(liveController),
);

// ==================== 管理员API（需要认证和管理员权限） ====================

/**
 * POST /live/channels
 * 创建新频道
 * 需要管理员权限
 * 请求体：
 * - name: 频道名称
 * - category: 频道分类
 * - logo: 频道Logo URL
 * - streamUrl: 直播流地址
 * - description: 频道描述（可选）
 */
router.post("/channels", liveController.createChannel.bind(liveController));

/**
 * PUT /live/channels/:channelId
 * 更新频道信息
 * 需要管理员权限
 * 路径参数：
 * - channelId: 频道ID
 * 请求体：要更新的字段（名称、分类、Logo、流地址等）
 */
router.put(
  "/channels/:channelId",
  liveController.updateChannel.bind(liveController),
);

/**
 * POST /live/channels/:channelId/status
 * 更新频道状态
 * 需要管理员权限
 * 路径参数：
 * - channelId: 频道ID
 * 请求体：
 * - status: 频道状态（online/offline/maintenance）
 * 用于控制频道的上线、下线和维护状态
 */
router.post(
  "/channels/:channelId/status",
  liveController.updateChannelStatus.bind(liveController),
);

// 导出路由
export default router;
