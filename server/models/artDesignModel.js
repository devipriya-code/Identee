import mongoose from "mongoose";

const artDesignSchema = new mongoose.Schema(
  {
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ArtCategory",
      required: true,
    },
    name: { type: String, required: true, trim: true }, // "Iron Man Mask"
    imageUrl: { type: String, required: true }, // uploaded PNG (transparent bg ideally)
    price: { type: Number, required: true, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

export default mongoose.model("ArtDesign", artDesignSchema);