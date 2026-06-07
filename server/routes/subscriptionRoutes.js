import express from "express";
import {
  createSubscription,
  getSubscriptions,
  updateSubscription,
  toggleSubscriptionStatus,
  getActiveSubscription,
  deleteSubscription,
} from "../controlers/subscriptionController.js";
import {
  createSubscriptionOrder,
  confirmSubscriptionPayment,
} from "../controlers/subscriptionPaymentController.js";
import { protect, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

// ✅ Static routes FIRST — before any /:id routes
router.get("/active", getActiveSubscription);
router.post("/confirm", protect, confirmSubscriptionPayment);

// ✅ Then base CRUD
router
  .route("/")
  .get(protect, adminOnly, getSubscriptions)
  .post(protect, adminOnly, createSubscription);

// ✅ Parameterized routes LAST
router.post("/order/:id", protect, createSubscriptionOrder);
router.route("/:id").put(protect, adminOnly, updateSubscription);
router.route("/:id/toggle").put(protect, adminOnly, toggleSubscriptionStatus);
router.delete("/:id", protect, adminOnly, deleteSubscription);

export default router;
