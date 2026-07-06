// models/customizationModel.js
//
// One "elements" array = everything the user placed on the garment
// (uploaded design images and/or text), stored as percentage-based
// position/size so it renders correctly at any screen width on replay.
//
// UPDATED: each element now carries a `side` tag (front/back/right/left)
// so a logo placed on the front doesn't also show up on the back —
// they're independent designs per garment side, filtered client-side by
// the CustomizePage's active view.

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
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // optional — guest customizations allowed
    elements: {
      type: [elementSchema],
      validate: (v) => Array.isArray(v) && v.length > 0,
    },
  },
  { timestamps: true },
);

export default mongoose.model("Customization", customizationSchema);
