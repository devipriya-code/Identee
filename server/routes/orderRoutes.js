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
  getAllInvoices,
  emailInvoiceToCustomer,
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



router.route("/delivery").get(protect, isDelivery, getOrdersForDeliveryPerson);
router.route("/status-count").get(protect, adminOrSeller, getOrderStatusCounts);
router.route("/transactions").get(protect, adminOrSeller, getTransactions);
router.route("/myorders").get(protect, GetMyOrders);
router.route("/stripePayment").post(protect, StripePayment);

router
  .route("/")
  .post(protect, addorderitems)
  .get(protect, adminOrSeller, GetOrders);


router.route("/delivery/accept/:id").put(protect, isDelivery, acceptOrder);
router.route("/delivery/reject/:id").put(protect, isDelivery, rejectOrder);
router
  .route("/delivery/complete/:id")
  .put(protect, isDelivery, markOrderAsCompleted);
router
  .route("/delivery/return/:id")
  .put(protect, isDelivery, markOrderAsReturned);


router.route("/undelivered").get(protect, adminOrSeller, getUndeliveredOrders);

router
  .route("/admin/orders/assign/:id")
  .put(protect, assignOrderToDeliveryPerson);


router.route("/admin/order/:id/invoice").get(protect, generateInvoice);

router.route("/admin/invoices").get(protect, adminOrSeller, getAllInvoices);

router
  .route("/admin/order/:id/invoice/email")
  .post(protect, adminOrSeller, emailInvoiceToCustomer);

router.route("/admin/incomebycity").get(protect, adminOrSeller, incomebycity);
router
  .route("/admin/incomebypincode")
  .get(protect, adminOrSeller, getIncomeByPincode);

router
  .route("/billinginvoice")
  .post(protect, adminOrSeller, createBillingInvoice);


router
  .route("/invoice/:invoiceNumber")
  .get(protect, adminOrSeller, getBillingInvoiceByNumber);

router.route("/razorpay").post(protect, createRazorpayOrder);
router.route("/razorpay/verify").post(protect, verifyRazorpayPayment);


router.route("/:id/pay").put(protect, updateOrderToPaid);
router
  .route("/:id/deliver")
  .put(protect, adminOrSeller, updateOrderToDelivered);
router.route("/:id/updateorderstatus").put(protect, updateOrderStatus);

router.route("/:id").get(protect, getOrderById);

export default router;
