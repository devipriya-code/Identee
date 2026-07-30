import mongoose from "mongoose";

const artCategorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, unique: true }, // "Marvel"
    thumbnail: { type: String, required: true }, // category card image
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

export default mongoose.model("ArtCategory", artCategorySchema);