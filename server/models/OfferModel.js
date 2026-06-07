import mongoose from "mongoose";

const offerModel = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      uppercase: true,
      unique: true, // coupon code must be unique
      trim: true,
    },

    offerPercentage: {
      type: Number,
      required: true,
      min: 1,
      max: 100,
    },

    startDate: {
      type: Date,
      required: true,
    },

    expiryDate: {
      type: Date,
      required: true,
    },

    // 🔹 TOTAL usage limit (0 = unlimited)
    maxUsage: {
      type: Number,
      default: 0,
      min: 0,
    },

    // 🔹 How many times coupon is already used
    usedCount: {
      type: Number,
      default: 0,
      min: 0,
    },

    // 🔹 Track users who used this coupon (prevents reuse)
    usedBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  {
    timestamps: true,
  }
);

const Offer = mongoose.model("Offer", offerModel);

export default Offer;
