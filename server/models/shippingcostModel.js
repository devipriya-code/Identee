import mongoose from "mongoose";

const shippingRuleSchema = new mongoose.Schema({
  state: { type: String, required: true },
  cost: { type: Number, required: true },
});

const shippingCostSchema = new mongoose.Schema(
  {
    freeShippingAbove: { type: Number, default: 0 },
    shippingRules: [shippingRuleSchema],
  },
  { timestamps: true }
);

export default mongoose.model("ShippingCost", shippingCostSchema);
