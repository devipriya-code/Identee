import mongoose from "mongoose";

const offerBannerSchema = mongoose.Schema(
  {
    type: {
      type: String,
      default: "offer",
    },
    offerText: {
      type: String,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);
const OfferBanner = mongoose.model("OfferBanner", offerBannerSchema);

export default OfferBanner;
