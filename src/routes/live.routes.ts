import { Router } from "express";
import liveController from "../controllers/live.controller";

const router = Router();

router.get("/channels", liveController.getChannelList.bind(liveController));
router.get(
  "/channels/:channelId",
  liveController.getChannelDetail.bind(liveController),
);
router.post("/channels", liveController.createChannel.bind(liveController));
router.put(
  "/channels/:channelId",
  liveController.updateChannel.bind(liveController),
);
router.post(
  "/channels/:channelId/status",
  liveController.updateChannelStatus.bind(liveController),
);
router.get(
  "/channels/:channelId/stream",
  liveController.getStreamInfo.bind(liveController),
);
router.get(
  "/channels/:channelId/stats",
  liveController.getViewStats.bind(liveController),
);
router.post(
  "/channels/:channelId/view",
  liveController.recordView.bind(liveController),
);
router.get("/categories", liveController.getCategoryList.bind(liveController));

export default router;
