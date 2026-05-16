import { Router, Request, Response } from 'express';
import Database from 'better-sqlite3';
import path from 'path';

const router = Router();

function getDB(): Database.Database {
  const dbPath = path.join(process.cwd(), 'data', 'quicktv.db');
  return new Database(dbPath);
}

router.get('/stats/dashboard', async (_req: Request, res: Response) => {
  try {
    const db = getDB();

    const videosCount = db.prepare('SELECT COUNT(*) as count FROM videos').get() as { count: number };
    const liveChannelsCount = db.prepare('SELECT COUNT(*) as count FROM live_channels').get() as { count: number };
    const categoriesCount = db.prepare('SELECT COUNT(*) as count FROM categories').get() as { count: number };
    const totalViews = db.prepare('SELECT COALESCE(SUM(view_count), 0) as total FROM videos').get() as { total: number };
    const todayViews = db.prepare(`
      SELECT COUNT(*) as count
      FROM play_history
      WHERE date(created_at) = date('now')
    `).get() as { count: number };

    const topVideos = db.prepare(`
      SELECT id, title, cover_image, view_count, like_count
      FROM videos
      ORDER BY view_count DESC
      LIMIT 10
    `).all();

    const topChannels = db.prepare(`
      SELECT id, name, logo, viewer_count, category
      FROM live_channels
      ORDER BY viewer_count DESC
      LIMIT 10
    `).all();

    db.close();

    res.json({
      code: 200,
      message: 'success',
      data: {
        overview: {
          totalVideos: videosCount.count,
          totalLiveChannels: liveChannelsCount.count,
          totalCategories: categoriesCount.count,
          totalViews: totalViews.total || 0,
          todayViews: todayViews.count
        },
        topVideos,
        topChannels
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
    const db = getDB();
    const { page = 1, limit = 20, search = '' } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    let query = 'SELECT * FROM categories WHERE 1=1';
    const params: any[] = [];

    if (search) {
      query += ' AND name LIKE ?';
      params.push(`%${search}%`);
    }

    query += ' ORDER BY sort_order ASC, id DESC LIMIT ? OFFSET ?';
    params.push(Number(limit), offset);

    const items = db.prepare(query).all(...params);

    let countQuery = 'SELECT COUNT(*) as count FROM categories WHERE 1=1';
    const countParams: any[] = [];

    if (search) {
      countQuery += ' AND name LIKE ?';
      countParams.push(`%${search}%`);
    }

    const countResult = db.prepare(countQuery).get(...countParams) as { count: number };
    const total = countResult.count;

    db.close();

    res.json({
      code: 200,
      message: 'success',
      data: {
        items,
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

router.get('/videos', async (req: Request, res: Response) => {
  try {
    const db = getDB();
    const {
      page = 1,
      limit = 20,
      search = ''
    } = req.query;

    const offset = (Number(page) - 1) * Number(limit);

    let query = `
      SELECT v.*, c.name as category_name
      FROM videos v
      LEFT JOIN categories c ON v.category_id = c.id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (search) {
      query += ' AND v.title LIKE ?';
      params.push(`%${search}%`);
    }

    query += ` ORDER BY v.created_at DESC LIMIT ? OFFSET ?`;
    params.push(Number(limit), offset);

    const items = db.prepare(query).all(...params);

    let countQuery = 'SELECT COUNT(*) as count FROM videos v WHERE 1=1';
    const countParams: any[] = [];

    if (search) {
      countQuery += ' AND v.title LIKE ?';
      countParams.push(`%${search}%`);
    }

    const countResult = db.prepare(countQuery).get(...countParams) as { count: number };
    const total = countResult.count;

    db.close();

    res.json({
      code: 200,
      message: 'success',
      data: {
        items,
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

router.get('/live/channels', async (req: Request, res: Response) => {
  try {
    const db = getDB();
    const {
      page = 1,
      limit = 20,
      search = '',
      category = ''
    } = req.query;

    const offset = (Number(page) - 1) * Number(limit);

    let query = 'SELECT * FROM live_channels WHERE 1=1';
    const params: any[] = [];

    if (search) {
      query += ' AND name LIKE ?';
      params.push(`%${search}%`);
    }

    if (category) {
      query += ' AND category = ?';
      params.push(category);
    }

    query += ' ORDER BY sort_order ASC, created_at DESC LIMIT ? OFFSET ?';
    params.push(Number(limit), offset);

    const items = db.prepare(query).all(...params);

    let countQuery = 'SELECT COUNT(*) as count FROM live_channels WHERE 1=1';
    const countParams: any[] = [];

    if (search) {
      countQuery += ' AND name LIKE ?';
      countParams.push(`%${search}%`);
    }

    if (category) {
      countQuery += ' AND category = ?';
      countParams.push(category);
    }

    const countResult = db.prepare(countQuery).get(...countParams) as { count: number };
    const total = countResult.count;

    db.close();

    res.json({
      code: 200,
      message: 'success',
      data: {
        items,
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

export default router;
