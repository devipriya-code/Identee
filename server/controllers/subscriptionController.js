import asyncHandler from "express-async-handler";
import Subscription from "../models/subscriptionModel.js";
import User from "../models/userModel.js";
// GET all subscriptions (Admin)
// const getSubscriptions = asyncHandler(async (req, res) => {
//   const subscriptions = await Subscription.find({}).sort({ createdAt: -1 });
//   res.json(subscriptions);
// });

const getSubscriptions = asyncHandler(async (req, res) => {
  const today = new Date();

  // Auto-expire subscriptions
  await Subscription.updateMany(
    {
      isActive: true,
      endDate: { $lt: today },
    },
    {
      $set: { isActive: false },
    },
  );

  const subscriptions = await Subscription.find({}).sort({ createdAt: -1 });
  res.json(subscriptions);
});

// CREATE subscription (Admin)
const createSubscription = asyncHandler(async (req, res) => {
  const {
    title,
    description,
    offers,
    price,
    discountPercent,
    startDate,
    durationInDays,
  } = req.body;

  if (
    !title ||
    !description ||
    !offers ||
    !price ||
    !startDate ||
    !durationInDays
  ) {
    res.status(400);
    throw new Error("All fields are required");
  }

  // 🚫 BLOCK if an active plan already exists
  const activePlan = await Subscription.findOne({ isActive: true });
  if (activePlan) {
    res.status(400);
    throw new Error(
      "An active subscription already exists. Deactivate it first.",
    );
  }

  const start = new Date(startDate);
  const endDate = new Date(
    start.getTime() + (durationInDays - 1) * 24 * 60 * 60 * 1000,
  );
  endDate.setHours(23, 59, 59, 999);

  const subscription = await Subscription.create({
    title,
    description,
    offers,
    price,
    discountPercent,
    startDate: start,
    endDate,
    durationInDays,
    isActive: true, // ✅ allowed now
  });

  res.status(201).json(subscription);
});

// UPDATE subscription (Admin)
const updateSubscription = asyncHandler(async (req, res) => {
  const subscription = await Subscription.findById(req.params.id);

  if (!subscription) {
    res.status(404);
    throw new Error("Subscription not found");
  }

  const { title, description, offers } = req.body;

  if (title) subscription.title = title;
  if (description) subscription.description = description;
  if (offers) subscription.offers = offers;

  const updated = await subscription.save();
  res.json(updated);
});

// TOGGLE subscription (Admin)
// const toggleSubscriptionStatus = asyncHandler(async (req, res) => {
//   const subscription = await Subscription.findById(req.params.id);

//   if (!subscription) {
//     res.status(404);
//     throw new Error("Subscription not found");
//   }

//   const today = new Date();

//   // 🚫 BLOCK if subscription period is over
//   if (
//     !subscription.isActive &&
//     subscription.endDate < today
//   ) {
//     res.status(400);
//     throw new Error(
//       "Subscription period is expired. Please create a new subscription."
//     );
//   }

//   // 🔴 If activating
//   if (!subscription.isActive) {
//     // Deactivate other active plans
//     await Subscription.updateMany(
//       { isActive: true },
//       { $set: { isActive: false } }
//     );

//     subscription.isActive = true;
//   } else {
//     subscription.isActive = false;
//   }

//   await subscription.save();

//   res.json({
//     message: `Subscription ${
//       subscription.isActive ? "activated" : "deactivated"
//     }`,
//     subscription,
//   });
// });

const toggleSubscriptionStatus = asyncHandler(async (req, res) => {
  const subscription = await Subscription.findById(req.params.id);

  if (!subscription) {
    res.status(404);
    throw new Error("Subscription not found");
  }

  const today = new Date();

  // 🔴 FORCE EXPIRE
  if (subscription.endDate < today) {
    subscription.isActive = false;
    await subscription.save();

    res.status(400);
    throw new Error(
      "Subscription period is expired. Please create a new subscription.",
    );
  }

  // 🟢 Activate
  if (!subscription.isActive) {
    await Subscription.updateMany(
      { isActive: true },
      { $set: { isActive: false } },
    );
    subscription.isActive = true;
  } else {
    subscription.isActive = false;
  }

  await subscription.save();

  res.json({
    message: `Subscription ${
      subscription.isActive ? "activated" : "deactivated"
    }`,
    subscription,
  });
});

// GET active subscription (Public)
const getActiveSubscription = asyncHandler(async (req, res) => {
  const today = new Date();

  const subscription = await Subscription.findOne({
    isActive: true,
    startDate: { $lte: today },
    endDate: { $gte: today },
  });

  if (!subscription) {
    res.status(404);
    throw new Error("No active subscription available");
  }

  res.json(subscription);
});

const deleteSubscription = asyncHandler(async (req, res) => {
  const subscription = await Subscription.findById(req.params.id);

  if (!subscription) {
    res.status(404);
    throw new Error("Subscription not found");
  }

  if (subscription.isActive) {
    res.status(400);
    throw new Error("Active subscription cannot be deleted");
  }

  await subscription.deleteOne();
  res.json({ message: "Subscription deleted successfully" });
});
// @desc    Get list of all subscribed users (Admin)
// @route   GET /api/subscriptions/subscribers
// @access  Private/Admin
const getSubscribers = asyncHandler(async (req, res) => {
  const users = await User.find({ isSubscribed: true }).select(
    "name email subscription createdAt",
  );

  const subscribers = users.map((u) => ({
    _id: u._id,
    name: u.name,
    email: u.email,
    planTitle: u.subscription?.title || "—",
    price: u.subscription?.price || 0,
    discountPercent: u.subscription?.discountPercent || 0,
    startDate: u.subscription?.startDate,
    endDate: u.subscription?.endDate,
    isActive: u.subscription?.isActive ?? false,
  }));

  res.json(subscribers);
});
export {
  getSubscriptions,
  createSubscription,
  updateSubscription,
  toggleSubscriptionStatus,
  getActiveSubscription,
  deleteSubscription,
  getSubscribers,
};
