import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  createMessageNotification,
} from "../controllers/notification.controller.js";

const router = express.Router();

router.use(protectRoute);

router.get("/", getNotifications);
router.post("/message", createMessageNotification);
router.put("/:notificationId/read", markNotificationAsRead);
router.put("/read-all", markAllNotificationsAsRead);

export default router;

