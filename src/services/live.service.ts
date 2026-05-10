import database from '../database'
import redisCache from '../cache/redis'
import logger from '../utils/logger'
import { LiveChannel, LiveCategory, LiveStreamInfo, LiveViewStats, CreateChannelDto, UpdateChannelDto } from '../types/live'
import { v4 as uuidv4 } from 'uuid'

class LiveService {
  private readonly CACHE_PREFIX = 'live:'
  private readonly CACHE_TTL = 300

  async getChannelList(category?: string, page: number = 1, limit: number = 20): Promise<{ total: number; items: LiveChannel[]; categories: LiveCategory[] }> {
    const cacheKey = `${this.CACHE_PREFIX}channels:${category || 'all'}:${page}:${limit}`
    
    const cached = await redisCache.get<{ total: number; items: LiveChannel[]; categories: LiveCategory[] }>(cacheKey)
    if (cached) {
      logger.debug('Cache hit for channel list')
      return cached
    }

    const offset = (page - 1) * limit
    let query = 'SELECT * FROM live_channels WHERE 1=1'
    const params: any[] = []

    if (category) {
      params.push(category)
      query += ` AND category = $${params.length}`
    }

    query += ' ORDER BY sort_order ASC, created_at DESC'
    params.push(limit, offset)
    query += ` LIMIT $${params.length - 1} OFFSET $${params.length}`

    const countQuery = category 
      ? 'SELECT COUNT(*) FROM live_channels WHERE category = $1'
      : 'SELECT COUNT(*) FROM live_channels'

    const [channelsResult, countResult, categoriesResult] = await Promise.all([
      database.query(query, params),
      database.query(countQuery, category ? [category] : []),
      this.getCategoryList()
    ])

    const result = {
      total: parseInt(countResult.rows[0].count),
      items: channelsResult.rows.map(this.mapChannelFromDb),
      categories: categoriesResult
    }

    await redisCache.set(cacheKey, result, this.CACHE_TTL)
    return result
  }

  async getChannelDetail(channelId: string): Promise<LiveChannel | null> {
    const cacheKey = `${this.CACHE_PREFIX}channel:${channelId}`
    
    const cached = await redisCache.get<LiveChannel>(cacheKey)
    if (cached) {
      return cached
    }

    const result = await database.query(
      'SELECT * FROM live_channels WHERE id = $1',
      [channelId]
    )

    if (result.rows.length === 0) {
      return null
    }

    const channel = this.mapChannelFromDb(result.rows[0])
    await redisCache.set(cacheKey, channel, this.CACHE_TTL)
    return channel
  }

  async createChannel(data: CreateChannelDto): Promise<LiveChannel> {
    const id = uuidv4()
    const now = new Date()

    const result = await database.query(
      `INSERT INTO live_channels 
       (id, name, logo, stream_url, category, status, quality, description, tags, sort_order, viewer_count, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
       RETURNING *`,
      [
        id,
        data.name,
        data.logo,
        data.streamUrl,
        data.category,
        'offline',
        JSON.stringify(data.quality),
        data.description || null,
        data.tags ? JSON.stringify(data.tags) : null,
        data.sortOrder || 0,
        0,
        now,
        now
      ]
    )

    await redisCache.delPattern(`${this.CACHE_PREFIX}channels:*`)
    return this.mapChannelFromDb(result.rows[0])
  }

  async updateChannel(channelId: string, data: UpdateChannelDto): Promise<LiveChannel | null> {
    const updates: string[] = []
    const params: any[] = []
    let paramIndex = 1

    if (data.name !== undefined) {
      updates.push(`name = $${paramIndex++}`)
      params.push(data.name)
    }
    if (data.logo !== undefined) {
      updates.push(`logo = $${paramIndex++}`)
      params.push(data.logo)
    }
    if (data.streamUrl !== undefined) {
      updates.push(`stream_url = $${paramIndex++}`)
      params.push(data.streamUrl)
    }
    if (data.category !== undefined) {
      updates.push(`category = $${paramIndex++}`)
      params.push(data.category)
    }
    if (data.status !== undefined) {
      updates.push(`status = $${paramIndex++}`)
      params.push(data.status)
    }
    if (data.quality !== undefined) {
      updates.push(`quality = $${paramIndex++}`)
      params.push(JSON.stringify(data.quality))
    }
    if (data.description !== undefined) {
      updates.push(`description = $${paramIndex++}`)
      params.push(data.description)
    }
    if (data.tags !== undefined) {
      updates.push(`tags = $${paramIndex++}`)
      params.push(JSON.stringify(data.tags))
    }
    if (data.sortOrder !== undefined) {
      updates.push(`sort_order = $${paramIndex++}`)
      params.push(data.sortOrder)
    }

    if (updates.length === 0) {
      return this.getChannelDetail(channelId)
    }

    updates.push(`updated_at = $${paramIndex++}`)
    params.push(new Date())
    params.push(channelId)

    const result = await database.query(
      `UPDATE live_channels SET ${updates.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
      params
    )

    if (result.rows.length === 0) {
      return null
    }

    await redisCache.del(`${this.CACHE_PREFIX}channel:${channelId}`)
    await redisCache.delPattern(`${this.CACHE_PREFIX}channels:*`)

    return this.mapChannelFromDb(result.rows[0])
  }

  async updateChannelStatus(channelId: string, status: 'online' | 'offline' | 'maintenance'): Promise<boolean> {
    const result = await database.query(
      'UPDATE live_channels SET status = $1, updated_at = $2 WHERE id = $3',
      [status, new Date(), channelId]
    )

    if (result.rowCount > 0) {
      await redisCache.del(`${this.CACHE_PREFIX}channel:${channelId}`)
      await redisCache.delPattern(`${this.CACHE_PREFIX}channels:*`)
      return true
    }

    return false
  }

  async getStreamInfo(channelId: string, quality: string = 'auto'): Promise<LiveStreamInfo | null> {
    const channel = await this.getChannelDetail(channelId)
    if (!channel) {
      return null
    }

    return {
      channelId: channel.id,
      streamUrl: channel.streamUrl,
      quality,
      protocol: this.detectProtocol(channel.streamUrl),
      bitrate: this.estimateBitrate(quality)
    }
  }

  async getViewStats(channelId: string): Promise<LiveViewStats | null> {
    const cacheKey = `${this.CACHE_PREFIX}stats:${channelId}`
    
    const cached = await redisCache.get<LiveViewStats>(cacheKey)
    if (cached) {
      return cached
    }

    const result = await database.query(
      'SELECT * FROM live_view_stats WHERE channel_id = $1',
      [channelId]
    )

    if (result.rows.length === 0) {
      return {
        channelId,
        viewerCount: 0,
        peakViewers: 0,
        totalViews: 0,
        avgWatchTime: 0,
        lastUpdated: new Date()
      }
    }

    const stats: LiveViewStats = {
      channelId: result.rows[0].channel_id,
      viewerCount: result.rows[0].viewer_count,
      peakViewers: result.rows[0].peak_viewers,
      totalViews: result.rows[0].total_views,
      avgWatchTime: result.rows[0].avg_watch_time,
      lastUpdated: result.rows[0].last_updated
    }

    await redisCache.set(cacheKey, stats, 60)
    return stats
  }

  async recordView(channelId: string, deviceId: string): Promise<void> {
    const viewKey = `${this.CACHE_PREFIX}view:${channelId}:${deviceId}`
    const exists = await redisCache.exists(viewKey)

    if (!exists) {
      await redisCache.set(viewKey, { timestamp: Date.now() }, 3600)
      await redisCache.incr(`${this.CACHE_PREFIX}viewers:${channelId}`)

      await database.query(
        `INSERT INTO live_view_stats (channel_id, viewer_count, total_views, last_updated)
         VALUES ($1, 1, 1, $2)
         ON CONFLICT (channel_id) 
         DO UPDATE SET 
           viewer_count = live_view_stats.viewer_count + 1,
           total_views = live_view_stats.total_views + 1,
           peak_viewers = GREATEST(live_view_stats.peak_viewers, live_view_stats.viewer_count + 1),
           last_updated = $2`,
        [channelId, new Date()]
      )

      await redisCache.del(`${this.CACHE_PREFIX}stats:${channelId}`)
    }
  }

  async getCategoryList(): Promise<LiveCategory[]> {
    const cacheKey = `${this.CACHE_PREFIX}categories`
    
    const cached = await redisCache.get<LiveCategory[]>(cacheKey)
    if (cached) {
      return cached
    }

    const result = await database.query(
      `SELECT category as id, category as name, COUNT(*) as channel_count
       FROM live_channels
       GROUP BY category
       ORDER BY category`
    )

    const categories: LiveCategory[] = result.rows.map((row: any) => ({
      id: row.id,
      name: row.name,
      channelCount: parseInt(row.channel_count)
    }))

    await redisCache.set(cacheKey, categories, this.CACHE_TTL)
    return categories
  }

  private mapChannelFromDb(row: any): LiveChannel {
    return {
      id: row.id,
      name: row.name,
      logo: row.logo,
      streamUrl: row.stream_url,
      category: row.category,
      status: row.status,
      viewerCount: row.viewer_count,
      quality: typeof row.quality === 'string' ? JSON.parse(row.quality) : row.quality,
      description: row.description,
      tags: row.tags ? (typeof row.tags === 'string' ? JSON.parse(row.tags) : row.tags) : [],
      sortOrder: row.sort_order,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    }
  }

  private detectProtocol(streamUrl: string): string {
    if (streamUrl.includes('.m3u8')) return 'HLS'
    if (streamUrl.includes('rtmp://')) return 'RTMP'
    if (streamUrl.includes('rtsp://')) return 'RTSP'
    return 'HTTP'
  }

  private estimateBitrate(quality: string): number {
    const bitrateMap: Record<string, number> = {
      '4k': 20000,
      '1080p': 8000,
      '720p': 5000,
      '480p': 2500,
      '360p': 1000,
      'auto': 5000
    }
    return bitrateMap[quality] || 5000
  }
}

export default new LiveService()
