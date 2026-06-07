import express from "express";
import {
  createSubscriptionPayment,
  confirmSubscriptionPayment,
} from "../controlers/subscribepaymentController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/subscription/create", protect, createSubscriptionPayment);
router.post("/subscription/confirm", protect, confirmSubscriptionPayment);

export default router;
