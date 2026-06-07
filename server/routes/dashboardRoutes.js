import express from "express";
import {
  getSalesData,
  getRevenueData,
  getLatestOrders,
  getTotalOrders,
  getTopCustomers,
} from "../controlers/dashboardController.js";
import { protect, adminOrSeller } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/orders", protect, adminOrSeller, getLatestOrders);
router.get("/revenue", protect, adminOrSeller, getRevenueData);
router.get("/sales", protect, adminOrSeller, getSalesData);
router.get("/getTotalOrders", protect, adminOrSeller, getTotalOrders);
router.get("/top-customers", protect, adminOrSeller, getTopCustomers);


export default router;
