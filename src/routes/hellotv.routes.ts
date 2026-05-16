import { Router } from 'express';
import hellotvController from '../controllers/hellotv.controller';

const router = Router();

router.get('/tabs', hellotvController.getTabList);
router.get('/tabs/:tabId', hellotvController.getTabContent);

router.get('/media/:mediaId', hellotvController.getMediaDetail);
router.get('/media', hellotvController.getMediaList);

router.get('/search/center', hellotvController.getSearchCenter);
router.get('/search', hellotvController.searchContent);
router.post('/search/history', hellotvController.addSearchHistory);

router.get('/short-videos', hellotvController.getShortVideoList);

router.get('/live/channels', hellotvController.getLiveChannels);
router.get('/live/groups', hellotvController.getLiveChannelGroups);

router.post('/view', hellotvController.recordView);

export default router;
