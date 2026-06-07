// import cron from "node-cron";
// import User from "../models/userModel.js";
// import Subscription from "../models/subscriptionModel.js";

// cron.schedule("5 0 * * *", async () => {
//   try {
//     const now = new Date();
//     const yesterday = new Date();
//     yesterday.setDate(now.getDate() - 1);

//     // Delete subscriptions ended yesterday
//     const expiredSubscriptions = await Subscription.find({
//       endDate: { $lt: now, $gte: yesterday },
//     });

//     for (let sub of expiredSubscriptions) {
//       await Subscription.findByIdAndDelete(sub._id);
//       console.log(`Deleted expired subscription: ${sub.planName}`);
//     }

//     // Update users whose subscription ended yesterday
//     const expiredUsers = await User.find({
//       "subscription.endDate": { $lt: now, $gte: yesterday },
//       isSubscribed: true,
//     });

//     for (const user of expiredUsers) {
//       user.subscription = {};
//       user.isSubscribed = false;
//       await user.save();
//       console.log(`Cleared subscription for user: ${user._id}`);
//     }

//     console.log(`Processed ${expiredSubscriptions.length} subscriptions and ${expiredUsers.length} users.`);
//   } catch (err) {
//     console.error("Error in subscription cron job:", err.message);
//   }
// });

import cron from "node-cron";
import User from "../models/userModel.js";

/**
 * Runs every day at 12:05 AM
 * Purpose:
 * - Expire user subscriptions AFTER endDate
 * - Do NOT delete subscription plans
 */
cron.schedule("0 10 * * *", async () => {
  try {
    console.log("Running subscription expiry cron...");

    const now = new Date();

    // Find users whose subscription has ended 
    const expiredUsers = await User.find({
      "subscription.endDate": { $lt: now },
      isSubscribed: true,
    });

    for (const user of expiredUsers) {
      user.isSubscribed = false;

      // Keep history but mark inactive
      if (user.subscription) {
        user.subscription.isActive = false;
      }

      await user.save();
      console.log(`Subscription expired for user: ${user._id}`);
    }

    console.log(`Processed ${expiredUsers.length} expired users`);
  } catch (error) {
    console.error("Subscription cron error:", error.message);
  }
});
