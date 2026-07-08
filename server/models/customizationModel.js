// models/customizationModel.js


import mongoose from "mongoose";

const elementSchema = new mongoose.Schema(
  {
    type: { type: String, enum: ["image", "text"], required: true },
    side: {
      type: String,
      enum: ["front", "back", "right", "left"],
      default: "front",
    },

    // image elements
    src: { type: String }, // e.g. "uploads/designs/design-169...-123.png"

    // text elements
    text: { type: String },
    fontFamily: { type: String, default: "Arial" },
    fontSizePct: { type: Number, default: 6 }, // % of canvas height
    color: { type: String, default: "#000000" },
    bold: { type: Boolean, default: false },
    italic: { type: Boolean, default: false },
    underline: { type: Boolean, default: false },
    align: {
      type: String,
      enum: ["left", "center", "right", "justify"],
      default: "left",
    },
    textEffect: {
      type: String,
      enum: [
        "straight",
        "arc",
        "circle",
        "bulge",
        "smallToLarge",
        "largeToSmall",
      ],
      default: "straight",
    },

    // shared placement — all percentages relative to the garment canvas
    x: { type: Number, required: true }, // % from left
    y: { type: Number, required: true }, // % from top
    width: { type: Number, required: true }, // % of canvas width
    height: { type: Number }, // % of canvas height (mainly used by image elements)
    rotation: { type: Number, default: 0 }, // degrees
    zIndex: { type: Number, default: 0 },
  },
  { _id: false },
);

const customizationSchema = new mongoose.Schema(
  {
    garmentType: { type: String, required: true }, // e.g. "round-neck-tshirt"
    color: { type: String, required: true }, // e.g. "black" (slug)
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // optional — guest customizations allowed
    elements: {
      type: [elementSchema],
      validate: (v) => Array.isArray(v) && v.length > 0,
    },
  },
  { timestamps: true },
);

export default mongoose.model("Customization", customizationSchema);
