import mongoose from "mongoose";

const designSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    imageUrl: { type: String, required: true }, // uploaded PNG path
    price: { type: Number, required: true, default: 0 },
    category: { type: String, default: "General" },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

export default mongoose.model("Design", designSchema);