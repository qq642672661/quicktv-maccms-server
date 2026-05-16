import { Router, type Router as RouterType } from "express";
import vodController from "../controllers/vod.controller";

const router: RouterType = Router();

router.get("/content", vodController.getContentList.bind(vodController));
router.get("/content/:contentId", vodController.getContentDetail.bind(vodController));
router.post("/content", vodController.createContent.bind(vodController));
router.put("/content/:contentId", vodController.updateContent.bind(vodController));
router.post("/content/:contentId/view", vodController.recordView.bind(vodController));
router.get("/categories", vodController.getCategoryList.bind(vodController));
router.get("/popular", vodController.getPopularContent.bind(vodController));
router.get("/latest", vodController.getLatestContent.bind(vodController));

export default router;
