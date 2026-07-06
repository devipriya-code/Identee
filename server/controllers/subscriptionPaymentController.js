import asyncHandler from "express-async-handler";
import razorpay from "../utils/razorpayInstance.js";
import User from "../models/userModel.js";
import Subscription from "../models/subscriptionModel.js";
import crypto from "crypto";

// Create Razorpay order
const createSubscriptionOrder = asyncHandler(async (req, res) => {
  const subscription = await Subscription.findOne({ isActive: true });
  if (!subscription) throw new Error("No active subscription available");

  const order = await razorpay.orders.create({
    amount: Math.round(subscription.price * 100),
    currency: "INR",
    receipt: `sub_${Date.now()}`,
  });

  res.json({ orderId: order.id, amount: order.amount, subscription });
});

// Confirm payment & assign subscription to user
const confirmSubscriptionPayment = asyncHandler(async (req, res) => {
  const {
    subscriptionId,
    razorpayPaymentId,
    razorpayOrderId,
    razorpaySignature,
  } = req.body;

  const body = razorpayOrderId + "|" + razorpayPaymentId;
  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(body.toString())
    .digest("hex");

  if (expectedSignature !== razorpaySignature) {
    res.status(400);
    throw new Error("Invalid payment signature");
  }

  const user = await User.findById(req.user._id);
  const subscription = await Subscription.findById(subscriptionId);

  // Use ADMIN subscription dates directly
  const startDate = subscription.startDate;
  const endDate = subscription.endDate;

  user.isSubscribed = true;
  user.subscription = {
    subscriptionId: subscription._id,
    title: subscription.title,
    description: subscription.description,
    offers: subscription.offers,
    price: subscription.price,
    discountPercent: subscription.discountPercent,
    isActive: true,
    startDate,
    endDate,
  };

  await user.save();
  res.json({ message: "Subscription activated successfully" });
});

export { createSubscriptionOrder, confirmSubscriptionPayment };
