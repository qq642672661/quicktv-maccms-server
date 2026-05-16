import { Router } from 'express';
import logger from '../utils/logger';

const router = Router();

const menuHandler = async (_req: any, res: any) => {
  logger.info('[HelloTV兼容] 获取菜单配置');

  const menus = [
    {
      id: '0',
      menuCode: '0',
      menuName: '推荐',
      menuType: '0',
      imageWidth: 0,
      imageHeight: 0,
      image: '',
      currentImage: '',
      focusImage: '',
      focusCornerImage: '',
      cornerImage: '',
      defaultHome: '1',
      backgroundImage: ''
    },
    {
      id: 'live',
      menuCode: 'live',
      menuName: '直播',
      menuType: '0',
      imageWidth: 0,
      imageHeight: 0,
      image: '',
      currentImage: '',
      focusImage: '',
      focusCornerImage: '',
      cornerImage: '',
      defaultHome: '0',
      backgroundImage: ''
    }
  ];

  res.json(menus);
};

router.get('/v2/zero/arrange/menu/menuZero', menuHandler);
router.post('/v2/zero/arrange/menu/menuZero', menuHandler);

const layoutHandler = async (req: any, res: any) => {
  const { menuCode } = req.query;
  logger.info(`[HelloTV兼容] 获取布局配置: ${menuCode}`);

  const layoutConfig = {
    code: 200,
    message: 'success',
    data: {
      layouts: []
    }
  };

  res.json(layoutConfig);
};

router.get('/v3/zero/arrange/layoutByMenuCode', layoutHandler);
router.post('/v3/zero/arrange/layoutByMenuCode', layoutHandler);

export default router;
