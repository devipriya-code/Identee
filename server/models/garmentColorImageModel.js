// models/garmentColorImageModel.js
//
// One document per (garmentType, colorSlug) — holds all 4 angle photos
// together, since admin always uploads/edits them as a set.

import mongoose from "mongoose";

const viewImageSchema = new mongoose.Schema(
  {
    imageUrl: { type: String, default: null }, // e.g. "uploads/garments/round-neck-black-front-169....png"
    printArea: {
      x: { type: Number, default: 22 }, // % from left
      y: { type: Number, default: 27 }, // % from top
      width: { type: Number, default: 56 }, // % of canvas width
      height: { type: Number, default: 58 }, // % of canvas height
    },
  },
  { _id: false },
);

const garmentColorImageSchema = new mongoose.Schema(
  {
    garmentType: { type: String, required: true }, // e.g. "round-neck-tshirt"
    colorSlug: { type: String, required: true }, // e.g. "black"
    colorName: { type: String, required: true },
    colorHex: { type: String, required: true },
    front: { type: viewImageSchema, default: () => ({}) },
    back: { type: viewImageSchema, default: () => ({}) },
    left: { type: viewImageSchema, default: () => ({}) },
    right: { type: viewImageSchema, default: () => ({}) },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

// one document per garment+color combo — prevents accidental duplicates
garmentColorImageSchema.index(
  { garmentType: 1, colorSlug: 1 },
  { unique: true },
);

export default mongoose.model("GarmentColorImage", garmentColorImageSchema);
