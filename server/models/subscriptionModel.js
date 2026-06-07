import mongoose from "mongoose";

const subscriptionSchema = mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },

    description: {
      type: String,
      required: true,
    },

    offers: [
      {
        type: String,
        required: true,
      },
    ],
    price: { type: Number, required: true },
    discountPercent: { type: Number, required: true, min: 0, max: 50 },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    durationInDays: { type: Number },
    isActive: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model("Subscription", subscriptionSchema);
