import mongoose from "mongoose";

const categoryBannerSchema = mongoose.Schema(
  {
    category: {
      type: String,
      required: true,
      enum: ["T-Shirts", "Hoodies", "Polo", "Sweatshirt", "Oversized"],
      unique: true, // one banner per category — re-upload replaces it
    },
    image: { type: String, required: true },
  },
  { timestamps: true }
);

const CategoryBanner = mongoose.model("CategoryBanner", categoryBannerSchema);
export default CategoryBanner;