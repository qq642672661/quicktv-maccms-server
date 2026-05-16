import express from 'express';
import vodController from '../controllers/vod.controller.sqlite';

const router = express.Router();

router.get('/content', vodController.getContentList.bind(vodController));
router.get('/content/:contentId', vodController.getContentDetail.bind(vodController));
router.post('/content/:contentId/view', vodController.recordView.bind(vodController));
router.get('/categories', vodController.getCategories.bind(vodController));

export default router;
