import express from "express";
const router = express.Router();
import {
  addorderitems,
  GetMyOrders,
  getOrderById,
  GetOrders,
  updateOrderToPaid,
  updateOrderToDelivered,
  getOrdersForDeliveryPerson,
  acceptOrder,
  rejectOrder,
  markOrderAsCompleted,
  markOrderAsReturned,
  assignOrderToDeliveryPerson,
  generateInvoice,
  incomebycity,
  getTransactions,
  StripePayment,
  getUndeliveredOrders,
  updateOrderStatus,
  getOrderStatusCounts,
  createBillingInvoice,
  getBillingInvoiceByNumber,
  createRazorpayOrder,
  verifyRazorpayPayment,
  getIncomeByPincode,
} from "../controllers/orderControler.js";
import {
  protect,
  adminOrSeller,
  isDelivery,
} from "../middleware/authMiddleware.js";

// ============================================================
// ✅ RULE: All fixed-path routes MUST come before /:id.
// "/:id" matches ANY single path segment for its HTTP method,
// so every other single-segment GET route has to be registered
// above it or it becomes unreachable.
// ============================================================

router.route("/delivery").get(protect, isDelivery, getOrdersForDeliveryPerson);
router.route("/status-count").get(protect, adminOrSeller, getOrderStatusCounts);
router.route("/transactions").get(protect, adminOrSeller, getTransactions);
router.route("/myorders").get(protect, GetMyOrders);
router.route("/stripePayment").post(protect, StripePayment);

router
  .route("/")
  .post(protect, addorderitems)
  .get(protect, adminOrSeller, GetOrders);

// ── Delivery person routes (fixed paths) ──
router.route("/delivery/accept/:id").put(protect, isDelivery, acceptOrder);
router.route("/delivery/reject/:id").put(protect, isDelivery, rejectOrder);
router
  .route("/delivery/complete/:id")
  .put(protect, isDelivery, markOrderAsCompleted);
router
  .route("/delivery/return/:id")
  .put(protect, isDelivery, markOrderAsReturned);

// ── Admin routes (fixed paths) ──
// ⚠️ Was previously registered AFTER "/:id" (GET), which meant every
// request to GET /orders/undelivered was silently swallowed by
// getOrderById(id="undelivered") and crashed with a Mongoose CastError.
router.route("/undelivered").get(protect, adminOrSeller, getUndeliveredOrders);

router
  .route("/admin/orders/assign/:id")
  .put(protect, assignOrderToDeliveryPerson);
router.route("/admin/order/:id/invoice").get(protect, generateInvoice);
router.route("/admin/incomebycity").get(protect, adminOrSeller, incomebycity);
router
  .route("/admin/incomebypincode")
  .get(protect, adminOrSeller, getIncomeByPincode);

router
  .route("/billinginvoice")
  .post(protect, adminOrSeller, createBillingInvoice);

// ⚠️ RENAMED from "/:invoiceNumber" — that shape was identical to "/:id"
// below, so whichever route was registered first would silently swallow
// every request meant for the other one, no matter how they were ordered.
// Giving it a distinct "/invoice/" prefix removes the ambiguity entirely.
// NOTE: if your frontend calls GET /api/orders/:invoiceNumber directly,
// update it to GET /api/orders/invoice/:invoiceNumber to match.
router
  .route("/invoice/:invoiceNumber")
  .get(protect, adminOrSeller, getBillingInvoiceByNumber);

router.route("/razorpay").post(protect, createRazorpayOrder);
router.route("/razorpay/verify").post(protect, verifyRazorpayPayment);

// ============================================================
// ✅ Wildcard /:id routes — ALWAYS LAST
// ============================================================
router.route("/:id/pay").put(protect, updateOrderToPaid);
router
  .route("/:id/deliver")
  .put(protect, adminOrSeller, updateOrderToDelivered);
router.route("/:id/updateorderstatus").put(protect, updateOrderStatus);

router.route("/:id").get(protect, getOrderById);

export default router;
