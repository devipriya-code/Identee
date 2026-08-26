import asyncHandler from "express-async-handler";
import Notification from "../models/notificationModel.js";

// Internal helper — imported and called from other controllers
// (orderControler.js, productControler.js) whenever a real event
// happens. Never throws — a failed notification write should never
// break the actual order/review/etc. it's describing.
export const createNotification = async ({ type, title, message, link = "" }) => {
  try {
    await Notification.create({ type, title, message, link });
  } catch (err) {
    console.error("Failed to create notification:", err.message);
  }
};

// @route GET /api/notifications?limit=30
export const getNotifications = asyncHandler(async (req, res) => {
  const limit = Number(req.query.limit) || 30;
  const notifications = await Notification.find().sort({ createdAt: -1 }).limit(limit);
  res.json(notifications);
});

// @route GET /api/notifications/unread-count
export const getUnreadCount = asyncHandler(async (req, res) => {
  const count = await Notification.countDocuments({ isRead: false });
  res.json({ count });
});

// @route PUT /api/notifications/:id/read
export const markAsRead = asyncHandler(async (req, res) => {
  const n = await Notification.findByIdAndUpdate(
    req.params.id,
    { isRead: true },
    { new: true },
  );
  if (!n) {
    res.status(404);
    throw new Error("Notification not found");
  }
  res.json(n);
});

// @route PUT /api/notifications/read-all
export const markAllAsRead = asyncHandler(async (req, res) => {
  await Notification.updateMany({ isRead: false }, { $set: { isRead: true } });
  res.json({ message: "All notifications marked as read" });
});