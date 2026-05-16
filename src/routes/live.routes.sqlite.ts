import express from 'express';
import liveController from '../controllers/live.controller.sqlite';

const router = express.Router();

router.get('/channels', liveController.getChannelList.bind(liveController));
router.get('/channels/:channelId', liveController.getChannelDetail.bind(liveController));
router.post('/channels/:channelId/view', liveController.recordView.bind(liveController));
router.get('/categories', liveController.getCategories.bind(liveController));

export default router;
