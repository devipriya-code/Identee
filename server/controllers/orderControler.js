import asyncHandler from "express-async-handler";
import User from "../models/userModel.js";
import Product from "../models/productModel.js";
import Order from "../models/orderModel.js";
import Offer from "../models/OfferModel.js";
import BillingInvoice from "../models/billingInvoiceModel.js";
import sendEmail from "../utils/sendEmail.js";
import Razorpay from "razorpay";
import crypto from "crypto";
import ShippingCost from "../models/shippingcostModel.js";
import Counter from "../models/counterModel.js";
import { generateInvoicePdfBuffer } from "../utils/generateInvoicePdf.js";
import { createNotification } from "./notificationController.js";
// @desc Create new order
// @route POST /api/orders
// @access Private
const addorderitems = asyncHandler(async (req, res) => {
  const {
    orderItems,
    shippingAddress,
    paymentMethod,
    cgstPrice,
    sgstPrice,
    taxPrice,
    shippingPrice,
    totalPrice,
    coupon,
    paymentResult,
    razorpayOrderId,
  } = req.body;

  if (!orderItems || orderItems.length === 0) {
    res.status(400);
    throw new Error("No order items");
  }

  // ✅ NEW — reject orders with an incomplete shipping address instead of
  // silently saving empty strings. Previously shippingAddress was saved
  // as-is with no checks, so any caller that skipped the address step
  // (an old/broken flow, a direct API call, etc.) could create an order
  // with no state/city — which is exactly what produced the "—" rows in
  // the admin Shipping page. This also protects shippingPrice/totalPrice
  // integrity: an order with no state should never have been priced at all.
  if (
    !shippingAddress ||
    !shippingAddress.state ||
    !shippingAddress.state.trim() ||
    !shippingAddress.city ||
    !shippingAddress.city.trim()
  ) {
    res.status(400);
    throw new Error("A complete shipping address (state and city) is required");
  }

  const isRazorpay = paymentMethod === "RAZORPAY";

  if (isRazorpay && !paymentResult?.id) {
    res.status(400);
    throw new Error("Missing payment confirmation for Razorpay order");
  }

  const year = new Date().getFullYear();
  const counter = await Counter.findByIdAndUpdate(
    `order-invoice-${year}`,
    { $inc: { seq: 1 } },
    { new: true, upsert: true },
  );
  const invoiceNumber = `VF-${year}-${String(counter.seq).padStart(4, "0")}`;

  const order = new Order({
    user: req.user._id,
    orderItems,
    shippingAddress,
    paymentMethod,
    cgstPrice,
    sgstPrice,
    taxPrice,
    shippingPrice,
    totalPrice,
    invoiceNumber,
    razorpayOrderId: razorpayOrderId || null,
    coupon: coupon
      ? {
          code: coupon.code,
          percentage: coupon.percentage,
          discountAmount: coupon.discountAmount,
        }
      : null,
    isPaid: isRazorpay ? true : false,
    paidAt: isRazorpay ? Date.now() : undefined,
    orderStatus: isRazorpay ? "CONFIRMED" : "CREATED",
    paymentResult,
  });

  let createdOrder = await order.save();
  if (coupon?.code) {
    await Offer.findOneAndUpdate(
      { code: coupon.code },
      { $inc: { usedCount: 1 } },
    );
  }
  createdOrder = await Order.findById(createdOrder._id).populate(
    "orderItems.product",
    "images brandname",
  );

  await sendEmail({
    email: req.user.email,
    status: "ORDERED",
    order: createdOrder,
  });

  for (const item of orderItems) {
    const product = await Product.findById(item.product);
    if (!product) continue;

    const sizeStock = product.productdetails.stockBySize.find(
      (s) => s.size === item.size,
    );
    if (!sizeStock) continue;

    if (sizeStock.stock < item.qty) {
      return res.status(400).json({
        message: `Not enough stock for ${product.brandname} size ${item.size}`,
      });
    }

    sizeStock.stock -= item.qty;
    product.soldCount = (product.soldCount || 0) + item.qty;
    await product.save();
  }

  await User.findByIdAndUpdate(req.user._id, {
    $set: { cartItems: [] },
  });

  res.status(201).json(createdOrder);
});

// @desc get order by id
// @route GET /api/orders/:id
// @access Private
const getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id)
    .populate("user", "name email")
    .populate({
      path: "orderItems.product",
      select: "productType comboName productdetails images",
    });
  if (order) {
    res.json(order);
  } else {
    res.status(404);
    throw new Error("Order Not found");
  }
});

// @desc update order to paid
// @route update /api/orders/:id/pay
// @access Private
const updateOrderToPaid = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).populate("user", "email");

  if (order) {
    order.isPaid = true;
    order.paidAt = Date.now();
    order.paymentResult = {
      id: req.body.id,
      status: req.body.status,
      update_time: req.body.update_time,
      email_address: req.body.payer.email_address,
    };

    if (!order.orderStatus || order.orderStatus === "ORDERED") {
      order.orderStatus = "CONFIRMED";
    }

    const updatedOrder = await order.save();
    res.json(updatedOrder);
  } else {
    res.status(404);
    throw new Error("Order Not found");
  }
});

// @desc update order to delivered
// @route update /api/orders/:id/deliver
// @access Private
const updateOrderToDelivered = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (order) {
    order.orderStatus = "DELIVERED";
    order.deliveredAt = Date.now();
    const updatedOrder = await order.save();
    res.json(updatedOrder);
  } else {
    res.status(404);
    throw new Error("Order Not found");
  }
});

// @desc get logged in user orders
// @route GET /api/orders/myorders
// @access Private
const GetMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id }).populate({
    path: "orderItems.product",
    select: "images brandname rating",
  });
  res.json(orders);
});

// @desc get orders
// @route GET /api/admin/orders
// @access Private/admin
const GetOrders = asyncHandler(async (req, res) => {
  const { status } = req.query;

  let filter = {};
  if (status && status !== "all") {
    filter.orderStatus = status;
  }

  const orders = await Order.find(filter).populate("user", "id name").populate({
    path: "orderItems.product",
    select: "brandname images",
  });

  res.json(orders);
});

// @desc Get orders for delivery person
// @route GET /api/orders/delivery
// @access Private Delivery
const getOrdersForDeliveryPerson = asyncHandler(async (req, res) => {
  const orders = await Order.find({
    deliveryPerson: req.user._id,
    orderStatus: "OUT_FOR_DELIVERY",
  }).populate("user", "name email");
  res.json(orders);
});

// @desc Accept order
// @route PUT /api/orders/delivery/accept/:id
// @access Private Delivery
const acceptOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id)
    .populate("user", "email")
    .populate("orderItems.product", "images brandname");

  if (order && order.orderStatus === "PACKED") {
    order.orderStatus = "OUT_FOR_DELIVERY";
    await order.save();

    await sendEmail({
      email: order.user.email,
      status: "OUT_FOR_DELIVERY",
      order,
    });

    res.json({ message: "Order accepted" });
  } else {
    res.status(400);
    throw new Error("Order cannot be accepted");
  }
});

// @desc Reject order
// @route PUT /api/orders/delivery/reject/:id
// @access Private Delivery
const rejectOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (order && order.isPacked && !order.isAcceptedByDelivery) {
    order.deliveryPerson = null;
    await order.save();
    res.json({ message: "Order rejected" });
  } else {
    res.status(400);
    throw new Error("Order cannot be rejected");
  }
});

// @desc Mark order as completed
// @route PUT /api/orders/delivery/complete/:id
// @access Private Delivery
const markOrderAsCompleted = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id)
    .populate("user", "email")
    .populate("orderItems.product", "images brandname");

  if (order && order.orderStatus === "OUT_FOR_DELIVERY") {
    order.orderStatus = "DELIVERED";
    order.deliveredAt = Date.now();

    if (order.paymentMethod === "COD") {
      order.isPaid = true;
      order.paidAt = Date.now();
    }

    await order.save();

    await sendEmail({
      email: order.user.email,
      status: "DELIVERED",
      order,
    });

    res.json({ message: "Order marked as completed" });
  } else {
    res.status(400);
    throw new Error("Order cannot be marked as completed");
  }
});

// @desc Mark order as returned
// @route PUT /api/orders/delivery/return/:id
// @access Private Delivery
const markOrderAsReturned = asyncHandler(async (req, res) => {
  const { returnReason } = req.body;
  const order = await Order.findById(req.params.id);
  if (order && order.isDelivered) {
    order.isReturned = true;
    order.returnReason = returnReason;
    await order.save();
    res.json({ message: "Order marked as returned" });
  } else {
    res.status(400);
    throw new Error("Order cannot be marked as returned");
  }
});

// @desc get undelivered orders in admin
// @route GET /api/orders/undelivered
// @access Private Admin
const getUndeliveredOrders = asyncHandler(async (req, res) => {
  try {
    const orders = await Order.find({
      orderStatus: { $ne: "DELIVERED" },
    })
      .populate("user", "name email")
      .populate("orderItems.product", "brandname images price");

    res.json(orders);
  } catch (error) {
    console.error("❌ Error inside getUndeliveredOrders:", error.message);
    res.status(500).json({ message: error.message });
  }
});

// @desc Assign order to delivery person
// @route PUT /api/orders/:id/assign
// @access Private Admin
const assignOrderToDeliveryPerson = asyncHandler(async (req, res) => {
  const { deliveryPersonId } = req.body;
  const order = await Order.findById(req.params.id)
    .populate("user", "name email profilePicture")
    .populate("deliveryPerson", "name profilePicture")
    .populate("orderItems.product", "name image");
  if (order) {
    order.deliveryPerson = deliveryPersonId;
    order.orderStatus = "PACKED";
    await order.save();
    res.json({ message: "Order assigned to delivery person" });
  } else {
    res.status(404);
    throw new Error("Order not found");
  }
});

// @desc    Generate (or fetch existing) formal invoice for an order.
// Idempotent — if order.invoiceDetails already exists, it's returned as-is
// instead of minting a new invoice number. This is what powers the admin
// "Generate Invoice" button and the Invoices module: clicking it again
// never creates a duplicate.
// @route   GET /api/orders/admin/order/:id/invoice
// @access  Private/Admin
const generateInvoice = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id)
    .populate("user", "name email")
    .populate(
      "orderItems.product",
      "hsnCode brandname oldPrice discount productdetails",
    );

  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }

  // ✅ Already generated — return it, never duplicate.
  if (order.invoiceDetails) {
    return res.json(order.invoiceDetails);
  }

  // Separate numbering series (IDT-YYYY-NNNNNN) from order.invoiceNumber
  // (VF-YYYY-NNNN), which is already assigned automatically at order
  // creation time and used elsewhere in the admin (e.g. the Shipping
  // page's "Order" column). This is the formal, customer-facing invoice
  // number, minted only once — here — the first time an invoice is
  // actually generated for this order.
  const year = new Date().getFullYear();
  const counter = await Counter.findByIdAndUpdate(
    `invoice-${year}`,
    { $inc: { seq: 1 } },
    { new: true, upsert: true },
  );
  const invoiceNumber = `IDT-${year}-${String(counter.seq).padStart(6, "0")}`;

  const orderItems = order.orderItems.map((item) => {
    const product = item.product;
    const unitPrice =
      item.qty > 0
        ? Math.round((item.price / item.qty) * 100) / 100
        : item.price;
    const mrp = product?.oldPrice > 0 ? product.oldPrice : unitPrice;
    const discountAmount = Math.max((mrp - unitPrice) * item.qty, 0);

    return {
      name: item.name,
      image: item.image,
      size: item.size,
      color: product?.productdetails?.color || "",
      variant: product?.productdetails?.type || "",
      hsnCode: product?.hsnCode || "6109",
      qty: item.qty,
      unitPrice,
      mrp,
      discountAmount: Math.round(discountAmount * 100) / 100,
      lineTotal: item.price,
    };
  });

  const shipping = order.shippingAddress || {};
  const customerName =
    order.user?.name ||
    [shipping.firstName, shipping.lastName].filter(Boolean).join(" ") ||
    "N/A";

  const invoiceDetails = {
    invoiceNumber,
    invoiceDate: new Date(),
    orderId: order._id,
    orderNumber:
      order.invoiceNumber || order._id.toString().slice(-8).toUpperCase(),
    customer: {
      name: customerName,
      email: order.user?.email || shipping.email || "N/A",
      phone: shipping.phoneNumber || shipping.secondaryPhone || "N/A",
    },
    // This system captures a single delivery address per order — billing
    // and shipping are the same until a separate billing-address field
    // exists, so both sections of the invoice reuse it.
    billingAddress: shipping,
    shippingAddress: shipping,
    orderItems,
    pricing: {
      subtotal: order.orderItems.reduce((sum, i) => sum + i.price, 0),
      cgstPrice: order.cgstPrice,
      sgstPrice: order.sgstPrice,
      taxPrice: order.taxPrice,
      shippingPrice: order.shippingPrice,
      discountAmount: order.coupon?.discountAmount || 0,
      totalPrice: order.totalPrice,
    },
    coupon: order.coupon || null,
    paymentMethod: order.paymentMethod,
    paymentStatus: order.isPaid ? "Paid" : "Unpaid",
    orderStatus: order.orderStatus,
    createdAt: order.createdAt,
  };

  order.invoiceDetails = invoiceDetails;
  await order.save();

  res.json(invoiceDetails);
});

// @desc    List every order that has a generated invoice — powers the
// admin "Invoices" list page.
// @route   GET /api/orders/admin/invoices
// @access  Private/Admin
const getAllInvoices = asyncHandler(async (req, res) => {
  const orders = await Order.find({ invoiceDetails: { $ne: null } })
    .select(
      "invoiceDetails invoiceNumber totalPrice isPaid orderStatus createdAt user",
    )
    .populate("user", "name email")
    .sort({ createdAt: -1 });

  const invoices = orders.map((o) => ({
    orderId: o._id,
    invoiceNumber: o.invoiceDetails?.invoiceNumber,
    invoiceDate: o.invoiceDetails?.invoiceDate,
    customerName: o.user?.name || o.invoiceDetails?.customer?.name || "N/A",
    customerEmail: o.user?.email || o.invoiceDetails?.customer?.email || "N/A",
    totalPrice: o.totalPrice,
    isPaid: o.isPaid,
    orderStatus: o.orderStatus,
  }));

  res.json(invoices);
});

// @desc    Email the generated invoice to the customer on file for the order.
// @route   POST /api/orders/admin/order/:id/invoice/email
// @access  Private/Admin
const emailInvoiceToCustomer = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).populate(
    "user",
    "name email",
  );

  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }
  if (!order.invoiceDetails) {
    res.status(400);
    throw new Error("Generate the invoice before emailing it");
  }

  const recipientEmail =
    order.user?.email || order.invoiceDetails.customer?.email;
  if (!recipientEmail || recipientEmail === "N/A") {
    res.status(400);
    throw new Error("This order has no customer email on file");
  }

  try {
    // Render the SAME template as the admin's InvoiceDocument, as a PDF.
    const pdfBuffer = await generateInvoicePdfBuffer(order.invoiceDetails);

    await sendEmail({
      email: recipientEmail,
      status: "INVOICE",
      invoice: order.invoiceDetails,
      attachments: [
        {
          filename: `${order.invoiceDetails.invoiceNumber}.pdf`,
          content: pdfBuffer,
        },
      ],
    });
    res.json({ message: `Invoice emailed to ${recipientEmail}` });
  } catch (err) {
    console.error("❌ Invoice email failed:", err);
    res.status(500).json({
      message: "Couldn't send automatically — use the mailto fallback instead.",
    });
  }
});
// @desc  getlocations
// @route GET /api/incomebycity
// @access Private/Admin
const incomebycity = asyncHandler(async (req, res) => {
  const orders = await Order.find({ isPaid: true });

  const totalIncome = orders.reduce((acc, order) => acc + order.totalPrice, 0);
  const formattedTotalIncome = `Rs.${totalIncome}`;

  const incomeByCity = orders.reduce((acc, order) => {
    const city = order.shippingAddress.city || "Unknown";
    acc[city] = (acc[city] || 0) + order.totalPrice;
    return acc;
  }, {});

  res.setHeader("Cache-Control", "no-store");
  res.json({
    totalIncome: formattedTotalIncome,
    incomeByCity: Object.entries(incomeByCity).map(([city, income]) => ({
      city,
      income: `Rs. ${income}`,
    })),
  });
});

// @desc    Fetch transaction details with filters
// @route   GET /api/orders/transactions
// @access  Private/Admin
const getTransactions = asyncHandler(async (req, res) => {
  let { startDate, endDate, paymentType, status } = req.query;

  let query = {};

  if (startDate && endDate) {
    query.createdAt = {
      $gte: new Date(startDate),
      $lte: new Date(endDate),
    };
  }

  if (paymentType) {
    query.paymentMethod = paymentType;
  }

  if (status) {
    if (status === "Paid") {
      query.isPaid = true;
    } else if (status === "Unpaid") {
      query.isPaid = false;
    } else if (status === "Delivered") {
      query.isDelivered = true;
    }
  }

  const transactions = await Order.find(query).select(
    "createdAt paymentMethod isPaid isDelivered totalPrice taxPrice shippingPrice orderItems cgstPrice sgstPrice",
  );

  res.json(transactions);
});

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// CREATE RAZORPAY ORDER
// ✅ UPDATED: supports the checkout-form shippingAddress (falls back to the
// user's saved default address if none is sent), plus the existing Buy Now
// single-product flow via req.body.buyNowProductId. Price is always looked
// up / computed server-side — the client can never dictate the amount charged.
const createRazorpayOrder = async (req, res) => {
  try {
    let couponCode = null;

    if (req.body.coupon?.code) {
      couponCode = req.body.coupon.code.trim();
    } else if (req.body.couponCode) {
      couponCode = req.body.couponCode.trim();
    }
    if (couponCode === "") couponCode = null;

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    let subtotal = 0;

  if (req.body.buyNowCustomizationId) {
      // A customized garment — no real Product document exists for it.
      // Price = garment type's base price + the real current price of
      // every Art design placed on it (re-looked-up here, never trusted
      // from the client, so a tampered client price can't undercharge).
      const qty = Number(req.body.qty) > 0 ? Number(req.body.qty) : 1;
      const customization = await Customization.findById(
        req.body.buyNowCustomizationId,
      );
      if (!customization) {
        return res.status(404).json({ message: "Customization not found" });
      }

      const garment = await GarmentType.findOne({
        key: customization.garmentType,
      });
      const basePrice = garment?.basePrice || 0;

      const artDesignIds = customization.elements
        .filter((el) => el.artDesignId)
        .map((el) => el.artDesignId);

      let addOnTotal = 0;
      if (artDesignIds.length > 0) {
        const artDesigns = await ArtDesign.find({
          _id: { $in: artDesignIds },
        });
        const priceMap = Object.fromEntries(
          artDesigns.map((d) => [d._id.toString(), d.price]),
        );
        addOnTotal = customization.elements.reduce(
          (sum, el) =>
            sum +
            (el.artDesignId ? priceMap[el.artDesignId.toString()] || 0 : 0),
          0,
        );
      }

      subtotal = parseFloat(((basePrice + addOnTotal) * qty).toFixed(2));
    } else if (req.body.buyNowProductId) {
      const qty = Number(req.body.qty) > 0 ? Number(req.body.qty) : 1;
      const product = await Product.findById(req.body.buyNowProductId);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      subtotal = parseFloat((product.price * qty).toFixed(2));
    } else {
      if (!user.cartItems || user.cartItems.length === 0) {
        return res.status(400).json({ message: "Cart is empty" });
      }
      for (const item of user.cartItems) {
        if (!item.price) {
          return res.status(400).json({ message: "Cart item price missing" });
        }
        subtotal += item.price;
      }
      subtotal = parseFloat(subtotal.toFixed(2));
    }

    const cgstAmount = parseFloat(((subtotal * 2.5) / 100).toFixed(2));
    const sgstAmount = parseFloat(((subtotal * 2.5) / 100).toFixed(2));
    const taxAmount = parseFloat((cgstAmount + sgstAmount).toFixed(2));

    const shippingSettings = await ShippingCost.findOne();
    if (!shippingSettings) {
      return res
        .status(400)
        .json({ message: "Shipping settings not configured" });
    }

    // ✅ prefer the checkout-form address over the account's saved default
    const checkoutAddress = req.body.shippingAddress;
    const defaultAddress =
      checkoutAddress && checkoutAddress.state
        ? checkoutAddress
        : user.addresses?.find((addr) => addr.isDefault) || user.addresses?.[0];

    if (!defaultAddress || !defaultAddress.state) {
      return res
        .status(400)
        .json({ message: "No shipping address / state provided" });
    }

    const stateRule = shippingSettings.shippingRules.find(
      (rule) =>
        rule.state.trim().toLowerCase() ===
        defaultAddress.state.trim().toLowerCase(),
    );
    if (!stateRule) {
      return res.status(400).json({
        message: `Shipping not available for state: ${defaultAddress.state}`,
      });
    }

    let shippingAmount = parseFloat(stateRule.cost.toFixed(2));
    if (
      !stateRule.alwaysCharge &&
      shippingSettings.freeShippingAbove &&
      subtotal >= shippingSettings.freeShippingAbove
    ) {
      shippingAmount = 0;
    }
    let discountAmount = 0;
    let couponSnapshot = null;

    if (couponCode) {
      const offer = await Offer.findOne({
        code: { $regex: `^${couponCode}$`, $options: "i" },
      });

      if (!offer) {
        return res.status(400).json({ message: "Invalid coupon" });
      }

      if (offer.usedCount >= offer.maxUsage) {
        return res.status(400).json({ message: "Coupon usage limit exceeded" });
      }

      const rawDiscount = (subtotal * offer.offerPercentage) / 100;
      discountAmount = Math.min(
        rawDiscount,
        subtotal + taxAmount + shippingAmount - 1,
      );
      discountAmount = parseFloat(discountAmount.toFixed(2));

      couponSnapshot = {
        code: offer.code,
        percentage: offer.offerPercentage,
        discountAmount,
      };
    }

    const finalAmount = parseFloat(
      (subtotal + taxAmount + shippingAmount - discountAmount).toFixed(2),
    );

    if (finalAmount < 1) {
      return res.status(400).json({ message: "Final amount too low" });
    }

    const roundedFinalAmount = Math.round(finalAmount * 100) / 100;

    const razorpayOrder = await razorpay.orders.create({
      amount: Math.round(roundedFinalAmount * 100),
      currency: "INR",
      receipt: `order_${Date.now()}`,
    });

    res.json({
      id: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      keyId: process.env.RAZORPAY_KEY_ID,
      priceBreakdown: {
        subtotal,
        cgstAmount,
        sgstAmount,
        taxAmount,
        shippingAmount,
        discountAmount,
        total: roundedFinalAmount,
      },
      coupon: couponSnapshot,
    });
  } catch (err) {
    console.error("❌ Razorpay FULL ERROR:", err);
    res.status(500).json({ message: err.message, stack: err.stack });
  }
};

// VERIFY RAZORPAY PAYMENT
const verifyRazorpayPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
      req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res
        .status(400)
        .json({ success: false, message: "Missing payment fields" });
    }

    const sign = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(sign)
      .digest("hex");

    if (expectedSign === razorpay_signature) {
      res.json({
        success: true,
        message: "Payment verified successfully",
        paymentId: razorpay_payment_id,
      });
    } else {
      res
        .status(400)
        .json({ success: false, message: "Invalid payment signature" });
    }
  } catch (error) {
    console.error("❌ Verify Error:", error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Stripe payments
// @route   POST /api/orders/stripe
// @access  Public/Users
const StripePayment = asyncHandler(async (req, res) => {
  try {
    const { amount } = req.body;

    if (!amount) {
      return res.status(400).json({ error: "Amount is required" });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount * 100,
      currency: "usd",
      payment_method_types: ["card"],
    });

    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    console.error("Stripe Payment Error:", error);
    res.status(500).json({ error: error.message });
  }
});

// @desc    Update tracking status
// @route   PUT /api/orders/:id/updatestatus
// @access  Private/Admin
export const updateOrderStatus = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("user", "email name")
      .populate("orderItems.product");

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    const previousStatus = order.orderStatus;
    const newStatus = req.body.status.toUpperCase();

    order.orderStatus = newStatus;
    await order.save();

    if (
      previousStatus !== newStatus &&
      ["PACKED", "OUT_FOR_DELIVERY"].includes(newStatus)
    ) {
      await sendEmail({ email: order.user.email, status: newStatus, order });
    }

    res.json({ message: "Order status updated successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc   Get order statuses count
// @route  GET /api/orders/status-count
// @access Admin
const getOrderStatusCounts = asyncHandler(async (req, res) => {
  const confirmed = await Order.countDocuments({ orderStatus: "CONFIRMED" });
  const packed = await Order.countDocuments({ orderStatus: "PACKED" });
  const outForDelivery = await Order.countDocuments({
    orderStatus: "OUT_FOR_DELIVERY",
  });
  const returnApproved = await Order.countDocuments({
    orderStatus: "RETURN_APPROVED",
  });
  const returnCompleted = await Order.countDocuments({
    orderStatus: "RETURN_COMPLETED",
  });
  const delivered = await Order.countDocuments({ orderStatus: "DELIVERED" });

  const allOrders =
    confirmed +
    packed +
    outForDelivery +
    returnApproved +
    returnCompleted +
    delivered;

  res.json({
    allOrders,
    confirmed,
    packed,
    outForDelivery,
    returnApproved,
    returnCompleted,
    delivered,
  });
});

// @desc   Create billing invoice
// @route  POST /api/orders/billinginvoice
// @access Private/Admin
const createBillingInvoice = asyncHandler(async (req, res) => {
  const { logo, from, to, date, items, notes, signature } = req.body;

  const normalizedItems = items.map((item) => ({
    description: item.description,
    hsnCode: item.hsnCode || "6109",
    rate: item.rate,
    qty: item.qty,
    cgst: item.cgst || 0,
    sgst: item.sgst || 0,
    amount: item.rate * item.qty,
  }));

  const subtotal = normalizedItems.reduce(
    (sum, item) => sum + item.rate * item.qty,
    0,
  );
  const cgstTotal = normalizedItems.reduce(
    (sum, item) => sum + ((item.cgst || 0) / 100) * item.rate * item.qty,
    0,
  );
  const sgstTotal = normalizedItems.reduce(
    (sum, item) => sum + ((item.sgst || 0) / 100) * item.rate * item.qty,
    0,
  );
  const total = subtotal + cgstTotal + sgstTotal;

  const invoice = new BillingInvoice({
    logo,
    from,
    to,
    date,
    items: normalizedItems,
    subtotal,
    cgstTotal,
    sgstTotal,
    total,
    notes,
    signature,
  });

  const createdInvoice = await invoice.save();

  res.status(201).json({
    message: "Billing invoice created successfully",
    invoice: createdInvoice,
  });
});

// @desc   Get billing invoice by number
// @route  GET /api/orders/billinginvoice/:invoiceNumber
// @access Private/Admin
const getBillingInvoiceByNumber = asyncHandler(async (req, res) => {
  const invoice = await BillingInvoice.findOne({
    invoiceNumber: req.params.invoiceNumber,
  });

  if (!invoice) {
    res.status(404);
    throw new Error("Invoice not found");
  }

  res.json(invoice);
});

const getIncomeByPincode = asyncHandler(async (req, res) => {
  const data = await Order.aggregate([
    {
      $match: {
        "shippingAddress.pin": { $ne: null },
        isPaid: true,
      },
    },
    {
      $group: {
        _id: "$shippingAddress.pin",
        income: { $sum: "$totalPrice" },
      },
    },
    {
      $project: {
        _id: 0,
        pinCode: "$_id",
        income: 1,
      },
    },
    { $sort: { income: -1 } },
  ]);

  res.status(200).json(data);
});

// @desc    Razorpay webhook (payment.captured) — safety net if browser
// closes before the "handler" callback in checkout fires.
// @route   POST /api/orders/razorpay/webhook
// @access  Public (verified via signature, not auth token)
const razorpayWebhook = async (req, res) => {
  try {
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
    const signature = req.headers["x-razorpay-signature"];

    const shasum = crypto.createHmac("sha256", webhookSecret);
    shasum.update(req.body);
    const digest = shasum.digest("hex");

    if (digest !== signature) {
      return res.status(400).json({ message: "Invalid webhook signature" });
    }

    const payload = JSON.parse(req.body.toString());

    if (payload.event === "payment.captured") {
      const orderId = payload.payload.payment.entity.order_id;
      await Order.findOneAndUpdate(
        { razorpayOrderId: orderId },
        { isPaid: true, paidAt: Date.now(), orderStatus: "CONFIRMED" },
      );
    }

    res.json({ status: "ok" });
  } catch (error) {
    console.error("❌ Webhook Error:", error);
    res.status(500).json({ message: error.message });
  }
};

export {
  addorderitems,
  getOrderById,
  updateOrderToPaid,
  GetMyOrders,
  GetOrders,
  updateOrderToDelivered,
  getUndeliveredOrders,
  getOrdersForDeliveryPerson,
  acceptOrder,
  rejectOrder,
  markOrderAsCompleted,
  markOrderAsReturned,
  assignOrderToDeliveryPerson,
  generateInvoice,
  getAllInvoices,
  emailInvoiceToCustomer,
  incomebycity,
  getTransactions,
  StripePayment,
  getOrderStatusCounts,
  createBillingInvoice,
  getBillingInvoiceByNumber,
  createRazorpayOrder,
  verifyRazorpayPayment,
  getIncomeByPincode,
  razorpayWebhook,
};
