/**
 * 点播服务层
 * 处理视频点播的业务逻辑，包括数据库操作和缓存管理
 * 
 * 主要功能：
 * 1. 内容的增删改查操作
 * 2. Redis缓存管理（提高查询性能）
 * 3. 分类管理
 * 4. 观看统计
 * 5. 热门和最新内容推荐
 */

import database from '../database'
import redisCache from '../cache/redis'
import logger from '../utils/logger'
import { VodContent, VodCategory, CreateVodDto, UpdateVodDto } from '../types/vod'
import { v4 as uuidv4 } from 'uuid'

/**
 * 点播服务类
 * 封装所有点播相关的业务逻辑
 */
class VodService {
  // Redis缓存键前缀
  private readonly CACHE_PREFIX = 'vod:'
  // 缓存过期时间（秒）
  private readonly CACHE_TTL = 300

  /**
   * 获取点播内容列表
   * 支持按类型、分类筛选，支持分页，使用Redis缓存提高性能
   * 
   * @param type - 内容类型（movie: 电影, tv: 电视剧）
   * @param category - 分类名称
   * @param page - 页码，从1开始
   * @param limit - 每页数量
   * @returns 包含总数、内容列表和分类列表的对象
   */
  async getContentList(
    type?: 'movie' | 'tv',
    category?: string,
    page: number = 1,
    limit: number = 20
  ): Promise<{ total: number; items: VodContent[]; categories: VodCategory[] }> {
    // 生成缓存键
    const cacheKey = `${this.CACHE_PREFIX}content:${type || 'all'}:${category || 'all'}:${page}:${limit}`
    
    // 尝试从缓存获取数据
    const cached = await redisCache.get<{ total: number; items: VodContent[]; categories: VodCategory[] }>(cacheKey)
    if (cached) {
      logger.debug('Cache hit for vod content list')
      return cached
    }

    // 计算分页偏移量
    const offset = (page - 1) * limit
    
    // 构建查询SQL：只查询在线状态的内容
    let query = 'SELECT * FROM vod_content WHERE status = $1'
    const params: any[] = ['online']

    // 添加类型筛选条件
    if (type) {
      params.push(type)
      query += ` AND type = $${params.length}`
    }

    // 添加分类筛选条件
    if (category) {
      params.push(category)
      query += ` AND category = $${params.length}`
    }

    // 按创建时间倒序排列
    query += ' ORDER BY created_at DESC'
    params.push(limit, offset)
    query += ` LIMIT $${params.length - 1} OFFSET $${params.length}`

    // 构建计数查询SQL
    let countQuery = 'SELECT COUNT(*) FROM vod_content WHERE status = $1'
    const countParams: any[] = ['online']
    
    if (type) {
      countParams.push(type)
      countQuery += ` AND type = $${countParams.length}`
    }
    
    if (category) {
      countParams.push(category)
      countQuery += ` AND category = $${countParams.length}`
    }

    // 并行执行三个查询：内容列表、总数、分类列表
    const [contentResult, countResult, categoriesResult] = await Promise.all([
      database.query(query, params),
      database.query(countQuery, countParams),
      this.getCategoryList(type)
    ])

    // 组装结果
    const result = {
      total: parseInt(countResult.rows[0].count),
      items: contentResult.rows.map(this.mapContentFromDb),
      categories: categoriesResult
    }

    // 将结果存入缓存
    await redisCache.set(cacheKey, result, this.CACHE_TTL)
    return result
  }

  /**
   * 获取点播内容详情
   * 根据内容ID获取完整信息，使用Redis缓存
   * 
   * @param contentId - 内容ID
   * @returns 内容详情对象，不存在则返回null
   */
  async getContentDetail(contentId: string): Promise<VodContent | null> {
    const cacheKey = `${this.CACHE_PREFIX}content:${contentId}`
    
    // 尝试从缓存获取
    const cached = await redisCache.get<VodContent>(cacheKey)
    if (cached) {
      return cached
    }

    // 从数据库查询
    const result = await database.query(
      'SELECT * FROM vod_content WHERE id = $1',
      [contentId]
    )

    if (result.rows.length === 0) {
      return null
    }

    // 转换数据格式并存入缓存
    const content = this.mapContentFromDb(result.rows[0])
    await redisCache.set(cacheKey, content, this.CACHE_TTL)
    return content
  }

  /**
   * 创建点播内容
   * 添加新的视频内容到数据库，并清除相关缓存
   * 
   * @param data - 创建内容的数据传输对象
   * @returns 创建成功的内容对象
   */
  async createContent(data: CreateVodDto): Promise<VodContent> {
    // 生成唯一ID
    const id = uuidv4()
    const now = new Date()

    // 插入数据库
    const result = await database.query(
      `INSERT INTO vod_content 
       (id, title, type, cover, description, year, rating, director, actors, category, video_url, status, view_count, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
       RETURNING *`,
      [
        id,
        data.title,
        data.type,
        data.cover,
        data.description || null,
        data.year || null,
        data.rating || null,
        data.director || null,
        data.actors || null,
        data.category,
        data.videoUrl,
        'online',
        0,
        now,
        now
      ]
    )

    // 清除列表缓存（因为新增了内容）
    await redisCache.delPattern(`${this.CACHE_PREFIX}content:*`)
    return this.mapContentFromDb(result.rows[0])
  }

  /**
   * 更新点播内容
   * 修改已存在的视频内容信息，并清除相关缓存
   * 
   * @param contentId - 内容ID
   * @param data - 更新内容的数据传输对象
   * @returns 更新后的内容对象，不存在则返回null
   */
  async updateContent(contentId: string, data: UpdateVodDto): Promise<VodContent | null> {
    const updates: string[] = []
    const params: any[] = []
    let paramIndex = 1

    // 动态构建更新字段（只更新提供的字段）
    if (data.title !== undefined) {
      updates.push(`title = $${paramIndex++}`)
      params.push(data.title)
    }
    if (data.cover !== undefined) {
      updates.push(`cover = $${paramIndex++}`)
      params.push(data.cover)
    }
    if (data.description !== undefined) {
      updates.push(`description = $${paramIndex++}`)
      params.push(data.description)
    }
    if (data.year !== undefined) {
      updates.push(`year = $${paramIndex++}`)
      params.push(data.year)
    }
    if (data.rating !== undefined) {
      updates.push(`rating = $${paramIndex++}`)
      params.push(data.rating)
    }
    if (data.director !== undefined) {
      updates.push(`director = $${paramIndex++}`)
      params.push(data.director)
    }
    if (data.actors !== undefined) {
      updates.push(`actors = $${paramIndex++}`)
      params.push(data.actors)
    }
    if (data.category !== undefined) {
      updates.push(`category = $${paramIndex++}`)
      params.push(data.category)
    }
    if (data.videoUrl !== undefined) {
      updates.push(`video_url = $${paramIndex++}`)
      params.push(data.videoUrl)
    }
    if (data.status !== undefined) {
      updates.push(`status = $${paramIndex++}`)
      params.push(data.status)
    }

    // 如果没有需要更新的字段，直接返回当前内容
    if (updates.length === 0) {
      return this.getContentDetail(contentId)
    }

    // 添加更新时间
    updates.push(`updated_at = $${paramIndex++}`)
    params.push(new Date())
    params.push(contentId)

    // 执行更新
    const result = await database.query(
      `UPDATE vod_content SET ${updates.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
      params
    )

    if (result.rows.length === 0) {
      return null
    }

    // 清除相关缓存
    await redisCache.del(`${this.CACHE_PREFIX}content:${contentId}`)
    await redisCache.delPattern(`${this.CACHE_PREFIX}content:*`)

    return this.mapContentFromDb(result.rows[0])
  }

  /**
   * 记录观看次数
   * 增加视频的观看计数，用于统计和推荐
   * 
   * @param contentId - 内容ID
   * @returns 是否记录成功
   */
  async recordView(contentId: string): Promise<boolean> {
    const result = await database.query(
      'UPDATE vod_content SET view_count = view_count + 1 WHERE id = $1',
      [contentId]
    )

    if (result.rowCount > 0) {
      await redisCache.del(`${this.CACHE_PREFIX}content:${contentId}`)
      return true
    }

    return false
  }

  async getCategoryList(type?: 'movie' | 'tv'): Promise<VodCategory[]> {
    const cacheKey = `${this.CACHE_PREFIX}categories:${type || 'all'}`
    
    const cached = await redisCache.get<VodCategory[]>(cacheKey)
    if (cached) {
      return cached
    }

    let query = `
      SELECT 
        category as name,
        type,
        COUNT(*) as content_count
      FROM vod_content
      WHERE status = 'online'
    `
    
    const params: any[] = []
    
    if (type) {
      params.push(type)
      query += ` AND type = $${params.length}`
    }
    
    query += ' GROUP BY category, type ORDER BY content_count DESC'

    const result = await database.query(query, params)

    const categories: VodCategory[] = result.rows.map(row => ({
      id: `${row.type}-${row.name}`,
      name: row.name,
      type: row.type,
      contentCount: parseInt(row.content_count)
    }))

    await redisCache.set(cacheKey, categories, this.CACHE_TTL)
    return categories
  }

  async getPopularContent(type?: 'movie' | 'tv', limit: number = 10): Promise<VodContent[]> {
    const cacheKey = `${this.CACHE_PREFIX}popular:${type || 'all'}:${limit}`
    
    const cached = await redisCache.get<VodContent[]>(cacheKey)
    if (cached) {
      return cached
    }

    let query = 'SELECT * FROM vod_content WHERE status = $1'
    const params: any[] = ['online']

    if (type) {
      params.push(type)
      query += ` AND type = $${params.length}`
    }

    params.push(limit)
    query += ` ORDER BY view_count DESC, rating DESC LIMIT $${params.length}`

    const result = await database.query(query, params)
    const content = result.rows.map(this.mapContentFromDb)

    await redisCache.set(cacheKey, content, this.CACHE_TTL)
    return content
  }

  async getLatestContent(type?: 'movie' | 'tv', limit: number = 10): Promise<VodContent[]> {
    const cacheKey = `${this.CACHE_PREFIX}latest:${type || 'all'}:${limit}`
    
    const cached = await redisCache.get<VodContent[]>(cacheKey)
    if (cached) {
      return cached
    }

    let query = 'SELECT * FROM vod_content WHERE status = $1'
    const params: any[] = ['online']

    if (type) {
      params.push(type)
      query += ` AND type = $${params.length}`
    }

    params.push(limit)
    query += ` ORDER BY created_at DESC LIMIT $${params.length}`

    const result = await database.query(query, params)
    const content = result.rows.map(this.mapContentFromDb)

    await redisCache.set(cacheKey, content, this.CACHE_TTL)
    return content
  }

  private mapContentFromDb(row: any): VodContent {
    return {
      id: row.id,
      title: row.title,
      type: row.type,
      cover: row.cover,
      description: row.description,
      year: row.year,
      rating: row.rating ? parseFloat(row.rating) : undefined,
      director: row.director,
      actors: row.actors,
      category: row.category,
      videoUrl: row.video_url,
      status: row.status,
      viewCount: row.view_count,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    }
  }
}

export default new VodService()
