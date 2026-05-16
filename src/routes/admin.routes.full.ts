import { Router, type Router as RouterType, Request, Response } from 'express';
import { Pool } from 'pg';
import { v4 as uuidv4 } from 'uuid';

const router: RouterType = Router();

export function createAdminRoutes(pool: Pool): Router {

  router.get('/stats/dashboard', async (_req: Request, res: Response) => {
    try {
      const [
        videosCount,
        liveChannelsCount,
        categoriesCount,
        totalViews,
        todayViews
      ] = await Promise.all([
        pool.query('SELECT COUNT(*) as count FROM videos'),
        pool.query('SELECT COUNT(*) as count FROM live_channels'),
        pool.query('SELECT COUNT(*) as count FROM categories'),
        pool.query('SELECT SUM(view_count) as total FROM videos'),
        pool.query(`
          SELECT COUNT(*) as count
          FROM play_history
          WHERE created_at >= CURRENT_DATE
        `)
      ]);

      const topVideos = await pool.query(`
        SELECT id, title, cover_image, view_count, like_count
        FROM videos
        ORDER BY view_count DESC
        LIMIT 10
      `);

      const topChannels = await pool.query(`
        SELECT id, name, logo, viewer_count, category
        FROM live_channels
        ORDER BY viewer_count DESC
        LIMIT 10
      `);

      res.json({
        code: 200,
        message: 'success',
        data: {
          overview: {
            totalVideos: parseInt(videosCount.rows[0].count),
            totalLiveChannels: parseInt(liveChannelsCount.rows[0].count),
            totalCategories: parseInt(categoriesCount.rows[0].count),
            totalViews: parseInt(totalViews.rows[0].total || 0),
            todayViews: parseInt(todayViews.rows[0].count)
          },
          topVideos: topVideos.rows,
          topChannels: topChannels.rows
        },
        timestamp: Date.now()
      });
    } catch (error) {
      console.error('获取仪表盘统计失败:', error);
      res.status(500).json({
        code: 500,
        message: '获取统计数据失败',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: Date.now()
      });
    }
  });

  router.get('/categories', async (req: Request, res: Response) => {
    try {
      const { page = 1, limit = 20, search = '' } = req.query;
      const offset = (Number(page) - 1) * Number(limit);

      let query = 'SELECT * FROM categories WHERE 1=1';
      const params: any[] = [];

      if (search) {
        query += ' AND name ILIKE $1';
        params.push(`%${search}%`);
      }

      query += ' ORDER BY sort_order ASC, id DESC';
      query += ` LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
      params.push(Number(limit), offset);

      const countQuery = search
        ? 'SELECT COUNT(*) FROM categories WHERE name ILIKE $1'
        : 'SELECT COUNT(*) FROM categories';

      const [result, countResult] = await Promise.all([
        pool.query(query, params),
        pool.query(countQuery, search ? [`%${search}%`] : [])
      ]);

      const total = parseInt(countResult.rows[0].count);

      res.json({
        code: 200,
        message: 'success',
        data: {
          items: result.rows,
          total,
          page: Number(page),
          limit: Number(limit),
          totalPages: Math.ceil(total / Number(limit))
        },
        timestamp: Date.now()
      });
    } catch (error) {
      console.error('获取分类列表失败:', error);
      res.status(500).json({
        code: 500,
        message: '获取分类列表失败',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: Date.now()
      });
    }
  });

  router.post('/categories', async (req: Request, res: Response) => {
    try {
      const { name, slug, description, parent_id, sort_order } = req.body;

      if (!name || !slug) {
        return res.status(400).json({
          code: 400,
          message: '分类名称和标识不能为空',
          timestamp: Date.now()
        });
      }

      const result = await pool.query(
        `INSERT INTO categories (name, slug, description, parent_id, sort_order, is_active)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING *`,
        [name, slug, description || null, parent_id || null, sort_order || 0, true]
      );

      res.json({
        code: 200,
        message: '分类创建成功',
        data: result.rows[0],
        timestamp: Date.now()
      });
    } catch (error: any) {
      console.error('创建分类失败:', error);

      if (error.code === '23505') {
        return res.status(400).json({
          code: 400,
          message: '分类标识已存在',
          timestamp: Date.now()
        });
      }

      res.status(500).json({
        code: 500,
        message: '创建分类失败',
        error: error.message,
        timestamp: Date.now()
      });
    }
  });

  router.put('/categories/:id', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { name, slug, description, parent_id, sort_order, is_active } = req.body;

      const result = await pool.query(
        `UPDATE categories
         SET name = COALESCE($1, name),
             slug = COALESCE($2, slug),
             description = COALESCE($3, description),
             parent_id = COALESCE($4, parent_id),
             sort_order = COALESCE($5, sort_order),
             is_active = COALESCE($6, is_active),
             updated_at = CURRENT_TIMESTAMP
         WHERE id = $7
         RETURNING *`,
        [name, slug, description, parent_id, sort_order, is_active, id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          code: 404,
          message: '分类不存在',
          timestamp: Date.now()
        });
      }

      res.json({
        code: 200,
        message: '分类更新成功',
        data: result.rows[0],
        timestamp: Date.now()
      });
    } catch (error) {
      console.error('更新分类失败:', error);
      res.status(500).json({
        code: 500,
        message: '更新分类失败',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: Date.now()
      });
    }
  });

  router.delete('/categories/:id', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      const videosCount = await pool.query(
        'SELECT COUNT(*) FROM videos WHERE category_id = $1',
        [id]
      );

      if (parseInt(videosCount.rows[0].count) > 0) {
        return res.status(400).json({
          code: 400,
          message: '该分类下还有视频，无法删除',
          timestamp: Date.now()
        });
      }

      const result = await pool.query(
        'DELETE FROM categories WHERE id = $1 RETURNING *',
        [id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          code: 404,
          message: '分类不存在',
          timestamp: Date.now()
        });
      }

      res.json({
        code: 200,
        message: '分类删除成功',
        timestamp: Date.now()
      });
    } catch (error) {
      console.error('删除分类失败:', error);
      res.status(500).json({
        code: 500,
        message: '删除分类失败',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: Date.now()
      });
    }
  });

  router.get('/videos', async (req: Request, res: Response) => {
    try {
      const {
        page = 1,
        limit = 20,
        search = '',
        category_id = '',
        status = '',
        is_featured = '',
        sort_by = 'created_at',
        sort_order = 'DESC'
      } = req.query;

      const offset = (Number(page) - 1) * Number(limit);

      let query = `
        SELECT v.*, c.name as category_name
        FROM videos v
        LEFT JOIN categories c ON v.category_id = c.id
        WHERE 1=1
      `;
      const params: any[] = [];
      let paramIndex = 1;

      if (search) {
        query += ` AND v.title ILIKE $${paramIndex}`;
        params.push(`%${search}%`);
        paramIndex++;
      }

      if (category_id) {
        query += ` AND v.category_id = $${paramIndex}`;
        params.push(category_id);
        paramIndex++;
      }

      if (status) {
        query += ` AND v.status = $${paramIndex}`;
        params.push(status);
        paramIndex++;
      }

      if (is_featured) {
        query += ` AND v.is_featured = $${paramIndex}`;
        params.push(is_featured === 'true');
        paramIndex++;
      }

      const validSortColumns = ['created_at', 'view_count', 'like_count', 'title'];
      const sortColumn = validSortColumns.includes(sort_by as string) ? sort_by : 'created_at';
      const sortDirection = sort_order === 'ASC' ? 'ASC' : 'DESC';

      query += ` ORDER BY v.${sortColumn} ${sortDirection}`;
      query += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
      params.push(Number(limit), offset);

      let countQuery = 'SELECT COUNT(*) FROM videos v WHERE 1=1';
      const countParams: any[] = [];
      let countParamIndex = 1;

      if (search) {
        countQuery += ` AND v.title ILIKE $${countParamIndex}`;
        countParams.push(`%${search}%`);
        countParamIndex++;
      }

      if (category_id) {
        countQuery += ` AND v.category_id = $${countParamIndex}`;
        countParams.push(category_id);
        countParamIndex++;
      }

      if (status) {
        countQuery += ` AND v.status = $${countParamIndex}`;
        countParams.push(status);
        countParamIndex++;
      }

      if (is_featured) {
        countQuery += ` AND v.is_featured = $${countParamIndex}`;
        countParams.push(is_featured === 'true');
      }

      const [result, countResult] = await Promise.all([
        pool.query(query, params),
        pool.query(countQuery, countParams)
      ]);

      const total = parseInt(countResult.rows[0].count);

      res.json({
        code: 200,
        message: 'success',
        data: {
          items: result.rows,
          total,
          page: Number(page),
          limit: Number(limit),
          totalPages: Math.ceil(total / Number(limit))
        },
        timestamp: Date.now()
      });
    } catch (error) {
      console.error('获取视频列表失败:', error);
      res.status(500).json({
        code: 500,
        message: '获取视频列表失败',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: Date.now()
      });
    }
  });

  router.post('/videos', async (req: Request, res: Response) => {
    try {
      const {
        title,
        description,
        category_id,
        cover_image,
        video_url,
        duration,
        resolution,
        status,
        is_featured,
        is_recommended
      } = req.body;

      if (!title || !category_id) {
        return res.status(400).json({
          code: 400,
          message: '标题和分类不能为空',
          timestamp: Date.now()
        });
      }

      const result = await pool.query(
        `INSERT INTO videos (
          title, description, category_id, cover_image, video_url,
          duration, resolution, status, is_featured, is_recommended, published_at
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        RETURNING *`,
        [
          title,
          description || null,
          category_id,
          cover_image || null,
          video_url || null,
          duration || 0,
          resolution || null,
          status || 'published',
          is_featured || false,
          is_recommended || false,
          new Date()
        ]
      );

      res.json({
        code: 200,
        message: '视频创建成功',
        data: result.rows[0],
        timestamp: Date.now()
      });
    } catch (error) {
      console.error('创建视频失败:', error);
      res.status(500).json({
        code: 500,
        message: '创建视频失败',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: Date.now()
      });
    }
  });

  router.put('/videos/:id', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const updates = req.body;

      const allowedFields = [
        'title', 'description', 'category_id', 'cover_image', 'video_url',
        'duration', 'resolution', 'status', 'is_featured', 'is_recommended'
      ];

      const setClause: string[] = [];
      const values: any[] = [];
      let paramIndex = 1;

      Object.keys(updates).forEach(key => {
        if (allowedFields.includes(key)) {
          setClause.push(`${key} = $${paramIndex}`);
          values.push(updates[key]);
          paramIndex++;
        }
      });

      if (setClause.length === 0) {
        return res.status(400).json({
          code: 400,
          message: '没有有效的更新字段',
          timestamp: Date.now()
        });
      }

      setClause.push(`updated_at = CURRENT_TIMESTAMP`);
      values.push(id);

      const query = `
        UPDATE videos
        SET ${setClause.join(', ')}
        WHERE id = $${paramIndex}
        RETURNING *
      `;

      const result = await pool.query(query, values);

      if (result.rows.length === 0) {
        return res.status(404).json({
          code: 404,
          message: '视频不存在',
          timestamp: Date.now()
        });
      }

      res.json({
        code: 200,
        message: '视频更新成功',
        data: result.rows[0],
        timestamp: Date.now()
      });
    } catch (error) {
      console.error('更新视频失败:', error);
      res.status(500).json({
        code: 500,
        message: '更新视频失败',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: Date.now()
      });
    }
  });

  router.delete('/videos/:id', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      const result = await pool.query(
        'DELETE FROM videos WHERE id = $1 RETURNING *',
        [id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          code: 404,
          message: '视频不存在',
          timestamp: Date.now()
        });
      }

      res.json({
        code: 200,
        message: '视频删除成功',
        timestamp: Date.now()
      });
    } catch (error) {
      console.error('删除视频失败:', error);
      res.status(500).json({
        code: 500,
        message: '删除视频失败',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: Date.now()
      });
    }
  });

  router.post('/videos/batch', async (req: Request, res: Response) => {
    try {
      const { action, ids } = req.body;

      if (!action || !ids || !Array.isArray(ids) || ids.length === 0) {
        return res.status(400).json({
          code: 400,
          message: '无效的批量操作参数',
          timestamp: Date.now()
        });
      }

      let query = '';
      let params: any[] = [];

      switch (action) {
        case 'delete':
          query = 'DELETE FROM videos WHERE id = ANY($1)';
          params = [ids];
          break;
        case 'publish':
          query = 'UPDATE videos SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = ANY($2)';
          params = ['published', ids];
          break;
        case 'unpublish':
          query = 'UPDATE videos SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = ANY($2)';
          params = ['draft', ids];
          break;
        case 'feature':
          query = 'UPDATE videos SET is_featured = $1, updated_at = CURRENT_TIMESTAMP WHERE id = ANY($2)';
          params = [true, ids];
          break;
        case 'unfeature':
          query = 'UPDATE videos SET is_featured = $1, updated_at = CURRENT_TIMESTAMP WHERE id = ANY($2)';
          params = [false, ids];
          break;
        default:
          return res.status(400).json({
            code: 400,
            message: '不支持的操作类型',
            timestamp: Date.now()
          });
      }

      await pool.query(query, params);

      res.json({
        code: 200,
        message: `批量${action}操作成功`,
        data: { affected: ids.length },
        timestamp: Date.now()
      });
    } catch (error) {
      console.error('批量操作失败:', error);
      res.status(500).json({
        code: 500,
        message: '批量操作失败',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: Date.now()
      });
    }
  });

  router.get('/live/channels', async (req: Request, res: Response) => {
    try {
      const {
        page = 1,
        limit = 20,
        search = '',
        category = '',
        status = ''
      } = req.query;

      const offset = (Number(page) - 1) * Number(limit);

      let query = 'SELECT * FROM live_channels WHERE 1=1';
      const params: any[] = [];
      let paramIndex = 1;

      if (search) {
        query += ` AND name ILIKE $${paramIndex}`;
        params.push(`%${search}%`);
        paramIndex++;
      }

      if (category) {
        query += ` AND category = $${paramIndex}`;
        params.push(category);
        paramIndex++;
      }

      if (status) {
        query += ` AND status = $${paramIndex}`;
        params.push(status);
        paramIndex++;
      }

      query += ` ORDER BY sort_order ASC, created_at DESC`;
      query += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
      params.push(Number(limit), offset);

      let countQuery = 'SELECT COUNT(*) FROM live_channels WHERE 1=1';
      const countParams: any[] = [];
      let countParamIndex = 1;

      if (search) {
        countQuery += ` AND name ILIKE $${countParamIndex}`;
        countParams.push(`%${search}%`);
        countParamIndex++;
      }

      if (category) {
        countQuery += ` AND category = $${countParamIndex}`;
        countParams.push(category);
        countParamIndex++;
      }

      if (status) {
        countQuery += ` AND status = $${countParamIndex}`;
        countParams.push(status);
      }

      const [result, countResult] = await Promise.all([
        pool.query(query, params),
        pool.query(countQuery, countParams)
      ]);

      const total = parseInt(countResult.rows[0].count);

      res.json({
        code: 200,
        message: 'success',
        data: {
          items: result.rows,
          total,
          page: Number(page),
          limit: Number(limit),
          totalPages: Math.ceil(total / Number(limit))
        },
        timestamp: Date.now()
      });
    } catch (error) {
      console.error('获取直播频道列表失败:', error);
      res.status(500).json({
        code: 500,
        message: '获取直播频道列表失败',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: Date.now()
      });
    }
  });

  router.post('/live/channels', async (req: Request, res: Response) => {
    try {
      const {
        name,
        logo,
        stream_url,
        category,
        quality,
        description,
        tags,
        sort_order
      } = req.body;

      if (!name || !stream_url || !category) {
        return res.status(400).json({
          code: 400,
          message: '频道名称、直播流地址和分类不能为空',
          timestamp: Date.now()
        });
      }

      const id = uuidv4();

      const result = await pool.query(
        `INSERT INTO live_channels (
          id, name, logo, stream_url, category, status, quality, description, tags, sort_order
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        RETURNING *`,
        [
          id,
          name,
          logo || null,
          stream_url,
          category,
          'online',
          JSON.stringify(quality || ['高清']),
          description || null,
          JSON.stringify(tags || []),
          sort_order || 0
        ]
      );

      res.json({
        code: 200,
        message: '频道创建成功',
        data: result.rows[0],
        timestamp: Date.now()
      });
    } catch (error) {
      console.error('创建频道失败:', error);
      res.status(500).json({
        code: 500,
        message: '创建频道失败',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: Date.now()
      });
    }
  });

  router.put('/live/channels/:id', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const updates = req.body;

      const allowedFields = [
        'name', 'logo', 'stream_url', 'category', 'status',
        'quality', 'description', 'tags', 'sort_order'
      ];

      const setClause: string[] = [];
      const values: any[] = [];
      let paramIndex = 1;

      Object.keys(updates).forEach(key => {
        if (allowedFields.includes(key)) {
          let value = updates[key];
          if (key === 'quality' || key === 'tags') {
            value = JSON.stringify(value);
          }
          setClause.push(`${key} = $${paramIndex}`);
          values.push(value);
          paramIndex++;
        }
      });

      if (setClause.length === 0) {
        return res.status(400).json({
          code: 400,
          message: '没有有效的更新字段',
          timestamp: Date.now()
        });
      }

      setClause.push(`updated_at = CURRENT_TIMESTAMP`);
      values.push(id);

      const query = `
        UPDATE live_channels
        SET ${setClause.join(', ')}
        WHERE id = $${paramIndex}
        RETURNING *
      `;

      const result = await pool.query(query, values);

      if (result.rows.length === 0) {
        return res.status(404).json({
          code: 404,
          message: '频道不存在',
          timestamp: Date.now()
        });
      }

      res.json({
        code: 200,
        message: '频道更新成功',
        data: result.rows[0],
        timestamp: Date.now()
      });
    } catch (error) {
      console.error('更新频道失败:', error);
      res.status(500).json({
        code: 500,
        message: '更新频道失败',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: Date.now()
      });
    }
  });

  router.delete('/live/channels/:id', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      const result = await pool.query(
        'DELETE FROM live_channels WHERE id = $1 RETURNING *',
        [id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          code: 404,
          message: '频道不存在',
          timestamp: Date.now()
        });
      }

      res.json({
        code: 200,
        message: '频道删除成功',
        timestamp: Date.now()
      });
    } catch (error) {
      console.error('删除频道失败:', error);
      res.status(500).json({
        code: 500,
        message: '删除频道失败',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: Date.now()
      });
    }
  });

  router.post('/cache/clear', async (_req: Request, res: Response) => {
    try {
      res.json({
        code: 200,
        message: '缓存清除成功',
        timestamp: Date.now()
      });
    } catch (error) {
      console.error('清除缓存失败:', error);
      res.status(500).json({
        code: 500,
        message: '清除缓存失败',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: Date.now()
      });
    }
  });

  return router;
}

export default createAdminRoutes;
