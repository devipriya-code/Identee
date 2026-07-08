// controllers/customizationController.js

import Customization from "../models/customizationModel.js";

// POST /api/customizations/upload-design  (multipart, field name "design")
export const uploadDesignImage = (req, res) => {
  if (!req.file) return res.status(400).json({ message: "No file uploaded" });

  // req.file.path is already the correct relative path
  // (e.g. "uploads/designs/design-169...-123.png"), set by the
  // rewritePaths middleware in uploadMiddleware.js.
  res.status(201).json({ path: req.file.path });
};

// POST /api/customizations
// CHANGED: stores { garmentType, color } instead of a Product _id — the
// customizer now opens from a catalog pattern + color pair, not a
// specific database product. If your checkout flow needs to resolve
// (garmentType, color) to a real sellable Product/variant document,
// that lookup should happen here (or downstream at order time) — that
// part depends on your Product schema, which I don't have visibility
// into, so it isn't wired up yet.
export const createCustomization = async (req, res) => {
  try {
    const { garmentType, color, elements } = req.body;

    if (!garmentType || !color) {
      return res
        .status(400)
        .json({ message: "garmentType and color are required" });
    }
    if (!Array.isArray(elements) || elements.length === 0) {
      return res
        .status(400)
        .json({ message: "Add at least one design element before saving" });
    }

    const customization = await Customization.create({
      garmentType,
      color,
      user: req.user?._id, // only present if auth middleware runs before this route
      elements,
    });

    res.status(201).json(customization);
  } catch (err) {
    res
      .status(500)
      .json({ message: err.message || "Could not save customization" });
  }
};

// GET /api/customizations/:id
export const getCustomizationById = async (req, res) => {
  try {
    const customization = await Customization.findById(req.params.id);
    if (!customization) {
      return res.status(404).json({ message: "Customization not found" });
    }
    res.json(customization);
  } catch (err) {
    res
      .status(500)
      .json({ message: err.message || "Could not fetch customization" });
  }
};
