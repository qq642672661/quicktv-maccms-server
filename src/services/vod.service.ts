import database from '../database'
import redisCache from '../cache/redis'
import logger from '../utils/logger'
import { VodContent, VodCategory, CreateVodDto, UpdateVodDto } from '../types/vod'
import { v4 as uuidv4 } from 'uuid'

class VodService {
  private readonly CACHE_PREFIX = 'vod:'
  private readonly CACHE_TTL = 300

  async getContentList(
    type?: 'movie' | 'tv',
    category?: string,
    page: number = 1,
    limit: number = 20
  ): Promise<{ total: number; items: VodContent[]; categories: VodCategory[] }> {
    const cacheKey = `${this.CACHE_PREFIX}content:${type || 'all'}:${category || 'all'}:${page}:${limit}`
    
    const cached = await redisCache.get<{ total: number; items: VodContent[]; categories: VodCategory[] }>(cacheKey)
    if (cached) {
      logger.debug('Cache hit for vod content list')
      return cached
    }

    const offset = (page - 1) * limit
    let query = 'SELECT * FROM vod_content WHERE status = $1'
    const params: any[] = ['online']

    if (type) {
      params.push(type)
      query += ` AND type = $${params.length}`
    }

    if (category) {
      params.push(category)
      query += ` AND category = $${params.length}`
    }

    query += ' ORDER BY created_at DESC'
    params.push(limit, offset)
    query += ` LIMIT $${params.length - 1} OFFSET $${params.length}`

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

    const [contentResult, countResult, categoriesResult] = await Promise.all([
      database.query(query, params),
      database.query(countQuery, countParams),
      this.getCategoryList(type)
    ])

    const result = {
      total: parseInt(countResult.rows[0].count),
      items: contentResult.rows.map(this.mapContentFromDb),
      categories: categoriesResult
    }

    await redisCache.set(cacheKey, result, this.CACHE_TTL)
    return result
  }

  async getContentDetail(contentId: string): Promise<VodContent | null> {
    const cacheKey = `${this.CACHE_PREFIX}content:${contentId}`
    
    const cached = await redisCache.get<VodContent>(cacheKey)
    if (cached) {
      return cached
    }

    const result = await database.query(
      'SELECT * FROM vod_content WHERE id = $1',
      [contentId]
    )

    if (result.rows.length === 0) {
      return null
    }

    const content = this.mapContentFromDb(result.rows[0])
    await redisCache.set(cacheKey, content, this.CACHE_TTL)
    return content
  }

  async createContent(data: CreateVodDto): Promise<VodContent> {
    const id = uuidv4()
    const now = new Date()

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

    await redisCache.delPattern(`${this.CACHE_PREFIX}content:*`)
    return this.mapContentFromDb(result.rows[0])
  }

  async updateContent(contentId: string, data: UpdateVodDto): Promise<VodContent | null> {
    const updates: string[] = []
    const params: any[] = []
    let paramIndex = 1

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

    if (updates.length === 0) {
      return this.getContentDetail(contentId)
    }

    updates.push(`updated_at = $${paramIndex++}`)
    params.push(new Date())
    params.push(contentId)

    const result = await database.query(
      `UPDATE vod_content SET ${updates.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
      params
    )

    if (result.rows.length === 0) {
      return null
    }

    await redisCache.del(`${this.CACHE_PREFIX}content:${contentId}`)
    await redisCache.delPattern(`${this.CACHE_PREFIX}content:*`)

    return this.mapContentFromDb(result.rows[0])
  }

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
