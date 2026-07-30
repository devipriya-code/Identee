import mongoose from "mongoose";

const colorSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },   // "Acid Washed Black"
    slug: { type: String, required: true },   // "acid-washed-black"
    hex: { type: String, required: true },    // "#1B1B1B" — used only for
                                                // the tiny color-swatch dot,
                                                // not for tinting anymore
  },
  { _id: false },
);

const garmentTypeSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true, trim: true }, // "hoodie"
    label: { type: String, required: true, trim: true },             // "Hoodie"
    category: { type: String, required: true, trim: true },          // must match CategoryBanner.category exactly
    colors: { type: [colorSchema], default: [] },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

export default mongoose.model("GarmentType", garmentTypeSchema);