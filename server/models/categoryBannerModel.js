import mongoose from "mongoose";

const categoryBannerSchema = mongoose.Schema(
  {
    category: {
      type: String,
      required: true,
      trim: true,
      unique: true, // one banner per garmentStyle — re-upload replaces it
    },
    image: { type: String, required: true },
  },
  { timestamps: true },
);

const CategoryBanner = mongoose.model("CategoryBanner", categoryBannerSchema);
export default CategoryBanner;
