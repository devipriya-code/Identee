import express from "express";
const router = express.Router();
import {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
} from "../controllers/notificationController.js";
import { protect, adminOrSeller } from "../middleware/authMiddleware.js";

router.get("/", protect, adminOrSeller, getNotifications);
router.get("/unread-count", protect, adminOrSeller, getUnreadCount);
router.put("/read-all", protect, adminOrSeller, markAllAsRead);
router.put("/:id/read", protect, adminOrSeller, markAsRead);

export default router;
