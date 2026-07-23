// seedShipping.js
// Run: node Seedshipping.js
// Creates ShippingCost doc if missing, OR adds any missing states to it
// if it already exists. Safe to run multiple times.

import mongoose from "mongoose";
import dotenv from "dotenv";
import ShippingCost from "./models/shippingcostModel.js"; // ← adjust path if needed

dotenv.config();

const run = async () => {
  await mongoose.connect(process.env.MONGO_URI); // ← adjust env var name if different

  const desiredRules = [
    { state: "Tamil Nadu", cost: 49 },
    { state: "Karnataka", cost: 59 },
    { state: "Kerala", cost: 59 },
    { state: "Andhra Pradesh", cost: 59 },
    { state: "Telangana", cost: 59 },
    { state: "Maharashtra", cost: 79 },
    { state: "Delhi", cost: 79 },
  ];

  let existing = await ShippingCost.findOne();

  if (!existing) {
    existing = await ShippingCost.create({
      shippingRules: desiredRules,
      freeShippingAbove: 999,
    });
    console.log("✅ ShippingCost created:", existing);
    process.exit(0);
  }

  let added = [];
  for (const rule of desiredRules) {
    const alreadyThere = existing.shippingRules.some(
      (r) => r.state.trim().toLowerCase() === rule.state.trim().toLowerCase(),
    );
    if (!alreadyThere) {
      existing.shippingRules.push(rule);
      added.push(rule.state);
    }
  }

  if (added.length === 0) {
    console.log(
      "✅ All desired states already present, nothing to add:",
      existing.shippingRules,
    );
    process.exit(0);
  }

  await existing.save();
  console.log("✅ Added missing states:", added);
  console.log("Current rules:", existing.shippingRules);
  process.exit(0);
};

run().catch((err) => {
  console.error("❌ Update failed:", err);
  process.exit(1);
});