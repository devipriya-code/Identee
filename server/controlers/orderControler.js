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
  } = req.body;

  if (!orderItems || orderItems.length === 0) {
    res.status(400);
    throw new Error("No order items");
  }

  // ✅ Generate invoice number at order creation time
  const year = new Date().getFullYear();
  const counter = await Counter.findByIdAndUpdate(
    `order-invoice-${year}`,
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
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
    invoiceNumber, // ✅ saved immediately on order creation
    coupon: coupon
      ? {
          code: coupon.code,
          percentage: coupon.percentage,
          discountAmount: coupon.discountAmount,
        }
      : null,
    isPaid: true,
    paidAt: Date.now(),
    orderStatus: "CONFIRMED",
    paymentResult,
  });

  let createdOrder = await order.save();
  if (coupon?.code) {
    await Offer.findOneAndUpdate(
      { code: coupon.code },
      { $inc: { usedCount: 1 } }
    );
  }
  createdOrder = await Order.findById(createdOrder._id).populate(
    "orderItems.product",
    "images brandname"
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
      (s) => s.size === item.size
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

// @desc    Generate Invoice
// @route   GET /api/orders/:id/invoice
// @access  Private/Admin
// ✅ No counter logic here — invoice number already saved at order creation
const generateInvoice = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id)
    .populate("user", "name email")
    .populate("orderItems.product", "hsnCode");

  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }

  const orderItemsWithHsn = order.orderItems.map((item) => ({
    ...item.toObject(),
    hsnCode: item.product?.hsnCode || "6109",
  }));

  const invoice = {
    orderId: order._id,
    invoiceNumber: order.invoiceNumber,
    user: {
      name: order.user?.name || "N/A",
      email: order.user?.email || "N/A",
    },
    orderItems: orderItemsWithHsn,
    shippingAddress: order.shippingAddress,
    paymentMethod: order.paymentMethod,

    // ✅ coupon at TOP LEVEL — this is what InvoiceScreen reads as invoice.coupon
    coupon: order.coupon
      ? {
          code: order.coupon.code,
          percentage: order.coupon.percentage,
          discountAmount: order.coupon.discountAmount,
        }
      : null,

    pricing: {
      cgstPrice: order.cgstPrice,
      sgstPrice: order.sgstPrice,
      taxPrice: order.taxPrice,
      shippingPrice: order.shippingPrice,
      totalPrice: order.totalPrice,
      // ✅ coupon removed from here
    },
    paymentStatus: {
      isPaid: order.isPaid,
      paidAt: order.paidAt,
    },
    deliveryStatus: {
      isDelivered: order.isDelivered,
      deliveredAt: order.deliveredAt,
    },
    createdAt: order.createdAt,
  };

  res.json(invoice);
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
    "createdAt paymentMethod isPaid isDelivered totalPrice taxPrice shippingPrice orderItems cgstPrice sgstPrice"
  );

  res.json(transactions);
});

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// CREATE RAZORPAY ORDER
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

    if (!user || user.cartItems.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    let subtotal = 0;
    for (const item of user.cartItems) {
      if (!item.price) {
        return res.status(400).json({ message: "Cart item price missing" });
      }
      subtotal += item.price;
    }
    subtotal = parseFloat(subtotal.toFixed(2));

    const cgstAmount = parseFloat(((subtotal * 2.5) / 100).toFixed(2));
    const sgstAmount = parseFloat(((subtotal * 2.5) / 100).toFixed(2));
    const taxAmount = parseFloat((cgstAmount + sgstAmount).toFixed(2));

    const shippingSettings = await ShippingCost.findOne();
    if (!shippingSettings) {
      return res.status(400).json({ message: "Shipping settings not configured" });
    }

    const defaultAddress =
      user.addresses?.find((addr) => addr.isDefault) || user.addresses?.[0];

    if (!defaultAddress || !defaultAddress.state) {
      return res.status(400).json({ message: "No default address found for shipping" });
    }

    const stateRule = shippingSettings.shippingRules.find(
      (rule) => rule.state === defaultAddress.state
    );

    if (!stateRule) {
      return res.status(400).json({
        message: `Shipping not available for state: ${defaultAddress.state}`,
      });
    }

    let shippingAmount = parseFloat(stateRule.cost.toFixed(2));
    if (
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

      if (offer.usedCount >= offer.maxUses) {
        return res.status(400).json({ message: "Coupon usage limit exceeded" });
      }

      const rawDiscount = (subtotal * offer.offerPercentage) / 100;
      discountAmount = Math.min(rawDiscount, subtotal + taxAmount + shippingAmount - 1);
      discountAmount = parseFloat(discountAmount.toFixed(2));

      couponSnapshot = {
        code: offer.code,
        percentage: offer.offerPercentage,
        discountAmount,
      };
    }

    const finalAmount = parseFloat(
      (subtotal + taxAmount + shippingAmount - discountAmount).toFixed(2)
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
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

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
      res.status(400).json({ success: false, message: "Invalid payment signature" });
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
  const outForDelivery = await Order.countDocuments({ orderStatus: "OUT_FOR_DELIVERY" });
  const returnApproved = await Order.countDocuments({ orderStatus: "RETURN_APPROVED" });
  const returnCompleted = await Order.countDocuments({ orderStatus: "RETURN_COMPLETED" });
  const delivered = await Order.countDocuments({ orderStatus: "DELIVERED" });

  const allOrders =
    confirmed + packed + outForDelivery + returnApproved + returnCompleted + delivered;

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
// ✅ hsnCode is preserved per item — passed through from frontend as part of items array
const createBillingInvoice = asyncHandler(async (req, res) => {
  const { logo, from, to, date, items, notes, signature } = req.body;

  // ✅ Normalize each item — preserve hsnCode, default to "6109" if missing
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
    0
  );
  const cgstTotal = normalizedItems.reduce(
    (sum, item) => sum + ((item.cgst || 0) / 100) * item.rate * item.qty,
    0
  );
  const sgstTotal = normalizedItems.reduce(
    (sum, item) => sum + ((item.sgst || 0) / 100) * item.rate * item.qty,
    0
  );
  const total = subtotal + cgstTotal + sgstTotal;

  const invoice = new BillingInvoice({
    logo,
    from,
    to,
    date,
    items: normalizedItems, // ✅ hsnCode included per item
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
  incomebycity,
  getTransactions,
  StripePayment,
  getOrderStatusCounts,
  createBillingInvoice,
  getBillingInvoiceByNumber,
  createRazorpayOrder,
  verifyRazorpayPayment,
  getIncomeByPincode,
};